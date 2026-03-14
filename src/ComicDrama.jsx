import { useState, useRef, useEffect } from "react";

const STYLES = [
  { id: "cinematic", label: "电影感", emoji: "🎬", color: "#7C3AED" },
  { id: "anime", label: "动漫风", emoji: "🎨", color: "#3B82F6" },
  { id: "watercolor", label: "水彩画", emoji: "🖌️", color: "#14B8A6" },
  { id: "pixel", label: "像素风", emoji: "👾", color: "#D97706" },
  { id: "dark", label: "暗黑系", emoji: "🌑", color: "#6366F1" },
];

const EXAMPLES = [
  "末日少年觉醒超能力，独自对抗入侵的暗影军团",
  "古代女将军在战场上以少胜多的传奇故事",
  "一只流浪猫在城市中寻找温暖的家",
  "赛博朋克都市中AI觉醒自我意识的故事",
];

const PHASES = [
  { key: "storyboard", label: "AI编剧", icon: "✍️" },
  { key: "images", label: "画面生成", icon: "🖼" },
  { key: "video_gen", label: "视频渲染", icon: "🎥" },
  { key: "composing", label: "合成输出", icon: "⚡" },
  { key: "done", label: "完成", icon: "🎉" },
];

export default function ComicDrama() {
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [generating, setGenerating] = useState(false);
  const [step, setStep] = useState("input");
  const [progress, setProgress] = useState("");
  const [storyboard, setStoryboard] = useState(null);
  const [imageUrls, setImageUrls] = useState({});
  const [videoUrl, setVideoUrl] = useState("");
  const [taskId, setTaskId] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState("");
  const timerRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const reset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setInput(""); setStyle("cinematic"); setGenerating(false); setStep("input");
    setProgress(""); setStoryboard(null); setImageUrls({}); setVideoUrl("");
    setTaskId(""); setElapsed(0); setError("");
  };

  const startGeneration = async () => {
    if (!input.trim()) return;
    setGenerating(true); setStep("storyboard"); setProgress("AI正在构思剧情...");
    setStoryboard(null); setImageUrls({}); setVideoUrl(""); setError("");
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    try {
      const res = await fetch("/api/comic-drama/generate", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input, style }),
      });
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      let buf = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += dec.decode(value, { stream: true });
        const lines = buf.split("\n"); buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const d = JSON.parse(line.slice(6));
            const evt = d.event || d.type;
            if (evt === "started") { setTaskId(d.task_id || ""); setProgress(d.message || ""); }
            else if (evt === "storyboard_ready") {
              setStoryboard({ title: d.title, character: d.character, scenes: d.scenes, bgm_style: d.bgm_style });
              setStep("images"); setProgress("分镜就绪，正在生成画面...");
            }
            else if (evt === "image_ready") { setImageUrls(prev => ({ ...prev, [d.scene_id]: d.image_url })); setProgress(d.message || ""); }
            else if (evt === "video_gen_start") { setStep("video_gen"); setProgress(d.message || "生成视频片段..."); }
            else if (evt === "video_gen_done") { setProgress(d.message || ""); }
            else if (evt === "composing") { setStep("composing"); setProgress(d.message || "最终合成中..."); }
            else if (evt === "done") {
              setStep("done"); setVideoUrl(d.video_url || ""); setGenerating(false);
              clearInterval(timerRef.current);
            }
            else if (evt === "error") { setStep("error"); setError(d.message || "生成失败"); setGenerating(false); clearInterval(timerRef.current); }
            else if (d.message) setProgress(d.message);
          } catch {}
        }
      }
    } catch (e) {
      if (e.name !== "AbortError") { setStep("error"); setError(e.message); setGenerating(false); clearInterval(timerRef.current); }
    }
  };

  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
  const phaseIdx = PHASES.findIndex(p => p.key === step);
  const activeStyle = STYLES.find(s => s.id === style);

  return (<>
    <style>{CSS}</style>
    <div className="cd-wrap">
      {/* Header */}
      <div className="cd-hd">
        <div className="cd-hd-l">
          <div className="cd-hd-ic">🎬</div>
          <div>
            <div className="cd-hd-t">AI漫剧一键生成</div>
            <div className="cd-hd-d">输入故事概念，AI自动生成完整漫剧视频</div>
          </div>
        </div>
        {step !== "input" && step !== "error" && (
          <div className="cd-hd-r">
            {generating && <span className="cd-timer">⏱ {fmtTime(elapsed)}</span>}
            <button className="cd-btn ghost" onClick={reset}>↻ 重新开始</button>
          </div>
        )}
      </div>

      {/* Phase progress */}
      {generating && (
        <div className="cd-phases">
          {PHASES.map((ph, i) => (
            <div key={ph.key} className={`cd-phase ${i < phaseIdx ? "done" : i === phaseIdx ? "on" : ""}`}>
              <div className="cd-phase-dot">{i < phaseIdx ? "✓" : ph.icon}</div>
              <span className="cd-phase-label">{ph.label}</span>
              {i < PHASES.length - 1 && <div className="cd-phase-line" />}
            </div>
          ))}
        </div>
      )}

      {/* Input section */}
      {(step === "input" || step === "error") && (
        <div className="cd-input-sec">
          <div className="cd-card cd-story-card">
            <div className="cd-card-hd">
              <span className="cd-card-ic">💡</span>
              <span className="cd-card-t">故事概念</span>
              <span className="cd-char-ct" style={{ color: input.length > 180 ? "var(--r)" : "var(--t3)" }}>{input.length}/200</span>
            </div>
            <textarea className="cd-textarea" value={input} onChange={e => setInput(e.target.value)}
              maxLength={200} rows={4} placeholder="描述你的故事概念，越具体效果越好..." />
            <div className="cd-examples">
              <span className="cd-examples-l">✨ 灵感速填</span>
              {EXAMPLES.map((ex, i) => (
                <button key={i} className="cd-example-tag" onClick={() => setInput(ex)}>{ex.slice(0, 12)}...</button>
              ))}
            </div>
          </div>

          <div className="cd-card">
            <div className="cd-card-hd">
              <span className="cd-card-ic">🎨</span>
              <span className="cd-card-t">视觉风格</span>
            </div>
            <div className="cd-styles">
              {STYLES.map(s => (
                <div key={s.id} className={`cd-style ${style === s.id ? "on" : ""}`} onClick={() => setStyle(s.id)}
                  style={{ "--sc": s.color }}>
                  <div className="cd-style-emoji">{s.emoji}</div>
                  <div className="cd-style-name">{s.label}</div>
                  {style === s.id && <div className="cd-style-check">✓</div>}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="cd-error">
              <span>⚠️ {error}</span>
              <button onClick={() => setError("")} className="cd-error-x">✕</button>
            </div>
          )}

          <button className="cd-btn primary full" onClick={startGeneration} disabled={!input.trim() || generating}>
            <span className="cd-btn-shine" />
            ✨ 开始生成漫剧
          </button>
        </div>
      )}

      {/* Generating progress */}
      {generating && (
        <div className="cd-gen-status">
          <div className="cd-gen-card">
            <div className="cd-gen-glow" style={{ background: activeStyle?.color || "var(--p)" }} />
            <div className="cd-gen-emoji">{PHASES[Math.max(0, phaseIdx)]?.icon || "🎬"}</div>
            <div className="cd-gen-msg">{progress || "处理中..."}</div>
            <div className="cd-gen-bar"><div className="cd-gen-bar-fill" style={{ width: `${Math.max(5, (phaseIdx / (PHASES.length - 1)) * 100)}%` }} /></div>
          </div>
        </div>
      )}

      {/* Storyboard display */}
      {storyboard && step !== "input" && (
        <div className="cd-sb">
          <div className="cd-sb-hd">
            <span className="cd-sb-badge">📖 分镜脚本</span>
            <span className="cd-sb-title">{storyboard.title}</span>
          </div>
          <div className="cd-sb-grid">
            {(storyboard.scenes || []).map((sc, i) => (
              <div key={i} className="cd-scene">
                <div className="cd-scene-top">
                  <span className="cd-scene-num">#{i + 1}</span>
                  <span className="cd-scene-dur">{sc.duration || 5}s</span>
                </div>
                <div className="cd-scene-img-wrap">
                  {imageUrls[sc.scene_id ?? i]
                    ? <img src={imageUrls[sc.scene_id ?? i]} alt="" className="cd-scene-img" />
                    : <div className="cd-scene-img-ph">{generating ? <span className="cd-spinner" /> : "🖼"}</div>
                  }
                </div>
                <div className="cd-scene-body">
                  <div className="cd-scene-visual">{sc.visual_prompt}</div>
                  <div className="cd-scene-narr">🎙 {sc.narration}</div>
                  <div className="cd-scene-meta">
                    <span>📷 {sc.camera}</span>
                    <span>🎭 {sc.mood}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Done */}
      {step === "done" && videoUrl && (
        <div className="cd-done">
          <div className="cd-done-card">
            <div className="cd-done-badge">🎉 漫剧生成完成</div>
            <div className="cd-done-player">
              <video ref={videoRef} src={videoUrl} controls className="cd-video" />
            </div>
            <div className="cd-done-info">
              <div className="cd-done-title">{storyboard?.title || "AI漫剧"}</div>
              <div className="cd-done-meta">
                <span>🎨 {STYLES.find(s => s.id === style)?.label}</span>
                <span>⏱ 生成用时 {fmtTime(elapsed)}</span>
                <span>🎬 {storyboard?.scenes?.length || 0} 个场景</span>
              </div>
              <div className="cd-done-acts">
                <a href={videoUrl} download className="cd-btn primary">⬇ 下载视频</a>
                <button className="cd-btn ghost" onClick={reset}>✨ 创建新漫剧</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  </>);
}

const CSS = `
.cd-wrap{padding:24px 32px;height:calc(100vh - 52px);overflow-y:auto}
.cd-wrap::-webkit-scrollbar{width:5px}.cd-wrap::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}

.cd-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
.cd-hd-l{display:flex;align-items:center;gap:14px}
.cd-hd-ic{width:42px;height:42px;border-radius:12px;background:linear-gradient(135deg,var(--pbg),#EDE9FE);display:flex;align-items:center;justify-content:center;font-size:20px}
.cd-hd-t{font-size:20px;font-weight:900;letter-spacing:-.3px}
.cd-hd-d{font-size:12px;color:var(--t3)}
.cd-hd-r{display:flex;align-items:center;gap:10px}
.cd-timer{font-size:12px;color:var(--p);font-weight:600;padding:4px 10px;background:var(--pbg);border-radius:6px}

.cd-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:10px 22px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all .2s ease;text-decoration:none;position:relative;overflow:hidden}
.cd-btn.primary{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;box-shadow:0 4px 14px rgba(124,58,237,.25)}
.cd-btn.primary:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.35)}
.cd-btn.primary:disabled{opacity:.5;cursor:default;transform:none}
.cd-btn.ghost{background:var(--s);color:var(--t2);border:1.5px solid var(--bl)}
.cd-btn.ghost:hover{border-color:var(--pl);color:var(--p)}
.cd-btn.full{width:100%;padding:14px;font-size:15px;font-weight:700}
.cd-btn-shine{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.15),transparent);animation:cdShine 3s infinite}
@keyframes cdShine{0%{left:-100%}100%{left:200%}}

.cd-input-sec{max-width:680px;margin:0 auto}

.cd-card{background:var(--s);border:1px solid var(--bl);border-radius:16px;padding:20px;margin-bottom:16px;transition:all .2s ease}
.cd-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.03)}
.cd-card-hd{display:flex;align-items:center;gap:8px;margin-bottom:14px}
.cd-card-ic{font-size:16px}
.cd-card-t{font-size:14px;font-weight:700}
.cd-char-ct{margin-left:auto;font-size:11px}

.cd-textarea{width:100%;padding:14px 16px;border:1.5px solid var(--bl);border-radius:12px;font-size:14px;font-family:inherit;color:var(--t1);background:var(--s2);resize:vertical;transition:all .2s ease;box-sizing:border-box;line-height:1.6}
.cd-textarea:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg);background:var(--s)}
.cd-textarea::placeholder{color:var(--t3)}

.cd-examples{display:flex;align-items:center;gap:8px;margin-top:12px;flex-wrap:wrap}
.cd-examples-l{font-size:11px;color:var(--t3);font-weight:600}
.cd-example-tag{padding:5px 12px;border-radius:8px;border:1px solid var(--bl);background:var(--s);font-size:11px;color:var(--t2);cursor:pointer;font-family:inherit;transition:all .2s ease}
.cd-example-tag:hover{border-color:var(--pl);color:var(--p);background:var(--pbg)}

.cd-styles{display:grid;grid-template-columns:repeat(5,1fr);gap:10px}
.cd-style{padding:14px 10px;border-radius:12px;border:2px solid var(--bl);cursor:pointer;text-align:center;transition:all .25s ease;position:relative}
.cd-style:hover{border-color:var(--sc);transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.06)}
.cd-style.on{border-color:var(--sc);background:color-mix(in srgb,var(--sc) 6%,transparent)}
.cd-style-emoji{font-size:24px;margin-bottom:6px}
.cd-style-name{font-size:12px;font-weight:600;color:var(--t1)}
.cd-style-check{position:absolute;top:6px;right:6px;width:18px;height:18px;border-radius:50%;background:var(--sc);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700}

.cd-error{padding:14px 18px;border-radius:12px;background:#FEF2F2;border:1px solid #FECACA;color:var(--r);font-size:13px;margin-bottom:16px;display:flex;align-items:center;justify-content:space-between}
.cd-error-x{background:none;border:none;color:var(--r);cursor:pointer;font-size:14px}

/* Phase progress */
.cd-phases{display:flex;align-items:center;justify-content:center;gap:0;padding:18px 20px;margin-bottom:20px;background:var(--s);border:1px solid var(--bl);border-radius:14px}
.cd-phase{display:flex;align-items:center;gap:6px}
.cd-phase-dot{width:32px;height:32px;border-radius:50%;border:2px solid var(--bl);display:flex;align-items:center;justify-content:center;font-size:14px;background:var(--s);transition:all .3s ease}
.cd-phase.done .cd-phase-dot{background:var(--g);border-color:var(--g);color:#fff;font-size:11px}
.cd-phase.on .cd-phase-dot{background:var(--p);border-color:var(--p);box-shadow:0 0 0 4px var(--pg);animation:cdPulse 2s infinite}
@keyframes cdPulse{0%,100%{box-shadow:0 0 0 4px var(--pg)}50%{box-shadow:0 0 0 8px rgba(124,58,237,.06)}}
.cd-phase-label{font-size:12px;font-weight:500;color:var(--t3)}
.cd-phase.done .cd-phase-label{color:var(--g)}.cd-phase.on .cd-phase-label{color:var(--p);font-weight:700}
.cd-phase-line{width:40px;height:2px;background:var(--bl);margin:0 8px;border-radius:1px}
.cd-phase.done+.cd-phase .cd-phase-line,.cd-phase.done .cd-phase-line{background:var(--g)}

/* Generating status */
.cd-gen-status{display:flex;justify-content:center;margin:20px 0}
.cd-gen-card{background:var(--s);border:1px solid var(--bl);border-radius:18px;padding:32px 40px;max-width:480px;width:100%;text-align:center;position:relative;overflow:hidden}
.cd-gen-glow{position:absolute;top:-80px;left:50%;transform:translateX(-50%);width:200px;height:200px;border-radius:50%;opacity:.08;filter:blur(40px)}
.cd-gen-emoji{font-size:48px;margin-bottom:14px;position:relative;animation:cdBounce 2s infinite}
@keyframes cdBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
.cd-gen-msg{font-size:14px;font-weight:600;color:var(--t1);margin-bottom:16px;position:relative}
.cd-gen-bar{height:6px;background:var(--s3);border-radius:3px;overflow:hidden;position:relative}
.cd-gen-bar-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--pl),#A78BFA);border-radius:3px;transition:width 1s cubic-bezier(.4,0,.2,1);background-size:200% 100%;animation:cdShimmer 1.5s linear infinite}
@keyframes cdShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* Storyboard */
.cd-sb{margin-top:20px}
.cd-sb-hd{display:flex;align-items:center;gap:12px;margin-bottom:16px}
.cd-sb-badge{font-size:12px;font-weight:700;padding:5px 12px;background:var(--pbg);color:var(--p);border-radius:8px}
.cd-sb-title{font-size:16px;font-weight:800}
.cd-sb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}

.cd-scene{background:var(--s);border:1px solid var(--bl);border-radius:14px;overflow:hidden;transition:all .25s ease}
.cd-scene:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.06);border-color:var(--pl)}
.cd-scene-top{display:flex;justify-content:space-between;align-items:center;padding:10px 14px 0}
.cd-scene-num{font-size:11px;font-weight:800;color:var(--p);background:var(--pbg);padding:2px 8px;border-radius:5px}
.cd-scene-dur{font-size:10px;color:var(--t3);font-weight:600}
.cd-scene-img-wrap{margin:10px;border-radius:10px;overflow:hidden;background:var(--s3);aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}
.cd-scene-img{width:100%;height:100%;object-fit:cover}
.cd-scene-img-ph{font-size:24px;color:var(--t3)}
.cd-scene-body{padding:0 14px 14px}
.cd-scene-visual{font-size:12px;color:var(--t1);line-height:1.5;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cd-scene-narr{font-size:11px;color:var(--t2);font-style:italic;line-height:1.5;margin-bottom:6px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cd-scene-meta{display:flex;gap:10px;font-size:10px;color:var(--t3)}

.cd-spinner{display:inline-block;width:20px;height:20px;border:2px solid var(--bl);border-top-color:var(--p);border-radius:50%;animation:cdSpin 1s linear infinite}
@keyframes cdSpin{to{transform:rotate(360deg)}}

/* Done */
.cd-done{display:flex;justify-content:center;padding:20px 0}
.cd-done-card{background:var(--s);border:1px solid var(--bl);border-radius:18px;overflow:hidden;width:100%;max-width:640px;box-shadow:0 8px 32px rgba(0,0,0,.06)}
.cd-done-badge{padding:12px 20px;font-size:14px;font-weight:700;text-align:center;background:linear-gradient(135deg,var(--pbg),#EDE9FE)}
.cd-done-player{background:#000;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}
.cd-video{width:100%;height:100%;object-fit:contain}
.cd-done-info{padding:20px 24px}
.cd-done-title{font-size:18px;font-weight:800;margin-bottom:6px}
.cd-done-meta{display:flex;gap:14px;font-size:12px;color:var(--t3);margin-bottom:18px}
.cd-done-acts{display:flex;gap:10px}
.cd-done-acts .cd-btn{flex:1;justify-content:center}
`;
