const API_KEY = "sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b";

console.log("Starting sora_video2 test... (may take 2-5 minutes)");
const t0 = Date.now();

const r = await fetch("https://api.apiyi.com/v1/chat/completions", {
  method: "POST",
  headers: { Authorization: "Bearer " + API_KEY, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "sora_video2",
    stream: true,
    messages: [{ role: "user", content: "A young Chinese woman speaking to camera with gentle head movements and natural expressions, professional studio lighting, plain light gray background, portrait orientation, upper body shot" }]
  }),
});

if (!r.ok) {
  console.log("ERR", r.status, await r.text());
  process.exit(1);
}

console.log("Status:", r.status, "- Stream connected, waiting for video generation...");
const reader = r.body.getReader();
const dec = new TextDecoder();
let buf = "", fullContent = "";

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  buf += dec.decode(value, { stream: true });
  const lines = buf.split("\n"); buf = lines.pop();
  for (const l of lines) {
    if (!l.trim()) continue;
    if (l.trim() === "data: [DONE]") { console.log(`${((Date.now()-t0)/1000).toFixed(0)}s: [DONE]`); continue; }
    if (l.startsWith("data: ")) {
      try {
        const j = JSON.parse(l.slice(6));
        const c = j.choices?.[0]?.delta?.content || "";
        if (c) { fullContent += c; console.log(`${((Date.now()-t0)/1000).toFixed(0)}s: ${c.replace(/\n/g, " ").trim().slice(0, 150)}`); }
      } catch {}
    }
  }
}

console.log("\n=== FULL CONTENT ===");
console.log(fullContent);
console.log("\n=== Total time:", ((Date.now()-t0)/1000).toFixed(1) + "s ===");

// Extract video URL
const urlMatch = fullContent.match(/https?:\/\/[^\s)]+\.mp4[^\s)]*/);
if (urlMatch) console.log("\nVIDEO URL:", urlMatch[0]);
