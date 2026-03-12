import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

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
  plugins: [react(), urlExpandPlugin()],
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
      }
    }
  }
})
