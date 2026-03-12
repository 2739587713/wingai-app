const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${BLT_KEY}` };

const VIDEO_URL = "https://v1-fdl.kechuangai.com/ksc2/pjocVGTmyJM3gNiQTrIxLeH-pxlzVn1F_19M_R3u_tNPm7vHFTUCZvRsnwWhbZuNVcB5hXVRmllfX3U-SuUi82W8Wz4T4086GVWV2_3ZCoPKS-RGxTxCiZvC-Vh0YXhP99rhcQ5LHkrX0QlZq9GB3HOpA1ZvBMjjkX5Ih9luzG5aGMZDyOQiS31ZhBBH9ypAcpif1yEoefZjzAMg7SQbTg.mp4?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAH2rP3Tn_rd_3AcDbUOlzcjA36HVk7IwlgfflW4715HTZui6l2MKf03_ZIKtfnGvfrmzpJSRpo_FC_C0KZDr-PaZIXJCHgqoIofAC0OuZ2JC-6PTj3a2BQoZjBt4NZ1kpmO525A56ncac_mOle6rPBtYlcLD3hQ5Ix6PiQ4SRrmX7PUen1f4EkFSOmjyKytUn21w3JEocTL5obdFfZlS6bGdJkMDRcbbJBqJMpMfYVFQBoSS2Y9drB8Z4ednHxTIh7XZcnaIiA3wa9k3AvRt1j9Y3dAnGUnYC8U-pLHWo3WpWfWnqLD1SgFMAE&x-kcdn-pid=112757&pkey=AAVzbG7KGbgJbsZ8SyDFOfeeXHPSOkUYq1yiPHi8rF-nBLuyrQyQBwaHQwngEAPJKchEhdsfDe1jYybZpMFL4nvEEQeGgUDJ2ndDArA4jwnlxvMlRxeTQlez2QGpzOhkQrw";

// Generate TTS
console.log("=== Generating TTS ===");
const ttsR = await fetch(`${BLT}/v1/audio/speech`, {
  method: "POST", headers: hdrs,
  body: JSON.stringify({ model: "gpt-4o-mini-tts", input: "大家好，欢迎来到我的频道。", voice: "coral", response_format: "mp3" }),
  signal: AbortSignal.timeout(30000),
});
const ttsBuf = await ttsR.arrayBuffer();
console.log("TTS:", ttsBuf.byteLength, "bytes");

// Upload audio
const form = new FormData();
form.append("file", new Blob([ttsBuf], { type: "audio/mpeg" }), "tts.mp3");
const upR = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
const upJ = await upR.json();
const audioUrl = upJ.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/").replace("http://", "https://");
console.log("Audio URL:", audioUrl);

// Test videoretalk
console.log("\n=== videoretalk ===");
const bodies = [
  { model: "videoretalk", video_url: VIDEO_URL, audio_url: audioUrl },
  { model: "videoretalk", input: { video_url: VIDEO_URL, audio_url: audioUrl } },
];
for (const body of bodies) {
  for (const path of ["/v1/video/lip-sync", "/v1/videos/lip-sync", "/v1/video/retalk"]) {
    try {
      console.log(`\nPOST ${path} body:`, JSON.stringify(body).slice(0, 150));
      const r = await fetch(`${BLT}${path}`, { method: "POST", headers: hdrs, body: JSON.stringify(body), signal: AbortSignal.timeout(30000) });
      const t = await r.text();
      console.log(`Status: ${r.status}`, t.slice(0, 300));
      if (r.ok && t.includes("task_id")) {
        console.log(">>> GOT TASK ID - SUCCESS ENDPOINT FOUND");
      }
    } catch (e) { console.log("Error:", e.message); }
  }
}
