const BLT_KEY = "sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
const BLT = "https://api.bltcy.ai";

// Check available Kling-related endpoints by listing models
try {
  const r = await fetch(`${BLT}/v1/models`, { headers: { Authorization: `Bearer ${BLT_KEY}` } });
  const d = await r.json();
  const models = (d.data || []).filter(m => /kling|lip|sync|video|wav2lip|sadtalker|heygen|musetalk/i.test(m.id));
  console.log("Video/lip-sync related models:");
  models.forEach(m => console.log(" -", m.id));
} catch (e) { console.log("Error:", e.message); }

// Also try some common lip-sync API patterns
const endpoints = [
  "/kling/v1/videos/lip-sync",
  "/kling/v2/videos/lip-sync",
  "/v1/video/lip-sync",
];
for (const ep of endpoints) {
  try {
    // Just OPTIONS/GET to see if endpoint exists
    const r = await fetch(`${BLT}${ep}`, { headers: { Authorization: `Bearer ${BLT_KEY}` } });
    console.log(`${ep}: ${r.status} ${(await r.text()).slice(0, 200)}`);
  } catch (e) { console.log(`${ep}: ${e.message}`); }
}
