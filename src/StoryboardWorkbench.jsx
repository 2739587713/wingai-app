import { useState, useRef } from "react";

export default function StoryboardWorkbench() {
  const [step, setStep] = useState("input"); // input|generating|review|images|producing|done
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
  const abortRef = useRef(null);

  const reset = () => {
    if (abortRef.current) abortRef.current.abort();
    setStep("input"); setInput(""); setFrames([]); setProgress(""); setError("");
    setVideoUrl(""); setProjectId(""); setCostEstimate(null); setFeedbackMap({});
    setImgProgress({});
  };

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
          loadCostEstimate(d.project_id);
        }
        else if (evt === "error") { setError(d.message); setStep("input"); }
      });
    } catch (e) { setError(e.message); setStep("input"); }
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
        if (d.event === "done" || d.type === "done") { setStep("review"); setProgress("图片生成完成"); }
      });
    } catch (e) { setError(e.message); }
  };

  const produceVideo = async () => {
    setStep("producing"); setProgress("合成最终视频...");
    try {
      const res = await fetch(`/api/storyboard/${projectId}/produce`, { method: "POST" });
      await parseSSE(res, (d) => {
        if (d.message) setProgress(d.message);
        if (d.event === "done" || d.type === "done") { setVideoUrl(d.video_url || ""); setStep("done"); }
        if (d.event === "error") { setError(d.message); setStep("review"); }
      });
    } catch (e) { setError(e.message); setStep("review"); }
  };

  const allApproved = frames.length > 0 && frames.every(f => f.status === "approved");
  const hasImages = frames.some(f => f.image_url);

  return (
    <div style={{ padding: 24, maxWidth: 960, margin: "0 auto" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>AI卖货分镜工作台</h2>
        {step !== "input" && <button onClick={reset} style={btnStyle}>重新开始</button>}
      </div>

      {error && <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "var(--r)", fontSize: 13, marginBottom: 16 }}>{error}</div>}

      {/* Input */}
      {step === "input" && (
        <div>
          <div style={cardStyle}>
            <label style={labelStyle}>产品/故事描述</label>
            <textarea value={input} onChange={e => setInput(e.target.value)} rows={3} placeholder="描述你要卖的产品或想表达的故事..."
              style={textareaStyle} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={cardStyle}>
              <label style={labelStyle}>视觉风格</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {["cinematic", "anime", "realistic"].map(s => (
                  <span key={s} onClick={() => setStyle(s)}
                    style={{ padding: "6px 12px", borderRadius: 6, border: `1px solid ${style === s ? "var(--p)" : "var(--bl)"}`, fontSize: 12, cursor: "pointer", background: style === s ? "var(--s2)" : "var(--s)" }}>
                    {s === "cinematic" ? "电影感" : s === "anime" ? "动漫" : "写实"}
                  </span>
                ))}
              </div>
            </div>
            <div style={cardStyle}>
              <label style={labelStyle}>视频时长: {duration}秒</label>
              <input type="range" min={15} max={120} value={duration} onChange={e => setDuration(+e.target.value)}
                style={{ width: "100%" }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
            <div style={cardStyle}>
              <label style={labelStyle}>角色描述 (可选)</label>
              <input value={charDesc} onChange={e => setCharDesc(e.target.value)} placeholder="如：25岁女性，穿白色连衣裙..."
                style={inputStyle} />
            </div>
            <div style={cardStyle}>
              <label style={labelStyle}>产品详情 (可选)</label>
              <input value={productDetail} onChange={e => setProductDetail(e.target.value)} placeholder="产品卖点、价格等..."
                style={inputStyle} />
            </div>
          </div>
          <button onClick={generateStoryboard} disabled={!input.trim()} style={{ ...btnPrimaryStyle, width: "100%", padding: 14, fontSize: 15 }}>
            🎬 生成分镜
          </button>
        </div>
      )}

      {/* Generating */}
      {step === "generating" && (
        <div style={{ textAlign: "center", padding: 40, fontSize: 14, color: "var(--t2)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎬</div>
          <div>{progress}</div>
          <div style={{ marginTop: 8, fontSize: 11, color: "var(--t3)" }}>多Agent协作中: 导演 → 编剧 → 制片</div>
        </div>
      )}

      {/* Review */}
      {(step === "review" || step === "images") && (
        <div>
          {/* Cost panel */}
          {costEstimate && (
            <div style={{ ...cardStyle, display: "flex", gap: 16, fontSize: 12 }}>
              <span>💰 预估成本: ¥{costEstimate.total_cost?.toFixed(2) || "?"}</span>
              <span>🖼 图片: ¥{costEstimate.image_cost?.toFixed(2) || "?"}</span>
              <span>🎥 视频: ¥{costEstimate.video_cost?.toFixed(2) || "?"}</span>
            </div>
          )}

          {/* Action bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <button onClick={generateImages} disabled={!allApproved} style={{ ...btnPrimaryStyle, opacity: allApproved ? 1 : 0.5 }}>
              🖼 生成图片 {!allApproved && `(需全部审核)`}
            </button>
            {hasImages && (
              <button onClick={produceVideo} style={btnPrimaryStyle}>🎥 合成视频</button>
            )}
          </div>

          {progress && <div style={{ fontSize: 12, color: "var(--t3)", marginBottom: 12 }}>{progress}</div>}

          {/* Frame cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
            {frames.map((f) => (
              <div key={f.frame_id} style={{ ...cardStyle, marginBottom: 0, borderColor: f.status === "approved" ? "#22c55e" : f.status === "rejected" ? "var(--r)" : "var(--bl)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "var(--p)" }}>场景 {f.frame_id + 1}</span>
                  <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, background: f.status === "approved" ? "#22c55e20" : f.status === "rejected" ? "rgba(239,68,68,0.1)" : "var(--s2)", color: f.status === "approved" ? "#22c55e" : f.status === "rejected" ? "var(--r)" : "var(--t3)" }}>
                    {f.status === "approved" ? "✓ 通过" : f.status === "rejected" ? "✗ 拒绝" : f.status === "regenerating" ? "♻ 重生中" : "待审核"}
                  </span>
                </div>
                {f.image_url && <img src={f.image_url} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: 8 }} />}
                {imgProgress[f.frame_id] && !f.image_url && <div style={{ fontSize: 11, color: "var(--t3)", marginBottom: 4 }}>🖼 {imgProgress[f.frame_id]}</div>}
                <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 4 }}>{f.visual_prompt || f.visual_description}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontStyle: "italic" }}>🎙 {f.narration}</div>
                <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>⏱ {f.duration || 5}s · 📷 {f.camera || f.camera_direction || ""}</div>

                {f.status === "pending" && (
                  <div style={{ marginTop: 8 }}>
                    <input placeholder="修改建议 (可选)" value={feedbackMap[f.frame_id] || ""}
                      onChange={e => setFeedbackMap(prev => ({ ...prev, [f.frame_id]: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: 6 }} />
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => approveFrame(f.frame_id)} style={{ ...btnStyle, color: "#22c55e", borderColor: "#22c55e", flex: 1 }}>✓ 通过</button>
                      <button onClick={() => rejectFrame(f.frame_id)} style={{ ...btnStyle, color: "var(--r)", borderColor: "var(--r)", flex: 1 }}>✗ 拒绝</button>
                      <button onClick={() => regenFrame(f.frame_id)} style={{ ...btnStyle, flex: 1 }}>♻ 重生</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Producing */}
      {step === "producing" && (
        <div style={{ textAlign: "center", padding: 40, fontSize: 14, color: "var(--t2)" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🎥</div>
          {progress}
        </div>
      )}

      {/* Done */}
      {step === "done" && videoUrl && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>🎉 分镜视频已完成</h3>
          <video src={videoUrl} controls style={{ width: "100%", borderRadius: 10, maxHeight: 500 }} />
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <a href={videoUrl} download style={{ ...btnPrimaryStyle, textDecoration: "none", textAlign: "center", flex: 1 }}>⬇ 下载</a>
            <button onClick={reset} style={{ ...btnStyle, flex: 1 }}>新分镜</button>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = { padding: 16, borderRadius: 12, border: "1px solid var(--bl)", background: "var(--s)", marginBottom: 12 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 6 };
const inputStyle = { width: "100%", padding: 8, borderRadius: 6, border: "1px solid var(--bl)", background: "var(--s)", color: "var(--t)", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" };
const textareaStyle = { width: "100%", padding: 10, borderRadius: 8, border: "1px solid var(--bl)", background: "var(--s)", color: "var(--t)", fontSize: 13, resize: "vertical", fontFamily: "inherit", boxSizing: "border-box" };
const btnStyle = { padding: "6px 12px", borderRadius: 8, border: "1px solid var(--bl)", background: "var(--s)", color: "var(--t2)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
const btnPrimaryStyle = { padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--p)", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 };
