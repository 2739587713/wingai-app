import { EdgeTTS } from "edge-tts";

const text = "大家好，欢迎来到我的频道，今天跟大家聊一个特别有意思的话题。你有没有想过，为什么有些人做短视频就是能火？";

// Chinese voices
const voices = [
  "zh-CN-XiaoxiaoNeural",   // 女 - 温暖
  "zh-CN-XiaoyiNeural",     // 女 - 活泼
  "zh-CN-YunjianNeural",    // 男 - 磁性
  "zh-CN-YunxiNeural",      // 男 - 阳光
  "zh-CN-YunxiaNeural",     // 男 - 少年
  "zh-CN-XiaochenNeural",   // 女 - 知性
];

for (const voice of voices) {
  console.log(`\n--- ${voice} ---`);
  try {
    const tts = new EdgeTTS();
    await tts.synthesize(text, voice, { rate: "+0%", pitch: "+0Hz" });
    const audio = tts.toBuffer();
    console.log(`OK! ${audio.byteLength} bytes`);

    // Save first one to check quality
    if (voice === voices[0]) {
      const fs = await import("fs");
      fs.writeFileSync("test_edge_xiaoxiao.mp3", Buffer.from(audio));
      console.log("Saved test_edge_xiaoxiao.mp3");
    }
  } catch (e) {
    console.log("Error:", e.message);
    // Try alternative API
    try {
      const { default: EdgeTTS2 } = await import("edge-tts");
      const tts2 = new EdgeTTS2();
      await tts2.synthesize(text, voice);
      console.log("Alt API worked");
    } catch (e2) { console.log("Alt error:", e2.message); }
  }
}
