import { useState, useRef, useEffect, useCallback } from "react";

/* ═══ Icons ═══ */
const I = {
  User: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Sparkle: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  Zap: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Camera: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Refresh: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  X: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Download: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Play: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>,
  Mic: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  Plus: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Trash: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Image: () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  ChevD: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  ChevR: () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  Info: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
  Copy: () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Edit: () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
};

/* ═══ API config ═══ */
const API_BASE = "/api-proxy/v1";
const API_KEY = "sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b";
const hdrs = { "Content-Type": "application/json", Authorization: "Bearer " + API_KEY };

/* ═══ Preset avatars ═══ */
const PRESETS = [
  { id: "p1", nm: "商务男", tags: "商务 · 正式 · 专业", gender: "male", age: "30-35", style: "写实", color: "#3B82F6",
    imgUrl: "/avatars/p1.png",
    imgPrompt: "Professional headshot portrait of a Chinese businessman aged 30-35, wearing a navy blue suit with white shirt, clean-shaven, confident gentle smile, looking directly at camera, face occupying 60 percent of frame, soft studio lighting from front-left, shallow depth of field, plain light gray gradient background, shoulders and upper chest visible, natural skin texture, high resolution, photorealistic" },
  { id: "p2", nm: "知性女", tags: "知性 · 优雅 · 职场", gender: "female", age: "28-32", style: "写实", color: "#8B5CF6",
    imgUrl: "/avatars/p2.png",
    imgPrompt: "Professional headshot portrait of an elegant Chinese businesswoman aged 28-32, wearing a cream blazer, subtle professional makeup, warm soft smile, looking directly at camera, face occupying 60 percent of frame, soft even studio lighting, shallow depth of field, plain light beige gradient background, shoulders visible, natural skin texture, high resolution, photorealistic" },
  { id: "p3", nm: "活力少女", tags: "青春 · 活泼 · 亲和", gender: "female", age: "20-24", style: "写实", color: "#EC4899",
    imgUrl: "/avatars/p3.png",
    imgPrompt: "Headshot portrait of an energetic young Chinese woman aged 20-24, wearing a casual white t-shirt, bright cheerful smile showing teeth, youthful fresh look, looking directly at camera, face occupying 60 percent of frame, bright natural lighting, plain soft pink gradient background, shoulders visible, natural skin, high resolution, photorealistic" },
  { id: "p4", nm: "儒雅大叔", tags: "稳重 · 信赖 · 权威", gender: "male", age: "42-48", style: "写实", color: "#14B8A6",
    imgUrl: "/avatars/p4.png",
    imgPrompt: "Headshot portrait of a distinguished Chinese man aged 42-48, wearing thin-frame glasses and a dark gray turtleneck sweater, warm trustworthy expression with gentle smile, looking directly at camera, face occupying 60 percent of frame, soft warm studio lighting, plain dark gray gradient background, shoulders visible, natural skin texture, high resolution, photorealistic" },
  { id: "p5", nm: "甜美主播", tags: "甜美 · 种草 · 带货", gender: "female", age: "24-28", style: "写实", color: "#F59E0B",
    imgUrl: "/avatars/p5.png",
    imgPrompt: "Headshot portrait of a cute Chinese female livestreamer aged 24-28, wearing a light pink knit top, sweet charming smile, subtle ring light reflection in eyes, looking directly at camera, face occupying 60 percent of frame, soft ring light illumination, plain soft white background, shoulders visible, light natural makeup, high resolution, photorealistic" },
];

/* ═══ Voice options ═══ */
const VOICES = [
  { id: "alloy", nm: "Alloy", desc: "中性·沉稳", gender: "neutral" },
  { id: "echo", nm: "Echo", desc: "男声·温暖", gender: "male" },
  { id: "fable", nm: "Fable", desc: "叙事·沉浸", gender: "male" },
  { id: "onyx", nm: "Onyx", desc: "男声·深沉", gender: "male" },
  { id: "nova", nm: "Nova", desc: "女声·温柔", gender: "female" },
  { id: "shimmer", nm: "Shimmer", desc: "女声·明亮", gender: "female" },
];

/* ═══ Tone options ═══ */
const TONES = [
  { id: "professional", label: "专业严谨", emoji: "🎯" },
  { id: "warm", label: "亲切温暖", emoji: "☀️" },
  { id: "energetic", label: "活力激情", emoji: "🔥" },
  { id: "humorous", label: "幽默风趣", emoji: "😄" },
  { id: "calm", label: "沉稳大气", emoji: "🏔️" },
  { id: "casual", label: "轻松随性", emoji: "💬" },
];

/* ═══ Duration options ═══ */
const DURATIONS = [
  { id: "15s", label: "15秒", words: "60-75字", desc: "超短口播" },
  { id: "30s", label: "30秒", words: "120-150字", desc: "标准口播" },
  { id: "60s", label: "60秒", words: "240-300字", desc: "深度讲解" },
  { id: "90s", label: "90秒", words: "360-450字", desc: "详细介绍" },
  { id: "120s", label: "2分钟", words: "480-600字", desc: "长篇叙述" },
];

/* ═══ CSS ═══ */
const STYLES = `
.avs{display:flex;height:calc(100vh - 52px);overflow:hidden}
/* LEFT */
.avs-l{width:260px;min-width:260px;background:var(--s);border-right:1px solid var(--bl);display:flex;flex-direction:column}
.avs-l-hd{padding:16px 16px 12px;border-bottom:1px solid var(--bl)}
.avs-l-t{font-size:15px;font-weight:800;margin-bottom:2px}.avs-l-d{font-size:10px;color:var(--t3)}
.avs-l-sc{flex:1;overflow-y:auto;padding:10px 10px}.avs-l-sc::-webkit-scrollbar{width:4px}.avs-l-sc::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.avs-l-sec{font-size:10px;font-weight:700;color:var(--t3);letter-spacing:.6px;padding:10px 4px 6px}
.avs-ac{border:2px solid var(--bl);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .2s;margin-bottom:10px;position:relative}
.avs-ac:hover{border-color:var(--pl);transform:translateY(-1px);box-shadow:0 4px 12px rgba(0,0,0,.06)}
.avs-ac.on{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.avs-ac-img{height:150px;background:var(--s3);display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative}
.avs-ac-img img{width:100%;height:100%;object-fit:cover}
.avs-ac-badge{position:absolute;top:8px;right:8px;font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;color:#fff}
.avs-ac-del{position:absolute;top:8px;left:8px;width:22px;height:22px;border-radius:6px;background:rgba(0,0,0,.55);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:opacity .2s;z-index:2}
.avs-ac:hover .avs-ac-del{opacity:1}
.avs-ac-info{padding:10px 12px}.avs-ac-nm{font-size:13px;font-weight:700;margin-bottom:2px}.avs-ac-tags{font-size:10px;color:var(--t3)}
.avs-add{border:2px dashed var(--bl);border-radius:12px;padding:20px 12px;cursor:pointer;text-align:center;transition:all .2s;margin-bottom:10px}
.avs-add:hover{border-color:var(--pl);background:var(--pbg)}
/* CENTER */
.avs-c{flex:1;display:flex;flex-direction:column;background:var(--s2);overflow:hidden}
.avs-steps{display:flex;align-items:center;justify-content:center;gap:0;padding:14px 20px;background:var(--s);border-bottom:1px solid var(--bl)}
.avs-st{display:flex;align-items:center;gap:6px;padding:6px 12px;border-radius:8px;font-size:11px;font-weight:500;color:var(--t3);transition:all .2s;cursor:pointer}
.avs-st.done{color:var(--g)}.avs-st.on{color:var(--p);font-weight:700;background:var(--pbg)}
.avs-st-n{width:22px;height:22px;border-radius:50%;border:2px solid var(--bl);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;transition:all .2s;flex-shrink:0}
.avs-st.done .avs-st-n{background:var(--g);border-color:var(--g);color:#fff}
.avs-st.on .avs-st-n{background:var(--p);border-color:var(--p);color:#fff}
.avs-arr{color:var(--bl);margin:0 2px;font-size:10px}
.avs-prev{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;position:relative}
.avs-ph{width:280px;height:500px;border-radius:36px;background:#000;padding:12px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.15);transition:all .3s}
.avs-ph.land{width:500px;height:300px;border-radius:24px;padding:10px}
.avs-ph-in{width:100%;height:100%;border-radius:26px;background:#1a1a2e;overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative}
.avs-ph.land .avs-ph-in{border-radius:16px}
.avs-ph-notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:80px;height:22px;background:#000;border-radius:0 0 14px 14px;z-index:2}
.avs-ph.land .avs-ph-notch{display:none}
.avs-ph-in img,.avs-ph-in video{width:100%;height:100%;object-fit:cover}
.avs-ph-bar{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:100px;height:4px;background:rgba(255,255,255,.15);border-radius:2px;z-index:3}
.avs-playbtn{position:absolute;width:56px;height:56px;border-radius:50%;background:rgba(124,58,237,.85);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s;z-index:3;backdrop-filter:blur(4px)}
.avs-playbtn:hover{transform:scale(1.08);background:rgba(124,58,237,.95)}
.avs-empty{display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.25);font-size:12px}
.avs-loading{position:absolute;inset:0;background:rgba(0,0,0,.65);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:10px;z-index:5}
.avs-spin{display:inline-block;width:24px;height:24px;border:3px solid rgba(255,255,255,.2);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
.avs-spin-sm{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite}
/* RIGHT */
.avs-r{width:360px;min-width:360px;background:var(--s);border-left:1px solid var(--bl);display:flex;flex-direction:column}
.avs-r-hd{padding:18px 20px 14px;border-bottom:1px solid var(--bl)}
.avs-r-t{font-size:17px;font-weight:800;margin-bottom:2px}.avs-r-d{font-size:11px;color:var(--t3)}
.avs-r-sc{flex:1;overflow-y:auto;padding:0 20px 20px}.avs-r-sc::-webkit-scrollbar{width:4px}.avs-r-sc::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
/* sections */
.avs-sec{border-bottom:1px solid var(--bl);padding:16px 0}
.avs-sec:last-child{border-bottom:none}
.avs-sec-hd{display:flex;align-items:center;gap:8px;cursor:pointer;padding:2px 0;user-select:none}
.avs-sec-num{width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:800;flex-shrink:0;transition:all .2s}
.avs-sec-num.idle{background:var(--s3);color:var(--t3)}
.avs-sec-num.active{background:var(--pbg);color:var(--p)}
.avs-sec-num.done{background:var(--g);color:#fff}
.avs-sec-title{font-size:13px;font-weight:700;color:var(--t1);flex:1}
.avs-sec-status{font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
.avs-sec-arrow{color:var(--t3);transition:transform .2s}
.avs-sec-arrow.open{transform:rotate(180deg)}
.avs-sec-body{padding-top:12px}
/* form elements */
.avs-fg{margin-bottom:12px}
.avs-fg:last-child{margin-bottom:0}
.avs-fl{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:5px;display:flex;justify-content:space-between;align-items:center}
.avs-fl .req{color:#EF4444}
.avs-fl-act{font-size:10px;font-weight:600;color:var(--p);cursor:pointer;display:flex;align-items:center;gap:3px}
.avs-fl-act:hover{text-decoration:underline}
.avs-inp{width:100%;padding:9px 12px;border:1.5px solid var(--bl);border-radius:10px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s);transition:var(--tr);box-sizing:border-box}
.avs-inp:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}.avs-inp::placeholder{color:var(--t3)}
.avs-inp:disabled{opacity:.5;cursor:not-allowed}
.avs-sel{width:100%;padding:9px 12px;border:1.5px solid var(--bl);border-radius:10px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s);appearance:none;cursor:pointer;box-sizing:border-box}
.avs-row{display:flex;gap:10px}.avs-row>*{flex:1}
/* chips */
.avs-chips{display:flex;flex-wrap:wrap;gap:6px}
.avs-chip{padding:6px 12px;border-radius:8px;border:1.5px solid var(--bl);font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;background:var(--s);color:var(--t2);transition:all .15s;display:flex;align-items:center;gap:4px}
.avs-chip:hover{border-color:var(--pl)}.avs-chip.on{border-color:var(--p);background:var(--pbg);color:var(--p)}
/* screen toggle */
.avs-scr-btns{display:flex;gap:6px}
.avs-scr{flex:1;padding:8px;border-radius:8px;border:1.5px solid var(--bl);font-size:11px;font-weight:600;cursor:pointer;text-align:center;font-family:inherit;background:var(--s);color:var(--t2);transition:var(--tr)}
.avs-scr.on{border-color:var(--p);background:var(--pbg);color:var(--p)}
/* voice grid */
.avs-vg{display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px}
.avs-vc{padding:8px 6px;border-radius:8px;border:1.5px solid var(--bl);cursor:pointer;text-align:center;transition:all .15s;font-family:inherit;background:var(--s)}
.avs-vc:hover{border-color:var(--pl)}.avs-vc.on{border-color:var(--p);background:var(--pbg)}
.avs-vc-nm{font-size:11px;font-weight:700;margin-bottom:1px}.avs-vc-d{font-size:9px;color:var(--t3)}
.avs-vc.on .avs-vc-nm{color:var(--p)}
/* buttons */
.avs-btn{width:100%;padding:11px;border-radius:11px;font-size:13px;font-weight:700;cursor:pointer;border:none;font-family:inherit;color:#fff;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s;margin-top:8px}
.avs-btn:disabled{opacity:.45;cursor:default;transform:none!important;box-shadow:none!important}
.avs-btn.purple{background:linear-gradient(135deg,var(--p),var(--pl));box-shadow:0 4px 14px rgba(124,58,237,.25)}
.avs-btn.purple:hover:not(:disabled){transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.35)}
.avs-btn.blue{background:linear-gradient(135deg,#3B82F6,#6366F1);box-shadow:0 4px 14px rgba(59,130,246,.25)}
.avs-btn.blue:hover:not(:disabled){transform:translateY(-1px)}
.avs-btn.green{background:linear-gradient(135deg,#10B981,#059669);box-shadow:0 4px 14px rgba(16,185,129,.25)}
.avs-btn.green:hover:not(:disabled){transform:translateY(-1px)}
.avs-btn.ghost{background:var(--s);color:var(--t2);border:1.5px solid var(--bl);box-shadow:none}
.avs-btn.ghost:hover:not(:disabled){background:var(--s3)}
/* audio player */
.avs-ap{display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--s3);border-radius:10px;margin-top:8px}
.avs-ap-play{width:32px;height:32px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:all .2s}
.avs-ap-play:hover{background:var(--pd)}
.avs-ap-bar{flex:1;height:4px;background:var(--bl);border-radius:2px;overflow:hidden;cursor:pointer}
.avs-ap-fill{height:100%;background:var(--p);border-radius:2px;transition:width .1s linear}
.avs-ap-time{font-size:10px;color:var(--t3);font-variant-numeric:tabular-nums;min-width:32px}
.avs-ap-dl{width:28px;height:28px;border-radius:6px;border:1px solid var(--bl);background:var(--s);color:var(--t2);display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all .2s}
.avs-ap-dl:hover{background:var(--s3)}
/* status box */
.avs-status{margin-top:10px;border-radius:10px;border:1px solid var(--bl);overflow:hidden}
.avs-status-hd{padding:10px 12px;display:flex;align-items:center;gap:8px}
.avs-status-bar{height:5px;background:var(--bl)}
.avs-status-fill{height:100%;border-radius:2px;transition:width .5s ease}
.avs-status-msg{padding:6px 12px 10px;font-size:11px;line-height:1.7;white-space:pre-wrap}
/* hint box */
.avs-hint{background:var(--s3);border-radius:8px;padding:10px 12px;font-size:11px;color:var(--t2);line-height:1.6;margin-bottom:10px;display:flex;gap:8px;align-items:flex-start}
.avs-hint svg{flex-shrink:0;margin-top:2px;color:var(--t3)}
/* modal */
.avs-ov{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center}
.avs-modal{background:var(--s);border-radius:18px;padding:28px;width:520px;box-shadow:0 8px 40px rgba(0,0,0,.12);max-height:90vh;overflow-y:auto}
`;

/* ═══ API helpers ═══ */
const callGemini = async (prompt) => {
  const r = await fetch(API_BASE + "/chat/completions", { method: "POST", headers: hdrs,
    body: JSON.stringify({ model: "gemini-2.5-flash-preview-05-20", messages: [{ role: "user", content: prompt }], temperature: 0.8 }) });
  const d = await r.json();
  return d.choices?.[0]?.message?.content || "";
};

const genImage = async (prompt, size = "1024x1536") => {
  const r = await fetch(API_BASE + "/images/generations", { method: "POST", headers: hdrs,
    body: JSON.stringify({ model: "gpt-image-1", prompt, n: 1, size, quality: "high" }) });
  if (!r.ok) { const e = await r.text().catch(() => ""); throw new Error("图像生成失败: " + e.slice(0, 200)); }
  const buf = await r.arrayBuffer();
  const text = new TextDecoder().decode(buf);
  try {
    const d = JSON.parse(text);
    if (d.error) throw new Error(d.error.message);
    const item = d.data?.[0];
    if (item?.url) return item.url;
    if (item?.b64_json) return "data:image/png;base64," + item.b64_json;
    throw new Error("未返回图片数据");
  } catch (e) {
    if (e.message.includes("图像") || e.message.includes("未返回")) throw e;
    throw new Error("图像响应解析失败");
  }
};

const genTTS = async (text, voice = "nova", speed = 1.0) => {
  const r = await fetch(API_BASE + "/audio/speech", { method: "POST", headers: hdrs,
    body: JSON.stringify({ model: "tts-1-hd", input: text, voice, response_format: "mp3", speed }) });
  if (!r.ok) throw new Error("TTS失败: " + (await r.text()).slice(0, 200));
  return URL.createObjectURL(await r.blob());
};

const genVideoCreate = async (prompt, size = "720x1280", seconds = "8") => {
  const form = new FormData();
  form.append("model", "veo-3.1");
  form.append("prompt", prompt);
  form.append("size", size);
  form.append("seconds", seconds);
  const r = await fetch(API_BASE + "/videos", { method: "POST", headers: { Authorization: "Bearer " + API_KEY }, body: form });
  if (!r.ok) throw new Error("视频创建失败: " + (await r.text()).slice(0, 200));
  return r.json();
};

const genVideoPoll = async (id, onProgress, signal) => {
  for (let i = 0; i < 120; i++) {
    if (signal?.aborted) throw new Error("已取消");
    await new Promise(r => setTimeout(r, 3000));
    const r = await fetch(API_BASE + "/videos/" + id, { headers: { Authorization: "Bearer " + API_KEY }, signal });
    const j = await r.json();
    onProgress?.(j.progress || 0, j.status);
    if (j.status === "completed") return j.video_url || j.url || j.result_url;
    if (j.status === "failed") throw new Error(j.error?.message || "视频生成失败");
  }
  throw new Error("视频生成超时");
};

/* ══════════════════════════════════════
   AvatarStudio Component
   ══════════════════════════════════════ */
export default function AvatarStudio() {
  /* ─── State: Avatars ─── */
  const [customs, setCustoms] = useState(() => {
    try { return JSON.parse(localStorage.getItem("avs_custom") || "[]"); } catch { return []; }
  });
  const [selId, setSelId] = useState("p1");
  const sel = PRESETS.find(a => a.id === selId) || customs.find(a => a.id === selId) || PRESETS[0];
  const isPreset = PRESETS.some(a => a.id === selId);

  /* ─── State: Generated assets ─── */
  const [avatarImg, setAvatarImg] = useState(PRESETS[0].imgUrl);
  const [imgLoading, setImgLoading] = useState(false);
  const [ttsUrl, setTtsUrl] = useState(null);
  const [ttsLoading, setTtsLoading] = useState(false);
  const [scriptLoading, setScriptLoading] = useState(false);

  /* ─── State: Right panel form ─── */
  const [screen, setScreen] = useState("竖屏");
  const [theme, setTheme] = useState("");
  const [audience, setAudience] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("professional");
  const [duration, setDuration] = useState("30s");
  const [ctaType, setCta] = useState("关注");
  const [script, setScript] = useState("");
  const [voice, setVoice] = useState("nova");
  const [speed, setSpeed] = useState(1.0);
  const [bgType, setBgType] = useState("纯色");
  const [bgColor, setBgColor] = useState("#F5F5F5");

  /* ─── State: Audio player ─── */
  const [isPlaying, setIsPlaying] = useState(false);
  const [playProg, setPlayProg] = useState(0);
  const [audioDur, setAudioDur] = useState(0);
  const audioRef = useRef(null);

  /* ─── State: Video ─── */
  const [vidStep, setVidStep] = useState(0); // 0=idle, 1=gen, 2=done, -1=fail
  const [vidMsg, setVidMsg] = useState("");
  const [vidUrl, setVidUrl] = useState(null);
  const [vidProgress, setVidProgress] = useState(0);
  const vidAbortRef = useRef(null);

  /* ─── State: Section collapse ─── */
  const [openSec, setOpenSec] = useState(1);

  /* ─── State: Create avatar modal ─── */
  const [showCreate, setShowCreate] = useState(false);
  const [cName, setCName] = useState("");
  const [cDesc, setCDesc] = useState("");
  const [cGender, setCGender] = useState("female");
  const [cAge, setCAge] = useState("25-30");
  const [cStyle, setCStyle] = useState("写实");
  const [cBusy, setCBusy] = useState(false);
  const [cErr, setCErr] = useState("");

  /* ─── Derived: pipeline step (always 1-based for visible steps) ─── */
  const pStep = isPreset
    ? (!script.trim() ? 1 : !ttsUrl ? 2 : 3)
    : (!avatarImg ? 1 : !script.trim() ? 2 : !ttsUrl ? 3 : 4);

  /* ─── Persist customs ─── */
  useEffect(() => { localStorage.setItem("avs_custom", JSON.stringify(customs)); }, [customs]);

  /* ─── Audio events ─── */
  useEffect(() => {
    const au = audioRef.current; if (!au) return;
    const onT = () => setPlayProg(au.currentTime);
    const onL = () => setAudioDur(au.duration);
    const onE = () => { setIsPlaying(false); setPlayProg(0); };
    au.addEventListener("timeupdate", onT);
    au.addEventListener("loadedmetadata", onL);
    au.addEventListener("ended", onE);
    return () => { au.removeEventListener("timeupdate", onT); au.removeEventListener("loadedmetadata", onL); au.removeEventListener("ended", onE); };
  }, [ttsUrl]);

  /* ─── Helpers ─── */
  const fmtTime = (s) => { if (!s || isNaN(s)) return "0:00"; return Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0"); };
  const togglePlay = () => { const au = audioRef.current; if (!au) return; if (isPlaying) au.pause(); else au.play(); setIsPlaying(!isPlaying); };
  const resetDownstream = (from) => {
    if (from <= 2) { setScript(""); }
    if (from <= 3) { if (ttsUrl) URL.revokeObjectURL(ttsUrl); setTtsUrl(null); setIsPlaying(false); setPlayProg(0); }
    setVidUrl(null); setVidStep(0); setVidMsg("");
  };

  /* ─── Select avatar ─── */
  const selectAvatar = (id) => {
    setSelId(id);
    const preset = PRESETS.find(a => a.id === id);
    const custom = customs.find(a => a.id === id);
    setAvatarImg(preset?.imgUrl || custom?.imgUrl || null);
    resetDownstream(2);
    setOpenSec(1);
  };

  /* ─── Step 1: Generate avatar image ─── */
  const handleGenImage = async (customPrompt) => {
    if (imgLoading) return;
    setImgLoading(true);
    try {
      const prompt = customPrompt || sel.imgPrompt;
      const size = screen === "竖屏" ? "1024x1536" : "1536x1024";
      const url = await genImage(prompt, size);
      setAvatarImg(url);
      resetDownstream(2);
      setOpenSec(2); // auto-advance to next section
    } catch (e) { alert("形象生成失败: " + e.message); }
    finally { setImgLoading(false); }
  };

  /* ─── Step 2: AI generate script ─── */
  const handleGenScript = async () => {
    if (scriptLoading) return;
    setScriptLoading(true);
    try {
      const durInfo = DURATIONS.find(d => d.id === duration) || DURATIONS[1];
      const toneInfo = TONES.find(t => t.id === tone) || TONES[0];
      const prompt = `你是一位专业短视频口播文案策划师。请根据以下信息生成一段数字人口播文案。

【数字人形象】${sel.nm}（${sel.tags}）
【视频主题】${theme || "通用商务介绍"}
【目标受众】${audience || "泛人群"}
【核心卖点/要点】${keyPoints || "无特别指定"}
【语气风格】${toneInfo.label}
【目标时长】${durInfo.label}（约${durInfo.words}）
【结尾引导】${ctaType}

【写作要求】
1. 纯口播文案，只输出文案正文，不要画面描述、标题、标注
2. 100% 口语化，短句为主（每句≤15字），多用语气词（啊、哦、对吧、真的）
3. 字数严格控制在 ${durInfo.words} 范围内
4. 开头第一句必须有悬念/痛点/反问来留住观众（禁止"大家好我是XXX"类开场）
5. 中间层层递进，每2-3句一个节奏切换
6. 结尾用${ctaType}作为行动引导，自然不生硬
7. 适合${sel.gender === "male" ? "男性" : "女性"}声音朗读
8. 像真人自然说话，禁止书面语、文学词、标题体`;
      const result = await callGemini(prompt);
      setScript(result.replace(/^["""「」『』\s]+|["""「」『』\s]+$/g, "").trim());
      resetDownstream(3);
      setOpenSec(isPreset ? 2 : 3);
    } catch (e) { alert("文案生成失败: " + e.message); }
    finally { setScriptLoading(false); }
  };

  /* ─── Step 3: Generate TTS ─── */
  const handleGenTTS = async () => {
    if (!script.trim() || ttsLoading) return;
    setTtsLoading(true);
    try {
      if (ttsUrl) URL.revokeObjectURL(ttsUrl);
      const url = await genTTS(script, voice, speed);
      setTtsUrl(url);
      setIsPlaying(false); setPlayProg(0);
      setVidUrl(null); setVidStep(0);
      setOpenSec(isPreset ? 3 : 4);
    } catch (e) { alert("语音生成失败: " + e.message); }
    finally { setTtsLoading(false); }
  };

  /* ─── Step 4: Generate video ─── */
  const handleGenVideo = async () => {
    if (!avatarImg || !ttsUrl) return;
    const abort = new AbortController();
    vidAbortRef.current = abort;
    setVidStep(1); setVidProgress(0); setVidMsg("正在创建视频任务...");
    try {
      const size = screen === "竖屏" ? "720x1280" : "1280x720";
      const durSec = audioDur > 0 ? String(Math.min(12, Math.max(4, Math.ceil(audioDur)))) : "8";
      const videoPrompt = `${sel.nm || "数字人"} speaking to camera: a person delivering a scripted monologue directly to the viewer, gentle natural head movements, subtle hand gestures, professional studio lighting, ${bgType === "纯色" ? `solid ${bgColor} background` : "blurred modern office background"}, upper body framing, cinematic quality, photorealistic`;
      const created = await genVideoCreate(videoPrompt, size, durSec);
      if (!created?.id) throw new Error("未获得视频任务ID");
      setVidMsg(`视频生成中（ID: ${created.id.slice(-8)}）...`);
      const url = await genVideoPoll(created.id, (prog, status) => {
        setVidProgress(prog);
        const statusMap = { queued: "排队中", in_progress: "生成中" };
        setVidMsg(`${statusMap[status] || status}... ${prog}%`);
      }, abort.signal);
      setVidUrl(url);
      setVidStep(2); setVidProgress(100);
      setVidMsg("视频生成完成！");
    } catch (e) {
      if (e.name === "AbortError" || e.message === "已取消") { setVidStep(0); setVidMsg(""); }
      else { setVidStep(-1); setVidMsg("生成失败: " + e.message); }
    }
  };

  /* ─── Create custom avatar ─── */
  const handleCreateAvatar = async () => {
    if (!cName.trim()) { setCErr("请输入名称"); return; }
    setCBusy(true); setCErr("");
    try {
      const styleMap = { "写实": "photorealistic, studio portrait photography", "动漫": "anime illustration style, high quality", "3D": "3D rendered Pixar style, high quality" };
      const genderEn = cGender === "male" ? "man" : "woman";
      const prompt = `Professional headshot portrait of a Chinese ${genderEn} aged ${cAge}, ${cDesc || cName}, ${styleMap[cStyle]}, looking directly at camera, face occupying 60 percent of frame, soft even studio lighting, plain gradient background, shoulders and upper chest visible, neutral pleasant expression, high resolution`;
      const url = await genImage(prompt, "1024x1536");
      const newAv = { id: "c_" + Date.now(), nm: cName.trim(), tags: `${cGender === "male" ? "男" : "女"} · ${cAge} · ${cStyle}`, gender: cGender, age: cAge, style: cStyle, imgPrompt: prompt, imgUrl: url };
      setCustoms(prev => [...prev, newAv]);
      setSelId(newAv.id); setAvatarImg(url);
      setShowCreate(false); setCName(""); setCDesc(""); setCErr("");
      resetDownstream(2); setOpenSec(2);
    } catch (e) { setCErr("生成失败: " + e.message); }
    finally { setCBusy(false); }
  };

  /* ─── Section render helper (not a component, avoids remount) ─── */
  const renderSection = (num, title, status, children) => {
    const isOpen = openSec === num;
    const st = status === "done" ? "done" : (pStep >= num ? "active" : "idle");
    return (
      <div className="avs-sec" key={`sec-${num}`}>
        <div className="avs-sec-hd" onClick={() => setOpenSec(isOpen ? 0 : num)}>
          <div className={`avs-sec-num ${st}`}>{st === "done" ? <I.Check /> : num}</div>
          <div className="avs-sec-title">{title}</div>
          {status === "done" && <span className="avs-sec-status" style={{ background: "#ECFDF5", color: "#059669" }}>已完成</span>}
          {status === "ready" && <span className="avs-sec-status" style={{ background: "#EFF6FF", color: "#3B82F6" }}>待操作</span>}
          <span className={`avs-sec-arrow ${isOpen ? "open" : ""}`}><I.ChevD /></span>
        </div>
        {isOpen && <div className="avs-sec-body">{children}</div>}
      </div>
    );
  };

  const allStepLabels = ["生成形象", "编写文案", "语音合成", "生成视频"];
  const stepLabels = isPreset ? allStepLabels.slice(1) : allStepLabels;
  // Section numbering: preset → 1=口播 2=语音 3=视频; custom → 1=形象 2=口播 3=语音 4=视频
  const S = isPreset ? 0 : 1; // offset: section for 口播 = 1+S

  /* ═══ RENDER ═══ */
  return (
    <>
      <style>{STYLES}</style>
      {ttsUrl && <audio ref={audioRef} src={ttsUrl} preload="metadata" />}
      <div className="avs">
        {/* ═══ LEFT: Avatar Gallery ═══ */}
        <div className="avs-l">
          <div className="avs-l-hd">
            <div className="avs-l-t">数字人形象</div>
            <div className="avs-l-d">选择预设或生成自定义数字人</div>
          </div>
          <div className="avs-l-sc">
            <div className="avs-l-sec">预设形象</div>
            {PRESETS.map(av => (
              <div key={av.id} className={`avs-ac ${selId === av.id ? "on" : ""}`} onClick={() => selectAvatar(av.id)}>
                <div className="avs-ac-img">
                  <img src={av.imgUrl} alt={av.nm} />
                  <span className="avs-ac-badge" style={{ background: av.color }}>预设</span>
                </div>
                <div className="avs-ac-info"><div className="avs-ac-nm">{av.nm}</div><div className="avs-ac-tags">{av.tags}</div></div>
              </div>
            ))}
            {customs.length > 0 && <>
              <div className="avs-l-sec">我的数字人</div>
              {customs.map(av => (
                <div key={av.id} className={`avs-ac ${selId === av.id ? "on" : ""}`} onClick={() => selectAvatar(av.id)}>
                  <div className="avs-ac-img">
                    {av.imgUrl ? <img src={av.imgUrl} alt={av.nm} /> : <span style={{ fontSize: 28, opacity: .3 }}><I.User /></span>}
                    <span className="avs-ac-badge" style={{ background: "#10B981" }}>自定义</span>
                    <div className="avs-ac-del" onClick={e => { e.stopPropagation(); if (window.confirm("确认删除？")) { setCustoms(p => p.filter(a => a.id !== av.id)); if (selId === av.id) selectAvatar("p1"); } }}><I.Trash /></div>
                  </div>
                  <div className="avs-ac-info"><div className="avs-ac-nm">{av.nm}</div><div className="avs-ac-tags">{av.tags}</div></div>
                </div>
              ))}
            </>}
            <div className="avs-add" onClick={() => { setShowCreate(true); setCErr(""); }}>
              <div style={{ color: "var(--p)", marginBottom: 4 }}><I.Plus /></div>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--t2)" }}>生成自定义数字人</div>
              <div style={{ fontSize: 10, color: "var(--t3)" }}>AI 生成专属形象</div>
            </div>
          </div>
        </div>

        {/* ═══ CENTER: Preview ═══ */}
        <div className="avs-c">
          <div className="avs-steps">
            {stepLabels.map((s, i) => {
              const n = i + 1;
              const done = pStep > n; const on = pStep === n;
              return (<span key={i} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && <span className="avs-arr">→</span>}
                <span className={`avs-st ${done ? "done" : ""} ${on ? "on" : ""}`} onClick={() => setOpenSec(n)}>
                  <span className="avs-st-n">{done ? <I.Check /> : n}</span>{s}
                </span>
              </span>);
            })}
          </div>
          <div className="avs-prev">
            <div className={`avs-ph ${screen === "横屏" ? "land" : ""}`}>
              <div className="avs-ph-in">
                {screen === "竖屏" && <div className="avs-ph-notch" />}
                {vidUrl ? <video src={vidUrl} controls loop style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : avatarImg ? <img src={avatarImg} alt="avatar" />
                  : <div className="avs-empty"><I.Camera /><span>选择形象并点击「生成形象图片」</span></div>}
                {imgLoading && <div className="avs-loading"><span className="avs-spin" /><span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>AI 生成形象中...</span></div>}
                {vidStep === 1 && !imgLoading && <div className="avs-loading"><span className="avs-spin" /><span style={{ color: "#fff", fontSize: 12, fontWeight: 600 }}>视频生成中 {vidProgress}%</span></div>}
                {avatarImg && ttsUrl && !vidUrl && !imgLoading && vidStep !== 1 && <div className="avs-playbtn" onClick={togglePlay}>{isPlaying ? <I.Pause /> : <I.Play />}</div>}
                <div className="avs-ph-bar" />
              </div>
            </div>
          </div>
        </div>

        {/* ═══ RIGHT: Configuration ═══ */}
        <div className="avs-r">
          <div className="avs-r-hd">
            <div className="avs-r-t">视频配置</div>
            <div className="avs-r-d">按步骤配置，生成数字人口播视频</div>
          </div>
          <div className="avs-r-sc">
            {/* ─── 生成形象（仅自定义角色需要） ─── */}
            {!isPreset && renderSection(1, "生成数字人形象", avatarImg ? "done" : "ready", <>
              <div className="avs-hint"><I.Info /><span>数字人源图要求：正面面部占画面 60%，光线均匀，表情自然，无遮挡，简洁背景。AI 会自动按此标准生成。</span></div>
              <div className="avs-fg">
                <div className="avs-fl">当前形象</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "var(--p)" }}>{sel.nm} <span style={{ fontWeight: 400, color: "var(--t3)", fontSize: 11 }}>（{sel.tags}）</span></div>
              </div>
              <div className="avs-fg">
                <div className="avs-fl">屏幕比例</div>
                <div className="avs-scr-btns">
                  <button className={`avs-scr ${screen === "竖屏" ? "on" : ""}`} onClick={() => setScreen("竖屏")}>竖屏 9:16</button>
                  <button className={`avs-scr ${screen === "横屏" ? "on" : ""}`} onClick={() => setScreen("横屏")}>横屏 16:9</button>
                </div>
              </div>
              <button className="avs-btn purple" onClick={() => handleGenImage()} disabled={imgLoading}>
                {imgLoading ? <><span className="avs-spin-sm" /> 生成中（约15-30秒）...</> : <><I.Image /> {avatarImg ? "重新生成形象" : "生成形象图片"}</>}
              </button>
            </>)}

            {/* ─── 口播内容 ─── */}
            {renderSection(1+S, "口播内容配置", script.trim() ? "done" : (avatarImg ? "ready" : undefined), <>
              {isPreset && <div className="avs-fg">
                <div className="avs-fl">屏幕比例</div>
                <div className="avs-scr-btns">
                  <button className={`avs-scr ${screen === "竖屏" ? "on" : ""}`} onClick={() => setScreen("竖屏")}>竖屏 9:16</button>
                  <button className={`avs-scr ${screen === "横屏" ? "on" : ""}`} onClick={() => setScreen("横屏")}>横屏 16:9</button>
                </div>
              </div>}
              <div className="avs-fg">
                <div className="avs-fl">视频主题 <span className="req">*</span></div>
                <input className="avs-inp" value={theme} onChange={e => setTheme(e.target.value)} placeholder="如：2024护肤新趋势、新品发布、行业分析..." />
              </div>
              <div className="avs-fg">
                <div className="avs-fl">目标受众</div>
                <input className="avs-inp" value={audience} onChange={e => setAudience(e.target.value)} placeholder="如：25-35岁女性、企业决策者、大学生..." />
              </div>
              <div className="avs-fg">
                <div className="avs-fl">核心要点/卖点</div>
                <textarea className="avs-inp" rows={2} value={keyPoints} onChange={e => setKeyPoints(e.target.value)} placeholder="如：产品成分天然、价格优势、效果对比数据..." style={{ resize: "vertical" }} />
              </div>
              <div className="avs-row">
                <div className="avs-fg">
                  <div className="avs-fl">语气风格</div>
                  <div className="avs-chips">
                    {TONES.map(t => <span key={t.id} className={`avs-chip ${tone === t.id ? "on" : ""}`} onClick={() => setTone(t.id)}>{t.emoji} {t.label}</span>)}
                  </div>
                </div>
              </div>
              <div className="avs-row">
                <div className="avs-fg">
                  <div className="avs-fl">目标时长</div>
                  <div className="avs-chips">
                    {DURATIONS.map(d => <span key={d.id} className={`avs-chip ${duration === d.id ? "on" : ""}`} onClick={() => setDuration(d.id)}>{d.label}</span>)}
                  </div>
                </div>
              </div>
              <div className="avs-fg">
                <div className="avs-fl">结尾引导</div>
                <div className="avs-chips">
                  {["关注", "点赞收藏", "评论互动", "私信咨询", "链接购买", "无引导"].map(c => <span key={c} className={`avs-chip ${ctaType === c ? "on" : ""}`} onClick={() => setCta(c)}>{c}</span>)}
                </div>
              </div>
              <div className="avs-fg">
                <div className="avs-fl">
                  口播文案
                  <span className="avs-fl-act" onClick={handleGenScript}>
                    {scriptLoading ? "生成中..." : <><I.Sparkle /> AI 智能生成</>}
                  </span>
                </div>
                <textarea className="avs-inp" rows={7} value={script} onChange={e => { setScript(e.target.value); if (ttsUrl) { URL.revokeObjectURL(ttsUrl); setTtsUrl(null); } }} placeholder="输入主题后点击「AI 智能生成」，或手动编写口播文案..." style={{ resize: "vertical" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--t3)", marginTop: 3 }}>
                  <span>约 {Math.round(script.length / 4.5)} 秒口播</span>
                  <span>{script.length} 字</span>
                </div>
              </div>
            </>)}

            {/* ─── 语音合成 ─── */}
            {renderSection(2+S, "语音合成", ttsUrl ? "done" : (script.trim() ? "ready" : undefined), <>
              <div className="avs-fg">
                <div className="avs-fl">选择音色</div>
                <div className="avs-vg">
                  {VOICES.map(v => (
                    <div key={v.id} className={`avs-vc ${voice === v.id ? "on" : ""}`} onClick={() => setVoice(v.id)}>
                      <div className="avs-vc-nm">{v.nm}</div>
                      <div className="avs-vc-d">{v.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="avs-fg">
                <div className="avs-fl">语速 <span style={{ color: "var(--t3)", fontWeight: 400 }}>{speed}x</span></div>
                <input type="range" min="0.5" max="2.0" step="0.1" value={speed} onChange={e => setSpeed(parseFloat(e.target.value))} style={{ width: "100%", accentColor: "var(--p)" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 9, color: "var(--t3)", marginTop: 2 }}><span>慢 0.5x</span><span>正常 1.0x</span><span>快 2.0x</span></div>
              </div>
              <button className="avs-btn blue" onClick={handleGenTTS} disabled={ttsLoading || !script.trim()}>
                {ttsLoading ? <><span className="avs-spin-sm" /> 语音合成中...</> : <><I.Mic /> 生成语音</>}
              </button>
              {ttsUrl && (
                <div className="avs-ap">
                  <div className="avs-ap-play" onClick={togglePlay}>{isPlaying ? <I.Pause /> : <I.Play />}</div>
                  <div className="avs-ap-bar" onClick={e => { const au = audioRef.current; if (!au || !audioDur) return; const rect = e.currentTarget.getBoundingClientRect(); au.currentTime = ((e.clientX - rect.left) / rect.width) * audioDur; }}>
                    <div className="avs-ap-fill" style={{ width: audioDur ? (playProg / audioDur * 100) + "%" : "0%" }} />
                  </div>
                  <span className="avs-ap-time">{fmtTime(playProg)}/{fmtTime(audioDur)}</span>
                  <div className="avs-ap-dl" title="下载音频" onClick={() => { const a = document.createElement("a"); a.href = ttsUrl; a.download = `tts_${sel.nm}.mp3`; a.click(); }}><I.Download /></div>
                </div>
              )}
            </>)}

            {renderSection(3+S, "生成口播视频", vidUrl ? "done" : (ttsUrl ? "ready" : undefined), <>
              <div className="avs-hint"><I.Info /><span>将数字人肖像 + 语音合成为口播视频。AI 自动驱动面部表情、唇形同步和自然头部动作。</span></div>
              <div className="avs-fg">
                <div className="avs-fl">背景设置</div>
                <div className="avs-chips">
                  {["纯色", "办公室", "直播间", "虚化"].map(b => <span key={b} className={`avs-chip ${bgType === b ? "on" : ""}`} onClick={() => setBgType(b)}>{b}</span>)}
                </div>
              </div>
              {bgType === "纯色" && <div className="avs-fg">
                <div className="avs-fl">背景色</div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  {["#F5F5F5", "#E8F5E9", "#E3F2FD", "#FFF3E0", "#FCE4EC", "#1A1A2E"].map(c => (
                    <div key={c} onClick={() => setBgColor(c)} style={{ width: 28, height: 28, borderRadius: 8, background: c, border: bgColor === c ? "2.5px solid var(--p)" : "2px solid var(--bl)", cursor: "pointer", transition: "all .15s" }} />
                  ))}
                </div>
              </div>}
              <div style={{ background: "var(--s3)", borderRadius: 10, padding: "12px 14px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--t1)", marginBottom: 8 }}>生成概览</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 11, color: "var(--t2)" }}>
                  <span>数字人：<b style={{ color: "var(--t1)" }}>{sel.nm}</b></span>
                  <span>比例：<b style={{ color: "var(--t1)" }}>{screen === "竖屏" ? "9:16" : "16:9"}</b></span>
                  <span>文案：<b style={{ color: "var(--t1)" }}>{script.length}字</b></span>
                  <span>语音：<b style={{ color: "var(--t1)" }}>{audioDur ? fmtTime(audioDur) : "未生成"}</b></span>
                  <span>音色：<b style={{ color: "var(--t1)" }}>{VOICES.find(v => v.id === voice)?.nm}</b></span>
                  <span>背景：<b style={{ color: "var(--t1)" }}>{bgType}</b></span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="avs-btn green" style={{ flex: 1 }} onClick={handleGenVideo} disabled={!avatarImg || !ttsUrl || vidStep === 1}>
                  {vidStep === 1 ? <><span className="avs-spin-sm" /> 视频生成中...</> : <><I.Zap /> 生成口播视频</>}
                </button>
                {vidStep === 1 && <button className="avs-btn ghost" style={{ width: "auto", padding: "0 14px", marginTop: 0 }} onClick={() => vidAbortRef.current?.abort()}>取消</button>}
              </div>
              {vidStep !== 0 && (
                <div className="avs-status" style={{ borderColor: vidStep === -1 ? "#FECACA" : vidStep === 2 ? "#BBF7D0" : "var(--bl)" }}>
                  <div className="avs-status-hd">
                    {vidStep === 1 && <span className="avs-spin-sm" style={{ borderColor: "#DBEAFE", borderTopColor: "#3B82F6" }} />}
                    {vidStep === 2 && <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#10B981", display: "flex", alignItems: "center", justifyContent: "center" }}><I.Check /></div>}
                    {vidStep === -1 && <div style={{ width: 14, height: 14, borderRadius: "50%", background: "#EF4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 9, fontWeight: 800 }}>!</div>}
                    <span style={{ fontSize: 12, fontWeight: 600, color: vidStep === -1 ? "#DC2626" : vidStep === 2 ? "#16A34A" : "#1E40AF" }}>
                      {vidStep === 1 ? "生成中..." : vidStep === 2 ? "视频已生成" : "生成失败"}
                    </span>
                  </div>
                  {vidStep === 1 && <div className="avs-status-bar"><div className="avs-status-fill" style={{ width: vidProgress + "%", background: "linear-gradient(90deg,#3B82F6,#6366F1)", transition: "width .5s" }} /></div>}
                  {vidMsg && <div className="avs-status-msg" style={{ color: vidStep === -1 ? "#DC2626" : "#64748B" }}>{vidMsg}</div>}
                  {vidStep === 2 && vidUrl && (
                    <div style={{ marginTop: 8 }}>
                      <video src={vidUrl} controls style={{ width: "100%", borderRadius: 8, maxHeight: 260 }} />
                      <a href={vidUrl} target="_blank" rel="noreferrer" download style={{ display: "inline-flex", alignItems: "center", gap: 4, marginTop: 8, fontSize: 12, color: "var(--p)", fontWeight: 600, textDecoration: "none" }}>
                        <I.Download /> 下载视频
                      </a>
                    </div>
                  )}
                  {vidStep === -1 && <button className="avs-btn ghost" style={{ marginTop: 8, fontSize: 11 }} onClick={() => { setVidStep(0); setVidMsg(""); }}>重试</button>}
                </div>
              )}
            </>)}
          </div>
        </div>
      </div>

      {/* ═══ MODAL: Create custom avatar ═══ */}
      {showCreate && (
        <div className="avs-ov" onClick={e => { if (e.target === e.currentTarget && !cBusy) setShowCreate(false); }}>
          <div className="avs-modal">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800 }}>生成自定义数字人</div>
                <div style={{ fontSize: 12, color: "var(--t3)", marginTop: 2 }}>描述你的数字人形象，AI 按照口播视频标准生成肖像</div>
              </div>
              {!cBusy && <button style={{ border: "none", background: "none", cursor: "pointer", color: "var(--t2)" }} onClick={() => setShowCreate(false)}><I.X /></button>}
            </div>
            <div className="avs-hint"><I.Info /><span>AI 将自动确保：正面朝镜头、面部占60%、光线均匀、简洁背景——满足数字人视频驱动的最佳源图要求。</span></div>
            <div className="avs-fg">
              <div className="avs-fl">名称 <span className="req">*</span></div>
              <input className="avs-inp" value={cName} onChange={e => setCName(e.target.value)} placeholder="如：专业讲师、时尚博主、科技CEO..." disabled={cBusy} />
            </div>
            <div className="avs-fg">
              <div className="avs-fl">形象描述 <span style={{ color: "var(--t3)", fontWeight: 400, fontSize: 10 }}>越详细效果越好</span></div>
              <textarea className="avs-inp" rows={3} value={cDesc} onChange={e => setCDesc(e.target.value)} placeholder="如：30岁左右，短发干练，穿白色衬衫，戴细框眼镜，温和自信的微笑，知性气质..." disabled={cBusy} style={{ resize: "vertical" }} />
            </div>
            <div className="avs-row" style={{ marginBottom: 12 }}>
              <div className="avs-fg">
                <div className="avs-fl">性别</div>
                <div className="avs-scr-btns">
                  <button className={`avs-scr ${cGender === "female" ? "on" : ""}`} onClick={() => setCGender("female")}>女性</button>
                  <button className={`avs-scr ${cGender === "male" ? "on" : ""}`} onClick={() => setCGender("male")}>男性</button>
                </div>
              </div>
              <div className="avs-fg">
                <div className="avs-fl">年龄段</div>
                <div className="avs-chips">
                  {["20-25", "25-30", "30-35", "35-45", "45+"].map(a => <span key={a} className={`avs-chip ${cAge === a ? "on" : ""}`} onClick={() => setCAge(a)}>{a}</span>)}
                </div>
              </div>
            </div>
            <div className="avs-fg">
              <div className="avs-fl">画风</div>
              <div className="avs-chips">
                {["写实", "动漫", "3D"].map(s => <span key={s} className={`avs-chip ${cStyle === s ? "on" : ""}`} onClick={() => setCStyle(s)}>{s}</span>)}
              </div>
            </div>
            {cErr && <div style={{ padding: "8px 12px", background: "#FEF2F2", borderRadius: 8, fontSize: 12, color: "#DC2626", marginBottom: 12 }}>{cErr}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 16 }}>
              {!cBusy && <button className="avs-btn ghost" style={{ width: "auto", padding: "9px 18px", marginTop: 0 }} onClick={() => setShowCreate(false)}>取消</button>}
              <button className="avs-btn purple" style={{ width: "auto", padding: "9px 22px", marginTop: 0 }} onClick={handleCreateAvatar} disabled={cBusy}>
                {cBusy ? <><span className="avs-spin-sm" /> 生成中（约20秒）...</> : <><I.Sparkle /> 生成数字人</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
