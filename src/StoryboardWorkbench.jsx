import { useState, useRef, useEffect } from "react";

const STYLES = [
  { id: "cinematic", label: "电影感", emoji: "🎬", color: "#7C3AED", bg: "linear-gradient(135deg,#7C3AED20,#8B5CF620)", desc: "大片级画面质感" },
  { id: "anime", label: "动漫风", emoji: "🎨", color: "#3B82F6", bg: "linear-gradient(135deg,#3B82F620,#60A5FA20)", desc: "日系动漫风格" },
  { id: "realistic", label: "写实", emoji: "📷", color: "#059669", bg: "linear-gradient(135deg,#05966920,#10B98120)", desc: "真实感画面" },
];

const HOOKS = [
  { id: "", label: "AI自动", icon: "🤖" },
  { id: "question", label: "提问式", icon: "❓" },
  { id: "shock", label: "震撼型", icon: "💥" },
  { id: "story", label: "故事型", icon: "📖" },
];

const PHASES = [
  { key: "generating", label: "构思分镜", icon: "✍️" },
  { key: "review", label: "审核调整", icon: "👁" },
  { key: "images", label: "图片生成", icon: "🖼" },
  { key: "producing", label: "视频合成", icon: "🎥" },
  { key: "done", label: "完成", icon: "🎉" },
];

const EXAMPLES = [
  { text: "新款口红试色，展示质地与持久度", icon: "💄" },
  { text: "智能手表户外运动场景展示", icon: "⌚" },
  { text: "家用咖啡机从开箱到冲泡全流程", icon: "☕" },
  { text: "护肤精华液吸收效果对比展示", icon: "✨" },
];

export default function StoryboardWorkbench() {
  const [step, setStep] = useState("input");
  const [input, setInput] = useState("");
  const [style, setStyle] = useState("cinematic");
  const [hookType, setHookType] = useState("");
  const [duration, setDuration] = useState(45);
  const [charDesc, setCharDesc] = useState("");
  const [productDetail, setProductDetail] = useState("");
  const [projectId, setProjectId] = useState("");
  const [frames, setFrames] = useState([]);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [costEstimate, setCostEstimate] = useState(null);
  const [feedbackMap, setFeedbackMap] = useState({});
  const [imgProgress, setImgProgress] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  const reset = () => {
    if (abortRef.current) abortRef.current.abort();
    if (timerRef.current) clearInterval(timerRef.current);
    setStep("input"); setInput(""); setFrames([]); setProgress(""); setError("");
    setVideoUrl(""); setProjectId(""); setCostEstimate(null); setFeedbackMap({});
    setImgProgress({}); setElapsed(0);
  };

  const fmtTime = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  const parseSSE = async (res, handlers) => {
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
        try { handlers(JSON.parse(line.slice(6))); } catch {}
      }
    }
  };

  const generateStoryboard = async () => {
    if (!input.trim()) return;
    setStep("generating"); setProgress("AI导演正在构思分镜...");
    setError(""); setFrames([]);
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    try {
      const res = await fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_input: input, style, hook_type: hookType || undefined, total_duration: duration, character_description: charDesc, product_detail: productDetail }),
      });
      await parseSSE(res, (d) => {
        const evt = d.event || d.type;
        if (evt === "started") { setProjectId(d.project_id || ""); setProgress(d.message || "开始..."); }
        else if (evt === "phase_complete") { setProgress(d.message || `${d.phase} 完成`); }
        else if (evt === "storyboard_ready") {
          setFrames((d.storyboard || d.frames || []).map((f, i) => ({ ...f, frame_id: f.frame_id ?? i, status: "pending" })));
          setStep("review"); setProgress("");
          clearInterval(timerRef.current);
          loadCostEstimate(d.project_id);
        }
        else if (evt === "error") { setError(d.message); setStep("input"); clearInterval(timerRef.current); }
      });
    } catch (e) { setError(e.message); setStep("input"); clearInterval(timerRef.current); }
  };

  const loadCostEstimate = async (pid) => {
    try {
      const r = await fetch(`/api/storyboard/${pid || projectId}/cost-estimate`);
      if (r.ok) setCostEstimate(await r.json());
    } catch {}
  };

  const approveFrame = (fid) => {
    setFrames(prev => prev.map(f => f.frame_id === fid ? { ...f, status: "approved" } : f));
    submitReview(fid, "approve");
  };

  const rejectFrame = (fid) => {
    const fb = feedbackMap[fid] || "";
    setFrames(prev => prev.map(f => f.frame_id === fid ? { ...f, status: "rejected" } : f));
    submitReview(fid, "reject", fb);
  };

  const submitReview = async (fid, action, feedback) => {
    try {
      await fetch(`/api/storyboard/${projectId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviews: [{ frame_id: fid, action, feedback }] }),
      });
    } catch {}
  };

  const regenFrame = async (fid) => {
    const fb = feedbackMap[fid] || "";
    setFrames(prev => prev.map(f => f.frame_id === fid ? { ...f, status: "regenerating" } : f));
    try {
      const r = await fetch(`/api/storyboard/${projectId}/regenerate-frame/${fid}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: fb }),
      });
      if (r.ok) {
        const d = await r.json();
        setFrames(prev => prev.map(f => f.frame_id === fid ? { ...d, frame_id: fid, status: "pending" } : f));
      }
    } catch {}
  };

  const generateImages = async () => {
    setStep("images"); setProgress("生成关键帧图片...");
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    try {
      const res = await fetch(`/api/storyboard/${projectId}/generate-images`, { method: "POST" });
      await parseSSE(res, (d) => {
        if (d.frame_id !== undefined) {
          setImgProgress(prev => ({ ...prev, [d.frame_id]: d.status || "done" }));
          if (d.image_url) {
            setFrames(prev => prev.map(f => f.frame_id === d.frame_id ? { ...f, image_url: d.image_url } : f));
          }
        }
        if (d.message) setProgress(d.message);
        if (d.event === "done" || d.type === "done") { setStep("review"); setProgress("图片生成完成"); clearInterval(timerRef.current); }
      });
    } catch (e) { setError(e.message); clearInterval(timerRef.current); }
  };

  const produceVideo = async () => {
    setStep("producing"); setProgress("合成最终视频...");
    const t0 = Date.now();
    timerRef.current = setInterval(() => setElapsed(Math.round((Date.now() - t0) / 1000)), 1000);
    try {
      const res = await fetch(`/api/storyboard/${projectId}/produce`, { method: "POST" });
      await parseSSE(res, (d) => {
        if (d.message) setProgress(d.message);
        if (d.event === "done" || d.type === "done") { setVideoUrl(d.video_url || ""); setStep("done"); clearInterval(timerRef.current); }
        if (d.event === "error") { setError(d.message); setStep("review"); clearInterval(timerRef.current); }
      });
    } catch (e) { setError(e.message); setStep("review"); clearInterval(timerRef.current); }
  };

  const allApproved = frames.length > 0 && frames.every(f => f.status === "approved");
  const hasImages = frames.some(f => f.image_url);
  const phaseIdx = PHASES.findIndex(p => p.key === step);
  const isWorking = step === "generating" || step === "images" || step === "producing";
  const activeStyle = STYLES.find(s => s.id === style);
  const approvedCount = frames.filter(f => f.status === "approved").length;
  const durationPct = ((duration - 15) / (120 - 15)) * 100;

  return (<>
    <style>{CSS}</style>
    <div className="sw-wrap">

      {/* ===== HERO BANNER ===== */}
      <div className="sw-hero">
        <div className="sw-hero-orb sw-hero-orb1" />
        <div className="sw-hero-orb sw-hero-orb2" />
        <div className="sw-hero-orb sw-hero-orb3" />
        <div className="sw-hero-content">
          <div className="sw-hero-left">
            <div className="sw-hero-badge">AI Storyboard</div>
            <h1 className="sw-hero-title">AI卖货分镜工作台</h1>
            <p className="sw-hero-desc">多Agent协作驱动 · 智能分镜编排 · 一键合成视频</p>
          </div>
          <div className="sw-hero-right">
            {isWorking && <span className="sw-timer">⏱ {fmtTime(elapsed)}</span>}
            {step !== "input" && <button className="sw-btn ghost-light" onClick={reset}>↻ 重新开始</button>}
          </div>
        </div>
      </div>

      {/* ===== PHASE STEPS ===== */}
      {step !== "input" && step !== "done" && (
        <div className="sw-phases">
          {PHASES.map((ph, i) => (
            <div key={ph.key} className={`sw-phase ${i < phaseIdx ? "done" : i === phaseIdx ? "on" : ""}`}>
              <div className="sw-phase-dot">{i < phaseIdx ? "✓" : ph.icon}</div>
              <span className="sw-phase-label">{ph.label}</span>
              {i < PHASES.length - 1 && <div className={`sw-phase-line ${i < phaseIdx ? "done" : ""}`} />}
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="sw-error">
          <span>⚠️ {error}</span>
          <button onClick={() => setError("")} className="sw-error-x">✕</button>
        </div>
      )}

      {/* ========== INPUT STEP ========== */}
      {step === "input" && (
        <div className="sw-input-layout">
          {/* Left column */}
          <div className="sw-col-main">
            {/* Story textarea */}
            <div className="sw-panel">
              <div className="sw-panel-hd">
                <div className="sw-panel-icon purple">💡</div>
                <div className="sw-panel-title">产品 / 故事描述</div>
                <span className="sw-counter" data-warn={input.length > 180 ? "" : undefined}>{input.length}/200</span>
              </div>
              <textarea className="sw-textarea" value={input} onChange={e => setInput(e.target.value)}
                maxLength={200} rows={4} placeholder="描述你要卖的产品或想表达的故事，AI将自动拆解为专业分镜脚本..." />
              <div className="sw-quick">
                <span className="sw-quick-label">✨ 灵感速填</span>
                {EXAMPLES.map((ex, i) => (
                  <button key={i} className="sw-quick-tag" onClick={() => setInput(ex.text)}>
                    {ex.icon} {ex.text.slice(0, 12)}...
                  </button>
                ))}
              </div>
            </div>

            {/* Detail fields */}
            <div className="sw-fields">
              <div className="sw-field">
                <div className="sw-field-hd">
                  <span>🎭 角色描述</span>
                  <span className="sw-field-opt">可选</span>
                </div>
                <input value={charDesc} onChange={e => setCharDesc(e.target.value)}
                  placeholder="如：25岁女性，穿白色连衣裙..." className="sw-ipt" />
              </div>
              <div className="sw-field">
                <div className="sw-field-hd">
                  <span>📦 产品详情</span>
                  <span className="sw-field-opt">可选</span>
                </div>
                <input value={productDetail} onChange={e => setProductDetail(e.target.value)}
                  placeholder="产品卖点、价格等..." className="sw-ipt" />
              </div>
            </div>

            {/* CTA */}
            <button className="sw-cta" onClick={generateStoryboard} disabled={!input.trim()}>
              <span className="sw-cta-shine" />
              <span className="sw-cta-inner">
                <span className="sw-cta-icon">✨</span>
                <span>AI智能生成分镜</span>
              </span>
            </button>
          </div>

          {/* Right column */}
          <div className="sw-col-side">
            {/* Visual Style */}
            <div className="sw-panel compact">
              <div className="sw-panel-hd">
                <div className="sw-panel-icon blue">🎨</div>
                <div className="sw-panel-title">视觉风格</div>
              </div>
              <div className="sw-style-list">
                {STYLES.map(s => (
                  <div key={s.id} className={`sw-sty ${style === s.id ? "on" : ""}`}
                    onClick={() => setStyle(s.id)} style={{ "--sc": s.color, "--sbg": s.bg }}>
                    <div className="sw-sty-dot" />
                    <div className="sw-sty-info">
                      <span className="sw-sty-name">{s.emoji} {s.label}</span>
                      <span className="sw-sty-desc">{s.desc}</span>
                    </div>
                    {style === s.id && <div className="sw-sty-check">✓</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="sw-panel compact">
              <div className="sw-panel-hd">
                <div className="sw-panel-icon green">⏱</div>
                <div className="sw-panel-title">视频时长</div>
                <span className="sw-dur-num">{duration}<small>秒</small></span>
              </div>
              <div className="sw-slider-track">
                <div className="sw-slider-fill" style={{ width: `${durationPct}%` }} />
                <input type="range" min={15} max={120} value={duration} onChange={e => setDuration(+e.target.value)} className="sw-slider" />
              </div>
              <div className="sw-slider-labels">
                <span className={duration <= 30 ? "on" : ""}>短视频 15-30s</span>
                <span className={duration > 30 && duration <= 75 ? "on" : ""}>中视频 30-75s</span>
                <span className={duration > 75 ? "on" : ""}>长视频 75-120s</span>
              </div>
            </div>

            {/* Hook type */}
            <div className="sw-panel compact">
              <div className="sw-panel-hd">
                <div className="sw-panel-icon orange">🪝</div>
                <div className="sw-panel-title">开场钩子</div>
              </div>
              <div className="sw-hook-grid">
                {HOOKS.map(h => (
                  <button key={h.id} className={`sw-hk ${hookType === h.id ? "on" : ""}`}
                    onClick={() => setHookType(h.id)}>
                    <span className="sw-hk-icon">{h.icon}</span>
                    <span className="sw-hk-label">{h.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== GENERATING ========== */}
      {step === "generating" && (
        <div className="sw-gen-wrap">
          <div className="sw-gen-card">
            <div className="sw-gen-bg" />
            <div className="sw-gen-rings">
              <div className="sw-gen-ring r1" />
              <div className="sw-gen-ring r2" />
              <div className="sw-gen-ring r3" />
            </div>
            <div className="sw-gen-emoji">🎬</div>
            <div className="sw-gen-msg">{progress || "AI正在创作中..."}</div>
            <div className="sw-gen-agents">
              {["🎬 导演","✍️ 编剧","🎞 制片"].map((a, i) => (
                <span key={i} className={`sw-ga ${i === 0 ? "on" : ""}`}>{a}</span>
              ))}
            </div>
            <div className="sw-gen-bar"><div className="sw-gen-bar-fill" /></div>
          </div>
        </div>
      )}

      {/* ========== REVIEW / IMAGES ========== */}
      {(step === "review" || step === "images") && (
        <div className="sw-review-sec">
          {/* Sticky toolbar */}
          <div className="sw-tb">
            <div className="sw-tb-left">
              <div className="sw-tb-stat">
                <span className="sw-tb-num">{frames.length}</span>
                <span className="sw-tb-lbl">场景</span>
              </div>
              <div className="sw-tb-divider" />
              <div className="sw-tb-progress-wrap">
                <div className="sw-tb-ring">
                  <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--s3)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--g)" strokeWidth="3"
                      strokeDasharray={`${(approvedCount / Math.max(frames.length, 1)) * 100} 100`}
                      strokeLinecap="round" transform="rotate(-90 18 18)" />
                  </svg>
                  <span className="sw-tb-ring-num">{approvedCount}</span>
                </div>
                <span className="sw-tb-lbl">已通过</span>
              </div>
              {costEstimate && (<>
                <div className="sw-tb-divider" />
                <div className="sw-tb-cost">
                  <span className="sw-tb-cost-total">¥{costEstimate.total_cost?.toFixed(2)}</span>
                  <span className="sw-tb-lbl">图片¥{costEstimate.image_cost?.toFixed(2)} + 视频¥{costEstimate.video_cost?.toFixed(2)}</span>
                </div>
              </>)}
            </div>
            <div className="sw-tb-right">
              {step === "images" && <span className="sw-timer">⏱ {fmtTime(elapsed)}</span>}
              <button className={`sw-btn primary ${!allApproved ? "off" : ""}`}
                onClick={generateImages} disabled={!allApproved}>
                🖼 生成图片{!allApproved ? ` (${frames.length - approvedCount}待审)` : ""}
              </button>
              {hasImages && <button className="sw-btn primary" onClick={produceVideo}>🎥 合成视频</button>}
            </div>
          </div>

          {progress && <div className="sw-prog-bar"><div className="sw-prog-text">{progress}</div></div>}

          {/* Frame grid */}
          <div className="sw-grid">
            {frames.map((f) => (
              <div key={f.frame_id} className={`sw-frame ${f.status}`}>
                {/* Image area */}
                <div className="sw-frame-vis">
                  {f.image_url
                    ? <img src={f.image_url} alt="" className="sw-frame-img" />
                    : imgProgress[f.frame_id]
                      ? <div className="sw-frame-ph"><span className="sw-spin" /></div>
                      : <div className="sw-frame-ph"><span className="sw-frame-ph-n">#{f.frame_id + 1}</span></div>
                  }
                  <div className="sw-frame-top-bar">
                    <span className="sw-frame-num">场景 {f.frame_id + 1}</span>
                    <span className={`sw-badge ${f.status}`}>
                      {f.status === "approved" ? "✓ 通过" : f.status === "rejected" ? "✗ 拒绝" : f.status === "regenerating" ? "♻ 重生中" : "待审核"}
                    </span>
                  </div>
                  <div className="sw-frame-meta-bar">
                    <span>⏱ {f.duration || 5}s</span>
                    <span>📷 {f.camera || f.camera_direction || "自动"}</span>
                  </div>
                </div>

                {/* Text content */}
                <div className="sw-frame-content">
                  <p className="sw-frame-prompt">{f.visual_prompt || f.visual_description}</p>
                  <p className="sw-frame-narr">🎙 {f.narration}</p>

                  {f.status === "pending" && (
                    <div className="sw-frame-act">
                      <input placeholder="修改建议 (可选)" value={feedbackMap[f.frame_id] || ""}
                        onChange={e => setFeedbackMap(prev => ({ ...prev, [f.frame_id]: e.target.value }))}
                        className="sw-ipt sm" />
                      <div className="sw-frame-btns">
                        <button className="sw-abtn ok" onClick={() => approveFrame(f.frame_id)}>
                          <span>✓</span> 通过
                        </button>
                        <button className="sw-abtn no" onClick={() => rejectFrame(f.frame_id)}>
                          <span>✗</span> 拒绝
                        </button>
                        <button className="sw-abtn re" onClick={() => regenFrame(f.frame_id)}>
                          <span>♻</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========== PRODUCING ========== */}
      {step === "producing" && (
        <div className="sw-gen-wrap">
          <div className="sw-gen-card">
            <div className="sw-gen-bg" />
            <div className="sw-gen-rings">
              <div className="sw-gen-ring r1" />
              <div className="sw-gen-ring r2" />
            </div>
            <div className="sw-gen-emoji">🎥</div>
            <div className="sw-gen-msg">{progress || "合成中..."}</div>
            <div className="sw-gen-sub">⏱ {fmtTime(elapsed)}</div>
            <div className="sw-gen-bar"><div className="sw-gen-bar-fill" /></div>
          </div>
        </div>
      )}

      {/* ========== DONE ========== */}
      {step === "done" && videoUrl && (
        <div className="sw-done-wrap">
          <div className="sw-done-card">
            <div className="sw-done-glow" />
            <div className="sw-done-header">
              <span className="sw-done-icon">🎉</span>
              <span>分镜视频已完成</span>
            </div>
            <div className="sw-done-player">
              <video src={videoUrl} controls className="sw-video" />
            </div>
            <div className="sw-done-info">
              <div className="sw-done-meta">
                <div className="sw-done-chip">🎨 {activeStyle?.label || style}</div>
                <div className="sw-done-chip">⏱ {duration}秒</div>
                <div className="sw-done-chip">🎬 {frames.length} 场景</div>
              </div>
              <div className="sw-done-btns">
                <a href={videoUrl} download className="sw-btn primary lg">⬇ 下载视频</a>
                <button className="sw-btn ghost lg" onClick={reset}>✨ 创建新分镜</button>
              </div>
            </div>
          </div>
          {/* Scene thumbnails strip */}
          {frames.some(f => f.image_url) && (
            <div className="sw-done-strip">
              <div className="sw-done-strip-title">场景一览</div>
              <div className="sw-done-strip-scroll">
                {frames.filter(f => f.image_url).map(f => (
                  <div key={f.frame_id} className="sw-done-thumb">
                    <img src={f.image_url} alt="" />
                    <span>#{f.frame_id + 1}</span>
                  </div>
                ))}
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
.sw-wrap{padding:0;height:calc(100vh - 52px);overflow-y:auto;overflow-x:hidden}
.sw-wrap::-webkit-scrollbar{width:5px}
.sw-wrap::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}

/* ===== HERO BANNER ===== */
.sw-hero{position:relative;padding:20px 28px;background:linear-gradient(135deg,#7C3AED 0%,#6D28D9 40%,#4C1D95 100%);overflow:hidden;margin:0}
.sw-hero-orb{position:absolute;border-radius:50%;filter:blur(50px);opacity:.3;pointer-events:none}
.sw-hero-orb1{width:200px;height:200px;background:#A78BFA;top:-60px;right:10%;animation:swFloat 8s ease-in-out infinite}
.sw-hero-orb2{width:140px;height:140px;background:#C084FC;bottom:-40px;left:5%;animation:swFloat 6s ease-in-out infinite 1s}
.sw-hero-orb3{width:100px;height:100px;background:#818CF8;top:10px;right:30%;animation:swFloat 10s ease-in-out infinite 2s}
@keyframes swFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-15px)}}
.sw-hero-content{position:relative;display:flex;align-items:center;justify-content:space-between;z-index:1}
.sw-hero-left{display:flex;flex-direction:column;gap:4px}
.sw-hero-badge{display:inline-flex;align-self:flex-start;padding:3px 10px;border-radius:5px;background:rgba(255,255,255,.15);color:rgba(255,255,255,.85);font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.1)}
.sw-hero-title{margin:4px 0 0;font-size:22px;font-weight:900;color:#fff;letter-spacing:-.5px}
.sw-hero-desc{margin:0;font-size:12px;color:rgba(255,255,255,.7);font-weight:400}
.sw-hero-right{display:flex;align-items:center;gap:8px}
.sw-timer{font-size:11px;color:#fff;font-weight:600;padding:4px 10px;background:rgba(255,255,255,.15);border-radius:6px;backdrop-filter:blur(8px)}

/* ===== BUTTONS ===== */
.sw-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:8px 18px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all .2s;text-decoration:none;white-space:nowrap}
.sw-btn.primary{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;box-shadow:0 2px 12px rgba(124,58,237,.2)}
.sw-btn.primary:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(124,58,237,.3)}
.sw-btn.primary:disabled,.sw-btn.primary.off{opacity:.45;cursor:default;transform:none}
.sw-btn.primary.lg{padding:10px 24px;font-size:13px}
.sw-btn.ghost{background:var(--s);color:var(--t2);border:1.5px solid var(--bl)}
.sw-btn.ghost:hover{border-color:var(--pl);color:var(--p)}
.sw-btn.ghost.lg{padding:10px 24px;font-size:13px}
.sw-btn.ghost-light{padding:6px 14px;border-radius:8px;background:rgba(255,255,255,.12);color:rgba(255,255,255,.9);font-size:11px;font-weight:600;cursor:pointer;border:1px solid rgba(255,255,255,.15);backdrop-filter:blur(8px);font-family:inherit;transition:all .2s}
.sw-btn.ghost-light:hover{background:rgba(255,255,255,.2)}

/* ===== INPUT LAYOUT ===== */
.sw-input-layout{display:grid;grid-template-columns:1fr 300px;gap:16px;padding:20px 28px}

.sw-col-main{display:flex;flex-direction:column;gap:14px}
.sw-col-side{display:flex;flex-direction:column;gap:12px}

/* Panel */
.sw-panel{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:18px;position:relative;transition:box-shadow .25s}
.sw-panel:hover{box-shadow:0 4px 20px rgba(0,0,0,.04)}
.sw-panel.compact{padding:14px 16px}
.sw-panel-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.sw-panel-icon{width:28px;height:28px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.sw-panel-icon.purple{background:linear-gradient(135deg,#F5F0FF,#EDE9FE)}
.sw-panel-icon.blue{background:linear-gradient(135deg,#EFF6FF,#DBEAFE)}
.sw-panel-icon.green{background:linear-gradient(135deg,#ECFDF5,#D1FAE5)}
.sw-panel-icon.orange{background:linear-gradient(135deg,#FFF7ED,#FFEDD5)}
.sw-panel-title{font-size:13px;font-weight:700;color:var(--t1)}
.sw-counter{margin-left:auto;font-size:10px;color:var(--t3);font-weight:500}
.sw-counter[data-warn]{color:var(--r)}

/* Textarea */
.sw-textarea{width:100%;padding:12px 14px;border:1.5px solid var(--bl);border-radius:10px;font-size:13px;font-family:inherit;color:var(--t1);background:var(--s2);resize:vertical;transition:all .2s;box-sizing:border-box;line-height:1.65}
.sw-textarea:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px rgba(124,58,237,.08);background:var(--s)}
.sw-textarea::placeholder{color:var(--t3)}

/* Quick fill */
.sw-quick{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;padding-top:10px;border-top:1px dashed var(--bl)}
.sw-quick-label{font-size:10px;color:var(--t3);font-weight:600}
.sw-quick-tag{padding:4px 10px;border-radius:6px;border:1px solid var(--bl);background:var(--s);font-size:10px;color:var(--t2);cursor:pointer;font-family:inherit;transition:all .15s;display:inline-flex;gap:3px;align-items:center}
.sw-quick-tag:hover{border-color:var(--p);color:var(--p);background:var(--pbg);transform:translateY(-1px)}

/* Fields row */
.sw-fields{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.sw-field{background:var(--s);border:1px solid var(--bl);border-radius:10px;padding:12px 14px}
.sw-field-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;font-size:11px;font-weight:600;color:var(--t2)}
.sw-field-opt{font-size:9px;color:var(--t3);background:var(--s3);padding:2px 6px;border-radius:4px}

/* Input */
.sw-ipt{width:100%;padding:8px 10px;border:1.5px solid var(--bl);border-radius:8px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s2);transition:all .15s;box-sizing:border-box}
.sw-ipt:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px rgba(124,58,237,.06);background:var(--s)}
.sw-ipt::placeholder{color:var(--t3)}
.sw-ipt.sm{font-size:11px;padding:6px 8px;border-radius:6px;margin-bottom:6px}

/* CTA button */
.sw-cta{position:relative;width:100%;padding:14px;border-radius:12px;border:none;background:linear-gradient(135deg,#7C3AED,#6D28D9,#5B21B6);color:#fff;font-size:15px;font-weight:700;cursor:pointer;font-family:inherit;overflow:hidden;transition:all .25s;box-shadow:0 4px 20px rgba(124,58,237,.3)}
.sw-cta:hover{transform:translateY(-1px);box-shadow:0 6px 28px rgba(124,58,237,.4)}
.sw-cta:disabled{opacity:.5;cursor:default;transform:none}
.sw-cta-shine{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.1),transparent);animation:swShine 3s infinite}
@keyframes swShine{0%{left:-100%}100%{left:200%}}
.sw-cta-inner{position:relative;display:flex;align-items:center;justify-content:center;gap:8px}
.sw-cta-icon{display:inline-flex;width:24px;height:24px;border-radius:6px;background:rgba(255,255,255,.15);align-items:center;justify-content:center;font-size:13px}

/* Style list */
.sw-style-list{display:flex;flex-direction:column;gap:6px}
.sw-sty{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--bl);cursor:pointer;transition:all .2s;position:relative}
.sw-sty:hover{border-color:var(--sc);background:var(--sbg)}
.sw-sty.on{border-color:var(--sc);background:var(--sbg);box-shadow:0 2px 10px color-mix(in srgb,var(--sc) 15%,transparent)}
.sw-sty-dot{width:8px;height:8px;border-radius:50%;background:var(--sc);opacity:.4;flex-shrink:0;transition:all .2s}
.sw-sty.on .sw-sty-dot{opacity:1;box-shadow:0 0 0 3px color-mix(in srgb,var(--sc) 20%,transparent)}
.sw-sty-info{flex:1}
.sw-sty-name{font-size:12px;font-weight:700;color:var(--t1);display:block}
.sw-sty-desc{font-size:10px;color:var(--t3);display:block}
.sw-sty-check{width:18px;height:18px;border-radius:50%;background:var(--sc);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}

/* Duration slider */
.sw-dur-num{margin-left:auto;font-size:18px;font-weight:800;color:var(--p);line-height:1}
.sw-dur-num small{font-size:10px;font-weight:600;color:var(--t3);margin-left:1px}
.sw-slider-track{position:relative;height:6px;background:var(--s3);border-radius:3px;overflow:visible;margin:4px 0 8px}
.sw-slider-fill{position:absolute;top:0;left:0;height:100%;background:linear-gradient(90deg,var(--p),var(--pl));border-radius:3px;transition:width .1s;pointer-events:none}
.sw-slider{position:absolute;top:-7px;left:0;width:100%;height:20px;opacity:0;cursor:pointer;margin:0;z-index:2}
.sw-slider-labels{display:flex;gap:4px}
.sw-slider-labels span{flex:1;text-align:center;font-size:9px;color:var(--t3);padding:3px 0;border-radius:4px;transition:all .15s}
.sw-slider-labels span.on{color:var(--p);background:var(--pbg);font-weight:600}

/* Hook grid */
.sw-hook-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sw-hk{display:flex;flex-direction:column;align-items:center;gap:2px;padding:10px 6px;border-radius:10px;border:1.5px solid var(--bl);background:var(--s);cursor:pointer;font-family:inherit;transition:all .2s}
.sw-hk:hover{border-color:var(--pl);background:var(--pbg)}
.sw-hk.on{border-color:var(--p);background:var(--pbg);box-shadow:0 2px 8px rgba(124,58,237,.1)}
.sw-hk-icon{font-size:18px}
.sw-hk-label{font-size:10px;font-weight:600;color:var(--t2)}
.sw-hk.on .sw-hk-label{color:var(--p)}

/* ===== ERROR ===== */
.sw-error{margin:12px 28px 0;padding:10px 16px;border-radius:10px;background:linear-gradient(135deg,#FEF2F2,#FEE2E2);border:1px solid #FECACA;color:var(--r);font-size:12px;display:flex;align-items:center;justify-content:space-between}
.sw-error-x{background:none;border:none;color:var(--r);cursor:pointer;font-size:14px}

/* ===== PHASES ===== */
.sw-phases{display:flex;align-items:center;justify-content:center;gap:0;padding:14px 20px;margin:12px 28px 0;background:var(--s);border:1px solid var(--bl);border-radius:12px}
.sw-phase{display:flex;align-items:center;gap:5px}
.sw-phase-dot{width:30px;height:30px;border-radius:50%;border:2px solid var(--bl);display:flex;align-items:center;justify-content:center;font-size:13px;background:var(--s);transition:all .3s}
.sw-phase.done .sw-phase-dot{background:var(--g);border-color:var(--g);color:#fff;font-size:10px}
.sw-phase.on .sw-phase-dot{background:linear-gradient(135deg,var(--p),var(--pl));border-color:transparent;color:#fff;box-shadow:0 0 0 4px rgba(124,58,237,.12);animation:swPulse 2s infinite}
@keyframes swPulse{0%,100%{box-shadow:0 0 0 4px rgba(124,58,237,.12)}50%{box-shadow:0 0 0 8px rgba(124,58,237,.04)}}
.sw-phase-label{font-size:11px;font-weight:500;color:var(--t3)}
.sw-phase.done .sw-phase-label{color:var(--g);font-weight:600}
.sw-phase.on .sw-phase-label{color:var(--p);font-weight:700}
.sw-phase-line{width:36px;height:2px;background:var(--bl);margin:0 8px;border-radius:1px;transition:background .3s}
.sw-phase-line.done{background:var(--g)}

/* ===== GENERATING ===== */
.sw-gen-wrap{display:flex;justify-content:center;align-items:center;min-height:360px;padding:24px}
.sw-gen-card{position:relative;background:var(--s);border:1px solid var(--bl);border-radius:20px;padding:36px 48px;max-width:440px;width:100%;text-align:center;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,.04)}
.sw-gen-bg{position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,.03),rgba(139,92,246,.02));pointer-events:none}
.sw-gen-rings{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none}
.sw-gen-ring{position:absolute;border-radius:50%;border:1.5px solid rgba(124,58,237,.08);top:50%;left:50%;transform:translate(-50%,-50%)}
.sw-gen-ring.r1{width:120px;height:120px;animation:swRing 4s linear infinite}
.sw-gen-ring.r2{width:200px;height:200px;animation:swRing 6s linear infinite reverse}
.sw-gen-ring.r3{width:280px;height:280px;animation:swRing 8s linear infinite}
@keyframes swRing{from{transform:translate(-50%,-50%) rotate(0)}to{transform:translate(-50%,-50%) rotate(360deg)}}
.sw-gen-emoji{font-size:44px;margin-bottom:12px;position:relative;animation:swBounce 2s ease-in-out infinite}
@keyframes swBounce{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-6px) scale(1.05)}}
.sw-gen-msg{font-size:14px;font-weight:600;color:var(--t1);margin-bottom:8px;position:relative}
.sw-gen-sub{font-size:11px;color:var(--t3);margin-bottom:14px;position:relative}
.sw-gen-agents{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:16px;position:relative}
.sw-ga{font-size:11px;color:var(--t3);padding:5px 12px;background:var(--s2);border-radius:8px;border:1px solid var(--bl);transition:all .3s}
.sw-ga.on{color:var(--p);background:var(--pbg);border-color:rgba(124,58,237,.2);font-weight:700;box-shadow:0 2px 8px rgba(124,58,237,.1)}
.sw-gen-bar{height:4px;background:var(--s3);border-radius:2px;overflow:hidden;position:relative}
.sw-gen-bar-fill{height:100%;width:100%;background:linear-gradient(90deg,var(--p),var(--pl),#A78BFA,var(--p));border-radius:2px;background-size:300% 100%;animation:swShimmer 2s linear infinite}
@keyframes swShimmer{0%{background-position:300% 0}100%{background-position:0 0}}

/* ===== REVIEW SECTION ===== */
.sw-review-sec{padding:16px 28px}

/* Toolbar */
.sw-tb{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--s);border:1px solid var(--bl);border-radius:12px;margin-bottom:14px;flex-wrap:wrap;gap:8px}
.sw-tb-left{display:flex;align-items:center;gap:10px}
.sw-tb-stat{display:flex;align-items:baseline;gap:3px}
.sw-tb-num{font-size:20px;font-weight:800;color:var(--p)}
.sw-tb-lbl{font-size:10px;color:var(--t3)}
.sw-tb-divider{width:1px;height:24px;background:var(--bl)}
.sw-tb-progress-wrap{display:flex;align-items:center;gap:6px}
.sw-tb-ring{position:relative;width:32px;height:32px}
.sw-tb-ring svg{width:100%;height:100%;transform:rotate(0)}
.sw-tb-ring-num{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:var(--g)}
.sw-tb-cost{display:flex;flex-direction:column;gap:1px}
.sw-tb-cost-total{font-size:14px;font-weight:800;color:var(--p)}
.sw-tb-right{display:flex;align-items:center;gap:8px}

.sw-prog-bar{padding:6px 14px;background:linear-gradient(90deg,var(--pbg),rgba(237,233,254,.4));border-radius:8px;margin-bottom:12px;border-left:3px solid var(--p)}
.sw-prog-text{font-size:11px;color:var(--p);font-weight:500}

/* ===== FRAME GRID ===== */
.sw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}

.sw-frame{background:var(--s);border:1.5px solid var(--bl);border-radius:14px;overflow:hidden;transition:all .25s}
.sw-frame:hover{transform:translateY(-3px);box-shadow:0 8px 28px rgba(0,0,0,.06)}
.sw-frame.approved{border-color:#22c55e60;box-shadow:inset 0 0 0 1px #22c55e15}
.sw-frame.rejected{border-color:#EF444450}

.sw-frame-vis{position:relative;aspect-ratio:16/9;background:linear-gradient(145deg,var(--s3),var(--s2));overflow:hidden}
.sw-frame-img{width:100%;height:100%;object-fit:cover;transition:transform .3s}
.sw-frame:hover .sw-frame-img{transform:scale(1.03)}
.sw-frame-ph{display:flex;align-items:center;justify-content:center;width:100%;height:100%;background:linear-gradient(145deg,var(--s3),var(--s2))}
.sw-frame-ph-n{font-size:32px;font-weight:900;color:var(--bl)}
.sw-frame-top-bar{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;padding:8px 10px;background:linear-gradient(180deg,rgba(0,0,0,.35),transparent);pointer-events:none}
.sw-frame-num{font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.3)}
.sw-badge{font-size:9px;font-weight:600;padding:2px 8px;border-radius:5px;backdrop-filter:blur(6px)}
.sw-badge.pending{background:rgba(255,255,255,.75);color:var(--t3)}
.sw-badge.approved{background:rgba(34,197,94,.9);color:#fff}
.sw-badge.rejected{background:rgba(239,68,68,.9);color:#fff}
.sw-badge.regenerating{background:rgba(124,58,237,.9);color:#fff}
.sw-frame-meta-bar{position:absolute;bottom:0;left:0;right:0;display:flex;gap:10px;padding:6px 10px;background:linear-gradient(0deg,rgba(0,0,0,.4),transparent);font-size:9px;color:rgba(255,255,255,.85);font-weight:500}

.sw-frame-content{padding:10px 12px}
.sw-frame-prompt{font-size:11px;color:var(--t1);line-height:1.5;margin:0 0 4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sw-frame-narr{font-size:10px;color:var(--t2);font-style:italic;line-height:1.4;margin:0;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}

.sw-frame-act{margin-top:8px;padding-top:8px;border-top:1px dashed var(--bl)}
.sw-frame-btns{display:flex;gap:4px}
.sw-abtn{display:flex;align-items:center;justify-content:center;gap:3px;flex:1;padding:6px 0;border-radius:7px;border:1.5px solid var(--bl);background:var(--s);cursor:pointer;font-size:11px;font-weight:600;font-family:inherit;transition:all .15s}
.sw-abtn.ok{color:#16a34a;border-color:#86EFAC50}
.sw-abtn.ok:hover{background:#22c55e10;border-color:#22c55e;transform:translateY(-1px)}
.sw-abtn.no{color:var(--r);border-color:#FCA5A550}
.sw-abtn.no:hover{background:#EF444408;border-color:var(--r);transform:translateY(-1px)}
.sw-abtn.re{color:var(--p);border-color:rgba(124,58,237,.2);flex:0 0 36px}
.sw-abtn.re:hover{background:var(--pbg);border-color:var(--pl);transform:translateY(-1px)}

.sw-spin{display:inline-block;width:20px;height:20px;border:2.5px solid var(--bl);border-top-color:var(--p);border-radius:50%;animation:swSpin 1s linear infinite}
@keyframes swSpin{to{transform:rotate(360deg)}}

/* ===== DONE ===== */
.sw-done-wrap{padding:20px 28px;display:flex;flex-direction:column;gap:16px;align-items:center}
.sw-done-card{position:relative;background:var(--s);border:1px solid var(--bl);border-radius:18px;overflow:hidden;width:100%;max-width:640px;box-shadow:0 8px 40px rgba(0,0,0,.06)}
.sw-done-glow{position:absolute;top:-40px;left:50%;transform:translateX(-50%);width:300px;height:100px;background:linear-gradient(135deg,var(--p),var(--pl));opacity:.06;filter:blur(40px);border-radius:50%;pointer-events:none}
.sw-done-header{display:flex;align-items:center;justify-content:center;gap:8px;padding:14px;font-size:15px;font-weight:700;background:linear-gradient(135deg,#F5F0FF,#EDE9FE);position:relative}
.sw-done-icon{font-size:20px}
.sw-done-player{background:#000;aspect-ratio:16/9}
.sw-video{width:100%;height:100%;object-fit:contain}
.sw-done-info{padding:16px 20px}
.sw-done-meta{display:flex;gap:8px;margin-bottom:14px;flex-wrap:wrap}
.sw-done-chip{font-size:11px;padding:4px 10px;border-radius:6px;background:var(--s2);color:var(--t2);border:1px solid var(--bl);font-weight:500}
.sw-done-btns{display:flex;gap:10px}
.sw-done-btns .sw-btn{flex:1;justify-content:center}

.sw-done-strip{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:12px 16px;width:100%;max-width:640px}
.sw-done-strip-title{font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px}
.sw-done-strip-scroll{display:flex;gap:8px;overflow-x:auto;padding-bottom:4px}
.sw-done-strip-scroll::-webkit-scrollbar{height:3px}
.sw-done-strip-scroll::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.sw-done-thumb{flex-shrink:0;width:110px;border-radius:8px;overflow:hidden;position:relative;aspect-ratio:16/9;background:var(--s3)}
.sw-done-thumb img{width:100%;height:100%;object-fit:cover}
.sw-done-thumb span{position:absolute;bottom:4px;left:6px;font-size:10px;font-weight:700;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,.5)}

/* Responsive */
@media(max-width:820px){
  .sw-input-layout{grid-template-columns:1fr;padding:16px}
  .sw-hero{padding:16px}
  .sw-review-sec{padding:12px}
  .sw-done-wrap{padding:12px}
  .sw-grid{grid-template-columns:1fr 1fr}
}
@media(max-width:500px){
  .sw-grid{grid-template-columns:1fr}
  .sw-fields{grid-template-columns:1fr}
}
`;
