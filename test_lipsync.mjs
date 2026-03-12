// Test kling-lip-sync on 柏拉图 - check API format and pricing
const KEY = "sk-65U0ezGXoiWYMKCWdYfKheVrth6sqJzmP7M8ICJff2HQB4Gn";
const BASE = "https://api.bltcy.ai";

// Test 1: Try kling lip-sync native endpoint format
console.log("=== Test kling-lip-sync ===");
try {
  const r = await fetch(`${BASE}/kling/v1/videos/lip-sync`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_name: "lip-sync-1.0.0",
      input: {
        face_image_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
        audio_type: "tts",
        text: "Hello, welcome to my channel, today we will talk about something interesting",
        voice_id: "narrator_Jing_cn_female",
        mode: "text2video"
      }
    }),
    signal: AbortSignal.timeout(30000),
  });
  console.log("Status:", r.status);
  console.log(await r.text());
} catch (e) { console.log("Error:", e.message); }

// Test 2: Try via unified endpoint
console.log("\n=== Test kling-lip-sync via /v1/video/generations ===");
try {
  const r = await fetch(`${BASE}/v1/video/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "kling-lip-sync",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
      audio_type: "tts",
      text: "Hello world test",
      voice_id: "narrator_Jing_cn_female",
    }),
    signal: AbortSignal.timeout(30000),
  });
  console.log("Status:", r.status);
  console.log(await r.text());
} catch (e) { console.log("Error:", e.message); }

// Test 3: videoretalk (another lip-sync option)
console.log("\n=== Test videoretalk ===");
try {
  const r = await fetch(`${BASE}/v1/video/generations`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "videoretalk",
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512",
      audio: "https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav",
    }),
    signal: AbortSignal.timeout(30000),
  });
  console.log("Status:", r.status);
  console.log(await r.text());
} catch (e) { console.log("Error:", e.message); }
