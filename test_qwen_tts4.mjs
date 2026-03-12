const QWEN_KEY = "sk-bf8c49192e5a461a86aca4b121c3ac03";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${QWEN_KEY}` };
const text = "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。你有没有想过，为什么有些人做短视频就是能火？";

// DashScope native API for TTS
// Ref: https://help.aliyun.com/zh/model-studio/developer-reference/text-to-speech
const endpoints = [
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation",
  "https://dashscope.aliyuncs.com/api/v1/services/aigc/text2audio/generation",
  "https://dashscope.aliyuncs.com/api/v1/services/speech/text-to-speech",
];

// Format 1: Native DashScope TTS format
for (const url of endpoints) {
  console.log(`\n=== ${url.split("/").slice(-3).join("/")} ===`);
  const bodies = [
    { model: "qwen3-tts-flash", input: { text }, parameters: { format: "mp3" } },
    { model: "cosyvoice-v1", input: { text }, parameters: { voice: "longxiaochun", format: "mp3" } },
    { model: "sambert-zhichu-v1", input: { text }, parameters: { format: "mp3" } },
  ];
  for (const body of bodies) {
    console.log(`  model: ${body.model}`);
    try {
      const r = await fetch(url, {
        method: "POST", headers: hdrs,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(30000),
      });
      const ct = r.headers.get("content-type") || "";
      if (ct.includes("audio")) {
        const buf = await r.arrayBuffer();
        console.log(`  => AUDIO OK! ${buf.byteLength} bytes`);
      } else {
        const t = await r.text();
        console.log(`  => ${r.status}: ${t.slice(0, 200)}`);
      }
    } catch (e) { console.log(`  => Error: ${e.message}`); }
  }
}

// Format 2: qwen3-tts via chat completions with input.text structure
console.log("\n\n=== qwen3-tts-instruct-flash native format via compatible mode ===");
try {
  const r = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST", headers: hdrs,
    body: JSON.stringify({
      model: "qwen3-tts-instruct-flash",
      messages: [
        { role: "system", content: "请用温柔自然的女声朗读以下文本。" },
        { role: "user", content: [{ type: "text", text }] },
      ],
      modalities: ["text", "audio"],
      audio: { voice: "Cherry", format: "mp3" },
    }),
    signal: AbortSignal.timeout(60000),
  });
  console.log("Status:", r.status);
  const t = await r.text();
  const j = JSON.parse(t);
  if (j.choices?.[0]?.message?.audio?.data) {
    const buf = Buffer.from(j.choices[0].message.audio.data, "base64");
    console.log(`Audio: ${buf.byteLength} bytes`);
    (await import("fs")).writeFileSync("test_qwen_instruct2.mp3", buf);
  } else {
    console.log(t.slice(0, 500));
  }
} catch (e) { console.log("Error:", e.message); }

// Format 3: Try with input as array (multimodal format)
console.log("\n\n=== qwen3-tts-flash with content array ===");
try {
  const r = await fetch("https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions", {
    method: "POST", headers: hdrs,
    body: JSON.stringify({
      model: "qwen3-tts-flash",
      messages: [{ role: "user", content: [{ type: "text", text }] }],
      modalities: ["audio"],
      audio: { voice: "Cherry", format: "mp3" },
    }),
    signal: AbortSignal.timeout(30000),
  });
  console.log("Status:", r.status);
  const t = await r.text();
  if (r.ok) {
    const j = JSON.parse(t);
    if (j.choices?.[0]?.message?.audio?.data) {
      const buf = Buffer.from(j.choices[0].message.audio.data, "base64");
      console.log(`Audio: ${buf.byteLength} bytes`);
      (await import("fs")).writeFileSync("test_qwen_flash_array.mp3", buf);
    } else { console.log(t.slice(0, 300)); }
  } else { console.log(t.slice(0, 300)); }
} catch (e) { console.log("Error:", e.message); }
