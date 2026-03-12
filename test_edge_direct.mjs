import { randomUUID } from 'crypto'
import { WebSocket } from 'ws'

function escXml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function edgeTTSSynth(text, voice, rate = '+0%', pitch = '+0Hz') {
  return new Promise((resolve, reject) => {
    const reqId = randomUUID().replace(/-/g, '')
    const connId = randomUUID().replace(/-/g, '')
    const ts = new Date().toISOString()
    const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=6A5AA1D4EAFF4E9FB37E23D68491D6F4&ConnectionId=${connId}`

    const ws = new WebSocket(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36 Edg/130.0.0.0',
        'Origin': 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
      }
    })

    const chunks = []
    let timer = setTimeout(() => { ws.close(); reject(new Error('timeout')) }, 60000)

    ws.on('open', () => {
      ws.send(`X-Timestamp:${ts}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-96kbitrate-mono-mp3"}}}}`)
      const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='zh-CN'><voice name='${voice}'><prosody rate='${rate}' pitch='${pitch}'>${escXml(text)}</prosody></voice></speak>`
      ws.send(`X-RequestId:${reqId}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${ts}\r\nPath:ssml\r\n\r\n${ssml}`)
    })

    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        const headerLen = data.readUInt16BE(0)
        chunks.push(data.slice(2 + headerLen))
      } else {
        const msg = data.toString()
        if (msg.includes('Path:turn.end')) {
          clearTimeout(timer)
          ws.close()
          resolve(Buffer.concat(chunks))
        }
      }
    })
    ws.on('error', (e) => { clearTimeout(timer); reject(e) })
    ws.on('close', (code) => { clearTimeout(timer); if (chunks.length) resolve(Buffer.concat(chunks)); else reject(new Error(`closed: ${code}`)) })
  })
}

const text = "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。你有没有想过，为什么有些人做短视频就是能火？其实啊，这里面是有套路的。"

const voices = [
  "zh-CN-XiaoxiaoNeural",
  "zh-CN-XiaoyiNeural",
  "zh-CN-YunjianNeural",
  "zh-CN-YunxiNeural",
]

for (const v of voices) {
  try {
    console.log(`Testing ${v}...`)
    const buf = await edgeTTSSynth(text, v)
    console.log(`  OK! ${buf.byteLength} bytes`)
    if (v === voices[0]) {
      const fs = await import('fs')
      fs.writeFileSync('test_edge_output.mp3', buf)
      console.log('  Saved test_edge_output.mp3')
    }
  } catch (e) { console.log(`  Error: ${e.message}`) }
}
