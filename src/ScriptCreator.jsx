import { useState, useRef } from "react";

const STEPS = ["产品信息", "AI调研", "选择脚本", "脚本打磨", "分镜预览", "视频生成", "完成"];

export default function ScriptCreator() {
  const [step, setStep] = useState(0);
  const [productName, setProductName] = useState("");
  const [category, setCategory] = useState("美妆护肤");
  const [productUrl, setProductUrl] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [extracting, setExtracting] = useState(false);

  // Research state
  const [sessionId, setSessionId] = useState("");
  const [researching, setResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState({ industry: "", comments: "", creative: "" });
  const [researchResult, setResearchResult] = useState(null);

  // Script state
  const [scripts, setScripts] = useState([]);
  const [selectedScript, setSelectedScript] = useState(null);
  const [projectId, setProjectId] = useState("");

  // Polish state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatting, setChatting] = useState(false);
  const [scriptLocked, setScriptLocked] = useState(false);

  // Storyboard state
  const [shots, setShots] = useState([]);
  const [narrationBusy, setNarrationBusy] = useState(false);

  // Video state
  const [producing, setProducing] = useState(false);
  const [videoProgress, setVideoProgress] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [error, setError] = useState("");

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

  // Step 0: Extract product info
  const extractProduct = async () => {
    setExtracting(true); setError("");
    try {
      const r = await fetch("/api/script/extract-product-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: productUrl || undefined, text: productName }),
      });
      const d = await r.json();
      setProductInfo(d);
      if (d.product_name) setProductName(d.product_name);
      if (d.category) setCategory(d.category);
    } catch (e) { setError(e.message); }
    setExtracting(false);
  };

  // Step 1: Start research & generation
  const startResearch = async () => {
    setStep(1); setResearching(true); setError("");
    setResearchProgress({ industry: "进行中...", comments: "进行中...", creative: "进行中..." });
    try {
      const res = await fetch("/api/script/smart-create-v2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_name: productName, category,
          ...(productInfo || {}),
        }),
      });
      await parseSSE(res, (d) => {
        const evt = d.event || d.type;
        if (evt === "session_created") setSessionId(d.session_id || "");
        else if (evt === "research_progress") {
          setResearchProgress(prev => ({ ...prev, [d.direction]: d.message || d.status || "完成" }));
        }
        else if (evt === "research_done") { setResearchResult(d.result || d); }
        else if (evt === "scripts_ready") {
          setScripts(d.scripts || []);
          setStep(2); setResearching(false);
        }
        else if (evt === "error") { setError(d.message); setResearching(false); }
        else if (d.message) {
          setResearchProgress(prev => ({ ...prev, status: d.message }));
        }
      });
    } catch (e) { setError(e.message); setResearching(false); }
  };

  // Step 2: Select script
  const selectScript = async (idx) => {
    setSelectedScript(scripts[idx]);
    try {
      const r = await fetch(`/api/script/${sessionId}/select-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ script_index: idx }),
      });
      const d = await r.json();
      setProjectId(d.project_id || sessionId);
      setShots(d.shots || selectedScript?.shots || []);
      setStep(3);
    } catch (e) { setError(e.message); }
  };

  // Step 3: Chat to polish
  const sendChat = async () => {
    if (!chatInput.trim() || chatting) return;
    const msg = chatInput; setChatInput(""); setChatting(true);
    setChatMessages(prev => [...prev, { role: "user", content: msg }]);
    try {
      const r = await fetch(`/api/script/${projectId}/chat-v2`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg }),
      });
      const d = await r.json();
      setChatMessages(prev => [...prev, { role: "assistant", content: d.reply || d.message || JSON.stringify(d) }]);
      if (d.updated_script) setSelectedScript(prev => ({ ...prev, ...d.updated_script }));
      if (d.shots) setShots(d.shots);
    } catch (e) { setChatMessages(prev => [...prev, { role: "assistant", content: `错误: ${e.message}` }]); }
    setChatting(false);
  };

  const lockScript = async () => {
    try {
      await fetch(`/api/script/${projectId}/lock`, { method: "POST" });
      setScriptLocked(true); setStep(4);
    } catch (e) { setError(e.message); }
  };

  // Step 4: Generate narration
  const generateNarration = async () => {
    setNarrationBusy(true);
    try {
      const r = await fetch(`/api/script/${projectId}/generate-narration`, { method: "POST" });
      const d = await r.json();
      if (d.shots) setShots(d.shots);
    } catch (e) { setError(e.message); }
    setNarrationBusy(false);
  };

  // Step 5: Produce video
  const produceVideo = async () => {
    setStep(5); setProducing(true); setVideoProgress("开始生成视频...");
    try {
      const r = await fetch(`/api/script/${projectId}/produce-video`, { method: "POST" });
      const d = await r.json();
      if (d.video_url) { setVideoUrl(d.video_url); setStep(6); }
      else setVideoProgress(d.message || "生成中...");
    } catch (e) { setError(e.message); }
    setProducing(false);
  };

  const CATEGORIES = ["美妆护肤", "数码产品", "食品饮料", "服饰鞋包", "家居家电", "母婴用品", "运动户外", "宠物用品", "教育培训", "其他"];

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>AI 脚本创作器</h2>

      {/* Step indicator */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24 }}>
        {STEPS.map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 4, borderRadius: 2, background: i <= step ? "var(--p)" : "var(--s3)", transition: "var(--tr)" }} />
            <div style={{ fontSize: 10, marginTop: 4, color: i === step ? "var(--p)" : i < step ? "var(--t2)" : "var(--t3)", fontWeight: i === step ? 700 : 400 }}>{s}</div>
          </div>
        ))}
      </div>

      {error && <div style={{ padding: 12, borderRadius: 8, background: "rgba(239,68,68,0.1)", color: "var(--r)", fontSize: 13, marginBottom: 16 }}>{error}<button onClick={() => setError("")} style={{ float: "right", background: "none", border: "none", color: "var(--r)", cursor: "pointer" }}>✕</button></div>}

      {/* Step 0: Product Input */}
      {step === 0 && (
        <div>
          <div style={cardStyle}>
            <label style={labelStyle}>产品名称</label>
            <input value={productName} onChange={e => setProductName(e.target.value)} placeholder="输入产品名称" style={inputStyle} />
          </div>
          <div style={cardStyle}>
            <label style={labelStyle}>产品类目</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map(c => (
                <span key={c} onClick={() => setCategory(c)}
                  style={{ padding: "4px 10px", borderRadius: 6, border: `1px solid ${category === c ? "var(--p)" : "var(--bl)"}`, fontSize: 11, cursor: "pointer", background: category === c ? "var(--s2)" : "var(--s)" }}>
                  {c}
                </span>
              ))}
            </div>
          </div>
          <div style={cardStyle}>
            <label style={labelStyle}>产品链接 (可选, 自动提取信息)</label>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={productUrl} onChange={e => setProductUrl(e.target.value)} placeholder="粘贴商品链接..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={extractProduct} disabled={extracting} style={btnStyle}>
                {extracting ? "提取中..." : "🔍 智能提取"}
              </button>
            </div>
          </div>

          {productInfo && (
            <div style={cardStyle}>
              <label style={labelStyle}>✅ 已提取产品信息</label>
              <div style={{ fontSize: 12, color: "var(--t2)" }}>
                {productInfo.core_features && <div>核心卖点: {productInfo.core_features.join(", ")}</div>}
                {productInfo.target_audience && <div>目标人群: {productInfo.target_audience}</div>}
                {productInfo.price_range && <div>价格: {productInfo.price_range}</div>}
              </div>
            </div>
          )}

          <button onClick={startResearch} disabled={!productName.trim()}
            style={{ ...btnPrimaryStyle, width: "100%", padding: 14, fontSize: 15 }}>
            🚀 开始AI调研 & 生成脚本
          </button>
        </div>
      )}

      {/* Step 1: Research */}
      {step === 1 && (
        <div style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, marginBottom: 16 }}>🔬 三方向并行调研中...</h3>
          {[
            { key: "industry", label: "A. 同行业头部分析", icon: "🏆" },
            { key: "comments", label: "B. 评论区痛点挖掘", icon: "💬" },
            { key: "creative", label: "C. 跨行业创意迁移", icon: "🎨" },
          ].map(d => (
            <div key={d.key} style={{ ...cardStyle, display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 20 }}>{d.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{d.label}</div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>{researchProgress[d.key]}</div>
              </div>
              <div style={{ width: 60, height: 4, borderRadius: 2, background: "var(--s3)" }}>
                <div style={{ height: 4, borderRadius: 2, background: "var(--p)", width: researchProgress[d.key]?.includes("完成") ? "100%" : "50%", transition: "width 0.5s" }} />
              </div>
            </div>
          ))}
          {researchProgress.status && <div style={{ fontSize: 12, color: "var(--t3)", textAlign: "center", marginTop: 12 }}>{researchProgress.status}</div>}
        </div>
      )}

      {/* Step 2: Script Selection */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 12 }}>选择脚本方案</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))", gap: 12 }}>
            {scripts.map((sc, i) => (
              <div key={i} onClick={() => selectScript(i)}
                style={{ ...cardStyle, cursor: "pointer", marginBottom: 0, borderColor: selectedScript === sc ? "var(--p)" : "var(--bl)" }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>{sc.title || `方案 ${i + 1}`}</div>
                <div style={{ fontSize: 12, color: "var(--t2)", marginBottom: 6 }}>{sc.hook || sc.description || ""}</div>
                <div style={{ fontSize: 11, color: "var(--t3)" }}>
                  {sc.target_audience && <span>👥 {sc.target_audience} · </span>}
                  {sc.estimated_duration && <span>⏱ {sc.estimated_duration}s · </span>}
                  {sc.shots?.length && <span>🎬 {sc.shots.length}个分镜</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: Script Polish */}
      {step === 3 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, margin: 0 }}>脚本打磨</h3>
            <button onClick={lockScript} style={btnPrimaryStyle}>🔒 确认锁定脚本</button>
          </div>

          {selectedScript && (
            <div style={cardStyle}>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 8 }}>{selectedScript.title}</div>
              {(selectedScript.shots || shots || []).map((shot, i) => (
                <div key={i} style={{ padding: 8, borderBottom: "1px solid var(--bl)", fontSize: 12 }}>
                  <span style={{ fontWeight: 600, color: "var(--p)" }}>#{i + 1}</span> {shot.narration || shot.voiceover || ""}
                  <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 2 }}>📷 {shot.visual_description || shot.visual || ""} · ⏱ {shot.duration || 5}s</div>
                </div>
              ))}
            </div>
          )}

          {/* Chat */}
          <div style={cardStyle}>
            <div style={{ maxHeight: 200, overflowY: "auto", marginBottom: 8 }}>
              {chatMessages.map((m, i) => (
                <div key={i} style={{ fontSize: 12, padding: 6, background: m.role === "user" ? "var(--s2)" : "var(--s)", borderRadius: 6, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, color: m.role === "user" ? "var(--p)" : "var(--t2)" }}>{m.role === "user" ? "你" : "AI"}: </span>
                  {m.content}
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && sendChat()}
                placeholder="输入修改建议，如：第3段语气太生硬..." style={{ ...inputStyle, flex: 1 }} />
              <button onClick={sendChat} disabled={chatting} style={btnPrimaryStyle}>{chatting ? "..." : "发送"}</button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Storyboard Preview */}
      {step === 4 && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <h3 style={{ fontSize: 14, margin: 0 }}>分镜预览</h3>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={generateNarration} disabled={narrationBusy} style={btnStyle}>
                {narrationBusy ? "生成中..." : "🎙 生成配音"}
              </button>
              <button onClick={() => setStep(5)} style={btnPrimaryStyle}>下一步 →</button>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 12 }}>
            {shots.map((shot, i) => (
              <div key={i} style={cardStyle}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--p)", marginBottom: 6 }}>分镜 {i + 1}</div>
                {shot.image_url && <img src={shot.image_url} alt="" style={{ width: "100%", borderRadius: 8, marginBottom: 6 }} />}
                <div style={{ fontSize: 12, color: "var(--t2)" }}>{shot.visual_description || shot.visual || ""}</div>
                <div style={{ fontSize: 11, color: "var(--t3)", fontStyle: "italic", marginTop: 4 }}>🎙 {shot.narration || shot.voiceover || ""}</div>
                <div style={{ fontSize: 10, color: "var(--t3)", marginTop: 4 }}>⏱ {shot.duration || 5}s · 📷 {shot.camera || ""}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 5: Video Production */}
      {step === 5 && (
        <div style={{ textAlign: "center", padding: 40 }}>
          {!producing && !videoUrl && (
            <div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🎥</div>
              <h3 style={{ fontSize: 14 }}>准备生成视频</h3>
              <p style={{ fontSize: 12, color: "var(--t3)" }}>{shots.length} 个分镜已就绪</p>
              <button onClick={produceVideo} style={{ ...btnPrimaryStyle, padding: 14, fontSize: 15 }}>🚀 开始生成视频</button>
            </div>
          )}
          {producing && (
            <div>
              <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
              <div style={{ fontSize: 14, color: "var(--t2)" }}>{videoProgress}</div>
            </div>
          )}
        </div>
      )}

      {/* Step 6: Completion */}
      {step === 6 && (
        <div style={cardStyle}>
          <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>🎉 脚本视频已完成</h3>
          {videoUrl && <video src={videoUrl} controls style={{ width: "100%", borderRadius: 10, maxHeight: 500 }} />}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            {videoUrl && <a href={videoUrl} download style={{ ...btnPrimaryStyle, textDecoration: "none", textAlign: "center", flex: 1 }}>⬇ 下载</a>}
            <button onClick={() => { setStep(0); setScripts([]); setSelectedScript(null); setVideoUrl(""); }} style={{ ...btnStyle, flex: 1 }}>新脚本</button>
          </div>
        </div>
      )}
    </div>
  );
}

const cardStyle = { padding: 16, borderRadius: 12, border: "1px solid var(--bl)", background: "var(--s)", marginBottom: 12 };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "var(--t2)", display: "block", marginBottom: 6 };
const inputStyle = { width: "100%", padding: 8, borderRadius: 6, border: "1px solid var(--bl)", background: "var(--s)", color: "var(--t)", fontSize: 12, fontFamily: "inherit", boxSizing: "border-box" };
const btnStyle = { padding: "6px 12px", borderRadius: 8, border: "1px solid var(--bl)", background: "var(--s)", color: "var(--t2)", fontSize: 12, cursor: "pointer", fontFamily: "inherit" };
const btnPrimaryStyle = { padding: "8px 16px", borderRadius: 8, border: "none", background: "var(--p)", color: "#fff", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 600 };
