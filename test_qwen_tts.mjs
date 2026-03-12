const QWEN_KEY = "sk-bf8c49192e5a461a86aca4b121c3ac03";
const QWEN_BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${QWEN_KEY}` };

const text = "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。你有没有想过，为什么有些人做短视频就是能火？";

// Test 1: List models to find TTS-related ones
console.log("=== Listing TTS models ===");
try {
  const r = await fetch(`${QWEN_BASE}/models`, { headers: { Authorization: `Bearer ${QWEN_KEY}` } });
  if (r.ok) {
    const d = await r.json();
    const tts = (d.data || []).filter(m => /tts|speech|voice|cosy|sambert|audio/i.test(m.id));
    console.log("TTS models:", tts.map(m => m.id).join(", ") || "(none found in list)");
  } else {
    console.log("Models list:", r.status, (await r.text()).slice(0, 200));
  }
} catch (e) { console.log("Error:", e.message); }

// Test 2: Try OpenAI-compatible /audio/speech with various models
const models = [
  "cosyvoice-v1",
  "cosyvoice-v2",
  "CosyVoice-300M",
  "sambert-zhichu-v1",
  "qwen-tts",
  "tts-1",
  "tts-1-hd",
];
const voices = ["alloy", "coral", "longxiaochun", "zhixiaobai", "zhiyan"];

for (const model of models) {
  for (const voice of voices.slice(0, 2)) {
    console.log(`\n--- ${model} / ${voice} ---`);
    try {
      const r = await fetch(`${QWEN_BASE}/audio/speech`, {
        method: "POST", headers: hdrs,
        body: JSON.stringify({ model, input: text, voice, response_format: "mp3" }),
        signal: AbortSignal.timeout(30000),
      });
      if (r.ok) {
        const buf = await r.arrayBuffer();
        console.log(`OK! ${buf.byteLength} bytes`);
        break; // Found working combo, stop trying voices
      } else {
        const t = await r.text();
        console.log(`${r.status}: ${t.slice(0, 200)}`);
        if (r.status !== 404) break; // Don't try other voices if model exists but voice is wrong
      }
    } catch (e) { console.log(`Error: ${e.message}`); break; }
  }
}

// Test 3: Try DashScope native TTS API (non-OpenAI-compatible)
console.log("\n\n=== DashScope native TTS ===");
try {
  const r = await fetch("https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/generation", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${QWEN_KEY}` },
    body: JSON.stringify({
      model: "cosyvoice-v1",
      input: { text },
      parameters: { voice: "longxiaochun" },
    }),
    signal: AbortSignal.timeout(30000),
  });
  console.log("Status:", r.status);
  const ct = r.headers.get("content-type");
  console.log("Content-Type:", ct);
  if (ct?.includes("audio")) {
    const buf = await r.arrayBuffer();
    console.log("Audio size:", buf.byteLength, "bytes");
  } else {
    console.log("Response:", (await r.text()).slice(0, 500));
  }
} catch (e) { console.log("Error:", e.message); }
