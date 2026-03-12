const QWEN_KEY = "sk-bf8c49192e5a461a86aca4b121c3ac03";
const BASE = "https://dashscope.aliyuncs.com/compatible-mode/v1";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${QWEN_KEY}` };

const text = "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。";

// qwen3-tts-instruct-flash needs modalities: ["text", "audio"]
// and uses system message for voice instructions
console.log("=== qwen3-tts-instruct-flash with text+audio modalities ===");
try {
  const r = await fetch(`${BASE}/chat/completions`, {
    method: "POST", headers: hdrs,
    body: JSON.stringify({
      model: "qwen3-tts-instruct-flash",
      messages: [
        { role: "system", content: "You are a helpful assistant that reads text aloud. Read the following text naturally in Chinese." },
        { role: "user", content: text },
      ],
      modalities: ["text", "audio"],
      audio: { voice: "Cherry", format: "mp3" },
    }),
    signal: AbortSignal.timeout(60000),
  });
  console.log("Status:", r.status);
  const t = await r.text();
  const j = JSON.parse(t);
  if (r.ok && j.choices?.[0]?.message?.audio?.data) {
    const buf = Buffer.from(j.choices[0].message.audio.data, "base64");
    console.log(`Audio: ${buf.byteLength} bytes`);
    (await import("fs")).writeFileSync("test_qwen_instruct.mp3", buf);
    console.log("Saved: test_qwen_instruct.mp3");
  } else {
    console.log("Response:", t.slice(0, 500));
  }
} catch (e) { console.log("Error:", e.message); }

// qwen3-tts-flash: try different voice names and text format
const voices = ["Cherry", "Serena", "Ethan", "chelsie", "alloy", "echo"];
for (const voice of voices) {
  console.log(`\n--- qwen3-tts-flash / voice=${voice} ---`);
  try {
    const r = await fetch(`${BASE}/chat/completions`, {
      method: "POST", headers: hdrs,
      body: JSON.stringify({
        model: "qwen3-tts-flash",
        messages: [{ role: "user", content: text }],
        modalities: ["audio"],
        audio: { voice, format: "mp3" },
      }),
      signal: AbortSignal.timeout(30000),
    });
    const t = await r.text();
    if (r.ok) {
      const j = JSON.parse(t);
      if (j.choices?.[0]?.message?.audio?.data) {
        const buf = Buffer.from(j.choices[0].message.audio.data, "base64");
        console.log(`OK! ${buf.byteLength} bytes`);
        (await import("fs")).writeFileSync(`test_qwen_flash_${voice}.mp3`, buf);
        console.log(`Saved: test_qwen_flash_${voice}.mp3`);
        break;
      }
    }
    console.log(`${r.status}: ${t.slice(0, 200)}`);
  } catch (e) { console.log("Error:", e.message); }
}

// Also try with longer/different text
console.log("\n\n--- qwen3-tts-flash with English text ---");
try {
  const r = await fetch(`${BASE}/chat/completions`, {
    method: "POST", headers: hdrs,
    body: JSON.stringify({
      model: "qwen3-tts-flash",
      messages: [{ role: "user", content: "Hello everyone, welcome to my channel." }],
      modalities: ["audio"],
      audio: { voice: "Cherry", format: "mp3" },
    }),
    signal: AbortSignal.timeout(30000),
  });
  const t = await r.text();
  console.log("Status:", r.status);
  if (r.ok) {
    const j = JSON.parse(t);
    if (j.choices?.[0]?.message?.audio?.data) {
      console.log("English audio OK!");
    } else { console.log(t.slice(0, 300)); }
  } else { console.log(t.slice(0, 300)); }
} catch (e) { console.log("Error:", e.message); }

// Try with modalities: ["text", "audio"] for qwen3-tts-flash too
console.log("\n\n--- qwen3-tts-flash with text+audio modalities ---");
try {
  const r = await fetch(`${BASE}/chat/completions`, {
    method: "POST", headers: hdrs,
    body: JSON.stringify({
      model: "qwen3-tts-flash",
      messages: [{ role: "user", content: text }],
      modalities: ["text", "audio"],
      audio: { voice: "Cherry", format: "mp3" },
    }),
    signal: AbortSignal.timeout(30000),
  });
  const t = await r.text();
  console.log("Status:", r.status, t.slice(0, 300));
  if (r.ok) {
    const j = JSON.parse(t);
    if (j.choices?.[0]?.message?.audio?.data) {
      const buf = Buffer.from(j.choices[0].message.audio.data, "base64");
      console.log(`Audio: ${buf.byteLength} bytes`);
    }
  }
} catch (e) { console.log("Error:", e.message); }
