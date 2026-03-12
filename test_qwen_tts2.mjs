const QWEN_KEY = "sk-bf8c49192e5a461a86aca4b121c3ac03";
const BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${QWEN_KEY}` };

const text = "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。";

// Try qwen3-tts models via chat completions (they use chat API with audio modality)
const models = ["qwen3-tts-flash", "qwen-tts-2025-05-22", "qwen3-tts-instruct-flash"];

for (const model of models) {
  console.log(`\n=== ${model} via /chat/completions ===`);
  try {
    const r = await fetch(`${BASE}/chat/completions`, {
      method: "POST", headers: hdrs,
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: text }],
        modalities: ["audio"],
        audio: { voice: "Cherry", format: "mp3" },
      }),
      signal: AbortSignal.timeout(60000),
    });
    console.log("Status:", r.status);
    const t = await r.text();
    if (r.ok) {
      const j = JSON.parse(t);
      const msg = j.choices?.[0]?.message;
      if (msg?.audio?.data) {
        const audioB64 = msg.audio.data;
        console.log(`Audio base64 length: ${audioB64.length} chars (~${Math.round(audioB64.length * 0.75)} bytes)`);
        // Decode and check size
        const buf = Buffer.from(audioB64, "base64");
        console.log(`Decoded audio: ${buf.byteLength} bytes`);
        // Save to verify
        const fs = await import("fs");
        fs.writeFileSync(`test_audio_${model.replace(/[^a-z0-9]/g, "_")}.mp3`, buf);
        console.log("Saved audio file");
      } else {
        console.log("Response:", t.slice(0, 500));
      }
    } else {
      console.log("Error:", t.slice(0, 500));
    }
  } catch (e) { console.log("Error:", e.message); }
}

// Also try /audio/speech with qwen3-tts models
console.log("\n\n=== /audio/speech endpoint ===");
for (const model of models) {
  console.log(`\n--- ${model} ---`);
  try {
    const r = await fetch(`${BASE}/audio/speech`, {
      method: "POST", headers: hdrs,
      body: JSON.stringify({ model, input: text, voice: "Cherry" }),
      signal: AbortSignal.timeout(30000),
    });
    if (r.ok) {
      const buf = await r.arrayBuffer();
      console.log(`OK! ${buf.byteLength} bytes`);
    } else {
      console.log(`${r.status}: ${(await r.text()).slice(0, 200)}`);
    }
  } catch (e) { console.log("Error:", e.message); }
}
