import { writeFileSync, mkdirSync } from "fs";

const API_KEY = "sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b";
const BASE = "https://api.apiyi.com/v1";

mkdirSync("public/avatars", { recursive: true });

// 参考抖音口播视频风格：自然光感、哑光皮肤、真实感、手机前置镜头质感
const presets = [
  { id: "p1", nm: "商务男", prompt: `Portrait photo of a 32 year old Chinese man in a dark navy suit and light blue shirt, taken with iPhone front camera, natural indoor lighting from a window, matte skin with no oil or shine, relaxed confident smile, looking straight at camera, head and shoulders framing, simple white wall background slightly out of focus, casual professional vibe like a Douyin business creator, no heavy retouching, natural color grading` },
  { id: "p2", nm: "知性女", prompt: `Portrait photo of a 30 year old Chinese woman wearing a beige knit cardigan over white top, taken with iPhone front camera, soft natural daylight, matte skin with minimal natural makeup, gentle warm smile, looking straight at camera, head and shoulders framing, clean light gray wall background, approachable and intelligent look like a Douyin knowledge sharing creator, no glamour filter, realistic skin texture` },
  { id: "p3", nm: "活力少女", prompt: `Portrait photo of a 22 year old Chinese girl wearing a simple white t-shirt, taken with iPhone front camera, bright natural daylight, clear fresh skin with barely any makeup, big genuine smile showing teeth, looking straight at camera, head and shoulders framing, plain light background, energetic youthful vibe like a young Douyin lifestyle creator, no beauty filter, natural and authentic look` },
  { id: "p4", nm: "儒雅大叔", prompt: `Portrait photo of a 45 year old Chinese man wearing thin metal frame glasses and a charcoal crew neck sweater, taken with iPhone front camera, warm natural indoor lighting, matte skin with natural aging lines, kind trustworthy smile, looking straight at camera, head and shoulders framing, warm toned simple background, calm authoritative presence like a Douyin education creator, no retouching, authentic look` },
  { id: "p5", nm: "甜美主播", prompt: `Portrait photo of a 26 year old Chinese woman wearing a soft pink blouse, taken with ring light setup like a livestream studio, clean matte skin with light natural makeup, sweet friendly smile, looking straight at camera, head and shoulders framing, clean white background, warm and inviting look like a popular Douyin shopping livestreamer, natural color tones, no heavy beauty filter` },
];

for (const p of presets) {
  console.log(`Generating ${p.nm}...`);
  try {
    const r = await fetch(`${BASE}/images/generations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${API_KEY}` },
      body: JSON.stringify({ model: "gpt-image-1", prompt: p.prompt, n: 1, size: "1024x1536", quality: "high" }),
      signal: AbortSignal.timeout(120000),
    });
    const d = await r.json();
    const b64 = d.data?.[0]?.b64_json;
    if (b64) {
      const buf = Buffer.from(b64, "base64");
      writeFileSync(`public/avatars/${p.id}.png`, buf);
      console.log(`  Saved: public/avatars/${p.id}.png (${(buf.length / 1024).toFixed(0)} KB)`);
    } else {
      console.log("  Failed:", d.error?.message || "no b64 data");
    }
  } catch (e) {
    console.log("  Error:", e.message);
  }
}
console.log("\nDone!");
