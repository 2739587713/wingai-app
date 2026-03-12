import { randomUUID } from 'crypto'
import { WebSocket } from 'ws'

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

// Method 1: Try different WebSocket endpoints and tokens
const endpoints = [
  { url: 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4', origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold' },
  { url: 'wss://eastus.api.speech.microsoft.com/cognitiveservices/websocket/v1', origin: undefined },
  { url: 'wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4', origin: 'https://www.bing.com' },
]

const text = "你好，今天我们来聊一个话题。"
const voice = "zh-CN-XiaoxiaoNeural"

for (const ep of endpoints) {
  console.log(`\nTrying: ${ep.url.slice(0, 60)}... origin=${ep.origin || 'none'}`)
  try {
    await new Promise((resolve, reject) => {
      const connId = randomUUID().replace(/-/g, '')
      const fullUrl = ep.url + (ep.url.includes('?') ? '&' : '?') + `ConnectionId=${connId}`
      const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0' }
      if (ep.origin) headers.Origin = ep.origin
      const ws = new WebSocket(fullUrl, { headers })
      const timer = setTimeout(() => { ws.close(); reject(new Error('timeout')) }, 10000)
      ws.on('open', () => { console.log('  Connected!'); clearTimeout(timer); ws.close(); resolve() })
      ws.on('error', (e) => { clearTimeout(timer); reject(e) })
    })
  } catch (e) { console.log(`  Error: ${e.message}`) }
}

// Method 2: REST API approach - Azure free tier
console.log("\n\n=== Method 2: Azure REST TTS (free demo endpoint) ===")
// Get token from Bing
try {
  const tokenR = await fetch('https://edge.microsoft.com/translate/auth', {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
  })
  if (tokenR.ok) {
    const token = await tokenR.text()
    console.log("Got token:", token.slice(0, 50) + "...")

    // Use token with speech synthesis REST API
    const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'><voice name='${voice}'>${escXml(text)}</voice></speak>`
    const r = await fetch('https://eastus.tts.speech.microsoft.com/cognitiveservices/v1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/ssml+xml',
        'X-Microsoft-OutputFormat': 'audio-24khz-96kbitrate-mono-mp3',
        'User-Agent': 'Mozilla/5.0',
      },
      body: ssml,
      signal: AbortSignal.timeout(30000),
    })
    console.log("Status:", r.status)
    if (r.ok) {
      const buf = await r.arrayBuffer()
      console.log("Audio:", buf.byteLength, "bytes")
    } else {
      console.log("Error:", (await r.text()).slice(0, 300))
    }
  } else {
    console.log("Token failed:", tokenR.status)
  }
} catch (e) { console.log("Error:", e.message) }

// Method 3: edge-tts Python bridge
console.log("\n\n=== Method 3: Check if Python edge-tts is available ===")
import { execSync } from 'child_process'
try {
  const result = execSync('python -m edge_tts --version 2>&1 || pip install edge-tts 2>&1 | tail -3', { encoding: 'utf8', timeout: 30000 })
  console.log(result)
} catch (e) { console.log("Python:", e.message?.slice(0, 200)) }
