const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${BLT_KEY}` };

// The video URL from the successful Kling test
const VIDEO_URL = "https://v1-fdl.kechuangai.com/ksc2/pjocVGTmyJM3gNiQTrIxLeH-pxlzVn1F_19M_R3u_tNPm7vHFTUCZvRsnwWhbZuNVcB5hXVRmllfX3U-SuUi82W8Wz4T4086GVWV2_3ZCoPKS-RGxTxCiZvC-Vh0YXhP99rhcQ5LHkrX0QlZq9GB3HOpA1ZvBMjjkX5Ih9luzG5aGMZDyOQiS31ZhBBH9ypAcpif1yEoefZjzAMg7SQbTg.mp4?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAH2rP3Tn_rd_3AcDbUOlzcjA36HVk7IwlgfflW4715HTZui6l2MKf03_ZIKtfnGvfrmzpJSRpo_FC_C0KZDr-PaZIXJCHgqoIofAC0OuZ2JC-6PTj3a2BQoZjBt4NZ1kpmO525A56ncac_mOle6rPBtYlcLD3hQ5Ix6PiQ4SRrmX7PUen1f4EkFSOmjyKytUn21w3JEocTL5obdFfZlS6bGdJkMDRcbbJBqJMpMfYVFQBoSS2Y9drB8Z4ednHxTIh7XZcnaIiA3wa9k3AvRt1j9Y3dAnGUnYC8U-pLHWo3WpWfWnqLD1SgFMAE&x-kcdn-pid=112757&pkey=AAVzbG7KGbgJbsZ8SyDFOfeeXHPSOkUYq1yiPHi8rF-nBLuyrQyQBwaHQwngEAPJKchEhdsfDe1jYybZpMFL4nvEEQeGgUDJ2ndDArA4jwnlxvMlRxeTQlez2QGpzOhkQrw";

// First generate a short TTS audio and upload it
console.log("=== Step 1: Generate TTS audio ===");
const ttsR = await fetch(`${BLT}/v1/audio/speech`, {
  method: "POST", headers: hdrs,
  body: JSON.stringify({ model: "gpt-4o-mini-tts", input: "大家好，欢迎来到我的频道。", voice: "coral", response_format: "mp3" }),
  signal: AbortSignal.timeout(30000),
});
if (!ttsR.ok) { console.log("TTS failed:", ttsR.status, await ttsR.text()); process.exit(1); }
const ttsBuf = await ttsR.arrayBuffer();
console.log("TTS audio:", ttsBuf.byteLength, "bytes");

// Upload TTS audio to tmpfiles.org
console.log("\n=== Step 2: Upload audio to tmpfiles ===");
const form = new FormData();
form.append("file", new Blob([ttsBuf], { type: "audio/mpeg" }), "tts.mp3");
const upR = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
const upJ = await upR.json();
const audioUrl = upJ.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/").replace("http://", "https://");
console.log("Audio URL:", audioUrl);

// Test Kling lip-sync endpoint
console.log("\n=== Step 3: Kling lip-sync ===");
// Try different endpoint patterns
const endpoints = [
  { path: "/kling/v1/videos/lip-sync", body: { video_url: VIDEO_URL, audio_url: audioUrl, mode: "audio2video" } },
  { path: "/kling/v1/videos/lip-sync", body: { input: { video_url: VIDEO_URL, audio_url: audioUrl, mode: "audio2video" } } },
];

for (const ep of endpoints) {
  console.log(`\nTrying: ${ep.path}`);
  console.log("Body:", JSON.stringify(ep.body).slice(0, 200));
  try {
    const r = await fetch(`${BLT}${ep.path}`, {
      method: "POST", headers: hdrs,
      body: JSON.stringify(ep.body),
      signal: AbortSignal.timeout(30000),
    });
    console.log("Status:", r.status);
    const t = await r.text();
    console.log("Response:", t.slice(0, 500));
    if (r.ok) {
      const j = JSON.parse(t);
      if (j.data?.task_id) {
        console.log("\n=== Polling lip-sync task:", j.data.task_id, "===");
        for (let i = 0; i < 60; i++) {
          await new Promise(r => setTimeout(r, 5000));
          const pr = await fetch(`${BLT}/kling/v1/videos/lip-sync/${j.data.task_id}`, { headers: hdrs });
          const pj = await pr.json();
          const st = pj.data?.task_status;
          console.log(`Poll ${i+1}: ${st}`);
          if (st === "succeed") { console.log("SUCCESS:", JSON.stringify(pj.data).slice(0, 1500)); break; }
          if (st === "failed") { console.log("FAILED:", pj.data?.task_status_msg); break; }
        }
      }
      break;
    }
  } catch (e) { console.log("Error:", e.message); }
}
