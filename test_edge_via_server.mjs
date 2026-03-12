// Test the /edge-tts endpoint via Vite dev server
// First start vite dev, then run this

const text = "大家好，今天跟大家聊一个特别有意思的话题。你有没有想过，为什么有些人做短视频就是能火？其实啊，这里面是有套路的。只要掌握这几个技巧，你也可以做到。";

console.log(`Text: ${text}`);
console.log(`Length: ${text.length} chars, CJK: ${text.replace(/[^\u4e00-\u9fff]/g, '').length} chars\n`);

const voices = [
  "zh-CN-XiaoxiaoNeural",
  "zh-CN-YunjianNeural",
];

for (const voice of voices) {
  console.log(`--- ${voice} ---`);
  try {
    const r = await fetch("http://localhost:5173/edge-tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, voice }),
      signal: AbortSignal.timeout(30000),
    });
    if (r.ok) {
      const buf = await r.arrayBuffer();
      console.log(`OK! ${buf.byteLength} bytes`);
    } else {
      console.log(`Error: ${r.status} ${await r.text()}`);
    }
  } catch (e) { console.log(`Error: ${e.message}`); }
}
