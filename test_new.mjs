const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";
const APIYI_KEY = "sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b";
const APIYI = "https://api.apiyi.com/v1";

const IMG = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512&h=768&fit=crop";

// Test 1: Kling image2video
console.log("=== Kling image2video ===");
try {
  const r = await fetch(`${BLT}/kling/v1/videos/image2video`, {
    method: "POST",
    headers: { Authorization: `Bearer ${BLT_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_name: "kling-v1",
      image: IMG,
      prompt: "A woman speaking to camera with natural head movements and gentle expressions, casual vlog style",
      duration: "5",
      aspect_ratio: "9:16",
    }),
  });
  console.log("Status:", r.status);
  console.log(await r.text());
} catch (e) { console.log("Error:", e.message); }

// Test 2: gemini-2.5-flash-tts
console.log("\n=== gemini-2.5-flash-tts ===");
try {
  const r = await fetch(`${APIYI}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${APIYI_KEY}` },
    body: JSON.stringify({
      model: "gemini-2.5-flash-tts",
      input: "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。",
      voice: "Kore",
    }),
  });
  console.log("Status:", r.status);
  if (r.ok) {
    const buf = await r.arrayBuffer();
    console.log("Audio size:", buf.byteLength, "bytes");
  } else {
    console.log(await r.text());
  }
} catch (e) { console.log("Error:", e.message); }

// Test 3: gpt-4o-mini-tts
console.log("\n=== gpt-4o-mini-tts ===");
try {
  const r = await fetch(`${APIYI}/audio/speech`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${APIYI_KEY}` },
    body: JSON.stringify({
      model: "gpt-4o-mini-tts",
      input: "大家好，欢迎来到我的频道。",
      voice: "coral",
    }),
  });
  console.log("Status:", r.status);
  if (r.ok) {
    const buf = await r.arrayBuffer();
    console.log("Audio size:", buf.byteLength, "bytes");
  } else {
    console.log(await r.text());
  }
} catch (e) { console.log("Error:", e.message); }
