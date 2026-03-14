import { useState, useRef } from "react";

const STYLES = [
  { id: "cinematic", label: "电影感", emoji: "🎬" },
  { id: "anime", label: "动漫风", emoji: "🎨" },
  { id: "watercolor", label: "水彩画", emoji: "🖌️" },
  { id: "pixel", label: "像素风", emoji: "👾" },
  { id: "dark", label: "暗黑系", emoji: "🌑" },
];

const EXAMPLES = [
  "末日少年觉醒超能力，独自对抗入侵的暗影军团",
  "古代女将军在战场上以少胜多的传奇故事",
  "一只流浪猫在城市中寻找温暖的家的奇幻旅程",
  "赛博朋克都市中AI觉醒自我意识的故事",
];

export default function ComicDrama() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("input"); // input|storyboard|images|video_gen|composing|done|error
  const [progress, setProgress] = useState("");
  const [storyboard, setStoryboard] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [videoUrl, setVideoUrl] = useState("");
  const [taskId, setTaskId] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const [videoGenCount, setVideoGenCount] = useState(0);
  const timerRef = useRef(null);
  const abortRef = useRef(null);

  const reset = () => {
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearInterval(timerRef.current);
    setInput(""); setStyle("cinematic"); setGenerating(false); setStep("input");
    setProgress(""); setStoryboard(null); setImageUrls({}); setVideoUrl("");
    setTaskId(""); setElapsed(0); setError(""); setVideoGenCount(0);
  };

  const startGeneration = async () => {
    if (!input.trim()) return;
    setGenerating(true); setStep("input"); setProgress("AI正在构思剧情...");
    setStoryboard(null); setImageUrls({}); setVideoUrl(""); setError("");
    const startTime = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - startTime) / 1000)), 1000);

    const ctrl = new AbortController();
    abortRef.current = ctrl;

    try {
      const res = await fetch("/api/comic-drama/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input, style }),
        signal: ctrl.signal,
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split("\n");
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            const evt = d.event || d.type;
            if (evt === "started") { setTaskId(d.task_id || ""); setProgress(d.message || "开始生成..."); }
            else if (evt === "storyboard_ready") {
              setStoryboard({ title: d.title, character: d.character, scenes: d.scenes, bgm_style: d.bgm_style });
              setStep("storyboard"); setProgress("分镜就绪，正在生成画面...");
            }
            else if (evt === "image_ready") { setStep("images"); setImageUrls(prev => ({ ...prev, [d.scene_id]: d.image_url })); setProgress(d.message || "生成画面中..."); }
            else if (evt === "video_gen_start") { setStep("video_gen"); setProgress(d.message || "生成视频片段中..."); }
            else if (evt === "video_gen_done") { setVideoGenCount(prev => prev + 1); setProgress(d.message || "视频片段完成"); }
            else if (evt === "composing") { setStep("composing"); setProgress(d.message || "合成最终视频..."); }
            else if (evt === "done") { setStep("done"); setVideoUrl(d.video_url || ""); setProgress("完成!"); setGenerating(false); clearInterval(timerRef.current); }
            else if (evt === "error") { setStep("error"); setError(d.message || "生成失败"); setGenerating(false); clearInterval(timerRef.current); }
            else if (d.message) setProgress(d.message);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") { setStep("error"); setError(e.message); setGenerating(false); clearInterval(timerRef.current); }
    }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const phaseIdx = { input: 0, storyboard: 1, images: 2, video_gen: 3, composing: 4, done: 5 };
  const phases = ["构思剧情", "分镜脚本", "生成画面", "生成视频", "合成输出", "完成"];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>AI漫剧一键生成</h2>
        {step !== "input" && <button onClick={reset} style={btnStyle}>重新开始</button>}
        {generating && <span style={{ fontSize: 12, color: "var(--t3)", marginLeft: "auto" }}>⏱ {fmtTime(elapsed)}</span>}
      </div>

      {/* Progress bar */}
      {generating && (
        <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
          {phases.map((ph, i) => (
            <div key={i} style={{ flex: 1, textAlign: "center" }}>
              <div style={{ height: 4, borderRadius: 2, background: i <= phaseIdx[step] ? "var(--p)" : "var(--s3)", transition: "var(--tr)" }} />
              <div style={{ fontSize: 10, color: i <= phaseIdx[step] ? "var(--p)" : "var(--t3)", marginTop: 4 }}>{ph}</div>
            </div>
          ))}
        </div>
      )}

      {/* Input section */}
      {(step === "input" || (step === "error" && !generating)) && (
        <div>
          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>故事概念</h3>
            <textarea value={input} onChange={e => setInput(e.target.value)} maxLength={200} rows={3}
              placeholder="输入你的故事概念，例如：末日少年觉醒超能力..."
              style={{ width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--bl)", background: "var(--s)", color: "var(--t)", fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" }} />
            <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: "var(--t3)" }}>灵感:</span>
              {EXAMPLES.map((ex, i) => (
                <span key={i} onClick={() => setInput(ex)} style={{ fontSize: 11, color: "var(--p)", cursor: "pointer", padding: "2px 8px", borderRadius: 4, background: "var(--s2)" }}>
                  {ex.slice(0, 15)}...
                </span>
              ))}
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>视觉风格</h3>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {STYLES.map(s => (
                <div key={s.id} onClick={() => setStyle(s.id)}
                  style={{ padding: "10px 16px", borderRadius: 10, border: `2px solid ${style === s.id ? "var(--p)" : "var(--bl)"}`, background: style === s.id ? "var(--s2)" : "var(--s)", cursor: "pointer", fontSize: 13, transition: "var(--tr)" }}>
                  {s.emoji} {s.label}
                </div>
              ))}
            </div>
          </div>

          {error && <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "var(--r)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

          <button onClick={startGeneration} disabled={!input.trim() || generating}
            style={{ ...btnPrimaryStyle, width: "100%", padding: 14, fontSize: 15, opacity: !input.trim() ? 0.5 : 1 }}>
            ✨ 开始生成
          </button>
        </div>
      )}

      {/* Progress message */}
      {generating && progress && (
        <div style={{ textAlign: "center", padding: 20, fontSize: 14, color: "var(--t2)" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🎬</div>
          {progress}
        </div>
      )}

      {/* Storyboard display */}
      {storyboard && step !== "input" && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>📖 {storyboard.title || "分镜脚本"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 12 }}>
            {(storyboard.scenes || []).map((sc, i) => (
              <div key={i} style={{ padding: 12, borderRadius: 10, border: "1px solid var(--bl)", background: "var(--s)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "var(--p)" }}>场景 {i + 1}</span>
                  <span style={{ fontSize: 10, color: "var(--t3)" }}>{sc.duration || 5}s</span>
                </div>
                {imageUrls[sc.scene_id || i] && (
                  <img src={imageUrls[sc.scene_id || i]} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: 8 }} />
                )}
                <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 6 }}>{sc.visual_prompt}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontStyle: "italic" }}>🎙 {sc.narration}</div>
                <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>📷 {sc.camera} · {sc.mood}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done - video player */}
      {step === "done" && videoUrl && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>🎉 视频已生成</h3>
          <video src={videoUrl} controls style={{ width: "100%", borderRadius: 10, maxHeight: 500 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <a href={videoUrl} download style={{ ...btnPrimaryStyle, textDecoration: "none", textAlign: "center", flex: 1 }}>⬇ 下载视频</a>
            <button onClick={reset} style={{ ...btnStyle, flex: 1 }}>重新创作</button>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = { padding: 20, borderRadius: 12, border: "1px solid var(--bl)", background: "var(--s)", marginBottom: 16 };
const btnStyle = { padding: "6px 14px", borderRadius: 8, border: "1px solid var(--bl)", background: "var(--s)", color: "var(--t2)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
const btnPrimaryStyle = { padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--p)", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 };
