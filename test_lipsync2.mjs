const KEY = "sk-65U0ezGXoiWYMKCWdYfKheVrth6sqJzmP7M8ICJff2HQB4Gn";
const BASE = "https://api.bltcy.ai";

// Use a publicly accessible portrait image and audio
const IMG = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512&h=768&fit=crop";
const AUDIO = "https://www2.cs.uic.edu/~i101/SoundFiles/gettysburg.wav";

// Test kling lip-sync with audio URL
console.log("=== kling-lip-sync with audio URL ===");
try {
  const r = await fetch(`${BASE}/kling/v1/videos/lip-sync`, {
    method: "POST",
    headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model_name: "lip-sync-1.0.0",
      input: {
        face_image_url: IMG,
        audio_type: "url",
        audio_url: AUDIO,
        mode: "audio2video"
      }
    }),
    signal: AbortSignal.timeout(30000),
  });
  console.log("Status:", r.status);
  const text = await r.text();
  console.log(text.slice(0, 1000));

  if (r.ok) {
    const j = JSON.parse(text);
    const taskId = j.data?.task_id;
    if (taskId) {
      console.log("\nPolling task:", taskId);
      for (let i = 0; i < 40; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const pr = await fetch(`${BASE}/kling/v1/videos/lip-sync/${taskId}`, {
          headers: { Authorization: `Bearer ${KEY}` },
        });
        const pj = await pr.json();
        const st = pj.data?.task_status;
        console.log(`Poll ${i+1}: status=${st}`);
        if (st === "succeed") {
          console.log("SUCCESS!", JSON.stringify(pj.data).slice(0, 1500));
          break;
        }
        if (st === "failed") {
          console.log("FAILED:", JSON.stringify(pj.data?.task_status_msg));
          break;
        }
      }
    }
  }
} catch (e) { console.log("Error:", e.message); }
