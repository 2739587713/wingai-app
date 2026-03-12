const SC_KEY = "Q0X6CV17w4th5qwBxxaKAcjatj";

// Test 速创 TTS
console.log("=== 速创 TTS ===");
const r = await fetch("https://api.wuyinkeji.com/api/async/audio_tts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: SC_KEY,
    text: "大家好，欢迎来到我的频道，今天我们来聊一个非常有趣的话题。",
    voice_id: "female-shaonv",
    speed: "1",
  }),
  signal: AbortSignal.timeout(30000),
});
const j = await r.json();
console.log("Response:", JSON.stringify(j));

if (j.data?.id) {
  console.log("Polling...");
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 3000));
    const pr = await fetch(`https://api.wuyinkeji.com/api/async/detail?key=${SC_KEY}&id=${j.data.id}`);
    const pj = await pr.json();
    console.log(`Poll ${i+1}: status=${pj.data?.status}`);
    if (pj.data?.status === 2) {
      console.log("SUCCESS:", JSON.stringify(pj.data).slice(0, 1500));
      break;
    }
    if (pj.data?.status === 3) { console.log("FAILED:", pj.data?.message); break; }
  }
}
