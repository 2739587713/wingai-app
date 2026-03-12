import { useState } from "react";

/* ── Icons used by this module ── */
const I = {
  Fire: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.6 0-8-2.4-8-7.7 0-3.5 2.1-6.4 4-8.8.6-.8 1.8-.3 1.7.7-.2 1.6.3 3.3 1.5 4.5.2.2.5.1.6-.2.4-1.6 1.5-3.5 3.2-5.2.5-.5 1.4-.2 1.4.5 0 2.2.8 4.1 2.1 5.5.9 1 1.5 2.3 1.5 3.8 0 4-3 6.9-8 6.9z"/></svg>,
  Sparkle: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  Link: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
};

/* ── Built-in template data ── */
const TMPLLIB = [
  { id: 1, name: "李佳琦种草公式", plat: "抖音", desc: "OMG 买它逻辑，强调痛点+即时效果+价格锚点", tags: ["美妆头部", "高转化"], stat: "+25%", uses: "新上线" },
  { id: 2, name: "张同学乡村叙事", plat: "抖音", desc: "快节奏剪辑+沉浸式生活场景，软植入自然不突兀", tags: ["三农/食品", "生活化"], stat: "+30%", uses: "1.2w+次" },
  { id: 3, name: "罗永浩理性测评", plat: "视频号", desc: "参数罗列+幽默吐槽+硬核对比，建立信任感", tags: ["数码3C", "专业测评"], stat: "+22%", uses: "8.5k+次" },
  { id: 4, name: "PAS痛点放大法", plat: "通用", desc: "Problem - Agitation - Solution，经典营销理论", tags: ["知识付费", "理论模型"], stat: "+18%", uses: "15.3k+次" },
  { id: 5, name: "小红书种草笔记", plat: "小红书", desc: "真实体验+使用心得+购买链接，图文并茂", tags: ["美妆护肤", "种草"], stat: "+20%", uses: "3.2k+次" },
  { id: 6, name: "薇娅直播切片", plat: "抖音", desc: "限时抢购+库存紧张+价格优势，直播电商核心", tags: ["电商直播", "紧迫感"], stat: "+28%", uses: "5.7k+次" },
];

/* ── API helpers ── */
const TH_KEY = "k40dDp4s0V2pqHGuTJC15k36ahixSsFavT3U7EyjUv29lHOfJWWZUAqRMw==";
const TH_H = { "Authorization": "Bearer " + TH_KEY, "Content-Type": "application/json" };

const thGet = async (ep, params) => {
  const u = new URL("/tikhub-proxy" + ep, location.origin);
  if (params) Object.entries(params).forEach(([k, v]) => u.searchParams.set(k, v));
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch(u, { headers: TH_H });
      const j = await r.json();
      if (r.ok) return j;
    } catch (e) { console.log("[thGet] err", e.message); }
    if (i < 2) await new Promise(r => setTimeout(r, 2000 * (i + 1)));
  }
  return null;
};

const thPost = async (ep, body) => {
  for (let i = 0; i < 3; i++) {
    try {
      const r = await fetch("/tikhub-proxy" + ep, { method: "POST", headers: TH_H, body: JSON.stringify(body) });
      const j = await r.json();
      if (r.ok) return j;
    } catch (e) { console.log("[thPost] err", e.message); }
    if (i < 2) await new Promise(r => setTimeout(r, 2000 * (i + 1)));
  }
  return null;
};

const callGeminiRaw = async (prompt, temperature = 0.3) => {
  const resp = await fetch("/api-proxy/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b" },
    body: JSON.stringify({ model: "gemini-3.1-pro-preview", messages: [{ role: "user", content: prompt }], temperature }),
  });
  const data = await resp.json();
  return data.choices?.[0]?.message?.content || "";
};

/* ── Styles (scoped via className prefix tl-) ── */
const STYLES = `
.tl-wrap{height:100%;display:flex;flex-direction:column}
.tl-tt{display:flex;border-bottom:1px solid var(--bl);margin-bottom:16px}
.tl-tti{padding:9px 16px;font-size:12px;font-weight:500;color:var(--t3);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;font-family:inherit}
.tl-tti.on{color:var(--p);border-bottom-color:var(--p);font-weight:600}
.tl-fr{display:flex;gap:20px;margin-bottom:16px}
.tl-fg{display:flex;align-items:center;gap:6px}
.tl-fl{font-size:12px;font-weight:600;color:var(--t2)}
.tl-fcs{display:flex;gap:5px}
.tl-fc2{padding:4px 11px;border-radius:5px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit}
.tl-fc2.on{background:var(--pbg);color:var(--p);border-color:var(--pl)}
.tl-tg2{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.tl-tc{background:var(--s);border-radius:var(--rl);padding:18px;border:1px solid var(--bl);cursor:pointer;transition:var(--tr)}
.tl-tc:hover{border-color:var(--pl);box-shadow:0 4px 14px rgba(0,0,0,.06);transform:translateY(-2px)}
.tl-tc-tp{display:flex;justify-content:space-between;margin-bottom:8px;font-size:10px;color:var(--t3)}
.tl-tc-n{font-size:15px;font-weight:700;margin-bottom:5px}
.tl-tc-d{font-size:11px;color:var(--t2);line-height:1.5;margin-bottom:10px}
.tl-tc-tgs{display:flex;gap:5px;margin-bottom:10px}
.tl-tc-tg{font-size:10px;padding:2px 7px;border-radius:3px;background:var(--s3);color:var(--t3)}
.tl-tc-bot{display:flex;justify-content:space-between;align-items:center}
.tl-tc-st{font-size:11px;color:var(--o);font-weight:600;display:flex;align-items:center;gap:3px}
.tl-tc-bt{padding:5px 13px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:none;background:var(--p);color:#fff;font-family:inherit}
.tl-ov{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center}
`;

/* ── Extract steps label ── */
const EXT_STEPS = ["解析链接", "获取视频列表", "获取视频详情", "AI深度分析", "完成"];

/* ────────────────────────────────────────────
   TemplateLib Component
   Props:
     onCreateWithTemplate(tmpl)  — called when user clicks "用此模板创建"
   ──────────────────────────────────────────── */
export default function TemplateLib({ onCreateWithTemplate }) {
  // tabs & filter
  const [tTab, setTTab] = useState("KOL风格");
  const [fp, setFp] = useState("全部");

  // AI-extracted templates (persisted to localStorage)
  const [aiTemplates, setAiTemplates] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem("aiTmpls") || "[]");
      return raw.flatMap(x => x.templates ? x.templates.map(t => ({ _creator: x.name || x._creator, ...t })) : [x]);
    } catch { return []; }
  });

  // delete mode
  const [delMode, setDelMode] = useState(false);
  const [delSel, setDelSel] = useState([]);


  // extract modal
  const [showExtract, setShowExtract] = useState(false);
  const [extLink, setExtLink] = useState("");
  const [extName, setExtName] = useState("");
  const [extCat, setExtCat] = useState("");
  const [extStep, setExtStep] = useState("");
  const [extBusy, setExtBusy] = useState(false);
  const [extStepIdx, setExtStepIdx] = useState(-1);
  const [extInfo, setExtInfo] = useState("");

  /* ── Extract logic ── */
  const runExtract = async () => {
    if (!extLink.trim() || !extName.trim()) { alert("请填写博主链接和昵称"); return; }
    setExtBusy(true); setExtStepIdx(0); setExtStep(""); setExtInfo("");
    let dbg = [];
    try {
      const urlMatch = extLink.match(/https?:\/\/\S+/);
      let rawUrl = urlMatch ? urlMatch[0].replace(/[.,，。]+$/, "") : extLink.trim();
      dbg.push("URL: " + rawUrl); setExtInfo("链接: " + rawUrl.slice(0, 50));
      let secUid = "";
      const uidMatch = rawUrl.match(/\/user\/([A-Za-z0-9_-]{20,})/);
      if (uidMatch) { secUid = uidMatch[1]; dbg.push("直接解析sec_uid成功"); }
      else {
        setExtInfo("展开短链接...");
        try {
          const ac = new AbortController(); const tm = setTimeout(() => ac.abort(), 20000);
          const er = await fetch("/expand-url?url=" + encodeURIComponent(rawUrl), { signal: ac.signal }); clearTimeout(tm);
          const etxt = await er.text(); dbg.push("展开响应[" + er.status + "]: " + etxt.slice(0, 150));
          let ej; try { ej = JSON.parse(etxt); } catch { ej = {}; }
          if (ej.url) {
            rawUrl = ej.url;
            const m2 = rawUrl.match(/\/user\/([A-Za-z0-9_-]{20,})/);
            if (m2) { secUid = m2[1]; dbg.push("从展开URL解析sec_uid成功"); }
            if (!secUid && ej.body) {
              const m3 = ej.body.match(/\/user\/([A-Za-z0-9_-]{20,})/);
              if (m3) { secUid = m3[1]; dbg.push("从body解析sec_uid成功"); }
              const m4 = ej.body.match(/sec_uid['":\s]+([A-Za-z0-9_-]{20,})/);
              if (!secUid && m4) { secUid = m4[1]; dbg.push("从body字段解析sec_uid成功"); }
            }
          }
        } catch (ex) { dbg.push("展开失败: " + ex.message); }
        if (!secUid) {
          setExtInfo("通过TikHub API解析...");
          const findUid = (obj) => { if (!obj || typeof obj !== "object") return ""; if (typeof obj.sec_uid === "string" && obj.sec_uid.length > 15) return obj.sec_uid; for (const v of Object.values(obj)) { const r = findUid(v); if (r) return r; } return ""; };
          for (const ep of ["/api/v1/douyin/web/fetch_user_profile_by_url", "/api/v1/douyin/app/v3/fetch_user_profile_by_url"]) {
            const epName = ep.split("/").pop(); setExtInfo("API: " + epName);
            try {
              const u = new URL("/tikhub-proxy" + ep, location.origin); u.searchParams.set("url", rawUrl);
              const r = await fetch(u, { headers: TH_H }); const txt = await r.text();
              dbg.push(epName + " [" + r.status + "]: " + txt.slice(0, 200));
              if (r.ok) { try { const d = JSON.parse(txt); secUid = findUid(d); if (secUid) { dbg.push("sec_uid: " + secUid); break; } } catch { dbg.push("JSON解析失败"); } }
            } catch (e) { dbg.push(epName + " 请求失败: " + e.message); }
          }
        }
      }
      if (!secUid) { setExtStep("err:无法解析博主链接\n" + dbg.join("\n")); setExtBusy(false); return; }

      setExtStepIdx(1); setExtInfo("");
      let videoIds = []; let cursor = 0;
      for (const ep of ["/api/v1/douyin/web/fetch_user_post_videos", "/api/v1/douyin/app/v3/fetch_user_post_videos"]) {
        videoIds = []; cursor = 0;
        while (videoIds.length < 50) {
          const d = await thGet(ep, { sec_user_id: secUid, count: Math.min(20, 50 - videoIds.length), max_cursor: cursor });
          if (!d) break;
          const items = (d.data || {}).aweme_list || [];
          if (!items.length) break;
          for (const it of items) {
            const aid = it.aweme_id || it.video?.vid || "";
            if (aid) videoIds.push({ id: String(aid), title: (it.desc || "").trim(), digg: (it.statistics || {}).digg_count || 0, comment: (it.statistics || {}).comment_count || 0, share: (it.statistics || {}).share_count || 0 });
          }
          setExtInfo("已获取 " + videoIds.length + " 条...");
          if (!d.data?.has_more) break;
          cursor = d.data?.max_cursor || 0;
          await new Promise(r => setTimeout(r, 800));
        }
        if (videoIds.length) break;
        await new Promise(r => setTimeout(r, 1500));
      }
      if (!videoIds.length) { setExtStep("err:未获取到视频，请检查链接或稍后重试"); setExtBusy(false); return; }

      setExtStepIdx(2); setExtInfo(videoIds.length + " 条视频");
      const allDetails = []; const ids = videoIds.map(v => v.id);
      for (let i = 0; i < ids.length; i += 50) {
        const batch = ids.slice(i, i + 50);
        setExtInfo("批次 " + (Math.floor(i / 50) + 1) + "/" + Math.ceil(ids.length / 50) + "...");
        const d = await thPost("/api/v1/douyin/web/fetch_multi_video", batch);
        if (d) {
          const dd = d.data;
          if (Array.isArray(dd)) allDetails.push(...dd);
          else if (dd && typeof dd === "object") { const items = dd.aweme_list || dd.aweme_details || Object.values(dd); if (Array.isArray(items)) allDetails.push(...items); }
        }
        await new Promise(r => setTimeout(r, 800));
      }
      const detailMap = {};
      for (const d of allDetails) { const aid = String(d.aweme_id || ""); if (aid) detailMap[aid] = d; }
      const corpus = videoIds.map(v => {
        const entry = { title: v.title, digg: v.digg, comment: v.comment, share: v.share };
        const det = detailMap[v.id];
        if (det) {
          const subs = det.video?.subtitles || []; const subText = subs.map(s => s.text || "").join(" ");
          const tags = (det.text_extra || []).filter(t => t.type === 1).map(t => t.title || "");
          entry.subtitle = subText.slice(0, 300); entry.tags = tags.slice(0, 5); entry.duration = det.duration || 0;
        }
        return entry;
      }).sort((a, b) => b.digg - a.digg);

      setExtStepIdx(3); setExtInfo("Gemini 分析中，约30-60秒...");
      let analysisText = "";
      for (let i = 0; i < Math.min(corpus.length, 25); i++) {
        const v = corpus[i];
        analysisText += "\n[视频" + (i + 1) + "] " + v.title + "\n  互动：点赞" + v.digg + " 评论" + v.comment + " 分享" + v.share + "\n";
        if (v.subtitle) analysisText += "  字幕片段：" + v.subtitle + "\n";
        if (v.tags?.length) analysisText += "  标签：" + v.tags.join("、") + "\n";
      }
      const analyzePrompt = "你是顶级短视频内容策略师，专门从真实数据中提炼可复用的脚本模板。\n\n以下是抖音博主「" + extName.trim() + "」（" + (extCat.trim() || "带货/内容创作") + "）的真实视频数据（按互动量从高到低）：\n" + analysisText + "\n\n请基于以上真实数据，深度分析该博主的内容规律，提炼一个极其详细、可直接用于AI生成脚本的模板。\n\n只输出以下JSON，不要任何其他文字：\n{\"name\":\"模板名称（6-12字，体现该博主核心套路）\",\"desc\":\"核心逻辑一句话（20字内）\",\"personality\":\"人设定位\",\"target_audience\":\"目标受众画像\",\"emotion_tone\":\"整体情绪基调\",\"formula\":\"完整脚本公式，每步具体（格式：步骤名称-具体做法(秒数)→...至少6步）\",\"hook_strategy\":\"前3秒留人策略\",\"conflict_setup\":\"如何建立矛盾/痛点\",\"product_intro_style\":\"产品引入方式\",\"trust_mechanism\":\"建立信任的核心机制\",\"price_anchor\":\"价格话术模式\",\"urgency_tactic\":\"制造紧迫感的方式\",\"cta_style\":\"结尾行动引导方式\",\"pacing\":\"节奏描述\",\"sentence_length\":\"句子长短特征\",\"voice_rhythm\":\"语音节奏特征\",\"emotion_curve\":\"情绪曲线\",\"climax_position\":\"高潮点位置\",\"keyword_bank\":[\"12个高频口头禅/话术\"],\"power_words\":[\"8个高转化词汇\"],\"filler_words\":[\"标志性语气词\"],\"sentence_patterns\":[\"8个标志性句式，用【】标注变量\"],\"sample_hooks\":[\"4个开头钩子\"],\"sample_transitions\":[\"3个场景过渡句式\"],\"sample_ctas\":[\"3个结尾引导句式\"],\"viral_patterns\":\"爆款规律\",\"dos\":[\"创作必做5件事\"],\"donts\":[\"创作禁忌5件事\"],\"structure\":[\"步骤1\",\"步骤2\",\"步骤3\",\"步骤4\",\"步骤5\",\"步骤6\"],\"scene\":\"最适合套用此模板的产品类型和场景\",\"tags\":[\"品类标签\",\"风格标签\",\"平台标签\"],\"stat\":\"预估完播率提升\",\"style_summary\":\"综合风格总结（150字）\"}";
      const raw = await callGeminiRaw(analyzePrompt);
      const cleaned = raw.replace(/```json?\s*/g, "").replace(/```\s*$/, "").trim();
      const jm = cleaned.match(/\{[\s\S]*\}/);
      if (!jm) { setExtStep("err:AI分析返回格式异常，请重试"); setExtBusy(false); return; }
      const tmpl = JSON.parse(jm[0]);
      const flat = { _creator: extName.trim(), ...tmpl, plat: "抖音", uses: "新上线" };
      const merged = [...aiTemplates, flat];
      setAiTemplates(merged); localStorage.setItem("aiTmpls", JSON.stringify(merged));
      setExtStepIdx(4); setExtInfo("模板「" + (tmpl.name || "") + "」已添加"); setExtBusy(false); setTTab("AI提炼");
    } catch (e) { setExtStep("err:提取失败: " + e.message); setExtBusy(false); }
  };

  /* ── Render ── */
  return (
    <>
      <style>{STYLES}</style>
      <div className="sc tl-wrap">
        {/* Tab bar + action buttons */}
        <div className="tl-tt" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {["KOL风格", "营销方法论", "行业专属", "AI提炼"].map(t => (
              <button key={t} className={`tl-tti ${tTab === t ? "on" : ""}`} onClick={() => setTTab(t)}>{t}</button>
            ))}
          </div>
          {tTab === "AI提炼" && <div style={{ display: "flex", gap: 8 }}>
            {aiTemplates.length > 0 && !delMode && (
              <button style={{ padding: "6px 14px", border: "1.5px solid #F87171", borderRadius: 8, background: "#FFF5F5", color: "#EF4444", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setDelMode(true); setDelSel([]); }}>删除模板</button>
            )}
            {!delMode && (
              <button style={{ padding: "6px 14px", border: "1.5px solid #3B82F6", borderRadius: 8, background: "#EFF6FF", color: "#3B82F6", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }} onClick={() => { setShowExtract(true); setExtStep(""); setExtLink(""); setExtName(""); setExtCat(""); }}><I.Link /> 提取模板</button>
            )}
            {delMode && (
              <button style={{ padding: "6px 14px", border: "1.5px solid var(--bl)", borderRadius: 8, background: "var(--s)", color: "var(--t2)", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setDelMode(false); setDelSel([]); }}>取消</button>
            )}
          </div>}
        </div>

        {/* Platform filter (for non-AI tabs) */}
        {tTab !== "AI提炼" && (
          <div className="tl-fr">
            <div className="tl-fg">
              <span className="tl-fl">平台</span>
              <div className="tl-fcs">
                {["全部", "抖音", "小红书", "视频号"].map(f => (
                  <button key={f} className={`tl-fc2 ${fp === f ? "on" : ""}`} onClick={() => setFp(f)}>{f}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Built-in template cards */}
        {tTab !== "AI提炼" && (
          <div className="tl-tg2">
            {TMPLLIB.filter(t => fp === "全部" || t.plat === fp).map(t => (
              <div className="tl-tc" key={t.id}>
                <div className="tl-tc-tp"><span>{t.plat}</span><span>{t.uses}</span></div>
                <div className="tl-tc-n">{t.name}</div>
                <div className="tl-tc-d">{t.desc}</div>
                <div className="tl-tc-tgs">{t.tags.map((tg, i) => <span key={i} className="tl-tc-tg">{tg}</span>)}</div>
                <div className="tl-tc-bot">
                  <span className="tl-tc-st"><I.Fire /> 完播率 {t.stat}</span>
                  <button className="tl-tc-bt" onClick={() => onCreateWithTemplate?.(t)}>用此模板创建 →</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* AI-extracted template tab */}
        {tTab === "AI提炼" && <div>
          {aiTemplates.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "var(--t3)", fontSize: 13 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🤖</div>
              <div style={{ fontWeight: 600, marginBottom: 6 }}>还没有AI提炼的模板</div>
              <div style={{ marginBottom: 16 }}>粘贴博主抖音链接，一键提取风格模板</div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                <button style={{ padding: "8px 20px", border: "none", borderRadius: 10, background: "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setShowExtract(true); setExtStep(""); setExtLink(""); setExtName(""); setExtCat(""); }}>提取博主模板</button>
              </div>
            </div>
          ) : <>
            <div className="tl-tg2">
              {aiTemplates.map((t, i) => {
                const checked = delSel.includes(i);
                return (
                  <div className="tl-tc" key={i} style={{ position: "relative", outline: delMode && checked ? "2px solid #EF4444" : "none", outlineOffset: 2 }} onClick={() => { if (delMode) setDelSel(checked ? delSel.filter(x => x !== i) : [...delSel, i]); }}>
                    {delMode && <div style={{ position: "absolute", top: 10, right: 10, width: 18, height: 18, borderRadius: 4, border: "2px solid", borderColor: checked ? "#EF4444" : "#ccc", background: checked ? "#EF4444" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>{checked && <span style={{ color: "#fff", fontSize: 11, lineHeight: 1 }}>✓</span>}</div>}
                    <div className="tl-tc-tp"><span style={{ background: "#EFF6FF", color: "#3B82F6", padding: "1px 6px", borderRadius: 3 }}>AI提炼</span><span>{t._creator || ""}</span></div>
                    <div className="tl-tc-n">{t.name}</div>
                    <div className="tl-tc-d">{(t.scene || t.style_summary || "").slice(0, 60)}</div>
                    <div className="tl-tc-tgs">{(t.tags || t.keyword_bank || []).slice(0, 3).map((kw, ki) => <span key={ki} className="tl-tc-tg">{kw}</span>)}</div>
                    <div className="tl-tc-bot">
                      <span className="tl-tc-st"><I.Sparkle /> 博主风格模板</span>
                      {!delMode && <button className="tl-tc-bt" onClick={e => { e.stopPropagation(); onCreateWithTemplate?.(t); }}>用此模板创建 →</button>}
                    </div>
                  </div>
                );
              })}
            </div>
            {delMode && (
              <div style={{ position: "sticky", bottom: 0, background: "var(--s)", borderTop: "1px solid var(--bl)", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
                <span style={{ fontSize: 13, color: "var(--t2)" }}>已选 <b style={{ color: "#EF4444" }}>{delSel.length}</b> 个模板</span>
                <button disabled={delSel.length === 0} onClick={() => {
                  if (window.confirm(`确认删除选中的 ${delSel.length} 个模板？此操作不可恢复。`)) {
                    const next = aiTemplates.filter((_, i) => !delSel.includes(i));
                    setAiTemplates(next); localStorage.setItem("aiTmpls", JSON.stringify(next));
                    setDelMode(false); setDelSel([]);
                  }
                }} style={{ padding: "8px 20px", border: "none", borderRadius: 8, background: delSel.length > 0 ? "#EF4444" : "#ccc", color: "#fff", fontSize: 13, fontWeight: 600, cursor: delSel.length > 0 ? "pointer" : "default", fontFamily: "inherit" }}>确认删除</button>
              </div>
            )}
          </>}
        </div>}
      </div>

        </div>
      )}

      {/* ── Extract Modal ── */}
      {showExtract && (
        <div className="tl-ov" onClick={e => { if (e.target === e.currentTarget && !extBusy) { setShowExtract(false); setExtStep(""); setExtStepIdx(-1); } }}>
          <div style={{ background: "var(--s)", borderRadius: 18, padding: 28, width: 520, boxShadow: "0 8px 40px rgba(0,0,0,.12)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>提取博主模板</div>
              {!extBusy && <button style={{ border: "none", background: "none", cursor: "pointer", color: "var(--t2)" }} onClick={() => { setShowExtract(false); setExtStep(""); setExtStepIdx(-1); }}><I.X /></button>}
            </div>

            {/* Instructions */}
            <div style={{ background: "linear-gradient(135deg,#EFF6FF,#F0F9FF)", borderRadius: 12, padding: "14px 16px", marginBottom: 16, border: "1px solid #BFDBFE" }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#1E40AF", marginBottom: 10 }}>获取链接只需三步</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { t: (<>打开抖音 App，找到你喜欢的博主主页</>) },
                  { t: (<>点击主页右上角 <svg width="14" height="14" viewBox="0 0 24 24" style={{ verticalAlign: "-2px", margin: "0 1px" }}><circle cx="12" cy="12" r="11" fill="none" stroke="#334155" strokeWidth="1.8" /><circle cx="7" cy="12" r="1.5" fill="#334155" /><circle cx="12" cy="12" r="1.5" fill="#334155" /><circle cx="17" cy="12" r="1.5" fill="#334155" /></svg> 选择「分享名片」再点「复制链接」</>) },
                  { t: (<>回到这里，直接粘贴即可（包含文字也没关系）</>) },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#fff", border: "1.5px solid #93C5FD", color: "#3B82F6", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                    <div style={{ fontSize: 12, color: "#334155", lineHeight: 1.6 }}>{s.t}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--t1)" }}>博主链接 <span style={{ color: "#EF4444" }}>*</span></div>
                <input style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--bl)", borderRadius: 10, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} placeholder="直接粘贴复制的内容，如：7- 长按复制... https://v.douyin.com/xxx" value={extLink} onChange={e => setExtLink(e.target.value)} disabled={extBusy} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--t1)" }}>博主昵称 <span style={{ color: "#EF4444" }}>*</span></div>
                  <input style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--bl)", borderRadius: 10, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} placeholder="如：李佳琦" value={extName} onChange={e => setExtName(e.target.value)} disabled={extBusy} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: "var(--t1)" }}>内容品类</div>
                  <input style={{ width: "100%", padding: "10px 12px", border: "1.5px solid var(--bl)", borderRadius: 10, fontSize: 12, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }} placeholder="如：美妆带货（可留空）" value={extCat} onChange={e => setExtCat(e.target.value)} disabled={extBusy} />
                </div>
              </div>
            </div>

            {/* Progress indicator */}
            {extStepIdx >= 0 && (
              <div style={{ marginTop: 16, borderRadius: 12, overflow: "hidden", border: "1px solid", borderColor: extStep.startsWith("err:") ? "#FECACA" : extStepIdx === 4 ? "#BBF7D0" : "#E2E8F0" }}>
                <div style={{ background: extStep.startsWith("err:") ? "#FEF2F2" : extStepIdx === 4 ? "#F0FDF4" : "#F8FAFC", padding: "12px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                    {extBusy && <span style={{ display: "inline-block", width: 16, height: 16, border: "2.5px solid #DBEAFE", borderTopColor: "#3B82F6", borderRadius: "50%", animation: "spin .8s linear infinite", flexShrink: 0 }} />}
                    {extStepIdx === 4 && <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><I.Check /></div>}
                    {extStep.startsWith("err:") && <div style={{ width: 16, height: 16, borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "#fff", fontSize: 11, fontWeight: 700 }}>!</div>}
                    <span style={{ fontSize: 12, fontWeight: 600, color: extStep.startsWith("err:") ? "#DC2626" : extStepIdx === 4 ? "#16A34A" : "#1E40AF" }}>
                      {extStep.startsWith("err:") ? "提取遇到问题" : extStepIdx === 4 ? "提取完成" : EXT_STEPS[extStepIdx] + "..."}
                    </span>
                  </div>
                  {!extStep.startsWith("err:") && extStepIdx < 5 && (
                    <div style={{ background: "#E2E8F0", borderRadius: 99, height: 6, overflow: "hidden" }}>
                      <div style={{ height: "100%", borderRadius: 99, background: extStepIdx === 4 ? "#10B981" : "linear-gradient(90deg,#3B82F6,#6366F1)", transition: "width .5s ease", width: extStepIdx === 4 ? "100%" : (extStepIdx * 25 + 12) + "%" }} />
                    </div>
                  )}
                  {!extStep.startsWith("err:") && extStepIdx < 4 && (
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                      {EXT_STEPS.slice(0, 4).map((s, i) => <span key={i} style={{ fontSize: 9, color: i <= extStepIdx ? "#3B82F6" : "#94A3B8", fontWeight: i === extStepIdx ? 600 : 400, transition: "all .3s" }}>{s}</span>)}
                    </div>
                  )}
                  {extInfo && !extStep.startsWith("err:") && extStepIdx < 4 && <div style={{ marginTop: 6, fontSize: 11, color: "#64748B" }}>{extInfo}</div>}
                  {extStepIdx === 4 && <div style={{ marginTop: 4, fontSize: 11, color: "#16A34A" }}>{extInfo}</div>}
                </div>
                {extStep.startsWith("err:") && <div style={{ padding: "10px 16px", background: "#fff", borderTop: "1px solid #FECACA", fontSize: 10, color: "#92400E", whiteSpace: "pre-wrap", lineHeight: 1.6, maxHeight: 120, overflow: "auto" }}>{extStep.slice(4)}</div>}
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 14 }}>
              {!extBusy && extStepIdx !== 4 && <button style={{ padding: "8px 18px", border: "1.5px solid var(--bl)", borderRadius: 10, background: "var(--s)", color: "var(--t2)", fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setShowExtract(false); setExtStep(""); setExtStepIdx(-1); }}>取消</button>}
              {!extBusy && extStepIdx < 4 && <button style={{ padding: "8px 18px", border: "none", borderRadius: 10, background: "#3B82F6", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={runExtract}>{extStep.startsWith("err:") ? "重新提取" : "开始提取"}</button>}
              {extStepIdx === 4 && <button style={{ padding: "8px 18px", border: "none", borderRadius: 10, background: "#10B981", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }} onClick={() => { setShowExtract(false); setExtStep(""); setExtStepIdx(-1); }}>完成</button>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
