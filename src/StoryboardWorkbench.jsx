import { useState, useRef, useEffect } from "react";

const STYLES = [
  { id: "cinematic", label: "电影感", emoji: "🎬", color: "#7C3AED", desc: "大片级画面质感" },
  { id: "anime", label: "动漫风", emoji: "🎨", color: "#3B82F6", desc: "日系动漫风格" },
  { id: "realistic", label: "写实", emoji: "📷", color: "#059669", desc: "真实感画面" },
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
      {/* Header bar */}
      <div className="sw-topbar">
        <div className="sw-topbar-l">
          <div className="sw-logo">
            <span className="sw-logo-icon">🎬</span>
            <span className="sw-logo-text">AI分镜工作台</span>
          </div>
          <div className="sw-topbar-tags">
            <span className="sw-tag">多Agent协作</span>
            <span className="sw-tag">智能分镜</span>
            <span className="sw-tag">一键成片</span>
          </div>
        </div>
        <div className="sw-topbar-r">
          {isWorking && <span className="sw-timer">⏱ {fmtTime(elapsed)}</span>}
          {step !== "input" && <button className="sw-btn ghost sm" onClick={reset}>↻ 重来</button>}
        </div>
      </div>

      {/* Phase progress */}
      {step !== "input" && step !== "done" && (
        <div className="sw-phases">
          {PHASES.map((ph, i) => (
            <div key={ph.key} className={`sw-phase ${i < phaseIdx ? "done" : i === phaseIdx ? "on" : ""}`}>
              <div className="sw-phase-dot">{i < phaseIdx ? "✓" : ph.icon}</div>
              <span className="sw-phase-label">{ph.label}</span>
              {i < PHASES.length - 1 && <div className="sw-phase-line" />}
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
          {/* Left: main input */}
          <div className="sw-input-main">
            <div className="sw-card no-mb">
              <div className="sw-card-hd">
                <span className="sw-card-ic">💡</span>
                <span className="sw-card-t">产品 / 故事描述</span>
                <span className="sw-char-ct" style={{ color: input.length > 180 ? "var(--r)" : "var(--t3)" }}>{input.length}/200</span>
              </div>
              <textarea className="sw-textarea" value={input} onChange={e => setInput(e.target.value)}
                maxLength={200} rows={3} placeholder="描述你要卖的产品或想表达的故事..." />
              <div className="sw-examples">
                <span className="sw-examples-l">✨ 快速填入</span>
                <div className="sw-examples-list">
                  {EXAMPLES.map((ex, i) => (
                    <button key={i} className="sw-example-tag" onClick={() => setInput(ex.text)}>
                      <span>{ex.icon}</span> {ex.text.length > 14 ? ex.text.slice(0, 14) + "..." : ex.text}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Character & Product in one row */}
            <div className="sw-detail-row">
              <div className="sw-detail-item">
                <label className="sw-detail-label">🎭 角色描述 <span className="sw-opt-tag">可选</span></label>
                <input value={charDesc} onChange={e => setCharDesc(e.target.value)}
                  placeholder="如：25岁女性，穿白色连衣裙..." className="sw-input" />
              </div>
              <div className="sw-detail-item">
                <label className="sw-detail-label">📦 产品详情 <span className="sw-opt-tag">可选</span></label>
                <input value={productDetail} onChange={e => setProductDetail(e.target.value)}
                  placeholder="产品卖点、价格等..." className="sw-input" />
              </div>
            </div>

            <button className="sw-btn primary full" onClick={generateStoryboard} disabled={!input.trim()}>
              <span className="sw-btn-shine" />
              ✨ AI智能生成分镜
            </button>
          </div>

          {/* Right: settings sidebar */}
          <div className="sw-input-side">
            {/* Style */}
            <div className="sw-card no-mb">
              <div className="sw-card-hd compact">
                <span className="sw-card-ic">🎨</span>
                <span className="sw-card-t">视觉风格</span>
              </div>
              <div className="sw-styles-v">
                {STYLES.map(s => (
                  <div key={s.id} className={`sw-style-v ${style === s.id ? "on" : ""}`}
                    onClick={() => setStyle(s.id)} style={{ "--sc": s.color }}>
                    <span className="sw-style-v-emoji">{s.emoji}</span>
                    <div className="sw-style-v-info">
                      <div className="sw-style-v-name">{s.label}</div>
                      <div className="sw-style-v-desc">{s.desc}</div>
                    </div>
                    {style === s.id && <span className="sw-style-v-check">✓</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* Duration */}
            <div className="sw-card no-mb">
              <div className="sw-card-hd compact">
                <span className="sw-card-ic">⏱</span>
                <span className="sw-card-t">时长</span>
                <span className="sw-dur-val">{duration}s</span>
              </div>
              <div className="sw-range-wrap">
                <input type="range" min={15} max={120} value={duration} onChange={e => setDuration(+e.target.value)}
                  className="sw-range" />
                <div className="sw-range-bar">
                  <div className="sw-range-fill" style={{ width: `${durationPct}%` }} />
                </div>
              </div>
              <div className="sw-range-labels">
                <span>15s</span><span>60s</span><span>120s</span>
              </div>
            </div>

            {/* Hook */}
            <div className="sw-card no-mb">
              <div className="sw-card-hd compact">
                <span className="sw-card-ic">🪝</span>
                <span className="sw-card-t">开场钩子</span>
              </div>
              <div className="sw-hooks">
                {HOOKS.map(h => (
                  <button key={h.id} className={`sw-hook ${hookType === h.id ? "on" : ""}`}
                    onClick={() => setHookType(h.id)}>
                    <span className="sw-hook-icon">{h.icon}</span>
                    <span>{h.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========== GENERATING ========== */}
      {step === "generating" && (
        <div className="sw-gen-center">
          <div className="sw-gen-card">
            <div className="sw-gen-glow" />
            <div className="sw-gen-emoji">🎬</div>
            <div className="sw-gen-msg">{progress || "处理中..."}</div>
            <div className="sw-gen-agents">
              <span className="sw-agent on">🎬 导演</span>
              <span className="sw-agent-arrow">→</span>
              <span className="sw-agent">✍️ 编剧</span>
              <span className="sw-agent-arrow">→</span>
              <span className="sw-agent">🎞 制片</span>
            </div>
            <div className="sw-gen-bar"><div className="sw-gen-bar-fill" /></div>
          </div>
        </div>
      )}

      {/* ========== REVIEW / IMAGES ========== */}
      {(step === "review" || step === "images") && (
        <div className="sw-review">
          {/* Toolbar */}
          <div className="sw-toolbar">
            <div className="sw-toolbar-l">
              <span className="sw-toolbar-count">{frames.length} 场景</span>
              <div className="sw-toolbar-progress">
                <div className="sw-toolbar-bar">
                  <div className="sw-toolbar-bar-fill" style={{ width: `${(approvedCount / Math.max(frames.length, 1)) * 100}%` }} />
                </div>
                <span className="sw-toolbar-pct">{approvedCount}/{frames.length} 通过</span>
              </div>
              {costEstimate && (
                <div className="sw-toolbar-cost">
                  <span>💰 ¥{costEstimate.total_cost?.toFixed(2) || "?"}</span>
                  <span className="sw-toolbar-cost-d">图片 ¥{costEstimate.image_cost?.toFixed(2)} · 视频 ¥{costEstimate.video_cost?.toFixed(2)}</span>
                </div>
              )}
            </div>
            <div className="sw-toolbar-r">
              {step === "images" && <span className="sw-timer">⏱ {fmtTime(elapsed)}</span>}
              <button className={`sw-btn primary sm ${!allApproved ? "disabled" : ""}`}
                onClick={generateImages} disabled={!allApproved}>
                🖼 生成图片{!allApproved ? ` (${frames.length - approvedCount}待审)` : ""}
              </button>
              {hasImages && (
                <button className="sw-btn primary sm" onClick={produceVideo}>🎥 合成视频</button>
              )}
            </div>
          </div>

          {progress && <div className="sw-progress-msg">{progress}</div>}

          {/* Frame grid */}
          <div className="sw-grid">
            {frames.map((f) => (
              <div key={f.frame_id} className={`sw-frame ${f.status}`}>
                <div className="sw-frame-img-wrap">
                  {f.image_url
                    ? <img src={f.image_url} alt="" className="sw-frame-img" />
                    : imgProgress[f.frame_id]
                      ? <div className="sw-frame-img-ph"><span className="sw-spinner" /></div>
                      : <div className="sw-frame-img-ph"><span className="sw-frame-ph-num">#{f.frame_id + 1}</span></div>
                  }
                  <div className="sw-frame-overlay">
                    <span className="sw-frame-num">场景 {f.frame_id + 1}</span>
                    <span className={`sw-frame-badge ${f.status}`}>
                      {f.status === "approved" ? "✓ 通过" : f.status === "rejected" ? "✗ 拒绝" : f.status === "regenerating" ? "♻ 重生中" : "待审核"}
                    </span>
                  </div>
                </div>

                <div className="sw-frame-body">
                  <div className="sw-frame-visual">{f.visual_prompt || f.visual_description}</div>
                  <div className="sw-frame-narr">🎙 {f.narration}</div>
                  <div className="sw-frame-meta">
                    <span>⏱ {f.duration || 5}s</span>
                    <span>📷 {f.camera || f.camera_direction || "自动"}</span>
                  </div>

                  {f.status === "pending" && (
                    <div className="sw-frame-actions">
                      <input placeholder="修改建议..." value={feedbackMap[f.frame_id] || ""}
                        onChange={e => setFeedbackMap(prev => ({ ...prev, [f.frame_id]: e.target.value }))}
                        className="sw-input compact" />
                      <div className="sw-frame-btns">
                        <button className="sw-fbtn approve" onClick={() => approveFrame(f.frame_id)}>✓</button>
                        <button className="sw-fbtn reject" onClick={() => rejectFrame(f.frame_id)}>✗</button>
                        <button className="sw-fbtn regen" onClick={() => regenFrame(f.frame_id)}>♻</button>
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
        <div className="sw-gen-center">
          <div className="sw-gen-card">
            <div className="sw-gen-glow" />
            <div className="sw-gen-emoji">🎥</div>
            <div className="sw-gen-msg">{progress || "合成中..."}</div>
            <div className="sw-gen-sub">⏱ {fmtTime(elapsed)}</div>
            <div className="sw-gen-bar"><div className="sw-gen-bar-fill" /></div>
          </div>
        </div>
      )}

      {/* ========== DONE ========== */}
      {step === "done" && videoUrl && (
        <div className="sw-done-layout">
          <div className="sw-done-card">
            <div className="sw-done-badge">🎉 分镜视频已完成</div>
            <div className="sw-done-player">
              <video src={videoUrl} controls className="sw-video" />
            </div>
            <div className="sw-done-info">
              <div className="sw-done-title">AI卖货分镜</div>
              <div className="sw-done-meta">
                <span>🎨 {activeStyle?.label || style}</span>
                <span>⏱ {duration}秒</span>
                <span>🎬 {frames.length} 场景</span>
              </div>
              <div className="sw-done-acts">
                <a href={videoUrl} download className="sw-btn primary">⬇ 下载视频</a>
                <button className="sw-btn ghost" onClick={reset}>✨ 新分镜</button>
              </div>
            </div>
          </div>
          {/* Thumbnails sidebar */}
          {frames.some(f => f.image_url) && (
            <div className="sw-done-thumbs">
              <div className="sw-done-thumbs-title">场景一览</div>
              {frames.map(f => (
                <div key={f.frame_id} className="sw-done-thumb">
                  {f.image_url && <img src={f.image_url} alt="" />}
                  <div className="sw-done-thumb-info">
                    <span>#{f.frame_id + 1}</span>
                    <span>{f.duration || 5}s</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  </>);
}

const CSS = `
.sw-wrap{padding:16px 20px;height:calc(100vh - 52px);overflow-y:auto;background:var(--bg)}
.sw-wrap::-webkit-scrollbar{width:4px}.sw-wrap::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}

/* ===== Top bar ===== */
.sw-topbar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--s);border:1px solid var(--bl);border-radius:12px;margin-bottom:14px}
.sw-topbar-l{display:flex;align-items:center;gap:14px}
.sw-logo{display:flex;align-items:center;gap:8px}
.sw-logo-icon{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--p),var(--pl));display:flex;align-items:center;justify-content:center;font-size:16px;color:#fff;line-height:32px;text-align:center}
.sw-logo-text{font-size:15px;font-weight:800;letter-spacing:-.3px}
.sw-topbar-tags{display:flex;gap:6px}
.sw-tag{font-size:10px;color:var(--p);background:var(--pbg);padding:3px 8px;border-radius:4px;font-weight:600}
.sw-topbar-r{display:flex;align-items:center;gap:8px}
.sw-timer{font-size:11px;color:var(--p);font-weight:600;padding:3px 8px;background:var(--pbg);border-radius:5px}

/* ===== Buttons ===== */
.sw-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:9px 18px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:all .2s ease;text-decoration:none;position:relative;overflow:hidden}
.sw-btn.primary{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;box-shadow:0 2px 10px rgba(124,58,237,.2)}
.sw-btn.primary:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(124,58,237,.3)}
.sw-btn.primary:disabled,.sw-btn.primary.disabled{opacity:.5;cursor:default;transform:none}
.sw-btn.primary.sm{padding:7px 14px;font-size:12px;border-radius:8px}
.sw-btn.ghost{background:var(--s);color:var(--t2);border:1.5px solid var(--bl)}
.sw-btn.ghost:hover{border-color:var(--pl);color:var(--p)}
.sw-btn.ghost.sm{padding:5px 10px;font-size:11px;border-radius:7px}
.sw-btn.full{width:100%;padding:12px;font-size:14px;font-weight:700;border-radius:12px}
.sw-btn-shine{position:absolute;top:0;left:-100%;width:100%;height:100%;background:linear-gradient(90deg,transparent,rgba(255,255,255,.12),transparent);animation:swShine 3s infinite}
@keyframes swShine{0%{left:-100%}100%{left:200%}}

/* ===== Input layout: two columns ===== */
.sw-input-layout{display:grid;grid-template-columns:1fr 280px;gap:16px;align-items:start}

.sw-input-main{display:flex;flex-direction:column;gap:12px}
.sw-input-side{display:flex;flex-direction:column;gap:12px}

.sw-card{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:16px;transition:all .2s ease}
.sw-card:hover{box-shadow:0 2px 12px rgba(0,0,0,.03)}
.sw-card.no-mb{margin-bottom:0}
.sw-card-hd{display:flex;align-items:center;gap:7px;margin-bottom:12px}
.sw-card-hd.compact{margin-bottom:10px}
.sw-card-ic{font-size:14px}
.sw-card-t{font-size:13px;font-weight:700}
.sw-char-ct{margin-left:auto;font-size:10px}

/* Textarea */
.sw-textarea{width:100%;padding:12px 14px;border:1.5px solid var(--bl);border-radius:10px;font-size:13px;font-family:inherit;color:var(--t1);background:var(--s2);resize:vertical;transition:all .2s ease;box-sizing:border-box;line-height:1.6}
.sw-textarea:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg);background:var(--s)}
.sw-textarea::placeholder{color:var(--t3)}

/* Examples */
.sw-examples{margin-top:10px}
.sw-examples-l{font-size:10px;color:var(--t3);font-weight:600;display:block;margin-bottom:6px}
.sw-examples-list{display:flex;gap:6px;flex-wrap:wrap}
.sw-example-tag{padding:4px 10px;border-radius:7px;border:1px solid var(--bl);background:var(--s);font-size:10px;color:var(--t2);cursor:pointer;font-family:inherit;transition:all .15s ease;display:inline-flex;align-items:center;gap:4px}
.sw-example-tag:hover{border-color:var(--pl);color:var(--p);background:var(--pbg)}

/* Detail row */
.sw-detail-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
.sw-detail-item{background:var(--s);border:1px solid var(--bl);border-radius:10px;padding:10px 12px}
.sw-detail-label{font-size:11px;font-weight:600;color:var(--t2);display:flex;align-items:center;gap:4px;margin-bottom:6px}
.sw-opt-tag{font-size:9px;color:var(--t3);background:var(--s2);padding:1px 5px;border-radius:3px;font-weight:500}

/* Input */
.sw-input{width:100%;padding:8px 10px;border:1px solid var(--bl);border-radius:7px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s2);transition:all .15s ease;box-sizing:border-box}
.sw-input:focus{outline:none;border-color:var(--p);background:var(--s)}
.sw-input::placeholder{color:var(--t3)}
.sw-input.compact{font-size:11px;padding:6px 8px;border-radius:6px;margin-bottom:6px}

/* Styles vertical */
.sw-styles-v{display:flex;flex-direction:column;gap:6px}
.sw-style-v{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1.5px solid var(--bl);cursor:pointer;transition:all .2s ease;position:relative}
.sw-style-v:hover{border-color:var(--sc);background:color-mix(in srgb,var(--sc) 4%,transparent)}
.sw-style-v.on{border-color:var(--sc);background:color-mix(in srgb,var(--sc) 8%,transparent)}
.sw-style-v-emoji{font-size:20px;width:32px;height:32px;border-radius:8px;background:var(--s2);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sw-style-v.on .sw-style-v-emoji{background:color-mix(in srgb,var(--sc) 15%,transparent)}
.sw-style-v-info{flex:1;min-width:0}
.sw-style-v-name{font-size:12px;font-weight:700;color:var(--t1)}
.sw-style-v-desc{font-size:10px;color:var(--t3)}
.sw-style-v-check{width:18px;height:18px;border-radius:50%;background:var(--sc);color:#fff;font-size:10px;display:flex;align-items:center;justify-content:center;font-weight:700;flex-shrink:0}

/* Duration */
.sw-dur-val{margin-left:auto;font-size:14px;font-weight:800;color:var(--p)}
.sw-range-wrap{position:relative;height:20px;margin-bottom:2px}
.sw-range{position:absolute;top:0;left:0;width:100%;height:20px;opacity:0;cursor:pointer;z-index:2;margin:0}
.sw-range-bar{position:absolute;top:8px;left:0;right:0;height:4px;background:var(--s3);border-radius:2px;overflow:hidden}
.sw-range-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--pl));border-radius:2px;transition:width .1s}
.sw-range-labels{display:flex;justify-content:space-between;font-size:9px;color:var(--t3);margin-top:2px}

/* Hooks */
.sw-hooks{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.sw-hook{padding:8px 6px;border-radius:8px;border:1.5px solid var(--bl);background:var(--s);font-size:11px;font-weight:500;color:var(--t2);cursor:pointer;font-family:inherit;transition:all .15s ease;display:flex;align-items:center;gap:4px;justify-content:center}
.sw-hook:hover{border-color:var(--pl);color:var(--p)}
.sw-hook.on{border-color:var(--p);background:var(--pbg);color:var(--p);font-weight:700}
.sw-hook-icon{font-size:12px}

/* ===== Error ===== */
.sw-error{padding:10px 14px;border-radius:10px;background:#FEF2F2;border:1px solid #FECACA;color:var(--r);font-size:12px;margin-bottom:12px;display:flex;align-items:center;justify-content:space-between}
.sw-error-x{background:none;border:none;color:var(--r);cursor:pointer;font-size:13px}

/* ===== Phases ===== */
.sw-phases{display:flex;align-items:center;justify-content:center;gap:0;padding:12px 16px;margin-bottom:14px;background:var(--s);border:1px solid var(--bl);border-radius:10px}
.sw-phase{display:flex;align-items:center;gap:5px}
.sw-phase-dot{width:28px;height:28px;border-radius:50%;border:2px solid var(--bl);display:flex;align-items:center;justify-content:center;font-size:12px;background:var(--s);transition:all .3s}
.sw-phase.done .sw-phase-dot{background:var(--g);border-color:var(--g);color:#fff;font-size:10px}
.sw-phase.on .sw-phase-dot{background:var(--p);border-color:var(--p);box-shadow:0 0 0 3px var(--pg);animation:swPulse 2s infinite}
@keyframes swPulse{0%,100%{box-shadow:0 0 0 3px var(--pg)}50%{box-shadow:0 0 0 6px rgba(124,58,237,.05)}}
.sw-phase-label{font-size:11px;font-weight:500;color:var(--t3)}
.sw-phase.done .sw-phase-label{color:var(--g)}.sw-phase.on .sw-phase-label{color:var(--p);font-weight:700}
.sw-phase-line{width:32px;height:2px;background:var(--bl);margin:0 6px;border-radius:1px}
.sw-phase.done .sw-phase-line{background:var(--g)}

/* ===== Generating ===== */
.sw-gen-center{display:flex;justify-content:center;align-items:center;min-height:320px}
.sw-gen-card{background:var(--s);border:1px solid var(--bl);border-radius:16px;padding:28px 36px;max-width:420px;width:100%;text-align:center;position:relative;overflow:hidden}
.sw-gen-glow{position:absolute;top:-60px;left:50%;transform:translateX(-50%);width:180px;height:180px;border-radius:50%;background:var(--p);opacity:.06;filter:blur(40px)}
.sw-gen-emoji{font-size:40px;margin-bottom:10px;position:relative;animation:swBounce 2s infinite}
@keyframes swBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
.sw-gen-msg{font-size:13px;font-weight:600;color:var(--t1);margin-bottom:6px;position:relative}
.sw-gen-sub{font-size:11px;color:var(--t3);margin-bottom:14px}
.sw-gen-agents{display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:14px}
.sw-agent{font-size:11px;color:var(--t3);padding:4px 10px;background:var(--s2);border-radius:6px;transition:all .3s}
.sw-agent.on{color:var(--p);background:var(--pbg);font-weight:700}
.sw-agent-arrow{font-size:10px;color:var(--t3)}
.sw-gen-bar{height:4px;background:var(--s3);border-radius:2px;overflow:hidden}
.sw-gen-bar-fill{height:100%;width:100%;background:linear-gradient(90deg,var(--p),var(--pl),#A78BFA);border-radius:2px;background-size:200% 100%;animation:swShimmer 1.5s linear infinite}
@keyframes swShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}

/* ===== Review toolbar ===== */
.sw-review{margin-top:4px}
.sw-toolbar{display:flex;align-items:center;justify-content:space-between;padding:10px 16px;background:var(--s);border:1px solid var(--bl);border-radius:10px;margin-bottom:12px;flex-wrap:wrap;gap:8px}
.sw-toolbar-l{display:flex;align-items:center;gap:12px}
.sw-toolbar-count{font-size:13px;font-weight:700;color:var(--t1)}
.sw-toolbar-progress{display:flex;align-items:center;gap:8px}
.sw-toolbar-bar{width:60px;height:4px;background:var(--s3);border-radius:2px;overflow:hidden}
.sw-toolbar-bar-fill{height:100%;background:var(--g);border-radius:2px;transition:width .3s}
.sw-toolbar-pct{font-size:10px;color:var(--t3);font-weight:600}
.sw-toolbar-cost{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--p);font-weight:600;padding:3px 10px;background:var(--pbg);border-radius:6px}
.sw-toolbar-cost-d{font-size:10px;color:var(--t3);font-weight:400}
.sw-toolbar-r{display:flex;align-items:center;gap:8px}

.sw-progress-msg{font-size:11px;color:var(--p);font-weight:500;margin-bottom:10px;padding:6px 12px;background:var(--pbg);border-radius:7px;display:inline-block}

/* ===== Frame grid ===== */
.sw-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px}

.sw-frame{background:var(--s);border:1.5px solid var(--bl);border-radius:12px;overflow:hidden;transition:all .2s ease}
.sw-frame:hover{transform:translateY(-2px);box-shadow:0 6px 20px rgba(0,0,0,.05)}
.sw-frame.approved{border-color:#22c55e50}
.sw-frame.rejected{border-color:rgba(239,68,68,.35)}

.sw-frame-img-wrap{position:relative;aspect-ratio:16/9;background:linear-gradient(135deg,var(--s2),var(--s3));display:flex;align-items:center;justify-content:center;overflow:hidden}
.sw-frame-img{width:100%;height:100%;object-fit:cover}
.sw-frame-img-ph{display:flex;align-items:center;justify-content:center;width:100%;height:100%}
.sw-frame-ph-num{font-size:28px;font-weight:900;color:var(--bl);opacity:.6}
.sw-frame-overlay{position:absolute;top:0;left:0;right:0;display:flex;justify-content:space-between;align-items:flex-start;padding:8px 10px}
.sw-frame-num{font-size:10px;font-weight:700;color:#fff;background:rgba(0,0,0,.45);padding:2px 8px;border-radius:5px;backdrop-filter:blur(4px)}
.sw-frame-badge{font-size:9px;font-weight:600;padding:2px 7px;border-radius:5px;backdrop-filter:blur(4px)}
.sw-frame-badge.pending{background:rgba(255,255,255,.8);color:var(--t3)}
.sw-frame-badge.approved{background:rgba(34,197,94,.85);color:#fff}
.sw-frame-badge.rejected{background:rgba(239,68,68,.85);color:#fff}
.sw-frame-badge.regenerating{background:rgba(124,58,237,.85);color:#fff}

.sw-frame-body{padding:10px 12px}
.sw-frame-visual{font-size:11px;color:var(--t1);line-height:1.5;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.sw-frame-narr{font-size:10px;color:var(--t2);font-style:italic;line-height:1.4;margin-bottom:4px;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden}
.sw-frame-meta{display:flex;gap:10px;font-size:9px;color:var(--t3)}

.sw-frame-actions{border-top:1px solid var(--bl);padding-top:8px;margin-top:6px}
.sw-frame-btns{display:flex;gap:4px}
.sw-fbtn{width:32px;height:28px;border-radius:6px;border:1px solid var(--bl);background:var(--s);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all .15s;flex:1}
.sw-fbtn.approve{color:#16a34a;border-color:#22c55e50}
.sw-fbtn.approve:hover{background:#22c55e15;border-color:#22c55e}
.sw-fbtn.reject{color:var(--r);border-color:rgba(239,68,68,.3)}
.sw-fbtn.reject:hover{background:rgba(239,68,68,.08);border-color:var(--r)}
.sw-fbtn.regen{color:var(--p);border-color:var(--pl)30}
.sw-fbtn.regen:hover{background:var(--pbg);border-color:var(--pl)}

.sw-spinner{display:inline-block;width:18px;height:18px;border:2px solid var(--bl);border-top-color:var(--p);border-radius:50%;animation:swSpin 1s linear infinite}
@keyframes swSpin{to{transform:rotate(360deg)}}

/* ===== Done ===== */
.sw-done-layout{display:grid;grid-template-columns:1fr 200px;gap:16px;align-items:start}
.sw-done-card{background:var(--s);border:1px solid var(--bl);border-radius:14px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.04)}
.sw-done-badge{padding:10px 16px;font-size:13px;font-weight:700;text-align:center;background:linear-gradient(135deg,var(--pbg),#EDE9FE)}
.sw-done-player{background:#000;aspect-ratio:16/9}
.sw-video{width:100%;height:100%;object-fit:contain}
.sw-done-info{padding:14px 18px}
.sw-done-title{font-size:16px;font-weight:800;margin-bottom:4px}
.sw-done-meta{display:flex;gap:12px;font-size:11px;color:var(--t3);margin-bottom:14px}
.sw-done-acts{display:flex;gap:8px}
.sw-done-acts .sw-btn{flex:1;justify-content:center}

.sw-done-thumbs{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:12px;overflow:hidden}
.sw-done-thumbs-title{font-size:11px;font-weight:700;color:var(--t2);margin-bottom:8px}
.sw-done-thumb{border-radius:8px;overflow:hidden;margin-bottom:8px;position:relative;aspect-ratio:16/9;background:var(--s3)}
.sw-done-thumb img{width:100%;height:100%;object-fit:cover}
.sw-done-thumb-info{position:absolute;bottom:0;left:0;right:0;display:flex;justify-content:space-between;padding:4px 8px;background:linear-gradient(transparent,rgba(0,0,0,.6));color:#fff;font-size:9px;font-weight:600}

/* Responsive */
@media(max-width:768px){
  .sw-input-layout{grid-template-columns:1fr}
  .sw-done-layout{grid-template-columns:1fr}
  .sw-done-thumbs{display:none}
  .sw-topbar-tags{display:none}
}
`;
