const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai/v1";
const APIYI_KEY = "sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b";
const APIYI = "https://api.apiyi.com/v1";

const text = "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。";

// Try on 柏拉图
for (const model of ["gpt-4o-mini-tts", "gemini-2.5-flash-tts", "gemini-2.5-pro-tts", "tts-1-hd"]) {
  try {
    const r = await fetch(`${BLT}/audio/speech`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${BLT_KEY}` },
      body: JSON.stringify({ model, input: text, voice: "coral" }),
      signal: AbortSignal.timeout(15000),
    });
    if (r.ok) {
      const buf = await r.arrayBuffer();
      console.log(`柏拉图 ${model}: OK (${buf.byteLength} bytes)`);
    } else {
      const t = await r.text();
      console.log(`柏拉图 ${model}: ${r.status} ${t.slice(0, 120)}`);
    }
  } catch (e) { console.log(`柏拉图 ${model}: ${e.message}`); }
}

// Also check if gemini TTS models exist on 柏拉图
try {
  const r = await fetch(`${BLT}/models`, { headers: { Authorization: `Bearer ${BLT_KEY}` } });
  const d = await r.json();
  const ttsModels = (d.data || []).filter(m => /tts|speech/i.test(m.id));
  console.log("\n柏拉图 TTS models:", ttsModels.map(m => m.id).join(", "));
} catch (e) {}

// Test gemini-3.1-pro-preview on apiyi
console.log("\n=== gemini-3.1-pro-preview ===");
try {
  const r = await fetch(`${APIYI}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${APIYI_KEY}` },
    body: JSON.stringify({
      model: "gemini-3.1-pro-preview",
      messages: [{ role: "user", content: "说一句话测试" }],
    }),
    signal: AbortSignal.timeout(15000),
  });
  console.log("Status:", r.status, (await r.text()).slice(0, 200));
} catch (e) { console.log("Error:", e.message); }
