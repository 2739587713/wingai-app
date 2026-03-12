import { useState, useRef, useEffect } from "react";

const I={
  Zap:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
  Plus:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Grid:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>,
  Layers:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
  User:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
  Folder:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>,
  Search:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Clock:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Fire:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M12 23c-3.6 0-8-2.4-8-7.7 0-3.5 2.1-6.4 4-8.8.6-.8 1.8-.3 1.7.7-.2 1.6.3 3.3 1.5 4.5.2.2.5.1.6-.2.4-1.6 1.5-3.5 3.2-5.2.5-.5 1.4-.2 1.4.5 0 2.2.8 4.1 2.1 5.5.9 1 1.5 2.3 1.5 3.8 0 4-3 6.9-8 6.9z"/></svg>,
  ChevronR:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>,
  ChevronD:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9"/></svg>,
  ArrowL:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>,
  ArrowR:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Camera:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>,
  Sparkle:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.2L22 12l-7.6 2.8L12 22l-2.4-7.2L2 12l7.6-2.8z"/></svg>,
  Send:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>,
  Mic:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>,
  Trash:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Edit:()=><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  Copy:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>,
  Download:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Refresh:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>,
  Eye:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Bot:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><line x1="12" y1="7" x2="12" y2="11"/></svg>,
  Bulb:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z"/></svg>,
  Link:()=><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
  BarChart:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  X:()=><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Check:()=><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  TglOn:()=><svg width="34" height="18" viewBox="0 0 34 18"><rect width="34" height="18" rx="9" fill="#7C3AED"/><circle cx="25" cy="9" r="6.5" fill="white"/></svg>,
  TglOff:()=><svg width="34" height="18" viewBox="0 0 34 18"><rect width="34" height="18" rx="9" fill="#D4D4D8"/><circle cx="9" cy="9" r="6.5" fill="white"/></svg>,
  People:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Image:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  Calendar:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Activity:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  Target:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  History:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M12 7v5l4 2"/></svg>,
  Settings:()=><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68V3a2 2 0 1 1 4 0v.09c.08.55.44 1.03 1 1.24a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9c.2.56.69.92 1.24 1H21a2 2 0 1 1 0 4h-.09c-.55.08-1.03.44-1.24 1z"/></svg>,
};

const TEMPLATES=[
  {id:0,name:"不使用模板",desc:"自由创作，不套用任何模板框架",badges:[],isNone:true},
  {id:1,name:"李佳琦种草公式",plat:"抖音",desc:"OMG 买它逻辑，强调痛点+即时效果+价格锚点",badges:[{t:"完播率 +25%",c:"conv"},{t:"高转化",c:"auth"}]},
  {id:2,name:"张同学乡村叙事",plat:"抖音",desc:"快节奏剪辑+沉浸式生活场景，软植入自然不突兀",badges:[{t:"完播率 +30%",c:"exp"},{t:"生活化",c:"exp"}]},
  {id:3,name:"罗永浩理性测评",plat:"视频号",desc:"参数罗列+幽默吐槽+硬核对比，建立信任感",badges:[{t:"完播率 +22%",c:"conv"},{t:"专业测评",c:"auth"}]},
  {id:4,name:"PAS痛点放大法",plat:"通用",desc:"Problem - Agitation - Solution，经典营销理论实践",badges:[{t:"完播率 +18%",c:"conv"},{t:"理论模型",c:"auth"}]},
  {id:5,name:"薇娅直播切片",plat:"抖音",desc:"限时抢购+库存紧张+价格优势，直播电商转化核心",badges:[{t:"完播率 +28%",c:"conv"},{t:"紧迫感",c:"exp"}]},
  {id:6,name:"小红书种草笔记",plat:"小红书",desc:"真实体验+使用心得+购买链接，图文并茂分享",badges:[{t:"完播率 +20%",c:"exp"},{t:"种草分享",c:"exp"}]},
  {id:7,name:"剧情反转套路",plat:"抖音",desc:"开头悬念+中段反转+结尾转化，抓住用户好奇心",badges:[{t:"完播率 +35%",c:"exp"},{t:"高互动",c:"exp"}]},
  {id:8,name:"AIDA营销模型",plat:"通用",desc:"Attention引起注意 - Interest产生兴趣 - Desire激发欲望 - Action促成行动",badges:[{t:"完播率 +24%",c:"conv"},{t:"经典模型",c:"auth"}]},
];
const SCRIPTS=[
  {id:1,name:"实验对比型",dur:"45s",shots:8,sell:3,desc:"通过前后效果强烈对比，快速建立用户信任，适合新品推广",badges:[{t:"转化率 +20%",c:"conv"},{t:"高转化",c:"auth"}],logic:["痛点挖掘：识别用户肌肤问题","产品引入：展示产品特性","效果对比：前后状态强烈对比","信任背书：用户好评+专业认证","行动号召：引导购买决策"],
   table:[{shot:1,dur:"3秒",scene:"模特面部特写，显示问题肌肤",copy:"肌肤问题严重，急需改善",risk:true,intent:"黄金3秒吸睛"},{shot:2,dur:"5秒",scene:"产品包装特写",copy:"这款面膜蕴含XX精华，温和不刺激",risk:false,intent:"产品展示"},{shot:3,dur:"8秒",scene:"面膜敷在脸上",copy:"15分钟深层滋养，肌肤瞬间水润",risk:false,intent:"使用过程"},{shot:4,dur:"6秒",scene:"取下面膜",copy:"看，肌肤立刻水嫩透亮",risk:false,intent:"效果展示"},{shot:5,dur:"7秒",scene:"前后对比分屏",copy:"前后对比如此明显",risk:false,intent:"强烈对比"},{shot:6,dur:"5秒",scene:"好评截图",copy:"千万用户见证",risk:false,intent:"社会证明"},{shot:7,dur:"6秒",scene:"价格信息",copy:"现在下单享受8折",risk:false,intent:"价格优势"},{shot:8,dur:"5秒",scene:"购买按钮",copy:"立即购买",risk:false,intent:"行动召唤"}]},
  {id:2,name:"痛点故事型",dur:"50s",shots:10,sell:4,desc:"通过真实生活场景引发共鸣",badges:[{t:"曝光量 +35%",c:"exp"},{t:"高曝光",c:"exp"}],logic:["场景代入","情感共鸣","转折引入","效果见证"],table:[]},
  {id:3,name:"专家测评型",dur:"55s",shots:12,sell:5,desc:"专业角度分析成分功效，建立权威性",badges:[{t:"转化率 +15%",c:"conv"},{t:"专业权威",c:"auth"}],logic:["专家背书","成分解析","实验验证","用户反馈"],table:[]},
];
const SHOTS=[
  {text:"看这面膜每一片啊，全都这个肤感可温和可水润了。敏感肌学生党约会前别慌！",note:"单片面膜展示特写"},
  {text:"上次久重逢我脸干到爆皮，室友丢给我的这个，敷完又白又嫩。",note:"手部展示面膜质地"},
  {text:"这种温和配方，连敏感肌都能安心使用，补水效果立竿见影。",note:"多片面膜组合陈列"},
  {text:"现在库存有限，前100名下单还送同系列眼膜，赶紧抢购吧！",note:"产品包装及赠品展示"},
  {text:"记得点击下方链接，现在下单享受限时优惠价格，错过就没有了哦！",note:"购买按钮特写及倒计时"},
];
const REFS=[
  {tag:"极致数 · 肌肤奢享",color:"#DC2626",bg:"#FEE2E2",dur:"56s",text:"肌肤暗沉无光，是不是让你失去了自信光芒？...",more:"+4个镜头"},
  {tag:"创意款 · 场景种草",color:"#2563EB",bg:"#DBEAFE",dur:"56s",text:"工作、学习、社交，每天步履不停，肌肤也跟着疲惫暗沉...",more:"+4个镜头"},
];
const PROJECTS=[
  {id:1,title:"玻尿酸面膜 · 种草视频",desc:"实验对比型 · 60秒",status:"done",st:"已完成",tmpl:"实验对比型",date:"3天前",shots:8},
  {id:2,title:"美白精华 · 测评脚本",desc:"专家测评型 · 45秒",status:"progress",st:"生成中",tmpl:"专家测评型",date:"1天前",shots:12},
  {id:3,title:"胶原蛋白粉 · 痛点故事",desc:"痛点故事型 · 50秒",status:"draft",st:"草稿",tmpl:"痛点故事型",date:"5天前",shots:10},
];
const TMPLLIB=[
  {id:1,name:"李佳琦种草公式",plat:"抖音",desc:"OMG 买它逻辑，强调痛点+即时效果+价格锚点",tags:["美妆头部","高转化"],stat:"+25%",uses:"新上线"},
  {id:2,name:"张同学乡村叙事",plat:"抖音",desc:"快节奏剪辑+沉浸式生活场景，软植入自然不突兀",tags:["三农/食品","生活化"],stat:"+30%",uses:"1.2w+次"},
  {id:3,name:"罗永浩理性测评",plat:"视频号",desc:"参数罗列+幽默吐槽+硬核对比，建立信任感",tags:["数码3C","专业测评"],stat:"+22%",uses:"8.5k+次"},
  {id:4,name:"PAS痛点放大法",plat:"通用",desc:"Problem - Agitation - Solution，经典营销理论",tags:["知识付费","理论模型"],stat:"+18%",uses:"15.3k+次"},
  {id:5,name:"小红书种草笔记",plat:"小红书",desc:"真实体验+使用心得+购买链接，图文并茂",tags:["美妆护肤","种草"],stat:"+20%",uses:"3.2k+次"},
  {id:6,name:"薇娅直播切片",plat:"抖音",desc:"限时抢购+库存紧张+价格优势，直播电商核心",tags:["电商直播","紧迫感"],stat:"+28%",uses:"5.7k+次"},
];

// Sidebar navigation structure
const NAV=[
  {group:"",items:[{k:"dash",icon:<I.Grid/>,label:"工作台"}]},
  {group:"AI 创作",items:[
    {k:"aicreate",icon:<I.Sparkle/>,label:"AI创作",accent:true,action:"modal"},
    {k:"avatar",icon:<I.People/>,label:"数字人生成"},
    {k:"imgtext",icon:<I.Image/>,label:"图文AI制作"},
  ]},
  {group:"运营管理",items:[
    {k:"schedule",icon:<I.Calendar/>,label:"排期发布"},
    {k:"adkol",icon:<I.Target/>,label:"投流达人"},
    {k:"analytics",icon:<I.Activity/>,label:"数据复盘"},
  ]},
  {group:"",items:[
    {k:"history",icon:<I.History/>,label:"创作历史"},
    {k:"settings",icon:<I.Settings/>,label:"设置"},
  ]},
];

export default function App(){
  const [pg,setPg]=useState("dash");
  const [modal,setModal]=useState(false);
  const [mStep,setMStep]=useState(0);
  const [mMode,setMMode]=useState("quick");
  const [selTmpl,setSelTmpl]=useState(null);
  const [cs,setCs]=useState("results");
  const [prod,setProd]=useState("面膜");
  const [cat,setCat]=useState("美妆护肤");
  const [dur,setDur]=useState("30秒");
  const [dataOn,setDataOn]=useState(true);
  const [adopted,setAdopted]=useState(null);
  const [showSc,setShowSc]=useState(false);
  const [editIdx,setEditIdx]=useState(null);
  const [sbEdit,setSbEdit]=useState(null);
  const [histTab,setHistTab]=useState(0);
  const [vgPct,setVgPct]=useState(0);
  const [vgStep,setVgStep]=useState(0);
  const [anaTab,setAnaTab]=useState(2);
  useEffect(()=>{
    if(cs!=="generating")return;
    setVgPct(0);setVgStep(0);
    const t1=setTimeout(()=>{setVgPct(25);setVgStep(1);},600);
    const t2=setTimeout(()=>{setVgPct(50);setVgStep(2);},1800);
    const t3=setTimeout(()=>{setVgPct(80);setVgStep(3);},3200);
    const t4=setTimeout(()=>{setVgPct(100);setVgStep(4);},4500);
    const t5=setTimeout(()=>setCs("preview"),5200);
    return()=>{clearTimeout(t1);clearTimeout(t2);clearTimeout(t3);clearTimeout(t4);clearTimeout(t5);};
  },[cs]); // storyboard edit modal index
  const [pi,setPi]=useState("");
  const [tTab,setTTab]=useState("KOL风格");
  const [fp,setFp]=useState("全部");
  const [aiTemplates,setAiTemplates]=useState(()=>{try{const raw=JSON.parse(localStorage.getItem("aiTmpls")||"[]");return raw.flatMap(x=>x.templates?x.templates.map(t=>({_creator:x.name||x._creator,...t})):[x]);}catch{return [];}});
  const [libSelTmpl,setLibSelTmpl]=useState(null);
  const [showImport,setShowImport]=useState(false);
  const [importTxt,setImportTxt]=useState("");
  const [delMode,setDelMode]=useState(false);
  const [delSel,setDelSel]=useState([]);
  const [showExtract,setShowExtract]=useState(false);
  const [extLink,setExtLink]=useState("");
  const [extName,setExtName]=useState("");
  const [extCat,setExtCat]=useState("");
  const [extStep,setExtStep]=useState("");
  const [extBusy,setExtBusy]=useState(false);
  const [aiGenStep,setAiGenStep]=useState("");
  const [aiScripts,setAiScripts]=useState([]);
  // tool pages
  const [hotLink,setHotLink]=useState("");
  const [hotIndustry,setHotIndustry]=useState("");
  const [hotProduct,setHotProduct]=useState("");
  const [hotReq,setHotReq]=useState("");
  const [posMain,setPosMain]=useState("");
  const [posInd,setPosInd]=useState("");
  const [posDepth,setPosDepth]=useState("standard");
  const [posDouyinLink,setPosDouyinLink]=useState("");
  const [posCompLinks,setPosCompLinks]=useState("");
  // avatar page
  const [avSel,setAvSel]=useState(0);
  const [avTheme,setAvTheme]=useState("");
  const [avScript,setAvScript]=useState("");
  const [avType,setAvType]=useState("口播");
  const [avScreen,setAvScreen]=useState("竖屏");
  const [avDur,setAvDur]=useState("15s-30s");
  // imgtext page
  const [itPlat,setItPlat]=useState("微信公众号");
  const [itTitle,setItTitle]=useState("");
  const [itStyle,setItStyle]=useState("专业严谨");
  const [itContent,setItContent]=useState("");
  // schedule page
  const [schMonth,setSchMonth]=useState(new Date().getMonth());
  const [schYear,setSchYear]=useState(new Date().getFullYear());
  const [schModal,setSchModal]=useState(false);
  const [schTab,setSchTab]=useState(0);
  const [schColor,setSchColor]=useState(0);
  const getCalDays=()=>{
    const first=new Date(schYear,schMonth,1);const last=new Date(schYear,schMonth+1,0);
    const startDay=(first.getDay()+6)%7;const days=[];
    const prev=new Date(schYear,schMonth,0).getDate();
    for(let i=startDay-1;i>=0;i--)days.push({d:prev-i,cur:false});
    for(let i=1;i<=last.getDate();i++)days.push({d:i,cur:true,today:i===new Date().getDate()&&schMonth===new Date().getMonth()&&schYear===new Date().getFullYear()});
    while(days.length<42)days.push({d:days.length-last.getDate()-startDay+1,cur:false});
    return days;
  };
  // IP interview
  const [ipFlow,setIpFlow]=useState(false);
  const [ipStep,setIpStep]=useState(0); // 0=mode, 1=basic, 2=interview, 3=done
  const [ipName,setIpName]=useState("");
  const [ipIndustry,setIpIndustry]=useState("");
  const [ipRole,setIpRole]=useState("");
  const [ipPhase,setIpPhase]=useState(0); // 0-3 interview phases
  const [ipQIdx,setIpQIdx]=useState(0);
  const [ipAnswers,setIpAnswers]=useState([]);
  const [ipCurAns,setIpCurAns]=useState("");
  const [ipEditing,setIpEditing]=useState(null); // index being re-answered
  const [ipProfile,setIpProfile]=useState({field:"",biz:"",clients:"",duty:"",scale:"",stance:"",think:"",style:""});
  const [ipEditField,setIpEditField]=useState(null);
  const ivRef=useRef(null);
  useEffect(()=>{if(ivRef.current)setTimeout(()=>{ivRef.current.scrollTop=ivRef.current.scrollHeight;},50);},[ipAnswers,ipPhase,ipQIdx,ipEditing]);
  const ipPhases=[
    {name:"背景采集",sub:"事实信息"},
    {name:"热点观点",sub:"立场态度"},
    {name:"认知挖掘",sub:"深层思维"},
    {name:"表达采样",sub:"语言风格"},
  ];
  const getIpQ=(phase,qIdx,name,industry)=>{
    const qs=[
      // phase 0: background
      [`你好，${name||"朋友"}！很高兴今天能和你聊聊。您刚才提到您是在${industry||"您的"}行业，能具体讲讲您所在的细分领域是什么吗？`,`好的。那您方便介绍一下，您目前所在的公司主要的核心业务是什么吗？比如是做产品、服务、咨询，还是其他方面？`,`了解了。那您公司主要是为哪些客户提供服务或产品呢？比如是个人用户、企业客户，还是政府机构？`,`那您目前在公司里，主要负责哪方面的工作呢？比如是产品开发、市场销售，还是运营管理？`,`最后一个背景问题：您目前所在的公司，大概有多少员工呢？比如是几十人、几百人，还是上千人的规模？`],
      // phase 1: opinions
      [`接下来聊聊您对行业的看法。您觉得${industry||"您所在的"}行业目前最大的变化或趋势是什么？`,`有意思！那您对这个趋势持什么态度？是拥抱变化还是谨慎观望？为什么？`,`如果让您给刚入行的新人一个最重要的建议，您会说什么？`],
      // phase 2: deep thinking
      [`现在我想了解您更深层的思考方式。在工作中遇到难题时，您通常的解决思路是什么？`,`您觉得自己和同行最大的不同是什么？有什么独特的方法论或理念吗？`,`如果用一句话总结您做事的核心原则，会是什么？`],
      // phase 3: expression style
      [`最后一个环节，我想感受一下您的表达方式。请用您最自然的方式，向观众介绍一下您是做什么的？`,`如果录一条60秒的短视频，开头第一句话您会怎么说来吸引观众？`,`最后，请用您的风格给观众一句结尾的话，让他们想关注您。`],
    ];
    return qs[phase]?.[qIdx]||"感谢你的回答！";
  };
  const ipSubmitAns=()=>{
    if(!ipCurAns.trim())return;
    if(ipEditing!==null){
      const na=[...ipAnswers];na[ipEditing]={...na[ipEditing],a:ipCurAns};setIpAnswers(na);setIpEditing(null);setIpCurAns("");return;
    }
    const newA=[...ipAnswers,{phase:ipPhase,q:getIpQ(ipPhase,ipQIdx,ipName,ipIndustry),a:ipCurAns}];
    setIpAnswers(newA);setIpCurAns("");
    const phaseLens=[5,3,3,3];
    const nextQ=ipQIdx+1;
    if(nextQ>=phaseLens[ipPhase]){
      if(ipPhase<3){setIpPhase(ipPhase+1);setIpQIdx(0);}
      else{setIpStep(3);
        setIpProfile({field:newA[0]?.a||"",biz:newA[1]?.a||"",clients:newA[2]?.a||"",duty:newA[3]?.a||"",scale:newA[4]?.a||"",stance:newA[6]?.a||"",think:newA[9]?.a||"",style:newA[11]?.a||""});
      }
    }else{setIpQIdx(nextQ);}
  };
  const [ci,setCi]=useState("");
  const [msgs,setMsgs]=useState([{r:"bot",c:"你好！我是你的短视频创作顾问\n\n告诉我你想创作什么内容，或者你的产品/服务是什么——",acts:["找抖音热点","分析爆款案例","获取创作灵感"]}]);
  const chatRef=useRef(null);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs]);

  const openModal=(m,lt=null)=>{setModal(true);setMStep(lt?2:m?2:0);setMMode(m||"quick");setSelTmpl(TEMPLATES[0]);setLibSelTmpl(lt);};
  const TH_KEY="k40dDp4s0V2pqHGuTJC15k36ahixSsFavT3U7EyjUv29lHOfJWWZUAqRMw==";
  const thGet=async(ep,params)=>{const u=new URL("/tikhub-proxy"+ep,location.origin);if(params)Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));for(let i=0;i<3;i++){try{const r=await fetch(u,{headers:{"Authorization":"Bearer "+TH_KEY}});if(r.ok)return await r.json();}catch{}if(i<2)await new Promise(r=>setTimeout(r,2000*(i+1)));}return null;};
  const thPost=async(ep,body)=>{for(let i=0;i<3;i++){try{const r=await fetch("/tikhub-proxy"+ep,{method:"POST",headers:{"Authorization":"Bearer "+TH_KEY,"Content-Type":"application/json"},body:JSON.stringify(body)});if(r.ok)return await r.json();}catch{}if(i<2)await new Promise(r=>setTimeout(r,2000*(i+1)));}return null;};
  const extSteps=["解析链接","获取视频列表","获取视频详情","AI深度分析","完成"];
  const [extStepIdx,setExtStepIdx]=useState(-1);
  const [extInfo,setExtInfo]=useState("");
  const runExtract=async()=>{
    if(!extLink.trim()||!extName.trim()){alert("请填写博主链接和昵称");return;}
    setExtBusy(true);setExtStepIdx(0);setExtStep("");setExtInfo("");
    try{
      const urlMatch=extLink.match(/https?:\/\/\S+/);let rawUrl=urlMatch?urlMatch[0].replace(/[.,，。]+$/,""):extLink.trim();
      let secUid="";
      const uidMatch=rawUrl.match(/\/user\/([A-Za-z0-9_-]{20,})/);
      if(uidMatch){secUid=uidMatch[1];}
      else{
        setExtInfo("展开短链接...");
        try{const ac=new AbortController();const tm=setTimeout(()=>ac.abort(),15000);const er=await fetch("/expand-url?url="+encodeURIComponent(rawUrl),{signal:ac.signal});clearTimeout(tm);const ej=await er.json();console.log("[extract] expand-url result:",ej.url);if(ej.url){rawUrl=ej.url;const m2=rawUrl.match(/\/user\/([A-Za-z0-9_-]{20,})/);if(m2)secUid=m2[1];if(!secUid&&ej.body){const m3=ej.body.match(/\/user\/([A-Za-z0-9_-]{20,})/);if(m3)secUid=m3[1];}}}catch(ex){console.log("[extract] expand-url failed:",ex.message);}
        if(!secUid){setExtInfo("通过API解析...");for(const ep of["/api/v1/douyin/web/fetch_user_profile_by_url","/api/v1/douyin/app/v3/fetch_user_profile_by_url"]){setExtInfo("API解析中... "+ep.split("/").pop());const d=await thGet(ep,{url:rawUrl});console.log("[extract] TikHub",ep.split("/").pop(),"result:",d?Object.keys(d):"null");if(d){for(const path of[["data","user","sec_uid"],["data","sec_uid"],["data","user_info","sec_uid"]]){try{let v=d;for(const k of path)v=v[k];if(v){secUid=v;break;}}catch{}}if(secUid)break;}}}
      }
      if(!secUid){setExtStep("err:无法解析博主链接，请确认链接正确");setExtBusy(false);return;}
      setExtStepIdx(1);setExtInfo("");
      let videoIds=[];let cursor=0;
      for(const ep of["/api/v1/douyin/web/fetch_user_post_videos","/api/v1/douyin/app/v3/fetch_user_post_videos"]){
        videoIds=[];cursor=0;
        while(videoIds.length<30){const d=await thGet(ep,{sec_user_id:secUid,count:Math.min(20,30-videoIds.length),max_cursor:cursor});if(!d)break;const items=(d.data||{}).aweme_list||[];if(!items.length)break;for(const it of items){const aid=it.aweme_id||it.video?.vid||"";if(aid)videoIds.push({id:String(aid),title:(it.desc||"").trim(),digg:(it.statistics||{}).digg_count||0,comment:(it.statistics||{}).comment_count||0,share:(it.statistics||{}).share_count||0});}setExtInfo("已获取 "+videoIds.length+" 条...");if(!d.data?.has_more)break;cursor=d.data?.max_cursor||0;await new Promise(r=>setTimeout(r,800));}
        if(videoIds.length)break;await new Promise(r=>setTimeout(r,1500));
      }
      if(!videoIds.length){setExtStep("err:未获取到视频，请检查链接或稍后重试");setExtBusy(false);return;}
      setExtStepIdx(2);setExtInfo(videoIds.length+" 条视频");
      const allDetails=[];const ids=videoIds.map(v=>v.id);
      for(let i=0;i<ids.length;i+=50){const batch=ids.slice(i,i+50);setExtInfo("批次 "+(Math.floor(i/50)+1)+"/"+Math.ceil(ids.length/50)+"...");const d=await thPost("/api/v1/douyin/web/fetch_multi_video",batch);if(d){const dd=d.data;if(Array.isArray(dd))allDetails.push(...dd);else if(dd&&typeof dd==="object"){const items=dd.aweme_list||dd.aweme_details||Object.values(dd);if(Array.isArray(items))allDetails.push(...items);}}await new Promise(r=>setTimeout(r,800));}
      const detailMap={};for(const d of allDetails){const aid=String(d.aweme_id||"");if(aid)detailMap[aid]=d;}
      const corpus=videoIds.map(v=>{const entry={title:v.title,digg:v.digg,comment:v.comment,share:v.share};const det=detailMap[v.id];if(det){const subs=det.video?.subtitles||[];const subText=subs.map(s=>s.text||"").join(" ");const tags=(det.text_extra||[]).filter(t=>t.type===1).map(t=>t.title||"");entry.subtitle=subText.slice(0,300);entry.tags=tags.slice(0,5);entry.duration=det.duration||0;}return entry;}).sort((a,b)=>b.digg-a.digg);
      setExtStepIdx(3);setExtInfo("Gemini 分析中，约30-60秒...");
      let analysisText="";for(let i=0;i<Math.min(corpus.length,25);i++){const v=corpus[i];analysisText+="\n[视频"+(i+1)+"] "+v.title+"\n  互动：点赞"+v.digg+" 评论"+v.comment+" 分享"+v.share+"\n";if(v.subtitle)analysisText+="  字幕片段："+v.subtitle+"\n";if(v.tags?.length)analysisText+="  标签："+v.tags.join("、")+"\n";}
      const analyzePrompt="你是顶级短视频内容策略师，专门从真实数据中提炼可复用的脚本模板。\n\n以下是抖音博主「"+extName.trim()+"」（"+(extCat.trim()||"带货/内容创作")+"）的真实视频数据（按互动量从高到低）：\n"+analysisText+"\n\n请基于以上真实数据，深度分析该博主的内容规律，提炼一个极其详细、可直接用于AI生成脚本的模板。\n\n只输出以下JSON，不要任何其他文字：\n{\"name\":\"模板名称（6-12字，体现该博主核心套路）\",\"desc\":\"核心逻辑一句话（20字内）\",\"personality\":\"人设定位\",\"target_audience\":\"目标受众画像\",\"emotion_tone\":\"整体情绪基调\",\"formula\":\"完整脚本公式，每步具体（格式：步骤名称-具体做法(秒数)→...至少6步）\",\"hook_strategy\":\"前3秒留人策略\",\"conflict_setup\":\"如何建立矛盾/痛点\",\"product_intro_style\":\"产品引入方式\",\"trust_mechanism\":\"建立信任的核心机制\",\"price_anchor\":\"价格话术模式\",\"urgency_tactic\":\"制造紧迫感的方式\",\"cta_style\":\"结尾行动引导方式\",\"pacing\":\"节奏描述\",\"sentence_length\":\"句子长短特征\",\"voice_rhythm\":\"语音节奏特征\",\"emotion_curve\":\"情绪曲线\",\"climax_position\":\"高潮点位置\",\"keyword_bank\":[\"12个高频口头禅/话术\"],\"power_words\":[\"8个高转化词汇\"],\"filler_words\":[\"标志性语气词\"],\"sentence_patterns\":[\"8个标志性句式，用【】标注变量\"],\"sample_hooks\":[\"4个开头钩子\"],\"sample_transitions\":[\"3个场景过渡句式\"],\"sample_ctas\":[\"3个结尾引导句式\"],\"viral_patterns\":\"爆款规律\",\"dos\":[\"创作必做5件事\"],\"donts\":[\"创作禁忌5件事\"],\"structure\":[\"步骤1\",\"步骤2\",\"步骤3\",\"步骤4\",\"步骤5\",\"步骤6\"],\"scene\":\"最适合套用此模板的产品类型和场景\",\"tags\":[\"品类标签\",\"风格标签\",\"平台标签\"],\"stat\":\"预估完播率提升\",\"style_summary\":\"综合风格总结（150字）\"}";
      const resp=await fetch("/api-proxy/v1/chat/completions",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b"},body:JSON.stringify({model:"gemini-3.1-pro-preview",messages:[{role:"user",content:analyzePrompt}],temperature:0.3})});
      const aiData=await resp.json();let raw=aiData.choices?.[0]?.message?.content||"";
      raw=raw.replace(/```json?\s*/g,"").replace(/```\s*$/g,"").trim();
      const jm=raw.match(/\{[\s\S]*\}/);
      if(!jm){setExtStep("err:AI分析返回格式异常，请重试");setExtBusy(false);return;}
      const tmpl=JSON.parse(jm[0]);
      const flat={_creator:extName.trim(),...tmpl,plat:"抖音",uses:"新上线"};
      const merged=[...aiTemplates,flat];
      setAiTemplates(merged);localStorage.setItem("aiTmpls",JSON.stringify(merged));
      setExtStepIdx(4);setExtInfo("模板「"+(tmpl.name||"")+"」已添加");setExtBusy(false);setTTab("AI提炼");
    }catch(e){setExtStep("err:提取失败: "+e.message);setExtBusy(false);}
  };
  const callGemini=async(prompt)=>{
    const resp=await fetch("/api-proxy/v1/chat/completions",{
      method:"POST",
      headers:{"Content-Type":"application/json","Authorization":"Bearer sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b"},
      body:JSON.stringify({model:"gemini-3.1-pro-preview",messages:[{role:"user",content:prompt}],temperature:0.9})
    });
    const data=await resp.json();
    return data.choices?.[0]?.message?.content||"生成失败，请重试";
  };
  const startCreate=async()=>{
    setModal(false);setPg("create");setCs("ai-generating");setAiScripts([]);
    const tmplInfo=libSelTmpl?[
      `套用博主模板「${libSelTmpl.name}」`,
      libSelTmpl.style_summary&&`【整体风格】${libSelTmpl.style_summary}`,
      libSelTmpl.personality&&`【人设定位】${libSelTmpl.personality}`,
      libSelTmpl.emotion_tone&&`【情绪基调】${libSelTmpl.emotion_tone}`,
      libSelTmpl.formula&&`【脚本公式】${libSelTmpl.formula}`,
      libSelTmpl.hook_strategy&&`【钩子策略】${libSelTmpl.hook_strategy}`,
      libSelTmpl.conflict_setup&&`【痛点建立】${libSelTmpl.conflict_setup}`,
      libSelTmpl.trust_mechanism&&`【信任机制】${libSelTmpl.trust_mechanism}`,
      libSelTmpl.price_anchor&&`【价格话术】${libSelTmpl.price_anchor}`,
      libSelTmpl.urgency_tactic&&`【紧迫感】${libSelTmpl.urgency_tactic}`,
      libSelTmpl.emotion_curve&&`【情绪曲线】${libSelTmpl.emotion_curve}`,
      libSelTmpl.pacing&&`【节奏特征】${libSelTmpl.pacing}`,
      libSelTmpl.keyword_bank?.length&&`【高频话术】${libSelTmpl.keyword_bank.slice(0,8).join("  ")}`,
      libSelTmpl.power_words?.length&&`【高转化词】${libSelTmpl.power_words.join("  ")}`,
      libSelTmpl.sentence_patterns?.length&&`【句式模板】\n${libSelTmpl.sentence_patterns.slice(0,5).join("\n")}`,
      libSelTmpl.sample_hooks?.length&&`【钩子范例】\n${libSelTmpl.sample_hooks.join("\n")}`,
      libSelTmpl.dos?.length&&`【必须做到】${libSelTmpl.dos.join(" | ")}`,
      libSelTmpl.donts?.length&&`【绝对禁忌】${libSelTmpl.donts.join(" | ")}`,
    ].filter(Boolean).join("\n"):"不限模板，发挥创意";
    const creatorName=libSelTmpl?libSelTmpl._creator||libSelTmpl.name||"该博主":"";
    const riskRules="【平台违禁词规避】\n禁止极限词：最好用、第一、唯一、全网最、顶级、No.1、绝对、永久\n禁止医疗词：治疗、消炎、临床证明、药用\n禁止绝对承诺：保证有效、彻底解决\n必须替换：敏感肌→敏敏肌 | 美白→提亮肤色/亮肤 | 祛痘→改善痘肌 | 去黑头→清洁毛孔 | 减肥→塑形 | 抗老→改善细纹 | 无添加→配方简净 | 修复→改善调理 | 医美级→院线同款\nrisk字段：擦边表达设为true";
    const prompt=libSelTmpl?
`你是一位深度研究过「${creatorName}」内容风格的专业短视频脚本创作者。请为以下产品创作脚本。

【产品信息】
产品名称：${prod}
品类：${cat}
视频时长：${dur}

【${creatorName}的风格档案】
${tmplInfo}

---

请生成3~5个方案。

⚠️ 最重要的要求：每个方案必须是完全不同的「拍摄结构」，不只是换几句台词。具体来说：

方案在以下维度上必须有实质差异：
- 【拍摄形式】：有的纯口播对镜头、有的以产品演示为主、有的靠助播互动推进、有的做对比实验、有的走剧情/情景再现
- 【镜头数量和节奏】：有的镜头多而快（碎片化剪辑感）、有的镜头少而稳（信任感）
- 【谁出现在画面】：有的只有主播、有的主要是产品特写、有的需要助播、有的需要用户视角
- 【情绪走法】：有的一开始就炸、有的慢热型、有的靠悬念吊着
- 【卖点侧重】：有的打价格、有的打效果、有的打情感、有的打信任

绝对禁止：多个方案出现相同的镜头（如"拿起产品展示→喊助播→报价"这个结构不能在超过1个方案里出现）。

---

${riskRules}

【台词写作铁律】
① 100%口语：禁止"何以至此""令人动容""焕然一新"等任何书面/文学词
② 短句：每句不超过15字，多用语气词（啊、哦、哇、真的、对吧）
③ 连贯：每句台词自然衔接上一句，像真人连续说话，不能突然跳话题
④ 各方案开场句必须完全不同，同一个词不得在多个方案开场重复
⑧ 【开场句禁止"标题体"】：开场台词必须像真人张嘴说话，禁止出现"XXX探秘！""揭秘XXX！""大家都好奇的XXX""今天来给大家介绍"这类像文章标题或念稿的句式。正确示例："等等等等，你们先别划走" / "哇我今天真的发现了个好东西" / "这个我用了三个月才敢说"
⑤ 台词里植入产品名 + 至少2个该博主标志性用词
⑥ 按【情绪曲线】走，每个镜头的情绪状态要真实变化
⑦ 【时长与台词严格对应】：台词字数必须与时长匹配，正常语速约4~5字/秒——
   3秒 = 约15字以内（1短句）
   5秒 = 约20~25字（1~2句）
   8秒 = 约35~40字（2~3句）
   10秒 = 约45~50字（3~4句）
   15秒 = 约65~75字（4~5句）
   禁止出现"时长10秒但台词只有一句话"或"时长3秒但台词有五句话"的情况

【画面描述铁律】
① 禁止出现任何真实人名（包括博主名、助播名、明星名等所有专有人名）
② 禁止设计助播、搭档、第三方出镜互动——所有镜头只有一位出镜者（主播）和产品
③ scene字段只描述画面本身：主播的位置/动作/表情/景别 + 产品的呈现方式，例如"近景，主播手持产品面向镜头，背景为简洁直播间"

严格按以下JSON格式输出，不要有任何JSON之外的文字：
{
  "scripts": [
    {
      "name": "方案名（体现拍摄形式，如：纯口播悬念版 / 产品演示版 / 对比实验版）",
      "dur": "预计时长",
      "shots": 6,
      "sell": 3,
      "desc": "这个方案的拍摄形式 + 情绪走法 + 和其他方案的本质区别是什么",
      "badges": [{"t":"标签","c":"conv"}],
      "logic": ["第1步做什么（拍摄动作层面）","第2步","第3步","第4步","第5步"],
      "table": [
        {"shot":1,"dur":"3秒","scene":"近景，主播面向镜头，手举产品，直播间背景","copy":"台词，博主语气，有标志性用词","risk":false,"intent":"情绪：低 | 目的：制造悬念"},
        {"shot":2,"dur":"5秒","scene":"特写，产品正面展示","copy":"衔接上一句的台词","risk":false,"intent":"情绪：中 | 目的：xxx"}
      ]
    }
  ]
}

注意：badges的c字段只能用"conv"（转化）、"exp"（曝光）、"auth"（权威）之一。risk为true表示违禁词。镜头数量由拍摄形式自然决定，不同方案镜头数可以不同。`
:
`你是一位顶级短视频脚本策划师。请为以下产品生成3~5个差异化抖音视频脚本方案。

产品名称：${prod}
品类：${cat}
视频时长：${dur}

每个方案风格明显不同（情感共鸣型、实验对比型、专家测评型、剧情反转型、痛点放大型等），让用户有真实选择空间。尽量给到4~5个高质量方案。

${riskRules}

严格按以下JSON格式输出，不要有任何JSON之外的文字：
{
  "scripts": [
    {
      "name": "方案名称（如：情感共鸣型）",
      "dur": "预计时长（如：45秒）",
      "shots": 8,
      "sell": 3,
      "desc": "这个方案的核心思路和适用场景，2-3句话",
      "badges": [{"t":"标签1","c":"conv"},{"t":"标签2","c":"exp"}],
      "logic": ["第一步","第二步","第三步","第四步","第五步"],
      "table": [
        {"shot":1,"dur":"3秒","scene":"画面描述","copy":"口播台词，真实口语化","risk":false,"intent":"镜头意图"},
        {"shot":2,"dur":"5秒","scene":"画面描述","copy":"口播台词","risk":false,"intent":"镜头意图"}
      ]
    }
  ]
}

注意：badges的c字段只能用"conv"（转化）、"exp"（曝光）、"auth"（权威）之一。risk为true表示可能违禁词。口播台词要真实口语化、有感染力，符合抖音风格。
台词时长对应规则（正常语速约4~5字/秒）：3秒≈15字内、5秒≈20~25字、8秒≈35~40字、10秒≈45~50字、15秒≈65~75字，时长与台词字数必须匹配。`;
    try{
      setAiGenStep("AI正在生成脚本方案...");
      const raw=await callGemini(prompt);
      const m=raw.match(/\{[\s\S]*\}/);
      if(!m)throw new Error("返回格式异常");
      const parsed=JSON.parse(m[0]);
      const scripts=(parsed.scripts||[]).map((s,i)=>({...s,id:i+1}));
      setAiScripts(scripts);
      setCs("results");
    }catch(e){
      console.error(e);
      setAiScripts([]);
      setCs("results");
    }
  };
  const send=(t)=>{
    if(!t.trim())return;
    const n=[...msgs,{r:"user",c:t}];setMsgs(n);setCi("");
    setTimeout(()=>{
      const hasKey=["护肤","面霜","面膜","热点","灵感"].some(k=>t.includes(k));
      if(hasKey){
        setMsgs([...n,{r:"bot",c:"好的，我已经为你分析了最新的护肤品类热点内容",
          hots:[{t:"左右脸对比实测！这款破痘面霜太绝了",ct:"126.3万"},{t:"皮肤科医生推荐的平价面霜",ct:"80.7万"},{t:"敏感肌也能放心用？零刺激面霜",ct:"65.2万"},{t:"熬夜党的救星面霜",ct:"58.9万"}],
          angs:[{ic:"🔬",t:"科学实证",s:"来源：科学实验",d:"互动率是平均值的2倍"},{ic:"🌿",t:"换季急救",s:"来源：小红书热门",d:"春夏护肤急救类正在快速上升"},{ic:"👨‍⚕️",t:"专家背书",s:"来源：行业趋势",d:"专家推荐类信任度建立最快"}],
          sum:"实验对比类内容在你的品类中互动率高出2.3倍。我会融入水分仪数据对比手法，结合科学实证角度生成更具说服力的脚本。"}]);
      }else{setMsgs([...n,{r:"bot",c:"好的，已为你生成脚本建议。点击下方按钮开始生成脚本。"}]);}
    },600);
  };
  const isActive=(k)=>pg===k||(k==="aicreate"&&(pg==="create"||pg==="create-deep"));

  // placeholder pages for modules not yet built
  const Placeholder=({title,desc,icon})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",opacity:.4}}>
      <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
      <div style={{fontSize:20,fontWeight:700,marginBottom:6}}>{title}</div>
      <div style={{fontSize:13,color:"var(--t2)"}}>{desc}</div>
    </div>
  );

  const pgT={dash:"工作台",tmpl:"模板库",ip:"IP工作室",hotbreak:"爆款深度解析",pos360:"360° 行业定位分析",avatar:"数字人生成",imgtext:"图文AI制作",schedule:"排期发布",adkol:"投流达人",analytics:"数据复盘",history:"内容库",settings:"设置"};

  return(
    <><style>{`
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700;900&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
:root{--p:#7C3AED;--pl:#8B5CF6;--pd:#6D28D9;--pbg:#F5F0FF;--pg:rgba(124,58,237,.12);--s:#FFF;--s2:#FAFAFA;--s3:#F4F4F5;--b:#E4E4E7;--bl:#EFEFEF;--t1:#18181B;--t2:#71717A;--t3:#A1A1AA;--g:#10B981;--w:#F59E0B;--r:#EF4444;--o:#F97316;--rd:10px;--rl:14px;--rx:18px;--tr:.2s ease}
body{font-family:'Noto Sans SC',sans-serif;background:var(--s2);color:var(--t1);-webkit-font-smoothing:antialiased}
.app{display:flex;height:100vh;overflow:hidden}
/* SIDEBAR */
.sb{width:240px;min-width:240px;background:var(--s);border-right:1px solid var(--bl);display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden}
.sb::-webkit-scrollbar{width:3px}.sb::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.sb-logo{padding:18px 16px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--bl)}
.sb-lic{width:32px;height:32px;background:linear-gradient(135deg,var(--p),var(--pl));border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:800;font-size:11px;letter-spacing:-0.5px}
.sb-ltx{font-weight:800;font-size:17px;letter-spacing:-.5px}
.sb-lv{font-size:9px;color:var(--p);background:var(--pbg);padding:2px 6px;border-radius:4px;font-weight:700;margin-left:auto}
.sb-g{padding:14px 10px 4px}.sb-gt{font-size:9px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;padding:0 8px 6px}
.sb-i{display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:var(--rd);cursor:pointer;transition:var(--tr);font-size:13px;font-weight:500;color:var(--t2);position:relative;margin-bottom:1px}
.sb-i:hover{background:var(--s3);color:var(--t1)}.sb-i.on{background:var(--pbg);color:var(--p);font-weight:600}
.sb-i.on::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:18px;background:var(--p);border-radius:0 3px 3px 0}
.sb-i .arr{margin-left:auto;transition:transform .2s}.sb-i .arr.open{transform:rotate(90deg)}
.sb-i.accent{color:var(--p)}
.sb-sub{padding-left:26px;margin-bottom:2px}
.sb-si{display:flex;align-items:center;gap:6px;padding:6px 10px;border-radius:6px;cursor:pointer;font-size:12px;color:var(--t3);transition:var(--tr);margin-bottom:1px}
.sb-si:hover{color:var(--t1);background:var(--s3)}.sb-si.on{color:var(--p);font-weight:600;background:var(--pbg)}
.sb-si::before{content:'';width:4px;height:4px;border-radius:50%;background:currentColor;opacity:.4;flex-shrink:0}
.sb-si.on::before{opacity:1;background:var(--p)}
.sb-tag{font-size:9px;font-weight:700;margin-left:auto;padding:1px 6px;border-radius:8px}
.sb-bt{margin-top:auto;padding:10px;border-top:1px solid var(--bl)}
.ipc{background:linear-gradient(135deg,#F5F0FF,#EDE9FE);border-radius:var(--rl);padding:11px;cursor:pointer;transition:var(--tr);border:1px solid transparent}
.ipc:hover{border-color:var(--pl)}.ipc-h{display:flex;align-items:center;gap:7px}
.ipc-a{width:24px;height:24px;border-radius:50%;background:linear-gradient(135deg,var(--p),#A78BFA);display:flex;align-items:center;justify-content:center;color:#fff;font-size:9px;font-weight:800}
.ipc-n{font-size:11px;font-weight:600}.ipc-s{font-size:9px;color:var(--g)}
/* MAIN */
.mn{flex:1;display:flex;flex-direction:column;overflow:hidden;background:var(--s2)}
.tb{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:var(--s);border-bottom:1px solid var(--bl);min-height:52px}
.tb-t{font-size:17px;font-weight:800}.tb-r{display:flex;align-items:center;gap:8px}
.sr{display:flex;align-items:center;gap:7px;padding:7px 13px;background:var(--s3);border-radius:var(--rd);border:1px solid transparent;min-width:200px}
.sr:focus-within{border-color:var(--p);background:var(--s);box-shadow:0 0 0 3px var(--pg)}
.sr input{border:none;background:none;outline:none;font-size:12px;color:var(--t1);width:100%;font-family:inherit}.sr input::placeholder{color:var(--t3)}
.bt{display:inline-flex;align-items:center;gap:5px;padding:7px 15px;border-radius:var(--rd);font-size:12px;font-weight:600;cursor:pointer;border:none;transition:var(--tr);font-family:inherit;white-space:nowrap}
.bt-p{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.3)}.bt-p:hover{transform:translateY(-1px)}
.bt-g{background:var(--s);color:var(--t2);border:1px solid var(--b)}.bt-g:hover{background:var(--s3)}
.sc{flex:1;overflow-y:auto;padding:20px 24px}.sc::-webkit-scrollbar{width:5px}.sc::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
/* dashboard */
.dash-wrap{padding:24px 32px;height:calc(100vh - 52px);overflow-y:auto;display:flex}
.dash-wrap::-webkit-scrollbar{width:5px}.dash-wrap::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
.dash-inner{width:100%;max-width:960px;margin:auto}
.dash-hero{text-align:center;margin-bottom:28px;padding-top:8px}
.dash-hero-t{font-size:36px;font-weight:900;letter-spacing:-.8px;margin-bottom:8px;color:var(--t1);line-height:1.2}
.dash-hero-t span{color:var(--p)}
.dash-hero-d{font-size:14px;color:var(--t3);line-height:1.6}
/* bento grid */
.bento{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:auto;gap:12px}
/* main card */
.bn-main{grid-column:1/7;grid-row:1/3;border-radius:18px;background:linear-gradient(160deg,#F5F0FF 0%,#EDE9FE 50%,#DDD6FE 100%);border:1px solid #DDD6FE;padding:28px 26px;display:flex;flex-direction:column;cursor:default;position:relative;overflow:hidden}
.bn-main::before{content:'';position:absolute;top:-50px;right:-30px;width:180px;height:180px;background:radial-gradient(circle,rgba(124,58,237,.1),transparent 70%);border-radius:50%}
.bn-main-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:rgba(124,58,237,.12);color:var(--p);font-size:10px;font-weight:700;width:fit-content;margin-bottom:14px;position:relative;z-index:1}
.bn-main-t{font-size:22px;font-weight:900;color:var(--pd);margin-bottom:6px;letter-spacing:-.4px;position:relative;z-index:1}
.bn-main-d{font-size:12px;color:var(--p);opacity:.6;line-height:1.6;margin-bottom:18px;position:relative;z-index:1}
.bn-modes{display:flex;gap:10px;position:relative;z-index:1}
.bn-mode{flex:1;padding:16px 14px;border-radius:12px;cursor:pointer;transition:all .2s ease;border:1.5px solid rgba(124,58,237,.15);background:rgba(255,255,255,.7);backdrop-filter:blur(4px)}
.bn-mode:hover{background:#fff;border-color:var(--pl);transform:translateY(-2px);box-shadow:0 8px 20px rgba(124,58,237,.1)}
.bn-mode-ic{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:8px;background:rgba(124,58,237,.12);color:var(--p)}
.bn-mode-t{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:2px}
.bn-mode-d{font-size:10px;color:var(--t3);line-height:1.4}
/* standard cards */
.bn-card{border-radius:16px;padding:18px;cursor:pointer;transition:all .25s ease;background:var(--s);border:1px solid var(--bl);display:flex;flex-direction:column;position:relative;overflow:hidden}
.bn-card::before{content:'';position:absolute;top:-30px;right:-30px;width:100px;height:100px;border-radius:50%;opacity:0;transition:opacity .3s}.bn-card:hover::before{opacity:1}
.bn-card:hover{transform:translateY(-2px);box-shadow:0 12px 28px rgba(0,0,0,.05)}
.bn-card-top{display:flex;align-items:center;gap:10px;margin-bottom:8px}
.bn-card-ic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0}
.bn-card-nm{font-size:14px;font-weight:800;color:var(--t1)}
.bn-card-arrow{width:26px;height:26px;border-radius:50%;background:var(--s3);color:var(--t3);display:flex;align-items:center;justify-content:center;margin-left:auto;transition:all .2s ease;flex-shrink:0}
.bn-card:hover .bn-card-arrow{transform:translateX(2px)}
.bn-card-d{font-size:11px;color:var(--t3);line-height:1.6}
.bn-card-tags{display:flex;gap:5px;margin-top:10px;flex-wrap:wrap}
.bn-card-tags span{font-size:9px;padding:3px 8px;border-radius:4px;font-weight:500;background:var(--s3);color:var(--t2)}
.bn-card-btn{display:inline-flex;align-items:center;gap:4px;padding:8px 14px;border-radius:8px;font-size:11px;font-weight:600;border:none;cursor:pointer;font-family:inherit;transition:all .2s ease;margin-top:12px;width:fit-content;position:relative;z-index:1}
/* color variants */
.bn-ip{grid-column:7/13;grid-row:1/2}
.bn-ip .bn-card-ic{background:var(--pbg);color:var(--p)}
.bn-ip:hover{border-color:var(--pl)}.bn-ip::before{background:radial-gradient(circle,rgba(124,58,237,.06),transparent 70%)}
.bn-ip:hover .bn-card-arrow{background:var(--pbg);color:var(--p)}
.bn-tmpl{grid-column:7/13;grid-row:2/3}
.bn-tmpl .bn-card-ic{background:#EFF6FF;color:#3B82F6}
.bn-tmpl:hover{border-color:#93C5FD}.bn-tmpl::before{background:radial-gradient(circle,rgba(59,130,246,.07),transparent 70%)}
.bn-tmpl:hover .bn-card-arrow{background:#EFF6FF;color:#3B82F6}
.bn-hot{grid-column:1/7;grid-row:3/4}
.bn-hot .bn-card-ic{background:#FEF3C7;color:#D97706}
.bn-hot:hover{border-color:#FCD34D}.bn-hot::before{background:radial-gradient(circle,rgba(217,119,6,.06),transparent 70%)}
.bn-hot:hover .bn-card-arrow{background:#FEF3C7;color:#D97706}
.bn-pos{grid-column:7/13;grid-row:3/4}
.bn-pos .bn-card-ic{background:#F0FDFA;color:#14B8A6}
.bn-pos:hover{border-color:#5EEAD4}.bn-pos::before{background:radial-gradient(circle,rgba(20,184,166,.06),transparent 70%)}
.bn-pos:hover .bn-card-arrow{background:#F0FDFA;color:#14B8A6}
/* main card */
.dc-main{border-radius:18px;background:var(--s);border:1px solid var(--bl);padding:20px 22px;display:flex;flex-direction:column;position:relative;overflow:hidden;cursor:default;transition:all .25s ease}
.dc-main::before{content:'';position:absolute;top:-60px;right:-40px;width:220px;height:220px;background:radial-gradient(circle,rgba(124,58,237,.06),transparent 70%);border-radius:50%}
.dc-main-top{display:flex;align-items:center;gap:8px;margin-bottom:12px;position:relative;z-index:1}
.dc-main-badge{display:inline-flex;align-items:center;gap:4px;padding:4px 10px;border-radius:6px;background:var(--pbg);color:var(--p);font-size:10px;font-weight:700}
.dc-main-t{font-size:18px;font-weight:800;margin-bottom:4px;letter-spacing:-.3px;position:relative;z-index:1;color:var(--t1)}
.dc-main-d{font-size:12px;color:var(--t3);line-height:1.6;margin-bottom:14px;position:relative;z-index:1}
.dc-modes{display:flex;gap:10px;position:relative;z-index:1}
.dc-mode{flex:1;padding:14px 14px;border-radius:12px;cursor:pointer;transition:all .2s ease;border:1.5px solid var(--bl);background:var(--s)}
.dc-mode:hover{border-color:var(--pl);background:var(--pbg);transform:translateY(-2px);box-shadow:0 8px 24px rgba(124,58,237,.08)}
.dc-mode-ic{width:30px;height:30px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:8px}
.dc-mode.quick .dc-mode-ic{background:var(--pbg);color:var(--p)}
.dc-mode.deep .dc-mode-ic{background:var(--s3);color:var(--t2)}
.dc-mode:hover .dc-mode-ic{background:var(--pbg);color:var(--p)}
.dc-mode-t{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:2px}
.dc-mode-d{font-size:10px;color:var(--t3);line-height:1.4}
.dc-main-stats{display:flex;gap:20px;margin-top:18px;padding-top:14px;border-top:1px solid var(--bl);position:relative;z-index:1}
.dc-ms{display:flex;flex-direction:column}
.dc-ms-v{font-size:20px;font-weight:800;letter-spacing:-.3px;color:var(--p)}
.dc-ms-l{font-size:10px;color:var(--t3);margin-top:2px}
/* secondary cards */
.dc-sec{border-radius:18px;padding:16px 16px;display:flex;flex-direction:column;cursor:pointer;transition:all .25s ease;background:var(--s);border:1px solid var(--bl)}
.dc-sec:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.05);border-color:var(--pl)}
.dc-sec.tmpl:hover{border-color:#93C5FD}
.dc-sec-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:8px}
.dc-sec-ic{width:34px;height:34px;border-radius:9px;display:flex;align-items:center;justify-content:center;font-size:14px}
.dc-sec.ip .dc-sec-ic{background:var(--pbg);color:var(--p)}
.dc-sec.tmpl .dc-sec-ic{background:#EFF6FF;color:#3B82F6}
.dc-sec-arrow{width:26px;height:26px;border-radius:50%;background:var(--s3);color:var(--t3);display:flex;align-items:center;justify-content:center;transition:all .2s ease}
.dc-sec:hover .dc-sec-arrow{background:var(--pbg);color:var(--p);transform:translateX(2px)}
.dc-sec.tmpl:hover .dc-sec-arrow{background:#EFF6FF;color:#3B82F6}
.dc-sec-t{font-size:14px;font-weight:800;margin-bottom:3px;color:var(--t1)}
.dc-sec-d{font-size:11px;color:var(--t3);line-height:1.5}
.dc-sec-stats{display:flex;gap:14px;margin-top:14px;padding-top:12px;border-top:1px solid var(--bl)}
.dc-ss{display:flex;flex-direction:column}
.dc-ss-v{font-size:15px;font-weight:800;letter-spacing:-.2px;color:var(--t1)}
.dc-sec.ip .dc-ss-v{color:var(--p)}
.dc-sec.tmpl .dc-ss-v{color:#3B82F6}
.dc-ss-l{font-size:9px;color:var(--t3);margin-top:1px}
/* storyboard preview */
.sb-pg{display:flex;flex-direction:column;height:100%}
.sb-steps{display:flex;align-items:center;justify-content:center;gap:4px;padding:14px 20px;border-bottom:1px solid var(--bl);background:var(--s);flex-wrap:wrap}
.sb-step{display:flex;align-items:center;gap:4px;font-size:11px;font-weight:500;color:var(--t3)}
.sb-step.done{color:var(--g)}.sb-step.on{color:var(--p);font-weight:700}
.sb-step-dot{width:14px;height:14px;border-radius:50%;border:2px solid var(--bl);display:flex;align-items:center;justify-content:center;font-size:7px}
.sb-step.done .sb-step-dot{background:var(--g);border-color:var(--g);color:#fff}
.sb-step.on .sb-step-dot{background:var(--p);border-color:var(--p);color:#fff}
.sb-sep{color:var(--bl);font-size:10px;margin:0 2px}
.sb-hd{display:flex;align-items:center;justify-content:space-between;padding:16px 24px;border-bottom:1px solid var(--bl);background:var(--s)}
.sb-hd-t{font-size:17px;font-weight:800}
.sb-hd-acts{display:flex;gap:8px}
.sb-hd-btn{padding:8px 18px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:var(--tr)}
.sb-hd-btn.green{border:none;background:var(--p);color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.2)}.sb-hd-btn.green:hover{background:var(--pd)}
.sb-hd-btn.ghost{border:1.5px solid var(--bl);background:var(--s);color:var(--t2)}.sb-hd-btn.ghost:hover{border-color:var(--pl);color:var(--p)}
.sb-grid{flex:1;overflow-y:auto;padding:20px 24px;display:grid;grid-template-columns:repeat(3,1fr);gap:14px;align-content:start}
.sb-grid::-webkit-scrollbar{width:5px}.sb-grid::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
.sb-card{background:var(--s);border:1px solid var(--bl);border-radius:14px;overflow:hidden;cursor:pointer;transition:all .2s ease}
.sb-card:hover{border-color:var(--pl);box-shadow:0 8px 24px rgba(0,0,0,.05);transform:translateY(-2px)}
.sb-card-img{height:160px;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--t3)}
.sb-card-body{padding:12px 14px}
.sb-card-meta{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.sb-card-tag{font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px}
.sb-card-tag.hook{background:var(--pbg);color:var(--p)}
.sb-card-tag.medium{background:var(--s3);color:var(--t2)}
.sb-card-tag.close{background:#EFF6FF;color:#3B82F6}
.sb-card-tag.wide{background:var(--pbg);color:var(--p)}
.sb-card-dur{font-size:10px;color:var(--t3)}
.sb-card-num{font-size:10px;color:var(--t3);margin-left:auto}
.sb-card-text{font-size:12px;color:var(--t1);line-height:1.5;margin-bottom:8px}
.sb-card-acts{display:flex;gap:12px}
.sb-card-act{font-size:11px;color:var(--t3);cursor:pointer;font-weight:500;transition:var(--tr)}.sb-card-act:hover{color:var(--p)}
/* storyboard edit modal */
.sb-ov{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:200;display:flex;align-items:center;justify-content:center}
/* video gen progress */
.vg-wrap{display:flex;flex-direction:column;align-items:center;justify-content:center;flex:1;padding:40px}
.vg-card{background:var(--s);border:1px solid var(--bl);border-radius:18px;padding:36px 44px;width:100%;max-width:520px;box-shadow:0 4px 20px rgba(0,0,0,.04)}
.vg-t{font-size:20px;font-weight:800;margin-bottom:24px;display:flex;align-items:center;gap:8px}
.vg-t::after{content:'';display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--p);animation:vgPulse 1s infinite}
@keyframes vgPulse{0%,100%{opacity:1}50%{opacity:.3}}
.vg-bar-wrap{display:flex;align-items:center;gap:14px;margin-bottom:8px}
.vg-bar{flex:1;height:14px;background:var(--s3);border-radius:7px;overflow:hidden}
.vg-bar-fill{height:100%;background:linear-gradient(90deg,var(--p),var(--pl),#A78BFA);border-radius:7px;transition:width .8s cubic-bezier(.4,0,.2,1);position:relative;background-size:200% 100%;animation:vgShimmer 1.5s linear infinite}
@keyframes vgShimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
.vg-pct{font-size:18px;font-weight:800;color:var(--p);min-width:40px;text-align:right}
.vg-sub{text-align:center;font-size:12px;color:var(--t3);margin-bottom:24px}
.vg-timeline{padding-left:20px;border-left:2px solid var(--bl);margin-left:4px}
.vg-tl-item{padding:10px 0 10px 20px;font-size:13px;color:var(--t3);position:relative;transition:all .3s ease}
.vg-tl-item::before{content:'';position:absolute;left:-25px;top:14px;width:10px;height:10px;border-radius:50%;border:2px solid var(--bl);background:var(--s);transition:all .3s ease}
.vg-tl-item.done{color:var(--g);font-weight:500}.vg-tl-item.done::before{background:var(--g);border-color:var(--g)}
.vg-tl-item.on{color:var(--p);font-weight:600}.vg-tl-item.on::before{background:var(--p);border-color:var(--p);box-shadow:0 0 0 4px var(--pg)}
/* video preview */
.vp-wrap{display:flex;flex-direction:column;align-items:center;padding:40px;flex:1;overflow-y:auto}
.vp-card{background:var(--s);border:1px solid var(--bl);border-radius:18px;width:100%;max-width:640px;overflow:hidden}
.vp-player{height:320px;background:#000;display:flex;align-items:center;justify-content:center;position:relative}
.vp-play{width:60px;height:60px;border-radius:50%;background:rgba(255,255,255,.2);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;cursor:pointer;color:#fff;font-size:20px}
.vp-info{padding:20px 24px}
.vp-info-t{font-size:16px;font-weight:800;margin-bottom:6px}
.vp-info-meta{display:flex;gap:14px;font-size:12px;color:var(--t3);margin-bottom:16px}
.vp-acts{display:flex;gap:8px;flex-wrap:wrap}
.vp-act{padding:8px 16px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:var(--tr)}
.vp-act.pri{border:none;background:var(--p);color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.2)}.vp-act.pri:hover{background:var(--pd)}
.vp-act.sec{border:1px solid var(--bl);background:var(--s);color:var(--t2)}.vp-act.sec:hover{border-color:var(--pl);color:var(--p)}
/* KOL page */
.kol-wrap{padding:20px 24px;overflow-y:auto;height:calc(100vh - 52px)}
.kol-wrap::-webkit-scrollbar{width:5px}.kol-wrap::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
.kol-search{display:flex;gap:10px;margin-bottom:16px}
.kol-search input{flex:1;padding:11px 18px;border:1.5px solid var(--bl);border-radius:12px;font-size:13px;font-family:inherit;transition:var(--tr)}.kol-search input:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.kol-search input::placeholder{color:var(--t3)}
.kol-search-btn{padding:11px 28px;border-radius:12px;border:none;background:var(--p);color:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;box-shadow:0 2px 8px rgba(124,58,237,.2);transition:var(--tr)}.kol-search-btn:hover{background:var(--pd);transform:translateY(-1px)}
.kol-filters{display:flex;gap:14px;margin-bottom:18px;flex-wrap:wrap;padding:14px 16px;background:var(--s);border:1px solid var(--bl);border-radius:12px}
.kol-fg{display:flex;flex-direction:column;gap:4px}
.kol-fg-l{font-size:10px;font-weight:600;color:var(--t3)}
.kol-fg select{padding:7px 12px;border:1px solid var(--bl);border-radius:8px;font-size:11px;font-family:inherit;color:var(--t1);min-width:120px;cursor:pointer;transition:var(--tr)}.kol-fg select:focus{outline:none;border-color:var(--p)}
.kol-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:12px}
.kol-card{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:18px;transition:all .2s ease;cursor:pointer}
.kol-card:hover{border-color:var(--pl);box-shadow:0 8px 28px rgba(0,0,0,.06);transform:translateY(-2px)}
.kol-card-top{display:flex;gap:12px;margin-bottom:12px}
.kol-card-av{width:46px;height:46px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:17px;font-weight:800;color:#fff;flex-shrink:0;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.kol-card-nm{font-size:15px;font-weight:700}.kol-card-id{font-size:10px;color:var(--t3);background:var(--s3);padding:1px 6px;border-radius:3px}
.kol-card-cat{font-size:11px;color:var(--p);font-weight:600;margin-top:2px}.kol-card-desc{font-size:11px;color:var(--t2);line-height:1.5;margin-top:4px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.kol-card-stats{display:flex;gap:0;padding:10px 0;border-top:1px solid var(--bl);border-bottom:1px solid var(--bl);margin:10px 0}
.kol-stat{flex:1;text-align:center;position:relative}.kol-stat:not(:last-child)::after{content:'';position:absolute;right:0;top:2px;bottom:2px;width:1px;background:var(--bl)}
.kol-stat-l{font-size:9px;color:var(--t3);margin-bottom:2px}.kol-stat-v{font-size:14px;font-weight:800;color:var(--p)}
.kol-card-foot{display:flex;justify-content:space-between;align-items:center}
.kol-card-tags{display:flex;gap:4px}.kol-card-tags span{font-size:9px;padding:2px 8px;border-radius:4px;background:var(--s3);color:var(--t3);font-weight:500}
.kol-card-loc{font-size:10px;color:var(--t3);display:flex;align-items:center;gap:3px}
/* history page */
.hist-wrap{padding:24px;overflow-y:auto;height:calc(100vh - 52px)}
.hist-hd{text-align:center;margin-bottom:24px}
.hist-hd-t{font-size:22px;font-weight:800;margin-bottom:4px}
.hist-hd-d{font-size:13px;color:var(--t3)}
.hist-tabs{display:flex;border:1.5px solid var(--bl);border-radius:10px;overflow:hidden;width:fit-content;margin-bottom:20px}
.hist-tab{padding:8px 24px;font-size:12px;font-weight:500;cursor:pointer;border:none;background:var(--s);color:var(--t2);font-family:inherit;transition:var(--tr)}.hist-tab:not(:last-child){border-right:1.5px solid var(--bl)}
.hist-tab.on{background:var(--p);color:#fff}
.hist-empty{text-align:center;padding:60px 20px;color:var(--t3);font-size:13px}
/* analytics page */
.ana-wrap{padding:24px;overflow-y:auto;height:calc(100vh - 52px)}
.ana-wrap::-webkit-scrollbar{width:5px}.ana-wrap::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
.ana-hd{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:18px}
.ana-hd-t{font-size:22px;font-weight:800;margin-bottom:4px}
.ana-hd-d{font-size:12px;color:var(--t3);display:flex;align-items:center;gap:5px}
.ana-hd-d::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--t3)}
.ana-hd-acts{display:flex;gap:8px}
.ana-hd-btn{padding:8px 16px;border-radius:8px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit;display:flex;align-items:center;gap:5px;transition:var(--tr)}.ana-hd-btn:hover{border-color:var(--pl)}
.ana-hd-btn.pri{background:var(--p);color:#fff;border-color:var(--p)}.ana-hd-btn.pri:hover{background:var(--pd)}
.ana-tabs{display:flex;border:1.5px solid var(--bl);border-radius:10px;overflow:hidden;width:fit-content;margin-bottom:20px}
.ana-tab{padding:9px 20px;font-size:12px;font-weight:500;cursor:pointer;border:none;background:var(--s);color:var(--t2);font-family:inherit;transition:var(--tr)}.ana-tab:not(:last-child){border-right:1.5px solid var(--bl)}
.ana-tab.on{background:var(--p);color:#fff}
/* dashboard tab */
.ana-dash-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:16px}
.ana-dash-t{font-size:18px;font-weight:800}
.ana-live{font-size:11px;color:var(--g);display:flex;align-items:center;gap:5px}
.ana-live::before{content:'';width:6px;height:6px;border-radius:50%;background:var(--g)}
.ana-filters{display:flex;gap:8px;margin-bottom:18px}
.ana-fil{padding:7px 14px;border-radius:8px;border:1px solid var(--bl);background:var(--s);font-size:11px;color:var(--t2);display:flex;align-items:center;gap:5px}
.ana-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.ana-stat{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:18px}
.ana-stat-top{display:flex;align-items:center;gap:6px;margin-bottom:8px}
.ana-stat-l{font-size:12px;color:var(--t2)}.ana-stat-badge{font-size:9px;font-weight:600;padding:1px 6px;border-radius:3px}
.ana-stat-badge.g{background:#ECFDF5;color:var(--g)}.ana-stat-badge.r{background:#FEF2F2;color:var(--r)}
.ana-stat-v{font-size:28px;font-weight:800;letter-spacing:-.5px;display:flex;align-items:center;gap:8px}
.ana-stat-sub{font-size:10px;color:var(--t3);margin-top:4px}
.ana-body{display:flex;gap:16px}
.ana-chart{flex:1;background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:20px}
.ana-chart-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:18px}
.ana-chart-t{font-size:15px;font-weight:700}
.ana-chart-legend{display:flex;gap:12px;font-size:10px;color:var(--t3)}
.ana-chart-legend span::before{content:'';display:inline-block;width:8px;height:3px;border-radius:1.5px;margin-right:4px;vertical-align:middle}
.ana-chart-legend .cl-pub::before{background:var(--p)}.ana-chart-legend .cl-exp::before{background:var(--pl)}
.ana-bar-row{display:flex;align-items:center;gap:10px;padding:14px 0;border-bottom:1px solid var(--bl)}
.ana-bar-row:last-child{border:none}
.ana-bar-nm{font-size:13px;font-weight:600;width:40px;flex-shrink:0}
.ana-bar-track{flex:1;height:8px;background:var(--s3);border-radius:4px;overflow:hidden;position:relative}
.ana-bar-fill{height:100%;border-radius:4px;background:linear-gradient(90deg,var(--p),var(--pl))}
.ana-bar-grade{font-size:12px;font-weight:700;width:28px;text-align:right;color:var(--t2)}
.ana-ai{width:300px;min-width:300px;display:flex;flex-direction:column;gap:14px}
.ana-ai-card{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:18px}
.ana-ai-hd{display:flex;align-items:center;gap:8px;margin-bottom:12px}
.ana-ai-ic{width:28px;height:28px;border-radius:7px;background:var(--pbg);color:var(--p);display:flex;align-items:center;justify-content:center;font-size:12px}
.ana-ai-t{font-size:14px;font-weight:700}
.ana-ai-body{font-size:12px;color:var(--t2);line-height:1.7}
.ana-ai-hl{color:var(--p);font-weight:700}
.ana-ai-tip{margin-top:10px;padding:10px 12px;border-left:3px solid var(--p);background:var(--pbg);border-radius:0 8px 8px 0;font-size:11px;color:var(--t2);line-height:1.6}
.ana-ai-tip-l{font-size:10px;font-weight:600;color:var(--p);margin-bottom:3px}
.ana-pred-t{font-size:14px;font-weight:700;margin-bottom:4px}
.ana-pred-d{font-size:12px;color:var(--t3);margin-bottom:12px}
.ana-pred-btn{padding:9px 20px;border-radius:8px;border:none;background:var(--t1);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:var(--tr)}.ana-pred-btn:hover{opacity:.8}
/* connect tab */
.ana-connect{background:var(--s);border:1px dashed var(--bl);border-radius:14px;padding:60px 40px;width:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;cursor:pointer;transition:var(--tr)}
.ana-connect:hover{border-color:var(--pl);background:var(--pbg)}
.ana-connect-ic{width:48px;height:48px;border-radius:50%;background:var(--s3);color:var(--t3);display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:18px}
.ana-connect-t{font-size:14px;font-weight:600;margin-bottom:4px}
.ana-connect-d{font-size:11px;color:var(--t3)}
/* team tab */
.ana-team-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.ana-team-t{font-size:16px;font-weight:700;display:flex;align-items:center;gap:6px}
.ana-team-ct{font-size:12px;color:var(--t3);font-weight:400}
.ana-team-r{display:flex;gap:8px;align-items:center}
.ana-team-search{padding:8px 14px;border:1px solid var(--bl);border-radius:8px;font-size:12px;font-family:inherit;width:240px}.ana-team-search:focus{outline:none;border-color:var(--p)}
.ana-team-search::placeholder{color:var(--t3)}
.sb-mdl{background:var(--s);border-radius:16px;width:90%;max-width:520px;padding:24px;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:mIn .25s ease}
.sb-mdl-t{font-size:16px;font-weight:800;color:var(--p);margin-bottom:18px;display:flex;justify-content:space-between;align-items:center}
.sb-mdl-fg{margin-bottom:14px}
.sb-mdl-l{font-size:12px;font-weight:600;color:var(--t2);margin-bottom:6px}
.sb-mdl-inp{width:100%;padding:10px 12px;border:1.5px solid var(--bl);border-radius:10px;font-size:12px;font-family:inherit;color:var(--t1);transition:var(--tr)}.sb-mdl-inp:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}.sb-mdl-inp::placeholder{color:var(--t3)}
.sb-mdl-foot{display:flex;justify-content:flex-end;gap:8px;margin-top:18px}
.sb-mdl-btn{padding:9px 18px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:var(--tr)}
.sb-mdl-btn.cancel{border:1px solid var(--bl);background:var(--s);color:var(--t2)}.sb-mdl-btn.cancel:hover{background:var(--s3)}
.sb-mdl-btn.orange{border:none;background:var(--p);color:#fff}.sb-mdl-btn.orange:hover{background:var(--pd)}
.sb-mdl-btn.blue{border:1px solid var(--bl);background:var(--s);color:var(--t1)}.sb-mdl-btn.blue:hover{background:var(--s3)}
/* tool cards on dash */
.dash-tools{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.dt-card{background:var(--s);border:1px solid var(--bl);border-radius:16px;padding:20px;cursor:pointer;transition:all .25s ease;display:flex;flex-direction:column;position:relative;overflow:hidden}
.dt-card::before{content:'';position:absolute;top:-40px;right:-40px;width:120px;height:120px;border-radius:50%;opacity:0;transition:opacity .3s}
.dt-card:hover{transform:translateY(-2px);box-shadow:0 12px 32px rgba(0,0,0,.05)}
.dt-card:hover::before{opacity:1}
.dt-card.blue:hover{border-color:#93C5FD}.dt-card.blue::before{background:radial-gradient(circle,rgba(59,130,246,.07),transparent 70%)}
.dt-card.teal:hover{border-color:#5EEAD4}.dt-card.teal::before{background:radial-gradient(circle,rgba(20,184,166,.06),transparent 70%)}
.dt-card-top{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:10px}
.dt-card-ic{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px}
.dt-card.blue .dt-card-ic{background:#EFF6FF;color:#3B82F6}
.dt-card.teal .dt-card-ic{background:#F0FDFA;color:#14B8A6}
.dt-card-arrow{width:28px;height:28px;border-radius:50%;background:var(--s3);color:var(--t3);display:flex;align-items:center;justify-content:center;transition:all .2s ease}
.dt-card:hover .dt-card-arrow{transform:translateX(2px)}
.dt-card.blue:hover .dt-card-arrow{background:#EFF6FF;color:#3B82F6}
.dt-card.teal:hover .dt-card-arrow{background:#F0FDFA;color:#14B8A6}
.dt-card-t{font-size:15px;font-weight:800;margin-bottom:4px;color:var(--t1);position:relative;z-index:1}
.dt-card-d{font-size:11px;color:var(--t3);line-height:1.6;position:relative;z-index:1}
.dash-sep{margin:28px 0 18px;height:1px;background:var(--bl)}
.dt-card-btn{display:inline-flex;align-items:center;gap:5px;padding:8px 16px;border-radius:8px;font-size:11px;font-weight:600;border:none;cursor:pointer;font-family:inherit;transition:all .2s ease;margin-top:14px;position:relative;z-index:1}
.dt-card.blue .dt-card-btn{background:#EFF6FF;color:#3B82F6}
.dt-card.blue .dt-card-btn:hover{background:#DBEAFE}
.dt-card.teal .dt-card-btn{background:#F0FDFA;color:#14B8A6}
.dt-card.teal .dt-card-btn:hover{background:#CCFBF1}
/* tool inner pages */
.tool-pg{max-width:720px;margin:0 auto;padding:28px 0}
.tool-hd{text-align:center;margin-bottom:28px}
.tool-hd-t{font-size:24px;font-weight:900;letter-spacing:-.4px;margin-bottom:6px}
.tool-hd.blue .tool-hd-t{color:#2563EB}
.tool-hd.purple .tool-hd-t{color:var(--p)}
.tool-hd-d{font-size:13px;color:var(--t3);line-height:1.6}
.tool-hd-tags{display:flex;justify-content:center;gap:6px;margin-top:10px}
.tool-hd-tag{padding:4px 12px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit;transition:var(--tr)}
.tool-hd-tag:hover{border-color:var(--pl)}
.tool-hd-tag.on{color:#fff}
.tool-hd.blue .tool-hd-tag.on{background:#3B82F6;border-color:#3B82F6}
.tool-hd.purple .tool-hd-tag.on{background:var(--p);border-color:var(--p)}
.tool-form{background:var(--s);border:1px solid var(--bl);border-radius:16px;padding:24px}
.tool-fg{margin-bottom:18px}
.tool-fg-l{font-size:13px;font-weight:600;color:var(--t1);margin-bottom:6px}.tool-fg-l .rq{color:var(--r)}
.tool-inp{width:100%;padding:10px 14px;border:1.5px solid var(--bl);border-radius:10px;font-size:13px;font-family:inherit;color:var(--t1);background:var(--s);transition:var(--tr)}
.tool-inp:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}.tool-inp::placeholder{color:var(--t3)}
.tool-sel{width:100%;padding:10px 14px;border:1.5px solid var(--bl);border-radius:10px;font-size:13px;font-family:inherit;color:var(--t1);background:var(--s);appearance:none;cursor:pointer}
.tool-sel:focus{outline:none;border-color:var(--p)}
.tool-row{display:flex;gap:12px}.tool-row>*{flex:1}
.tool-btn{width:100%;padding:13px;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;border:none;font-family:inherit;color:#fff;display:flex;align-items:center;justify-content:center;gap:6px;margin-top:8px;transition:var(--tr)}
.tool-btn.blue{background:#3B82F6;box-shadow:0 4px 14px rgba(59,130,246,.25)}.tool-btn.blue:hover{background:#2563EB;transform:translateY(-1px)}
.tool-btn.purple{background:var(--p);box-shadow:0 4px 14px rgba(124,58,237,.25)}.tool-btn.purple:hover{background:var(--pd);transform:translateY(-1px)}
.tool-hint{text-align:center;margin-top:14px;font-size:11px;color:var(--t3);line-height:1.5}
.tool-empty{background:var(--s2);border-radius:14px;padding:48px 20px;text-align:center;margin-top:16px}
.tool-empty-ic{font-size:40px;margin-bottom:12px;opacity:.5}
.tool-empty-t{font-size:14px;font-weight:700;color:var(--t2);margin-bottom:4px}
.tool-empty-d{font-size:12px;color:var(--t3)}
/* avatar page */
.av-wrap{display:flex;height:calc(100vh - 52px);overflow:hidden}
.av-left{width:240px;min-width:240px;background:var(--s);border-right:1px solid var(--bl);padding:20px 16px;overflow-y:auto}
.av-left::-webkit-scrollbar{width:4px}.av-left::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.av-left-t{font-size:15px;font-weight:800;margin-bottom:14px}
.av-card{border:2px solid var(--bl);border-radius:12px;overflow:hidden;cursor:pointer;transition:all .2s ease;margin-bottom:12px}
.av-card:hover{border-color:var(--pl)}.av-card.on{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.av-card-img{height:120px;background:var(--s3);position:relative;display:flex;align-items:center;justify-content:center}
.av-card-img .av-res{position:absolute;top:8px;right:8px;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:var(--p);color:#fff}
.av-card-img .av-pro{position:absolute;top:8px;right:8px;font-size:9px;font-weight:700;padding:2px 7px;border-radius:4px;background:linear-gradient(135deg,#F59E0B,#EAB308);color:#fff}
.av-card-info{padding:10px 12px}
.av-card-nm{font-size:13px;font-weight:700;margin-bottom:2px}
.av-card-tags{font-size:10px;color:var(--t3)}
.av-center{flex:1;display:flex;align-items:center;justify-content:center;background:var(--s2);padding:24px}
.av-phone{width:280px;height:500px;border-radius:36px;background:#000;padding:12px;position:relative;box-shadow:0 20px 60px rgba(0,0,0,.15)}
.av-phone-inner{width:100%;height:100%;border-radius:26px;background:var(--s3);overflow:hidden;display:flex;align-items:center;justify-content:center;position:relative}
.av-phone-notch{position:absolute;top:8px;left:50%;transform:translateX(-50%);width:80px;height:22px;background:#000;border-radius:0 0 14px 14px;z-index:2}
.av-phone-play{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.8);display:flex;align-items:center;justify-content:center;cursor:pointer}
.av-phone-bar{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:100px;height:4px;background:rgba(0,0,0,.2);border-radius:2px}
.av-phone.landscape{width:500px;height:300px;border-radius:24px;padding:10px}
.av-phone.landscape .av-phone-inner{border-radius:16px}
.av-phone.landscape .av-phone-notch{display:none}
.av-right{width:320px;min-width:320px;background:var(--s);border-left:1px solid var(--bl);padding:24px 20px;overflow-y:auto}
.av-right::-webkit-scrollbar{width:4px}.av-right::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.av-right-t{font-size:17px;font-weight:800;margin-bottom:4px}
.av-right-d{font-size:11px;color:var(--t3);margin-bottom:20px}
.av-fg{margin-bottom:16px}
.av-fg-l{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.av-fg-tag{font-size:10px;font-weight:600;color:var(--p);cursor:pointer}
.av-inp{width:100%;padding:9px 12px;border:1.5px solid var(--bl);border-radius:10px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s);transition:var(--tr)}
.av-inp:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}.av-inp::placeholder{color:var(--t3)}
.av-sel{width:100%;padding:9px 12px;border:1.5px solid var(--bl);border-radius:10px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s);appearance:none;cursor:pointer}
.av-sel:focus{outline:none;border-color:var(--p)}
.av-ai-btn{width:100%;padding:10px;border-radius:10px;border:1.5px solid var(--pl);background:var(--pbg);color:var(--p);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:5px;transition:var(--tr);margin-bottom:16px}
.av-ai-btn:hover{background:#EDE9FE;border-color:var(--p)}
.av-row{display:flex;gap:10px}.av-row>*{flex:1}
.av-screen-btns{display:flex;gap:6px}
.av-scr{flex:1;padding:8px;border-radius:8px;border:1.5px solid var(--bl);font-size:11px;font-weight:600;cursor:pointer;text-align:center;font-family:inherit;background:var(--s);color:var(--t2);transition:var(--tr)}
.av-scr.on{border-color:var(--p);background:var(--pbg);color:var(--p)}
.av-scr:hover{border-color:var(--pl)}
.av-bottom{display:flex;gap:8px;margin-top:20px;padding-top:16px;border-top:1px solid var(--bl)}
.av-bottom .av-b{flex:1;padding:11px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;text-align:center;transition:var(--tr);display:flex;align-items:center;justify-content:center;gap:5px}
.av-bottom .av-b.ghost{border:1px solid var(--b);background:var(--s);color:var(--t2)}.av-bottom .av-b.ghost:hover{background:var(--s3)}
.av-bottom .av-b.primary{border:none;background:var(--p);color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.25)}.av-bottom .av-b.primary:hover{background:var(--pd)}
/* hero */
.hero{background:linear-gradient(135deg,#7C3AED,#6D28D9 40%,#5B21B6);border-radius:var(--rx);padding:28px 32px;margin-bottom:20px;position:relative;overflow:hidden;color:#fff}
.hero::before{content:'';position:absolute;top:-60%;right:-10%;width:380px;height:380px;background:radial-gradient(circle,rgba(255,255,255,.07),transparent 70%);border-radius:50%}
.hero-t{font-size:22px;font-weight:800;margin-bottom:5px;position:relative;z-index:1}.hero-s{font-size:13px;opacity:.8;margin-bottom:16px;position:relative;z-index:1}
.hero-a{display:flex;gap:8px;flex-wrap:wrap;position:relative;z-index:1}
.hb{display:inline-flex;align-items:center;gap:6px;padding:9px 18px;border-radius:var(--rd);font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:var(--tr)}
.hb-w{background:#fff;color:var(--p)}.hb-w:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(0,0,0,.12)}
.hb-o{background:rgba(255,255,255,.14);color:#fff;border:1px solid rgba(255,255,255,.25)}.hb-o:hover{background:rgba(255,255,255,.22)}
.sts{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
.st{background:var(--s);border-radius:var(--rl);padding:16px 18px;border:1px solid var(--bl)}.st-l{font-size:11px;color:var(--t3);margin-bottom:4px}.st-v{font-size:24px;font-weight:800;letter-spacing:-.4px}.st-c{font-size:11px;font-weight:600;margin-top:3px;color:var(--g)}
.sh{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}.sh-t{font-size:15px;font-weight:700;display:flex;align-items:center;gap:6px}.sh-l{font-size:12px;color:var(--p);cursor:pointer;font-weight:500;display:flex;align-items:center;gap:3px}
.pg{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;margin-bottom:24px}
.pj{background:var(--s);border-radius:var(--rl);padding:18px;border:1px solid var(--bl);cursor:pointer;transition:var(--tr)}.pj:hover{border-color:var(--pl);box-shadow:0 4px 14px rgba(0,0,0,.06);transform:translateY(-2px)}
.pj-tp{display:flex;justify-content:space-between;margin-bottom:10px}.pj-tg{font-size:10px;padding:2px 7px;border-radius:4px;background:#FFF7ED;color:var(--o);font-weight:600}
.pj-s{font-size:10px;font-weight:600;padding:2px 7px;border-radius:10px}.pj-s.done{background:#ECFDF5;color:var(--g)}.pj-s.progress{background:#FEF3C7;color:var(--w)}.pj-s.draft{background:var(--s3);color:var(--t3)}
.pj-t{font-size:14px;font-weight:600;margin-bottom:3px}.pj-d{font-size:11px;color:var(--t3);margin-bottom:12px}.pj-m{display:flex;gap:10px;font-size:11px;color:var(--t3)}.pj-mi{display:flex;align-items:center;gap:3px}
.rg{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;margin-bottom:24px}
.rc{background:var(--s);border-radius:var(--rl);padding:14px;border:1px solid var(--bl);cursor:pointer;transition:var(--tr)}.rc:hover{border-color:var(--pl);transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.06)}
.rbd{display:flex;gap:5px;margin-bottom:7px}.bd{font-size:9px;font-weight:700;padding:2px 7px;border-radius:3px}.bd-conv{background:#FEF3C7;color:#92400E}.bd-exp{background:#DBEAFE;color:#1E40AF}.bd-auth{background:#F3E8FF;color:#6D28D9}
.rc-n{font-size:13px;font-weight:700;margin-bottom:3px}.rc-s{font-size:10px;color:var(--t3)}
/* modal */
.ov{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center}
.mdl{background:var(--s);border-radius:var(--rx);width:90%;max-width:560px;max-height:85vh;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,.1);display:flex;flex-direction:column;animation:mIn .25s ease}
@keyframes mIn{from{opacity:0;transform:translateY(16px) scale(.98)}to{opacity:1;transform:translateY(0) scale(1)}}
.mdl-h{display:flex;justify-content:space-between;align-items:center;padding:18px 24px;border-bottom:1px solid var(--bl)}
.mdl-ht{font-size:17px;font-weight:700;display:flex;align-items:center;gap:8px}
.mdl-x{width:34px;height:34px;border-radius:var(--rd);display:flex;align-items:center;justify-content:center;cursor:pointer;border:none;background:none;color:var(--t3)}.mdl-x:hover{background:var(--s3);color:var(--t1)}
.mdl-b{flex:1;overflow-y:auto;padding:24px}
.mdl-f{display:flex;justify-content:space-between;align-items:center;padding:16px 24px;border-top:1px solid var(--bl)}
.step-dots{display:flex;gap:6px}.step-dot{width:8px;height:8px;border-radius:50%;background:var(--bl);transition:var(--tr)}.step-dot.on{background:var(--p);width:24px;border-radius:4px}
.mcd{display:flex;gap:12px}
.mc{flex:1;padding:24px;border-radius:var(--rl);border:2px solid var(--bl);cursor:pointer;transition:var(--tr);text-align:center}.mc:hover{border-color:var(--pl);background:var(--pbg)}.mc.on{border-color:var(--p);background:var(--pbg);box-shadow:0 0 0 3px var(--pg)}
.mc-ic{width:48px;height:48px;border-radius:50%;background:var(--pbg);color:var(--p);display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:20px}.mc.on .mc-ic{background:var(--p);color:#fff}
.mc-t{font-size:15px;font-weight:700;margin-bottom:4px}.mc-d{font-size:12px;color:var(--t2);line-height:1.5}
.mtg{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.mtc{border:1.5px solid var(--bl);border-radius:var(--rl);padding:14px;cursor:pointer;transition:var(--tr);position:relative}.mtc:hover{border-color:var(--pl)}.mtc.on{border-color:var(--p);background:var(--pbg);box-shadow:0 0 0 3px var(--pg)}
.mtc-ck{position:absolute;top:10px;right:10px;width:20px;height:20px;border-radius:50%;background:var(--p);color:#fff;display:flex;align-items:center;justify-content:center}
.mtc.none{border-style:dashed;text-align:center;display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100px}
.mtc-n{font-size:14px;font-weight:700;margin-bottom:3px}.mtc-m{font-size:10px;color:var(--t3);margin-bottom:4px}.mtc-d{font-size:11px;color:var(--t2);line-height:1.5}
.fg2{margin-bottom:16px}.fg2-l{font-size:12px;font-weight:600;color:var(--t2);margin-bottom:6px;display:block}.fg2-l .rq{color:var(--r)}
.fin{width:100%;padding:9px 12px;border:1px solid var(--b);border-radius:var(--rd);font-size:13px;font-family:inherit;color:var(--t1)}.fin:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}.fin::placeholder{color:var(--t3)}
.chs{display:flex;flex-wrap:wrap;gap:6px}
.ch{padding:6px 14px;border-radius:18px;font-size:12px;font-weight:500;cursor:pointer;border:1.5px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit}.ch:hover{border-color:var(--pl)}.ch.on{background:var(--p);color:#fff;border-color:var(--p)}
.tr{display:flex;justify-content:space-between;align-items:center;padding:4px 0}.trl{font-size:13px;font-weight:600}.trb{cursor:pointer;background:none;border:none;display:flex}
.dh{font-size:10px;color:var(--t3);line-height:1.5;margin-top:4px}
/* create page */
.sw{display:flex;flex:1;overflow:hidden}
.sl{width:200px;min-width:200px;background:var(--s);border-right:1px solid var(--bl);display:flex;flex-direction:column;overflow-y:auto}.sl::-webkit-scrollbar{width:4px}.sl::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.srt{flex:1;display:flex;flex-direction:column;overflow:hidden}
.sl-hd{padding:14px 16px;border-bottom:1px solid var(--bl)}.sl-bk{display:flex;align-items:center;gap:4px;font-size:12px;color:var(--t3);cursor:pointer;margin-bottom:6px}.sl-bk:hover{color:var(--p)}
.sl-sec{padding:10px 14px;border-bottom:1px solid var(--bl)}.sl-lb{font-size:10px;font-weight:600;color:var(--t3);margin-bottom:4px;text-transform:uppercase;letter-spacing:.3px}.sl-vl{font-size:13px;font-weight:500}
.sl-tag{display:inline-block;font-size:10px;padding:3px 8px;border-radius:4px;background:var(--pbg);color:var(--p);font-weight:600}
.rh{padding:10px 20px;background:var(--s);border-bottom:1px solid var(--bl);display:flex;justify-content:space-between;align-items:center;min-height:44px}
.rht{font-size:13px;font-weight:600;display:flex;align-items:center;gap:6px;cursor:pointer}.rw{font-size:10px;color:var(--o);background:#FFF7ED;padding:2px 7px;border-radius:4px}
.rb{flex:1;overflow-y:auto;padding:16px 20px}.rb::-webkit-scrollbar{width:5px}.rb::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
.scd{background:var(--s);border-radius:var(--rl);border:1px solid var(--bl);padding:18px 22px;margin-bottom:12px;cursor:pointer;transition:var(--tr)}.scd:hover{border-color:var(--pl);box-shadow:0 4px 14px rgba(0,0,0,.06)}
.scd-t{display:flex;justify-content:space-between;margin-bottom:6px}.scd-n{font-size:16px;font-weight:700}.scd-m{font-size:11px;color:var(--t3);margin-bottom:5px}.scd-d{font-size:12px;color:var(--t2);line-height:1.6}
.eb{display:flex;align-items:center;gap:3px;font-size:11px;color:var(--p);font-weight:600;cursor:pointer;border:none;background:none;font-family:inherit;float:right;margin-top:8px}
.ds{margin-bottom:20px}.dst{font-size:14px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.li{display:flex;align-items:flex-start;gap:8px;padding:6px 0;font-size:12px;color:var(--t2);line-height:1.6}.ln{width:20px;height:20px;border-radius:50%;background:var(--pbg);color:var(--p);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;flex-shrink:0}
.stb{width:100%;border-collapse:separate;border-spacing:0;font-size:11px}.stb th{padding:8px 10px;background:var(--s3);font-weight:600;color:var(--t2);text-align:left;border-bottom:1px solid var(--b)}.stb th:first-child{border-radius:var(--rd) 0 0 0}.stb th:last-child{border-radius:0 var(--rd) 0 0}.stb td{padding:8px 10px;border-bottom:1px solid var(--bl);vertical-align:top}.stb .rsk{color:var(--r);font-weight:500}.stb .int{color:var(--t3);font-size:10px}
.ab{display:flex;gap:6px;margin-top:16px;flex-wrap:wrap}.abi{display:inline-flex;align-items:center;gap:4px;padding:7px 14px;border-radius:var(--rd);font-size:11px;font-weight:600;cursor:pointer;border:1px solid var(--b);background:var(--s);color:var(--t2);font-family:inherit}.abi:hover{border-color:var(--pl);color:var(--p)}.abi.pr{background:var(--p);color:#fff;border-color:var(--p)}
.shw{display:flex;flex:1;overflow:hidden}.shc{flex:1;display:flex;flex-direction:column;overflow:hidden}
.shb{flex:1;overflow-y:auto;padding:16px 20px}.shb::-webkit-scrollbar{width:5px}.shb::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
.shi{background:var(--s);border-radius:var(--rl);border:1px solid var(--bl);padding:14px 18px;margin-bottom:8px;position:relative;transition:var(--tr)}.shi:hover{border-color:var(--pl)}.shi.ed{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.shl{font-size:10px;color:var(--t3);font-weight:600;margin-bottom:4px;display:flex;align-items:center;gap:5px}.shx{width:18px;height:18px;border-radius:50%;background:var(--pbg);color:var(--p);display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700}
.shtx{font-size:12px;line-height:1.7}.sha{position:absolute;top:10px;right:12px;display:flex;gap:4px;opacity:0;transition:.15s}.shi:hover .sha{opacity:1}
.shab{width:26px;height:26px;border-radius:5px;display:flex;align-items:center;justify-content:center;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t3)}.shab:hover{border-color:var(--p);color:var(--p);background:var(--pbg)}
.scn{background:var(--s3);border-radius:7px;padding:7px 10px;margin-top:6px;font-size:11px;color:var(--t2)}.scn-l{font-size:9px;color:var(--t3);font-weight:600;margin-bottom:1px}
.tgs{display:flex;align-items:center;gap:6px;font-size:11px;color:var(--t2);font-weight:500}
.ba{display:flex;gap:6px;padding:12px 20px;background:var(--s);border-top:1px solid var(--bl);justify-content:center}
.bab{padding:9px 20px;border-radius:var(--rd);font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px}.bab-g{border:1px solid var(--b);background:var(--s);color:var(--t2)}.bab-p{border:none;background:var(--p);color:#fff}
.po{width:280px;min-width:280px;background:var(--s);border-left:1px solid var(--bl);display:flex;flex-direction:column;overflow:hidden}
.po-h{padding:12px 14px;border-bottom:1px solid var(--bl);font-size:13px;font-weight:700}
.po-b{flex:1;overflow-y:auto}.po-b::-webkit-scrollbar{width:4px}.po-b::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.rf{margin:8px 10px;border:1px solid var(--bl);border-radius:var(--rd);padding:10px;cursor:pointer}.rf:hover{border-color:var(--pl)}
.rft{display:inline-block;font-size:9px;font-weight:700;padding:2px 5px;border-radius:3px;margin-bottom:5px}
.rftx{font-size:10px;color:var(--t2);line-height:1.6;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.rfm{font-size:9px;color:var(--t3);margin-top:3px}
.pos{padding:10px 14px}.pos-t{font-size:13px;font-weight:700;margin-bottom:8px}.poc{display:flex;flex-wrap:wrap;gap:5px;margin-bottom:8px}
.poci{padding:5px 10px;border-radius:5px;font-size:10px;font-weight:500;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit}.poci:hover{border-color:var(--p);color:var(--p);background:var(--pbg)}
.por{display:flex;gap:5px}.poi{flex:1;padding:7px 10px;border:1px solid var(--b);border-radius:7px;font-size:11px;font-family:inherit}.poi:focus{outline:none;border-color:var(--p)}.poi::placeholder{color:var(--t3)}
.pos-b{padding:7px 12px;border-radius:7px;background:var(--p);color:#fff;border:none;font-size:11px;font-weight:600;cursor:pointer;font-family:inherit}
/* deep chat */
.cc{display:flex;flex-direction:column;height:100%}
.cmsg{flex:1;overflow-y:auto;padding:20px 24px;background:var(--s2)}.cmsg::-webkit-scrollbar{width:5px}.cmsg::-webkit-scrollbar-thumb{background:var(--b);border-radius:3px}
.chat-welcome{text-align:center;padding:40px 20px 20px}
.chat-welcome-ic{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--pbg),#EDE9FE);color:var(--p);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:20px;border:2px solid #DDD6FE}
.chat-welcome-t{font-size:16px;font-weight:800;color:var(--t1);margin-bottom:4px}
.chat-welcome-d{font-size:12px;color:var(--t3);line-height:1.6}
.mg{display:flex;gap:10px;margin-bottom:18px;max-width:85%}.mg.u{margin-left:auto;flex-direction:row-reverse}
.ma{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;font-weight:700}.ma.bot{background:linear-gradient(135deg,var(--pbg),#EDE9FE);color:var(--p);border:1px solid #DDD6FE}.ma.usr{background:var(--s3);color:var(--t2)}
.mbu{padding:12px 16px;border-radius:14px;font-size:13px;line-height:1.7;box-shadow:0 1px 3px rgba(0,0,0,.03)}
.mg.bot .mbu{background:var(--s);border:1px solid var(--bl);border-top-left-radius:4px}.mg.u .mbu{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;border-top-right-radius:4px;box-shadow:0 2px 8px rgba(124,58,237,.15)}
.qab{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}
.qa{padding:6px 14px;border-radius:8px;font-size:11px;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t1);font-family:inherit;transition:var(--tr);font-weight:500}.qa:hover{border-color:var(--p);color:var(--p);background:var(--pbg)}
.qa:nth-child(1){background:#EFF6FF;color:#3B82F6;border-color:#DBEAFE}
.qa:nth-child(2){background:#FEF3C7;color:#D97706;border-color:#FDE68A}
.qa:nth-child(3){background:var(--pbg);color:var(--p);border-color:#DDD6FE}
.qa:nth-child(1):hover{background:#DBEAFE;border-color:#93C5FD}
.qa:nth-child(2):hover{background:#FDE68A;border-color:#FCD34D}
.qa:nth-child(3):hover{background:#EDE9FE;border-color:var(--pl)}
.hi2{display:flex;justify-content:space-between;padding:10px 14px;border:1px solid var(--bl);border-radius:10px;margin-bottom:6px;font-size:12px;cursor:pointer;background:var(--s);transition:var(--tr)}.hi2:hover{border-color:var(--pl);background:var(--pbg)}.hi2c{font-size:11px;color:var(--t3)}
.acs{display:flex;gap:8px;margin:10px 0}.ac{flex:1;padding:12px;border:1px solid var(--bl);border-radius:12px;cursor:pointer;background:var(--s);transition:var(--tr)}.ac:hover{border-color:var(--pl);background:var(--pbg)}
.ac-t{font-size:12px;font-weight:700;margin-bottom:2px}.ac-s{font-size:9px;color:var(--t3);margin-bottom:4px}.ac-d{font-size:10px;color:var(--t2);line-height:1.5}
.cbr{padding:12px 20px;border-top:1px solid var(--bl);background:var(--s);display:flex;gap:8px;align-items:center}
.cin{flex:1;padding:10px 14px;border:1.5px solid var(--bl);border-radius:12px;font-size:13px;font-family:inherit;background:var(--s);transition:var(--tr)}.cin:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}.cin::placeholder{color:var(--t3)}
.csb{width:38px;height:38px;border-radius:10px;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;box-shadow:0 2px 8px rgba(124,58,237,.25);transition:var(--tr)}.csb:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(124,58,237,.3)}
.cmb{width:38px;height:38px;border-radius:10px;background:var(--s);color:var(--t3);border:1.5px solid var(--bl);display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:var(--tr)}.cmb:hover{border-color:var(--pl);color:var(--p)}
.cgb{margin:0 20px 12px;padding:12px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 16px rgba(124,58,237,.25);transition:var(--tr)}.cgb:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.3)}
/* deep sidebar */
.dp-hd{padding:16px;background:linear-gradient(160deg,#F5F0FF,#EDE9FE);border-bottom:1px solid #DDD6FE;margin-bottom:4px}
.dp-hd-t{font-size:14px;font-weight:800;color:var(--pd);margin-bottom:2px;display:flex;align-items:center;gap:6px}
.dp-hd-d{font-size:10px;color:var(--p);opacity:.6}
.dp-sec-t{font-size:10px;font-weight:700;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;padding:10px 16px 6px}
.dp-card{display:flex;align-items:center;gap:10px;padding:10px 14px;margin:0 8px 4px;border-radius:10px;border:1px solid transparent;cursor:pointer;transition:var(--tr)}.dp-card:hover{border-color:var(--pl);background:var(--pbg)}
.dp-ic{width:32px;height:32px;border-radius:8px;background:var(--pbg);color:var(--p);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:13px}
.dp-t{font-size:12px;font-weight:600;color:var(--t1)}.dp-d{font-size:10px;color:var(--t3);margin-top:1px}
/* ip interview */
.ip-fw{max-width:620px;margin:0 auto}
.ip-fw-t{font-size:22px;font-weight:800;text-align:center;margin-bottom:6px;letter-spacing:-.4px}
.ip-fw-d{font-size:13px;color:var(--t2);text-align:center;margin-bottom:32px;line-height:1.6}
.ip-fg{margin-bottom:22px}
.ip-fg-l{font-size:13px;font-weight:600;color:var(--t1);margin-bottom:8px}
.ip-roles{display:flex;flex-wrap:wrap;gap:8px}
.ip-rl{padding:10px 20px;border-radius:22px;border:1.5px solid var(--bl);font-size:13px;font-weight:500;cursor:pointer;background:var(--s);color:var(--t2);font-family:inherit;transition:var(--tr)}
.ip-rl:hover{border-color:var(--pl);background:var(--pbg)}.ip-rl.on{background:var(--p);color:#fff;border-color:var(--p);box-shadow:0 2px 10px rgba(124,58,237,.2)}
.ip-acts{display:flex;justify-content:space-between;margin-top:32px}
/* mode select */
.ip-mode-wrap{display:flex;flex-direction:column;align-items:center;gap:16px;max-width:420px;margin:0 auto}
.ip-mode-main{width:100%;padding:32px 28px;border-radius:16px;background:linear-gradient(135deg,var(--p) 0%,#8B5CF6 50%,#A78BFA 100%);color:#fff;cursor:pointer;transition:var(--tr);text-align:center;box-shadow:0 8px 32px rgba(124,58,237,.25);position:relative;overflow:hidden}
.ip-mode-main::before{content:'';position:absolute;top:-40%;right:-20%;width:200px;height:200px;background:radial-gradient(circle,rgba(255,255,255,.12),transparent 70%);border-radius:50%}
.ip-mode-main:hover{transform:translateY(-3px);box-shadow:0 12px 40px rgba(124,58,237,.35)}
.ip-mode-main .im-ic{width:48px;height:48px;border-radius:50%;background:rgba(255,255,255,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;font-size:20px;backdrop-filter:blur(4px)}
.ip-mode-main .im-t{font-size:18px;font-weight:700;margin-bottom:6px;position:relative;z-index:1}
.ip-mode-main .im-d{font-size:13px;opacity:.85;position:relative;z-index:1;line-height:1.5}
.ip-mode-alt{width:100%;padding:16px;border-radius:12px;border:1px solid var(--bl);cursor:pointer;transition:var(--tr);text-align:center;background:var(--s);display:flex;align-items:center;justify-content:center;gap:10px}
.ip-mode-alt:hover{border-color:var(--pl);background:var(--pbg)}
.ip-mode-alt .im-t{font-size:14px;font-weight:600;color:var(--t2)}
.ip-mode-alt .im-d{font-size:11px;color:var(--t3)}
/* interview panel */
.iv-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;padding:16px 20px;background:linear-gradient(135deg,#F5F0FF,#EDE9FE);border-radius:14px;border:1px solid #DDD6FE}
.iv-hd-l{display:flex;align-items:center;gap:12px}
.iv-hd-av{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--p),#A78BFA);display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;font-weight:700;box-shadow:0 4px 12px rgba(124,58,237,.2)}
.iv-hd-nm{font-size:14px;font-weight:700;color:var(--p)}.iv-hd-sub{font-size:11px;color:var(--t3);margin-top:1px}
.iv-hd-r{font-size:11px;color:var(--p);text-align:right;line-height:1.6;font-weight:500;opacity:.8}
.iv-phases{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:24px}
.iv-ph{padding:12px 8px;border-radius:10px;border:1.5px solid var(--bl);text-align:center;transition:var(--tr);background:var(--s)}
.iv-ph.on{border-color:var(--p);background:var(--pbg);box-shadow:0 2px 8px rgba(124,58,237,.1)}
.iv-ph.dn{border-color:var(--g);background:#F0FDF4}
.iv-ph-num{width:22px;height:22px;border-radius:50%;background:var(--s3);color:var(--t3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;margin:0 auto 6px}
.iv-ph.on .iv-ph-num{background:var(--p);color:#fff}.iv-ph.dn .iv-ph-num{background:var(--g);color:#fff}
.iv-ph-nm{font-size:11px;font-weight:700;color:var(--t2);margin-bottom:1px}
.iv-ph.on .iv-ph-nm{color:var(--p)}.iv-ph.dn .iv-ph-nm{color:var(--g)}
.iv-ph-sub{font-size:9px;color:var(--t3)}
.iv-scroll{max-height:400px;overflow-y:auto;padding-right:4px;margin-bottom:8px}.iv-scroll::-webkit-scrollbar{width:4px}.iv-scroll::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.iv-qa{margin-bottom:18px}
.iv-q{display:flex;gap:10px;margin-bottom:12px}
.iv-q-av{width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--pbg),#EDE9FE);color:var(--p);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px;font-weight:700;border:1px solid #DDD6FE}
.iv-q-bub{padding:14px 18px;background:var(--s);border:1px solid var(--bl);border-radius:16px;border-top-left-radius:4px;font-size:13px;line-height:1.7;color:var(--t1);box-shadow:0 1px 3px rgba(0,0,0,.03)}
.iv-a{display:flex;gap:10px;margin-bottom:6px;justify-content:flex-end}
.iv-a-bub{padding:14px 18px;background:linear-gradient(135deg,var(--p),var(--pl));border-radius:16px;border-top-right-radius:4px;font-size:13px;line-height:1.7;color:#fff;max-width:82%;position:relative;box-shadow:0 2px 8px rgba(124,58,237,.15)}
.iv-a-redo{display:block;text-align:right;font-size:10px;color:var(--p);cursor:pointer;font-weight:500;opacity:.6;transition:var(--tr);margin-top:4px;padding-right:2px}
.iv-a-redo:hover{opacity:1}
.iv-input{display:flex;gap:8px;align-items:flex-end}
.iv-in{flex:1;padding:14px 18px;border:1.5px solid var(--bl);border-radius:14px;font-size:13px;font-family:inherit;color:var(--t1);transition:var(--tr);resize:none;line-height:1.5;background:var(--s)}
.iv-in:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg);background:#fff}.iv-in::placeholder{color:var(--t3)}
.iv-send{width:44px;height:44px;border-radius:12px;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;border:none;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:var(--tr);box-shadow:0 3px 12px rgba(124,58,237,.25)}
.iv-send:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.35)}
/* ip done / profile */
.ip-dn{text-align:center;padding:40px 20px}
.ip-dn-ic{width:72px;height:72px;border-radius:50%;background:linear-gradient(135deg,#D1FAE5,#A7F3D0);color:var(--g);display:flex;align-items:center;justify-content:center;margin:0 auto 18px;font-size:32px;box-shadow:0 4px 16px rgba(16,185,129,.15)}
.ip-pf{margin-top:24px;text-align:left;background:var(--s);border-radius:var(--rl);border:1px solid var(--bl);overflow:hidden}
.ip-pf-item{display:flex;align-items:flex-start;padding:14px 18px;border-bottom:1px solid var(--bl);transition:var(--tr)}
.ip-pf-item:last-child{border:none}
.ip-pf-item:hover{background:var(--s2)}
.ip-pf-l{font-size:11px;color:var(--t3);font-weight:600;min-width:72px;padding-top:2px}
.ip-pf-v{font-size:13px;color:var(--t1);flex:1;line-height:1.6}
.ip-pf-edit{font-size:10px;color:var(--p);cursor:pointer;font-weight:500;flex-shrink:0;margin-left:10px;opacity:.5;transition:var(--tr)}
.ip-pf-item:hover .ip-pf-edit{opacity:1}
/* imgtext page */
.it-wrap{display:flex;height:calc(100vh - 52px);overflow:hidden}
.it-left{width:480px;min-width:480px;background:var(--s);border-right:1px solid var(--bl);display:flex;flex-direction:column;overflow-y:auto}
.it-left::-webkit-scrollbar{width:4px}.it-left::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.it-left-hd{padding:24px 24px 0}
.it-left-t{font-size:20px;font-weight:800;margin-bottom:4px;display:flex;align-items:center;gap:8px}
.it-left-tag{font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;background:var(--pbg);color:var(--p)}
.it-left-d{font-size:12px;color:var(--t3);margin-bottom:20px}
.it-sec{padding:0 24px 20px}
.it-sec-t{font-size:14px;font-weight:700;margin-bottom:14px;display:flex;align-items:center;gap:6px}
.it-plats{display:flex;border:1.5px solid var(--bl);border-radius:10px;overflow:hidden;margin-bottom:16px}
.it-plat{flex:1;padding:9px;text-align:center;font-size:12px;font-weight:500;cursor:pointer;transition:var(--tr);font-family:inherit;border:none;background:var(--s);color:var(--t2)}
.it-plat:not(:last-child){border-right:1.5px solid var(--bl)}
.it-plat:hover{background:var(--s3)}.it-plat.on{background:var(--p);color:#fff}
.it-fg{margin-bottom:16px}
.it-fg-l{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:6px;display:flex;justify-content:space-between;align-items:center}
.it-fg-ct{font-size:10px;color:var(--t3);font-weight:400}
.it-fg-link{font-size:11px;color:var(--p);font-weight:500;cursor:pointer}
.it-inp{width:100%;padding:10px 12px;border:1.5px solid var(--bl);border-radius:10px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s);transition:var(--tr)}
.it-inp:focus{outline:none;border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}.it-inp::placeholder{color:var(--t3)}
.it-sel{width:100%;padding:10px 12px;border:1.5px solid var(--bl);border-radius:10px;font-size:12px;font-family:inherit;color:var(--t1);background:var(--s);appearance:none;cursor:pointer}
.it-sel:focus{outline:none;border-color:var(--p)}
.it-gen-btn{width:100%;padding:13px;border-radius:12px;border:none;background:var(--p);color:#fff;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:0 4px 14px rgba(124,58,237,.25);transition:var(--tr);margin-bottom:12px}
.it-gen-btn:hover{background:var(--pd);transform:translateY(-1px)}
.it-tip{display:flex;gap:8px;padding:12px 14px;background:var(--s2);border-radius:10px;border:1px solid var(--bl)}
.it-tip-ic{width:28px;height:28px;border-radius:7px;background:var(--pbg);color:var(--p);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:12px}
.it-tip-t{font-size:11px;font-weight:600;color:var(--t2);margin-bottom:2px}
.it-tip-d{font-size:10px;color:var(--t3);line-height:1.5}
.it-right{flex:1;background:var(--s2);display:flex;align-items:center;justify-content:center;padding:32px}
.it-preview{width:100%;max-width:400px;background:var(--s);border-radius:16px;border:1px solid var(--bl);min-height:480px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.04)}
.it-pv-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center}
.it-pv-ic{width:56px;height:56px;border-radius:50%;background:var(--s3);display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:22px}
.it-pv-t{font-size:14px;font-weight:700;color:var(--t2);margin-bottom:4px}
.it-pv-d{font-size:11px;color:var(--t3);line-height:1.6;margin-bottom:20px}
.it-pv-skel{width:100%;padding:0 24px}
.it-pv-skel-line{height:10px;background:var(--s3);border-radius:5px;margin-bottom:8px}
.it-pv-skel-line.w60{width:60%}.it-pv-skel-line.w80{width:80%}.it-pv-skel-line.w40{width:40%}
.it-pv-skel-block{height:80px;background:var(--s3);border-radius:10px;margin:8px 0}
/* schedule page */
.sch-wrap{display:flex;height:calc(100vh - 52px);overflow:hidden}
.sch-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.sch-top{padding:14px 20px;display:flex;align-items:center;gap:10px;border-bottom:1px solid var(--bl);background:var(--s)}
.sch-legend{display:flex;gap:12px;margin-left:auto;font-size:11px;color:var(--t2)}
.sch-legend span::before{content:'';display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:4px;vertical-align:middle}
.sch-legend .lg-sell::before{background:#3B82F6}.sch-legend .lg-edu::before{background:#10B981}.sch-legend .lg-story::before{background:var(--p)}.sch-legend .lg-daily::before{background:#F59E0B}
.sch-cal{flex:1;overflow:auto;padding:0}
.sch-cal table{width:100%;border-collapse:collapse;table-layout:fixed}
.sch-cal th{padding:10px 4px;font-size:12px;font-weight:600;color:var(--t3);text-align:center;border-bottom:1px solid var(--bl);background:var(--s2)}
.sch-cal th:first-child{width:100px}
.sch-cal td{border:1px solid var(--bl);vertical-align:top;padding:4px 6px;height:80px;font-size:12px;cursor:pointer;transition:background .15s;background:var(--s)}
.sch-cal td:first-child{background:var(--s2);text-align:center;vertical-align:middle;cursor:default;border:1px solid var(--bl)}
.sch-cal td:hover{background:var(--s2)}
.sch-cal td .day-n{font-weight:600;color:var(--t1);margin-bottom:2px}.sch-cal td.dim .day-n{color:var(--t3)}
.sch-cal td.today{background:#F5F0FF}.sch-cal td.today .day-n{color:var(--p)}
.sch-today-badge{display:inline-block;padding:1px 6px;border-radius:4px;background:var(--p);color:#fff;font-size:9px;font-weight:700;margin-left:3px}
.sch-wk-n{font-size:11px;font-weight:700;color:var(--p);margin-bottom:2px}
.sch-wk-d{font-size:9px;color:var(--t3);cursor:pointer}.sch-wk-d:hover{color:var(--p)}
.sch-nav{display:flex;align-items:center;justify-content:center;gap:8px;padding:10px;border-top:1px solid var(--bl);background:var(--s)}
.sch-nav-btn{padding:6px 14px;border-radius:8px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit;transition:var(--tr)}.sch-nav-btn:hover{border-color:var(--pl);color:var(--p)}
.sch-nav-btn.today{background:var(--p);color:#fff;border-color:var(--p)}.sch-nav-btn.today:hover{background:var(--pd)}
.sch-pub{display:flex;gap:8px;margin-left:auto}
.sch-pub-btn{padding:7px 18px;border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:var(--tr);display:flex;align-items:center;gap:4px}
.sch-pub-btn.pri{border:none;background:var(--p);color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.2)}.sch-pub-btn.pri:hover{background:var(--pd)}
.sch-pub-btn.sec{border:1px solid var(--bl);background:var(--s);color:var(--t2)}.sch-pub-btn.sec:hover{border-color:var(--pl)}
/* schedule sidebar */
.sch-side{width:280px;min-width:280px;background:var(--s);border-left:1px solid var(--bl);padding:20px 16px;overflow-y:auto}
.sch-side::-webkit-scrollbar{width:4px}.sch-side::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.sch-side-t{font-size:15px;font-weight:800;margin-bottom:12px}
.sch-board{background:var(--s2);border-radius:12px;padding:14px;margin-bottom:14px;border:1px solid var(--bl)}
.sch-board-row{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px}
.sch-board-lbl{font-size:10px;color:var(--t3)}.sch-board-v{font-size:22px;font-weight:800}.sch-board-pct{font-size:24px;font-weight:800;color:var(--p)}
.sch-board-sub{display:flex;justify-content:space-between;font-size:10px;color:var(--t3);padding-top:8px;border-top:1px solid var(--bl);margin-top:8px}
.sch-focus{background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;border-radius:12px;padding:16px;margin-bottom:14px;position:relative;overflow:hidden}
.sch-focus::before{content:'';position:absolute;top:-20px;right:-20px;width:80px;height:80px;background:rgba(255,255,255,.08);border-radius:50%}
.sch-focus-tag{font-size:9px;font-weight:700;opacity:.7;margin-bottom:6px}
.sch-focus-t{font-size:14px;font-weight:700;margin-bottom:6px;position:relative;z-index:1}
.sch-focus-d{font-size:11px;opacity:.7;position:relative;z-index:1}
.sch-add{background:var(--s);border:1px solid var(--bl);border-radius:12px;padding:14px;margin-bottom:14px}
.sch-add-t{font-size:13px;font-weight:700;margin-bottom:10px}
.sch-add-btn{display:flex;align-items:center;gap:6px;font-size:12px;color:var(--p);font-weight:600;cursor:pointer;padding:6px 0;transition:var(--tr)}.sch-add-btn:hover{opacity:.7}
.sch-add-link{font-size:11px;color:var(--t3);cursor:pointer;padding:4px 0}.sch-add-link:hover{color:var(--p)}
.sch-detail-t{font-size:13px;font-weight:700;display:flex;justify-content:space-between;margin-bottom:8px}
.sch-detail-ct{font-size:11px;color:var(--t3);font-weight:400}
/* schedule modal */
.sch-ov{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:100;display:flex;align-items:center;justify-content:center}
.sch-mdl{background:var(--s);border-radius:18px;width:92%;max-width:820px;max-height:85vh;display:flex;box-shadow:0 20px 60px rgba(0,0,0,.15);animation:mIn .25s ease;overflow:hidden}
.sch-mdl-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.sch-mdl-hd{padding:18px 24px;border-bottom:1px solid var(--bl);display:flex;justify-content:space-between;align-items:center}
.sch-mdl-t{font-size:17px;font-weight:800}
.sch-mdl-tabs{display:flex;border:1.5px solid var(--bl);border-radius:10px;overflow:hidden;margin:16px 24px 0}
.sch-mdl-tab{flex:1;padding:9px;text-align:center;font-size:12px;font-weight:500;cursor:pointer;background:var(--s);color:var(--t2);font-family:inherit;border:none;transition:var(--tr)}.sch-mdl-tab:not(:last-child){border-right:1.5px solid var(--bl)}
.sch-mdl-tab.on{background:var(--p);color:#fff}
.sch-mdl-body{flex:1;overflow-y:auto;padding:20px 24px}
.sch-mdl-body::-webkit-scrollbar{width:4px}.sch-mdl-body::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.sch-plats{display:flex;gap:8px;margin-bottom:16px}
.sch-plat-btn{width:40px;height:40px;border-radius:50%;border:2px solid var(--bl);display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:14px;font-weight:700;transition:var(--tr)}.sch-plat-btn:hover{border-color:var(--pl)}
.sch-plat-btn.on{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.sch-cover{width:120px;height:120px;border:2px dashed var(--bl);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--t3);font-size:10px;gap:4px;transition:var(--tr);flex-shrink:0}
.sch-cover:hover{border-color:var(--pl);color:var(--p)}
.sch-content-row{display:flex;gap:14px;margin-bottom:16px}
.sch-content-fields{flex:1;display:flex;flex-direction:column;gap:10px}
.sch-plan-bar{background:var(--s2);border-radius:12px;padding:14px;border:1px solid var(--bl)}
.sch-plan-bar-t{font-size:11px;font-weight:600;color:var(--p);margin-bottom:8px}
.sch-plan-bar-row{display:flex;align-items:center;gap:10px;font-size:12px;color:var(--t2)}
.sch-colors{display:flex;gap:8px;margin-left:auto}
.sch-color{width:28px;height:28px;border-radius:50%;cursor:pointer;border:2px solid transparent;transition:var(--tr);position:relative}
.sch-color.on{border-color:var(--t1)}.sch-color.on::after{content:'✓';position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:11px;font-weight:700}
.sch-mdl-foot{display:flex;justify-content:flex-end;gap:8px;padding:14px 24px;border-top:1px solid var(--bl)}
.sch-mdl-foot .sch-f-btn{padding:9px 24px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:var(--tr)}
.sch-f-cancel{border:1px solid var(--bl);background:var(--s);color:var(--t2)}.sch-f-cancel:hover{background:var(--s3)}
.sch-f-confirm{border:none;background:var(--p);color:#fff;box-shadow:0 2px 8px rgba(124,58,237,.25)}.sch-f-confirm:hover{background:var(--pd)}
/* AI time helper */
.sch-ai{width:240px;min-width:240px;background:var(--s2);border-left:1px solid var(--bl);padding:16px;display:flex;flex-direction:column}
.sch-ai-t{font-size:13px;font-weight:700;display:flex;align-items:center;gap:6px;margin-bottom:12px}
.sch-ai-btn{width:100%;padding:10px;border-radius:10px;border:none;background:var(--p);color:#fff;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:5px;margin-bottom:14px}
.sch-ai-lbl{font-size:11px;color:var(--t3)}
/* tmpl lib */
.tt{display:flex;border-bottom:1px solid var(--bl);margin-bottom:16px}.tti{padding:9px 16px;font-size:12px;font-weight:500;color:var(--t3);cursor:pointer;border:none;background:none;border-bottom:2px solid transparent;font-family:inherit}.tti.on{color:var(--p);border-bottom-color:var(--p);font-weight:600}
.fr{display:flex;gap:20px;margin-bottom:16px}.fg{display:flex;align-items:center;gap:6px}.fl{font-size:12px;font-weight:600;color:var(--t2)}.fcs{display:flex;gap:5px}
.fc2{padding:4px 11px;border-radius:5px;font-size:11px;font-weight:500;cursor:pointer;border:1px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit}.fc2.on{background:var(--pbg);color:var(--p);border-color:var(--pl)}
.tg2{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px}
.tc{background:var(--s);border-radius:var(--rl);padding:18px;border:1px solid var(--bl);cursor:pointer;transition:var(--tr)}.tc:hover{border-color:var(--pl);box-shadow:0 4px 14px rgba(0,0,0,.06);transform:translateY(-2px)}
.tc-tp{display:flex;justify-content:space-between;margin-bottom:8px;font-size:10px;color:var(--t3)}.tc-n{font-size:15px;font-weight:700;margin-bottom:5px}.tc-d{font-size:11px;color:var(--t2);line-height:1.5;margin-bottom:10px}
.tc-tgs{display:flex;gap:5px;margin-bottom:10px}.tc-tg{font-size:10px;padding:2px 7px;border-radius:3px;background:var(--s3);color:var(--t3)}
.tc-bot{display:flex;justify-content:space-between;align-items:center}.tc-st{font-size:11px;color:var(--o);font-weight:600;display:flex;align-items:center;gap:3px}
.tc-bt{padding:5px 13px;border-radius:6px;font-size:11px;font-weight:600;cursor:pointer;border:none;background:var(--p);color:#fff;font-family:inherit}
/* ip studio */
.ipc2{max-width:660px;margin:0 auto}
.iph{background:linear-gradient(135deg,#F5F0FF,#EDE9FE,#DDD6FE);border-radius:var(--rx);padding:28px;text-align:center;margin-bottom:20px;border:1px solid #DDD6FE}
.iph-a{width:64px;height:64px;border-radius:50%;background:linear-gradient(135deg,var(--p),#A78BFA);display:flex;align-items:center;justify-content:center;margin:0 auto 14px;color:#fff;font-size:24px;font-weight:800}
.iph-n{font-size:20px;font-weight:800;margin-bottom:3px}.iph-d{font-size:12px;color:var(--t2);margin-bottom:14px}
.iph-ts{display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:16px}.iph-t{padding:5px 13px;border-radius:18px;font-size:11px;background:rgba(124,58,237,.1);color:var(--p)}
.iph-ac{display:flex;justify-content:center;gap:8px}
.ips{background:var(--s);border-radius:var(--rl);padding:20px;border:1px solid var(--bl);margin-bottom:12px}
.ips-t{font-size:14px;font-weight:700;margin-bottom:10px;display:flex;align-items:center;gap:6px}
.ipg{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ipi{padding:10px;background:var(--s2);border-radius:var(--rd)}.ipi-l{font-size:10px;color:var(--t3);margin-bottom:3px}.ipi-v{font-size:13px;font-weight:500}
@keyframes fi{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}.fn{animation:fi .25s ease forwards}
    `}</style>
    <div className="app">
      {/* ===== SIDEBAR ===== */}
      <div className="sb">
        <div className="sb-logo">
          <div className="sb-lic">W</div>
          <span className="sb-ltx">Wing AI</span>
          <span className="sb-lv">Beta</span>
        </div>

        {NAV.map((g,gi)=><div key={gi} className="sb-g">
          {g.group&&<div className="sb-gt">{g.group}</div>}
          {g.items.map(it=><div key={it.k}>
            <div className={`sb-i ${isActive(it.k)?"on":""} ${it.accent?"accent":""}`}
              onClick={()=>{
                if(it.action==="modal")openModal();
                else setPg(it.k);
              }}>
              {it.icon} {it.label}
              {it.k==="history"&&<span className="sb-tag" style={{background:"var(--pbg)",color:"var(--p)"}}>28</span>}
            </div>
          </div>)}
        </div>)}

        <div className="sb-bt">
          <div className="ipc" onClick={()=>setPg("ip")}>
            <div className="ipc-h">
              <div className="ipc-a">IP</div>
              <div><div className="ipc-n">我的IP人设</div><div className="ipc-s">已配置</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mn">
        {/* TOPBAR */}
        {!pg.startsWith("create")&&<div className="tb">
          <div className="tb-t">{pgT[pg]||"工作台"}</div>
          <div className="tb-r"><div className="sr"><I.Search/><input placeholder="搜索..."/></div><button className="bt bt-p" onClick={openModal}><I.Plus/> 新建脚本</button></div>
        </div>}

        {/* DASHBOARD */}
        {pg==="dash"&&<div className="dash-wrap">
          <div className="dash-inner">
          <div className="dash-hero">
            <div className="dash-hero-t"><span>Wing AI</span> · 一站式内容创作</div>
            <div className="dash-hero-d">从脚本创作到数字人生成，从排期发布到数据复盘，全链路AI赋能</div>
          </div>

          <div className="bento">
            {/* 智能创作 - large hero */}
            <div className="bn-main">
              <div className="bn-main-badge"><I.Zap/> 核心功能</div>
              <div className="bn-main-t">智能创作</div>
              <div className="bn-main-d">AI一键生成爆款短视频脚本，从灵感到分镜全流程覆盖</div>
              <div className="bn-modes">
                <div className="bn-mode" onClick={()=>openModal("quick")}>
                  <div className="bn-mode-ic"><I.Zap/></div>
                  <div className="bn-mode-t">快速模式</div>
                  <div className="bn-mode-d">30秒生成脚本，填写信息即可</div>
                </div>
                <div className="bn-mode" onClick={()=>{setPg("create-deep");setCs("input");}}>
                  <div className="bn-mode-ic"><I.Bot/></div>
                  <div className="bn-mode-t">深度定制</div>
                  <div className="bn-mode-d">AI顾问对话式深度挖掘需求</div>
                </div>
              </div>
            </div>

            {/* IP工作室 */}
            <div className="bn-card bn-ip" onClick={()=>setPg("ip")}>
              <div className="bn-card-top"><div className="bn-card-ic"><I.User/></div><div className="bn-card-nm">IP工作室</div><div className="bn-card-arrow"><I.ArrowR/></div></div>
              <div className="bn-card-d">AI深度访谈生成专属人设，让脚本带有你的个人风格</div>
              <div className="bn-card-tags"><span>AI访谈</span><span>人设画像</span><span>风格融合</span></div>
            </div>

            {/* 模板库 */}
            <div className="bn-card bn-tmpl" onClick={()=>setPg("tmpl")}>
              <div className="bn-card-top"><div className="bn-card-ic"><I.Layers/></div><div className="bn-card-nm">模板库</div><div className="bn-card-arrow"><I.ArrowR/></div></div>
              <div className="bn-card-d">50+爆款脚本模板，一键复用千万级变现逻辑</div>
              <div className="bn-card-tags"><span>KOL风格</span><span>营销方法论</span><span>行业专属</span></div>
            </div>

            {/* 爆款深度解析 */}
            <div className="bn-card bn-hot" onClick={()=>setPg("hotbreak")}>
              <div className="bn-card-top"><div className="bn-card-ic"><I.Eye/></div><div className="bn-card-nm">爆款深度解析</div><div className="bn-card-arrow"><I.ArrowR/></div></div>
              <div className="bn-card-d">一键提取爆款视频文案，深度拆解脚本结构，生成复刻脚本</div>
              <div className="bn-card-tags"><span>视频结构</span><span>情绪曲线</span><span>爆款逻辑</span></div>
            </div>

            {/* 360定位 */}
            <div className="bn-card bn-pos" onClick={()=>setPg("pos360")}>
              <div className="bn-card-top"><div className="bn-card-ic"><I.Target/></div><div className="bn-card-nm">360° 行业定位分析</div><div className="bn-card-arrow"><I.ArrowR/></div></div>
              <div className="bn-card-d">AI帮你找准内容方向，分析竞品策略</div>
              <div className="bn-card-tags"><span>用户需求</span><span>竞品拆解</span><span>内容策略</span></div>
            </div>
          </div>

          </div>
        </div>}

        {/* Placeholder pages */}
        {pg==="avatar"&&<div className="av-wrap">
          {/* Left - avatar selection */}
          <div className="av-left">
            <div className="av-left-t">选择数字人</div>
            {[
              {nm:"商务男",tags:"商务 | 正式 | 专业",res:"2K"},
              {nm:"知性女",tags:"知性 | 优雅 | 职场",pro:true},
              {nm:"活力少女",tags:"青春 | 活泼 | 亲和",res:"2K"},
              {nm:"儒雅大叔",tags:"稳重 | 信赖 | 权威",res:"4K"},
              {nm:"甜美主播",tags:"甜美 | 种草 | 带货",pro:true},
            ].map((av,i)=>(
              <div key={i} className={`av-card ${avSel===i?"on":""}`} onClick={()=>setAvSel(i)}>
                <div className="av-card-img">
                  <span style={{fontSize:28,opacity:.3}}><I.User/></span>
                  {av.res&&<span className="av-res">{av.res}</span>}
                  {av.pro&&<span className="av-pro">Pro</span>}
                </div>
                <div className="av-card-info">
                  <div className="av-card-nm">{av.nm}</div>
                  <div className="av-card-tags">{av.tags}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Center - phone preview */}
          <div className="av-center">
            <div className={`av-phone ${avScreen==="横屏"?"landscape":""}`}>
              <div className="av-phone-inner">
                {avScreen==="竖屏"&&<div className="av-phone-notch"/>}
                <div className="av-phone-play"><I.Camera/></div>
                <div className="av-phone-bar"/>
              </div>
            </div>
          </div>

          {/* Right - config */}
          <div className="av-right">
            <div className="av-right-t">视频配置</div>
            <div className="av-right-d">自定义您的数字人视频内容</div>

            <div className="av-fg">
              <div className="av-fg-l">视频主题</div>
              <input className="av-inp" value={avTheme} onChange={e=>setAvTheme(e.target.value)} placeholder="例如：2024年Q3季度财报分析..."/>
            </div>

            <div className="av-fg">
              <div className="av-fg-l">口播文案 <span className="av-fg-tag">AI 润色</span></div>
              <textarea className="av-inp" rows={5} value={avScript} onChange={e=>setAvScript(e.target.value)} placeholder="请输入或粘贴您的脚本文案，AI将根据文本自动生成口型和表情..." style={{resize:"vertical"}}/>
              <div style={{textAlign:"right",fontSize:10,color:"var(--t3)",marginTop:4}}>{avScript.length} / 2000 字</div>
            </div>

            <button className="av-ai-btn"><I.Sparkle/> AI 生成文案</button>

            <div className="av-row">
              <div className="av-fg">
                <div className="av-fg-l">数字人类型</div>
                <select className="av-sel" value={avType} onChange={e=>setAvType(e.target.value)}>
                  <option>数字人口播</option><option>数字人对话</option><option>数字人讲解</option>
                </select>
              </div>
              <div className="av-fg">
                <div className="av-fg-l">屏幕模式</div>
                <div className="av-screen-btns">
                  <button className={`av-scr ${avScreen==="竖屏"?"on":""}`} onClick={()=>setAvScreen("竖屏")}>📱 竖屏</button>
                  <button className={`av-scr ${avScreen==="横屏"?"on":""}`} onClick={()=>setAvScreen("横屏")}>🖥 横屏</button>
                </div>
              </div>
            </div>

            <div className="av-fg">
              <div className="av-fg-l">视频时长</div>
              <select className="av-sel" value={avDur} onChange={e=>setAvDur(e.target.value)}>
                <option>15s-30s</option><option>30s-60s</option><option>60s-120s</option><option>120s-180s</option>
              </select>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--t2)",cursor:"pointer",marginBottom:8}}>
              <div style={{width:16,height:16,borderRadius:4,border:"1.5px solid var(--bl)",display:"flex",alignItems:"center",justifyContent:"center"}}></div>
              AI生成公众号文章
            </div>

            <div className="av-bottom">
              <button className="av-b ghost"><I.Refresh/> 重新生成</button>
              <button className="av-b primary"><I.Zap/> 生成视频</button>
            </div>
          </div>
        </div>}
        {pg==="imgtext"&&<div className="it-wrap">
          {/* Left - content input */}
          <div className="it-left">
            <div className="it-left-hd">
              <div className="it-left-t">AI 智能排版与预览中心 <span className="it-left-tag">BETA</span></div>
              <div className="it-left-d">快速生成多平台适配的精美排版，实时预览效果</div>
            </div>

            <div className="it-sec">
              <div className="it-sec-t">✏️ 内容输入</div>

              <div className="it-fg">
                <div className="it-fg-l">目标平台</div>
                <div className="it-plats">
                  {["微信公众号","小红书","抖音"].map(p=>(
                    <button key={p} className={`it-plat ${itPlat===p?"on":""}`} onClick={()=>setItPlat(p)}>{p}</button>
                  ))}
                </div>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">标题 <span className="it-fg-ct">{itTitle.length}/30</span></div>
                <input className="it-inp" value={itTitle} onChange={e=>setItTitle(e.target.value.slice(0,30))} placeholder="请输入吸引人的标题..."/>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">语气风格</div>
                <select className="it-sel" value={itStyle} onChange={e=>setItStyle(e.target.value)}>
                  <option>专业严谨</option><option>轻松活泼</option><option>温暖治愈</option><option>幽默搞笑</option><option>简洁干练</option>
                </select>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">正文内容 <span className="it-fg-link">导入文档</span></div>
                <textarea className="it-inp" rows={10} value={itContent} onChange={e=>setItContent(e.target.value.slice(0,2000))} placeholder="在此输入或粘贴您的文章内容..." style={{resize:"vertical"}}/>
                <div style={{textAlign:"right",fontSize:10,color:"var(--t3)",marginTop:4}}>{itContent.length}/2000 字</div>
              </div>

              <button className="it-gen-btn"><I.Sparkle/> AI 智能排版</button>

              <div className="it-tip">
                <div className="it-tip-ic"><I.Bulb/></div>
                <div>
                  <div className="it-tip-t">排版小贴士</div>
                  <div className="it-tip-d">尝试在正文中添加 "##" 作为小标题，AI 能更准确地识别文章结构并生成更有层次感的排版。</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right - preview */}
          <div className="it-right">
            <div className="it-preview">
              <div className="it-pv-empty">
                <div className="it-pv-ic">✨</div>
                <div className="it-pv-t">等待生成预览</div>
                <div className="it-pv-d">在左侧面板输入内容并点击<br/>"AI 智能排版" 即可查看效果</div>
                <div className="it-pv-skel">
                  <div className="it-pv-skel-line w60"/>
                  <div className="it-pv-skel-line w80"/>
                  <div className="it-pv-skel-block"/>
                  <div className="it-pv-skel-line w80"/>
                  <div className="it-pv-skel-line w40"/>
                </div>
              </div>
            </div>
          </div>
        </div>}
        {pg==="schedule"&&<>{/* Schedule page */}
        <div className="sch-wrap">
          <div className="sch-main">
            <div className="sch-top">
              <div className="sch-legend"><span className="lg-sell">带货类</span><span className="lg-edu">科普类</span><span className="lg-story">剧情类</span><span className="lg-daily">日常/预热</span></div>
            </div>
            <div className="sch-cal"><table><thead><tr>
              <th>每周目标</th><th>周一</th><th>周二</th><th>周三</th><th>周四</th><th>周五</th><th>周六</th><th>周日</th>
            </tr></thead><tbody>
              {Array.from({length:6}).map((_,wi)=>{
                const days=getCalDays().slice(wi*7,wi*7+7);
                if(wi>0&&!days.some(d=>d.cur))return null;
                return <tr key={wi}>
                  <td><div className="sch-wk-n">WEEK {String(wi+1).padStart(2,'0')}</div><div className="sch-wk-d">点击设置周目标</div></td>
                  {days.map((d,di)=><td key={di} className={`${d.cur?"":"dim"} ${d.today?"today":""}`} onClick={()=>setSchModal(true)}>
                    <div className="day-n">{d.d}{d.today&&<span className="sch-today-badge">今天</span>}</div>
                  </td>)}
                </tr>;
              })}
            </tbody></table></div>
            <div className="sch-nav">
              <button className="sch-nav-btn" onClick={()=>{if(schMonth===0){setSchMonth(11);setSchYear(schYear-1)}else setSchMonth(schMonth-1)}}>&lt; 上一个月</button>
              <button className="sch-nav-btn today" onClick={()=>{setSchMonth(new Date().getMonth());setSchYear(new Date().getFullYear())}}>今天</button>
              <button className="sch-nav-btn" onClick={()=>{if(schMonth===11){setSchMonth(0);setSchYear(schYear+1)}else setSchMonth(schMonth+1)}}>下一个月 &gt;</button>
              <div className="sch-pub">
                <button className="sch-pub-btn pri" onClick={()=>setSchModal(true)}><I.Zap/> 一键发布</button>
                <button className="sch-pub-btn sec" onClick={()=>setSchModal(true)}><I.Clock/> 定时发布</button>
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="sch-side">
            <div className="sch-side-t">本月执行看板</div>
            <div className="sch-board">
              <div className="sch-board-row"><div><div className="sch-board-lbl">已发布内容</div><div className="sch-board-v">0<span style={{fontSize:12,color:"var(--t3)",fontWeight:400}}>/0 条</span></div></div><div><div className="sch-board-lbl" style={{textAlign:"right"}}>月达成率</div><div className="sch-board-pct">0%</div></div></div>
              <div className="sch-board-sub"><span>待发布 0</span><span style={{color:"var(--r)"}}>异常数 0</span></div>
            </div>

            <div className="sch-focus">
              <div className="sch-focus-tag">FOCUS OF TODAY / 今日重点</div>
              <div className="sch-focus-t">今日目标: 暂无发布任务</div>
              <div className="sch-focus-d">休息一下，或者开始规划明天的精彩内容吧！</div>
            </div>

            <div className="sch-add">
              <div className="sch-add-t">添加发布计划</div>
              <div className="sch-add-btn" onClick={()=>setSchModal(true)}><I.Plus/> 新建计划</div>
              <div className="sch-add-link">查看历史计划</div>
            </div>

            <div><div className="sch-detail-t">今日详细计划 <span className="sch-detail-ct">0个任务</span></div>
              <div style={{fontSize:11,color:"var(--t3)",textAlign:"center",padding:20}}>暂无计划</div>
            </div>
          </div>
        </div>

        {/* Schedule modal */}
        {schModal&&<div className="sch-ov" onClick={()=>setSchModal(false)}><div className="sch-mdl" onClick={e=>e.stopPropagation()}>
          <div className="sch-mdl-main">
            <div className="sch-mdl-hd"><div className="sch-mdl-t">新建发布计划</div><button className="mdl-x" onClick={()=>setSchModal(false)}><I.X/></button></div>
            <div className="sch-mdl-tabs">
              {["内容库上传","本地上传","标签提醒"].map((t,i)=><button key={i} className={`sch-mdl-tab ${schTab===i?"on":""}`} onClick={()=>setSchTab(i)}>{t}</button>)}
            </div>
            <div className="sch-mdl-body">
              {schTab===0&&<><div className="tool-fg"><div className="tool-fg-l">从内容库选择内容</div><select className="tool-sel"><option>从内容库选择内容</option></select><div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>正在加载内容库...</div></div></>}

              <div className="tool-fg"><div className="tool-fg-l">发布平台</div></div>
              <div className="sch-plats">
                {["抖","快","红","微"].map((p,i)=><div key={i} className={`sch-plat-btn ${i===0?"on":""}`} style={{color:["#000","#FF6600","#FF2442","#D4A017"][i],fontWeight:700,fontSize:12}}>{p}</div>)}
              </div>

              {schTab!==2?<div className="sch-content-row">
                <div className="sch-cover"><I.Image/> 封面(选填)</div>
                <div className="sch-content-fields">
                  <input className="tool-inp" placeholder="输入您视频的标题......"/>
                  <textarea className="tool-inp" rows={3} placeholder="输入您视频的描述或正文......" style={{resize:"vertical"}}/>
                </div>
              </div>:<>
                <div className="tool-fg"><input className="tool-inp" placeholder="输入提醒标题......"/></div>
                <div className="tool-fg"><textarea className="tool-inp" rows={3} placeholder="输入提醒详细内容（可选）......" style={{resize:"vertical"}}/></div>
              </>}

              <div className="sch-plan-bar">
                <div className="sch-plan-bar-t">计划与分类</div>
                <div className="sch-plan-bar-row">
                  <span style={{display:"flex",alignItems:"center",gap:4}}><I.Calendar/> 2026/03/09</span>
                  <span>—</span>
                  <span style={{display:"flex",alignItems:"center",gap:4}}><I.Clock/> 18:16</span>
                  <div className="sch-colors" style={{marginLeft:"auto"}}>
                    <div style={{fontSize:10,color:"var(--t3)",marginRight:4,alignSelf:"center"}}>选择任务颜色</div>
                    {["#3B82F6","#10B981","#7C3AED","#F97316","#F43F5E"].map((c,i)=><div key={i} className={`sch-color ${schColor===i?"on":""}`} style={{background:c}} onClick={()=>setSchColor(i)}/>)}
                  </div>
                </div>
              </div>
            </div>
            <div className="sch-mdl-foot">
              <button className="sch-f-btn sch-f-cancel" onClick={()=>setSchModal(false)}>取消</button>
              <button className="sch-f-btn sch-f-confirm">{schTab===2?"确认提醒":"确认发布"}</button>
            </div>
          </div>

          {/* AI time helper sidebar */}
          <div className="sch-ai">
            <div className="sch-ai-t"><I.Sparkle/> AI时间规划助手</div>
            <button className="sch-ai-btn"><I.Clock/> 点击获取AI推荐发布时间</button>
            <div className="sch-ai-lbl">推荐时间段</div>
          </div>
        </div></div>}
        </>}
        {pg==="adkol"&&<div className="kol-wrap">
          <div className="kol-search"><input placeholder="搜索达人昵称或ID..."/><button className="kol-search-btn"><I.Search/> 搜索</button></div>
          <div className="kol-filters">
            <div className="kol-fg"><div className="kol-fg-l">平台类型</div><select><option>全部平台</option><option>抖音</option><option>快手</option><option>小红书</option><option>TikTok</option></select></div>
            <div className="kol-fg"><div className="kol-fg-l">平台</div><select><option>全部平台</option></select></div>
            <div className="kol-fg"><div className="kol-fg-l">标签</div><select><option>全部标签</option><option>美妆</option><option>科技</option><option>美食</option><option>旅行</option></select></div>
            <div className="kol-fg"><div className="kol-fg-l">价格区间</div><select><option>不限价格</option><option>5万以下</option><option>5-20万</option><option>20万以上</option></select></div>
            <div className="kol-fg"><div className="kol-fg-l">排序方式</div><select><option>综合排序</option><option>粉丝数</option><option>报价</option></select></div>
          </div>
          <div className="kol-grid">
            {[
              {nm:"山白",id:10283,cat:"抖音 · 才艺技能",desc:"叔侄两人，拍一些乡里间的手艺活儿，视频质感高，传统文化创作者",fans:"1618.5万",price:"¥200,000",tags:["才艺技能","非遗"],loc:"湖南省",bg:"#3B82F6"},
              {nm:"王小怪",id:66716,cat:"抖音 · 萌宠",desc:"一个家里养了几百只宠物的宠物达人，幕后故事，宠物日常",fans:"1159.7万",price:"¥140,000",tags:["萌宠","日常"],loc:"辽宁省",bg:"#F59E0B"},
              {nm:"艾维奇Vic",id:83562,cat:"抖音 · 生活",desc:"偶遇+猎奇各种职业，通过访问访谈切入主题，了解大咖观点",fans:"754.5万",price:"¥300,000",tags:["生活","汽车"],loc:"上海",bg:"#7C3AED"},
              {nm:"卢克文工作室",id:20018,cat:"抖音 · 知识科普",desc:"畅销书《燃烧1864》作者，知识科普人文类创作者，热点分析",fans:"933万",price:"¥160,000",tags:["知识科普","人文"],loc:"成都市",bg:"#10B981"},
              {nm:"方也",id:10830,cat:"抖音 · 旅行",desc:"与传统非遗文化结合产出创意短片，摇臂汽车短片，文化类创意",fans:"800.5万",price:"¥210,000",tags:["旅行","艺术文化"],loc:"南京市",bg:"#6366F1"},
              {nm:"焦绿儿",id:33847,cat:"抖音 · 旅行",desc:"高颜值旅行类达人，文案优美，风格清新自然，打卡全国标志性地域",fans:"754.1万",price:"¥218,000",tags:["旅行","时尚"],loc:"南京市",bg:"#EC4899"},
              {nm:"草莓朵朵",id:66888,cat:"抖音 · 生活",desc:"记录日常生活中的点滴，内容涵盖美妆美食，传递甜蜜温馨的氛围",fans:"1063.5万",price:"¥50,000",tags:["生活","剧情"],loc:"重庆市",bg:"#F59E0B"},
              {nm:"长沙一家人",id:20021,cat:"抖音 · 母婴亲子",desc:"记录一家人进行各种游戏挑战的搞笑日常，聚会游戏大挑战",fans:"1008.6万",price:"¥50,000",tags:["母婴亲子","搞笑"],loc:"长沙市",bg:"#EF4444"},
            ].map((k,i)=>(
              <div key={i} className="kol-card">
                <div className="kol-card-top">
                  <div className="kol-card-av" style={{background:k.bg}}>{k.nm[0]}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}><div className="kol-card-nm">{k.nm}</div><div className="kol-card-id">ID: {k.id}</div></div>
                    <div className="kol-card-cat">{k.cat}</div>
                    <div className="kol-card-desc">{k.desc}</div>
                  </div>
                </div>
                <div className="kol-card-stats">
                  <div className="kol-stat"><div className="kol-stat-l">粉丝数</div><div className="kol-stat-v">{k.fans}</div></div>
                  <div className="kol-stat"><div className="kol-stat-l">互动率</div><div className="kol-stat-v">-</div></div>
                  <div className="kol-stat"><div className="kol-stat-l">预估报价</div><div className="kol-stat-v" style={{color:"var(--t1)"}}>{k.price}</div></div>
                </div>
                <div className="kol-card-foot"><div className="kol-card-tags">{k.tags.map((t,j)=><span key={j}>{t}</span>)}</div><div className="kol-card-loc">📍 {k.loc}</div></div>
              </div>
            ))}
          </div>
        </div>}
        {pg==="analytics"&&<div className="ana-wrap">
          <div className="ana-hd">
            <div><div className="ana-hd-t">账号资产管理</div><div className="ana-hd-d">当前已同步 0 个社交平台账号，AI 将为您实时监控数据。</div></div>
            <div className="ana-hd-acts"><button className="ana-hd-btn"><I.Refresh/> 数据刷新</button><button className="ana-hd-btn"><I.Download/> 登录器下载</button><button className="ana-hd-btn pri"><I.Plus/> 添加账号</button></div>
          </div>
          <div className="ana-tabs">{["平台账号连接","团队成员管理","全团队业绩看板"].map((t,i)=><button key={i} className={`ana-tab ${anaTab===i?"on":""}`} onClick={()=>setAnaTab(i)}>{t}</button>)}</div>

          {/* Tab 0: Platform connect */}
          {anaTab===0&&<div className="ana-connect">
            <div className="ana-connect-ic"><I.Plus/></div>
            <div className="ana-connect-t">点击关联更多平台账号</div>
            <div className="ana-connect-d">支持抖音、快手、视频号等主流平台</div>
          </div>}

          {/* Tab 1: Team members */}
          {anaTab===1&&<div>
            <div className="ana-team-hd">
              <div className="ana-team-t">团队成员 <span className="ana-team-ct">(0)</span></div>
              <div className="ana-team-r"><input className="ana-team-search" placeholder="搜索成员姓名或邮箱..."/><button className="ana-hd-btn pri"><I.Plus/> 邀请新成员</button></div>
            </div>
            <div style={{textAlign:"center",padding:60,color:"var(--t3)",fontSize:13}}>加载中...</div>
          </div>}

          {/* Tab 2: Team dashboard */}
          {anaTab===2&&<div>
            <div className="ana-dash-hd"><div className="ana-dash-t">团队业绩看板</div><div className="ana-live">数据实时更新中</div></div>
            <div className="ana-filters">
              <div className="ana-fil">👥 团队成员：全队 (12人)</div>
              <div className="ana-fil"><I.Calendar/> 时间范围：2026年3月</div>
              <div className="ana-fil">全平台</div>
            </div>
            <div className="ana-stats">
              <div className="ana-stat"><div className="ana-stat-top"><span className="ana-stat-l">本月发布</span><span className="ana-stat-badge g">0%</span></div><div className="ana-stat-v">0</div><div className="ana-stat-sub">较上周期 +0%</div></div>
              <div className="ana-stat"><div className="ana-stat-top"><span className="ana-stat-l">总曝光量</span><span className="ana-stat-badge g">0%</span></div><div className="ana-stat-v">0</div><div className="ana-stat-sub">较上周期 +0%</div></div>
              <div className="ana-stat"><div className="ana-stat-top"><span className="ana-stat-l">平均互动率</span><span className="ana-stat-badge g">0%</span></div><div className="ana-stat-v">0%</div><div className="ana-stat-sub">较上周期 +0%</div></div>
              <div className="ana-stat"><div className="ana-stat-top"><span className="ana-stat-l">团队效率</span><span className="ana-stat-badge g">0%</span></div><div className="ana-stat-v">0%</div><div className="ana-stat-sub">较上周期 +0%</div></div>
            </div>

            <div className="ana-body">
              <div className="ana-chart">
                <div className="ana-chart-hd"><div className="ana-chart-t">成员绩效对比</div><div className="ana-chart-legend"><span className="cl-pub">发布量</span><span className="cl-exp">曝光量</span></div></div>
                {[{nm:"张三",w:"85%",g:"A+"},{nm:"李四",w:"65%",g:"B"},{nm:"王五",w:"50%",g:"B+"},{nm:"刘明",w:"35%",g:"C"}].map((m,i)=>(
                  <div key={i} className="ana-bar-row"><div className="ana-bar-nm">{m.nm}</div><div className="ana-bar-track"><div className="ana-bar-fill" style={{width:m.w}}/></div><div className="ana-bar-grade">{m.g}</div></div>
                ))}
              </div>

              <div className="ana-ai">
                <div className="ana-ai-card">
                  <div className="ana-ai-hd"><div className="ana-ai-ic"><I.Sparkle/></div><div className="ana-ai-t">AI 效能点评</div></div>
                  <div className="ana-ai-body">
                    <p style={{marginBottom:8}}>AI 洞察：本月成员张三发布的视频曝光量显著高于平均值 <span className="ana-ai-hl">15.2%</span>。</p>
                    <p>数据表明，其在视频前3秒使用了"悬念式提问"技巧，有效提升了完播率。</p>
                    <div className="ana-ai-tip"><div className="ana-ai-tip-l">建议行动</div>建议全队在下周例会复盘其脚本结构，并尝试复制该模式。</div>
                  </div>
                </div>
                <div className="ana-ai-card">
                  <div className="ana-pred-t">下月预测</div>
                  <div className="ana-pred-d">基于当前趋势，预计下月总曝光量将突破 3.0M</div>
                  <button className="ana-pred-btn">查看预测模型</button>
                </div>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"flex-end",marginTop:16}}>
              <button className="ana-hd-btn"><I.Download/> 下载团队月度业绩报告</button>
            </div>
            <div style={{display:"flex",gap:16,fontSize:10,color:"var(--t3)",marginTop:12,paddingTop:12,borderTop:"1px solid var(--bl)"}}><span>● 企业级安全保护已启用</span><span>● 数据实时同步中</span><span style={{marginLeft:"auto"}}>最后同步时间：2026-03-09 14:30:12</span></div>
          </div>}
        </div>}
        {pg==="history"&&<div className="hist-wrap">
          <div className="hist-hd">
            <div className="hist-hd-t">内容库</div>
            <div className="hist-hd-d">管理与回顾您的选题、脚本与视频，每一份创意都值得精准留存</div>
          </div>
          <div className="hist-tabs">
            {["选题","脚本","视频"].map((t,i)=><button key={i} className={`hist-tab ${histTab===i?"on":""}`} onClick={()=>setHistTab(i)}>{t}</button>)}
          </div>
          <div className="hist-empty">暂无选题</div>
        </div>}
        {pg==="settings"&&<Placeholder title="设置" desc="账户设置、团队管理、API对接" icon="⚙️"/>}

        {/* 爆款深度解析 inner page */}
        {pg==="hotbreak"&&<div className="sc"><div className="tool-pg">
          <div style={{marginBottom:20}}><span style={{fontSize:12,color:"var(--t3)",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}} onClick={()=>setPg("dash")}><I.ArrowL/> 返回工作台</span></div>
          <div className="tool-hd blue">
            <div className="tool-hd-t">爆款深度解析</div>
            <div className="tool-hd-d">一键提取爆款视频文案，深度拆解脚本结构，生成复刻脚本</div>
          </div>
          <div className="tool-form">
            <div className="tool-fg">
              <div className="tool-fg-l">请粘贴抖音分享链接（完整分享链接） <span className="rq">*</span></div>
              <input className="tool-inp" value={hotLink} onChange={e=>setHotLink(e.target.value)} placeholder="请粘贴抖音分享链接（完整分享链接）"/>
            </div>
            <div className="tool-row">
              <div className="tool-fg">
                <div className="tool-fg-l">所属行业</div>
                <select className="tool-sel" value={hotIndustry} onChange={e=>setHotIndustry(e.target.value)}>
                  <option value="">选择目标行业</option><option>美妆护肤</option><option>食品保健</option><option>数码3C</option><option>教育培训</option><option>服装鞋包</option><option>家居生活</option>
                </select>
              </div>
              <div className="tool-fg">
                <div className="tool-fg-l">你的产品/服务是什么？</div>
                <input className="tool-inp" value={hotProduct} onChange={e=>setHotProduct(e.target.value)} placeholder="例如：补水保湿面膜 / 线上英语课程"/>
              </div>
            </div>
            <div className="tool-fg">
              <div className="tool-fg-l">对改写脚本的具体要求</div>
              <textarea className="tool-inp" rows={4} value={hotReq} onChange={e=>setHotReq(e.target.value)} placeholder="例如：30秒以内、适合信息流投放、语气专业可信、突出痛点和解决方案等" style={{resize:"vertical"}}/>
            </div>
            <button className="tool-btn blue"><I.Zap/> 生成爆款拆解报告</button>
            <div className="tool-hint">AI将为您深度分析视频结构、情绪曲线及爆款逻辑，并生成6份优化脚本<br/>支持抖音和小红书分享链接（小红书暂不支持评论区与作者数据分析）</div>
          </div>
          <div className="tool-empty">
            <div className="tool-empty-ic">📊</div>
            <div className="tool-empty-t">粘贴视频链接，开始拆解爆款密码</div>
            <div className="tool-empty-d">分析结果将在此处展示</div>
          </div>
        </div></div>}

        {/* 360定位分析 inner page */}
        {pg==="pos360"&&<div className="sc"><div className="tool-pg">
          <div style={{marginBottom:20}}><span style={{fontSize:12,color:"var(--t3)",cursor:"pointer",display:"inline-flex",alignItems:"center",gap:4}} onClick={()=>setPg("dash")}><I.ArrowL/> 返回工作台</span></div>
          <div className="tool-hd purple">
            <div className="tool-hd-t">360° 行业定位分析</div>
            <div className="tool-hd-d">输入你的行业，AI帮你搞清楚：客户在抖音上想看什么、谁做得好、什么内容能带来生意</div>
          </div>
          <div className="tool-form">
            <div className="tool-fg">
              <div className="tool-fg-l">你的主要业务 <span className="rq">*</span></div>
              <input className="tool-inp" value={posMain} onChange={e=>setPosMain(e.target.value)} placeholder="请输入你的主要业务，例如：美妆护肤、健身私教、咖啡馆等"/>
            </div>
            <div className="tool-row">
              <div className="tool-fg">
                <div className="tool-fg-l">所属行业</div>
                <select className="tool-sel" value={posInd} onChange={e=>setPosInd(e.target.value)}>
                  <option value="">选择目标行业</option><option>美妆护肤</option><option>食品保健</option><option>数码3C</option><option>教育培训</option><option>服装鞋包</option><option>家居生活</option>
                </select>
                <input className="tool-inp" style={{marginTop:6}} placeholder="或输入自定义行业，如：新茶饮"/>
              </div>
              <div className="tool-fg">
                <div className="tool-fg-l">分析深度 <span className="rq">*</span></div>
                <div style={{display:"flex",gap:6}}>
                  {[{k:"fast",l:"快速"},{k:"standard",l:"标准版"},{k:"deep",l:"深度"}].map(d=>(
                    <button key={d.k} className={`tool-hd-tag ${posDepth===d.k?"on":""}`} style={posDepth===d.k?{background:"var(--p)",borderColor:"var(--p)",color:"#fff"}:{}} onClick={()=>setPosDepth(d.k)}>{d.l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="tool-row">
              <div className="tool-fg">
                <div className="tool-fg-l">你的抖音主页链接</div>
                <input className="tool-inp" value={posDouyinLink} onChange={e=>setPosDouyinLink(e.target.value)} placeholder="例如：https://www.douyin.com/user/xxxxxx"/>
              </div>
            </div>
            <div className="tool-fg">
              <div className="tool-fg-l">竞品抖音链接（选填）</div>
              <textarea className="tool-inp" rows={3} value={posCompLinks} onChange={e=>setPosCompLinks(e.target.value)} placeholder="可填写1~3个竞品抖音视频或主页链接，每行一个，提供后会增加竞品拆解分析" style={{resize:"vertical"}}/>
            </div>
            <button className="tool-btn purple"><I.Target/> 开始定位分析</button>
          </div>
          <div className="tool-empty">
            <div className="tool-empty-ic">🎯</div>
            <div className="tool-empty-t">请先填写你的主要业务，选择行业与分析深度</div>
            <div className="tool-empty-d">例如：主要业务"线下皮肤管理工作室" + 行业"美妆/护肤" + 分析深度"标准版"</div>
          </div>
        </div></div>}
        {pg==="tmpl"&&<div className="sc">
          <div className="tt" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:4}}>{["KOL风格","营销方法论","行业专属","AI提炼"].map(t=><button key={t} className={`tti ${tTab===t?"on":""}`} onClick={()=>setTTab(t)}>{t}</button>)}</div>
            {tTab==="AI提炼"&&<div style={{display:"flex",gap:8}}>
              {aiTemplates.length>0&&!delMode&&<button style={{padding:"6px 14px",border:"1.5px solid #F87171",borderRadius:8,background:"#FFF5F5",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{setDelMode(true);setDelSel([])}}>删除模板</button>}
              {!delMode&&<button style={{padding:"6px 14px",border:"1.5px solid #3B82F6",borderRadius:8,background:"#EFF6FF",color:"#3B82F6",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}} onClick={()=>{setShowExtract(true);setExtStep("");setExtLink("");setExtName("");setExtCat("");}}><I.Link/> 提取模板</button>}
              {!delMode&&<button style={{padding:"6px 14px",border:"1.5px solid var(--p)",borderRadius:8,background:"var(--pbg)",color:"var(--p)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}} onClick={()=>setShowImport(true)}><I.Plus/> 导入模板</button>}
              {delMode&&<button style={{padding:"6px 14px",border:"1.5px solid var(--bl)",borderRadius:8,background:"var(--s)",color:"var(--t2)",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{setDelMode(false);setDelSel([])}}>取消</button>}
            </div>}
          </div>
          {tTab!=="AI提炼"&&<div className="fr"><div className="fg"><span className="fl">平台</span><div className="fcs">{["全部","抖音","小红书","视频号"].map(f=><button key={f} className={`fc2 ${fp===f?"on":""}`} onClick={()=>setFp(f)}>{f}</button>)}</div></div></div>}
          {tTab!=="AI提炼"&&<div className="tg2">{TMPLLIB.filter(t=>fp==="全部"||t.plat===fp).map(t=><div className="tc" key={t.id}><div className="tc-tp"><span>{t.plat}</span><span>{t.uses}</span></div><div className="tc-n">{t.name}</div><div className="tc-d">{t.desc}</div><div className="tc-tgs">{t.tags.map((tg,i)=><span key={i} className="tc-tg">{tg}</span>)}</div><div className="tc-bot"><span className="tc-st"><I.Fire/> 完播率 {t.stat}</span><button className="tc-bt" onClick={()=>openModal("quick",t)}>用此模板创建 →</button></div></div>)}</div>}
          {tTab==="AI提炼"&&<div>
            {aiTemplates.length===0?<div style={{textAlign:"center",padding:"60px 20px",color:"var(--t3)",fontSize:13}}>
              <div style={{fontSize:32,marginBottom:12}}>🤖</div>
              <div style={{fontWeight:600,marginBottom:6}}>还没有AI提炼的模板</div>
              <div style={{marginBottom:16}}>粘贴博主抖音链接，一键提取风格模板</div>
              <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                <button style={{padding:"8px 20px",border:"none",borderRadius:10,background:"#3B82F6",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{setShowExtract(true);setExtStep("");setExtLink("");setExtName("");setExtCat("");}}>提取博主模板</button>
                <button style={{padding:"8px 20px",border:"1.5px solid var(--bl)",borderRadius:10,background:"var(--s)",color:"var(--t2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setShowImport(true)}>导入JSON</button>
              </div>
            </div>:<>
              <div className="tg2">{aiTemplates.map((t,i)=>{const checked=delSel.includes(i);return(
                <div className="tc" key={i} style={{position:"relative",outline:delMode&&checked?"2px solid #EF4444":"none",outlineOffset:2}} onClick={()=>{if(delMode)setDelSel(checked?delSel.filter(x=>x!==i):[...delSel,i]);}}>
                  {delMode&&<div style={{position:"absolute",top:10,right:10,width:18,height:18,borderRadius:4,border:"2px solid",borderColor:checked?"#EF4444":"#ccc",background:checked?"#EF4444":"#fff",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2}}>{checked&&<span style={{color:"#fff",fontSize:11,lineHeight:1}}>✓</span>}</div>}
                  <div className="tc-tp"><span style={{background:"#EFF6FF",color:"#3B82F6",padding:"1px 6px",borderRadius:3}}>AI提炼</span><span>{t._creator||""}</span></div>
                  <div className="tc-n">{t.name}</div>
                  <div className="tc-d">{(t.scene||t.style_summary||"").slice(0,60)}</div>
                  <div className="tc-tgs">{(t.tags||t.keyword_bank||[]).slice(0,3).map((kw,ki)=><span key={ki} className="tc-tg">{kw}</span>)}</div>
                  <div className="tc-bot"><span className="tc-st"><I.Sparkle/> 博主风格模板</span>{!delMode&&<button className="tc-bt" onClick={e=>{e.stopPropagation();openModal("quick",t);}}>用此模板创建 →</button>}</div>
                </div>
              );})}</div>
              {delMode&&<div style={{position:"sticky",bottom:0,background:"var(--s)",borderTop:"1px solid var(--bl)",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12}}>
                <span style={{fontSize:13,color:"var(--t2)"}}>已选 <b style={{color:"#EF4444"}}>{delSel.length}</b> 个模板</span>
                <button disabled={delSel.length===0} onClick={()=>{if(window.confirm(`确认删除选中的 ${delSel.length} 个模板？此操作不可恢复。`)){const next=aiTemplates.filter((_,i)=>!delSel.includes(i));setAiTemplates(next);localStorage.setItem("aiTmpls",JSON.stringify(next));setDelMode(false);setDelSel([]);}}} style={{padding:"8px 20px",border:"none",borderRadius:8,background:delSel.length>0?"#EF4444":"#ccc",color:"#fff",fontSize:13,fontWeight:600,cursor:delSel.length>0?"pointer":"default",fontFamily:"inherit"}}>确认删除</button>
              </div>}
            </>}
          </div>}
        </div>}
        {showImport&&<div className="sb-ov" onClick={e=>{if(e.target===e.currentTarget)setShowImport(false)}}>
          <div style={{background:"var(--s)",borderRadius:18,padding:28,width:480,boxShadow:"0 8px 40px rgba(0,0,0,.12)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:700}}>导入AI提炼模板</div>
              <button style={{border:"none",background:"none",cursor:"pointer",color:"var(--t2)"}} onClick={()=>setShowImport(false)}><I.X/></button>
            </div>
            <div style={{fontSize:12,color:"var(--t3)",marginBottom:10,lineHeight:1.6}}>
              运行 <code style={{background:"var(--s3)",padding:"1px 6px",borderRadius:4,fontFamily:"monospace"}}>python douyin_template.py</code> → 选择「查看模板」→ 复制JSON内容粘贴到下方
            </div>
            <textarea style={{width:"100%",height:180,border:"1.5px solid var(--bl)",borderRadius:10,padding:12,fontSize:12,fontFamily:"monospace",resize:"vertical",boxSizing:"border-box",outline:"none"}}
              placeholder={'粘贴 templates.json 的内容，格式如：{"李佳琦": {"templates": [...], ...}}'}
              value={importTxt} onChange={e=>setImportTxt(e.target.value)}/>
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:12}}>
              <button style={{padding:"8px 18px",border:"1.5px solid var(--bl)",borderRadius:10,background:"var(--s)",color:"var(--t2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>setShowImport(false)}>取消</button>
              <button style={{padding:"8px 18px",border:"none",borderRadius:10,background:"var(--p)",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{
                try{
                  const raw=JSON.parse(importTxt);
                  const arr=Object.entries(raw).flatMap(([creatorName,data])=>(data.templates||[]).map(t=>({_creator:creatorName,...t})));
                  const merged=[...aiTemplates,...arr.filter(a=>!aiTemplates.find(x=>x._creator===a._creator&&x.name===a.name))];
                  setAiTemplates(merged);
                  localStorage.setItem("aiTmpls",JSON.stringify(merged));
                  setShowImport(false);setImportTxt("");setTTab("AI提炼");
                }catch{alert("JSON格式有误，请检查后重试");}
              }}>确认导入</button>
            </div>
          </div>
        </div>}
        {showExtract&&<div className="sb-ov" onClick={e=>{if(e.target===e.currentTarget&&!extBusy){setShowExtract(false);setExtStep("");setExtStepIdx(-1);}}}>
          <div style={{background:"var(--s)",borderRadius:18,padding:28,width:520,boxShadow:"0 8px 40px rgba(0,0,0,.12)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:700}}>提取博主模板</div>
              {!extBusy&&<button style={{border:"none",background:"none",cursor:"pointer",color:"var(--t2)"}} onClick={()=>{setShowExtract(false);setExtStep("");setExtStepIdx(-1);}}><I.X/></button>}
            </div>
            <div style={{fontSize:12,color:"var(--t3)",marginBottom:14,lineHeight:1.6}}>粘贴博主的抖音主页链接，AI将自动分析其视频数据并提炼出风格模板</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:"var(--t1)"}}>博主链接 <span style={{color:"#EF4444"}}>*</span></div>
                <input style={{width:"100%",padding:"10px 12px",border:"1.5px solid var(--bl)",borderRadius:10,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}} placeholder="粘贴抖音博主主页链接或分享文字" value={extLink} onChange={e=>setExtLink(e.target.value)} disabled={extBusy}/>
              </div>
              <div style={{display:"flex",gap:10}}>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:"var(--t1)"}}>博主昵称 <span style={{color:"#EF4444"}}>*</span></div>
                  <input style={{width:"100%",padding:"10px 12px",border:"1.5px solid var(--bl)",borderRadius:10,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}} placeholder="如：李佳琦" value={extName} onChange={e=>setExtName(e.target.value)} disabled={extBusy}/>
                </div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:"var(--t1)"}}>内容品类</div>
                  <input style={{width:"100%",padding:"10px 12px",border:"1.5px solid var(--bl)",borderRadius:10,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}} placeholder="如：美妆带货（可留空）" value={extCat} onChange={e=>setExtCat(e.target.value)} disabled={extBusy}/>
                </div>
              </div>
            </div>
            {extStepIdx>=0&&<div style={{marginTop:16,padding:"14px 16px",borderRadius:12,background:extStep.startsWith("err:")?"#FEF2F2":"#F8FAFC",border:"1px solid",borderColor:extStep.startsWith("err:")?"#FECACA":"#E2E8F0"}}>
              <div style={{display:"flex",gap:0,marginBottom:extInfo||extStep.startsWith("err:")?10:0}}>
                {extSteps.map((s,i)=>{const done=i<extStepIdx;const active=i===extStepIdx&&!extStep.startsWith("err:");const last=i===extSteps.length-1;return(<div key={i} style={{display:"flex",alignItems:"center",flex:last?0:1}}>
                  <div style={{width:22,height:22,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0,background:done?"#3B82F6":active?"#fff":extStepIdx===4&&i===4?"#10B981":"#F1F5F9",color:done||extStepIdx===4&&i===4?"#fff":active?"#3B82F6":"#94A3B8",border:active?"2px solid #3B82F6":"2px solid transparent",transition:"all .3s",position:"relative"}}>
                    {done?<I.Check/>:extStepIdx===4&&i===4?<I.Check/>:i+1}
                    {active&&extBusy&&<span style={{position:"absolute",inset:-4,borderRadius:"50%",border:"2px solid transparent",borderTopColor:"#3B82F6",animation:"spin 1s linear infinite"}}/>}
                  </div>
                  {!last&&<div style={{flex:1,height:2,margin:"0 4px",background:done?"#3B82F6":"#E2E8F0",transition:"background .3s",borderRadius:1}}/>}
                </div>);})}
              </div>
              {extStepIdx>=0&&extStepIdx<5&&!extStep.startsWith("err:")&&<div style={{display:"flex",justifyContent:"space-between",fontSize:10,color:"#94A3B8",marginTop:4}}>
                {extSteps.map((s,i)=><span key={i} style={{color:i===extStepIdx?"#3B82F6":i<extStepIdx?"#64748B":"#CBD5E1",fontWeight:i===extStepIdx?600:400,transition:"all .3s",textAlign:"center",flex:1}}>{s}</span>)}
              </div>}
              {extInfo&&!extStep.startsWith("err:")&&<div style={{marginTop:8,fontSize:11,color:"#64748B",display:"flex",alignItems:"center",gap:6}}>
                {extBusy&&<span style={{display:"inline-block",width:12,height:12,border:"2px solid #93C5FD",borderTopColor:"#3B82F6",borderRadius:"50%",animation:"spin 1s linear infinite",flexShrink:0}}/>}
                {extInfo}
              </div>}
              {extStep.startsWith("err:")&&<div style={{fontSize:12,color:"#DC2626",display:"flex",alignItems:"center",gap:6}}>{extStep.slice(4)}</div>}
              {extStepIdx===4&&<div style={{fontSize:12,color:"#10B981",fontWeight:600,display:"flex",alignItems:"center",gap:6,marginTop:4}}>{extInfo}</div>}
            </div>}
            <div style={{display:"flex",justifyContent:"flex-end",gap:8,marginTop:14}}>
              {!extBusy&&extStepIdx!==4&&<button style={{padding:"8px 18px",border:"1.5px solid var(--bl)",borderRadius:10,background:"var(--s)",color:"var(--t2)",fontSize:12,fontWeight:500,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{setShowExtract(false);setExtStep("");setExtStepIdx(-1);}}>取消</button>}
              {!extBusy&&extStepIdx<4&&<button style={{padding:"8px 18px",border:"none",borderRadius:10,background:"#3B82F6",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={runExtract}>{extStep.startsWith("err:")?"重新提取":"开始提取"}</button>}
              {extStepIdx===4&&<button style={{padding:"8px 18px",border:"none",borderRadius:10,background:"#10B981",color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{setShowExtract(false);setExtStep("");setExtStepIdx(-1);}}>完成</button>}
            </div>
          </div>
        </div>}

        {pg==="ip"&&<div className="sc"><div className="ipc2">
          {!ipFlow?<>
            <div className="iph"><div className="iph-a">IP</div><div className="iph-n">我的创作者人设</div><div className="iph-d">基于AI访谈生成的个性化IP画像，自动融入脚本创作</div><div className="iph-ts">{["专业测评","亲和力强","干货分享","真实体验","数据说话"].map((t,i)=><span key={i} className="iph-t">{t}</span>)}</div><div className="iph-ac"><button className="bt bt-p" onClick={()=>{setIpFlow(true);setIpStep(0);setIpPhase(0);setIpQIdx(0);setIpAnswers([]);setIpCurAns("");setIpEditing(null);}}><I.Mic/> 重新访谈</button><button className="bt bt-g"><I.Edit/> 手动编辑</button></div></div>
            <div className="ips"><div className="ips-t"><I.User/> 人设基本信息</div><div className="ipg">{[{l:"表达风格",v:"轻松幽默、接地气"},{l:"专业领域",v:"美妆护肤、个人护理"},{l:"目标受众",v:"18-35岁女性用户"},{l:"内容调性",v:"真实测评+干货分享"},{l:"常用平台",v:"抖音、小红书"},{l:"视频风格",v:"对镜口播+实测对比"}].map((x,i)=><div key={i} className="ipi"><div className="ipi-l">{x.l}</div><div className="ipi-v">{x.v}</div></div>)}</div></div>
            <div className="ips"><div className="ips-t"><I.Sparkle/> 创作偏好</div><div style={{fontSize:12,color:"var(--t2)",lineHeight:1.8}}><p style={{marginBottom:8}}>开头习惯用反问句或痛点切入，善于用数据对比突出产品优势。文案风格偏口语化。</p><p>结尾通常以限时优惠或个人推荐作为转化钩子，偏好30-60秒的短视频节奏。</p></div></div>
            <div className="ips"><div className="ips-t"><I.BarChart/> IP应用效果</div><div className="ipg">{[{l:"IP融合脚本数",v:"18个"},{l:"平均匹配度",v:"92%"},{l:"完播率提升",v:"+15%"},{l:"转化率提升",v:"+8%"}].map((x,i)=><div key={i} className="ipi"><div className="ipi-l">{x.l}</div><div className="ipi-v" style={{color:"var(--p)",fontWeight:700}}>{x.v}</div></div>)}</div></div>
          </>:<div className="ip-fw">

            {/* Step 0: Choose mode */}
            {ipStep===0&&<div>
              <div className="ip-fw-t">开始IP人设访谈</div>
              <div className="ip-fw-d">通过AI深度访谈，生成专属于你的创作者人设画像<br/>你的回答将决定AI为你生成的每一条脚本的风格</div>
              <div className="ip-mode-wrap">
                <div className="ip-mode-main" onClick={()=>setIpStep(1)}>
                  <div className="im-ic"><I.Edit/></div>
                  <div className="im-t">开始文字访谈</div>
                  <div className="im-d">通过文字问答，逐步梳理你的IP定位和表达风格</div>
                </div>
                <div className="ip-mode-alt" onClick={()=>setIpStep(1)}>
                  <div><div className="im-t">🎙️ 语音访谈</div><div className="im-d">适合不方便打字的场景</div></div>
                </div>
              </div>
            </div>}

            {/* Step 1: Basic info */}
            {ipStep===1&&<div>
              <div className="ip-fw-t">请填写您的基础信息</div>
              <div className="ip-fw-d">这些信息将帮助AI记者更好地理解你，有针对性地提问</div>
              <div className="ip-fg"><div className="ip-fg-l">您的名字</div><input className="fin" value={ipName} onChange={e=>setIpName(e.target.value)} placeholder="请输入您的姓名"/></div>
              <div className="ip-fg"><div className="ip-fg-l">所在行业</div><input className="fin" value={ipIndustry} onChange={e=>setIpIndustry(e.target.value)} placeholder="请输入您所在的行业"/></div>
              <div className="ip-fg"><div className="ip-fg-l">您的角色</div><div className="ip-roles">{["创始人/CEO","讲师/培训师","顾问/咨询师","自由职业者","其他"].map(r=><button key={r} className={`ip-rl ${ipRole===r?"on":""}`} onClick={()=>setIpRole(r)}>{r}</button>)}</div></div>
              <div className="ip-acts"><button className="bt bt-g" onClick={()=>setIpStep(0)}>上一步</button><button className="bt bt-p" onClick={()=>setIpStep(2)}>进入访谈 <I.ArrowR/></button></div>
            </div>}

            {/* Step 2: AI Interview */}
            {ipStep===2&&<div>
              <div className="iv-hd">
                <div className="iv-hd-l">
                  <div className="iv-hd-av"><I.Bot/></div>
                  <div><div className="iv-hd-nm">AI记者 · 正在访谈</div><div className="iv-hd-sub">约10-15分钟，请认真作答，答案越真实脚本越像你</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  <button style={{width:32,height:32,borderRadius:8,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}} onClick={()=>{setIpFlow(false);setIpStep(0);}} title="退出访谈"><I.X/></button>
                </div>
              </div>

              <div className="iv-phases">
                {ipPhases.map((p,i)=>(
                  <div key={i} className={`iv-ph ${ipPhase===i?"on":""} ${ipPhase>i?"dn":""}`}>
                    <div className="iv-ph-num">{ipPhase>i?<I.Check/>:i+1}</div>
                    <div className="iv-ph-nm">{p.name}</div>
                    <div className="iv-ph-sub">{p.sub}</div>
                  </div>
                ))}
              </div>

              <div className="iv-scroll" ref={ivRef}>
                {ipAnswers.map((qa,i)=>(
                  <div key={i} className="iv-qa fn">
                    <div style={{fontSize:10,color:"var(--t3)",fontWeight:600,marginBottom:6}}>第 {i+1} 轮</div>
                    <div className="iv-q"><div className="iv-q-av"><I.Bot/></div><div className="iv-q-bub">{qa.q}</div></div>
                    {ipEditing===i?
                      <div className="iv-input"><textarea className="iv-in" rows={2} value={ipCurAns} onChange={e=>setIpCurAns(e.target.value)} autoFocus onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();ipSubmitAns();}}}/><button className="iv-send" onClick={ipSubmitAns}><I.Send/></button></div>
                    :<><div className="iv-a"><div className="iv-a-bub">{qa.a}</div></div><div className="iv-a-redo" onClick={()=>{setIpEditing(i);setIpCurAns(qa.a);}}>重新回答</div></>}
                  </div>
                ))}

                {ipEditing===null&&<div className="iv-qa fn">
                  <div style={{fontSize:10,color:"var(--t3)",fontWeight:600,marginBottom:6}}>第 {ipAnswers.length+1} 轮</div>
                  <div className="iv-q"><div className="iv-q-av"><I.Bot/></div><div className="iv-q-bub">{getIpQ(ipPhase,ipQIdx,ipName,ipIndustry)}</div></div>
                  <div className="iv-input">
                    <textarea className="iv-in" rows={2} value={ipCurAns} onChange={e=>setIpCurAns(e.target.value)} placeholder="认真作答，答案越具体真实，最终脚本越像你自己写的...(Ctrl+Enter发送）" onKeyDown={e=>{if(e.key==="Enter"&&(e.ctrlKey||e.metaKey)){e.preventDefault();ipSubmitAns();}}}/>
                    <button className="iv-send" onClick={ipSubmitAns}><I.Send/></button>
                  </div>
                </div>}
              </div>
            </div>}

            {/* Step 3: Done + extracted profile */}
            {ipStep===3&&<div className="ip-dn">
              <div className="ip-dn-ic"><I.Check/></div>
              <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>访谈完成</div>
              <div style={{fontSize:13,color:"var(--t2)",marginBottom:4,lineHeight:1.7}}>AI已根据访谈提取了你的IP画像信息</div>
              <div style={{fontSize:12,color:"var(--t3)",marginBottom:8}}>你可以点击任意字段进行修改</div>

              <div className="ip-pf">
                {[
                  {k:"field",l:"细分领域",ph:"你的行业细分领域"},
                  {k:"biz",l:"核心业务",ph:"公司的核心业务"},
                  {k:"clients",l:"目标客户",ph:"主要服务的客户群体"},
                  {k:"duty",l:"负责工作",ph:"你主要负责的工作"},
                  {k:"scale",l:"公司规模",ph:"公司大致规模"},
                  {k:"stance",l:"行业观点",ph:"你对行业趋势的态度"},
                  {k:"think",l:"核心原则",ph:"你做事的核心原则"},
                  {k:"style",l:"表达风格",ph:"你的表达风格示例"},
                ].map(f=>(
                  <div key={f.k} className="ip-pf-item">
                    <div className="ip-pf-l">{f.l}</div>
                    {ipEditField===f.k?
                      <input className="fin" style={{flex:1,fontSize:12}} value={ipProfile[f.k]} onChange={e=>setIpProfile(p=>({...p,[f.k]:e.target.value}))} onBlur={()=>setIpEditField(null)} autoFocus placeholder={f.ph}/>
                    :<div className="ip-pf-v">{ipProfile[f.k]||<span style={{color:"var(--t3)"}}>未填写</span>}</div>}
                    <div className="ip-pf-edit" onClick={()=>setIpEditField(f.k)}><I.Edit/></div>
                  </div>
                ))}
              </div>

              <div style={{marginTop:24,display:"flex",gap:8,justifyContent:"center"}}>
                <button className="bt bt-p" onClick={()=>setIpFlow(false)}><I.Check/> 保存并更新IP人设</button>
              </div>
            </div>}

          </div>}
        </div></div>}

        {/* CREATE PAGE */}
        {pg==="create"&&cs!=="storyboard"&&<div className="sw">
          <div className="sl">
            <div className="sl-hd"><div className="sl-bk" onClick={()=>setPg("dash")}><I.ArrowL/> 返回工作台</div><div style={{fontSize:15,fontWeight:700}}>脚本创作</div></div>
            <div className="sl-sec"><div className="sl-lb">产品</div><div className="sl-vl">{prod}</div></div>
            <div className="sl-sec"><div className="sl-lb">品类</div><div className="sl-tag">{cat}</div></div>
            <div className="sl-sec"><div className="sl-lb">时长</div><div className="sl-vl">{dur}</div></div>
            <div className="sl-sec"><div className="sl-lb">创意增强</div><div className="sl-vl" style={{color:dataOn?"var(--p)":"var(--t3)"}}>{dataOn?"已开启":"未开启"}</div></div>
            <div className="sl-sec"><div className="sl-lb">IP人设</div><div style={{display:"flex",alignItems:"center",gap:6}}><div className="ipc-a" style={{width:20,height:20,fontSize:8}}>IP</div><span style={{fontSize:12,color:"var(--p)",fontWeight:500}}>已自动加载</span></div></div>
            <div style={{padding:"12px 14px",marginTop:"auto"}}><button className="bt bt-g" style={{width:"100%",justifyContent:"center"}} onClick={openModal}><I.Edit/> 修改参数</button></div>
          </div>
          <div className="srt">
            {cs==="ai-generating"&&<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100%",gap:20}}>
              <div style={{width:48,height:48,border:"4px solid var(--bl)",borderTop:"4px solid var(--p)",borderRadius:"50%",animation:"spin 1s linear infinite"}}/>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{fontSize:15,fontWeight:600,color:"var(--p)"}}>{aiGenStep||"AI正在生成脚本..."}</div>
              <div style={{fontSize:12,color:"var(--t3)"}}>Gemini 正在根据{libSelTmpl?`「${libSelTmpl.name}」模板`:"您的需求"}创作，请稍候...</div>
            </div>}

            {cs==="results"&&<>
              <div className="rh"><div className="rht">AI脚本已生成 {(aiScripts.length||SCRIPTS.length)} 条</div><div className="rw">⚠️ 标红词语为违禁高风险词语</div></div>
              <div className="rb">{(aiScripts.length>0?aiScripts:SCRIPTS).map(s=>(
                <div key={s.id} className="scd fn">
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                    <div className="scd-n">{s.name}</div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>{s.badges.map((b,i)=><span key={i} className={`bd bd-${b.c}`}>{b.t}</span>)}</div>
                  </div>
                  <div className="scd-m">预计时长：{s.dur}　镜头数：{s.shots}个　核心卖点：{s.sell}个</div>
                  <div className="scd-d">{s.desc}</div>
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:10}}>
                    <button className="eb" onClick={()=>{setAdopted(s);setCs("detail")}}>展开详情 <I.ChevronR/></button>
                  </div>
                </div>
              ))}</div>
            </>}

            {cs==="detail"&&(()=>{const s=adopted||SCRIPTS[0];return <>
              <div className="rh">
                <div className="rht" onClick={()=>setCs("results")}><I.ArrowL/> 返回列表</div>
                <div className="rw">⚠️ 标红词语为违禁高风险词语</div>
              </div>
              <div className="rb"><div className="fn">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
                  <div>
                    <div style={{fontSize:18,fontWeight:800,marginBottom:4}}>{s.name}</div>
                    <div style={{fontSize:11,color:"var(--t3)",display:"flex",gap:14}}>
                      <span>⏱ 预计时长：{s.dur}</span><span>🎬 镜头数：{s.shots}个</span><span>⭐ 核心卖点：{s.sell}个</span>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:5,flexShrink:0}}>{s.badges.map((b,i)=><span key={i} className={`bd bd-${b.c}`}>{b.t}</span>)}</div>
                </div>
                <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7,padding:"12px 16px",background:"var(--s)",borderRadius:"var(--rl)",border:"1px solid var(--bl)",marginBottom:24}}>
                  {s.desc}
                </div>
                <div className="ds">
                  <div className="dst">创作逻辑推导</div>
                  {s.logic.map((l,i)=><div key={i} className="li"><div className="ln">{i+1}</div>{l}</div>)}
                </div>
                {s.table.length>0&&<div className="ds">
                  <div className="dst">分镜脚本</div>
                  <div style={{overflowX:"auto"}}>
                    <table className="stb">
                      <thead><tr><th>镜头</th><th>时长</th><th>画面描述</th><th>口播文案</th><th>设计意图</th></tr></thead>
                      <tbody>{s.table.map((r,i)=><tr key={i}>
                        <td style={{fontWeight:600}}>{r.shot}</td><td>{r.dur}</td><td>{r.scene}</td>
                        <td className={r.risk?"rsk":""}>{r.copy}</td><td className="int">{r.intent}</td>
                      </tr>)}</tbody>
                    </table>
                  </div>
                </div>}
                <div className="ab">
                  <button className="abi"><I.Copy/> 复制全文</button>
                  <button className="abi"><I.Download/> 导出PDF</button>
                  <button className="abi"><I.Refresh/> 重新生成</button>
                  <button className="abi pr" onClick={()=>setCs("shots")}>采纳此方案</button>
                </div>
              </div></div>
            </>;})()}

            {cs==="shots"&&<div className="shw">
              <div className="shc">
                <div className="rh"><div className="rht" onClick={()=>setCs("detail")}><I.ArrowL/> 脚本记录</div><div className="tgs">显示分镜头脚本 <button className="trb" onClick={()=>setShowSc(!showSc)}>{showSc?<I.TglOn/>:<I.TglOff/>}</button></div></div>
                <div className="shb">{((adopted?.table||[]).length>0?(adopted.table.map(r=>({text:r.copy,note:r.scene}))):SHOTS).map((s,i)=>(
                  <div key={i} className={`shi fn ${editIdx===i?"ed":""}`} style={{animationDelay:`${i*40}ms`}}>
                    <div className="shl"><span className="shx">{i+1}</span> 分镜头文案</div>
                    {editIdx===i?<textarea className="fin" rows={2} defaultValue={s.text} autoFocus style={{marginTop:3}} onBlur={()=>setEditIdx(null)}/>:<div className="shtx">{s.text}</div>}
                    <div className="sha"><button className="shab" onClick={()=>setEditIdx(i)}><I.Edit/></button><button className="shab"><I.Trash/></button><button className="shab" style={{color:"var(--p)"}}><I.Plus/></button></div>
                    {showSc&&<div className="scn fn"><div className="scn-l">参考画面/备注</div>{s.note}</div>}
                  </div>
                ))}</div>
                <div className="ba"><button className="bab bab-g"><I.Refresh/> 重新生成</button><button className="bab bab-p" onClick={()=>setCs("storyboard")}><I.Eye/> 确认并预览分镜</button></div>
              </div>
              <div className="po"><div className="po-h">其他脚本参考</div><div className="po-b">
                {REFS.map((r,i)=><div key={i} className="rf"><span className="rft" style={{background:r.bg,color:r.color}}>{r.tag}</span><span style={{fontSize:9,color:"var(--t3)",marginLeft:6}}>{r.dur}</span><div className="rftx" style={{marginTop:5}}>{r.text}</div><div className="rfm">{r.more}</div></div>)}
                <div className="pos"><div className="pos-t">对话打磨</div><div className="poc">{["让开头更吸引人","加强产品卖点","让结尾更有行动力","整体语言更口语化"].map((c,i)=><button key={i} className="poci">{c}</button>)}</div><div className="por"><input className="poi" placeholder="输入修改指令" value={pi} onChange={e=>setPi(e.target.value)}/><button className="pos-b">发送</button></div></div>
              </div></div>
            </div>}
          </div>
        </div>}

        {pg==="create"&&cs==="storyboard"&&<div className="sb-pg">
          <div className="sb-steps">
            {[{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"脚本打磨",s:"done"},{l:"分镜预览",s:"on"},{l:"视频生成",s:""},{l:"完成",s:""}].map((st,i)=>
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4}}>{i>0&&<span className="sb-sep">›</span>}<span className={`sb-step ${st.s}`}><span className="sb-step-dot">{st.s==="done"?<I.Check/>:""}</span>{st.l}</span></span>
            )}
          </div>
          <div className="sb-hd">
            <div style={{display:"flex",alignItems:"center",gap:12}}><button style={{padding:"5px 12px",borderRadius:8,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t2)",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}} onClick={()=>setCs("shots")}><I.ArrowL/> 返回</button><div className="sb-hd-t">分镜预览</div></div>
            <div className="sb-hd-acts">
              <button className="sb-hd-btn green"><I.Sparkle/> 生成分镜图</button>
              <button className="sb-hd-btn ghost" onClick={()=>setCs("generating")}><I.Camera/> 生成视频</button>
            </div>
          </div>
          <div className="sb-grid">
            {[
              {tag:"hook",tagC:"hook",dur:"6.9s",text:"千万别买这个，除非你能接受......"},
              {tag:"medium",tagC:"medium",dur:"8.6s",text:"这款产品真的让我眼前一亮"},
              {tag:"close_up",tagC:"close",dur:"8.6s",text:"最让我惊喜的是它的核心功能"},
              {tag:"medium",tagC:"medium",dur:"8.6s",text:"日常使用起来真的很方便"},
              {tag:"wide",tagC:"wide",dur:"8.6s",text:"用了一段时间，效果真的很明显"},
              {tag:"close_up",tagC:"close",dur:"8.6s",text:"对比一下使用前后的差别"},
            ].map((c,i)=>(
              <div key={i} className="sb-card" onClick={()=>setSbEdit(i)}>
                <div className="sb-card-img">点击生成按钮</div>
                <div className="sb-card-body">
                  <div className="sb-card-meta">
                    <span className={`sb-card-tag ${c.tagC}`}>{c.tag}</span>
                    <span className="sb-card-dur">{c.dur}</span>
                    <span className="sb-card-num">#{i+1}</span>
                  </div>
                  <div className="sb-card-text">{c.text}</div>
                  <div className="sb-card-acts">
                    <span className="sb-card-act" onClick={e=>{e.stopPropagation();setSbEdit(i);}}>编辑</span>
                    <span className="sb-card-act">重新生成</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {sbEdit!==null&&<div className="sb-ov" onClick={()=>setSbEdit(null)}><div className="sb-mdl" onClick={e=>e.stopPropagation()}>
            <div className="sb-mdl-t">编辑镜头 <button className="mdl-x" onClick={()=>setSbEdit(null)}><I.X/></button></div>
            <div className="sb-mdl-fg"><div className="sb-mdl-l">口播文案</div><textarea className="sb-mdl-inp" rows={3} defaultValue={["千万别买这个，除非你能接受......","这款产品真的让我眼前一亮","最让我惊喜的是它的核心功能","日常使用起来真的很方便","用了一段时间，效果真的很明显","对比一下使用前后的差别"][sbEdit]||""}/></div>
            <div className="sb-mdl-fg"><div className="sb-mdl-l">画面描述 (English)</div><textarea className="sb-mdl-inp" rows={3} defaultValue="Clean product hero shot, professional studio lighting"/></div>
            <div className="sb-mdl-fg"><div className="sb-mdl-l">重新生成反馈 (可选)</div><input className="sb-mdl-inp" placeholder="描述你想要的修改方向..."/></div>
            <div className="sb-mdl-foot">
              <button className="sb-mdl-btn cancel" onClick={()=>setSbEdit(null)}>取消</button>
              <button className="sb-mdl-btn orange">保存并重新生成图片</button>
              <button className="sb-mdl-btn blue">仅保存文案</button>
            </div>
          </div></div>}
        </div>}

        {/* VIDEO GENERATING */}
        {pg==="create"&&cs==="generating"&&<div className="sb-pg">
          <div className="sb-steps">
            {[{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"脚本打磨",s:"done"},{l:"分镜预览",s:"done"},{l:"视频生成",s:"on"},{l:"完成",s:""}].map((st,i)=>
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4}}>{i>0&&<span className="sb-sep">›</span>}<span className={`sb-step ${st.s}`}><span className="sb-step-dot">{st.s==="done"?<I.Check/>:""}</span>{st.l}</span></span>
            )}
          </div>
          <div className="vg-wrap">
            <div className="vg-card">
              <div className="vg-t">视频生成中...</div>
              <div className="vg-bar-wrap"><div className="vg-bar"><div className="vg-bar-fill" style={{width:vgPct+"%"}}/></div><div className="vg-pct">{vgPct}%</div></div>
              <div className="vg-sub">视频片段 {Math.min(Math.round(vgPct/100*7),7)}/7 完成</div>
              <div className="vg-timeline">
                <div className={`vg-tl-item ${vgStep>=1?"done":vgStep===0?"on":""}`}>图生视频片段</div>
                <div className={`vg-tl-item ${vgStep>=2?"done":vgStep===1?"on":""}`}>TTS配音生成</div>
                <div className={`vg-tl-item ${vgStep>=3?"done":vgStep===2?"on":""}`}>FFmpeg合成</div>
                <div className={`vg-tl-item ${vgStep>=4?"done":vgStep===3?"on":""}`}>完成</div>
              </div>
            </div>
          </div>
        </div>}

        {/* VIDEO PREVIEW */}
        {pg==="create"&&cs==="preview"&&<div className="sb-pg">
          <div className="sb-steps">
            {[{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"脚本打磨",s:"done"},{l:"分镜预览",s:"done"},{l:"视频生成",s:"done"},{l:"完成",s:"on"}].map((st,i)=>
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4}}>{i>0&&<span className="sb-sep">›</span>}<span className={`sb-step ${st.s}`}><span className="sb-step-dot">{st.s==="done"?<I.Check/>:""}</span>{st.l}</span></span>
            )}
          </div>
          <div className="vp-wrap">
            <div className="vp-card">
              <div className="vp-player"><div className="vp-play"><I.Camera/></div></div>
              <div className="vp-info">
                <div className="vp-info-t">{prod} · 脚本视频</div>
                <div className="vp-info-meta"><span>⏱ {dur}</span><span>🎬 6个分镜</span><span>📦 {cat}</span></div>
                <div className="vp-acts">
                  <button className="vp-act pri" onClick={()=>setPg("dash")}><I.Check/> 确认完成</button>
                  <button className="vp-act sec"><I.Download/> 导出视频</button>
                  <button className="vp-act sec"><I.Copy/> 发布到排期</button>
                  <button className="vp-act sec" onClick={()=>setCs("storyboard")}><I.Edit/> 编辑分镜</button>
                  <button className="vp-act sec" onClick={()=>setCs("generating")}><I.Refresh/> 重新生成</button>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* DEEP CHAT CREATE */}
        {pg==="create-deep"&&<div className="sw">
          <div className="sl">
            <div className="sl-hd"><div className="sl-bk" onClick={()=>setPg("dash")}><I.ArrowL/> 返回工作台</div></div>
            <div className="dp-hd">
              <div className="dp-hd-t"><I.Bot/> AI 创作顾问</div>
              <div className="dp-hd-d">对话式深度挖掘你的创作需求</div>
            </div>
            <div className="dp-sec-t">快捷指令</div>
            {[{icon:<I.Bulb/>,t:"帮我找灵感",d:"从热搜挖掘创意角度"},{icon:<I.Search/>,t:"搜索爆款视频",d:"搜索同类高播放内容"},{icon:<I.Link/>,t:"分析竞品链接",d:"拆解竞品脚本结构"}].map((c,i)=>
              <div key={i} className="dp-card" onClick={()=>send(c.t)}><div className="dp-ic">{c.icon}</div><div><div className="dp-t">{c.t}</div><div className="dp-d">{c.d}</div></div></div>
            )}
          </div>
          <div className="srt">
            <div className="cc">
              <div className="cmsg" ref={chatRef}>
                {msgs.length<=1&&<div className="chat-welcome"><div className="chat-welcome-ic"><I.Bot/></div><div className="chat-welcome-t">你好，我是你的AI创作顾问</div><div className="chat-welcome-d">告诉我你想创作什么内容，或者选择左侧快捷指令开始</div></div>}
                {msgs.map((m,i)=><div key={i} className={`mg ${m.r==="user"?"u":"bot"} fn`}><div className={`ma ${m.r==="user"?"usr":"bot"}`}>{m.r==="user"?"你":<I.Bot/>}</div><div><div className="mbu"><div style={{whiteSpace:"pre-wrap"}}>{m.c}</div>
                {m.acts&&<div className="qab">{m.acts.map((a,j)=><button key={j} className="qa" onClick={()=>send(a)}>{a}</button>)}</div>}
                {m.hots&&<><div style={{margin:"10px 0"}}>{m.hots.map((h,j)=><div key={j} className="hi2"><span>{h.t}</span><span className="hi2c">{h.ct}</span></div>)}</div>
                  <div style={{fontSize:12,fontWeight:700,margin:"10px 0 6px"}}>推荐灵感角度</div>
                  <div className="acs">{m.angs.map((a,j)=><div key={j} className="ac"><div className="ac-t">{a.ic} {a.t}</div><div className="ac-s">{a.s}</div><div className="ac-d">{a.d}</div></div>)}</div>
                  <div style={{fontSize:11,color:"var(--t2)",lineHeight:1.7,marginTop:10,padding:"10px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)"}}>{m.sum}</div>
                </>}</div></div></div>)}
              </div>
              <div className="cbr"><input className="cin" placeholder="聊聊你的创意想法..." value={ci} onChange={e=>setCi(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send(ci)}}/><button className="cmb"><I.Mic/></button><button className="csb" onClick={()=>send(ci)}><I.Send/></button></div>
              {msgs.length>2&&<button className="cgb" onClick={()=>{setPg("create");setCs("results")}}><I.Zap/> 根据对话生成脚本</button>}
            </div>
          </div>
        </div>}
      </div>

      {/* ===== MODAL ===== */}
      {modal&&<div className="ov" onClick={()=>setModal(false)}><div className="mdl" onClick={e=>e.stopPropagation()}>
        <div className="mdl-h"><div className="mdl-ht"><I.Sparkle/> 新建脚本</div><button className="mdl-x" onClick={()=>setModal(false)}><I.X/></button></div>
        <div className="mdl-b">
          {mStep===0&&<div><div style={{fontSize:14,fontWeight:600,marginBottom:16}}>选择创作模式</div><div className="mcd">
            <div className={`mc ${mMode==="quick"?"on":""}`} onClick={()=>setMMode("quick")}><div className="mc-ic"><I.Zap/></div><div className="mc-t">快速模式</div><div className="mc-d">30秒快速生成脚本<br/>填写产品信息，AI智能匹配</div></div>
            <div className={`mc ${mMode==="deep"?"on":""}`} onClick={()=>setMMode("deep")}><div className="mc-ic"><I.Bot/></div><div className="mc-t">深度定制</div><div className="mc-d">对话式深度挖掘需求<br/>AI顾问帮你找灵感、做分析</div></div>
          </div></div>}
          {mStep===2&&<div><div style={{fontSize:14,fontWeight:600,marginBottom:16}}>填写产品信息</div>
            {libSelTmpl&&<div style={{display:"flex",alignItems:"center",gap:8,padding:"10px 14px",background:"var(--pbg)",border:"1.5px solid var(--pl)",borderRadius:10,marginBottom:14,fontSize:12}}>
              <I.Layers/><span style={{flex:1}}>套用模板：<b style={{color:"var(--p)"}}>{libSelTmpl.name}</b>{libSelTmpl._creator&&<span style={{color:"var(--t3)"}}> · {libSelTmpl._creator}</span>}</span>
              <button style={{border:"none",background:"none",cursor:"pointer",color:"var(--t3)",padding:2}} onClick={()=>setLibSelTmpl(null)}><I.X/></button>
            </div>}
            <div className="fg2"><label className="fg2-l">产品名称 <span className="rq">*</span></label><input className="fin" value={prod} onChange={e=>setProd(e.target.value)} placeholder="如：美白面霜、智能手表"/></div>
            <div className="fg2"><label className="fg2-l">品类</label><div className="chs">{["美妆护肤","食品保健","数码3C","服装鞋包","家居生活","教育培训","母婴","其他"].map(c=><button key={c} className={`ch ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div></div>
            <div className="fg2"><label className="fg2-l">视频时长</label><div className="chs">{["30秒","60秒","2分钟","3分钟"].map(d=><button key={d} className={`ch ${dur===d?"on":""}`} onClick={()=>setDur(d)}>{d}</button>)}</div></div>
            <div className="fg2"><div className="tr"><span className="trl">创意增强</span><button className="trb" onClick={()=>setDataOn(!dataOn)}>{dataOn?<I.TglOn/>:<I.TglOff/>}</button></div><div className="dh">分析真实爆款视频+评论，AI创意增强生成脚本(需增加约3-5分钟)</div></div>
          </div>}
        </div>
        <div className="mdl-f"><div className="step-dots">{[0,2].map(i=><div key={i} className={`step-dot ${mStep===i?"on":""}`}/>)}</div><div style={{display:"flex",gap:8}}>
          {mStep===2&&<button className="bt bt-g" onClick={()=>setMStep(0)}>上一步</button>}
          {mStep===0&&<button className="bt bt-p" onClick={()=>{if(mMode==="deep"){setModal(false);setPg("create-deep");setCs("input");}else setMStep(2);}}>下一步 <I.ArrowR/></button>}
          {mStep===2&&<button className="bt bt-p" onClick={startCreate}><I.Zap/> 生成脚本</button>}
        </div></div>
      </div></div>}
    </div></>
  );
}
