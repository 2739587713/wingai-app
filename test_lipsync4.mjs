const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${BLT_KEY}` };

const AUDIO_URL = "https://tmpfiles.org/dl/28580425/tts.mp3";
const VIDEO_URL = "https://v1-fdl.kechuangai.com/ksc2/pjocVGTmyJM3gNiQTrIxLeH-pxlzVn1F_19M_R3u_tNPm7vHFTUCZvRsnwWhbZuNVcB5hXVRmllfX3U-SuUi82W8Wz4T4086GVWV2_3ZCoPKS-RGxTxCiZvC-Vh0YXhP99rhcQ5LHkrX0QlZq9GB3HOpA1ZvBMjjkX5Ih9luzG5aGMZDyOQiS31ZhBBH9ypAcpif1yEoefZjzAMg7SQbTg.mp4?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAH2rP3Tn_rd_3AcDbUOlzcjA36HVk7IwlgfflW4715HTZui6l2MKf03_ZIKtfnGvfrmzpJSRpo_FC_C0KZDr-PaZIXJCHgqoIofAC0OuZ2JC-6PTj3a2BQoZjBt4NZ1kpmO525A56ncac_mOle6rPBtYlcLD3hQ5Ix6PiQ4SRrmX7PUen1f4EkFSOmjyKytUn21w3JEocTL5obdFfZlS6bGdJkMDRcbbJBqJMpMfYVFQBoSS2Y9drB8Z4ednHxTIh7XZcnaIiA3wa9k3AvRt1j9Y3dAnGUnYC8U-pLHWo3WpWfWnqLD1SgFMAE&x-kcdn-pid=112757&pkey=AAVzbG7KGbgJbsZ8SyDFOfeeXHPSOkUYq1yiPHi8rF-nBLuyrQyQBwaHQwngEAPJKchEhdsfDe1jYybZpMFL4nvEEQeGgUDJ2ndDArA4jwnlxvMlRxeTQlez2QGpzOhkQrw";

// Test 1: videoretalk via /v1/video/create
console.log("=== Test 1: videoretalk via /v1/video/create ===");
const bodies1 = [
  { model: "videoretalk", video_url: VIDEO_URL, audio_url: AUDIO_URL },
  { model: "videoretalk", input: { video_url: VIDEO_URL, audio_url: AUDIO_URL } },
  { model: "videoretalk", video: VIDEO_URL, audio: AUDIO_URL },
];
for (const body of bodies1) {
  try {
    console.log("\nBody:", JSON.stringify(body).slice(0, 120), "...");
    const r = await fetch(`${BLT}/v1/video/create`, { method: "POST", headers: hdrs, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    const t = await r.text();
    console.log(`Status: ${r.status}`, t.slice(0, 400));
    if (r.ok) break;
  } catch (e) { console.log("Error:", e.message); }
}

// Test 2: Kling lip-sync via /kling/v1/videos/lip-sync (POST)
console.log("\n\n=== Test 2: Kling lip-sync ===");
const bodies2 = [
  // mode: audio2video = use audio to drive lip-sync on existing video
  { model_name: "kling-lip-sync", input: { video_url: VIDEO_URL, audio_url: AUDIO_URL, mode: "audio2video" } },
  { model_name: "kling-lip-sync", video_url: VIDEO_URL, audio_url: AUDIO_URL, mode: "audio2video" },
  { model_name: "kling-advanced-lip-sync", input: { video_url: VIDEO_URL, audio_url: AUDIO_URL, mode: "audio2video" } },
];
for (const body of bodies2) {
  try {
    console.log("\nBody:", JSON.stringify(body).slice(0, 150), "...");
    const r = await fetch(`${BLT}/kling/v1/videos/lip-sync`, { method: "POST", headers: hdrs, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
    const t = await r.text();
    console.log(`Status: ${r.status}`, t.slice(0, 400));
    if (r.ok && t.includes("task_id")) {
      const j = JSON.parse(t);
      console.log(">>> TASK ID:", j.data?.task_id);
      // Poll
      for (let i = 0; i < 60; i++) {
        await new Promise(r => setTimeout(r, 5000));
        const pr = await fetch(`${BLT}/kling/v1/videos/lip-sync/${j.data.task_id}`, { headers: hdrs });
        const pj = await pr.json();
        const st = pj.data?.task_status;
        console.log(`Poll ${i+1}: ${st}`);
        if (st === "succeed") { console.log("SUCCESS:", JSON.stringify(pj.data).slice(0, 1500)); process.exit(0); }
        if (st === "failed") { console.log("FAILED:", pj.data?.task_status_msg); break; }
      }
    }
  } catch (e) { console.log("Error:", e.message); }
}
