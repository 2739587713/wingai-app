const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";

// Poll Kling task
console.log("=== Polling Kling image2video ===");
const taskId = "860980388486357080";
for (let i = 0; i < 40; i++) {
  await new Promise(r => setTimeout(r, 5000));
  const r = await fetch(`${BLT}/kling/v1/videos/image2video/${taskId}`, {
    headers: { Authorization: `Bearer ${BLT_KEY}` },
  });
  const j = await r.json();
  const st = j.data?.task_status;
  console.log(`Poll ${i+1}: ${st}`);
  if (st === "succeed") {
    console.log("SUCCESS!", JSON.stringify(j.data).slice(0, 2000));
    break;
  }
  if (st === "failed") {
    console.log("FAILED:", j.data?.task_status_msg);
    break;
  }
}
