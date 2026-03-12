import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { spawn } from 'child_process'
import { readFile, writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

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

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), urlExpandPlugin(), edgeTTSPlugin()],
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
      }
    }
  }
})
