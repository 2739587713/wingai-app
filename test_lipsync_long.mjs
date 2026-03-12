const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${BLT_KEY}` };

// 5s video from previous test
const VIDEO_URL = "https://v1-fdl.kechuangai.com/ksc2/pjocVGTmyJM3gNiQTrIxLeH-pxlzVn1F_19M_R3u_tNPm7vHFTUCZvRsnwWhbZuNVcB5hXVRmllfX3U-SuUi82W8Wz4T4086GVWV2_3ZCoPKS-RGxTxCiZvC-Vh0YXhP99rhcQ5LHkrX0QlZq9GB3HOpA1ZvBMjjkX5Ih9luzG5aGMZDyOQiS31ZhBBH9ypAcpif1yEoefZjzAMg7SQbTg.mp4?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAH2rP3Tn_rd_3AcDbUOlzcjA36HVk7IwlgfflW4715HTZui6l2MKf03_ZIKtfnGvfrmzpJSRpo_FC_C0KZDr-PaZIXJCHgqoIofAC0OuZ2JC-6PTj3a2BQoZjBt4NZ1kpmO525A56ncac_mOle6rPBtYlcLD3hQ5Ix6PiQ4SRrmX7PUen1f4EkFSOmjyKytUn21w3JEocTL5obdFfZlS6bGdJkMDRcbbJBqJMpMfYVFQBoSS2Y9drB8Z4ednHxTIh7XZcnaIiA3wa9k3AvRt1j9Y3dAnGUnYC8U-pLHWo3WpWfWnqLD1SgFMAE&x-kcdn-pid=112757&pkey=AAVzbG7KGbgJbsZ8SyDFOfeeXHPSOkUYq1yiPHi8rF-nBLuyrQyQBwaHQwngEAPJKchEhdsfDe1jYybZpMFL4nvEEQeGgUDJ2ndDArA4jwnlxvMlRxeTQlez2QGpzOhkQrw";

// Generate longer TTS (~15-20 seconds)
console.log("=== Generating longer TTS ===");
const longText = "大家好，今天跟大家聊一个特别有意思的话题。你有没有想过，为什么有些人做短视频就是能火？其实这里面是有套路的。第一点，你的开头必须要有悬念，前三秒留不住人就白搭了。第二点，你要学会讲故事，不是干巴巴地说教，而是用一个小案例把人带进去。";
const ttsR = await fetch(`${BLT}/v1/audio/speech`, {
  method: "POST", headers: hdrs,
  body: JSON.stringify({ model: "gpt-4o-mini-tts", input: longText, voice: "coral", response_format: "mp3" }),
  signal: AbortSignal.timeout(30000),
});
const ttsBuf = await ttsR.arrayBuffer();
console.log(`TTS: ${ttsBuf.byteLength} bytes`);

// Upload
const form = new FormData();
form.append("file", new Blob([ttsBuf], { type: "audio/mpeg" }), "tts_long.mp3");
const upR = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: form });
const upJ = await upR.json();
const audioUrl = upJ.data.url.replace("tmpfiles.org/", "tmpfiles.org/dl/").replace("http://", "https://");
console.log("Audio URL:", audioUrl);

// Lip-sync with longer audio on shorter video
console.log("\n=== Lip-sync: 5s video + ~20s audio ===");
const r = await fetch(`${BLT}/kling/v1/videos/lip-sync`, {
  method: "POST", headers: hdrs,
  body: JSON.stringify({ input: { video_url: VIDEO_URL, audio_url: audioUrl, audio_type: "url", mode: "audio2video" } }),
  signal: AbortSignal.timeout(30000),
});
const t = await r.text();
console.log(`Status: ${r.status}`, t.slice(0, 400));

if (r.ok) {
  const j = JSON.parse(t);
  if (j.data?.task_id) {
    console.log("Task:", j.data.task_id);
    for (let i = 0; i < 80; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const pr = await fetch(`${BLT}/kling/v1/videos/lip-sync/${j.data.task_id}`, { headers: hdrs });
      const pj = await pr.json();
      const st = pj.data?.task_status;
      console.log(`Poll ${i+1}: ${st}`);
      if (st === "succeed") {
        const vid = pj.data?.task_result?.videos?.[0];
        console.log("Duration:", vid?.duration, "s");
        console.log("URL:", vid?.url?.slice(0, 100));
        break;
      }
      if (st === "failed") { console.log("FAILED:", pj.data?.task_status_msg); break; }
    }
  }
}
