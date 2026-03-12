const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";
const hdrs = { "Content-Type": "application/json", Authorization: `Bearer ${BLT_KEY}` };

const VIDEO_URL = "https://v1-fdl.kechuangai.com/ksc2/pjocVGTmyJM3gNiQTrIxLeH-pxlzVn1F_19M_R3u_tNPm7vHFTUCZvRsnwWhbZuNVcB5hXVRmllfX3U-SuUi82W8Wz4T4086GVWV2_3ZCoPKS-RGxTxCiZvC-Vh0YXhP99rhcQ5LHkrX0QlZq9GB3HOpA1ZvBMjjkX5Ih9luzG5aGMZDyOQiS31ZhBBH9ypAcpif1yEoefZjzAMg7SQbTg.mp4?cacheKey=ChtzZWN1cml0eS5rbGluZy5tZXRhX2VuY3J5cHQSsAH2rP3Tn_rd_3AcDbUOlzcjA36HVk7IwlgfflW4715HTZui6l2MKf03_ZIKtfnGvfrmzpJSRpo_FC_C0KZDr-PaZIXJCHgqoIofAC0OuZ2JC-6PTj3a2BQoZjBt4NZ1kpmO525A56ncac_mOle6rPBtYlcLD3hQ5Ix6PiQ4SRrmX7PUen1f4EkFSOmjyKytUn21w3JEocTL5obdFfZlS6bGdJkMDRcbbJBqJMpMfYVFQBoSS2Y9drB8Z4ednHxTIh7XZcnaIiA3wa9k3AvRt1j9Y3dAnGUnYC8U-pLHWo3WpWfWnqLD1SgFMAE&x-kcdn-pid=112757&pkey=AAVzbG7KGbgJbsZ8SyDFOfeeXHPSOkUYq1yiPHi8rF-nBLuyrQyQBwaHQwngEAPJKchEhdsfDe1jYybZpMFL4nvEEQeGgUDJ2ndDArA4jwnlxvMlRxeTQlez2QGpzOhkQrw";

console.log("=== Kling video extend with model_name ===");
const r = await fetch(`${BLT}/kling/v1/videos/video-extend`, {
  method: "POST", headers: hdrs,
  body: JSON.stringify({ model_name: "kling-v1", video_url: VIDEO_URL, prompt: "Continue talking to camera naturally", duration: "5" }),
  signal: AbortSignal.timeout(30000),
});
const t = await r.text();
console.log(`Status: ${r.status}`, t.slice(0, 400));

if (r.ok && t.includes("task_id")) {
  const j = JSON.parse(t);
  console.log("Task ID:", j.data?.task_id);
  for (let i = 0; i < 60; i++) {
    await new Promise(r => setTimeout(r, 5000));
    const pr = await fetch(`${BLT}/kling/v1/videos/video-extend/${j.data.task_id}`, { headers: hdrs });
    const pj = await pr.json();
    const st = pj.data?.task_status;
    console.log(`Poll ${i+1}: ${st}`);
    if (st === "succeed") {
      console.log("Duration:", pj.data?.task_result?.videos?.[0]?.duration);
      console.log("URL:", pj.data?.task_result?.videos?.[0]?.url?.slice(0, 80));
      break;
    }
    if (st === "failed") { console.log("FAILED:", pj.data?.task_status_msg); break; }
  }
}
