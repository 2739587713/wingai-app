import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import https from 'https'
import http from 'http'

function urlExpandPlugin() {
  return {
    name: 'url-expander',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url.startsWith('/expand-url')) return next()
        const u = new URL(req.url, 'http://localhost')
        const target = u.searchParams.get('url')
        console.log('[expand-url] target:', target)
        if (!target) { res.writeHead(400, {'Content-Type':'text/plain'}); res.end('missing url param'); return }

        let done = false
        const finish = (data) => { if (done) return; done = true; res.writeHead(200, {'Content-Type':'application/json'}); res.end(JSON.stringify(data)) }
        const timer = setTimeout(() => { console.log('[expand-url] timeout'); finish({url: target, error: 'timeout'}) }, 15000)

        const doFollow = (url, hops) => {
          if (hops > 8) { clearTimeout(timer); finish({url}); return }
          console.log('[expand-url] hop', hops, url.slice(0, 100))
          const mod = url.startsWith('https') ? https : http
          const r = mod.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
              'Accept-Language': 'zh-CN,zh;q=0.9'
            },
            timeout: 10000
          }, (resp) => {
            console.log('[expand-url] status:', resp.statusCode, 'location:', resp.headers.location || 'none')
            if ([301,302,303,307,308].includes(resp.statusCode) && resp.headers.location) {
              let next = resp.headers.location
              if (next.startsWith('/')) { const p = new URL(url); next = p.protocol + '//' + p.host + next }
              resp.resume()
              doFollow(next, hops + 1)
            } else {
              let body = ''
              resp.setEncoding('utf8')
              resp.on('data', c => { body += c; if (body.length > 50000) resp.destroy() })
              resp.on('end', () => { clearTimeout(timer); finish({url, body: body.slice(0, 50000)}) })
              resp.on('error', () => { clearTimeout(timer); finish({url, error: 'read error'}) })
            }
          })
          r.on('error', (e) => { console.log('[expand-url] request error:', e.message); clearTimeout(timer); finish({url, error: e.message}) })
          r.on('timeout', () => { console.log('[expand-url] request timeout'); r.destroy(); clearTimeout(timer); finish({url, error: 'request timeout'}) })
        }
        doFollow(target, 0)
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
