import { useState, useRef, useEffect } from "react";

const STYLES = [
  { id: "cinematic", label: "电影感", emoji: "🎬", color: "#7C3AED", bg: "linear-gradient(135deg,#7C3AED20,#8B5CF620)", desc: "好莱坞质感画面" },
  { id: "anime", label: "动漫风", emoji: "🎨", color: "#3B82F6", bg: "linear-gradient(135deg,#3B82F620,#60A5FA20)", desc: "日系唯美动漫" },
  { id: "watercolor", label: "水彩画", emoji: "🖌️", color: "#14B8A6", bg: "linear-gradient(135deg,#14B8A620,#2DD4BF20)", desc: "清新水彩风格" },
  { id: "pixel", label: "像素风", emoji: "👾", color: "#D97706", bg: "linear-gradient(135deg,#D9770620,#F59E0B20)", desc: "复古像素艺术" },
  { id: "dark", label: "暗黑系", emoji: "🌑", color: "#6366F1", bg: "linear-gradient(135deg,#6366F120,#818CF820)", desc: "暗黑史诗氛围" },
];

const EXAMPLES = [
  { text: "末日少年觉醒超能力，独自对抗入侵的暗影军团", icon: "⚡" },
  { text: "古代女将军在战场上以少胜多的传奇故事", icon: "⚔️" },
  { text: "一只流浪猫在城市中寻找温暖的家", icon: "🐱" },
  { text: "赛博朋克都市中AI觉醒自我意识的故事", icon: "🤖" },
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
  const imgCount = Object.keys(imageUrls).length;
  const totalScenes = storyboard?.scenes?.length || 0;

  return (<>
    <style>{CSS}</style>
    <div className="cd-wrap">

      {/* ===== HERO BANNER ===== */}
      <div className="cd-hero">
        <div className="cd-hero-orb cd-orb1" />
        <div className="cd-hero-orb cd-orb2" />
        <div className="cd-hero-orb cd-orb3" />
        <div className="cd-hero-content">
          <div className="cd-hero-left">
            <div className="cd-hero-badge">AI Comic Drama</div>
            <h1 className="cd-hero-title">AI漫剧一键生成</h1>
            <p className="cd-hero-desc">输入故事概念 · AI自动编剧 · 生成完整漫剧视频</p>
          </div>
          <div className="cd-hero-right">
            {generating && <span className="cd-timer">⏱ {fmtTime(elapsed)}</span>}
            {step !== "input" && step !== "error" && (
              <button className="cd-btn glass" onClick={reset}>↻ 重新开始</button>
            )}
          </div>
        </div>
      </div>

      {/* ===== PHASE STEPS ===== */}
      {generating && (
        <div className="cd-phases">
          {PHASES.map((ph, i) => (
            <div key={ph.key} className={`cd-phase ${i < phaseIdx ? "done" : i === phaseIdx ? "on" : ""}`}>
              <div className="cd-phase-dot">{i < phaseIdx ? "✓" : ph.icon}</div>
              <span className="cd-phase-label">{ph.label}</span>
              {i < PHASES.length - 1 && <div className={`cd-phase-line ${i < phaseIdx ? "done" : ""}`} />}
            </div>
          ))}
        </div>
      )}

      {/* ===== INPUT ===== */}
      {(step === "input" || step === "error") && (
        <div className="cd-input-layout">
          {/* Left: story + CTA */}
          <div className="cd-col-main">
            <div className="cd-panel">
              <div className="cd-panel-hd">
                <div className="cd-panel-icon purple">💡</div>
                <div className="cd-panel-title">故事概念</div>
                <span className="cd-counter" data-warn={input.length > 180 ? "" : undefined}>{input.length}/200</span>
              </div>
              <textarea className="cd-textarea" value={input} onChange={e => setInput(e.target.value)}
                maxLength={200} rows={4} placeholder="描述你的故事概念，AI将自动编写分镜脚本并生成漫剧视频..." />
              <div className="cd-quick">
                <span className="cd-quick-label">✨ 灵感速填</span>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} className="cd-quick-tag" onClick={() => setInput(ex.text)}>
                    {ex.icon} {ex.text.slice(0, 10)}...
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="cd-error">
                <span>⚠️ {error}</span>
                <button onClick={() => setError("")} className="cd-error-x">✕</button>
              </div>
            )}

            <button className="cd-cta" onClick={startGeneration} disabled={!input.trim() || generating}>
              <span className="cd-cta-shine" />
              <span className="cd-cta-inner">
                <span className="cd-cta-icon">✨</span>
                <span>开始生成漫剧</span>
              </span>
            </button>
          </div>

          {/* Right: style picker */}
          <div className="cd-col-side">
            <div className="cd-panel compact">
              <div className="cd-panel-hd">
                <div className="cd-panel-icon blue">🎨</div>
                <div className="cd-panel-title">视觉风格</div>
              </div>
              <div className="cd-style-list">
                {STYLES.map(s => (
                  <div key={s.id} className={`cd-sty ${style === s.id ? "on" : ""}`}
                    onClick={() => setStyle(s.id)} style={{ "--sc": s.color, "--sbg": s.bg }}>
                    <div className="cd-sty-emoji">{s.emoji}</div>
                    <div className="cd-sty-info">
                      <span className="cd-sty-name">{s.label}</span>
                      <span className="cd-sty-desc">{s.desc}</span>
                    </div>
                    {style === s.id && <div className="cd-sty-check">✓</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Info card */}
            <div className="cd-info-card">
              <div className="cd-info-title">漫剧生成流程</div>
              <div className="cd-info-steps">
                <div className="cd-info-step"><span className="cd-info-num">1</span><span>AI编写分镜脚本</span></div>
                <div className="cd-info-step"><span className="cd-info-num">2</span><span>生成每帧画面</span></div>
                <div className="cd-info-step"><span className="cd-info-num">3</span><span>视频渲染 + 配音</span></div>
                <div className="cd-info-step"><span className="cd-info-num">4</span><span>合成完整漫剧</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== GENERATING STATUS ===== */}
      {generating && (
        <div className="cd-gen-wrap">
          <div className="cd-gen-card">
            <div className="cd-gen-bg" />
            <div className="cd-gen-rings">
              <div className="cd-gen-ring r1" />
              <div className="cd-gen-ring r2" />
              <div className="cd-gen-ring r3" />
            </div>
            <div className="cd-gen-emoji">{PHASES[Math.max(0, phaseIdx)]?.icon || "🎬"}</div>
            <div className="cd-gen-msg">{progress || "AI正在创作中..."}</div>
            {totalScenes > 0 && (
              <div className="cd-gen-counter">已完成 {imgCount}/{totalScenes} 帧画面</div>
            )}
            <div className="cd-gen-bar">
              <div className="cd-gen-bar-fill" style={{ width: `${Math.max(5, (phaseIdx / (PHASES.length - 1)) * 100)}%` }} />
            </div>
          </div>
        </div>
      )}

      {/* ===== STORYBOARD ===== */}
      {storyboard && step !== "input" && (
        <div className="cd-sb-sec">
          <div className="cd-sb-hd">
            <div className="cd-sb-hd-left">
              <span className="cd-sb-badge">📖 分镜脚本</span>
              <span className="cd-sb-title">{storyboard.title}</span>
            </div>
            {storyboard.character && (
              <span className="cd-sb-char">🎭 {storyboard.character}</span>
            )}
          </div>
          <div className="cd-sb-grid">
            {(storyboard.scenes || []).map((sc, i) => (
              <div key={i} className="cd-scene">
                <div className="cd-scene-vis">
                  {imageUrls[sc.scene_id ?? i]
                    ? <img src={imageUrls[sc.scene_id ?? i]} alt="" className="cd-scene-img" />
                    : <div className="cd-scene-ph">{generating ? <span className="cd-spin" /> : <span className="cd-scene-ph-n">#{i + 1}</span>}</div>
                  }
                  <div className="cd-scene-top-bar">
                    <span className="cd-scene-num">场景 {i + 1}</span>
                    <span className="cd-scene-dur">{sc.duration || 5}s</span>
                  </div>
                  <div className="cd-scene-bot-bar">
                    <span>📷 {sc.camera}</span>
                    <span>🎭 {sc.mood}</span>
                  </div>
                </div>
                <div className="cd-scene-body">
                  <p className="cd-scene-visual">{sc.visual_prompt}</p>
                  <p className="cd-scene-narr">🎙 {sc.narration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== DONE ===== */}
      {step === "done" && videoUrl && (
        <div className="cd-done-wrap">
          <div className="cd-done-card">
            <div className="cd-done-glow" />
            <div className="cd-done-header">
              <span className="cd-done-icon">🎉</span>
              <span>漫剧生成完成</span>
            </div>
            <div className="cd-done-player">
              <video ref={videoRef} src={videoUrl} controls className="cd-video" />
            </div>
            <div className="cd-done-info">
              <div className="cd-done-title">{storyboard?.title || "AI漫剧"}</div>
              <div className="cd-done-meta">
                <div className="cd-done-chip">🎨 {activeStyle?.label}</div>
                <div className="cd-done-chip">⏱ {fmtTime(elapsed)}</div>
                <div className="cd-done-chip">🎬 {totalScenes} 场景</div>
              </div>
              <div className="cd-done-btns">
                <a href={videoUrl} download className="cd-btn primary lg">⬇ 下载视频</a>
                <button className="cd-btn ghost lg" onClick={reset}>✨ 创建新漫剧</button>
              </div>
            </div>
          </div>
          {/* Scene thumbnails */}
          {Object.keys(imageUrls).length > 0 && (
            <div className="cd-done-strip">
              <div className="cd-done-strip-title">场景一览</div>
              <div className="cd-done-strip-scroll">
                {(storyboard?.scenes || []).map((sc, i) => {
                  const url = imageUrls[sc.scene_id ?? i];
                  return url ? (
                    <div key={i} className="cd-done-thumb">
                      <img src={url} alt="" />
                      <span>#{i + 1}</span>
                    </div>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  </>);
}

const CSS = `
/* ===== WRAPPER ===== */
.cd-wrap{padding:0;height:calc(100vh - 52px);overflow-y:auto;overflow-x:hidden}
.cd-wrap::-webkit-scrollbar{width:5px}
.cd-wrap::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}

/* ===== HERO BANNER ===== */
.cd-hero{position:relative;padding:20px 28px;background:linear-gradient(135deg,#4F46E5 0%,#6D28D9 40%,#7C3AED 100%);overflow:hidden}
.cd-hero-orb{position:absolute;border-radius:50%;filter:blur(50px);opacity:.3;pointer-events:none}
.cd-orb1{width:200px;height:200px;background:#A78BFA;top:-50px;right:12%;animation:cdFloat 8s ease-in-out infinite}
.cd-orb2{width:150px;height:150px;background:#C084FC;bottom:-50px;left:8%;animation:cdFloat 6s ease-in-out infinite 1s}
.cd-orb3{width:100px;height:100px;background:#818CF8;top:0;right:35%;animation:cdFloat 10s ease-in-out infinite 2s}
@keyframes cdFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
.cd-hero-content{position:relative;display:flex;align-items:center;justify-content:space-between;z-index:1}
.cd-hero-left{display:flex;flex-direction:column;gap:4px}
.cd-hero-badge{display:inline-flex;align-self:flex-start;padding:3px 10px;border-radius:5px;background:rgba(255,255,255,.15);color:rgba(255,255,255,.85);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1)}
.cd-hero-title{margin:4px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-.5px}
.cd-hero-desc{margin:0;font-size:12px;color:rgba(255,255,255,.7)}
.cd-hero-right{display:flex;align-items:center;gap:8px}
.cd-timer{font-size:11px;color:#fff;font-weight:600;padding:4px 10px;background:rgba(255,255,255,.15);border-radius:6px;backdrop-filter:blur(8px)}

/* ===== BUTTONS ===== */
.cd-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 18px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all .2s;text-decoration:none;white-space:nowrap}
.cd-btn.primary{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;box-shadow:0 2px 12px rgba(124,58,237,.2)}
.cd-btn.primary:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(124,58,237,.3)}
.cd-btn.primary:disabled{opacity:.5;cursor:default;transform:none}
.cd-btn.primary.lg{padding:10px 24px;font-size:13px}
.cd-btn.ghost{background:var(--s);color:var(--t2);border:1.5px solid var(--bl)}
.cd-btn.ghost:hover{border-color:var(--pl);color:var(--p)}
.cd-btn.ghost.lg{padding:10px 24px;font-size:13px}
.cd-btn.glass{padding:6px 14px;border-radius:8px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.9);font-size:11px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);font-family:inherit;transition:all .2s}
.cd-btn.glass:hover{background:rgba(255,255,255,.2)}

/* ===== INPUT LAYOUT ===== */
.cd-input-layout{display:grid;grid-template-columns:1fr 300px;gap:16px;padding:20px 28px}
.cd-col-main{display:flex;flex-direction:column;gap:14px}
.cd-col-side{display:flex;flex-direction:column;gap:12px}

/* Panel */
.cd-panel{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:18px;position:relative;transition:box-shadow .25s}
.cd-panel:hover{box-shadow:0 4px 20px rgba(0,0,0,.04)}
.cd-panel.compact{padding:14px 16px}
.cd-panel-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.cd-panel-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.cd-panel-icon.purple{background:linear-gradient(135deg,#F5F0FF,#EDE9FE)}
.cd-panel-icon.blue{background:linear-gradient(135deg,#EFF6FF,#DBEAFE)}
.cd-panel-title{font-size:13px;font-weight:700;color:var(--t1)}
.cd-counter{margin-left:auto;font-size:10px;color:var(--t3);font-weight:500}
.cd-counter[data-warn]{color:var(--r)}

/* Textarea */
.cd-textarea{width:100%;padding:12px 14px;border:1.5px solid var(--bl);border-radius:10px;font-size:13px;font-family:inherit;color:var(--t1);background:var(--s2);resize:vertical;transition:all .2s;box-sizing:border-box;line-height:1.65}
.cd-textarea:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px rgba(124,58,237,.08);background:var(--s)}
.cd-textarea::placeholder{color:var(--t3)}

/* Quick fill */
.cd-quick{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--bl)}
.cd-quick-label{font-size:10px;color:var(--t3);font-weight:600}
.cd-quick-tag{padding:4px 10px;border-radius:6px;border:1px solid var(--bl);background:var(--s);font-size:10px;color:var(--t2);cursor:pointer;font-family:inherit;transition:all .15s;display:inline-flex;gap:3px;align-items:center}
.cd-quick-tag:hover{border-color:var(--p);color:var(--p);background:var(--pbg);transform:translateY(-1px)}

/* CTA */
.cd-cta{position:relative;width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#6D28D9,#7C3AED,#4F46E5);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;overflow:hidden;transition:all .25s;box-shadow:0 4px 20px rgba(124,58,237,.3)}
.cd-cta:hover{transform:translateY(-1px);box-shadow:0 6px 28px rgba(124,58,237,.4)}
.cd-cta:disabled{opacity:.5;cursor:default;transform:none}
.cd-cta-shine{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);animation:cdShine 3s infinite}
@keyframes cdShine{0%{left:-100%}100%{left:200%}}
.cd-cta-inner{position:relative;display:flex;align-items:center;justify-content:center;gap:8px}
.cd-cta-icon{display:inline-flex;width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,.15);align-items:center;justify-content:center;font-size:13px}

/* Style list */
.cd-style-list{display:flex;flex-direction:column;gap:6px}
.cd-sty{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--bl);cursor:pointer;transition:all .2s;position:relative}
.cd-sty:hover{border-color:var(--sc);background:var(--sbg)}
.cd-sty.on{border-color:var(--sc);background:var(--sbg);box-shadow:0 2px 10px color-mix(in srgb,var(--sc) 15%,transparent)}
.cd-sty-emoji{font-size:20px;width:32px;height:32px;border-radius:8px;background:var(--s2);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.cd-sty.on .cd-sty-emoji{background:color-mix(in srgb,var(--sc) 15%,transparent)}
.cd-sty-info{flex:1}
.cd-sty-name{font-size:12px;font-weight:700;color:var(--t1);display:block}
.cd-sty-desc{font-size:10px;color:var(--t3);display:block}
.cd-sty-check{width:18px;height:18px;border-radius:50%;background:var(--sc);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}

/* Info card */
.cd-info-card{background:linear-gradient(135deg,#F5F0FF,#EDE9FE80);border:1px solid #E9D5FF40;border-radius:14px;padding:16px}
.cd-info-title{font-size:12px;font-weight:700;color:var(--p);margin-bottom:10px}
.cd-info-steps{display:flex;flex-direction:column;gap:8px}
.cd-info-step{display:flex;align-items:center;gap:10px;font-size:11px;color:var(--t2)}
.cd-info-num{width:20px;height:20px;border-radius:50%;background:var(--p);color:#fff;font-size:9px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0}

/* Error */
.cd-error{padding:10px 16px;border-radius:10px;background:linear-gradient(135deg,#FEF2F2,#FEE2E2);border:1px solid #FECACA;color:var(--r);font-size:12px;display:flex;align-items:center;justify-content:space-between}
.cd-error-x{background:none;border:none;color:var(--r);cursor:pointer;font-size:14px}

/* ===== PHASES ===== */
.cd-phases{display:flex;align-items:center;justify-content:center;gap:0;padding:14px 20px;margin:12px 28px 0;background:var(--s);border:1px solid var(--bl);border-radius:12px}
.cd-phase{display:flex;align-items:center;gap:5px}
.cd-phase-dot{width:30px;height:30px;border-radius:50%;border:2px solid var(--bl);display:flex;align-items:center;justify-content:center;font-size:13px;background:var(--s);transition:all .3s}
.cd-phase.done .cd-phase-dot{background:var(--g);border-color:var(--g);color:#fff;font-size:10px}
.cd-phase.on .cd-phase-dot{background:linear-gradient(135deg,var(--p),var(--pl));border-color:transparent;color:#fff;box-shadow:0 0 0 4px rgba(124,58,237,.12);animation:cdPulse 2s infinite}
@keyframes cdPulse{0%,100%{box-shadow:0 0 0 4px rgba(124,58,237,.12)}50%{box-shadow:0 0 0 8px rgba(124,58,237,.04)}}
.cd-phase-label{font-size:11px;font-weight:500;color:var(--t3)}
.cd-phase.done .cd-phase-label{color:var(--g);font-weight:600}
.cd-phase.on .cd-phase-label{color:var(--p);font-weight:700}
.cd-phase-line{width:36px;height:2px;background:var(--bl);margin:0 8px;border-radius:1px;transition:background .3s}
.cd-phase-line.done{background:var(--g)}

/* ===== GENERATING ===== */
.cd-gen-wrap{display:flex;justify-content:center;align-items:center;min-height:280px;padding:20px 28px}
.cd-gen-card{position:relative;background:var(--s);border:1px solid var(--bl);border-radius:20px;padding:32px 44px;max-width:440px;width:100%;text-align:center;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.04)}
.cd-gen-bg{position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,.03),rgba(79,70,229,.02));pointer-events:none}
.cd-gen-rings{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.cd-gen-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(124,58,237,.08);top:50%;left:50%;transform:translate(-50%,-50%)}
.cd-gen-ring.r1{width:120px;height:120px;animation:cdRing 4s linear infinite}
.cd-gen-ring.r2{width:200px;height:200px;animation:cdRing 6s linear infinite reverse}
.cd-gen-ring.r3{width:280px;height:280px;animation:cdRing 8s linear infinite}
@keyframes cdRing{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
.cd-gen-emoji{font-size:44px;margin-bottom:12px;position:relative;animation:cdBounce 2s ease-in-out infinite}
@keyframes cdBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.05)}}
.cd-gen-msg{font-size:14px;font-weight:600;color:var(--t1);margin-bottom:6px;position:relative}
.cd-gen-counter{font-size:11px;color:var(--p);font-weight:600;margin-bottom:12px;padding:3px 10px;background:var(--pbg);border-radius:5px;display:inline-block;position:relative}
.cd-gen-bar{height:5px;background:var(--s3);border-radius:3px;overflow:hidden;position:relative}
.cd-gen-bar-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--pl),#A78BFA,var(--p));border-radius:3px;transition:width 1s cubic-bezier(.4,0,.2,1);background-size:300% 100%;animation:cdShimmer 2s linear infinite}
@keyframes cdShimmer{0%{background-position:300% 0}100%{background-position:0 0}}

/* ===== STORYBOARD ===== */
.cd-sb-sec{padding:16px 28px}
.cd-sb-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;flex-wrap:wrap;gap:8px}
.cd-sb-hd-left{display:flex;align-items:center;gap:10px}
.cd-sb-badge{font-size:11px;font-weight:700;padding:4px 12px;background:var(--pbg);color:var(--p);border-radius:7px}
.cd-sb-title{font-size:16px;font-weight:800}
.cd-sb-char{font-size:11px;color:var(--t3);padding:4px 10px;background:var(--s);border:1px solid var(--bl);border-radius:7px}
.cd-sb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}

.cd-scene{background:var(--s);border:1.5px solid var(--bl);border-radius:14px;overflow:hidden;transition:all .25s}
.cd-scene:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.06)}

.cd-scene-vis{position:relative;aspect-ratio:16/9;background:linear-gradient(145deg,var(--s3),var(--s2));overflow:hidden}
.cd-scene-img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.cd-scene:hover .cd-scene-img{transform:scale(1.03)}
.cd-scene-ph{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
.cd-scene-ph-n{font-size:32px;font-weight:900;color:var(--bl)}
.cd-scene-top-bar{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:8px 10px;background:linear-gradient(180deg,rgba(0,0,0,.4),transparent);pointer-events:none}
.cd-scene-num{font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.3)}
.cd-scene-dur{font-size:10px;font-weight:600;color:rgba(255,255,255,.8)}
.cd-scene-bot-bar{position:absolute;bottom:0;left:0;right:0;display:flex;gap:10px;padding:6px 10px;background:linear-gradient(0deg,rgba(0,0,0,.4),transparent);font-size:9px;color:rgba(255,255,255,.85);font-weight:500}

.cd-scene-body{padding:10px 12px}
.cd-scene-visual{font-size:11px;color:var(--t1);line-height:1.5;margin:0 0 4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cd-scene-narr{font-size:10px;color:var(--t2);font-style:italic;line-height:1.4;margin:0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}

.cd-spin{display:inline-block;width:20px;height:20px;border:2.5px solid var(--bl);border-top-color:var(--p);border-radius:50%;animation:cdSpin 1s linear infinite}
@keyframes cdSpin{to{transform:rotate(360deg)}}

/* ===== DONE ===== */
.cd-done-wrap{padding:20px 28px;display:flex;flex-direction:column;gap:16px;align-items:center}
.cd-done-card{position:relative;background:var(--s);border:1px solid var(--bl);border-radius:18px;overflow:hidden;width:100%;max-width:640px;box-shadow:0 8px 40px rgba(0,0,0,.06)}
.cd-done-glow{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:300px;height:100px;background:linear-gradient(135deg,#4F46E5,var(--p));opacity:.06;filter:blur(40px);border-radius:50%;pointer-events:none}
.cd-done-header{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;font-size:15px;font-weight:700;background:linear-gradient(135deg,#F5F0FF,#EDE9FE);position:relative}
.cd-done-icon{font-size:20px}
.cd-done-player{background:#000;aspect-ratio:16/9}
.cd-video{width:100%;height:100%;object-fit:contain}
.cd-done-info{padding:16px 20px}
.cd-done-title{font-size:17px;font-weight:800;margin-bottom:6px}
.cd-done-meta{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.cd-done-chip{font-size:11px;padding:4px 10px;border-radius:6px;background:var(--s2);color:var(--t2);border:1px solid var(--bl);font-weight:500}
.cd-done-btns{display:flex;gap:10px}
.cd-done-btns .cd-btn{flex:1;justify-content:center}

.cd-done-strip{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:12px 16px;width:100%;max-width:640px}
.cd-done-strip-title{font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px}
.cd-done-strip-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.cd-done-strip-scroll::-webkit-scrollbar{height:3px}
.cd-done-strip-scroll::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.cd-done-thumb{flex-shrink:0;width:110px;border-radius:8px;overflow:hidden;position:relative;aspect-ratio:16/9;background:var(--s3)}
.cd-done-thumb img{width:100%;height:100%;object-fit:cover}
.cd-done-thumb span{position:absolute;bottom:4px;left:6px;font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}

/* Responsive */
@media(max-width:820px){
  .cd-input-layout{grid-template-columns:1fr;padding:16px}
  .cd-hero{padding:16px}
  .cd-sb-sec{padding:12px}
  .cd-done-wrap{padding:12px}
}
@media(max-width:500px){
  .cd-sb-grid{grid-template-columns:1fr}
}
`;
