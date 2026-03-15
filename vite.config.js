import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import { readFile, writeFile, unlink, mkdir, readdir, rm } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'

/* ═══ Edge TTS plugin (Python edge-tts via child process) ═══ */
function edgeTTSPlugin() {
  let counter = 0
  return {
    name: 'edge-tts',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/edge-tts') return next()
        console.log('[edge-tts] request received')
        let body = ''
        for await (const chunk of req) body += chunk
        try {
          const { text, voice = 'zh-CN-XiaoxiaoNeural', rate = '+0%', pitch = '+0Hz' } = JSON.parse(body)
          if (!text) { res.writeHead(400); res.end('missing text'); return }
          const id = Date.now() + '_' + (++counter)
          const txtFile = join(tmpdir(), `edge_tts_${id}.txt`)
          const mp3File = join(tmpdir(), `edge_tts_${id}.mp3`)
          // Write a tiny Python script to avoid CLI arg encoding issues on Windows
          const pyScript = `
import asyncio, edge_tts
async def main():
    with open(r"${txtFile}", encoding="utf-8") as f:
        text = f.read()
    c = edge_tts.Communicate(text, "${voice}", rate="${rate}", pitch="${pitch}")
    await c.save(r"${mp3File}")
asyncio.run(main())
`
          const pyFile = txtFile.replace('.txt', '.py')
          await writeFile(txtFile, text, 'utf-8')
          await writeFile(pyFile, pyScript, 'utf-8')
          console.log(`[edge-tts] voice=${voice} len=${text.length}`)
          await new Promise((resolve, reject) => {
            const p = spawn('python', [pyFile], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
            let stderr = ''
            p.stderr.on('data', d => stderr += d)
            p.on('close', code => {
              if (code === 0) resolve()
              else reject(new Error(`edge-tts exit ${code}: ${stderr.slice(0, 300)}`))
            })
            p.on('error', reject)
            setTimeout(() => { p.kill(); reject(new Error('edge-tts timeout')) }, 60000)
          })
          await unlink(txtFile).catch(() => {})
          await unlink(pyFile).catch(() => {})
          const audio = await readFile(mp3File)
          await unlink(mp3File).catch(() => {})
          console.log(`[edge-tts] ${voice}: ${audio.length} bytes`)
          res.writeHead(200, { 'Content-Type': 'audio/mpeg', 'Content-Length': audio.length })
          res.end(audio)
        } catch (e) {
          console.error('[edge-tts] error:', e.message)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    }
  }
}

function urlExpandPlugin() {
  return {
    name: 'url-expander',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url.startsWith('/expand-url')) return next()
        const u = new URL(req.url, 'http://localhost')
        const target = u.searchParams.get('url')
        console.log('[expand-url] target:', target)
        if (!target) { res.writeHead(400); res.end('missing url'); return }

        try {
          // Use Node.js native fetch (v18+) - handles redirects like Python requests
          const resp = await fetch(target, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
              'Accept-Language': 'zh-CN,zh;q=0.9',
            },
            redirect: 'follow',
            signal: AbortSignal.timeout(15000),
          })
          const finalUrl = resp.url
          const body = await resp.text()
          console.log('[expand-url] final:', finalUrl.slice(0, 120))
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ url: finalUrl, body: body.slice(0, 50000) }))
        } catch (e) {
          console.log('[expand-url] error:', e.message)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ url: target, error: e.message }))
        }
      })
    }
  }
}

/* ═══ Video Compose plugin (FFmpeg with browser-side fallback) ═══ */
function videoComposePlugin() {
  let counter = 0

  // Check if FFmpeg is available on this system
  function checkFFmpeg() {
    return new Promise((resolve) => {
      const p = spawn(FFMPEG_BIN, ['-version'], { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
      p.on('close', code => { console.log(`[compose-video] ffmpeg check: ${FFMPEG_BIN}, code=${code}`); resolve(code === 0) })
      p.on('error', () => { console.log(`[compose-video] ffmpeg not found at: ${FFMPEG_BIN}`); resolve(false) })
    })
  }

  // Download a URL to a local file, return the local path
  async function downloadFile(url, destPath) {
    const resp = await fetch(url, {
      signal: AbortSignal.timeout(120000),
      headers: { 'User-Agent': 'Mozilla/5.0' },
    })
    if (!resp.ok) throw new Error(`Download failed ${resp.status}: ${url.slice(0, 100)}`)
    const ws = createWriteStream(destPath)
    await pipeline(resp.body, ws)
    return destPath
  }

  // Zoompan camera presets (from reference cinematic composer)
  const CAMERA_PRESETS = {
    zoom_in: "zoompan=z='min(zoom+0.002,1.3)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30",
    zoom_out: "zoompan=z='if(eq(on,0),1.3,max(zoom-0.002,1.0))':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30",
    pan_left: "zoompan=z='1.2':x='if(eq(on,0),iw*0.2,max(x-iw*0.0015,0))':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30",
    pan_right: "zoompan=z='1.2':x='if(eq(on,0),0,min(x+iw*0.0015,iw*0.2))':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30",
    breathe: "zoompan=z='1.08+0.04*sin(on*0.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30",
    static: "zoompan=z='1.08':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d={frames}:s=1080x1920:fps=30",
  }
  const TRANSITIONS = ['fade', 'wipeleft', 'slideright', 'dissolve', 'slideleft']

  // Compose video clips using FFmpeg with cinematic features
  async function composeWithFFmpeg(clips, workDir) {
    const hasVideo = clips.some(c => c.videoUrl)
    const inputFiles = []  // {path, type:'video'|'image'}
    const audioFiles = []

    // Download all media files
    for (let i = 0; i < clips.length; i++) {
      const clip = clips[i]
      if (hasVideo && clip.videoUrl) {
        const vPath = join(workDir, `clip_${i}.mp4`)
        await downloadFile(clip.videoUrl, vPath)
        inputFiles.push({ path: vPath, type: 'video', duration: clip.duration || 5 })
      } else if (clip.imageUrl) {
        const iPath = join(workDir, `img_${i}.png`)
        await downloadFile(clip.imageUrl, iPath)
        inputFiles.push({ path: iPath, type: 'image', duration: clip.duration || 5, camera: clip.camera || 'static' })
      }
      if (clip.audioUrl) {
        const aPath = join(workDir, `audio_${i}.mp3`)
        await downloadFile(clip.audioUrl, aPath)
        audioFiles.push(aPath)
      }
    }

    const outputFile = join(workDir, 'output.mp4')

    // Step 1: Prepare each scene clip (normalize video or zoompan image)
    const sceneClips = []
    for (let i = 0; i < inputFiles.length; i++) {
      const f = inputFiles[i]
      const scenePath = join(workDir, `scene_${i}.mp4`)
      if (f.type === 'video') {
        // Normalize video to 1080x1920 (portrait), 30fps
        await runFFmpeg(['-y', '-i', f.path,
          '-vf', 'scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:black,setsar=1,fps=30',
          '-t', String(f.duration), '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
          '-an', '-pix_fmt', 'yuv420p', '-r', '30', scenePath])
      } else {
        // Image → zoompan with camera motion
        const frames = f.duration * 30
        const preset = CAMERA_PRESETS[f.camera] || CAMERA_PRESETS.static
        const filter = preset.replace(/{frames}/g, frames)
        await runFFmpeg(['-y', '-loop', '1', '-i', f.path,
          '-vf', `${filter},format=yuv420p`,
          '-t', String(f.duration), '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
          '-pix_fmt', 'yuv420p', '-r', '30', scenePath])
      }
      sceneClips.push(scenePath)
      console.log(`[compose-video] scene ${i+1}/${inputFiles.length} ready (${f.type})`)
    }

    // Step 2: Merge scenes with xfade transitions
    let mergedVideo = sceneClips[0]
    if (sceneClips.length > 1) {
      mergedVideo = join(workDir, 'merged.mp4')
      const td = 0.5  // transition duration
      const ffArgs = ['-y']
      for (const sc of sceneClips) ffArgs.push('-i', sc)

      const filterParts = []
      let offset = 0
      for (let i = 0; i < sceneClips.length - 1; i++) {
        const transition = TRANSITIONS[i % TRANSITIONS.length]
        const dur_i = inputFiles[i].duration
        const src1 = i === 0 ? '[0]' : `[v${String(i-1).padStart(2,'0')}]`
        const src2 = `[${i+1}]`
        offset = i === 0 ? dur_i - td : offset + dur_i - td
        const outLabel = i === sceneClips.length - 2 ? '[vout]' : `[v${String(i).padStart(2,'0')}]`
        filterParts.push(`${src1}${src2}xfade=transition=${transition}:duration=${td}:offset=${offset.toFixed(2)}${outLabel}`)
      }

      ffArgs.push('-filter_complex', filterParts.join(';'),
        '-map', '[vout]', '-c:v', 'libx264', '-preset', 'fast', '-crf', '20',
        '-pix_fmt', 'yuv420p', '-r', '30', mergedVideo)
      await runFFmpeg(ffArgs)
      console.log('[compose-video] transitions merged')
    }

    // Step 3: Generate ASS subtitles from clip narration
    let subtitlePath = null
    const narrations = clips.map(c => c.narration || '').filter(Boolean)
    if (narrations.length > 0) {
      subtitlePath = join(workDir, 'subtitles.ass')
      const td = 0.5
      let assContent = `[Script Info]\nTitle: Video Subtitles\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nWrapStyle: 0\n\n[V4+ Styles]\nStyle: Default,Microsoft YaHei,42,&H00FFFFFF,&H000000FF,&H00000000,&HA0000000,0,0,0,0,100,100,0,0,1,3,1.5,2,20,20,40,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n`
      let t = 0
      for (let i = 0; i < clips.length; i++) {
        const dur = clips[i].duration || 5
        const narr = clips[i].narration || ''
        if (narr) {
          const s = t + 0.3, e = t + dur - 0.5
          const fmt = (sec) => { const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),ss=Math.floor(sec%60),cs=Math.floor((sec%1)*100); return `${h}:${String(m).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${String(cs).padStart(2,'0')}` }
          assContent += `Dialogue: 0,${fmt(s)},${fmt(e)},Default,,0,0,0,,{\\fad(400,300)}${narr.replace(/\n/g,'\\N')}\n`
        }
        t += dur - (i < clips.length - 1 ? td : 0)
      }
      await writeFile(subtitlePath, assContent, 'utf-8')
    }

    // Step 4: Final mix — video + subtitles + audio + color grading
    const finalArgs = ['-y', '-i', mergedVideo]
    const filterChain = []
    const audioStreams = []
    let aidx = 1

    // Concat all audio
    if (audioFiles.length > 0) {
      const aConcatList = join(workDir, 'audio_concat.txt')
      const aLines = audioFiles.map(f => `file '${f.replace(/\\/g, '/')}'`).join('\n')
      await writeFile(aConcatList, aLines, 'utf-8')
      const audioAll = join(workDir, 'audio_all.mp3')
      await runFFmpeg(['-y', '-f', 'concat', '-safe', '0', '-i', aConcatList, '-c', 'copy', audioAll])
      finalArgs.push('-i', audioAll)
      audioStreams.push(`[${aidx}:a]aresample=44100[narr]`)
      aidx++
    }

    // Video filter: subtitles + color grading
    let vf = '[0:v]'
    if (subtitlePath) {
      const subEscaped = subtitlePath.replace(/\\/g, '/').replace(/:/g, '\\:')
      vf += `ass='${subEscaped}',`
    }
    vf += 'eq=brightness=0.02:contrast=1.1:saturation=1.15[vfinal]'
    filterChain.push(vf)

    if (audioStreams.length > 0) {
      filterChain.push(...audioStreams)
      finalArgs.push('-filter_complex', filterChain.join(';'),
        '-map', '[vfinal]', '-map', '[narr]')
    } else {
      finalArgs.push('-filter_complex', filterChain.join(';'),
        '-map', '[vfinal]')
    }

    finalArgs.push('-c:v', 'libx264', '-preset', 'fast', '-crf', '18',
      '-c:a', 'aac', '-b:a', '192k',
      '-shortest', '-movflags', '+faststart', outputFile)
    await runFFmpeg(finalArgs)

    return outputFile
  }

  // Resolve ffmpeg binary path
  const FFMPEG_PATHS = [
    'ffmpeg',
    (process.env.LOCALAPPDATA || '').replace(/\\/g, '/') + '/Microsoft/WinGet/Links/ffmpeg.exe',
    (process.env.LOCALAPPDATA || '').replace(/\\/g, '/') + '/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe',
    'C:/Users/Lenovo/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.0.1-full_build/bin/ffmpeg.exe',
  ]
  function getFFmpegBin() {
    for (const p of FFMPEG_PATHS) { try { require('child_process').execSync(p + ' -version', { stdio: 'ignore' }); console.log('[compose-video] Found ffmpeg at:', p); return p } catch {} }
    console.log('[compose-video] WARNING: ffmpeg not found in any path!')
    return 'ffmpeg'
  }
  const FFMPEG_BIN = getFFmpegBin()

  // Run ffmpeg with args, return promise
  function runFFmpeg(args) {
    return new Promise((resolve, reject) => {
      console.log(`[compose-video] ffmpeg ${args.slice(0, 6).join(' ')}...`)
      const p = spawn(FFMPEG_BIN, args, { stdio: ['ignore', 'pipe', 'pipe'], windowsHide: true })
      let stderr = ''
      p.stderr.on('data', d => stderr += d)
      p.on('close', code => {
        if (code === 0) resolve()
        else reject(new Error(`ffmpeg exit ${code}: ${stderr.slice(-500)}`))
      })
      p.on('error', reject)
      setTimeout(() => { p.kill(); reject(new Error('ffmpeg timeout (5 min)')) }, 300000)
    })
  }

  return {
    name: 'video-compose',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.method !== 'POST' || req.url !== '/compose-video') return next()
        console.log('[compose-video] request received')

        let body = ''
        for await (const chunk of req) body += chunk

        try {
          const { clips } = JSON.parse(body)
          if (!clips || !Array.isArray(clips) || clips.length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ error: 'missing or empty clips array' }))
            return
          }

          console.log(`[compose-video] ${clips.length} clips, checking ffmpeg...`)
          const hasFFmpeg = await checkFFmpeg()

          if (!hasFFmpeg) {
            // Fallback: return clip metadata for browser-side composition
            console.log('[compose-video] ffmpeg not found, returning fallback')
            res.writeHead(200, { 'Content-Type': 'application/json' })
            res.end(JSON.stringify({ fallback: true, clips }))
            return
          }

          // FFmpeg is available — compose server-side
          const id = Date.now() + '_' + (++counter)
          const workDir = join(tmpdir(), `compose_${id}`)
          await mkdir(workDir, { recursive: true })
          console.log(`[compose-video] workDir=${workDir}`)

          try {
            const outputFile = await composeWithFFmpeg(clips, workDir)
            const videoData = await readFile(outputFile)
            console.log(`[compose-video] done, ${videoData.length} bytes`)

            res.writeHead(200, {
              'Content-Type': 'video/mp4',
              'Content-Length': videoData.length,
              'Content-Disposition': `attachment; filename="composed_${id}.mp4"`,
            })
            res.end(videoData)
          } finally {
            // Clean up temp directory
            await rm(workDir, { recursive: true, force: true }).catch(() => {})
          }
        } catch (e) {
          console.error('[compose-video] error:', e.message)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: e.message }))
        }
      })
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), urlExpandPlugin(), edgeTTSPlugin(), videoComposePlugin()],
  server: {
    proxy: {
      '/api-proxy': {
        target: 'https://api.apiyi.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-proxy/, '')
      },
      '/tikhub-proxy': {
        target: 'https://api.tikhub.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tikhub-proxy/, '')
      },
      '/tmpfiles-proxy': {
        target: 'https://tmpfiles.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tmpfiles-proxy/, '')
      },
      '/blt-proxy': {
        target: 'https://api.bltcy.ai',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/blt-proxy/, '')
      },
      '/schedule-api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/schedule-api/, '')
      },
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/videos': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/comic-drama': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/suchuang-proxy': {
        target: 'https://api.wuyinkeji.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/suchuang-proxy/, '')
      }
    }
  }
})
