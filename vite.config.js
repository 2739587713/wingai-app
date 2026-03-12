import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { execFile } from 'child_process'
import { readFile, unlink } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

/* ═══ Edge TTS plugin (Python edge-tts via child process) ═══ */
function edgeTTSPlugin() {
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
          const tmpFile = join(process.cwd(), `.tts_${randomUUID().slice(0, 8)}.mp3`)
          console.log(`[edge-tts] generating: voice=${voice} text=${text.slice(0, 30)}...`)
          await new Promise((resolve, reject) => {
            const args = ['-m', 'edge_tts', '--text', text, '--voice', voice, '--rate', rate, '--pitch', pitch, '--write-media', tmpFile]
            execFile('python', args, { timeout: 60000 }, (err, stdout, stderr) => {
              if (err) { console.error('[edge-tts] exec error:', err.message, stderr); reject(err) }
              else resolve()
            })
          })
          const audio = await readFile(tmpFile)
          await unlink(tmpFile).catch(() => {})
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
