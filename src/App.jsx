import { useState, useRef, useEffect } from "react";
import AvatarStudio from "./AvatarStudio.jsx";
import ComicDrama from "./ComicDrama.jsx";
import StoryboardWorkbench from "./StoryboardWorkbench.jsx";

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
  {id:1,name:"凌晨3点的急救面膜",dur:"45s",shots:7,sell:3,desc:"用「熬夜党自救」共鸣切入，制造强烈代入感后反转种草",badges:[{t:"完播率杀手",c:"exp"},{t:"痛点驱动",c:"conv"},{t:"情感共鸣",c:"exp"}],logic:["情绪0→9 | 痛点炸弹：用极致真实的疲态画面制造代入感","情绪9→7 | 战术目的：放大焦虑，让用户对号入座","情绪7→7 | 引入解决方案+制造悬念，闺蜜推荐社交货币","情绪7→10 | 产品体验视觉化，展示质地和使用感受","情绪8→10 | 效果对比冲击，「一夜之间」的巨大反差","情绪10→9 | 社交验证+真实性，用对话形式引爆信任","情绪9→8 | 行动号召：制造稀缺+建立「我们自己人」的认同感"],
   table:[{shot:1,dur:"3秒",scene:"【类型：场景氛围图】【大特写·固定】深夜书桌场景，电脑屏幕散发幽蓝冷光映在桌面上，旁边散落着空咖啡杯和揉皱的纸巾，桌角一盏台灯发出昏黄微光，整体疲惫压抑氛围【冷白调偏青】【转场】从黑屏硬切闪入",copy:"凌晨3点刚下班...【重】看看这张脸，简直没法看了！",risk:false,intent:"情绪0→9 | 战术目的：痛点炸弹，用极致真实的疲态感制造强代入，瞬间击中目标用户（熬夜党）| 完播策略：开头即冲突，0.5秒内制造认知共鸣",image_prompt:"dark moody desk scene at 3am, cold blue laptop screen glow illuminating messy desk surface, crumpled tissues, empty coffee cup, dim warm desk lamp in corner, lonely exhausted atmosphere, cinematic still life, cool blue-grey color palette with warm amber accent, Sony 35mm f/1.4, shallow depth of field, rule of thirds composition, editorial lifestyle photography, melancholic mood"},{shot:2,dur:"4秒",scene:"【类型：质地微距】【中景·固定】浴室洗手台场景，惨白日光灯顶光照射下，台面上零散放着几瓶护肤品，镜子上有水雾痕迹，一条毛巾随意搭在台边，整体凌乱但真实的生活感【惨白调】【转场】硬切",copy:"又干又黄...毛孔粗得能插秧...真的，我都不敢照镜子。",risk:false,intent:"情绪9→7 | 战术目的：放大焦虑，通过具体化描述让用户对号入座 | 完播策略：连续痛点轰炸维持注意力",image_prompt:"bathroom vanity scene under harsh fluorescent overhead light, scattered skincare bottles on white marble countertop, foggy mirror with water streaks, towel draped casually over edge, raw unfiltered morning-after feeling, stark cool white lighting from above, clinical atmosphere, Canon 50mm f/1.8, centered composition, realistic lifestyle photography, slightly desaturated cool tones"},{shot:3,dur:"5秒",scene:"【类型：产品英雄镜头】【特写·缓慢推进】一双手从画面外将一盒面膜推入画面中央，面膜盒放在凌乱的化妆台上，背景是零散的化妆品瓶瓶罐罐。面膜包装袋发出清脆的「撕拉」质感光泽【色调从冷白转为柔和暖光】【转场】快速硬切转场",copy:"还好...我闺蜜偷偷塞给我这个，一用就上瘾了！【重】千万别连续用，会上瘾！",risk:false,intent:"情绪7→7 | 战术目的：引入解方案+制造悬念。用闺蜜推荐建立社交货币信任，「会上瘾」制造好奇心缺口 | 完播策略：悬念钩子让人想知道为什么会上瘾",image_prompt:"elegant face mask box being gently pushed into frame center on cluttered vanity table, scattered beauty products softly blurred in background, mask packaging catching light with premium sheen, transition from cool to warm lighting, soft key light from right side, beauty product commercial style, Nikon 85mm f/1.4, shallow bokeh, warm amber transitioning from cool blue, luxury skincare campaign aesthetic"},{shot:4,dur:"5秒",scene:"【类型：质地微距】【大特写·缓慢推进】面膜纸被缓缓展开的过程，镜头捕捉到精华液像蜂蜜一样浓稠地拉丝、滴落。下一镜，面膜轻柔地敷上模型皮肤（只露额头和鼻梁局部），能看到气泡被抚平、精华液渗透的慢动作，水光在表面流动推开形成波纹【干净透亮的暖白调】【转场】水波纹特效转场",copy:"你看这精华液！【重】满满当当的！敷上去冰冰凉凉...哦...有点爽，那种被救的感觉都没了！",risk:false,intent:"情绪7→10 | 战术目的：展示核心卖点（精华丰盈、体验视觉化），将产品体验感官化，通过「冰凉」「被救」等词让用户产生向往 | 完播策略：ASMR级画面+感官描述制造沉浸",image_prompt:"extreme macro shot of face mask sheet being unfolded, thick honey-like serum stretching and dripping in slow motion, glistening translucent essence with visible air bubbles, next shot showing mask smoothly applied on skin surface with serum spreading in ripple patterns, clean bright warm white lighting, backlit to show serum translucency, macro 100mm f/2.8, super shallow focus, warm pearl-white palette, premium beauty commercial for Vogue, water droplet crystal clarity"},{shot:5,dur:"4秒",scene:"【类型：对比概念图】【匹配剪辑】画面变黑后转为第二天清晨场景：阳光透过百叶窗洒在柔软枕头上，形成温暖的光影条纹；旁边梳妆镜反射出柔和晨光，桌上放着用过的面膜包装和一杯热气腾腾的咖啡【温暖的晨曦暖色调，金色调】【转场】光线遮挡转场",copy:"我就敷了15分钟...【重】第二天早上！你敢信？！",risk:false,intent:"情绪8→10 | 战术目的：效果对比冲击。利用「一夜之间」的巨大反差完成高潮爆发，用「你敢信？！」的反问句式，把震惊的情绪直接传给观众 | 完播策略：反转高潮是全片最高能记忆点",image_prompt:"beautiful morning scene transition, warm golden sunlight streaming through venetian blinds casting striped shadows on soft white pillow, vanity mirror reflecting warm dawn light, used face mask packet and steaming coffee cup on table, cozy awakening atmosphere, golden hour side lighting, Canon 35mm f/1.4, warm golden-amber palette, lifestyle editorial photography, hopeful radiant mood, Japanese morning aesthetic"},{shot:6,dur:"5秒",scene:"【类型：场景氛围图】【中景·固定】明亮的办公室日光环境，办公桌上放着面膜盒和一杯水，手机屏幕亮着显示微信对话界面（文字模糊不可读），旁边放着一束小雏菊，窗外是蓝天白云【明亮清新调】【转场】硬切",copy:"（压低声音，像说悄悄话）结果今天上班...同事过来说「你最近是不是谈恋爱了？皮肤也太好了吧！」...哈哈她哪知道啊！",risk:false,intent:"情绪10→9 | 战术目的：社交验证+强化真实性。用「同事认不出」的对话场景制造social proof，用人际互动把产品效果转化为社交货币 | 完播策略：八卦式叙述引爆代入感",image_prompt:"bright modern office desk scene in daylight, face mask box and glass of water on clean white desk, smartphone screen glowing with chat interface blurred, small bouquet of daisies in simple vase, blue sky and clouds visible through window, fresh optimistic atmosphere, natural window light from left, bright airy color palette with white and soft blue, Canon 50mm f/1.8, clean minimal composition, Korean office lifestyle aesthetic"},{shot:7,dur:"4秒",scene:"【类型：产品英雄镜头】【中景·固定】产品盒放在温暖居家环境中，旁边是一杯热饮和一本翻开的书，柔和的暖光从侧面打过来，整体温馨有格调。产品盒旁放着一个小卡片写着模糊文字（暗示链接）【温暖居家调】【转场】缓慢淡出到黑屏",copy:"就这个！【重】熬夜脸的亲妈！我先囤了...链接放这儿了，不买也先收藏，早晚用得上呢？",risk:false,intent:"情绪9→8 | 战术目的：行动号召。不用「赶紧下单」硬推，用「我先囤了」建立「我们自己人」认同感+「早晚用得上」制造稀缺暗示 | 完播策略：轻松收尾不制造压力，提高转化意愿",image_prompt:"cozy home setting product hero shot, face mask box placed on warm wooden side table next to steaming mug and open book, soft warm side lighting creating gentle shadows, homey comfortable atmosphere with knitted blanket texture visible, product box catching warm golden light, intimate evening scene, Sony 85mm f/1.8, warm amber and cream palette, rule of thirds with product at golden ratio point, hygge lifestyle photography, warm inviting mood"}]},
  {id:2,name:"闺蜜掏心话——我花了3000块踩的坑今天全告诉你",dur:"50s",shots:7,sell:4,desc:"用「踩坑经历」建立信任，真实感拉满的闺蜜种草",badges:[{t:"评论区炸弹",c:"exp"},{t:"强信任",c:"auth"},{t:"种草力强",c:"conv"}],logic:["好奇9→震惊7 | 用「花了3000块」制造信息缺口","震惊7→焦虑8 | 展示踩坑产品的失败画面，放大焦虑","焦虑8→期待7 | 转折引入，悬念式介绍本品","期待7→惊喜10 | 质地展示+使用体验高潮","惊喜10→信任9 | 效果对比+数据支撑","信任9→认同8 | 价格锚定，制造超值感","认同8→行动8 | 闺蜜式软逼单"],
   table:[{shot:1,dur:"3秒",scene:"【类型：平铺排列】【俯拍·固定】桌面上杂乱地摆放着七八瓶不同的护肤品空瓶，有的倒着有的盖子开着，旁边散落着购物小票和快递包装碎片，形成一种「买了一堆交了智商税」的视觉冲击【冷灰调，略微过曝显得廉价】【转场】从黑屏闪切",copy:"我跟你说啊...这3000块...【重】全是智商税！别笑，真的！",risk:false,intent:"好奇9→震惊7 | 战术目的：用「3000块智商税」制造认知冲突+信息缺口 | 完播策略：金额+自嘲制造强烈好奇心",image_prompt:"overhead flat lay of messy desk with 7-8 empty skincare bottles scattered chaotically, some fallen over with caps off, crumpled shopping receipts and torn delivery packaging scattered around, wasteful messy arrangement suggesting regret, cold grey-blue desaturated tones, slightly overexposed harsh overhead light, iPhone-style casual flat lay, 24mm wide angle overhead, editorial still life with deliberate chaos, consumer regret aesthetic"},{shot:2,dur:"5秒",scene:"【类型：质地微距】【大特写·固定】一个透明塑料瓶中的乳液质地看起来稀薄如水，倒在玻璃板上迅速散开没有粘稠度；另一镜是膏状产品厚重地堆在皮肤纹理模型上，看起来闷闷的不透气【对比冷灰调】【转场】快速硬切",copy:"这个...涂上去跟水一样，完全没用。那个呢？闷痘！一夜之间全爆了...",risk:false,intent:"震惊7→焦虑8 | 战术目的：通过踩坑细节建立「过来人」信任度，同时放大用户对选错产品的焦虑 | 完播策略：具体踩坑经历比泛泛而谈更抓人",image_prompt:"split comparison macro shots: first shows thin watery lotion spreading rapidly on glass surface like water with no viscosity, second shows thick heavy cream piled on textured skin model looking suffocating and greasy, clinical test feeling, cold grey-blue laboratory lighting, macro 100mm f/2.8 lens, stark unflattering harsh light, before-solution comparison photography, medical dermatology documentation style"},{shot:3,dur:"5秒",scene:"【类型：产品英雄镜头】【特写·缓慢推进】画面突然变亮变暖，产品面膜盒从暗处被推入一束温暖的聚光灯下，光线在包装表面缓缓流动，周围其他杂物渐渐虚化消失，只剩产品在光芒中央【从冷灰突变暖金调】【转场】闪白过渡",copy:"直到...有一天我在小红书刷到这个...当时想，反正也不贵，死马当活马医吧。",risk:false,intent:"焦虑8→期待7 | 战术目的：经典转折点，用「不抱希望」反而制造更大期待 | 完播策略：光线色调突变制造视觉记忆锚点",image_prompt:"dramatic product reveal shot, face mask box emerging from darkness into warm spotlight beam, light slowly flowing across premium packaging surface creating golden reflections, surrounding clutter gradually dissolving into soft bokeh, sharp transition from cold grey to warm golden amber tones, single key light from above-right, cinematic product hero shot, Hasselblad 80mm f/2.8, centered dramatic composition, luxury brand campaign reveal moment, aspirational warm glow"},{shot:4,dur:"8秒",scene:"【类型：质地微距】【大特写·缓慢推进】精华液从面膜袋中挤出，浓稠度像融化的蜂蜜，在光线下呈现半透明的琥珀色泽；下一镜展示精华在玻璃板上的拉丝效果，丝线在光中闪烁；再一镜是精华滴落在丝绸面料上缓缓被吸收的过程【温暖透亮的蜜色调】【转场】叠化",copy:"你看这个精华...【重】挤出来就知道不一样！拉丝拉丝！浓稠度刚刚好...往脸上一敷...哇那个贴合感...",risk:false,intent:"期待7→惊喜10 | 战术目的：ASMR级质地展示，将使用体验视觉化，用「拉丝」等感官词制造种草冲动 | 完播策略：微距+慢动作是短视频最容易制造沉浸感的手法",image_prompt:"luxurious serum macro sequence: thick honey-like essence being squeezed from mask packet, amber translucent viscosity catching backlight, next shot showing serum string-pulling effect on glass with light sparkling through threads, final shot of golden serum droplet slowly absorbing into silk fabric surface, warm honey-amber color palette throughout, backlit rim lighting creating golden glow, macro 100mm f/2.8 with extension tube, ultra shallow depth of field, premium cosmetics commercial for Dior, sensory luxury aesthetic"},{shot:5,dur:"5秒",scene:"【类型：对比概念图】【中景·固定】左右对比构图：左边是一朵干枯发黄的玫瑰放在灰暗背景下；右边同一朵玫瑰（替换为鲜艳绽放的）在明亮温暖光线下，花瓣上有晶莹水珠。中间用一道光线做自然分隔【左冷右暖的对比色调】【转场】匹配剪辑（花瓣展开动态）",copy:"用了一周...我室友以为我去打了水光针！【重】就这效果，一片才几块钱...你说气不气人？",risk:false,intent:"惊喜10→信任9 | 战术目的：用隐喻对比（枯花→鲜花）代替真人before/after，更适合AI生成且视觉冲击更强 | 完播策略：价格反差引发分享欲",image_prompt:"split composition before-after concept: left side shows wilted yellowing rose on dark moody grey background, right side shows same rose variety in full vibrant bloom with crystal water droplets on petals under warm bright light, natural light beam creating dividing line between two halves, left cold desaturated blue-grey vs right warm vibrant pink-coral, Canon 85mm f/1.4, symmetrical split composition, conceptual beauty transformation photography, poetic metaphor style"},{shot:6,dur:"5秒",scene:"【类型：平铺排列】【俯拍·固定】精心排列的flat lay：面膜产品居中，周围放着计算器（显示模糊数字暗示省钱）、一小堆硬币、几朵干花、一张手写卡片，整体像杂志编辑图【清新明亮调】【转场】硬切",copy:"算一下哈...外面做一次水光针大几千吧？这个一盒才XX块，能用一个月...【重】数学好的自己算！",risk:false,intent:"信任9→认同8 | 战术目的：价格锚定，用水光针几千vs面膜几十的巨大反差制造超值感 | 完播策略：互动式话术引发评论",image_prompt:"curated flat lay arrangement: face mask box centered, surrounded by vintage calculator showing blurred numbers, small pile of gold coins, dried flowers, handwritten note card, all on clean white marble surface, magazine editorial styling, bright natural overhead light with soft shadows, warm clean palette with gold accents, Canon 50mm f/1.8 overhead, symmetric centered composition, Marie Claire beauty editorial flat lay, aspirational yet accessible mood"},{shot:7,dur:"4秒",scene:"【类型：产品英雄镜头】【中景·固定】温暖的卧室床头场景，面膜盒放在床头柜上，旁边是一盏亮着暖光的小台灯和一杯牛奶，被子微微掀开一角，营造「睡前护肤仪式」的温馨感【暖黄调】【转场】缓慢淡出",copy:"反正我是【重】已经囤了三盒了...链接就在下面，不买也收藏一下吧，省得到时候找不到问我！",risk:false,intent:"认同8→行动8 | 战术目的：用「已经囤了三盒」代替硬推，建立从众心理；「省得找我」制造紧迫感但不施压 | 完播策略：温暖收尾提高好感度和转化率",image_prompt:"cozy bedroom nightstand product placement, face mask box on wooden bedside table next to warm glowing small lamp and glass of milk, duvet corner slightly turned down inviting sleep, creating bedtime skincare ritual atmosphere, warm amber-yellow bedroom lighting, intimate cozy mood, Sony 50mm f/1.4, warm golden-cream palette, off-center composition with negative space, Kinfolk magazine lifestyle aesthetic, hygge bedtime comfort"}]},
  {id:3,name:"成分党请进——我把配料表翻译成人话了",dur:"55s",shots:7,sell:5,desc:"用「翻译配料表」的知识型内容建立专业权威，适合理性消费者",badges:[{t:"完播率 +35%",c:"exp"},{t:"专业权威",c:"auth"},{t:"评论区炸弹",c:"exp"}],logic:["好奇8→专注9 | 用配料表谜面制造知识缺口","专注9→恍然7 | 逐个翻译成分，建立专业感","恍然7→震撼9 | 核心成分深度解读，权威背书","震撼9→信任10 | 实验感对比，数据说话","信任10→认同9 | 用户口碑堆叠","认同9→行动8 | 理性逼单"],
   table:[]},
];
const SHOTS=[
  {text:"凌晨3点刚下班...看看这张脸，简直没法看了！还好闺蜜塞给我这个...",note:"【产品英雄镜头】面膜盒在深夜书桌场景中，电脑蓝光映衬，冷白调转暖",imgPrompt:"face mask box on dark desk with blue laptop glow, transitioning warm light, cinematic moody product shot, 35mm f/1.4"},
  {text:"你看这精华液！满满当当的！敷上去冰冰凉凉...那种被救的感觉...",note:"【质地微距】精华液蜂蜜般拉丝滴落，大特写，暖白调透光",imgPrompt:"extreme macro honey-like serum stretching and dripping, backlit golden translucency, 100mm macro f/2.8, luxury cosmetics commercial"},
  {text:"敷了15分钟...第二天早上！你敢信？！同事问我是不是去打了水光针...",note:"【对比概念图】枯萎玫瑰vs绽放玫瑰的对比，左冷右暖分割构图",imgPrompt:"split composition: wilted yellow rose on dark grey left vs vibrant blooming rose with water droplets on warm right, light beam divider, 85mm f/1.4, poetic transformation concept"},
  {text:"算一下哈...做一次水光针大几千？这个一盒才几十块，能用一个月！",note:"【平铺排列】面膜+计算器+硬币+干花的杂志风flat lay，俯拍清新调",imgPrompt:"curated flat lay: mask box centered, vintage calculator, gold coins, dried flowers on white marble, bright overhead light, Canon 50mm, magazine editorial style"},
  {text:"反正我已经囤了三盒了...链接放这儿了，不买也先收藏，早晚用得上！",note:"【产品英雄镜头】温暖卧室床头场景，面膜盒+台灯+牛奶，暖黄调",imgPrompt:"cozy bedside product shot, mask box next to warm lamp and milk glass, golden bedroom lighting, Sony 50mm f/1.4, hygge lifestyle aesthetic"},
];
const REFS=[
  {tag:"深夜急救 · 熬夜党自救",color:"#DC2626",bg:"#FEE2E2",dur:"45s",text:"凌晨3点刚下班...看看这张脸！还好闺蜜偷偷塞给我这个...",more:"+6个镜头"},
  {tag:"踩坑实录 · 3000块教训",color:"#2563EB",bg:"#DBEAFE",dur:"50s",text:"这3000块全是智商税！别笑，直到我在小红书刷到这个...",more:"+6个镜头"},
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

const VOICES=[
  {id:"zh-CN-XiaoxiaoNeural",name:"晓晓",gender:"女",desc:"温柔亲切，种草推荐",for:["美妆","护肤","母婴"]},
  {id:"zh-CN-XiaoyiNeural",name:"晓伊",gender:"女",desc:"活泼元气，年轻化",for:["零食","潮玩","数码"]},
  {id:"zh-CN-XiaochenNeural",name:"晓辰",gender:"女",desc:"知性专业，测评讲解",for:["科技","教育","金融"]},
  {id:"zh-CN-XiaohanNeural",name:"晓涵",gender:"女",desc:"甜美可爱，学生党",for:["美妆","服饰","文具"]},
  {id:"zh-CN-XiaomoNeural",name:"晓墨",gender:"女",desc:"成熟优雅，高端品牌",for:["奢侈品","珠宝","红酒"]},
  {id:"zh-CN-XiaoshuangNeural",name:"晓双",gender:"女",desc:"干练直爽，促单转化",for:["日用","家电","食品"]},
  {id:"zh-CN-YunxiNeural",name:"云希",gender:"男",desc:"阳光磁性，全能型",for:["数码","运动","汽车"]},
  {id:"zh-CN-YunjianNeural",name:"云健",gender:"男",desc:"沉稳权威，专业测评",for:["科技","金融","健康"]},
  {id:"zh-CN-YunxiaNeural",name:"云夏",gender:"男",desc:"年轻活力，潮流达人",for:["潮玩","游戏","电竞"]},
  {id:"zh-CN-YunyangNeural",name:"云扬",gender:"男",desc:"温暖治愈，生活方式",for:["家居","美食","旅行"]},
];
const SHOT_TAGS={hook:"黄金开头",close_up:"特写",medium:"中景",wide:"全景/远景",pov:"第一人称",aerial:"俯拍",low_angle:"仰拍",over_shoulder:"过肩"};
const CAMERA_TAGS={static:"固定",zoom_in:"推进",zoom_out:"拉远",pan_left:"左移",pan_right:"右移",breathe:"呼吸",slow_up:"上移",tracking:"跟踪"};
const LIGHT_TAGS={natural:"自然光",golden_hour:"黄金时段",high_key:"高调",low_key:"低调",rim_light:"轮廓光",neon:"霓虹",dramatic:"戏剧",soft:"柔光",spotlight:"聚光"};
const MOOD_TAGS={epic:"史诗",warm:"温暖",energetic:"活力",calm:"平静",mysterious:"神秘",luxurious:"奢华",playful:"俏皮",professional:"专业",urgent:"紧迫"};

// Sidebar navigation structure
const NAV=[
  {group:"",items:[{k:"dash",icon:<I.Grid/>,label:"工作台"}]},
  {group:"AI 创作",items:[
    {k:"aicreate",icon:<I.Sparkle/>,label:"AI创作",accent:true,action:"modal"},
    // {k:"comic-drama",icon:<I.Camera/>,label:"漫剧生成"},
    // {k:"storyboard-wb",icon:<I.Layers/>,label:"分镜工作台"},
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
  const activeCreatePg=useRef(null); // tracks ongoing creation: "create" or "create-deep"
  const [modal,setModal]=useState(false);
  const [mStep,setMStep]=useState(0);
  const [mMode,setMMode]=useState("quick");
  const [selTmpl,setSelTmpl]=useState(null);
  const [cs,setCs]=useState("results");
  const [prod,setProd]=useState("面膜");
  const [cat,setCat]=useState("美妆护肤");
  const [dur,setDur]=useState("30秒");
  const [prodImages,setProdImages]=useState([]); // 用户上传的产品实拍图(data URI)
  const [prodDesc,setProdDesc]=useState(""); // 用户填写的产品描述/卖点
  const [charRefImg,setCharRefImg]=useState(null); // AI生成的主角参考图(URL)
  const [avatarOn,setAvatarOn]=useState(false);
  const [avatarSel,setAvatarSel]=useState(null); // selected preset avatar object {id,nm,imgUrl,imgPrompt,...}
  const AVATAR_PRESETS = [
    { id: "p1", nm: "商务男", tags: "商务·专业", imgUrl: "/avatars/p1.png", imgPrompt: "Portrait photo of a 32 year old Chinese man in a dark navy suit and light blue shirt, natural indoor lighting, relaxed confident smile, looking at camera, head and shoulders" },
    { id: "p2", nm: "知性女", tags: "知性·优雅", imgUrl: "/avatars/p2.png", imgPrompt: "Portrait photo of a 30 year old Chinese woman wearing a beige knit cardigan over white top, soft natural daylight, gentle warm smile, looking at camera, head and shoulders" },
    { id: "p3", nm: "活力少女", tags: "青春·活泼", imgUrl: "/avatars/p3.png", imgPrompt: "Portrait photo of a 22 year old Chinese girl wearing a simple white t-shirt, bright natural daylight, big genuine smile, looking at camera, head and shoulders" },
    { id: "p4", nm: "儒雅大叔", tags: "稳重·信赖", imgUrl: "/avatars/p4.png", imgPrompt: "Portrait photo of a 45 year old Chinese man wearing thin metal frame glasses and a charcoal crew neck sweater, warm indoor lighting, kind smile, looking at camera, head and shoulders" },
    { id: "p5", nm: "甜美主播", tags: "甜美·带货", imgUrl: "/avatars/p5.png", imgPrompt: "Portrait photo of a 26 year old Chinese woman wearing a soft pink blouse, ring light setup, clean skin with light makeup, sweet friendly smile, looking at camera, head and shoulders" },
  ];
  const [dataOn,setDataOn]=useState(true);
  const [adopted,setAdopted]=useState(null);
  const [showSc,setShowSc]=useState(false);
  const [editIdx,setEditIdx]=useState(null);
  const [sbEdit,setSbEdit]=useState(null);
  const [histTab,setHistTab]=useState(0);
  const [vgPct,setVgPct]=useState(0);
  const [vgStep,setVgStep]=useState(0);
  const [sbShots,setSbShots]=useState([]);
  const [sbGenStatus,setSbGenStatus]=useState("");
  const [finalVideoUrl,setFinalVideoUrl]=useState(null);
  const [sbImgBusy,setSbImgBusy]=useState(false);
  const [vidGenBusy,setVidGenBusy]=useState(false);
  const isCreating=cs==="ai-generating"||vidGenBusy;
  const [avatarPreviewImgs,setAvatarPreviewImgs]=useState([]); // 数字人展示图预览
  const [avatarCleanProdImg,setAvatarCleanProdImg]=useState(null); // 产品精修图
  const [avatarSelIdx,setAvatarSelIdx]=useState(0); // 用户选择的首帧索引
  const [sbVoice,setSbVoice]=useState("zh-CN-XiaoxiaoNeural");
  const [sbElapsed,setSbElapsed]=useState(0);
  const [anaTab,setAnaTab]=useState(2);
  useEffect(()=>{if(cs==="storyboard"&&sbShots.length===0&&adopted?.table?.length>0){buildSbShots();}},[cs]);
  const [pi,setPi]=useState("");
  const [tTab,setTTab]=useState("KOL风格");
  const [fp,setFp]=useState("全部");
  const [aiTemplates,setAiTemplates]=useState(()=>{try{const raw=JSON.parse(localStorage.getItem("aiTmpls")||"[]");return raw.flatMap(x=>x.templates?x.templates.map(t=>({_creator:x.name||x._creator,...t})):[x]);}catch{return [];}});
  const [libSelTmpl,setLibSelTmpl]=useState(null);
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
  const [creationHistory,setCreationHistory]=useState(()=>{try{return JSON.parse(localStorage.getItem("creationHistory")||"[]");}catch{return[];}});
  const saveToHistory=(scripts,meta={})=>{
    const record={id:Date.now(),time:new Date().toISOString(),prod:meta.prod||prod,cat:meta.cat||cat,dur:meta.dur||dur,mode:meta.mode||"quick",scripts:scripts.map(s=>({name:s.name,dur:s.dur,shots:s.shots,sell:s.sell,desc:s.desc,badges:s.badges,logic:s.logic,table:s.table,visual_anchor:s.visual_anchor,_avatarData:s._avatarData}))};
    setCreationHistory(prev=>{const next=[record,...prev].slice(0,50);localStorage.setItem("creationHistory",JSON.stringify(next));return next;});
  };
  const restoreFromHistory=(record)=>{
    if(activeCreatePg.current&&isCreating){
      if(!window.confirm("当前有内容正在生成中，加载历史记录会中断当前任务。确定要继续吗？"))return;
    }
    setProd(record.prod||"");setCat(record.cat||"");setDur(record.dur||"30秒");
    const isAvatar=record.mode==="avatar";
    setAvatarOn(isAvatar);
    if(isAvatar){
      const avatarData=record.scripts?.[0]?._avatarData;
      if(avatarData?.avatarSel)setAvatarSel(avatarData.avatarSel);
    }
    const scripts=record.scripts.map((s,i)=>({...s,id:i+1,badges:s.badges||[],logic:s.logic||[],table:s.table||[]}));
    setAiScripts(scripts);setPg("create");setCs("results");activeCreatePg.current="create";
  };
  const deleteHistoryItem=(id)=>{setCreationHistory(prev=>{const next=prev.filter(r=>r.id!==id);localStorage.setItem("creationHistory",JSON.stringify(next));return next;});};
  const clearHistory=()=>{if(window.confirm("确认清空所有创作历史？此操作不可恢复。")){setCreationHistory([]);localStorage.removeItem("creationHistory");}};

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
  // hotbreak analysis state
  const [hotBusy,setHotBusy]=useState(false);
  const [hotStep,setHotStep]=useState("");
  const [hotResult,setHotResult]=useState(null);
  const [hotError,setHotError]=useState("");
  const [hotScripts,setHotScripts]=useState(null);
  // pos360 analysis state
  const [posBusy,setPosBusy]=useState(false);
  const [posStep,setPosStep]=useState("");
  const [posResult,setPosResult]=useState(null);
  const [posError,setPosError]=useState("");
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
  // xhs generator
  const [xhsProd,setXhsProd]=useState("");
  const [xhsAudience,setXhsAudience]=useState("");
  const [xhsSelling,setXhsSelling]=useState("");
  const [xhsBusy,setXhsBusy]=useState(false);
  const [xhsPhase,setXhsPhase]=useState(""); // ""→search→analyzed→generate→done
  const [xhsAnalysis,setXhsAnalysis]=useState(null);
  const [xhsAnalysisText,setXhsAnalysisText]=useState("");
  const [xhsRecStyles,setXhsRecStyles]=useState([]);
  const [xhsSelStyles,setXhsSelStyles]=useState([]);
  const [xhsNotes,setXhsNotes]=useState([]);
  const [xhsSel,setXhsSel]=useState(0);
  const [xhsEditIdx,setXhsEditIdx]=useState(-1);
  // douyin generator
  const [dyProd,setDyProd]=useState("");
  const [dyAudience,setDyAudience]=useState("");
  const [dySelling,setDySelling]=useState("");
  const [dyBusy,setDyBusy]=useState(false);
  const [dyPhase,setDyPhase]=useState(""); // ""→search→analyzed→generate→done
  const [dyAnalysis,setDyAnalysis]=useState(null);
  const [dyAnalysisText,setDyAnalysisText]=useState("");
  const [dyRecStyles,setDyRecStyles]=useState([]);
  const [dySelStyles,setDySelStyles]=useState([]);
  const [dyNotes,setDyNotes]=useState([]);
  const [dySel,setDySel]=useState(0);
  const [dyEditIdx,setDyEditIdx]=useState(-1);
  // wechat generator
  const [wxProd,setWxProd]=useState("");
  const [wxAudience,setWxAudience]=useState("");
  const [wxSelling,setWxSelling]=useState("");
  const [wxBusy,setWxBusy]=useState(false);
  const [wxPhase,setWxPhase]=useState(""); // ""→search→analyzed→generate→done
  const [wxAnalysis,setWxAnalysis]=useState(null);
  const [wxAnalysisText,setWxAnalysisText]=useState("");
  const [wxRecStyles,setWxRecStyles]=useState([]);
  const [wxSelStyles,setWxSelStyles]=useState([]);
  const [wxArticles,setWxArticles]=useState([]);
  const [wxSel,setWxSel]=useState(0);
  const [wxEditIdx,setWxEditIdx]=useState(-1);
  // schedule page
  const [schMonth,setSchMonth]=useState(new Date().getMonth());
  const [schYear,setSchYear]=useState(new Date().getFullYear());
  const [schModal,setSchModal]=useState(false);
  const [schTab,setSchTab]=useState(0);
  const [schColor,setSchColor]=useState(0);
  // schedule backend state
  const [schTasks,setSchTasks]=useState([]);
  const [schAccounts,setSchAccounts]=useState([]);
  const [schStats,setSchStats]=useState({total:0,published:0,pending:0,failed:0,running:0,completion_rate:0});
  const [schSelAccounts,setSchSelAccounts]=useState([]);
  const [schTitle,setSchTitle]=useState("");
  const [schDesc,setSchDesc]=useState("");
  const [schDate,setSchDate]=useState(()=>{const d=new Date();return d.toISOString().slice(0,10)});
  const [schTime,setSchTime]=useState("18:00");
  const [schFiles,setSchFiles]=useState([]);
  const [schContentType,setSchContentType]=useState("image"); // image/video/article
  const [schAuthor,setSchAuthor]=useState(""); // 公众号文章作者
  const [schImgPos,setSchImgPos]=useState("end"); // start=图片在正文前 / end=图片在正文后
  const [schAutoPublish,setSchAutoPublish]=useState(true); // true=AI自动发布 false=仅记录
  const [schPlatBtns,setSchPlatBtns]=useState([false,false,false,false]); // 抖快红微
  const [schPublishing,setSchPublishing]=useState(false);
  const [schQrModal,setSchQrModal]=useState(null); // account id or null
  const [schQrImg,setSchQrImg]=useState("");
  const [schQrStatus,setSchQrStatus]=useState("");
  const [schAiTimes,setSchAiTimes]=useState([]);
  const [schTaskLogs,setSchTaskLogs]=useState([]);
  const [schLogModal,setSchLogModal]=useState(null); // task id or null
  const [schAcctModal,setSchAcctModal]=useState(false);
  const [schNewAcctPlat,setSchNewAcctPlat]=useState("xiaohongshu");
  const [schNewAcctName,setSchNewAcctName]=useState("");
  const schPlatMap=["douyin","kuaishou","xiaohongshu","wechat"];
  const schPlatLabels=["抖音","快手","小红书","公众号"];
  const schFileRef=useRef(null);
  // schedule data fetching
  const schFetchAll=async()=>{
    const m=`${schYear}-${String(schMonth+1).padStart(2,'0')}`;
    try{
      const [tRes,aRes,sRes]=await Promise.all([
        fetch(`/schedule-api/tasks?month=${m}`).then(r=>r.json()),
        fetch('/schedule-api/accounts').then(r=>r.json()),
        fetch(`/schedule-api/stats/monthly?month=${m}`).then(r=>r.json()),
      ]);
      setSchTasks(Array.isArray(tRes)?tRes:[]);
      setSchAccounts(Array.isArray(aRes)?aRes:[]);
      if(sRes&&typeof sRes.total==='number')setSchStats(sRes);
    }catch(e){console.log('[schedule] fetch error:',e.message)}
  };
  useEffect(()=>{if(pg==="schedule")schFetchAll();},[pg,schMonth,schYear]);
  // 抖音/快手视频不需要标题，只需文案；小红书/公众号始终需要标题
  const schNeedTitle=schPlatBtns[2]||schPlatBtns[3]; // 小红书 or 公众号
  const schIsWxArticle=schPlatBtns[3]&&schContentType==="article"; // 微信公众号文章模式
  const schDescPlaceholder=schIsWxArticle?"输入文章正文，支持多段落排版...":!schPlatBtns[2]&&!schPlatBtns[3]&&(schPlatBtns[0]||schPlatBtns[1])?"输入视频文案，可添加 #话题标签 @好友...":"输入正文内容，好的内容是获得流量的关键...";
  const schDescMax=schIsWxArticle?20000:schPlatBtns[0]&&!schPlatBtns[2]&&!schPlatBtns[3]?2200:1000;
  const schCreateTask=async()=>{
    const selPlats=schPlatBtns.map((on,i)=>on?schPlatMap[i]:null).filter(Boolean);
    if(!selPlats.length)return alert("请选择至少一个发布平台");
    if(!schSelAccounts.length)return alert("请选择至少一个发布账号");
    if(schNeedTitle&&!schTitle.trim())return alert("请输入标题");
    if(!schNeedTitle&&!schDesc.trim())return alert("请输入视频文案");
    if(schAutoPublish&&schTab!==1&&schContentType!=="article"&&schFiles.length===0)return alert(schContentType==="video"?"请上传视频文件":"请上传至少一张素材图片");
    const dt=`${schDate}T${schTime}:00`;
    const selTime=new Date(dt);const nowTime=new Date();
    if(schAutoPublish&&selTime<=nowTime)return alert("发布时间必须在当前时间之后");
    if(schAutoPublish&&selTime>new Date(Date.now()+14*86400000))return alert("定时发布仅支持14天内，请重新选择时间");
    setSchPublishing(true);
    try{
      const mediaPaths=schFiles.map(f=>f.serverPath).filter(Boolean);
      // For WeChat article mode: separate cover and inline images by _role
      let coverPath="";
      let taskMediaPaths=mediaPaths;
      if(schIsWxArticle){
        const coverFile=schFiles.find(f=>f._role==="cover");
        const inlineFiles=schFiles.filter(f=>f._role==="inline");
        coverPath=coverFile?.serverPath||"";
        // media_paths = cover (if any) + inline images
        taskMediaPaths=[coverPath,...inlineFiles.map(f=>f.serverPath)].filter(Boolean);
      }
      for(const aid of schSelAccounts){
        const acct=schAccounts.find(a=>a.id===Number(aid));
        if(!acct){continue;}
        if(!selPlats.includes(acct.platform)){continue;}
        await fetch('/schedule-api/tasks',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
          account_id:acct.id,platform:acct.platform,content_type:schContentType,title:schTitle,content:schDesc,
          scheduled_at:dt,color:["#3B82F6","#10B981","#7C3AED","#F97316","#F43F5E","#6B7280"][schColor],
          category:["sell","edu","story","daily","hot","other"][schColor],
          media_paths:taskMediaPaths,cover_path:coverPath,img_position:schImgPos,auto_publish:schAutoPublish,tags:[],
        })});
      }
      setSchModal(false);setSchTitle("");setSchDesc("");setSchFiles([]);setSchContentType("image");setSchSelAccounts([]);setSchAuthor("");setSchImgPos("end");setSchAutoPublish(true);
      schFetchAll();
    }catch(e){alert("创建失败: "+e.message)}
    setSchPublishing(false);
  };
  const schDeleteTask=async(id)=>{await fetch(`/schedule-api/tasks/${id}`,{method:'DELETE'});schFetchAll();};
  const schPublishNow=async(id)=>{await fetch(`/schedule-api/tasks/${id}/publish-now`,{method:'POST'});schFetchAll();};
  const schSetStatus=async(id,status)=>{await fetch(`/schedule-api/tasks/${id}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({status})});schFetchAll();};
  const schUploadFile=async(file)=>{
    const fd=new FormData();fd.append('file',file);
    const r=await fetch('/schedule-api/tasks/upload-media',{method:'POST',body:fd});
    const d=await r.json();
    return d.path;
  };
  const schHandleFiles=async(e)=>{
    const files=Array.from(e.target.files);
    const uploaded=[];
    for(const f of files){
      const serverPath=await schUploadFile(f);
      uploaded.push({name:f.name,serverPath,preview:URL.createObjectURL(f)});
    }
    setSchFiles(prev=>[...prev,...uploaded]);
  };
  const schStartLogin=async(acctId)=>{
    setSchQrModal(acctId);setSchQrStatus("loading");
    try{
      const r=await fetch(`/schedule-api/accounts/${acctId}/login`,{method:'POST'});
      const d=await r.json();
      setSchQrImg(d.screenshot||"");setSchQrStatus("qr_ready");
      // Start polling
      const poll=setInterval(async()=>{
        try{
          const sr=await fetch(`/schedule-api/accounts/${acctId}/login-status`);
          const sd=await sr.json();
          if(sd.status==="logged_in"){clearInterval(poll);setSchQrStatus("done");schFetchAll();setTimeout(()=>setSchQrModal(null),1500);}
          else if(sd.status==="waiting"&&sd.screenshot)setSchQrImg(sd.screenshot);
          else if(sd.status==="error"){clearInterval(poll);setSchQrStatus("error");}
        }catch{}
      },3000);
    }catch(e){setSchQrStatus("error")}
  };
  const schAddAccount=async()=>{
    if(!schNewAcctName.trim())return;
    await fetch('/schedule-api/accounts',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({platform:schNewAcctPlat,nickname:schNewAcctName})});
    setSchNewAcctName("");setSchAcctModal(false);schFetchAll();
  };
  const schDeleteAccount=async(id)=>{await fetch(`/schedule-api/accounts/${id}`,{method:'DELETE'});schFetchAll();};
  const [schExpandedDays,setSchExpandedDays]=useState({});
  const [schAiLoading,setSchAiLoading]=useState(false);
  const [schAiAnalysis,setSchAiAnalysis]=useState(null);
  const schGetAiTime=async()=>{
    const plat=schPlatBtns.findIndex(Boolean);
    const platName=plat>=0?schPlatMap[plat]:"xiaohongshu";
    if(!schTitle.trim()&&!schDesc.trim()){return alert(schNeedTitle?"请先填写标题或内容，AI将根据内容智能推荐发布时间":"请先填写视频文案，AI将根据内容智能推荐发布时间")}
    setSchAiLoading(true);setSchAiAnalysis(null);setSchAiTimes([]);
    try{
      const r=await fetch('/schedule-api/ai/recommend-time',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({platform:platName,category:["sell","edu","story","daily","hot","other"][schColor],title:schTitle,content:schDesc})});
      const d=await r.json();
      setSchAiTimes(d.recommendations||[]);
      setSchAiAnalysis({type:d.content_type||"",audience:d.target_audience||""});
    }catch{setSchAiTimes([])}
    setSchAiLoading(false);
  };
  const schGetTasksForDay=(day)=>schTasks.filter(t=>{if(!t.scheduled_at)return false;const d=new Date(t.scheduled_at);return d.getDate()===day&&d.getMonth()===schMonth&&d.getFullYear()===schYear;});
  const schTodayTasks=schGetTasksForDay(new Date().getDate());
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
  const [ipMode,setIpMode]=useState("text"); // "text" or "voice"
  // Voice interview states
  const [voiceState,setVoiceState]=useState("idle"); // idle|connecting|ai_speaking|user_speaking|thinking
  const [voicePhase,setVoicePhase]=useState("background");
  const [voiceTranscript,setVoiceTranscript]=useState([]);
  const [voiceMuted,setVoiceMuted]=useState(false);
  const [voiceDuration,setVoiceDuration]=useState("00:00");
  const [voiceShowLog,setVoiceShowLog]=useState(false);
  const [wsConnected,setWsConnected]=useState(false);
  const wsRef=useRef(null);
  const voiceMutedRef=useRef(false);
  const voiceStateRef=useRef("idle");
  const audioCtxPlayRef=useRef(null);
  const nextPlayTimeRef=useRef(0);
  const mediaStreamRef=useRef(null);
  const audioCtxRecRef=useRef(null);
  const recNodeRef=useRef(null);
  const durationTimerRef=useRef(null);
  const voiceStartTimeRef=useRef(null);
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
  // Voice interview: sync refs with state
  useEffect(()=>{voiceMutedRef.current=voiceMuted;},[voiceMuted]);
  useEffect(()=>{voiceStateRef.current=voiceState;},[voiceState]);

  const playPcm16Base64=(base64Chunk)=>{
    if(!audioCtxPlayRef.current){audioCtxPlayRef.current=new AudioContext({sampleRate:24000});nextPlayTimeRef.current=0;}
    try{
      const binary=atob(base64Chunk);const bytes=new Uint8Array(binary.length);
      for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
      const pcm16=new Int16Array(bytes.buffer);const float32=new Float32Array(pcm16.length);
      for(let i=0;i<pcm16.length;i++)float32[i]=pcm16[i]/32768.0;
      const ctx=audioCtxPlayRef.current;const buffer=ctx.createBuffer(1,float32.length,24000);
      buffer.getChannelData(0).set(float32);
      const now=ctx.currentTime;const startTime=Math.max(now,nextPlayTimeRef.current);
      nextPlayTimeRef.current=startTime+buffer.duration;
      const src=ctx.createBufferSource();src.buffer=buffer;src.connect(ctx.destination);src.start(startTime);
    }catch(e){console.error("Audio playback error:",e);}
  };

  const voiceCleanup=()=>{
    if(recNodeRef.current){try{recNodeRef.current.disconnect();}catch(e){}recNodeRef.current=null;}
    mediaStreamRef.current?.getTracks().forEach(t=>t.stop());mediaStreamRef.current=null;
    if(audioCtxRecRef.current){try{audioCtxRecRef.current.close();}catch(e){}audioCtxRecRef.current=null;}
    if(wsRef.current){try{wsRef.current.close();}catch(e){}wsRef.current=null;}
    setWsConnected(false);
    if(durationTimerRef.current){clearInterval(durationTimerRef.current);durationTimerRef.current=null;}
    if(audioCtxPlayRef.current){try{audioCtxPlayRef.current.close();}catch(e){}audioCtxPlayRef.current=null;}
    setVoiceState("idle");
  };

  const startVoiceMic=async(wsSend)=>{
    const SR=24000,BS=2400;
    const stream=await navigator.mediaDevices.getUserMedia({audio:{sampleRate:SR,channelCount:1,echoCancellation:true,noiseSuppression:true}});
    mediaStreamRef.current=stream;
    const ctx=new AudioContext({sampleRate:SR});audioCtxRecRef.current=ctx;
    const source=ctx.createMediaStreamSource(stream);
    const sendChunk=(base64)=>{if(!voiceMutedRef.current&&voiceStateRef.current!=='ai_speaking')wsSend({type:'audio',data:base64});};
    let ok=false;
    try{
      const code=`class P extends AudioWorkletProcessor{constructor(){super();this._b=new Float32Array(${BS});this._o=0;}process(inputs){const ch=inputs[0]?.[0];if(!ch)return true;for(let i=0;i<ch.length;i++){this._b[this._o++]=ch[i];if(this._o>=${BS}){const p=new Int16Array(${BS});for(let j=0;j<${BS};j++){const s=Math.max(-1,Math.min(1,this._b[j]));p[j]=s<0?s*0x8000:s*0x7FFF;}this.port.postMessage(p.buffer,[p.buffer]);this._b=new Float32Array(${BS});this._o=0;}}return true;}}registerProcessor('ac',P);`;
      const blob=new Blob([code],{type:'application/javascript'});const url=URL.createObjectURL(blob);
      await ctx.audioWorklet.addModule(url);URL.revokeObjectURL(url);
      const wn=new AudioWorkletNode(ctx,'ac');
      wn.port.onmessage=(e)=>{const u8=new Uint8Array(e.data);let b='';for(let i=0;i<u8.length;i++)b+=String.fromCharCode(u8[i]);sendChunk(btoa(b));};
      source.connect(wn);const g=ctx.createGain();g.gain.value=0;wn.connect(g);g.connect(ctx.destination);
      recNodeRef.current=wn;ok=true;
    }catch(e){console.warn("AudioWorklet unavailable, fallback to ScriptProcessor");}
    if(!ok){
      const sn=ctx.createScriptProcessor(4096,1,1);
      sn.onaudioprocess=(e)=>{
        const f=e.inputBuffer.getChannelData(0);const p=new Int16Array(f.length);
        for(let i=0;i<f.length;i++){const s=Math.max(-1,Math.min(1,f[i]));p[i]=s<0?s*0x8000:s*0x7FFF;}
        const u8=new Uint8Array(p.buffer);let b='';for(let i=0;i<u8.byteLength;i++)b+=String.fromCharCode(u8[i]);sendChunk(btoa(b));
      };
      source.connect(sn);const g=ctx.createGain();g.gain.value=0;sn.connect(g);g.connect(ctx.destination);
      recNodeRef.current=sn;
    }
  };

  const startVoiceInterview=()=>{
    if(!ipName||!ipIndustry){alert("请先填写姓名和行业信息");setIpStep(1);return;}
    setVoiceState("connecting");setVoiceTranscript([]);setVoiceMuted(false);setVoicePhase("background");setVoiceDuration("00:00");
    const protocol=location.protocol==='https:'?'wss:':'ws:';
    const ws=new WebSocket(`${protocol}//${location.host}/api/ip-studio/interview/live`);
    wsRef.current=ws;
    const wsSend=(data)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(data));};
    ws.onopen=()=>{wsSend({type:'init',name:ipName,industry:ipIndustry,role:ipRole||'创始人'});};
    ws.onmessage=(event)=>{
      try{const data=JSON.parse(event.data);
        switch(data.type){
          case 'connected':
            setVoiceState("idle");setWsConnected(true);
            voiceStartTimeRef.current=Date.now();
            durationTimerRef.current=setInterval(()=>{
              const sec=Math.floor((Date.now()-(voiceStartTimeRef.current||Date.now()))/1000);
              setVoiceDuration(`${String(Math.floor(sec/60)).padStart(2,'0')}:${String(sec%60).padStart(2,'0')}`);
            },1000);
            startVoiceMic(wsSend).catch(()=>alert("麦克风权限获取失败"));
            break;
          case 'ai_speaking_start':setVoiceState("ai_speaking");break;
          case 'ai_audio':playPcm16Base64(data.data);break;
          case 'ai_speaking_done':setVoiceState(p=>p==="ai_speaking"?"idle":p);break;
          case 'user_speaking_start':setVoiceState("user_speaking");break;
          case 'user_speaking_done':setVoiceState("thinking");break;
          case 'transcript':if(data.text?.trim())setVoiceTranscript(p=>[...p,{role:data.role,text:data.text}]);break;
          case 'phase_change':
            setVoicePhase(data.phase);
            setVoiceTranscript(p=>[...p,{role:'phase',text:data.message||`进入${data.phase}阶段`}]);break;
          case 'interview_done':
            voiceCleanup();
            if(data.chat_history){
              fetch('/api/ip-studio/interview/finalize',{method:'POST',headers:{'Content-Type':'application/json'},
                body:JSON.stringify({name:ipName,industry:ipIndustry,role:ipRole||'创始人',chat_history:data.chat_history})
              }).then(r=>r.json()).then(res=>{
                if(res.success&&res.profile){const p=res.profile;
                  setIpProfile({field:p.industry_segment||p.industry||'',biz:p.core_business||'',clients:p.target_audience||'',
                    duty:p.role_description||p.role||'',scale:p.company_scale||'',stance:p.ip_positioning||'',
                    think:(p.content_pillars||[]).join('、')||'',style:p.voice_fingerprint?.口头禅||p.voice_fingerprint?.表达特征||''});}
                setIpStep(3);
              }).catch(()=>setIpStep(3));
            }else{setIpStep(3);}
            break;
          case 'error':alert(data.message||"语音访谈出错");setVoiceState("idle");break;
        }
      }catch(e){}
    };
    ws.onerror=()=>{alert("语音连接出错");setVoiceState("idle");};
    ws.onclose=()=>{setWsConnected(false);};
  };

  const voiceToggleMute=()=>{setVoiceMuted(p=>!p);};
  const voiceEndCall=()=>{
    if(!confirm("确定结束通话吗？访谈记录将被保存。"))return;
    if(wsRef.current?.readyState===WebSocket.OPEN)wsRef.current.send(JSON.stringify({type:'end_call'}));
    setTimeout(()=>{if(wsRef.current){voiceCleanup();setIpStep(3);}},3000);
  };

  const [ci,setCi]=useState("");
  const [deepSid,setDeepSid]=useState("");
  const [msgs,setMsgs]=useState([{r:"bot",c:"你好！我是你的短视频创作顾问\n\n告诉我你想创作什么内容，或者你的产品/服务是什么——",acts:["找抖音热点","搜索爆款视频","搜小红书","帮我找灵感"]}]);
  const chatRef=useRef(null);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs]);

  const openModal=(m,lt=null)=>{setModal(true);setMStep(lt?2:m?2:0);setMMode(m||"quick");setSelTmpl(TEMPLATES[0]);setLibSelTmpl(lt);};
  const TH_KEY="k40dDp4s0V2pqHGuTJC15k36ahixSsFavT3U7EyjUv29lHOfJWWZUAqRMw==";
  const TH_H={"Authorization":"Bearer "+TH_KEY,"Content-Type":"application/json"};
  const thGet=async(ep,params)=>{const u=new URL("/tikhub-proxy"+ep,location.origin);if(params)Object.entries(params).forEach(([k,v])=>u.searchParams.set(k,v));for(let i=0;i<3;i++){try{const r=await fetch(u,{headers:TH_H});const j=await r.json();console.log("[thGet]",ep.split("/").pop(),r.status,j?.code,j?.message||"");if(r.ok)return j;}catch(e){console.log("[thGet] err",e.message);}if(i<2)await new Promise(r=>setTimeout(r,2000*(i+1)));}return null;};
  const thPost=async(ep,body)=>{for(let i=0;i<3;i++){try{const r=await fetch("/tikhub-proxy"+ep,{method:"POST",headers:TH_H,body:JSON.stringify(body)});const j=await r.json();if(r.ok)return j;}catch(e){console.log("[thPost] err",e.message);}if(i<2)await new Promise(r=>setTimeout(r,2000*(i+1)));}return null;};
  const extSteps=["解析链接","获取视频列表","获取视频详情","AI深度分析","完成"];
  const [extStepIdx,setExtStepIdx]=useState(-1);
  const [extInfo,setExtInfo]=useState("");
  const runExtract=async()=>{
    if(!extLink.trim()||!extName.trim()){alert("请填写博主链接和昵称");return;}
    setExtBusy(true);setExtStepIdx(0);setExtStep("");setExtInfo("");
    let dbg=[];
    try{
      const urlMatch=extLink.match(/https?:\/\/\S+/);let rawUrl=urlMatch?urlMatch[0].replace(/[.,，。]+$/,""):extLink.trim();
      dbg.push("URL: "+rawUrl);setExtInfo("链接: "+rawUrl.slice(0,50));
      let secUid="";
      const uidMatch=rawUrl.match(/\/user\/([A-Za-z0-9_-]{20,})/);
      if(uidMatch){secUid=uidMatch[1];dbg.push("直接解析sec_uid成功");}
      else{
        setExtInfo("展开短链接...");
        try{const ac=new AbortController();const tm=setTimeout(()=>ac.abort(),20000);const er=await fetch("/expand-url?url="+encodeURIComponent(rawUrl),{signal:ac.signal});clearTimeout(tm);const etxt=await er.text();dbg.push("展开响应["+er.status+"]: "+etxt.slice(0,150));let ej;try{ej=JSON.parse(etxt);}catch{ej={};};if(ej.url){rawUrl=ej.url;const m2=rawUrl.match(/\/user\/([A-Za-z0-9_-]{20,})/);if(m2){secUid=m2[1];dbg.push("从展开URL解析sec_uid成功");}if(!secUid&&ej.body){const m3=ej.body.match(/\/user\/([A-Za-z0-9_-]{20,})/);if(m3){secUid=m3[1];dbg.push("从body解析sec_uid成功");}const m4=ej.body.match(/sec_uid['":\s]+([A-Za-z0-9_-]{20,})/);if(!secUid&&m4){secUid=m4[1];dbg.push("从body字段解析sec_uid成功");}}}}catch(ex){dbg.push("展开失败: "+ex.message);}
        if(!secUid){setExtInfo("通过TikHub API解析...");
          const findUid=(obj)=>{if(!obj||typeof obj!=="object")return"";if(typeof obj.sec_uid==="string"&&obj.sec_uid.length>15)return obj.sec_uid;for(const v of Object.values(obj)){const r=findUid(v);if(r)return r;}return"";};
          for(const ep of["/api/v1/douyin/web/fetch_user_profile_by_url","/api/v1/douyin/app/v3/fetch_user_profile_by_url"]){const epName=ep.split("/").pop();setExtInfo("API: "+epName);
            try{const u=new URL("/tikhub-proxy"+ep,location.origin);u.searchParams.set("url",rawUrl);const r=await fetch(u,{headers:TH_H});const txt=await r.text();dbg.push(epName+" ["+r.status+"]: "+txt.slice(0,200));if(r.ok){try{const d=JSON.parse(txt);secUid=findUid(d);if(secUid){dbg.push("sec_uid: "+secUid);break;}}catch{dbg.push("JSON解析失败");}}}catch(e){dbg.push(epName+" 请求失败: "+e.message);}}}
      }
      if(!secUid){setExtStep("err:无法解析博主链接\n"+dbg.join("\n"));setExtBusy(false);return;}
      setExtStepIdx(1);setExtInfo("");
      let videoIds=[];let cursor=0;
      for(const ep of["/api/v1/douyin/web/fetch_user_post_videos","/api/v1/douyin/app/v3/fetch_user_post_videos"]){
        videoIds=[];cursor=0;
        while(videoIds.length<50){const d=await thGet(ep,{sec_user_id:secUid,count:Math.min(20,50-videoIds.length),max_cursor:cursor});if(!d)break;const items=(d.data||{}).aweme_list||[];if(!items.length)break;for(const it of items){const aid=it.aweme_id||it.video?.vid||"";if(aid)videoIds.push({id:String(aid),title:(it.desc||"").trim(),digg:(it.statistics||{}).digg_count||0,comment:(it.statistics||{}).comment_count||0,share:(it.statistics||{}).share_count||0});}setExtInfo("已获取 "+videoIds.length+" 条...");if(!d.data?.has_more)break;cursor=d.data?.max_cursor||0;await new Promise(r=>setTimeout(r,800));}
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
      const resp=await fetch("/blt-proxy/v1/chat/completions",{method:"POST",headers:API_HDRS,body:JSON.stringify({model:"gemini-2.5-pro",messages:[{role:"system",content:"你是一位短视频内容模式识别专家。从真实数据中提炼创作模板。只输出JSON。"},{role:"user",content:analyzePrompt}],temperature:0.3,response_format:{type:"json_object"}})});
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
  // ═══ 统一 LLM 调用 ═══
  const API_HDRS={"Content-Type":"application/json","Authorization":"Bearer sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe"};
  const callLLM=async({model="gemini-2.5-flash",messages,system,prompt,temperature=0.7,maxTokens=8192,jsonMode=false,retries=2,enableSearch=false})=>{
    const msgs=messages||[...(system?[{role:"system",content:system}]:[]),{role:"user",content:prompt}];
    const body={model,messages:msgs,temperature,max_tokens:maxTokens};
    if(jsonMode)body.response_format={type:"json_object"};
    if(enableSearch){body.enable_search=true;body.search_options={search_strategy:"max"};}
    for(let attempt=0;attempt<=retries;attempt++){
      try{
        const resp=await fetch("/blt-proxy/v1/chat/completions",{method:"POST",headers:API_HDRS,body:JSON.stringify(body)});
        if(!resp.ok){const t=await resp.text();throw new Error(`API ${resp.status}: ${t.slice(0,200)}`);}
        const data=await resp.json();
        const content=data.choices?.[0]?.message?.content||"";
        if(!content)throw new Error("Empty response");
        return content;
      }catch(e){
        if(attempt===retries)throw e;
        await new Promise(r=>setTimeout(r,1000*(attempt+1)));
      }
    }
  };
  const extractJSON=(raw)=>{
    const cleaned=raw.replace(/```json?\s*/g,"").replace(/```\s*$/g,"").trim();
    try{return JSON.parse(cleaned);}catch{}
    const m=cleaned.match(/\{[\s\S]*\}/);
    if(m){try{return JSON.parse(m[0]);}catch{}}
    if(m){let fixed=m[0].replace(/,\s*([}\]])/g,"$1");try{return JSON.parse(fixed);}catch{}}
    return null;
  };
  const generateJSON=async(opts)=>{
    for(let i=0;i<3;i++){
      try{
        const raw=await callLLM({...opts,jsonMode:i===0}); // 第2、3次不强制JSON模式
        console.log(`[generateJSON] attempt ${i+1}, raw length: ${raw?.length}, first 200: ${raw?.slice(0,200)}`);
        const parsed=extractJSON(raw);
        if(parsed)return parsed;
        console.warn(`[generateJSON] attempt ${i+1} parse failed, raw: ${raw?.slice(0,500)}`);
      }catch(e){
        console.error(`[generateJSON] attempt ${i+1} error:`,e.message);
        if(i===2)throw e;
      }
      opts={...opts,temperature:Math.max(0.1,(opts.temperature||0.7)-0.2)};
    }
    throw new Error("JSON解析失败，请重试");
  };
  // ═══ Storyboard helpers ═══
  const BLT_KEY="sk-Nv52MunZZDBX0uiDD0RlrDvG9E2OaNlhiiJoTQKDn0Sd5uJe";
  const BLT_HDRS={"Content-Type":"application/json","Authorization":"Bearer "+BLT_KEY};
  // 速创API (11 video models: Sora2, Veo3, Kling, Jimeng, Runway, etc.)
  const SC_KEY="Q0X6CV17w4th5qwBxxaKAcjatj";
  const SC_MODELS={
    "veo3.1-fast":{submit:"/api/veo3.1-fast/submit",query:"/api/veo3.1-fast/detail",dur:[8,12],cost:1.5},
    "kling":{submit:"/api/kling/submit",query:"/api/kling/detail",dur:[10,15],cost:2.0},
    "jimeng":{submit:"/api/jimeng/submit",query:"/api/jimeng/detail",dur:[10,15],cost:1.8},
    "sora2-new":{submit:"/api/sora2-new/submit",query:"/api/sora2-new/detail",dur:[10,15],cost:2.5},
    "pixverse":{submit:"/api/pixverse/submit",query:"/api/pixverse/detail",dur:[8,12],cost:1.2},
  };
  const scSubmit=async(modelId,prompt,duration=10)=>{
    const m=SC_MODELS[modelId];if(!m)throw new Error("未知模型:"+modelId);
    const dur=m.dur.reduce((a,b)=>Math.abs(b-duration)<Math.abs(a-duration)?b:a);
    const r=await fetch(`/suchuang-proxy${m.submit}?key=${SC_KEY}`,{method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},body:new URLSearchParams({prompt,duration:String(dur),aspectRatio:"9:16",size:"small"})});
    if(!r.ok)throw new Error("速创API HTTP "+r.status);
    const j=await r.json();if(j.code!==200)throw new Error(j.msg||"速创提交失败");
    return j.data?.id;
  };
  const scPoll=async(modelId,taskId)=>{
    const m=SC_MODELS[modelId];if(!m)throw new Error("未知模型");
    for(let i=0;i<60;i++){
      await new Promise(r=>setTimeout(r,15000));
      const r=await fetch(`/suchuang-proxy${m.query}?key=${SC_KEY}&id=${taskId}`);
      const j=await r.json();if(j.code!==200)continue;
      const st=j.data?.status;
      if(st===1)return j.data?.remote_url;
      if(st===2)throw new Error("速创生成失败");
    }
    throw new Error("速创超时");
  };
  const uploadToTmp=async(blobOrUrl,filename="file")=>{
    let blob;
    if(blobOrUrl instanceof Blob)blob=blobOrUrl;
    else{const r=await fetch(blobOrUrl);blob=await r.blob();}
    const form=new FormData();form.append("file",blob,filename);
    const up=await fetch("/tmpfiles-proxy/api/v1/upload",{method:"POST",body:form});
    if(!up.ok)throw new Error("文件上传失败");
    const j=await up.json();
    return j.data.url.replace("tmpfiles.org/","tmpfiles.org/dl/").replace("http://","https://");
  };
  const buildSbShots=()=>{
    if(!adopted?.table?.length)return;
    const shots=adopted.table.map((r,i)=>{
      let tag="medium";
      if(i===0)tag="hook";
      else if(/特写|close.?up|微距/i.test(r.scene))tag="close_up";
      else if(/全景|wide|远景|大场景/i.test(r.scene))tag="wide";
      else if(/第一人称|pov/i.test(r.scene))tag="pov";
      else if(/俯拍|aerial|鸟瞰/i.test(r.scene))tag="aerial";
      else if(/仰拍|low.?angle/i.test(r.scene))tag="low_angle";
      let camera=tag==="hook"?"zoom_in":tag==="close_up"?"breathe":tag==="wide"?"pan_right":"static";
      if(/推进|zoom.?in/i.test(r.scene))camera="zoom_in";
      else if(/拉远|zoom.?out/i.test(r.scene))camera="zoom_out";
      else if(/跟踪|tracking/i.test(r.scene))camera="tracking";
      let lighting="natural",mood="professional";
      if(/暖|温馨|warm/i.test(r.scene)){lighting="golden_hour";mood="warm";}
      else if(/酷|冷|科技|neon/i.test(r.scene)){lighting="neon";mood="energetic";}
      else if(/奢华|高端|luxur/i.test(r.scene)){lighting="dramatic";mood="luxurious";}
      else if(/紧迫|限时|urgency/i.test(r.intent||"")){mood="urgent";}
      // 智能判断shot_type：AI返回的字段 > 场景文字检测 > 默认product
      let shotType=r.shot_type||"product";
      if(shotType==="product"&&avatarOn&&/主播|博主|出镜|口播|presenter|面对镜头|对镜头|拿着.*说|举着.*说|手持.*展示/i.test(r.scene||""))shotType="presenter";
      // presenter镜头直接用avatar图，不需要AI生图
      const isPresenter=shotType==="presenter"&&avatarOn&&avatarSel;
      return{text:r.copy,scene:r.scene,dur:r.dur,intent:r.intent,tag,camera,lighting,mood,
        shotType,
        imageUrl:isPresenter?(avatarSel.imgUrl||null):null,
        imageVersions:[],audioUrl:null,videoUrl:null,imgPrompt:r.image_prompt||"",
        status:isPresenter?"approved":"pending",feedback:""};
    });
    setSbShots(shots);
    // auto-select voice based on product category
    const v=VOICES.find(v=>v.for.some(f=>cat.includes(f)));
    if(v)setSbVoice(v.id);
  };
  const genOneImage=async(prompt)=>{
    const r=await fetch("/blt-proxy/v1/images/generations",{method:"POST",headers:API_HDRS,body:JSON.stringify({model:"gpt-image-1",prompt,n:1,size:"1024x1536",quality:"high"})});
    if(!r.ok)throw new Error("图片API "+r.status);
    const buf=await r.arrayBuffer();const text=new TextDecoder().decode(buf);const d=JSON.parse(text);
    if(d.error)throw new Error(d.error.message);
    const item=d.data?.[0];
    if(item?.url)return item.url;
    if(item?.b64_json)return "data:image/png;base64,"+item.b64_json;
    throw new Error("未返回图片");
  };
  // Browser-side video composition (fallback when FFmpeg unavailable)
  const browserComposeVideo=async(clips,localAudioUrls,progressCb)=>{
    const validIdxs=clips.map((c,i)=>c.videoUrl?i:-1).filter(i=>i>=0);
    if(validIdxs.length===0)return null;
    if(validIdxs.length===1)return clips[validIdxs[0]].videoUrl;
    progressCb?.("准备浏览器端合成...");
    const videoBlobs={};
    for(let vi=0;vi<validIdxs.length;vi++){
      const i=validIdxs[vi];
      progressCb?.(`下载视频片段 ${vi+1}/${validIdxs.length}...`);
      try{
        const r=await fetch(`/proxy-download?url=${encodeURIComponent(clips[i].videoUrl)}`);
        if(!r.ok)throw new Error(`HTTP ${r.status}`);
        videoBlobs[i]=URL.createObjectURL(await r.blob());
      }catch(e){console.warn(`[browserCompose] download clip ${i} failed:`,e.message);}
    }
    const downloadedIdxs=validIdxs.filter(i=>videoBlobs[i]);
    if(downloadedIdxs.length===0)return clips[validIdxs[0]].videoUrl;
    if(downloadedIdxs.length===1){return videoBlobs[downloadedIdxs[0]];}
    const canvas=document.createElement('canvas');
    canvas.width=1080;canvas.height=1920;
    const ctx=canvas.getContext('2d');
    ctx.fillStyle='#000';ctx.fillRect(0,0,1080,1920);
    const audioCtx=new(window.AudioContext||window.webkitAudioContext)({sampleRate:44100});
    const audioDest=audioCtx.createMediaStreamDestination();
    const canvasStream=canvas.captureStream(30);
    const combinedStream=new MediaStream([...canvasStream.getVideoTracks(),...audioDest.stream.getAudioTracks()]);
    const mimeType=['video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'].find(m=>MediaRecorder.isTypeSupported(m))||'video/webm';
    const recorder=new MediaRecorder(combinedStream,{mimeType,videoBitsPerSecond:6000000});
    const chunks=[];
    recorder.ondataavailable=e=>{if(e.data.size>0)chunks.push(e.data);};
    progressCb?.("浏览器端视频合成中（实时录制）...");
    recorder.start(500);
    for(let vi=0;vi<downloadedIdxs.length;vi++){
      const i=downloadedIdxs[vi];
      const dur=clips[i].duration||5;
      progressCb?.(`合成片段 ${vi+1}/${downloadedIdxs.length} (${dur}s)...`);
      const video=document.createElement('video');
      video.playsInline=true;video.muted=true;video.preload='auto';video.src=videoBlobs[i];
      await new Promise((r,j)=>{video.oncanplay=r;video.onerror=()=>j(new Error('load'));video.load();});
      let audioSrc=null;
      const aUrl=localAudioUrls?.[i];
      if(aUrl){try{
        const aResp=await fetch(aUrl);const aBuf=await aResp.arrayBuffer();
        const decoded=await audioCtx.decodeAudioData(aBuf);
        audioSrc=audioCtx.createBufferSource();audioSrc.buffer=decoded;audioSrc.connect(audioDest);
      }catch(e){console.warn(`[browserCompose] audio ${i}:`,e.message);}}
      video.currentTime=0;await video.play();
      if(audioSrc)audioSrc.start();
      await new Promise(resolve=>{
        const t0=performance.now();
        const frame=()=>{
          const elapsed=(performance.now()-t0)/1000;
          if(elapsed>=dur){video.pause();if(audioSrc)try{audioSrc.stop();}catch(e){}resolve();return;}
          if(!video.paused&&!video.ended)ctx.drawImage(video,0,0,1080,1920);
          requestAnimationFrame(frame);
        };frame();
      });
    }
    return new Promise(resolve=>{
      recorder.onstop=()=>{
        const blob=new Blob(chunks,{type:mimeType.split(';')[0]});
        Object.values(videoBlobs).forEach(u=>URL.revokeObjectURL(u));
        audioCtx.close().catch(()=>{});
        resolve(URL.createObjectURL(blob));
      };
      recorder.stop();
    });
  };
  // Kling API helpers for digital human
  const klingCreate=async(imageUrl,prompt,aspect="9:16",duration="10")=>{
    const r=await fetch("/blt-proxy/kling/v1/videos/image2video",{method:"POST",headers:BLT_HDRS,body:JSON.stringify({model_name:"kling-v1",image:imageUrl,prompt,duration,aspect_ratio:aspect})});
    if(!r.ok)throw new Error("Kling创建失败");
    const j=await r.json();if(j.code!==0)throw new Error(j.message||"创建失败");
    return j.data.task_id;
  };
  const klingPollResult=async(taskId,path="/kling/v1/videos/image2video")=>{
    for(let i=0;i<120;i++){
      await new Promise(r=>setTimeout(r,4000));
      const r=await fetch(`/blt-proxy${path}/${taskId}`,{headers:BLT_HDRS});
      const j=await r.json();const st=j.data?.task_status;
      if(st==="succeed"){const url=j.data?.task_result?.videos?.[0]?.url;if(url)return url;throw new Error("无视频URL");}
      if(st==="failed")throw new Error(j.data?.task_status_msg||"生成失败");
    }
    throw new Error("超时");
  };
  const klingLipSync=async(videoUrl,audioUrl)=>{
    console.log("[klingLipSync] video:", videoUrl?.slice(0,80), "audio:", audioUrl?.slice(0,80));
    const r=await fetch("/blt-proxy/kling/v1/videos/lip-sync",{method:"POST",headers:BLT_HDRS,body:JSON.stringify({input:{video_url:videoUrl,audio_url:audioUrl,audio_type:"url",mode:"audio2video"}})});
    const txt=await r.text();
    console.log("[klingLipSync] response status:", r.status, "body:", txt.slice(0,500));
    if(!r.ok)throw new Error("LipSync创建失败: HTTP " + r.status + " " + txt.slice(0,200));
    const j=JSON.parse(txt);if(j.code!==0)throw new Error(j.message||"创建失败 code="+j.code);
    return j.data.task_id;
  };
  // Build visual anchor prefix from adopted script's visual_anchor field
  const getAnchorPrefix=()=>{
    const a=adopted?.visual_anchor;
    const noText="ABSOLUTE RULE: No text, no words, no letters, no labels, no logos, no watermarks, no brand names anywhere in the image. Product packaging must be completely plain with no writing.";
    if(!a)return noText+" ";
    const parts=[noText+" This is one frame from a cohesive Douyin/TikTok short video ad. All frames belong to the same video."];
    if(a.character&&a.character!=="none")parts.push(`SAME PERSON in every shot (do not change any detail): ${a.character}.`);
    if(a.product)parts.push(`SAME PRODUCT in every shot (exact same appearance): ${a.product}.`);
    if(a.setting)parts.push(`SAME LOCATION: ${a.setting}.`);
    if(a.palette)parts.push(`CONSISTENT STYLE: ${a.palette}.`);
    parts.push("Aesthetic: Douyin viral product video, real iPhone-shot feel, lifestyle vlog, NOT stock photography, NOT studio ad.");
    return parts.join(" ")+"\n\nThis specific shot: ";
  };
  const generateSbImages=async()=>{
    if(sbShots.length===0)return;
    setSbImgBusy(true);

    // Step 0: 如果有产品实拍图，用Gemini分析外观描述
    let prodImgDesc="";
    if(prodImages.length>0){
      setSbGenStatus("分析产品参考图...");
      try{
        const analysisPrompt="Look at this product image and describe the product's exact physical appearance in English for image generation consistency. Include: shape, color, material, size, packaging style. Be extremely specific. Do NOT include any text/labels you see — describe as if no text exists. 30-50 words.";
        const imgContent=[{type:"image_url",image_url:{url:prodImages[0]}},...(prodImages.length>1?[{type:"image_url",image_url:{url:prodImages[1]}}]:[]),{type:"text",text:analysisPrompt}];
        const resp=await fetch("/blt-proxy/v1/chat/completions",{method:"POST",headers:API_HDRS,body:JSON.stringify({model:"gemini-2.5-flash",messages:[{role:"user",content:imgContent}],max_tokens:200,temperature:0.3})});
        if(resp.ok){const data=await resp.json();prodImgDesc=data.choices?.[0]?.message?.content||"";}
        console.log("[SB] 产品外观描述:",prodImgDesc);
      }catch(e){console.warn("[SB] 产品图分析失败:",e.message);}
    }

    // Step 1: 生成主角参考图(保证全片人物一致) — 数字人模式下跳过
    const anchor=adopted?.visual_anchor;
    let charRef=charRefImg;
    if(!avatarOn&&!charRef&&anchor?.character&&anchor.character!=="none"){
      setSbGenStatus("生成主角形象参考图...");
      try{
        const charPrompt=`Character reference photo for short video. ${anchor.character}. In ${anchor.setting||"a clean modern room"}. ${anchor.palette||"Natural soft lighting, iPhone feel"}. Medium shot, 3/4 angle, natural smile. No text, no words, no labels, no logos anywhere.`;
        charRef=await genOneImage(charPrompt);
        setCharRefImg(charRef);
        console.log("[SB] 主角参考图OK");
      }catch(e){console.warn("[SB] 主角参考图失败:",e.message);}
    }

    setSbGenStatus("开始生成分镜图...");
    const anchorPrefix=getAnchorPrefix();
    const prodOverride=prodImgDesc?`The product looks exactly like this (from real photo): ${prodImgDesc}. `:"";

    const sem={count:0,max:3,queue:[]};
    const withSem=async(fn)=>{while(sem.count>=sem.max)await new Promise(r=>sem.queue.push(r));sem.count++;try{return await fn();}finally{sem.count--;if(sem.queue.length>0)sem.queue.shift()();}};
    let done=0;
    try{
      await Promise.all(sbShots.map((_,i)=>withSem(async()=>{
        // 数字人口播镜头：跳过生图，直接用avatar图，后续走Kling+LipSync
        if(sbShots[i].shotType==="presenter"&&avatarOn){
          // 已在buildSbShots中设置了avatarImg和approved状态，直接跳过
          done++;
          setSbGenStatus(`分镜图 ${done}/${sbShots.length} 完成（口播镜头跳过生图）`);
          return;
        }
        setSbShots(prev=>{const n=[...prev];n[i]={...n[i],status:"generating"};return n;});
        let shotPrompt=sbShots[i].imgPrompt;
        if(!shotPrompt){
          const raw=await callLLM({model:"gemini-2.5-flash",prompt:`You are a Douyin/TikTok viral video visual director. Convert this scene into an English image prompt.\n\nScene: ${sbShots[i].scene}\nProduct: ${prod} (${cat})\nShot type: ${sbShots[i].tag}\nCamera: ${sbShots[i].camera}\nMood: ${sbShots[i].mood}\n${prodImgDesc?"Product real appearance: "+prodImgDesc:""}\n\nRULES:\n1. NO text/words/letters/labels/logos/watermarks\n2. Douyin viral style, real iPhone-shot feel, lifestyle vlog\n3. Person: describe pose/action only, keep consistent with anchor\n4. Must look like screenshot from real viral short video\n5. 30-50 words, end with "no text, no labels."\n\nOutput ONLY the prompt.`,temperature:0.7,maxTokens:200});
          shotPrompt=raw.trim();
        }
        const prompt=prodOverride+anchorPrefix+shotPrompt;
        const versions=[];
        try{const url=await genOneImage(prompt);versions.push(url);}catch(e){console.error(`[SB] shot ${i+1} v1:`,e.message);}
        try{const url=await genOneImage(prompt+" Slightly different angle, same person same product same setting.");versions.push(url);}catch(e){console.error(`[SB] shot ${i+1} v2:`,e.message);}
        const best=versions[0]||null;
        setSbShots(prev=>{const n=[...prev];n[i]={...n[i],imageUrl:best,imageVersions:versions,imgPrompt:shotPrompt,status:best?"generated":"pending"};return n;});
        done++;
        setSbGenStatus(`分镜图 ${done}/${sbShots.length} 完成`);
      })));
      setSbGenStatus(`分镜图全部生成完成！${sbShots.length}张`);
    }catch(e){
      console.error("[SB] generateSbImages error:",e);
      setSbGenStatus("生成出错: "+e.message);
    }finally{
      setSbImgBusy(false);
    }
  };
  const approveFrame=(i)=>{setSbShots(prev=>{const n=[...prev];n[i]={...n[i],status:"approved"};return n;});};
  const rejectFrame=(i,fb)=>{setSbShots(prev=>{const n=[...prev];n[i]={...n[i],status:"rejected",feedback:fb||""};return n;});};
  const approveAll=()=>{setSbShots(prev=>prev.map(s=>s.status==="generated"||s.status==="rejected"?{...s,status:"approved",feedback:""}:s));};
  const pickVersion=(i,vIdx)=>{setSbShots(prev=>{const n=[...prev];n[i]={...n[i],imageUrl:n[i].imageVersions[vIdx]||n[i].imageUrl};return n;});};
  const regenFrame=async(i,feedback)=>{
    setSbShots(prev=>{const n=[...prev];n[i]={...n[i],status:"regenerating"};return n;});
    setSbImgBusy(true);setSbGenStatus(`重新生成第${i+1}张...`);
    try{
      let shotPrompt=sbShots[i].imgPrompt||"product shot, professional photography";
      if(feedback)shotPrompt+=`. User feedback: ${feedback}`;
      const url=await genOneImage(getAnchorPrefix()+shotPrompt);
      setSbShots(prev=>{const n=[...prev];n[i]={...n[i],imageUrl:url,imageVersions:[...n[i].imageVersions,url],status:"generated",feedback:feedback||""};return n;});
      setSbGenStatus("重新生成完成");
    }catch(e){
      setSbShots(prev=>{const n=[...prev];n[i]={...n[i],status:"generated"};return n;});
      setSbGenStatus("重新生成失败: "+e.message);
    }finally{setSbImgBusy(false);}
  };
  const sbCost=()=>{
    const imgCount=sbShots.length;const imgCost=imgCount*0.12*2;// 2 versions each
    const vidSec=sbShots.reduce((a,s)=>a+(parseInt(s.dur)||5),0);
    const vidCost=sbShots.reduce((a,s)=>a+(SC_MODELS["veo3.1-fast"]?.cost||1.5),0);
    return{imgCount,imgCost:imgCost.toFixed(2),vidSec,vidCost:vidCost.toFixed(2),ttsCost:"0.00",total:(imgCost+vidCost).toFixed(2)};
  };
  const generateFullVideo=async()=>{
    if(sbShots.length===0)return;
    setCs("generating");setVidGenBusy(true);setVgPct(0);setVgStep(0);setFinalVideoUrl(null);const _startT=Date.now();const _tmr=setInterval(()=>setSbElapsed(Math.round((Date.now()-_startT)/1000)),1000);
    const total=sbShots.length;
    try{
      // Step 1: TTS for each shot
      setVgStep(0);setSbGenStatus("生成TTS配音...");
      const audioBlobs=[];
      for(let i=0;i<total;i++){
        setVgPct(Math.round((i/total)*25));
        setSbGenStatus(`TTS配音 ${i+1}/${total}...`);
        try{
          const r=await fetch("/edge-tts",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({text:sbShots[i].text,voice:sbVoice})});
          if(!r.ok)throw new Error("TTS失败");
          const blob=await r.blob();
          audioBlobs.push(blob);
          const localUrl=URL.createObjectURL(blob);
          setSbShots(prev=>{const n=[...prev];n[i]={...n[i],audioUrl:localUrl};return n;});
        }catch(e){
          console.error(`[Video] TTS ${i+1} failed:`,e);
          audioBlobs.push(null);
        }
      }
      setVgPct(25);setVgStep(1);

      // Step 2: Upload images + audio to tmpfiles for Kling
      setSbGenStatus("上传素材...");
      const publicUrls=[];
      for(let i=0;i<total;i++){
        setVgPct(25+Math.round((i/total)*10));
        setSbGenStatus(`上传素材 ${i+1}/${total}...`);
        let imgPub=null,audioPub=null;
        try{
          if(sbShots[i].imageUrl){
            const imgUrl=sbShots[i].imageUrl;
            if(imgUrl.startsWith("http://")|| imgUrl.startsWith("https://")){
              imgPub=imgUrl; // 已经是公开URL
            }else if(imgUrl.startsWith("data:")){
              imgPub=await uploadToTmp(await fetch(imgUrl).then(r=>r.blob()),`shot_${i+1}.png`);
            }else{
              // 本地路径（如/avatars/p5.png），需要先fetch转blob再上传
              try{
                const blob=await fetch(imgUrl).then(r=>r.blob());
                imgPub=await uploadToTmp(blob,`shot_${i+1}.png`);
              }catch(e2){console.warn(`[Video] Local image ${imgUrl} upload failed:`,e2.message);}
            }
          }
          if(audioBlobs[i]){
            audioPub=await uploadToTmp(audioBlobs[i],`tts_${i+1}.mp3`);
          }
        }catch(e){console.error(`[Video] Upload ${i+1} failed:`,e);}
        publicUrls.push({imgPub,audioPub});
      }
      setVgPct(35);

      // Step 3: 并发生成视频片段 (速创API优先，Kling备选)
      setVgStep(2);setSbGenStatus("并发生成视频片段...");
      const videoUrls=new Array(total).fill(null);
      let completedCount=0;
      const genOne=async(i)=>{
        const prompt=getAnchorPrefix()+(sbShots[i].imgPrompt||sbShots[i].scene||"product video, smooth camera motion");
        const dur=parseInt(sbShots[i].dur)||5;
        // 数字人口播镜头：Kling图生视频 + LipSync对口型
        if(sbShots[i].shotType==="presenter"&&avatarOn){
          if(!publicUrls[i]?.imgPub){console.error(`[Video] presenter shot ${i+1}: 无图片URL，跳过`);return;}
          if(!publicUrls[i]?.audioPub){console.error(`[Video] presenter shot ${i+1}: 无音频URL，跳过`);return;}
          try{
            setSbGenStatus(`数字人图生视频 ${i+1}/${total}（约2-3分钟）...`);
            console.log(`[Video] presenter shot ${i+1}: imgPub=${publicUrls[i].imgPub.slice(0,60)}, audioPub=${publicUrls[i].audioPub.slice(0,60)}`);
            const basePrompt="This person is talking to camera, natural head movements, slight expression changes, holding a product, presenting to viewer, Douyin vlog style, casual and friendly";
            const baseTaskId=await klingCreate(publicUrls[i].imgPub,basePrompt,"9:16","10");
            console.log(`[Video] presenter shot ${i+1}: Kling task=${baseTaskId}, polling...`);
            const baseVideoUrl=await klingPollResult(baseTaskId);
            console.log(`[Video] presenter shot ${i+1}: base video OK, starting lip-sync...`);
            setSbGenStatus(`数字人对口型 ${i+1}/${total}（约2分钟）...`);
            const lsTaskId=await klingLipSync(baseVideoUrl,publicUrls[i].audioPub);
            console.log(`[Video] presenter shot ${i+1}: lip-sync task=${lsTaskId}, polling...`);
            const finalUrl=await klingPollResult(lsTaskId,"/kling/v1/videos/lip-sync");
            console.log(`[Video] presenter shot ${i+1}: lip-sync OK! url=${finalUrl.slice(0,60)}`);
            videoUrls[i]=finalUrl;
            setSbShots(prev=>{const n=[...prev];n[i]={...n[i],videoUrl:finalUrl};return n;});
            return;
          }catch(e){
            console.error(`[Video] presenter shot ${i+1} failed:`,e.message);
            setSbGenStatus(`数字人镜头 ${i+1} 失败: ${e.message}，降级为普通视频...`);
          }
        }
        // Try 速创API first (text-to-video, no image needed)
        try{
          const modelId=i===0?"sora2-new":"veo3.1-fast"; // hook shot uses higher quality
          const taskId=await scSubmit(modelId,prompt,dur);
          console.log(`[Video] 速创 ${modelId} shot ${i+1} submitted: ${taskId}`);
          const url=await scPoll(modelId,taskId);
          if(url){videoUrls[i]=url;setSbShots(prev=>{const n=[...prev];n[i]={...n[i],videoUrl:url};return n;});}
          return;
        }catch(e){console.log(`[Video] 速创 shot ${i+1} failed:`,e.message,", trying Kling...");}
        // Fallback: Kling image2video (needs image URL)
        if(!publicUrls[i]?.imgPub)return;
        try{
          const klingDur=dur<=5?"5":"10";
          const cr=await fetch("/blt-proxy/kling/v1/videos/image2video",{method:"POST",headers:BLT_HDRS,body:JSON.stringify({model_name:"kling-v1",image:publicUrls[i].imgPub,prompt,duration:klingDur,aspect_ratio:"9:16"})});
          if(!cr.ok)throw new Error("Kling API错误");
          const cj=await cr.json();
          if(cj.code!==0)throw new Error(cj.message||"创建失败");
          const taskId=cj.data.task_id;
          for(let p=0;p<120;p++){
            await new Promise(r=>setTimeout(r,4000));
            const pr=await fetch(`/blt-proxy/kling/v1/videos/image2video/${taskId}`,{headers:BLT_HDRS});
            const pj=await pr.json();const st=pj.data?.task_status;
            if(st==="succeed"){const url=pj.data?.task_result?.videos?.[0]?.url;if(url){videoUrls[i]=url;setSbShots(prev=>{const n=[...prev];n[i]={...n[i],videoUrl:url};return n;});}break;}
            if(st==="failed")break;
          }
        }catch(e){console.error(`[Video] Kling ${i+1} failed:`,e);}
      };
      // 分开处理：presenter镜头串行（每个需要Kling图生视频+LipSync），product镜头并行
      const presenterIdxs=sbShots.map((s,i)=>s.shotType==="presenter"?i:-1).filter(i=>i>=0);
      const productIdxs=sbShots.map((s,i)=>s.shotType!=="presenter"?i:-1).filter(i=>i>=0);
      console.log(`[Video] ${presenterIdxs.length} presenter shots, ${productIdxs.length} product shots`);

      // Presenter镜头：逐个处理（每个约5分钟：图生视频2-3分+LipSync2分）
      for(const i of presenterIdxs){
        await genOne(i);
        completedCount++;
        setVgPct(35+Math.round((completedCount/total)*45));
        setSbGenStatus(`视频片段 ${completedCount}/${total} 完成`);
      }

      // Product镜头：并行处理（max 4 concurrent）
      const sem={count:0,max:4,queue:[]};
      const withSem=async(fn)=>{
        while(sem.count>=sem.max)await new Promise(r=>sem.queue.push(r));
        sem.count++;
        try{await fn();}finally{sem.count--;if(sem.queue.length>0)sem.queue.shift()();}
      };
      await Promise.all(productIdxs.map(i=>withSem(async()=>{
        await genOne(i);
        completedCount++;
        setVgPct(35+Math.round((completedCount/total)*45));
        setSbGenStatus(`视频片段 ${completedCount}/${total} 完成`);
      })));
      setVgPct(80);

      // Step 4: Compose final video
      setVgStep(3);setSbGenStatus("合成最终视频...");
      const clips=sbShots.map((s,i)=>({
        imageUrl:publicUrls[i]?.imgPub||null,
        audioUrl:publicUrls[i]?.audioPub||null,
        videoUrl:videoUrls[i]||null,
        duration:parseInt(s.dur)||5,
        narration:s.text||"",
        camera:s.tag==="hook"?"zoom_in":s.tag==="close_up"?"breathe":s.tag==="wide"?"pan_right":"static",
      }));
      let finalUrl=null;
      // Try 1: Server-side FFmpeg compose
      try{
        const compR=await fetch("/compose-video",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({clips})});
        const compType=compR.headers.get("Content-Type")||"";
        if(compType.includes("video")){
          const blob=await compR.blob();
          finalUrl=URL.createObjectURL(blob);
        }
      }catch(e){console.warn("[Video] FFmpeg compose failed:",e.message);}
      // Try 2: Browser-side Canvas+MediaRecorder compose
      if(!finalUrl){
        try{
          setSbGenStatus("浏览器端视频合成中...");
          const localAudios=sbShots.map(s=>s.audioUrl||null);
          finalUrl=await browserComposeVideo(clips,localAudios,setSbGenStatus);
        }catch(e){console.warn("[Video] Browser compose failed:",e.message);}
      }
      // Fallback: first available video
      if(!finalUrl)finalUrl=videoUrls.find(v=>v)||null;
      if(finalUrl)setFinalVideoUrl(finalUrl);
      setVgPct(100);setVgStep(4);
      setSbGenStatus("视频生成完成！");
      await new Promise(r=>setTimeout(r,1000));
      clearInterval(_tmr);setSbElapsed(Math.round((Date.now()-_startT)/1000));setCs("preview");
    }catch(e){
      console.error("[Video] generateFullVideo error:",e);
      setSbGenStatus("视频生成失败: "+e.message);
    }finally{
      setVidGenBusy(false);clearInterval(_tmr);
    }
  };
  // 压缩分析数据，避免截断丢失关键信息
  const compactAnalysis=(data)=>{
    if(!data)return"";
    const p=[];
    if(data.title_formulas)p.push("【标题公式】\n"+data.title_formulas.map(f=>`- ${f.formula}（示例：${f.example}）`).join("\n"));
    if(data.opening_hooks)p.push("【开头Hook】\n"+data.opening_hooks.map(h=>`- ${h.type}: ${h.template}`).join("\n"));
    if(data.winning_structures)p.push("【爆款结构】\n"+(Array.isArray(data.winning_structures)?data.winning_structures.map(s=>`- ${s.name||s.type||""}: ${Array.isArray(s.outline)?s.outline.join("→"):s.description||""}`).join("\n"):JSON.stringify(data.winning_structures).slice(0,500)));
    if(data.trust_tactics)p.push("【信任策略】"+(Array.isArray(data.trust_tactics)?data.trust_tactics.join("、"):data.trust_tactics));
    if(data.conversion_tactics)p.push("【转化策略】\n"+(Array.isArray(data.conversion_tactics)?data.conversion_tactics.map(c=>`- ${c.tactic||c}（${c.position||""}）`).join("\n"):JSON.stringify(data.conversion_tactics).slice(0,300)));
    if(data.tone_style)p.push("【语气风格】"+data.tone_style);
    if(data.hot_hashtags)p.push("【热门标签】"+data.hot_hashtags.join(" "));
    if(data.key_insights)p.push("【核心洞察】"+data.key_insights.join("；"));
    if(data.do_list)p.push("【必做】"+data.do_list.join("；"));
    if(data.dont_list)p.push("【禁忌】"+data.dont_list.join("；"));
    if(data.searched_notes?.length)p.push("【爆款参考】\n"+data.searched_notes.slice(0,5).map(n=>`- 「${n.title}」${n.why_viral||""}`).join("\n"));
    return p.join("\n\n");
  };
  // IP档案上下文
  const getIpContext=()=>{
    if(!ipProfile.field&&!ipProfile.style)return"";
    return`\n【创作者IP档案】
- 细分领域：${ipProfile.field||"未设置"}
- 核心业务：${ipProfile.biz||"未设置"}
- 目标客群：${ipProfile.clients||"未设置"}
- 职责角色：${ipProfile.duty||"未设置"}
- 行业立场：${ipProfile.stance||"未设置"}
- 核心思维：${ipProfile.think||"未设置"}
- 表达风格：${ipProfile.style||"未设置"}
请根据以上IP特征定制内容：语气贴合创作者表达风格，内容角度体现行业立场和思维方式，信任背书利用专业背景。\n`;
  };
  // 兼容旧调用
  const callGemini=async(prompt)=>callLLM({model:"gemini-2.5-pro",prompt,temperature:0.7});
  // 千问搜索拆解
  const callQwen=async(prompt)=>callLLM({model:"qwen3-max",prompt,temperature:0.3,maxTokens:8192,enableSearch:true});

  // ====== 第一步：搜索爆款 + 拆解 ======
  const searchXhs=async()=>{
    if(!xhsProd.trim()){alert("请填写产品/服务名称");return;}
    setXhsBusy(true);setXhsNotes([]);setXhsSel(0);setXhsAnalysis(null);setXhsAnalysisText("");setXhsRecStyles([]);setXhsSelStyles([]);setXhsPhase("search");

    const searchPrompt=`你是一位顶级小红书内容策略师，擅长从真实爆款数据中提炼可复用的内容模式。

现在有一个客户需要在小红书上推广，以下是他的信息：
- 产品/服务：${xhsProd}
${xhsAudience?"- 目标受众："+xhsAudience:""}
${xhsSelling?"- 核心卖点："+xhsSelling:""}

请你完成以下任务：

【第一步：智能选词】
根据客户的产品信息，自主推导出5-8个最有效的小红书搜索关键词。要覆盖：
- 产品/服务的直接关键词（如"美白面霜"）
- 所属行业/品类词（如"护肤品推荐"）
- 目标受众的需求词、痛点词（如"敏感肌怎么选面霜"）
- 竞品/同行常用的内容标签词（如"平价护肤"）
- 场景词（如"换季护肤"）
不需要客户提供，你自己判断。

【第二步：联网搜索爆款笔记】
用上面推导出的关键词，联网搜索小红书上的真实笔记。重点筛选符合以下"爆款"标准的笔记：

📊 爆款判定标准（满足任意2条即算爆款）：
① 低粉爆文：作者粉丝<1万，但单篇点赞≥500或收藏≥300——说明纯靠内容质量起量，最值得学习
② 高收藏率：收藏数 ≥ 点赞数×60%——说明内容有实用干货价值，用户愿意存下来反复看，长尾流量好
③ 高互动率：评论数 ≥ 点赞数×8%——说明内容引发了真实讨论和争议，话题性强
④ 高分享率：分享数 ≥ 点赞数×5%——说明内容有社交传播价值，用户愿意转发给朋友
⑤ 万赞级爆文：点赞≥1万——绝对数量级的爆款，不管粉丝多少都值得分析
⑥ 时效爆款：最近3个月内发布且点赞≥200、收藏≥100——说明当前小红书算法偏好这类内容
⑦ 垂直领域头部：在该细分品类下排名前列的笔记，能代表品类内容趋势

🔍 额外关注：
- 同一个作者如果有多篇爆款，重点分析——说明其方法论可复用
- 图文笔记和视频笔记都要覆盖
- 注意区分"广告投放的假爆款"和"自然流量的真爆款"，优先真爆款

请尽量找到8-15篇符合条件的爆款笔记。

【第三步：深度拆解】
对找到的爆款笔记逐一拆解，然后综合提炼共性规律：

1. 标题公式：提取可直接套用的标题模板
2. 开头Hook：前两句抓注意力的手法（痛点/数据/反常识/提问/场景代入）
3. 内容结构：正文组织方式（列表干货/故事线/对比实验/问答/步骤教程）
4. 信任建立：数据、案例、从业经验、客户反馈、专业背书等
5. 转化设计：引导关注/私信/咨询的CTA位置和写法
6. 语气风格：用词习惯、emoji风格、人设调性
7. 标签策略：高频出现的话题标签

【第四步：推荐创作风格】
根据拆解结果，推荐3-5种最适合该产品的小红书笔记风格。从以下风格库中选择并排序：
- 干货教程：专业有条理，步骤清晰，适合知识型/服务型产品
- 痛点共鸣：引起共鸣，解决问题，适合大众消费品/服务
- 案例展示：真实案例+数据，适合有成功案例的服务/产品
- 经验分享：个人视角，接地气，适合个人品牌/体验型产品
- 避坑指南：血泪教训，适合决策成本高的产品/服务
- 清单种草：好物推荐列表，适合消费品/多SKU产品
- 对比测评：横向对比，适合竞争激烈的品类
- 故事营销：品牌故事/用户故事，适合有故事可讲的品牌

每个推荐风格要说明：为什么适合、在爆款中的占比、预期效果。

请用JSON格式返回，不要有JSON之外的文字：
{
  "search_keywords":["搜索关键词1","关键词2","关键词3"],
  "searched_notes":[
    {"title":"笔记标题","author":"作者","followers":"粉丝数","likes":"点赞数","collects":"收藏数","comments":"评论数","shares":"分享数","why_viral":"命中了哪条爆款标准","is_ad":false,"summary":"内容摘要（80字）"}
  ],
  "title_formulas":[
    {"formula":"可复用的标题公式","example":"具体示例","why":"为什么有效","used_count":"多少篇爆款用了类似公式"}
  ],
  "opening_hooks":[
    {"type":"hook类型","template":"可复用模板","example":"真实爆款开头原文"}
  ],
  "winning_structures":[
    {"name":"结构名称","outline":["段落1功能","段落2","段落3","段落4","段落5"],"description":"为什么有效","frequency":"在爆款中出现的频率"}
  ],
  "trust_tactics":["策略1","策略2","策略3","策略4"],
  "conversion_tactics":[
    {"tactic":"转化策略","example":"真实CTA文案","position":"位置"}
  ],
  "tone_style":"综合语气风格（100字，涵盖人设/用词/emoji）",
  "hot_hashtags":["#标签1","#标签2","#标签3","#标签4","#标签5","#标签6","#标签7","#标签8"],
  "key_insights":["关键洞察1","洞察2","洞察3"],
  "do_list":["创作必做1","2","3","4","5"],
  "dont_list":["创作禁忌1","2","3"],
  "recommended_styles":[
    {"style":"风格名称","reason":"为什么适合这个产品（30字）","match":"高/中/低","frequency":"在爆款中占比如 40%"}
  ]
}`;

    try{
      console.log("[XHS] Step 1: Qwen searching for",xhsProd);
      const searchRaw=await callQwen(searchPrompt);
      console.log("[XHS] Qwen raw length:",searchRaw.length);

      let analysisData=null;
      const jm=searchRaw.match(/\{[\s\S]*\}/);
      if(jm){try{analysisData=JSON.parse(jm[0]);}catch(e){console.log("[XHS] JSON parse err, raw text");}}
      const aText=analysisData?JSON.stringify(analysisData,null,2):searchRaw;
      setXhsAnalysis(analysisData||{raw:searchRaw});
      setXhsAnalysisText(aText);

      // 提取推荐风格
      const rec=analysisData?.recommended_styles||[];
      setXhsRecStyles(rec);
      // 默认选中前3个
      setXhsSelStyles(rec.slice(0,3).map(r=>r.style));
      setXhsPhase("analyzed");
    }catch(e){
      console.error("[XHS] search error:",e);
      alert("搜索失败："+e.message);
      setXhsPhase("");
    }finally{
      setXhsBusy(false);
    }
  };

  // ====== 第二步：基于拆解 + 选定风格生成笔记 ======
  const generateXhsNotes=async()=>{
    if(!xhsSelStyles.length){alert("请至少选择一种笔记风格");return;}
    setXhsBusy(true);setXhsPhase("generate");setXhsNotes([]);setXhsSel(0);

    const styleDescs={"干货教程":"专业有条理、步骤清晰、有实操价值","痛点共鸣":"引起共鸣、解决问题、情感连接","案例展示":"真实案例、数据说话、前后对比","经验分享":"个人视角、真实经历、接地气","避坑指南":"常见错误、血泪教训、实用建议","清单种草":"好物推荐列表、种草安利","对比测评":"横向对比、客观分析","故事营销":"品牌故事、用户故事、情感共鸣"};
    const styleList=xhsSelStyles.map((s,i)=>`${i+1}. ${s}：${styleDescs[s]||s}`).join("\n");

    try{
      console.log("[XHS] Step 2: generating",xhsSelStyles);
      const analysisCtx=compactAnalysis(xhsAnalysis)||xhsAnalysisText.slice(0,8000);
      const genPrompt=`你是一位精通小红书的爆款内容创作者。现在有一份来自真实小红书爆款笔记的深度拆解报告（由AI联网搜索并分析得出），请严格基于这份报告为客户创作${xhsSelStyles.length}篇小红书笔记。

【真实爆款拆解报告】
${analysisCtx}

【客户产品/服务信息】
名称：${xhsProd}
${xhsAudience?"目标受众："+xhsAudience:""}
${xhsSelling?"核心卖点："+xhsSelling:""}

【${xhsSelStyles.length}篇笔记的风格】
${styleList}

【铁律——不遵守等于白做】
1. 标题必须套用报告中的标题公式，不要自己发明。带emoji，不超过20字，每篇给3个备选
2. 开头必须套用报告中的hook模板，不要写"大家好今天给大家分享"这种废话开头
3. 正文结构必须参考报告中的winning_structures，500-800字，emoji分段
4. 信任元素必须参考报告中的trust_tactics，用具体数据和案例
5. 转化设计必须参考报告中的conversion_tactics，自然引导不硬广
6. 语气必须参考报告中的tone_style，像真人写的不像AI
7. 标签必须优先使用报告中的hot_hashtags，每篇5-8个
8. 每篇笔记的标题公式、开头hook、结构必须各不相同

严格按以下JSON输出，不要有JSON之外的文字：
{
  "notes":[
    {
      "style":"风格名称",
      "titles":["标题1（带emoji，不超20字）","标题2","标题3"],
      "content":"正文内容（500-800字，用\\n换行，emoji分段，像真人写的）",
      "hashtags":["#标签1","#标签2","#标签3","#标签4","#标签5"],
      "interaction_guide":"互动引导语",
      "cover_suggestion":"封面设计建议（配色/文字/构图）",
      "best_post_time":"最佳发布时间"
    }
  ]
}`;
      const parsed=await generateJSON({model:"gemini-2.5-pro",system:"你是一位精通小红书的爆款内容创作者。你的每一篇笔记都像真人写的，不像AI生成的。只输出JSON。"+getIpContext(),prompt:genPrompt,temperature:0.6,maxTokens:8192});
      const notes=parsed.notes||[];
      if(!notes.length)throw new Error("未生成笔记");
      setXhsNotes(notes);
      setXhsPhase("done");
    }catch(e){
      console.error("[XHS] generate error:",e);
      alert("生成失败："+e.message);
      setXhsPhase("analyzed");
    }finally{
      setXhsBusy(false);
    }
  };
  // ====== 抖音图文：第一步 搜索+拆解 ======
  const searchDy=async()=>{
    if(!dyProd.trim()){alert("请填写产品/服务名称");return;}
    setDyBusy(true);setDyNotes([]);setDySel(0);setDyAnalysis(null);setDyAnalysisText("");setDyRecStyles([]);setDySelStyles([]);setDyPhase("search");

    const searchPrompt=`你是一位顶级抖音图文内容策略师，擅长从真实爆款图文笔记中提炼可复用的内容模式和流量密码。

注意：抖音图文是抖音平台上的图片+文字形式的内容（类似小红书笔记的轮播图文，但在抖音生态内分发），不是短视频。

现在有一个客户需要在抖音上用图文形式推广，以下是他的信息：
- 产品/服务：${dyProd}
${dyAudience?"- 目标受众："+dyAudience:""}
${dySelling?"- 核心卖点："+dySelling:""}

请你完成以下任务：

【第一步：智能选词】
根据客户的产品信息，自主推导出5-8个最有效的抖音图文搜索关键词。要覆盖：
- 产品/服务的直接关键词（如"祛痘产品"）
- 所属行业/品类词（如"护肤好物推荐"）
- 目标受众的需求词、痛点词（如"油皮痘肌怎么办"）
- 抖音热门话题词（如"好物分享""抖音图文"）
- 场景词/情绪词（如"学生党必备""平价好物"）
不需要客户提供，你自己判断。

【第二步：联网搜索爆款图文】
用上面推导出的关键词，联网搜索抖音上的真实爆款图文笔记。重点筛选符合以下"爆款"标准的图文：

📊 爆款判定标准（满足任意2条即算爆款）：
① 低粉爆文：作者粉丝<5万，但单篇点赞≥5000或收藏≥3000——纯靠内容质量起量
② 高收藏率：收藏数 ≥ 点赞数×40%——说明图文有干货价值，用户愿意存下来
③ 高互动率：评论数 ≥ 点赞数×5%——说明内容引发了真实讨论
④ 高分享率：分享数 ≥ 点赞数×8%——说明有社交传播价值
⑤ 万赞级爆文：点赞≥1万——绝对数量级的图文爆款
⑥ 时效爆款：最近3个月内发布且点赞≥2000、收藏≥1000——当前算法偏好
⑦ 垂直领域头部：在该细分品类下排名前列的图文笔记

🔍 额外关注：
- 同一个作者多篇爆款图文，重点分析——说明其方法论可复用
- 关注图文的封面图设计规律（文字排版、配色、构图）
- 注意区分"投流假爆款"和"自然流量真爆款"，优先真爆款
- 抖音图文和小红书图文的差异点（抖音更注重封面吸引力、文案简短有力、标签SEO）

请尽量找到8-15篇符合条件的爆款图文。

【第三步：深度拆解】
对找到的爆款图文逐一拆解，综合提炼共性规律：

1. 标题公式：提取可直接套用的标题模板（抖音图文标题更短更冲击）
2. 开头Hook：前两句抓注意力的手法（痛点/数据/反常识/提问/场景代入）
3. 内容结构：正文组织方式（列表干货/对比/步骤教程/故事线/问答）
4. 图片策略：封面图设计规律、图片张数、图文配合方式
5. 信任建立：数据、案例、对比图、用户反馈、专业背书
6. 转化设计：引导关注/评论/私信的CTA位置和写法
7. 语气风格：用词习惯、emoji风格、人设调性
8. 标签策略：高频出现的话题标签（抖音图文SEO标签很重要）

【第四步：推荐创作风格】
根据拆解结果，推荐3-5种最适合该产品的抖音图文风格。从以下风格库中选择并排序：
- 干货教程：步骤清晰的教学图文，适合知识型/工具类产品
- 产品种草：直接安利推荐，适合消费品/好物推荐
- 对比测评：使用前后/产品横评，适合竞争品类
- 避坑指南：踩坑经验/注意事项，适合决策成本高的品类
- 清单合集：好物清单/推荐列表，适合多SKU产品
- 经验分享：个人真实体验，适合个人IP/体验型产品
- 热点蹭流：结合热点话题植入产品，适合快消品/话题品
- 痛点解决：直击痛点给方案，适合刚需产品/服务

每个推荐风格要说明：为什么适合、在爆款中的占比、预期效果。

请用JSON格式返回，不要有JSON之外的文字：
{
  "search_keywords":["搜索关键词1","关键词2","关键词3"],
  "searched_notes":[
    {"title":"图文标题","author":"作者","followers":"粉丝数","likes":"点赞数","collects":"收藏数","comments":"评论数","shares":"分享数","img_count":"图片张数","why_viral":"命中了哪条爆款标准","is_ad":false,"summary":"内容摘要（80字）"}
  ],
  "title_formulas":[
    {"formula":"可复用的标题公式","example":"具体示例","why":"为什么有效","used_count":"多少篇爆款用了类似公式"}
  ],
  "opening_hooks":[
    {"type":"hook类型","template":"可复用模板","example":"真实爆款开头原文"}
  ],
  "winning_structures":[
    {"name":"结构名称","outline":["段落1功能","段落2","段落3","段落4","段落5"],"description":"为什么有效","frequency":"在爆款中出现的频率"}
  ],
  "image_tactics":["封面图设计规律1","规律2","规律3"],
  "trust_tactics":["策略1","策略2","策略3","策略4"],
  "conversion_tactics":[
    {"tactic":"转化策略","example":"真实CTA文案","position":"位置"}
  ],
  "tone_style":"综合语气风格（100字，涵盖人设/用词/emoji）",
  "hot_hashtags":["#标签1","#标签2","#标签3","#标签4","#标签5","#标签6","#标签7","#标签8"],
  "key_insights":["关键洞察1","洞察2","洞察3"],
  "do_list":["创作必做1","2","3","4","5"],
  "dont_list":["创作禁忌1","2","3"],
  "recommended_styles":[
    {"style":"风格名称","reason":"为什么适合这个产品（30字）","match":"高/中/低","frequency":"在爆款中占比如 40%"}
  ]
}`;

    try{
      console.log("[DY] Step 1: Qwen searching for",dyProd);
      const searchRaw=await callQwen(searchPrompt);
      console.log("[DY] Qwen raw length:",searchRaw.length);

      let analysisData=null;
      const jm=searchRaw.match(/\{[\s\S]*\}/);
      if(jm){try{analysisData=JSON.parse(jm[0]);}catch(e){console.log("[DY] JSON parse err");}}
      const aText=analysisData?JSON.stringify(analysisData,null,2):searchRaw;
      setDyAnalysis(analysisData||{raw:searchRaw});
      setDyAnalysisText(aText);

      const rec=analysisData?.recommended_styles||[];
      setDyRecStyles(rec);
      setDySelStyles(rec.slice(0,3).map(r=>r.style));
      setDyPhase("analyzed");
    }catch(e){
      console.error("[DY] search error:",e);
      alert("搜索失败："+e.message);
      setDyPhase("");
    }finally{
      setDyBusy(false);
    }
  };

  // ====== 抖音图文：第二步 生成笔记 ======
  const generateDyNotes=async()=>{
    if(!dySelStyles.length){alert("请至少选择一种图文风格");return;}
    setDyBusy(true);setDyPhase("generate");setDyNotes([]);setDySel(0);

    const styleDescs={"干货教程":"步骤清晰的教学图文","产品种草":"直接安利推荐，真实体验","对比测评":"使用前后/产品横评对比","避坑指南":"踩坑经验/注意事项","清单合集":"好物清单/推荐列表","经验分享":"个人真实体验分享","热点蹭流":"结合热点话题植入产品","痛点解决":"直击痛点给方案"};
    const styleList=dySelStyles.map((s,i)=>`${i+1}. ${s}：${styleDescs[s]||s}`).join("\n");

    try{
      console.log("[DY] Step 2: generating",dySelStyles);
      const dyAnalysisCtx=compactAnalysis(dyAnalysis)||dyAnalysisText.slice(0,8000);
      const genPrompt=`你是一位精通抖音图文的爆款内容创作者。现在有一份来自真实抖音爆款图文的深度拆解报告（由AI联网搜索并分析得出），请严格基于这份报告为客户创作${dySelStyles.length}篇抖音图文笔记。

注意：抖音图文不是视频脚本，是图片+文字形式的内容，类似小红书笔记但要适配抖音平台的风格和算法。抖音图文的特点：标题更短更有冲击力、文案更精炼、封面图决定点击率、标签SEO非常重要。

【真实爆款拆解报告】
${dyAnalysisCtx}

【客户产品/服务信息】
名称：${dyProd}
${dyAudience?"目标受众："+dyAudience:""}
${dySelling?"核心卖点："+dySelling:""}

【${dySelStyles.length}篇图文的风格】
${styleList}

【铁律——不遵守等于白做】
1. 标题必须套用报告中的标题公式，带emoji，不超过20字，每篇给3个备选
2. 开头必须套用报告中的hook模板，不要写废话开头
3. 正文结构必须参考报告中的winning_structures，300-600字，emoji分段
4. 信任元素必须参考报告中的trust_tactics
5. 转化设计必须参考报告中的conversion_tactics，自然引导不硬广
6. 语气必须参考报告中的tone_style，像真人写的不像AI
7. 标签必须优先使用报告中的hot_hashtags，每篇6-10个（抖音图文标签可以更多）
8. 每篇图文的标题公式、开头hook、结构必须各不相同
9. 要给出具体的图片内容建议（每张图放什么内容、文字怎么排）

严格按以下JSON输出，不要有JSON之外的文字：
{
  "notes":[
    {
      "style":"风格名称",
      "titles":["标题1（带emoji，不超20字）","标题2","标题3"],
      "content":"正文内容（300-600字，用\\n换行，emoji分段，像真人写的）",
      "hashtags":["#标签1","#标签2","#标签3","#标签4","#标签5","#标签6"],
      "image_plan":[
        {"page":1,"content":"封面图：放什么内容、文字怎么排、什么配色"},
        {"page":2,"content":"第2张图内容建议"}
      ],
      "interaction_guide":"互动引导语",
      "cover_suggestion":"封面设计建议（配色/文字/构图）",
      "best_post_time":"最佳发布时间"
    }
  ]
}`;
      const parsed=await generateJSON({model:"gemini-2.5-pro",system:"你是一位精通抖音图文的爆款内容创作者。你的每一篇图文都像真人写的，不像AI。只输出JSON。"+getIpContext(),prompt:genPrompt,temperature:0.6,maxTokens:8192});
      const notes=parsed.notes||[];
      if(!notes.length)throw new Error("未生成图文");
      setDyNotes(notes);
      setDyPhase("done");
    }catch(e){
      console.error("[DY] generate error:",e);
      alert("生成失败："+e.message);
      setDyPhase("analyzed");
    }finally{
      setDyBusy(false);
    }
  };

  // ====== 微信公众号：第一步 搜索+拆解 ======
  const searchWx=async()=>{
    if(!wxProd.trim()){alert("请填写产品/服务名称");return;}
    setWxBusy(true);setWxArticles([]);setWxSel(0);setWxAnalysis(null);setWxAnalysisText("");setWxRecStyles([]);setWxSelStyles([]);setWxPhase("search");

    const searchPrompt=`你是一位顶级微信公众号内容策略师，擅长从真实爆款文章中提炼可复用的内容模式和涨粉套路。

现在有一个客户需要在微信公众号上推广，以下是他的信息：
- 产品/服务：${wxProd}
${wxAudience?"- 目标受众："+wxAudience:""}
${wxSelling?"- 核心卖点："+wxSelling:""}

请你完成以下任务：

【第一步：智能选词】
根据客户的产品信息，自主推导出5-8个最有效的微信公众号搜索关键词。要覆盖：
- 产品/服务的直接关键词
- 所属行业/品类词
- 目标受众的需求词、痛点词
- 竞品/同行常用的内容标签词
- 场景词、热点词
不需要客户提供，你自己判断。

【第二步：联网搜索爆款文章】
用上面推导出的关键词，联网搜索微信公众号上的真实爆款文章。重点筛选符合以下"爆款"标准的文章：

📊 爆款判定标准（满足任意2条即算爆款）：
① 10w+阅读：阅读量超过10万，绝对爆款
② 高在看率：在看数 ≥ 阅读量×2%——说明内容引发共鸣，读者愿意公开表态
③ 高转发率：分享/转发数高——说明内容有社交传播价值
④ 低粉爆文：公众号粉丝不多但单篇阅读量远超日常——说明纯靠内容质量
⑤ 高留言互动：精选留言数量多且质量高——说明引发了深度讨论
⑥ 时效爆款：最近3个月内发布且表现突出——说明当前读者偏好
⑦ 垂直领域头部：在该细分领域排名前列的文章

🔍 额外关注：
- 同一个公众号多篇爆款，重点分析——说明其方法论可复用
- 注意区分"标题党假爆款"和"内容质量真爆款"，优先真爆款
- 关注留言区高频反馈和读者真实需求

请尽量找到8-15篇符合条件的爆款文章。

【第三步：深度拆解】
对找到的爆款文章逐一拆解，综合提炼共性规律：

1. 标题公式：提取可直接套用的标题模板（公众号标题特征：悬念、数字、痛点、反常识）
2. 开头Hook：前两段抓注意力的手法（故事开场/数据冲击/痛点描述/悬念设置/热点切入）
3. 内容结构：正文组织方式（总分总/递进式/并列式/故事线/问答式）
4. 信任建立：数据引用、案例支撑、专家背书、用户证言、从业经验
5. 转化设计：引导关注/转发/留言/加微信的CTA位置和写法
6. 语气风格：用词习惯、段落长度、人设调性
7. 排版特征：小标题使用、段落节奏、金句设计

【第四步：推荐创作风格】
根据拆解结果，推荐3-5种最适合该产品的公众号文章风格。从以下风格库中选择并排序：
- 深度长文：深入分析、逻辑严密、适合专业领域和行业分析
- 干货清单：条理清晰、实用价值高、适合工具/方法/资源类
- 案例拆解：真实案例深度分析、适合商业/营销/成长类
- 观点输出：鲜明立场、引发讨论、适合时评/行业观察
- 故事叙事：故事驱动、情感共鸣、适合品牌故事/用户故事
- 数据报告：数据驱动、图表支撑、适合行业报告/趋势分析
- 访谈对话：对话形式、真实感强、适合人物专访/经验分享
- 热点评论：热点切入、独特视角、适合时效性内容

每个推荐风格要说明：为什么适合、在爆款中的占比、预期效果。

请用JSON格式返回，不要有JSON之外的文字：
{
  "search_keywords":["搜索关键词1","关键词2","关键词3"],
  "searched_articles":[
    {"title":"文章标题","author":"公众号名称","reads":"阅读量","likes":"在看数","comments":"留言数","shares":"转发数","why_viral":"命中了哪条爆款标准","is_ad":false,"summary":"内容摘要（80字）"}
  ],
  "title_formulas":[
    {"formula":"可复用的标题公式","example":"具体示例","why":"为什么有效","used_count":"多少篇爆款用了类似公式"}
  ],
  "opening_hooks":[
    {"type":"hook类型","template":"可复用模板","example":"真实爆款开头原文"}
  ],
  "winning_structures":[
    {"name":"结构名称","outline":["段落1功能","段落2","段落3","段落4","段落5"],"description":"为什么有效","frequency":"在爆款中出现的频率"}
  ],
  "trust_tactics":["策略1","策略2","策略3","策略4"],
  "conversion_tactics":[
    {"tactic":"转化策略","example":"真实CTA文案","position":"位置"}
  ],
  "tone_style":"综合语气风格（100字，涵盖人设/用词/段落节奏）",
  "key_insights":["关键洞察1","洞察2","洞察3"],
  "recommended_styles":[
    {"style":"风格名称","reason":"为什么适合这个产品（30字）","match":"高/中/低","frequency":"在爆款中占比如 40%"}
  ]
}`;

    try{
      console.log("[WX] Step 1: Qwen searching for",wxProd);
      const searchRaw=await callQwen(searchPrompt);
      console.log("[WX] Qwen raw length:",searchRaw.length);

      let analysisData=null;
      const jm=searchRaw.match(/\{[\s\S]*\}/);
      if(jm){try{analysisData=JSON.parse(jm[0]);}catch(e){console.log("[WX] JSON parse err, raw text");}}
      const aText=analysisData?JSON.stringify(analysisData,null,2):searchRaw;
      setWxAnalysis(analysisData||{raw:searchRaw});
      setWxAnalysisText(aText);

      const rec=analysisData?.recommended_styles||[];
      setWxRecStyles(rec);
      setWxSelStyles(rec.slice(0,3).map(r=>r.style));
      setWxPhase("analyzed");
    }catch(e){
      console.error("[WX] search error:",e);
      alert("搜索失败："+e.message);
      setWxPhase("");
    }finally{
      setWxBusy(false);
    }
  };

  // ====== 微信公众号：第二步 生成文章 ======
  const generateWxArticles=async()=>{
    if(!wxSelStyles.length){alert("请至少选择一种文章风格");return;}
    setWxBusy(true);setWxPhase("generate");setWxArticles([]);setWxSel(0);

    const styleDescs={"深度长文":"深入分析、逻辑严密、专业领域","干货清单":"条理清晰、实用价值高、工具方法","案例拆解":"真实案例深度分析、商业营销","观点输出":"鲜明立场、引发讨论、行业观察","故事叙事":"故事驱动、情感共鸣、品牌故事","数据报告":"数据驱动、图表支撑、趋势分析","访谈对话":"对话形式、真实感强、经验分享","热点评论":"热点切入、独特视角、时效性强"};
    const styleList=wxSelStyles.map((s,i)=>`${i+1}. ${s}：${styleDescs[s]||s}`).join("\n");

    try{
      console.log("[WX] Step 2: generating",wxSelStyles);
      const wxAnalysisCtx=compactAnalysis(wxAnalysis)||wxAnalysisText.slice(0,8000);
      const genPrompt=`你是一位精通微信公众号的爆款内容创作者。现在有一份来自真实微信公众号爆款文章的深度拆解报告（由AI联网搜索并分析得出），请严格基于这份报告为客户创作${wxSelStyles.length}篇微信公众号文章。

【真实爆款拆解报告】
${wxAnalysisCtx}

【客户产品/服务信息】
名称：${wxProd}
${wxAudience?"目标受众："+wxAudience:""}
${wxSelling?"核心卖点："+wxSelling:""}

【${wxSelStyles.length}篇文章的风格】
${styleList}

【铁律——不遵守等于白做】
1. 标题必须套用报告中的标题公式，不要自己发明。每篇给3个备选标题
2. 开头必须套用报告中的hook模板，前两段就要抓住读者，不要写"今天给大家分享"这种废话开头
3. 正文结构必须参考报告中的winning_structures，1500-3000字，有清晰的段落层次
4. 信任元素必须参考报告中的trust_tactics，用具体数据和案例
5. 转化设计必须参考报告中的conversion_tactics，自然引导不硬广
6. 语气必须参考报告中的tone_style，像真人写的不像AI
7. 每篇文章要有小标题分段，适合公众号阅读体验
8. 每篇文章的标题公式、开头hook、结构必须各不相同

严格按以下JSON输出，不要有JSON之外的文字：
{
  "articles":[
    {
      "style":"风格名称",
      "titles":["标题1","标题2","标题3"],
      "summary":"文章摘要/导读（50-80字，用于文章开头灰色引言区）",
      "content":"正文内容（1500-3000字，用\\n换行，用【小标题】分段，像真人写的）",
      "tags":["标签1","标签2","标签3","标签4","标签5"],
      "interaction_guide":"文末互动引导语（引导留言/在看/转发）",
      "cover_suggestion":"封面图建议（配色/文字/构图）",
      "best_post_time":"最佳发布时间"
    }
  ]
}`;
      const parsed=await generateJSON({model:"gemini-2.5-pro",system:"你是一位精通微信公众号的爆款内容创作者。你的文章像真人写的，逻辑严密，有深度。只输出JSON。"+getIpContext(),prompt:genPrompt,temperature:0.6,maxTokens:12288});
      const articles=parsed.articles||[];
      if(!articles.length)throw new Error("未生成文章");
      setWxArticles(articles);
      setWxPhase("done");
    }catch(e){
      console.error("[WX] generate error:",e);
      alert("生成失败："+e.message);
      setWxPhase("analyzed");
    }finally{
      setWxBusy(false);
    }
  };

  // ═══════════════ Avatar (数字人) simplified creation flow ═══════════════
  const startAvatarCreate = async () => {
    setModal(false);setPg("create");setCs("ai-generating");setAiScripts([]);activeCreatePg.current="create";
    const _startT=Date.now();const _tmr=setInterval(()=>setSbElapsed(Math.round((Date.now()-_startT)/1000)),1000);

    try {
      // ═══ Step 1: 生成口播脚本（纯文字，不要画面描述）═══
      // 先生成脚本让用户审核确认，图片生成延后到采纳后进行
      setAiGenStep("正在生成口播脚本...");
      const scriptPrompt = `你是一位抖音带货口播文案高手。请为以下产品生成一段数字人口播文案。

产品：${prod}（${cat}）
${prodDesc ? "产品描述：" + prodDesc : ""}
目标时长：${dur}
数字人形象：${avatarSel.nm}（${avatarSel.tags}）

要求：
1. 只输出口播文案正文，不要标题、标注、画面描述、镜头说明
2. 100%口语化，短句为主（每句≤15字），像真人在抖音上自然说话
3. 开头必须有钩子（反问/痛点/悬念），3秒内抓住注意力
4. 中间展示产品亮点（外观/质感/使用场景/性价比），层层递进
5. 结尾软性逼单（"链接放这儿了""我已经囤了X个"）
6. 字数根据时长：30秒≈120-150字，60秒≈240-300字
7. 禁止书面语，禁止编造产品没有的功能
8. 用"..."标注停顿，用"【重】"标注需要加重语气的词

只输出文案，不要任何其他内容。`;

      const script = await callLLM({model: "gemini-2.5-pro", prompt: scriptPrompt, temperature: 0.8, maxTokens: 2048});
      const cleanScript = script.replace(/^["""「」『』\s]+|["""「」『』\s]+$/g, "").trim();
      console.log("[Avatar] Script generated, length:", cleanScript.length);

      // ═══ 展示结果 — 让用户审核脚本 ═══
      clearInterval(_tmr);

      // Store all data for the video generation step (images will be generated after adoption)
      const avatarData = {
        script: cleanScript,
        avatarSel,
        prodDesc: prodDesc || prod,
        prod,
        dur,
      };

      // Use aiScripts to store the result (reuse existing UI)
      setAiScripts([{
        id: 1,
        name: `${avatarSel.nm} · ${prod}带货口播`,
        dur: dur,
        shots: 1,
        sell: 0,
        desc: "数字人口播带货视频 — 点击采纳后生成视频",
        badges: [{t: "数字人", c: "conv"}, {t: "口播带货", c: "exp"}],
        logic: ["口播脚本生成", "→ 采纳后：产品精修图 → 数字人合成 → Kling图生视频"],
        table: [{
          shot: 1,
          dur: dur,
          scene: "数字人手持产品对镜头口播",
          copy: cleanScript,
          image_prompt: "",
          shot_type: "presenter",
          risk: false,
          intent: "完整口播带货"
        }],
        visual_anchor: { character: avatarSel.imgPrompt, setting: "clean room", product: prodDesc || prod, palette: "natural" },
        _avatarData: avatarData,
      }]);
      setCs("results");
      saveToHistory([{name:`${avatarSel.nm} · ${prod}带货口播`,dur,shots:1,sell:0,desc:"数字人口播带货视频",badges:[{t:"数字人",c:"conv"},{t:"口播带货",c:"exp"}],logic:["口播脚本生成"],table:[{shot:1,dur,scene:"数字人手持产品对镜头口播",copy:cleanScript,image_prompt:"",risk:false,intent:"完整口播带货"}],_avatarData:avatarData}],{mode:"avatar"});

    } catch(e) {
      console.error("[Avatar] startAvatarCreate error:", e);
      clearInterval(_tmr);
      alert("数字人视频生成失败: " + e.message);
      setCs("results");
      setAiScripts([]);
    }
  };

  // ═══════════════ Avatar Phase 1: Generate images for preview ═══════════════
  const generateAvatarImages = async () => {
    if (!adopted?._avatarData) return;
    setCs("generating");setVidGenBusy(true);setVgPct(0);setVgStep(0);setFinalVideoUrl(null);
    setAvatarPreviewImgs([]);setAvatarCleanProdImg(null);setAvatarSelIdx(0);
    const _startT=Date.now();const _tmr=setInterval(()=>setSbElapsed(Math.round((Date.now()-_startT)/1000)),1000);
    try {
      const ad = adopted._avatarData;

      // ═══ Step 0a: 净化产品图 — 白底电商主图 ═══
      setSbGenStatus("正在生成产品精修图...");setVgPct(5);
      const cleanProductPrompt = `Product photography on pure white background. Take this exact product and render it on a perfectly clean white background. Front-facing view, eye-level angle. 3D render quality, precise color reproduction. Clean all fingerprints, dust and imperfections. Strong lighting with soft shadows for depth. Product labels and text must be sharp and clear. E-commerce hero image standard. The product: ${ad.prodDesc}. Reproduce the exact product from the reference, keep all original colors, materials (glass transparency, matte plastic, metallic shine), shape and proportions.`;
      let cleanProdImg;
      try {
        cleanProdImg = await genOneImage(cleanProductPrompt);
        console.log("[Avatar] Clean product image OK");
      } catch(e) {
        console.warn("[Avatar] Clean product image failed, using original:", e.message);
        cleanProdImg = prodImages[0];
      }
      setVgPct(25);

      // ═══ Step 0b: 合成数字人+产品图 (9:16) ═══
      setSbGenStatus("正在生成数字人展示图...");
      const gender = (ad.avatarSel.tags||"").includes("男") || (ad.avatarSel.tags||"").includes("大叔") ? "He" : "She";
      const poses = [
        `${gender} holds the product up at chest height with right hand, left hand relaxed at side, looking directly at camera lens, mouth slightly open mid-sentence`,
        `${gender} brings the product closer to camera to show details, tilting it slightly, eyebrows raised with genuine interest, leaning forward a bit`,
        `${gender} holds the product with both hands near chest, natural relaxed smile, head tilted slightly to one side, casual confident pose`,
      ];
      const compositeImgs = [];
      const realismBase = `RAW photo taken with iPhone 15 Pro front camera, completely unedited and unretouched. Visible skin pores on nose and cheeks, natural slight redness around nose, tiny beauty marks, individual hair strands visible, natural teeth with slight imperfections. NOT a beauty photo, NOT retouched, NOT smooth skin. Real candid selfie vibe. Real lived-in room background: visible furniture, door frame, ceiling light, maybe a plant or some clutter, natural depth. Mixed warm indoor lighting from overhead light and window. Slight noise/grain like a real phone photo. 9:16 vertical portrait format.`;
      for (let pi = 0; pi < poses.length; pi++) {
        setSbGenStatus(`正在生成数字人展示图 ${pi+1}/${poses.length}...`);
        const compositePrompt = `${realismBase} ${ad.avatarSel.imgPrompt}. ${poses[pi]}. ${gender} is holding: ${ad.prodDesc}. No text, no watermarks, no labels overlaid on image.`;
        try {
          const img = await genOneImage(compositePrompt);
          compositeImgs.push(img);
          setVgPct(25 + Math.round(((pi+1)/poses.length) * 75));
          console.log(`[Avatar] Composite image ${pi+1} OK`);
        } catch(e) {
          console.warn(`[Avatar] Composite image ${pi+1} failed:`, e.message);
        }
      }
      if (compositeImgs.length === 0) {
        setSbGenStatus("展示图生成失败，正在用简化方案重试...");
        const simplePrompt = `RAW unedited iPhone selfie of a young Chinese person holding a ${ad.prod}, looking at camera, real room background, visible skin pores, natural lighting, 9:16 vertical. No text no watermarks.`;
        try {
          const img = await genOneImage(simplePrompt);
          compositeImgs.push(img);
        } catch(e2) {
          setSbGenStatus("图片生成失败，使用预设头像...");
          compositeImgs.push(ad.avatarSel.imgUrl);
        }
      }
      // ═══ 展示图片预览，让用户选择首帧 ═══
      setAvatarPreviewImgs(compositeImgs);
      setAvatarCleanProdImg(cleanProdImg);
      setAvatarSelIdx(0);
      clearInterval(_tmr);
      setSbElapsed(Math.round((Date.now()-_startT)/1000));
      setCs("avatar-preview");
    } catch(e) {
      console.error("[Avatar] Image generation failed:", e);
      setSbGenStatus("图片生成失败: " + e.message);
    } finally {
      setVidGenBusy(false);clearInterval(_tmr);
    }
  };

  // ═══════════════ Avatar Phase 2: Confirm first frame & generate video ═══════════════
  const confirmAvatarVideo = async () => {
    if (!adopted?._avatarData || avatarPreviewImgs.length === 0) return;
    setCs("generating");setVidGenBusy(true);setVgPct(5);setVgStep(0);setFinalVideoUrl(null);
    const _startT=Date.now();const _tmr=setInterval(()=>setSbElapsed(Math.round((Date.now()-_startT)/1000)),1000);
    try {
      const ad = adopted._avatarData;
      // 用户选择的首帧排在第一个，其余图片跟在后面
      const selectedImg = avatarPreviewImgs[avatarSelIdx];
      const otherImgs = avatarPreviewImgs.filter((_,i) => i !== avatarSelIdx);
      const imgs = [selectedImg, ...otherImgs];

      // ═══ Step 1: 上传图片 ═══
      setSbGenStatus("上传素材...");setVgStep(1);setVgPct(10);
      const imgPubs = [];
      const uploadedCache = {};
      for (let i = 0; i < imgs.length; i++) {
        let url = imgs[i];
        if (uploadedCache[url]) { imgPubs.push(uploadedCache[url]); continue; }
        if (!url.startsWith("http")) {
          const blob = await fetch(url).then(r=>r.blob());
          url = await uploadToTmp(blob, `avatar_pose_${i+1}.png`);
        }
        uploadedCache[imgs[i]] = url;
        imgPubs.push(url);
      }
      setVgPct(15);

      // ═══ Step 2: 根据目标时长决定段数，并行图生视频（Kling，每段10秒） ═══
      const targetDur = parseInt(ad.dur) || 30;
      const segCount = Math.max(1, Math.ceil(targetDur / 10));
      const segImgPubs = [];
      for (let i = 0; i < segCount; i++) segImgPubs.push(imgPubs[i % imgPubs.length]);
      setSbGenStatus(`生成${segCount}段数字人视频（共${targetDur}秒，约${segCount * 3}分钟）...`);setVgStep(2);
      const poseDescs = [", presenting the product to camera", ", examining and showing product details", ", demonstrating the product with enthusiasm", ", gesturing while explaining the product", ", holding product up proudly"];
      const basePrompt = "This person is talking directly to camera while holding and presenting a product, natural head movements, slight expression changes, friendly engaging Douyin vlog style";
      const klingTasks = await Promise.all(segImgPubs.map((url, i) =>
        klingCreate(url, basePrompt + (poseDescs[i % poseDescs.length]), "9:16", "10")
          .then(tid => { console.log(`[Avatar] Kling task ${i+1}: ${tid}`); return tid; })
          .catch(e => { console.error(`[Avatar] Kling create ${i+1}:`, e.message); return null; })
      ));
      const videoUrls = [];
      for (let i = 0; i < klingTasks.length; i++) {
        if (!klingTasks[i]) { videoUrls.push(null); continue; }
        setSbGenStatus(`数字人视频 ${i+1}/${segCount} 生成中...`);
        try {
          const url = await klingPollResult(klingTasks[i]);
          videoUrls.push(url);
        } catch(e) { console.warn(`[Avatar] Video ${i+1} failed:`, e.message); videoUrls.push(null); }
        setVgPct(15 + Math.round(((i+1)/segCount) * 60));
      }
      if (videoUrls.every(u => !u)) throw new Error("所有视频生成失败");
      setVgPct(80);

      // ═══ Step 3: 拼接多段视频（如有多段） ═══
      const validUrls = videoUrls.filter(u => u);
      let avatarFinalUrl = null;
      if (validUrls.length > 1) {
        setSbGenStatus("合成最终视频...");setVgStep(3);
        const clips = validUrls.map(url => ({ videoUrl: url, duration: 10 }));
        try {
          const compR = await fetch("/compose-video", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({clips})});
          if ((compR.headers.get("Content-Type") || "").includes("video")) {
            avatarFinalUrl = URL.createObjectURL(await compR.blob());
          }
        } catch(e) { console.warn("[Avatar] FFmpeg compose failed:", e.message); }
        if (!avatarFinalUrl) {
          try {
            setSbGenStatus("浏览器端视频合成中...");
            avatarFinalUrl = await browserComposeVideo(clips, [], setSbGenStatus);
          } catch(e) { console.warn("[Avatar] Browser compose failed:", e.message); }
        }
      }
      setFinalVideoUrl(avatarFinalUrl || validUrls[0]);
      setVgPct(100);
      setVgStep(4);
      setSbGenStatus("数字人视频生成完成！");
      clearInterval(_tmr);
      setSbElapsed(Math.round((Date.now()-_startT)/1000));
      setCs("preview");
    } catch(e) {
      console.error("[Avatar] Video generation failed:", e);
      setSbGenStatus("视频生成失败: " + e.message);
    } finally {
      setVidGenBusy(false);clearInterval(_tmr);
    }
  };

  // WAV编码辅助函数
  const audioBufferToWav = (buffer) => {
    const numCh = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numCh * bytesPerSample;
    const data = numCh === 1 ? buffer.getChannelData(0) : interleave(buffer);
    const dataLen = data.length * bytesPerSample;
    const headerLen = 44;
    const buf = new ArrayBuffer(headerLen + dataLen);
    const view = new DataView(buf);
    const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
    writeStr(0, 'RIFF'); view.setUint32(4, 36 + dataLen, true); writeStr(8, 'WAVE');
    writeStr(12, 'fmt '); view.setUint32(16, 16, true); view.setUint16(20, format, true);
    view.setUint16(22, numCh, true); view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true); view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true); writeStr(36, 'data'); view.setUint32(40, dataLen, true);
    const offset = 44;
    for (let i = 0; i < data.length; i++) {
      const s = Math.max(-1, Math.min(1, data[i]));
      view.setInt16(offset + i * 2, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
    }
    return new Blob([buf], { type: 'audio/wav' });
  };
  const interleave = (buffer) => {
    const ch0 = buffer.getChannelData(0);
    const ch1 = buffer.numberOfChannels > 1 ? buffer.getChannelData(1) : ch0;
    const len = ch0.length + ch1.length;
    const result = new Float32Array(len);
    for (let i = 0, idx = 0; i < ch0.length; i++) { result[idx++] = ch0[i]; result[idx++] = ch1[i]; }
    return result;
  };

  const startCreate=async()=>{
    // Redirect to simplified avatar flow when digital human mode is on
    if(avatarOn && avatarSel && prodImages.length > 0) {
      return startAvatarCreate();
    }
    setModal(false);setPg("create");setCs("ai-generating");setAiScripts([]);activeCreatePg.current="create";
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
    ].filter(Boolean).join("\n"):"";
    const creatorName=libSelTmpl?libSelTmpl._creator||libSelTmpl.name||"该博主":"";
    const riskRules="【平台违禁词规避】\n禁止极限词：最好用、第一、唯一、全网最、顶级、No.1、绝对、永久\n禁止医疗词：治疗、消炎、临床证明、药用\n禁止绝对承诺：保证有效、彻底解决\n必须替换：敏感肌→敏敏肌 | 美白→提亮肤色/亮肤 | 祛痘→改善痘肌 | 去黑头→清洁毛孔 | 减肥→塑形 | 抗老→改善细纹 | 无添加→配方简净 | 修复→改善调理 | 医美级→院线同款\nrisk字段：擦边表达设为true";
    const ipCtx=getIpContext();

    // ═══ 产品信息增强：如果有产品图/描述，先让AI深度理解产品 ═══
    let prodFullDesc=prodDesc||"";
    try{
      // 如果上传了产品图，用Gemini视觉分析产品
      if(prodImages.length>0&&!prodFullDesc){
        setAiGenStep("AI正在分析产品图片，识别产品特征...");
        const imgContent=[...prodImages.map(img=>({type:"image_url",image_url:{url:img}})),{type:"text",text:`请仔细观察这个产品的照片，详细描述：
1. 这是什么产品？（具体品类，不要猜测功能）
2. 外观特征：颜色、材质、形状、大小、设计风格
3. 从外观能判断的使用场景
4. 产品的视觉亮点（什么最吸引眼球）

重要：只描述你能从图片中看到的，不要编造功能或卖点。如果看不出具体功能，就说"需要用户补充"。
用中文回答，100字以内。`}];
        const resp=await fetch("/blt-proxy/v1/chat/completions",{method:"POST",headers:API_HDRS,body:JSON.stringify({model:"gemini-2.5-flash",messages:[{role:"user",content:imgContent}],max_tokens:300,temperature:0.3})});
        if(resp.ok){const data=await resp.json();prodFullDesc=data.choices?.[0]?.message?.content||"";}
        console.log("[AI] 产品图分析:",prodFullDesc);
      }
      // 合并用户手写描述 + AI图片分析
      if(prodDesc&&prodFullDesc!==prodDesc)prodFullDesc=prodDesc+"\n\n[AI图片分析补充] "+prodFullDesc;
    }catch(e){console.warn("产品分析失败:",e.message);}

    // ═══ 三步生成：千问搜索爆款 → 设计结构大纲 → 并行展开脚本 ═══
    try{
      // ═══ 第一步：千问联网搜索同品类爆款短视频，提炼爆款模式 ═══
      setAiGenStep("正在搜索全网同品类爆款短视频，分析流量密码...");
      // ── 1A：千问联网搜索爆款短视频 ──
      setAiGenStep("正在联网搜索同品类爆款短视频...");
      const searchRaw=await callLLM({model:"qwen3-max",system:"你是一位在MCN机构工作8年的短视频操盘手，亲手打造过50+百万粉账号。你擅长通过搜索引擎找到最新爆款并逐帧拆解。",prompt:`你是一位资深短视频数据分析师。请完成以下任务：

【第一步：智能选词】
根据产品「${prod}」（品类：${cat||"通用"}），自主推导出6-10个最有效的搜索关键词，覆盖：
- 产品直接关键词（如"面膜推荐"）
- 品类词（如"护肤品测评"）
- 受众痛点词（如"熬夜脸怎么救"）
- 场景词（如"约会前急救"）
- 爆款话术词（如"别买XX了"）

【第二步：联网搜索爆款视频】
用上面推导的关键词，联网搜索抖音/快手/小红书上的真实爆款短视频。

📊 爆款判定标准（满足任意2条即算爆款）：
① 低粉爆款：账号粉丝<5万，单条点赞>1万——纯靠内容质量起量，最值得学习
② 高互动率：评论数≥点赞数×5%——说明内容引发真实讨论
③ 高转发率：转发数≥点赞数×3%——说明有社交传播价值
④ 万赞级爆款：点赞≥10万——绝对量级爆款
⑤ 时效爆款：近60天内发布且点赞≥5000——代表当前算法偏好
⑥ 品类头部：该细分品类下播放/互动排名前列的视频

🔍 额外关注：
- 同一作者多篇爆款要重点分析——方法论可复用
- 纯画面+旁白类视频（非真人口播）要特别标注——这是我们的制作方式
- 区分"投流假爆款"和"自然流量真爆款"

请尽量找到8-12条符合条件的爆款视频。

【第三步：逐帧级深度拆解】
对找到的爆款视频逐一拆解，重点分析：

1. 前3秒钩子：完整还原开头台词+画面，分析为什么能留住人（制造了什么认知冲突/好奇心缺口/情绪冲击）
2. 内容结构公式：拆到每个节点的情绪值(0-10)、节奏(快/慢/停)、画面类型(特写/全景/对比)——画出完整"情绪过山车"
3. 台词节奏DNA：句子长度、语气词频率、停顿位置、重音模式、口头禅、catchphrase
4. 画面语言：运镜偏好、色调趋势、转场节奏（几秒切一次）、高潮处的视觉处理
5. 转化心理学：各阶段用了什么心理触发器（稀缺性/社会认同/权威/损失厌恶/锚定）
6. 逼单话术：怎么引导下单的，原话是什么，为什么不让人反感

【第四步：提炼已验证脚本类型 + 画面风格建议】
- 总结4-5种该品类验证过的爆款脚本类型（名称+结构公式+情绪曲线+代表案例）
- 这些爆款的核心视觉叙事手法是什么？（什么画面最有冲击力）
- 品类爆款的视觉风格趋势（色调偏好、构图特点、节奏快慢）
- 如果要用纯画面+旁白的方式制作（不用真人出镜），怎么保留同样的冲击力？

注意：宁可分析透3个真实案例，也不要编造数据。如果搜不到特定品类案例，搜索所属大类的规律。

直接输出分析文本，不需要JSON格式。`,temperature:0.3,maxTokens:8192,enableSearch:true});

      // ── 1B：用千问搜索竞品爆款视频的具体台词和画面 ──
      setAiGenStep("正在深挖竞品爆款台词和画面细节...");
      const scriptDetailRaw=await callLLM({model:"qwen3-max",system:"你是短视频文案拆解专家，擅长从爆款视频中提取可复用的台词模板和画面脚本。",prompt:`基于「${prod}」（${cat||"通用"}），联网搜索并还原3-5条同品类爆款短视频的完整脚本。

对每条视频，请尽量还原：
1. 完整台词文案（逐句，标注停顿和语气变化）
2. 每句台词对应的画面描述（镜头怎么拍的、画面里有什么）
3. 视频的节奏节点（哪里快切、哪里慢放、哪里停顿、BGM变化点）
4. 评论区高赞评论前3条（反映观众真实反应）

如果无法还原完整台词，至少提供：
- 前3秒的完整开头台词
- 转化/逼单部分的完整台词
- 全片最高能的1-2句金句

这些真实台词将作为后续脚本创作的参考模板。`,temperature:0.3,maxTokens:4096,enableSearch:true});

      const trendRaw=searchRaw+"\n\n══════ 竞品爆款台词还原 ══════\n"+scriptDetailRaw;

      // ═══ 第二步：基于爆款分析设计4个差异化脚本大纲 ═══
      setAiGenStep("爆款分析完成，正在设计脚本结构...");
      const sysOutline=`你是一位年收入千万的短视频编导，专注${cat||"短视频"}品类。你不写"方案"，你设计"内容炸弹"。你的每个脚本都像一颗精心设计的钩子——从第一帧开始就不让人划走。你根据真实爆款数据设计脚本，不凭空想象。${ipCtx}`;

      const outlinePrompt=`以下是「${prod}」（${cat}）品类的爆款深度拆解报告：

${trendRaw}

---
${prodFullDesc?`\n【⚠️ 产品真实信息 — 必须严格遵守，禁止编造】\n${prodFullDesc}\n\n⚠️ 脚本中所有关于产品功能、材质、外观的描述必须与上面的真实信息一致。不要发明产品没有的功能！如果产品信息不足，脚本侧重外观颜值/使用场景/生活方式，不要编造具体功能参数。\n`:""}
基于以上拆解，为「${prod}」设计4个完全不同的短视频脚本大纲。
时长：${dur}
${tmplInfo?`\n参考风格档案：\n${tmplInfo}`:""}

══════ 设计铁律 ══════
1. 4个方案必须从爆款报告中提炼的「已验证脚本类型」中选取，直接偷师爆款的结构套路和钩子
2. 每个方案的"情绪过山车"必须不同：
   - 方案A：前3秒就炸（高开→维持→二次高潮→收割）
   - 方案B：悬念吊着（低开→设谜→揭秘→爆发）
   - 方案C：反转打脸（常识→颠覆→证据→刷新认知）
   - 方案D：情感共振（共鸣→痛点→救赎→种草）
3. 卖点策略各不相同：价格锚定 / 效果对比 / 情感认同 / 权威背书 / 社交货币 / 焦虑制造
4. name字段不是"方案一"！是像爆款标题一样让人忍不住点进去的一句话，例如："我花了3000块踩的坑，今天全告诉你""把XX扔了吧，这个才XX块"
5. hook字段要写出完整的前3秒台词+画面设计，不是概述
6. structure不是泛泛的步骤名，而是每一步的情绪值(0-10)+核心动作，如："好奇心炸弹(9)→产品特写揭秘(7)→效果对比冲击(10)→价格锚定(8)→紧迫逼单(9)"
7. 先按最火爆的视频来设计画面逻辑（什么画面最抓人、最有冲击力），然后再适配成AI图片生成+TTS旁白配音的方式。核心是爆款逻辑不能丢——需要真人的画面用场景氛围/产品特写/局部暗示来替代表达，但情绪冲击力和视觉叙事节奏必须跟真正的爆款视频一样强

JSON输出：
{"outlines":[{"name":"像爆款标题一样有冲击力的方案名（20字内）","type":"脚本类型（从爆款分析提炼）","emotion":"情绪走法：用曲线描述如 高开(9)→回落(5)→二次冲击(10)→收割(8)","shots":6,"strategy":"核心心理触发器+卖点策略","hook":"前3秒完整设计：画面(XX镜头+XX画面)+台词(完整台词文字)","diff":"与其他方案的本质区别（一句话）","structure":["情绪值+步骤动作","情绪值+步骤动作"]}]}`;

      const outlineData=await generateJSON({model:"gemini-2.5-flash",system:sysOutline,prompt:outlinePrompt,temperature:0.5,maxTokens:4096});
      const outlines=outlineData.outlines||[];
      if(!outlines.length)throw new Error("未生成大纲");

      // ═══ 第三步：并行展开每个大纲为完整分镜脚本 ═══
      setAiGenStep(`结构设计完成，正在并行创作${outlines.length}个脚本方案...`);

      const sysScript=`你是一个AI短视频脚本专家。你深刻理解AI视频制作的技术限制和能力边界。

你写的脚本将通过以下技术管线制作：
1. AI生成静态图片（每镜头一张图，图片会被轻微动画化）
2. AI语音合成（TTS）配旁白
3. 自动拼接成视频

⚠️ 所以你的脚本必须遵守以下铁律：
- 每个镜头 = 一张静态图 + 一段旁白，仅此而已
- 不要写BGM、音效、运镜、转场特效——这些不由脚本控制
- 画面必须是"一张照片能表达的内容"，不要写动态动作
- 人物画面用同一个人的不同姿势/角度，不要换人
- 产品在每张图中必须长得一模一样${avatarOn&&avatarSel?`\n\n⚠️ 数字人主播模式已启用！
视频中会有一个真人主播（数字人）出镜，拿着产品讲解展示。
每个镜头必须标注 shot_type 字段：
- "presenter"：主播出镜，拿着/展示产品对镜头说话。画面=主播+产品同框。
- "product"：纯产品特写/场景氛围图，无人出镜。
推荐交替出现：口播→产品→口播→产品。presenter占50-60%。
presenter镜头的scene写主播的姿势和产品展示方式（如"主播手持产品对镜头微笑展示"），不要写BGM/运镜。`:""}${tmplInfo?`\n你正在模仿「${creatorName}」的风格：\n${tmplInfo}`:""}${ipCtx}`;

      const expandOne=(outline)=>`为以下方案生成完整的抖音带货短视频脚本。

产品：${prod}（${cat}）| 时长：${dur}
${prodFullDesc?`\n【⚠️ 产品真实信息 — 只能用这些，禁止编造功能】\n${prodFullDesc}\n`:""}
【爆款参考】
${trendRaw.slice(0,1500)}

【方案大纲】
${outline.name}｜${outline.type}｜${outline.emotion}
镜头数：${outline.shots}个｜策略：${outline.strategy}
钩子：${outline.hook||""}
步骤：${outline.structure.join(" → ")}

${riskRules}

══════ 技术限制（必须遵守）══════
你的脚本将由AI自动制作，不是人工拍摄。制作流程：
① 每个镜头 → AI生成一张静态图片（gpt-image-1）
② 图片 → 图生视频（自动加轻微动效，5-10秒）
③ TTS语音合成读旁白
④ FFmpeg自动拼接

所以：
- scene字段 = 描述一张静态照片的内容（不是视频画面！）
- 不要写：运镜、BGM、音效、转场特效、慢动作、快切——这些AI做不到
- 可以写：构图、光线、景别、人物姿势、产品摆放位置、场景布置
- 人物：同一个人贯穿全片，不同镜头换姿势/角度/景别即可
- 产品：每张图中产品外观完全一致

══════ 旁白台词规则（TTS朗读）══════
① 100%口语化！禁止书面腔
② 每句≤15字，短句为主
③ 用"..."标停顿，用"【重】"标重音
④ 开场必须有认知冲突钩子
⑤ 字数匹配时长：3秒≈12字、5秒≈20字
⑥ 每句结尾要勾下一句（悬念/反转/互动）
⑦ 逼单软着来："反正我已经囤了""链接放这儿了"${tmplInfo?`\n⑧ 植入「${creatorName}」的用词习惯`:""}

══════ visual_anchor（视觉统一锚点）══════
设计一个贯穿全片的视觉身份，所有字段英文：
- character：主角固定外观（性别/年龄/发型/服装/配饰），极其具体。不需要人物写"none"
- setting：固定主场景，所有镜头在同一个空间
- product：产品固定外观 + 必须包含"no text no label no logo"
- palette：统一色调和拍摄风格，如"warm daylight, iPhone feel, Douyin vlog aesthetic"

══════ image_prompt（AI生图提示词）══════
纯英文，40-60词。系统会自动拼接 visual_anchor + image_prompt。
规则：
- 不重复anchor中的人物/场景/色调
- 只写：景别(close-up/medium/wide)、人物姿势、产品位置、光效
- 必须以"no text, no labels in image."结尾
- 风格像抖音博主用手机拍的生活照，不是广告大片
- 避免正脸细节（AI弱项），用侧脸/背影/低头/手部特写

══════ intent字段 ══════
简写：情绪值 + 战术目的。如"好奇8→种草10 | 价格锚定：打破贵的认知"

badges：2-3个标签，c用conv/exp/auth

JSON格式（严格遵守，不要多余文字）：
{"name":"${outline.name}","dur":"${dur}","shots":${outline.shots},"sell":3,"desc":"创意亮点30字","badges":[{"t":"标签","c":"conv"}],"visual_anchor":{"character":"English","setting":"English","product":"English, no text no label no logo","palette":"English"},"logic":${JSON.stringify(outline.structure)},"table":[{"shot":1,"dur":"5秒"${avatarOn?',"shot_type":"presenter"':""},"scene":"一张静态照片的描述","copy":"旁白台词","image_prompt":"English 40-60 words, no text, no labels in image.","risk":false,"intent":"情绪+目的"}]}`;

      // 并行展开，失败自动重试1次
      const expandWithRetry=async(o)=>{
        for(let attempt=0;attempt<2;attempt++){
          try{
            const r=await generateJSON({model:"gemini-2.5-pro",system:sysScript,prompt:expandOne(o),temperature:0.7,maxTokens:6144});
            if(r&&r.table&&r.table.length>0)return r;
            if(attempt===0){console.warn(`方案「${o.name}」返回空table，重试...`);await new Promise(r=>setTimeout(r,2000));}
          }catch(e){
            console.error(`方案「${o.name}」展开失败(尝试${attempt+1}):`,e);
            if(attempt===0)await new Promise(r=>setTimeout(r,2000));
          }
        }
        return null; // 两次都失败
      };
      const raw=await Promise.all(outlines.map(o=>expandWithRetry(o)));
      const results=raw.filter(r=>r&&r.table&&r.table.length>0); // 过滤掉失败的空方案
      if(results.length===0)throw new Error("所有方案生成失败，请重试");

      const finalScripts=results.map((s,i)=>({...s,id:i+1,badges:s.badges||[],logic:s.logic||[],table:s.table||[],name:s.name||`方案${i+1}`,dur:s.dur||dur,shots:s.shots||0,sell:s.sell||0,desc:s.desc||""}));
      setAiScripts(finalScripts);
      saveToHistory(finalScripts,{mode:"quick"});
      setCs("results");
    }catch(e){
      console.error("[AI脚本生成失败]",e);
      setAiScripts([]);
      setCs("results");
      setTimeout(()=>alert("AI脚本生成失败："+e.message+"\n\n当前显示的是内置示例脚本，非AI生成。请检查网络和API后重试。"),300);
    }
  };
  const [sendBusy,setSendBusy]=useState(false);

  // ═══ 分析竞品链接 — 纯前端 TikHub + 千问 ═══
  const analyzeCompetitorLink=async(rawText,msgsSoFar)=>{
    const updateBot=(text)=>setMsgs(prev=>[...prev.filter(m=>!m.typing),{r:"bot",c:text,typing:true}]);
    try{
      let rawUrl=(rawText.match(/https?:\/\/\S+/)||[""])[0].replace(/[.,，。]+$/,"");
      if(!rawUrl)throw new Error("未检测到有效链接，请粘贴抖音/小红书视频分享链接");
      updateBot("正在解析链接...");
      let awemeId="";
      const aidMatch=rawUrl.match(/video\/(\d{15,})/)||rawUrl.match(/aweme_id=(\d+)/);
      if(aidMatch)awemeId=aidMatch[1];
      else{
        try{
          const er=await fetch("/expand-url?url="+encodeURIComponent(rawUrl),{signal:AbortSignal.timeout(20000)});
          const ej=await er.json().catch(()=>({}));
          if(ej.url)rawUrl=ej.url;
          const m2=rawUrl.match(/video\/(\d{15,})/)||rawUrl.match(/aweme_id=(\d+)/);
          if(m2)awemeId=m2[1];
          if(!awemeId&&ej.body){const m3=ej.body.match(/video\/(\d{15,})/)||ej.body.match(/aweme_id['":\s]+(\d{15,})/);if(m3)awemeId=m3[1];}
          if(!awemeId){const xm=rawUrl.match(/\/(?:explore|discovery\/item)\/([a-f0-9]{24})/);if(xm)awemeId="xhs_"+xm[1];}
        }catch(e){console.log("[竞品] expand err:",e.message);}
        if(!awemeId){
          updateBot("正在通过TikHub解析链接...");
          for(const ep of ["/api/v1/douyin/app/v3/fetch_general_douyin_url_data","/api/v1/douyin/web/fetch_general_douyin_url_data"]){
            try{const u=new URL("/tikhub-proxy"+ep,location.origin);u.searchParams.set("url",rawUrl);
              const r=await fetch(u,{headers:TH_H});if(r.ok){const d=await r.json();const findId=(o)=>{if(!o||typeof o!=="object")return"";if(o.aweme_id)return String(o.aweme_id);for(const v of Object.values(o)){const f=findId(v);if(f)return f;}return"";};const fid=findId(d);if(fid){awemeId=fid;break;}}}catch{}
          }
        }
      }
      if(!awemeId)throw new Error("无法从链接中提取视频ID，请确认是否为抖音/小红书视频链接");
      updateBot("正在获取视频详情...");
      const isXhs=awemeId.startsWith("xhs_");
      let videoInfo={aweme_id:awemeId,title:"",author:"",play_count:0,digg_count:0,comment_count:0,share_count:0,duration:0,cover_url:""};
      if(!isXhs){
        const detail=await thGet("/api/v1/douyin/web/fetch_one_video",{aweme_id:awemeId});
        if(detail){const aw=detail?.data?.aweme_detail||detail?.data||{};videoInfo.title=aw.desc||"";videoInfo.author=aw.author?.nickname||"";const st=aw.statistics||{};videoInfo.play_count=st.play_count||0;videoInfo.digg_count=st.digg_count||0;videoInfo.comment_count=st.comment_count||0;videoInfo.share_count=st.share_count||0;videoInfo.duration=aw.duration||aw.video?.duration||0;videoInfo.cover_url=aw.video?.cover?.url_list?.[0]||"";}
      }
      updateBot("视频："+( videoInfo.title||awemeId)+"\n作者："+(videoInfo.author||"未知")+"\n正在获取评论和深度分析...");
      let commentsText="（无评论数据）";
      const commentsProm=(async()=>{if(isXhs)return;try{const cd=await thGet("/api/v1/douyin/app/v3/fetch_video_comments",{aweme_id:awemeId,count:30});if(cd){const rawList=cd?.data?.comments||cd?.data?.data||[];if(rawList.length>0)commentsText=rawList.slice(0,20).map((c,i)=>(i+1)+". ["+(c.digg_count||0)+"赞] "+(c.text||"")).join("\n");}}catch(e){console.log("[竞品] comments err:",e.message);}})();
      await commentsProm;
      updateBot("数据获取完成，千问AI深度分析中...\n视频："+videoInfo.title+"\n作者："+videoInfo.author+"\n点赞："+videoInfo.digg_count.toLocaleString()+" 评论："+videoInfo.comment_count.toLocaleString());
      const chatCtx=msgsSoFar.filter(m=>m.r==="user"||m.r==="bot").slice(-6).map(m=>(m.r==="user"?"用户":"顾问")+"："+(m.c||"").slice(0,200)).join("\n");
      const analysisRaw=await callLLM({model:"qwen3-max",system:"你是一位在MCN机构工作8年的短视频操盘手。你擅长深度拆解竞品视频的脚本结构、钩子设计、情绪曲线和转化策略，并给出可落地的优化建议。",
        prompt:"用户发来一条竞品视频链接，请进行全面深度拆解分析。\n\n## 视频信息\n- 标题："+(videoInfo.title||"未知")+"\n- 作者："+(videoInfo.author||"未知")+"\n- 播放："+(videoInfo.play_count?videoInfo.play_count.toLocaleString():"未知")+"\n- 点赞："+(videoInfo.digg_count?videoInfo.digg_count.toLocaleString():"未知")+"\n- 评论："+(videoInfo.comment_count?videoInfo.comment_count.toLocaleString():"未知")+"\n- 转发："+(videoInfo.share_count?videoInfo.share_count.toLocaleString():"未知")+"\n- 时长："+(videoInfo.duration?Math.round(videoInfo.duration/1000)+"秒":"未知")+"\n- 视频ID："+awemeId+"\n\n## 评论区TOP热评\n"+commentsText+"\n\n## 对话上下文\n"+(chatCtx||"（首次分析）")+"\n\n请完成以下分析，用清晰的结构化格式输出：\n\n### 1. 数据诊断\n互动率、完播率预估、爆款等级判定\n\n### 2. 钩子拆解\n开头前3秒用了什么钩子？类型（反常识/争议/悬念/痛点/视觉冲击/利益承诺），留人原理\n\n### 3. 脚本结构还原\n根据标题和评论推测脚本结构（开头→冲突→产品→转化），每段的情绪走向\n\n### 4. 评论区洞察\n用户最关心什么？最大争议点？隐藏的购买信号？\n\n### 5. 可复用的爆款公式\n提炼出可套用的公式：[X] x [Y] → [Z]\n\n### 6. 优化建议\n如果要做类似内容，3条具体可落地的改进方向\n\n请联网搜索该视频或该作者的更多信息来丰富分析。",
        temperature:0.3,maxTokens:4096,enableSearch:true});
      const botMsg={r:"bot",c:analysisRaw,
        compVideo:{title:videoInfo.title,author:videoInfo.author,play:videoInfo.play_count,digg:videoInfo.digg_count,comment:videoInfo.comment_count,share:videoInfo.share_count,dur:videoInfo.duration,cover:videoInfo.cover_url},
        acts:["根据这个竞品生成脚本","再分析一条竞品链接","对比多个竞品"]};
      setMsgs(prev=>[...prev.filter(m=>!m.typing),botMsg]);
    }catch(e){
      console.error("[竞品分析]",e);
      setMsgs(prev=>[...prev.filter(m=>!m.typing),{r:"bot",c:"竞品分析失败："+e.message+"\n\n请检查：\n1. 链接是否为抖音/小红书视频分享链接\n2. 网络是否正常"}]);
    }
  };

  const send=async(t)=>{
    if(!t.trim()||sendBusy)return;
    const n=[...msgs,{r:"user",c:t}];setMsgs([...n,{r:"bot",c:"正在思考...",typing:true}]);setCi("");setSendBusy(true);
    try{
      // ── 前端拦截：分析竞品链接 ──
      const hasLink=!!t.match(/https?:\/\/\S+/);
      const isVideoLink=hasLink&&!!(t.match(/douyin|tiktok|iesdouyin|v\.douyin|xhslink|xiaohongshu/i));
      const isCompCmd=t==="分析竞品链接";
      if(isCompCmd){
        setMsgs(prev=>[...prev.filter(m=>!m.typing),{r:"bot",c:"请粘贴竞品视频链接（支持抖音/小红书），我来帮你深度拆解：\n\n• 脚本结构与钩子设计\n• 情绪曲线与转化策略\n• 评论区洞察\n• 可复用的爆款公式",acts:["我先看看其他功能"]}]);
        return;
      }
      if(isVideoLink){
        await analyzeCompetitorLink(t,n);
        return;
      }

      // ── 正常对话走后端 ──
      const chatHist=n.filter(m=>m.r==="user"||m.r==="bot").map(m=>({role:m.r==="user"?"user":"assistant",content:m.c||""}));
      const resp=await fetch("/api/script/deep/chat",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({session_id:deepSid,message:t,chat_history:chatHist,product_name:null,industry:null})});
      if(!resp.ok){const txt=await resp.text();throw new Error(`API ${resp.status}: ${txt.slice(0,200)}`);}
      const data=await resp.json();
      if(!data.success)throw new Error(data.detail||"对话失败");
      if(data.session_id&&!deepSid)setDeepSid(data.session_id);
      const botMsg={r:"bot",c:data.response};
      if(data.tool_used==="search_douyin"&&data.tool_data?.need_input){
        botMsg.viralTypes=data.tool_data.viral_types;
      }else if(data.tool_used==="search_douyin"&&data.tool_data?.videos){
        botMsg.videos=data.tool_data.videos;
        botMsg.viralLabel=data.tool_data.viral_label||"";
      }else if(data.tool_used==="search_xiaohongshu"&&data.tool_data?.notes){
        botMsg.notes=data.tool_data.notes;
      }else if(data.tool_used==="get_hot_topics"&&data.tool_data?.topics){
        botMsg.hots=data.tool_data.topics.map(h=>({t:h.title,ct:h.hot_value?`热度 ${h.hot_value}`:`#${h.position}`,ma:h.marketing_angle||""}));
      }else if(data.tool_used==="search_web"&&data.tool_data?.sources){
        botMsg.webResults=data.tool_data.sources;
      }else if(data.tool_used==="get_inspiration"&&data.tool_data?.inspirations){
        const ins=data.tool_data.inspirations;
        const ht=(data.tool_data.hot_topics||[]).slice(0,5);
        if(ht.length)botMsg.hots=ht.map(h=>({t:h.description||h.title||"",ct:h.hot_value?`热度 ${h.hot_value}`:`#${h.position||""}`}));
        botMsg.angs=ins.map(a=>({ic:"💡",t:a.angle||"",s:a.source||"",d:a.suggested_hook||a.data_backing||""}));
        botMsg.sum=ins.map(a=>a.data_backing||"").filter(Boolean).join(" | ");
      }
      if(data.script_ready)botMsg.acts=["好的，帮我生成脚本","再聊聊其他方向"];
      setMsgs(prev=>[...prev.filter(m=>!m.typing),botMsg]);
    }catch(e){
      console.error("[deep chat]",e);
      setMsgs(prev=>[...prev.filter(m=>!m.typing),{r:"bot",c:"网络出了点问题："+e.message+"\n请确保后端已启动(python -m uvicorn main:app --port 8000 --reload)"}]);
    }finally{setSendBusy(false);}
  };
  const isActive=(k)=>pg===k||(k==="aicreate"&&(pg==="create"||pg==="create-deep"||pg==="comic-drama"||pg==="storyboard-wb"));

  // placeholder pages for modules not yet built
  const Placeholder=({title,desc,icon})=>(
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",flexDirection:"column",opacity:.4}}>
      <div style={{fontSize:48,marginBottom:16}}>{icon}</div>
      <div style={{fontSize:20,fontWeight:700,marginBottom:6}}>{title}</div>
      <div style={{fontSize:13,color:"var(--t2)"}}>{desc}</div>
    </div>
  );

  const pgT={dash:"工作台",tmpl:"模板库",ip:"IP工作室",hotbreak:"爆款深度解析",pos360:"360° 行业定位分析",avatar:"数字人生成",imgtext:"图文AI制作",schedule:"排期发布",adkol:"投流达人",analytics:"数据复盘",history:"内容库",settings:"设置"};
  // ═══ 爆款深度解析 — analysis pipeline ═══
  const runHotBreak=async()=>{
    if(!hotLink.trim()){alert("请粘贴视频链接");return;}
    setHotBusy(true);setHotStep("解析链接...");setHotError("");setHotResult(null);setHotScripts(null);
    try{
      let rawUrl=hotLink.trim();
      const urlMatch=rawUrl.match(/https?:\/\/\S+/);
      if(urlMatch)rawUrl=urlMatch[0].replace(/[.,，。]+$/,"");
      let awemeId="";
      const aidMatch=rawUrl.match(/video\/(\d{15,})/)||rawUrl.match(/aweme_id=(\d+)/);
      if(aidMatch)awemeId=aidMatch[1];
      else{
        setHotStep("展开短链接...");
        try{
          const er=await fetch("/expand-url?url="+encodeURIComponent(rawUrl),{signal:AbortSignal.timeout(20000)});
          const ej=await er.json().catch(()=>({}));
          if(ej.url)rawUrl=ej.url;
          const m2=rawUrl.match(/video\/(\d{15,})/)||rawUrl.match(/aweme_id=(\d+)/);
          if(m2)awemeId=m2[1];
          if(!awemeId&&ej.body){const m3=ej.body.match(/video\/(\d{15,})/)||ej.body.match(/aweme_id['":\s]+(\d{15,})/);if(m3)awemeId=m3[1];}
          if(!awemeId){const xm=rawUrl.match(/\/(?:explore|discovery\/item)\/([a-f0-9]{24})/);if(xm)awemeId="xhs_"+xm[1];}
        }catch(e){console.log("expand err:",e.message);}
        if(!awemeId){
          setHotStep("通过TikHub解析链接...");
          for(const ep of ["/api/v1/douyin/app/v3/fetch_general_douyin_url_data","/api/v1/douyin/web/fetch_general_douyin_url_data"]){
            try{const u=new URL("/tikhub-proxy"+ep,location.origin);u.searchParams.set("url",rawUrl);
              const r=await fetch(u,{headers:TH_H});if(r.ok){const d=await r.json();const findId=(o)=>{if(!o||typeof o!=="object")return"";if(o.aweme_id)return String(o.aweme_id);for(const v of Object.values(o)){const f=findId(v);if(f)return f;}return"";};const fid=findId(d);if(fid){awemeId=fid;break;}}}catch{}
          }
        }
      }
      if(!awemeId)throw new Error("无法从链接中提取视频ID，请确认链接格式正确");
      setHotStep("获取视频详情...");
      let videoInfo={aweme_id:awemeId,title:"",author:"",play_count:0,digg_count:0,comment_count:0,duration:0,cover_url:""};
      const isXhs=awemeId.startsWith("xhs_");
      if(!isXhs){
        const detail=await thGet("/api/v1/douyin/web/fetch_one_video",{aweme_id:awemeId});
        if(detail){const aw=detail?.data?.aweme_detail||detail?.data||{};videoInfo.title=aw.desc||"";videoInfo.author=aw.author?.nickname||"";const st=aw.statistics||{};videoInfo.play_count=st.play_count||0;videoInfo.digg_count=st.digg_count||0;videoInfo.comment_count=st.comment_count||0;videoInfo.duration=aw.duration||aw.video?.duration||0;videoInfo.cover_url=aw.video?.cover?.url_list?.[0]||"";}
      }
      setHotStep("并行分析中（评论+AI深度拆解）...");
      let commentsText="（无评论数据）";
      const commentsProm=(async()=>{if(isXhs)return;try{const cd=await thGet("/api/v1/douyin/app/v3/fetch_video_comments",{aweme_id:awemeId,count:30});if(cd){const rawList=cd?.data?.comments||cd?.data?.data||[];if(rawList.length>0)commentsText=rawList.slice(0,20).map((c,i)=>`${i+1}. [${c.digg_count||0}赞] ${c.text||""}`).join("\n");}}catch(e){console.log("comments err:",e.message);}})();
      const analysisProm=callLLM({model:"gemini-2.5-flash",system:"你是抖音爆款内容分析专家，擅长深度拆解短视频的结构、钩子、情绪曲线、创意装置和口播风格。",
        prompt:`请对以下视频进行深度结构化分析。\n\n视频信息：\n- 标题：${videoInfo.title||"（未知）"}\n- 作者：${videoInfo.author||"（未知）"}\n- 播放量：${videoInfo.play_count||"未知"}\n- 点赞量：${videoInfo.digg_count||"未知"}\n- 时长：${videoInfo.duration?Math.round(videoInfo.duration/1000)+"秒":"未知"}\n- 视频ID：${awemeId}\n${hotIndustry?"- 所属行业："+hotIndustry:""}\n${hotProduct?"- 用户产品："+hotProduct:""}\n\n请直接输出JSON:\n{"hook":{"type":"钩子类型（反常识/争议/悬念/痛点/视觉冲击/利益承诺）","text":"推测开头第一句","mechanism":"留人原理"},"tension_beats":[{"time_range":"时间段","device":"手法","function":"作用"}],"selling_point_insertion":{"method":"植入方式","timing":"时刻","naturalness":8},"emotional_arc":["情绪1","情绪2","情绪3","情绪4"],"creative_device":{"type":"创意装置类型","description":"具体实现","transferable_formula":"[X]x[Y]→[Z]"},"speaking_style":{"tone":"语气","oral_fragments":["碎片1","碎片2"],"rhythm":"节奏"},"comment_insights":{"top_concerns":["问题"],"emotional_triggers":["触发点"],"controversy":"争议"},"success_core":"一句话总结"}`,
        temperature:0.3,maxTokens:4096,jsonMode:true});
      await commentsProm;
      let analysis=extractJSON(await analysisProm);
      if(commentsText!=="（无评论数据）"&&analysis){
        setHotStep("综合评论数据深度分析...");
        try{const synthRaw=await callLLM({model:"gemini-2.5-flash",system:"你是抖音爆款内容分析专家。",prompt:`基于以下视频分析和评论数据，输出更完整的深度拆解。\n\n## 初步分析\n${JSON.stringify(analysis,null,2)}\n\n## 评论区TOP热评\n${commentsText}\n\n请补充comment_insights并优化其他字段。直接输出完整JSON。`,temperature:0.3,maxTokens:4096,jsonMode:true});const synth=extractJSON(synthRaw);if(synth)analysis=synth;}catch(e){console.log("synthesis err:",e.message);}
      }
      setHotResult({videoInfo,commentsText,analysis});
      setHotStep("正在生成6份优化脚本...");
      const scriptsRaw=await callLLM({model:"gemini-2.5-pro",system:"你是一位年收入千万的短视频编导，专注将爆款视频拆解后为客户生成可复用的脚本。",
        prompt:`基于以下爆款视频拆解，为用户生成6份差异化优化脚本。\n\n## 拆解结果\n${JSON.stringify(analysis,null,2)}\n\n## 视频信息\n标题：${videoInfo.title||"未知"} 作者：${videoInfo.author||"未知"} 时长：${videoInfo.duration?Math.round(videoInfo.duration/1000)+"秒":"未知"}\n${hotIndustry?"行业："+hotIndustry:""}\n${hotProduct?"用户产品："+hotProduct:""}\n${hotReq?"具体要求："+hotReq:""}\n\n## 评论\n${commentsText}\n\nJSON：{"scripts":[{"name":"脚本名","type":"类型","duration":"时长","emotion_arc":"情绪曲线","strategy":"策略","shots":[{"shot":1,"dur":"3秒","scene":"画面","copy":"台词","intent":"目的"}]}]}\n\n6个策略各不同：①原版复刻②反转升级③情感共鸣④数据实验⑤故事叙事⑥争议悬念`,
        temperature:0.6,maxTokens:8192,jsonMode:true});
      const sp=extractJSON(scriptsRaw);if(sp?.scripts)setHotScripts(sp.scripts);
      setHotStep("分析完成");
    }catch(e){console.error("[hotbreak]",e);setHotError(e.message||"分析失败");setHotStep("");}finally{setHotBusy(false);}
  };

  // ═══ 360° 行业定位分析 — analysis pipeline ═══
  const runPos360=async()=>{
    if(!posMain.trim()){alert("请输入你的主要业务");return;}
    setPosBusy(true);setPosStep("开始分析...");setPosError("");setPosResult(null);
    try{
      const industry=posInd||posMain;const depth=posDepth;const compLinks=posCompLinks.trim().split("\n").filter(Boolean);
      setPosStep("正在搜索行业数据和趋势...");
      const researchRaw=await callLLM({model:"qwen3-max",system:"你是一位资深的短视频行业分析师，擅长通过搜索引擎获取最新的行业数据和趋势。",
        prompt:`针对「${posMain}」（${industry}行业）进行全面的抖音短视频行业调研。\n\n需要覆盖：\n1. 行业现状（搜索热度、内容量、用户关注度）\n2. 用户画像（看什么、搜什么、买什么）\n3. 内容趋势（近3个月最火形式和话题）\n4. 头部账号（5-10个，名称+粉丝+特点+爆款特征）\n5. 蓝海机会（竞争少但需求在的方向）\n6. 变现模式\n${depth==="deep"?"7. 算法偏好\n8. 季节性趋势":""}`,
        temperature:0.3,maxTokens:depth==="deep"?8192:depth==="standard"?6144:4096,enableSearch:true});
      let compAnalysis="";
      if(compLinks.length>0){
        setPosStep("分析竞品账号...");const compInfos=[];
        for(const link of compLinks.slice(0,3)){try{let cUrl=link.trim();const cMatch=cUrl.match(/https?:\/\/\S+/);if(cMatch)cUrl=cMatch[0];const er=await fetch("/expand-url?url="+encodeURIComponent(cUrl),{signal:AbortSignal.timeout(15000)}).catch(()=>null);if(er){const ej=await er.json().catch(()=>({}));if(ej.url)cUrl=ej.url;}compInfos.push(cUrl);}catch{}}
        if(compInfos.length>0)compAnalysis=await callLLM({model:"qwen3-max",system:"你是短视频竞品分析专家。",prompt:`分析以下竞品抖音链接的内容策略：\n${compInfos.map((l,i)=>`${i+1}. ${l}`).join("\n")}\n\n我的业务：${posMain}（${industry}）\n\n分析每个竞品：1.定位风格 2.内容策略 3.爆款规律 4.优势和可学习点 5.劣势和差异化机会`,temperature:0.3,maxTokens:4096,enableSearch:true});
      }
      let selfAnalysis="";
      if(posDouyinLink.trim()){
        setPosStep("分析你的账号...");
        selfAnalysis=await callLLM({model:"qwen3-max",system:"你是短视频账号诊断专家。",prompt:`分析这个抖音账号：\n链接：${posDouyinLink}\n行业：${industry}\n业务：${posMain}\n\n诊断：1.定位清晰度 2.内容策略优缺点 3.与头部差距 4.最需改进的3方面`,temperature:0.3,maxTokens:3072,enableSearch:true});
      }
      setPosStep("生成定位报告...");
      const reportRaw=await callLLM({model:"gemini-2.5-pro",system:"你是顶级短视频内容策略师，帮助企业在抖音精准定位。输出JSON。",
        prompt:`为「${posMain}」（${industry}）生成360°定位报告。\n\n## 行业调研\n${researchRaw}\n${compAnalysis?"## 竞品分析\n"+compAnalysis:""}\n${selfAnalysis?"## 账号现状\n"+selfAnalysis:""}\n\nJSON：\n{"industry_overview":{"market_size":"规模","growth_trend":"趋势","competition_level":"低/中/高/极高","opportunity_score":8},"target_audience":{"primary":"核心画像","demographics":"特征","pain_points":["痛点1","痛点2"],"content_preferences":["偏好1","偏好2"]},"competitive_landscape":{"top_players":[{"name":"账号","followers":"粉丝","strength":"优势","content_type":"类型"}],"gaps":["空白"],"differentiation_opportunities":["机会"]},"positioning_recommendation":{"core_positioning":"定位一句话","content_pillars":[{"pillar":"支柱","description":"描述","frequency":"频率"}],"tone_style":"调性","visual_identity":"视觉"},"content_strategy":{"hero_content":"杀手锏方向","quick_wins":["快速起量方向"],"long_term_plays":["长期建设"],"content_calendar":[{"week":"第1周","theme":"主题","content_types":["类型"],"count":3}]},"monetization":{"primary_model":"主变现","secondary_models":["辅助"],"estimated_timeline":"周期"},"action_plan":[{"priority":"P0","action":"行动","timeline":"时间"}]}`,
        temperature:0.4,maxTokens:8192,jsonMode:true});
      const report=extractJSON(reportRaw);if(!report)throw new Error("报告生成失败，请重试");
      setPosResult(report);setPosStep("分析完成");
    }catch(e){console.error("[pos360]",e);setPosError(e.message||"分析失败");setPosStep("");}finally{setPosBusy(false);}
  };


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
@keyframes typingPulse{0%,100%{opacity:.4}50%{opacity:1}}
.typing-dots{animation:typingPulse 1.2s ease-in-out infinite}
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
.it-right{flex:1;background:var(--s2);display:flex;align-items:flex-start;justify-content:center;padding:32px;overflow-y:auto}
.it-right::-webkit-scrollbar{width:4px}.it-right::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.it-preview{width:100%;max-width:400px;background:var(--s);border-radius:16px;border:1px solid var(--bl);min-height:480px;display:flex;flex-direction:column;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.04);margin-top:auto;margin-bottom:auto}
.it-pv-empty{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:32px;text-align:center}
.it-pv-ic{width:56px;height:56px;border-radius:50%;background:var(--s3);display:flex;align-items:center;justify-content:center;margin-bottom:14px;font-size:22px}
.it-pv-t{font-size:14px;font-weight:700;color:var(--t2);margin-bottom:4px}
.it-pv-d{font-size:11px;color:var(--t3);line-height:1.6;margin-bottom:20px}
.it-pv-skel{width:100%;padding:0 24px}
.it-pv-skel-line{height:10px;background:var(--s3);border-radius:5px;margin-bottom:8px}
.it-pv-skel-line.w60{width:60%}.it-pv-skel-line.w80{width:80%}.it-pv-skel-line.w40{width:40%}
.it-pv-skel-block{height:80px;background:var(--s3);border-radius:10px;margin:8px 0}
/* xhs preview */
.xhs-tabs{display:flex;gap:8px;margin-bottom:14px}
.xhs-tab{padding:8px 18px;border-radius:20px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--bl);background:var(--s);color:var(--t2);font-family:inherit;transition:var(--tr)}.xhs-tab:hover{border-color:var(--pl);color:var(--p)}.xhs-tab.on{background:var(--p);color:#fff;border-color:var(--p)}
.xhs-card{background:var(--s);border-radius:16px;border:1px solid var(--bl);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.04)}
.xhs-card-hd{padding:16px 20px;border-bottom:1px solid var(--bl);display:flex;align-items:center;gap:8px}
.xhs-card-hd-ic{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#FF2442,#FF6680);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}
.xhs-card-hd-t{font-size:14px;font-weight:700;color:var(--t1)}.xhs-card-hd-d{font-size:11px;color:var(--t3)}
.xhs-sec{padding:16px 20px;border-bottom:1px solid var(--bl)}
.xhs-sec:last-child{border-bottom:none}
.xhs-sec-t{font-size:12px;font-weight:700;color:var(--t2);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.xhs-title-opt{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;border:1px solid var(--bl);margin-bottom:8px;cursor:pointer;transition:var(--tr);font-size:13px;color:var(--t1)}
.xhs-title-opt:hover{border-color:var(--pl);background:var(--s2)}.xhs-title-opt:hover svg{color:var(--p)}
.xhs-title-opt svg{color:var(--t3);flex-shrink:0}
.xhs-title-n{width:22px;height:22px;border-radius:50%;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--t3);flex-shrink:0}
.xhs-content{font-size:13px;line-height:1.85;color:var(--t1);white-space:pre-wrap;word-break:break-word}
.xhs-tags{display:flex;flex-wrap:wrap;gap:6px}
.xhs-tag{padding:4px 12px;border-radius:14px;background:#FFF0F1;color:#FF2442;font-size:11px;font-weight:500}
.xhs-meta{font-size:12px;color:var(--t2);line-height:1.7;padding:10px 14px;background:var(--s2);border-radius:10px;border:1px solid var(--bl)}
.xhs-copy-all{width:100%;padding:12px;border-radius:0 0 16px 16px;border:none;border-top:1px solid var(--bl);background:var(--s);color:var(--p);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:var(--tr)}.xhs-copy-all:hover{background:var(--pbg)}
.xhs-copy-btn{font-size:11px;color:var(--p);font-weight:600;cursor:pointer;display:flex;align-items:center;gap:4px;background:none;border:none;font-family:inherit;padding:0}.xhs-copy-btn:hover{opacity:.7}
/* xhs analysis result */
.xhs-result{margin-bottom:14px}
.xhs-res-banner{padding:16px;border-radius:14px;border:1px solid var(--bl);background:var(--s);margin-bottom:16px;position:relative;overflow:hidden}
.xhs-res-banner::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,var(--p),var(--pl),var(--p));opacity:.7}
.xhs-res-stats{display:flex;gap:0;margin-top:14px}
.xhs-res-stat{flex:1;text-align:center;padding:10px 0;position:relative}
.xhs-res-stat:not(:last-child)::after{content:'';position:absolute;right:0;top:20%;height:60%;width:1px;background:var(--bl)}
.xhs-res-stat-n{font-size:20px;font-weight:800;color:var(--p);letter-spacing:-.5px}
.xhs-res-stat-l{font-size:10px;color:var(--t3);margin-top:2px}
.xhs-style-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:12px}
.xhs-style-hd-t{font-size:13px;font-weight:700;color:var(--t1)}
.xhs-style-hd-ct{font-size:10px;color:var(--t3)}
.xhs-style-list{display:flex;flex-direction:column;gap:8px;margin-bottom:14px}
.xhs-style-card{padding:14px 16px;border-radius:12px;border:1.5px solid var(--bl);background:var(--s);cursor:pointer;transition:all .2s;position:relative}
.xhs-style-card:hover{border-color:var(--b);box-shadow:0 2px 8px rgba(0,0,0,.04)}
.xhs-style-card.on{border-color:var(--pl);background:var(--pbg);box-shadow:0 2px 12px rgba(124,58,237,.08)}
.xhs-style-card .xsc-top{display:flex;align-items:center;gap:10px}
.xhs-style-card .xsc-ck{width:18px;height:18px;border-radius:6px;border:1.5px solid var(--b);background:var(--s);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s}
.xhs-style-card.on .xsc-ck{border-color:var(--p);background:var(--p)}
.xhs-style-card .xsc-ic{width:36px;height:36px;border-radius:10px;background:var(--s3);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;transition:all .15s}
.xhs-style-card.on .xsc-ic{background:rgba(124,58,237,.1)}
.xhs-style-card .xsc-name{font-size:13px;font-weight:700;color:var(--t1)}
.xhs-style-card .xsc-right{display:flex;align-items:center;gap:6px;margin-left:auto;flex-shrink:0}
.xhs-style-card .xsc-freq{font-size:10px;color:var(--t3);font-variant-numeric:tabular-nums}
.xhs-style-card .xsc-badge{font-size:9px;font-weight:600;padding:2px 8px;border-radius:10px;white-space:nowrap}
.xhs-style-card .xsc-badge.s{background:var(--pbg);color:var(--p)}
.xhs-style-card .xsc-badge.a{background:#ECFDF5;color:#059669}
.xhs-style-card .xsc-badge.b{background:var(--s3);color:var(--t3)}
.xhs-style-card .xsc-reason{font-size:11px;color:var(--t2);line-height:1.5;margin-top:6px;padding-left:28px}
.xhs-style-card.on .xsc-reason{color:var(--t1)}
.xhs-resrch-btn{font-size:11px;color:var(--t3);background:none;border:none;cursor:pointer;font-family:inherit;padding:4px 8px;display:flex;align-items:center;gap:4px;border-radius:6px;transition:all .15s;margin-left:auto}
.xhs-resrch-btn:hover{color:var(--p);background:var(--pbg)}
/* douyin preview */
.dy-card{background:var(--s);border-radius:16px;border:1px solid var(--bl);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.04)}
.dy-card-hd{padding:16px 20px;border-bottom:1px solid var(--bl);display:flex;align-items:center;gap:8px}
.dy-card-hd-ic{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#111,#333);color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:700}
.dy-card-hd-t{font-size:14px;font-weight:700;color:var(--t1)}.dy-card-hd-d{font-size:11px;color:var(--t3)}
.dy-sec{padding:16px 20px;border-bottom:1px solid var(--bl)}
.dy-sec:last-child{border-bottom:none}
.dy-sec-t{font-size:12px;font-weight:700;color:var(--t2);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.dy-tags{display:flex;flex-wrap:wrap;gap:6px}
.dy-tag{padding:4px 12px;border-radius:14px;background:#F0F0F0;color:#333;font-size:11px;font-weight:500}
.dy-meta{font-size:12px;color:var(--t2);line-height:1.7;padding:10px 14px;background:var(--s2);border-radius:10px;border:1px solid var(--bl)}
.dy-copy-all{width:100%;padding:12px;border-radius:0 0 16px 16px;border:none;border-top:1px solid var(--bl);background:var(--s);color:var(--p);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:var(--tr)}.dy-copy-all:hover{background:var(--pbg)}
/* wechat preview */
.wx-card{background:var(--s);border-radius:16px;border:1px solid var(--bl);overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,.04)}
.wx-card-hd{padding:16px 20px;border-bottom:1px solid var(--bl);display:flex;align-items:center;gap:8px}
.wx-card-hd-ic{width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#07C160,#06AD56);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
.wx-card-hd-t{font-size:14px;font-weight:700;color:var(--t1)}
.wx-sec{padding:16px 20px;border-bottom:1px solid var(--bl)}
.wx-sec:last-child{border-bottom:none}
.wx-sec-t{font-size:12px;font-weight:700;color:var(--t2);margin-bottom:10px;display:flex;align-items:center;gap:6px}
.wx-summary{padding:12px 14px;border-radius:10px;background:linear-gradient(135deg,#F0FAF4,#FFF);border:1px solid #C8E6D0;font-size:13px;color:#15803D;line-height:1.7;font-style:italic}
.wx-content{font-size:13px;line-height:1.85;color:var(--t1);white-space:pre-wrap;word-break:break-word}
.wx-tags{display:flex;flex-wrap:wrap;gap:6px}
.wx-tag{padding:4px 12px;border-radius:14px;background:#E8F8EE;color:#07C160;font-size:11px;font-weight:500}
.wx-copy-all{width:100%;padding:12px;border-radius:0 0 16px 16px;border:none;border-top:1px solid var(--bl);background:var(--s);color:#07C160;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;transition:var(--tr)}.wx-copy-all:hover{background:#F0FAF4}
/* schedule page */
.sch-wrap{display:flex;height:calc(100vh - 52px);overflow:hidden}
.sch-main{flex:1;display:flex;flex-direction:column;overflow:hidden}
.sch-top{padding:12px 24px;display:flex;align-items:center;gap:14px;border-bottom:1px solid var(--bl);background:var(--s)}
.sch-month-title{font-size:20px;font-weight:800;color:var(--t1);white-space:nowrap;letter-spacing:-.3px}
.sch-nav-arrows{display:flex;gap:4px}
.sch-nav-arr{width:28px;height:28px;border-radius:50%;border:none;background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--t2);transition:var(--tr);font-family:inherit}.sch-nav-arr:hover{background:var(--s3);color:var(--t1)}
.sch-today-btn{padding:4px 12px;border-radius:16px;font-size:12px;font-weight:600;cursor:pointer;border:1.5px solid var(--bl);background:var(--s);color:var(--t1);font-family:inherit;transition:var(--tr)}.sch-today-btn:hover{border-color:var(--p);color:var(--p)}
.sch-legend{display:flex;gap:14px;margin-left:auto;font-size:11px;color:var(--t2)}
.sch-legend span{display:flex;align-items:center;gap:5px}
.sch-legend span::before{content:'';width:8px;height:8px;border-radius:2px;flex-shrink:0}
.sch-legend .lg-sell::before{background:#3B82F6}.sch-legend .lg-edu::before{background:#10B981}.sch-legend .lg-story::before{background:var(--p)}.sch-legend .lg-daily::before{background:#F59E0B}
.sch-pub{display:flex;gap:8px;margin-left:12px}
.sch-pub-btn{padding:7px 18px;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;transition:var(--tr);display:flex;align-items:center;gap:5px}
.sch-pub-btn.pri{border:none;background:var(--p);color:#fff;box-shadow:0 1px 4px rgba(124,58,237,.18)}.sch-pub-btn.pri:hover{background:var(--pd)}
.sch-pub-btn.sec{border:1.5px solid var(--bl);background:var(--s);color:var(--t2)}.sch-pub-btn.sec:hover{border-color:var(--t3)}
.sch-cal{flex:1;overflow:auto;padding:0 16px 16px}
.sch-grid-hd{display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid var(--bl)}
.sch-grid-hd span{padding:8px 0;font-size:11px;font-weight:600;color:var(--t3);text-align:center;text-transform:uppercase;letter-spacing:.5px}
.sch-grid{display:grid;grid-template-columns:repeat(7,1fr)}
.sch-cell{border-bottom:1px solid color-mix(in srgb,var(--bl) 60%,transparent);border-right:1px solid color-mix(in srgb,var(--bl) 60%,transparent);min-height:120px;padding:8px;background:var(--s);cursor:pointer;transition:background .12s}
.sch-cell:nth-child(7n){border-right:none}
.sch-cell:hover{background:var(--s2)}
.sch-cell.dim{opacity:.35;min-height:90px}.sch-cell.dim:hover{opacity:.5}
.sch-cell.today{background:var(--s)}
.sch-cell-hd{display:flex;align-items:center;gap:6px;margin-bottom:6px}
.sch-day-n{font-size:13px;font-weight:500;color:var(--t2);width:28px;height:28px;display:inline-flex;align-items:center;justify-content:center;border-radius:50%;transition:background .15s}
.sch-cell:hover .sch-day-n{background:var(--s3)}
.sch-cell.dim .sch-day-n{color:var(--t3);font-weight:400}
.sch-cell.today .sch-day-n{background:var(--p);color:#fff;font-weight:700;font-size:13px}
.sch-task-count{font-size:10px;color:var(--t3);font-weight:400}
.sch-pill{display:flex;align-items:center;gap:5px;padding:4px 8px;margin-bottom:2px;border-radius:6px;font-size:11px;line-height:1;cursor:pointer;transition:opacity .12s;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;color:#fff;font-weight:500}
.sch-pill:hover{opacity:.85}
.sch-pill-time{font-size:10px;opacity:.85;flex-shrink:0}
.sch-pill-title{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.sch-pill-icon{font-size:9px;flex-shrink:0;opacity:.8}
.sch-more{font-size:10px;color:var(--t3);cursor:pointer;margin-top:2px;padding:2px 8px;border-radius:4px;font-weight:500;transition:var(--tr);display:flex;align-items:center;gap:3px}.sch-more:hover{background:var(--s2);color:var(--p)}
.sch-cell.expanded{min-height:auto;z-index:2;background:var(--s);box-shadow:0 4px 16px rgba(0,0,0,.08)}
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
.sch-ov{position:fixed;inset:0;background:rgba(0,0,0,.45);backdrop-filter:blur(6px);z-index:100;display:flex;align-items:center;justify-content:center}
.sch-mdl{background:var(--s);border-radius:20px;width:94%;max-width:920px;max-height:88vh;display:flex;box-shadow:0 24px 80px rgba(0,0,0,.18);animation:mIn .25s ease;overflow:hidden}
.sch-mdl-main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.sch-mdl-hd{padding:20px 28px 16px;border-bottom:1px solid var(--bl);display:flex;justify-content:space-between;align-items:flex-start}
.sch-mdl-t{font-size:18px;font-weight:800}
.sch-mdl-tabs{display:flex;border:1.5px solid var(--bl);border-radius:10px;overflow:hidden;margin:0 28px}
.sch-mdl-tab{flex:1;padding:9px;text-align:center;font-size:12px;font-weight:600;cursor:pointer;background:var(--s);color:var(--t2);font-family:inherit;border:none;transition:var(--tr)}.sch-mdl-tab:not(:last-child){border-right:1.5px solid var(--bl)}
.sch-mdl-tab.on{background:var(--p);color:#fff}
.sch-mdl-body{flex:1;overflow-y:auto;padding:20px 28px 24px}
.sch-mdl-body::-webkit-scrollbar{width:4px}.sch-mdl-body::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
/* sections */
.sch-section{margin-bottom:20px}
.sch-section-t{font-size:13px;font-weight:700;color:var(--t1);margin-bottom:10px;display:flex;align-items:center;gap:8px}
.sch-step-n{width:22px;height:22px;border-radius:7px;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;font-size:11px;font-weight:800;display:inline-flex;align-items:center;justify-content:center;flex-shrink:0}
.sch-required{font-size:10px;color:var(--r);font-weight:600;padding:2px 8px;border-radius:4px;background:#FEF2F2}
/* platforms */
.sch-plats{display:flex;gap:8px;flex-wrap:wrap}
.sch-plat-chip{display:flex;align-items:center;gap:6px;padding:7px 16px;border-radius:20px;border:1.5px solid var(--bl);cursor:pointer;font-size:12px;font-weight:600;color:var(--t2);transition:var(--tr);background:var(--s)}
.sch-plat-chip:hover{border-color:var(--pc);color:var(--pc)}
.sch-plat-chip.on{border-color:var(--pc);background:var(--pbg2);color:var(--pc);box-shadow:0 0 0 2px color-mix(in srgb,var(--pc) 15%,transparent)}
.sch-plat-dot{width:8px;height:8px;border-radius:50%;flex-shrink:0}
.sch-pick-label{font-size:12px;font-weight:600;color:var(--t1);margin-bottom:8px}
.sch-acct-chips{display:flex;flex-wrap:wrap;gap:8px}
.sch-pick-chip{display:flex;align-items:center;gap:8px;padding:7px 14px;border-radius:20px;border:1.5px solid var(--bl);cursor:pointer;font-size:12px;font-weight:600;color:var(--t2);transition:var(--tr);background:var(--s)}
.sch-pick-chip:hover{border-color:var(--pc);color:var(--pc)}
.sch-pick-chip.on{border-color:var(--pc);background:var(--pbg2);color:var(--pc);box-shadow:0 0 0 2px color-mix(in srgb,var(--pc) 15%,transparent)}
.sch-pick-chip .spc-tag{font-size:9px;font-weight:500;padding:1px 6px;border-radius:6px;background:var(--pc);color:#fff;opacity:.85}
.sch-pick-chip .spc-ck{width:14px;height:14px;border-radius:50%;border:1.5px solid var(--bl);display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:var(--tr)}
.sch-pick-chip.on .spc-ck{background:var(--pc);border-color:var(--pc)}
.sch-acct-empty-hint{font-size:11px;color:var(--t3);padding:10px 14px;border-radius:10px;background:var(--s2);border:1px dashed var(--bl);text-align:center}
/* content type toggle */
.sch-type-toggle{display:flex;gap:8px;margin-bottom:12px}
.sch-type-btn{flex:1;display:flex;align-items:center;gap:8px;padding:12px 16px;border-radius:12px;border:1.5px solid var(--bl);cursor:pointer;transition:var(--tr);background:var(--s)}
.sch-type-btn:hover{border-color:var(--pl);background:var(--s2)}
.sch-type-btn.on{border-color:var(--p);background:var(--pbg);box-shadow:0 0 0 2px var(--pg)}
.sch-type-btn span{font-size:13px;font-weight:600;color:var(--t1)}
.sch-type-btn.on span{color:var(--p)}
.sch-type-desc{font-size:10px!important;font-weight:400!important;color:var(--t3)!important;margin-left:auto}
/* video upload */
.sch-video-add{width:100%;padding:28px;border:2px dashed var(--bl);border-radius:14px;display:flex;flex-direction:column;align-items:center;gap:6px;cursor:pointer;color:var(--t3);font-size:12px;transition:var(--tr)}
.sch-video-add:hover{border-color:var(--p);color:var(--p);background:var(--pbg)}
.sch-video-preview{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:14px;background:var(--s2);border:1px solid var(--bl);width:100%}
.sch-video-icon{width:44px;height:44px;border-radius:10px;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;display:flex;align-items:center;justify-content:center;flex-shrink:0}
.sch-video-info{flex:1;min-width:0}
/* media upload zone */
.sch-media-zone{display:flex;gap:10px;flex-wrap:wrap}
.sch-media-add{width:100px;height:100px;border:2px dashed var(--bl);border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;cursor:pointer;color:var(--t3);font-size:11px;gap:3px;transition:var(--tr);flex-shrink:0}
.sch-media-add:hover{border-color:var(--p);color:var(--p);background:var(--pbg)}
.sch-media-item{width:100px;height:100px;border-radius:12px;overflow:hidden;position:relative;border:1px solid var(--bl)}
.sch-media-item img{width:100%;height:100%;object-fit:cover}
.sch-media-del{position:absolute;top:4px;right:4px;width:20px;height:20px;border-radius:50%;background:rgba(0,0,0,.6);color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;opacity:0;transition:var(--tr)}
.sch-media-item:hover .sch-media-del{opacity:1}
.sch-media-cover{position:absolute;bottom:0;left:0;right:0;background:linear-gradient(transparent,rgba(124,58,237,.8));color:#fff;font-size:9px;font-weight:700;text-align:center;padding:2px 0 3px;letter-spacing:1px}
.sch-media-hint{font-size:11px;color:var(--r);margin-top:6px;display:flex;align-items:center;gap:4px}
/* article mode hover effects */
.sch-cover-dashed:hover{border-color:var(--p) !important}
div:hover>.sch-inline-del{opacity:1 !important}
/* content inputs */
.sch-inp-title{width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid var(--bl);font-size:15px;font-weight:700;font-family:inherit;outline:none;color:var(--t1);background:var(--s);transition:var(--tr)}
.sch-inp-title:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.sch-inp-title::placeholder{color:var(--t3);font-weight:400}
.sch-inp-content{width:100%;padding:12px 16px;border-radius:12px;border:1.5px solid var(--bl);font-size:13px;font-family:inherit;outline:none;color:var(--t1);background:var(--s);resize:vertical;line-height:1.6;transition:var(--tr);margin-top:10px}
.sch-inp-content:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.sch-inp-content::placeholder{color:var(--t3)}
/* time grid */
.sch-time-grid{display:flex;gap:12px;flex-wrap:wrap;align-items:flex-end}
.sch-time-item{flex:1;min-width:140px}
.sch-time-lbl{font-size:11px;color:var(--t3);margin-bottom:5px;display:flex;align-items:center;gap:4px}
.sch-time-inp{width:100%;padding:10px 14px;border-radius:10px;border:1.5px solid var(--bl);font-size:13px;font-family:inherit;outline:none;color:var(--t1);background:var(--s);transition:var(--tr)}
.sch-time-inp:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.sch-colors{display:flex;gap:6px;flex-wrap:wrap}
.sch-color-tag{padding:6px 12px;border-radius:8px;font-size:11px;font-weight:600;cursor:pointer;border:1.5px solid var(--bl);color:var(--t2);transition:var(--tr);background:var(--s)}
.sch-color-tag:hover{border-color:var(--cc);color:var(--cc)}
.sch-color-tag.on{border-color:var(--cc);background:color-mix(in srgb,var(--cc) 10%,transparent);color:var(--cc);font-weight:700}
/* footer */
.sch-mdl-foot{display:flex;align-items:center;gap:8px;padding:14px 28px;border-top:1px solid var(--bl)}
.sch-foot-info{flex:1;font-size:11px;color:var(--t3)}
.sch-mdl-foot .sch-f-btn{padding:10px 28px;border-radius:12px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;transition:var(--tr)}
.sch-f-cancel{border:1px solid var(--bl);background:var(--s);color:var(--t2)}.sch-f-cancel:hover{background:var(--s3)}
.sch-f-confirm{border:none;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;box-shadow:0 4px 14px rgba(124,58,237,.3)}.sch-f-confirm:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.35)}
.sch-f-confirm:disabled{opacity:.5;cursor:not-allowed;transform:none}
/* AI sidebar */
.sch-ai{width:280px;min-width:280px;background:var(--s2);border-left:1px solid var(--bl);padding:20px;display:flex;flex-direction:column;overflow-y:auto}
.sch-ai::-webkit-scrollbar{width:4px}.sch-ai::-webkit-scrollbar-thumb{background:var(--b);border-radius:2px}
.sch-ai-head{display:flex;align-items:center;gap:10px;margin-bottom:16px}
.sch-ai-icon{width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#F59E0B,#F97316);display:flex;align-items:center;justify-content:center;color:#fff}
.sch-ai-t{font-size:14px;font-weight:800}
.sch-ai-btn{width:100%;padding:11px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;font-size:12px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:6px;margin-bottom:16px;transition:var(--tr);box-shadow:0 4px 14px rgba(124,58,237,.2)}
.sch-ai-btn:hover{transform:translateY(-1px);box-shadow:0 6px 20px rgba(124,58,237,.3)}
.sch-ai-btn:disabled{opacity:.7;cursor:not-allowed;transform:none}
.sch-schedule-row{display:flex;align-items:center;gap:10px}
.sch-schedule-picker{display:flex;align-items:center;flex:1;background:var(--s);border:1.5px solid var(--bl);border-radius:12px;overflow:hidden;transition:var(--tr)}
.sch-schedule-picker:focus-within{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.sch-picker-item{display:flex;align-items:center;gap:8px;padding:10px 14px;flex:1}
.sch-picker-divider{width:1px;height:24px;background:var(--bl);flex-shrink:0}
.sch-date-inp{border:none;outline:none;background:transparent;font-size:13px;font-family:inherit;color:var(--t1);width:100%;cursor:pointer}
.sch-date-inp::-webkit-calendar-picker-indicator{cursor:pointer;opacity:.5}
.sch-time-hint{font-size:10px;color:var(--t3);margin-top:6px;padding-left:2px}
.sch-ai-inline-btn{padding:10px 16px;border-radius:12px;border:none;background:linear-gradient(135deg,var(--p),var(--pl));color:#fff;font-size:11px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;gap:5px;transition:var(--tr);box-shadow:0 3px 10px rgba(124,58,237,.2);white-space:nowrap}
.sch-ai-inline-btn:hover{transform:translateY(-1px);box-shadow:0 5px 16px rgba(124,58,237,.3)}
.sch-ai-inline-btn:disabled{opacity:.7;cursor:not-allowed;transform:none}
.sch-ai-spin{width:14px;height:14px;border:2px solid rgba(255,255,255,.3);border-top-color:#fff;border-radius:50%;animation:spin .6s linear infinite;flex-shrink:0}
.sch-ai-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:30px 10px;color:var(--t3);font-size:12px;text-align:center}
.sch-ai-analysis{background:var(--s);border:1px solid var(--bl);border-radius:12px;padding:12px;margin-bottom:14px}
.sch-ai-analysis-row{font-size:11px;color:var(--t2);margin-bottom:6px;display:flex;align-items:flex-start;gap:6px;line-height:1.4}
.sch-ai-analysis-row:last-child{margin-bottom:0}
.sch-ai-tag{font-size:9px;font-weight:700;padding:2px 8px;border-radius:4px;background:var(--pbg);color:var(--p);flex-shrink:0;white-space:nowrap}
.sch-ai-lbl{font-size:11px;font-weight:700;color:var(--t3);margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px}
.sch-ai-card{padding:14px;background:var(--s);border-radius:14px;margin-bottom:8px;cursor:pointer;border:1.5px solid var(--bl);transition:var(--tr)}
.sch-ai-card:hover{border-color:var(--p);transform:translateY(-2px);box-shadow:0 6px 20px rgba(124,58,237,.1)}
.sch-ai-card-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px}
.sch-ai-card-time{font-size:18px;font-weight:800;color:var(--p)}
.sch-ai-card-score{font-size:16px;font-weight:800;color:var(--o)}.sch-ai-card-score span{font-size:11px;font-weight:400;color:var(--t3)}
.sch-ai-card-range{font-size:10px;color:var(--t3);margin-bottom:6px}
.sch-ai-card-reason{font-size:11px;color:var(--t2);line-height:1.5;margin-bottom:6px}
.sch-ai-card-tip{font-size:10px;color:var(--p);display:flex;align-items:flex-start;gap:4px;padding:6px 8px;background:var(--pbg);border-radius:6px;line-height:1.4;margin-bottom:6px}
.sch-ai-card-use{font-size:10px;color:var(--t3);text-align:center;opacity:0;transition:var(--tr)}
.sch-ai-card:hover .sch-ai-card-use{opacity:1;color:var(--p)}
/* account panel */
.sch-acct-panel{background:var(--s);border:1px solid var(--bl);border-radius:14px;padding:16px;margin-bottom:14px}
.sch-acct-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
.sch-acct-hd-t{font-size:13px;font-weight:700;display:flex;align-items:center;gap:5px}
.sch-acct-add-btn{display:flex;align-items:center;gap:4px;padding:5px 14px;border-radius:8px;border:1.5px dashed var(--p);background:var(--pbg);color:var(--p);font-size:11px;font-weight:600;cursor:pointer;transition:var(--tr);font-family:inherit}
.sch-acct-add-btn:hover{background:var(--p);color:#fff;border-style:solid}
.sch-acct-empty{text-align:center;padding:18px 10px;color:var(--t3)}
.sch-acct-empty-icon{font-size:28px;margin-bottom:6px;opacity:.4}
.sch-acct-empty-t{font-size:12px;font-weight:500}
.sch-acct-empty-d{font-size:10px;margin-top:2px}
.sch-acct-item{display:flex;align-items:flex-start;gap:10px;padding:10px 12px;border-radius:10px;background:var(--s2);margin-bottom:6px;transition:var(--tr)}
.sch-acct-item:hover{background:var(--s3)}
.sch-acct-plat{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:800;color:#fff;flex-shrink:0;margin-top:2px}
.sch-acct-body{flex:1;min-width:0;display:flex;flex-direction:column;gap:6px}
.sch-acct-row1{display:flex;align-items:center;justify-content:space-between;gap:6px}
.sch-acct-info{display:flex;align-items:baseline;gap:6px;min-width:0;flex:1}
.sch-acct-name{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.sch-acct-plat-name{font-size:10px;color:var(--t3);white-space:nowrap;flex-shrink:0}
.sch-acct-row2{display:flex;align-items:center;gap:6px}
.sch-acct-status{font-size:9px;font-weight:600;padding:3px 8px;border-radius:6px;white-space:nowrap}
.sch-acct-act{font-size:10px;padding:3px 10px;border-radius:6px;cursor:pointer;font-weight:600;border:none;font-family:inherit;transition:var(--tr)}
.sch-acct-act.login{background:var(--p);color:#fff}.sch-acct-act.login:hover{background:var(--pd)}
.sch-acct-act.del{background:none;color:var(--t3);padding:3px 4px}.sch-acct-act.del:hover{color:var(--r)}
/* nice modals */
.sch-nice-modal{background:var(--s);border-radius:20px;box-shadow:0 24px 80px rgba(0,0,0,.2);overflow:hidden;animation:mIn .2s ease}
.sch-nm-hd{padding:24px 28px 0;display:flex;justify-content:space-between;align-items:center}
.sch-nm-t{font-size:18px;font-weight:800}
.sch-nm-body{padding:20px 28px 28px}
.sch-nm-plat-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:20px}
.sch-nm-plat-card{padding:16px;border-radius:12px;border:2px solid var(--bl);cursor:pointer;transition:var(--tr);text-align:center}
.sch-nm-plat-card:hover{border-color:var(--pl);transform:translateY(-2px);box-shadow:0 4px 14px rgba(0,0,0,.06)}
.sch-nm-plat-card.on{border-color:var(--p);background:var(--pbg);box-shadow:0 0 0 3px var(--pg)}
.sch-nm-plat-icon{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:800;color:#fff;margin:0 auto 8px}
.sch-nm-plat-name{font-size:13px;font-weight:700}
.sch-nm-plat-desc{font-size:10px;color:var(--t3);margin-top:2px}
.sch-nm-input{width:100%;padding:12px 16px;border-radius:10px;border:1.5px solid var(--bl);font-size:13px;font-family:inherit;outline:none;transition:var(--tr);background:var(--s);color:var(--t1)}
.sch-nm-input:focus{border-color:var(--p);box-shadow:0 0 0 3px var(--pg)}
.sch-nm-input::placeholder{color:var(--t3)}
.sch-nm-footer{display:flex;gap:10px;justify-content:flex-end;margin-top:20px}
.sch-nm-btn{padding:10px 28px;border-radius:10px;font-size:13px;font-weight:600;cursor:pointer;border:none;font-family:inherit;transition:var(--tr)}
.sch-nm-btn.pri{background:var(--p);color:#fff;box-shadow:0 4px 12px rgba(124,58,237,.25)}.sch-nm-btn.pri:hover{background:var(--pd);transform:translateY(-1px)}
.sch-nm-btn.sec{background:var(--s2);color:var(--t2);border:1px solid var(--bl)}.sch-nm-btn.sec:hover{background:var(--s3)}
/* qr modal */
.sch-qr-wrap{text-align:center;padding:8px 0}
.sch-qr-title{font-size:20px;font-weight:800;margin-bottom:4px}
.sch-qr-sub{font-size:12px;color:var(--t3);margin-bottom:20px}
.sch-qr-img{max-width:100%;border-radius:12px;border:2px solid var(--bl);box-shadow:0 8px 30px rgba(0,0,0,.08)}
.sch-qr-loading{padding:60px 0;color:var(--t3);font-size:13px}
.sch-qr-loading::before{content:'';display:block;width:36px;height:36px;border:3px solid var(--bl);border-top-color:var(--p);border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 12px}
@keyframes spin{to{transform:rotate(360deg)}}
.sch-qr-success{padding:50px 0}
.sch-qr-success-icon{width:56px;height:56px;border-radius:50%;background:#DCFCE7;display:flex;align-items:center;justify-content:center;margin:0 auto 12px;font-size:24px}
.sch-qr-success-t{font-size:16px;font-weight:700;color:#16A34A}
.sch-qr-error{padding:50px 0;color:var(--r);font-size:13px}
/* task detail modal */
.sch-td-header{display:flex;gap:12px;align-items:flex-start;margin-bottom:16px}
.sch-td-plat{width:40px;height:40px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:800;color:#fff;flex-shrink:0}
.sch-td-info{flex:1}
.sch-td-title{font-size:16px;font-weight:700}
.sch-td-meta{font-size:11px;color:var(--t3);margin-top:3px;display:flex;gap:8px;align-items:center}
.sch-td-status{display:inline-flex;align-items:center;gap:4px;font-size:11px;font-weight:600;padding:4px 12px;border-radius:8px}
.sch-td-error{font-size:11px;padding:10px 14px;background:#FEF2F2;border:1px solid #FECACA;border-radius:10px;color:#B91C1C;margin-bottom:14px;line-height:1.5}
.sch-td-link{font-size:12px;padding:10px 14px;background:var(--pbg);border:1px solid var(--pl);border-radius:10px;margin-bottom:14px}
.sch-td-link a{color:var(--p);font-weight:600;text-decoration:none}.sch-td-link a:hover{text-decoration:underline}
.sch-td-actions{display:flex;gap:8px;margin-top:16px}
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
                if(it.action==="modal"){
                  // If there's an ongoing creation session, resume it instead of opening new modal
                  if(activeCreatePg.current){setPg(activeCreatePg.current);}
                  else openModal();
                }
                else setPg(it.k);
              }}>
              {it.icon} {it.label}
              {it.k==="history"&&creationHistory.length>0&&<span className="sb-tag" style={{background:"var(--pbg)",color:"var(--p)"}}>{creationHistory.length}</span>}
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
        {/* floating generation banner */}
        {activeCreatePg.current&&!pg.startsWith("create")&&isCreating&&<div style={{position:"sticky",top:0,zIndex:90,padding:"10px 20px",background:"linear-gradient(135deg,#7C3AED,#6D28D9)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",animation:"mIn .3s ease"}} onClick={()=>setPg(activeCreatePg.current)}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{display:"inline-block",width:16,height:16,border:"2.5px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0}}/>
            <span style={{fontSize:13,fontWeight:600}}>{vidGenBusy?(sbGenStatus||"图片/视频生成中…"):"AI正在生成脚本…"}</span>
            <span style={{fontSize:12,opacity:.8}}>（{prod} · {dur}）</span>
          </div>
          <span style={{fontSize:12,fontWeight:600,padding:"4px 14px",background:"rgba(255,255,255,.2)",borderRadius:6}}>返回查看 →</span>
        </div>}
        {activeCreatePg.current&&!pg.startsWith("create")&&cs==="results"&&aiScripts.length>0&&<div style={{position:"sticky",top:0,zIndex:90,padding:"10px 20px",background:"linear-gradient(135deg,#059669,#10B981)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",cursor:"pointer",animation:"mIn .3s ease"}} onClick={()=>setPg(activeCreatePg.current)}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <I.Check/>
            <span style={{fontSize:13,fontWeight:600}}>脚本生成完成！共 {aiScripts.length} 个方案</span>
            <span style={{fontSize:12,opacity:.8}}>（{prod}）</span>
          </div>
          <span style={{fontSize:12,fontWeight:600,padding:"4px 14px",background:"rgba(255,255,255,.2)",borderRadius:6}}>返回查看 →</span>
        </div>}
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
                <div className="bn-mode" onClick={()=>{setPg("create-deep");setCs("input");activeCreatePg.current="create-deep";}}>
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
        {pg==="avatar"&&<AvatarStudio/>}
        {pg==="comic-drama"&&<ComicDrama/>}
        {pg==="storyboard-wb"&&<StoryboardWorkbench/>}
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

              {itPlat==="小红书"?<>
              <div className="it-fg">
                <div className="it-fg-l">产品/服务名称 <span style={{color:"#EF4444"}}>*</span></div>
                <input className="it-inp" value={xhsProd} onChange={e=>setXhsProd(e.target.value)} placeholder="如：海外社媒代运营、美白面霜、在线英语课..."/>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">目标受众 <span className="it-fg-ct">选填</span></div>
                <input className="it-inp" value={xhsAudience} onChange={e=>setXhsAudience(e.target.value)} placeholder="如：想出海的品牌方、25-35岁女性、大学生..."/>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">核心卖点 <span className="it-fg-ct">选填，多个卖点用逗号分隔</span></div>
                <textarea className="it-inp" rows={3} value={xhsSelling} onChange={e=>setXhsSelling(e.target.value)} placeholder="如：3年+经验、数据驱动增长、中英双语服务、按效果付费..." style={{resize:"vertical"}}/>
              </div>

              {/* 第一步按钮：搜索爆款 */}
              {(xhsPhase===""||xhsPhase==="search")&&<>
              <button className="it-gen-btn" onClick={searchXhs} disabled={xhsBusy} style={xhsBusy?{opacity:.7,cursor:"wait"}:{}}>
                {xhsBusy?<><I.Search/> 正在搜索同行爆款笔记...</>:<><I.Search/> 搜索同行爆款</>}
              </button>
              {xhsBusy&&<div style={{padding:"12px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)",marginBottom:12}}>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <div style={{flex:1,height:4,borderRadius:2,background:"var(--pl)",transition:"background .3s"}}/>
                  <div style={{flex:1,height:4,borderRadius:2,background:"var(--s3)"}}/>
                </div>
                <div style={{fontSize:11,color:"var(--t2)"}}>千问 AI 联网搜索小红书爆款笔记，拆解套路并推荐创作风格...</div>
              </div>}
              <div className="it-tip">
                <div className="it-tip-ic" style={{background:"#FFF0F1",color:"#FF2442"}}><I.Bulb/></div>
                <div>
                  <div className="it-tip-t">爆款驱动生成</div>
                  <div className="it-tip-d">AI 自动推导搜索词 → 联网搜索真实爆款 → 拆解套路 → 推荐风格 → 你选风格后生成笔记</div>
                </div>
              </div>
              </>}

              {/* 第二步：拆解完成，展示推荐风格 + 生成按钮 */}
              {(xhsPhase==="analyzed"||xhsPhase==="generate"||xhsPhase==="done")&&<>
              <div className="xhs-result">
                {/* 拆解完成 banner — 原版 */}
                <div style={{padding:"12px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)",marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:6,color:"var(--t1)"}}><I.Check style={{color:"var(--p)"}}/> 爆款拆解完成</div>
                  {xhsAnalysis&&<div style={{fontSize:11,color:"var(--t2)",lineHeight:1.7}}>
                    {xhsAnalysis.searched_notes&&<>已搜索到 <b>{xhsAnalysis.searched_notes.length}</b> 篇爆款笔记</>}
                    {xhsAnalysis.title_formulas&&<>，提炼 <b>{xhsAnalysis.title_formulas.length}</b> 个标题公式</>}
                    {xhsAnalysis.winning_structures&&<>、<b>{xhsAnalysis.winning_structures.length}</b> 种爆款结构</>}
                    {xhsAnalysis.opening_hooks&&<>、<b>{xhsAnalysis.opening_hooks.length}</b> 种开头 Hook</>}
                    {xhsAnalysis.hot_hashtags&&<>，收录 <b>{xhsAnalysis.hot_hashtags.length}</b> 个热门标签</>}
                    。AI 已完成深度拆解，请选择风格后生成笔记。
                  </div>}
                  <button className="xhs-resrch-btn" onClick={()=>{
                    setXhsPhase("");setXhsAnalysis(null);setXhsAnalysisText("");setXhsRecStyles([]);setXhsSelStyles([]);
                  }}><I.Refresh/> 重新搜索</button>
                </div>

                {/* 风格选择 */}
                <div className="xhs-style-hd">
                  <div className="xhs-style-hd-t">选择创作风格</div>
                  <div className="xhs-style-hd-ct">已选 {xhsSelStyles.length} / {xhsRecStyles.length}</div>
                </div>

                <div className="xhs-style-list">
                  {(()=>{const styleIcons={"干货教程":"📚","痛点共鸣":"💡","案例展示":"📊","经验分享":"💬","避坑指南":"🛡️","清单种草":"📋","对比测评":"⚖️","故事营销":"📖"};const badgeCls=m=>m==="高"?"s":m==="中"?"a":"b";const badgeTxt=m=>m==="高"?"S · 强推":m==="中"?"A · 推荐":"B · 可选";return xhsRecStyles.map((r,i)=>{const sel=xhsSelStyles.includes(r.style);return(
                    <div key={i} className={`xhs-style-card${sel?" on":""}`} onClick={()=>setXhsSelStyles(prev=>prev.includes(r.style)?prev.filter(s=>s!==r.style):[...prev,r.style])}>
                      <div className="xsc-top">
                        <div className="xsc-ck">{sel&&<I.Check style={{color:"#fff",width:10,height:10}}/>}</div>
                        <div className="xsc-ic">{styleIcons[r.style]||"✏️"}</div>
                        <span className="xsc-name">{r.style}</span>
                        <div className="xsc-right">
                          {r.match&&<span className={`xsc-badge ${badgeCls(r.match)}`}>{badgeTxt(r.match)}</span>}
                          {r.frequency&&<span className="xsc-freq">{r.frequency}</span>}
                        </div>
                      </div>
                      {r.reason&&<div className="xsc-reason">{r.reason}</div>}
                    </div>
                  );})})()}
                </div>

                {xhsRecStyles.length===0&&<div style={{fontSize:11,color:"var(--t3)",textAlign:"center",padding:20,background:"var(--s2)",borderRadius:12,border:"1px dashed var(--b)"}}>未获取到推荐风格，请重新搜索</div>}
              </div>

              <button className="it-gen-btn" onClick={generateXhsNotes} disabled={xhsBusy||!xhsSelStyles.length} style={xhsBusy?{opacity:.7,cursor:"wait"}:!xhsSelStyles.length?{opacity:.5,cursor:"not-allowed"}:{}}>
                {xhsBusy&&xhsPhase==="generate"?<><I.Sparkle/> 正在生成 {xhsSelStyles.length} 篇笔记...</>:<><I.Sparkle/> 生成 {xhsSelStyles.length} 篇笔记</>}
              </button>
              </>}

              </>:itPlat==="抖音"?<>
              <div className="it-fg">
                <div className="it-fg-l">产品/服务名称 <span style={{color:"#EF4444"}}>*</span></div>
                <input className="it-inp" value={dyProd} onChange={e=>setDyProd(e.target.value)} placeholder="如：健身私教课、防晒霜、编程培训、奶茶加盟..."/>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">目标受众 <span className="it-fg-ct">选填</span></div>
                <input className="it-inp" value={dyAudience} onChange={e=>setDyAudience(e.target.value)} placeholder="如：18-30岁年轻人、宝妈群体、健身爱好者..."/>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">核心卖点 <span className="it-fg-ct">选填，多个卖点用逗号分隔</span></div>
                <textarea className="it-inp" rows={3} value={dySelling} onChange={e=>setDySelling(e.target.value)} placeholder="如：7天见效、一对一指导、无门槛加盟、买一送一..." style={{resize:"vertical"}}/>
              </div>

              {/* 第一步按钮：搜索爆款 */}
              {(dyPhase===""||dyPhase==="search")&&<>
              <button className="it-gen-btn" onClick={searchDy} disabled={dyBusy} style={dyBusy?{opacity:.7,cursor:"wait"}:{}}>
                {dyBusy?<><I.Search/> 正在搜索同行爆款图文...</>:<><I.Search/> 搜索同行爆款</>}
              </button>
              {dyBusy&&<div style={{padding:"12px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)",marginBottom:12}}>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <div style={{flex:1,height:4,borderRadius:2,background:"var(--pl)",transition:"background .3s"}}/>
                  <div style={{flex:1,height:4,borderRadius:2,background:"var(--s3)"}}/>
                </div>
                <div style={{fontSize:11,color:"var(--t2)"}}>千问 AI 联网搜索抖音爆款图文，拆解标题、结构、转化套路...</div>
              </div>}
              <div className="it-tip">
                <div className="it-tip-ic" style={{background:"#F0F0F0",color:"#333"}}><I.Bulb/></div>
                <div>
                  <div className="it-tip-t">爆款驱动生成</div>
                  <div className="it-tip-d">AI 自动推导搜索词 → 联网搜索真实爆款 → 拆解标题、结构、转化套路 → 推荐风格 → 你选风格后生成图文</div>
                </div>
              </div>
              </>}

              {/* 第二步：拆解完成，展示推荐风格 + 生成按钮 */}
              {(dyPhase==="analyzed"||dyPhase==="generate"||dyPhase==="done")&&<>
              <div className="xhs-result">
                <div style={{padding:"12px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)",marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:6,color:"var(--t1)"}}><I.Check style={{color:"var(--p)"}}/> 爆款拆解完成</div>
                  {dyAnalysis&&<div style={{fontSize:11,color:"var(--t2)",lineHeight:1.7}}>
                    {dyAnalysis.searched_notes&&<>已搜索到 <b>{dyAnalysis.searched_notes.length}</b> 篇爆款图文</>}
                    {dyAnalysis.title_formulas&&<>，提炼 <b>{dyAnalysis.title_formulas.length}</b> 个标题公式</>}
                    {dyAnalysis.winning_structures&&<>、<b>{dyAnalysis.winning_structures.length}</b> 种内容结构</>}
                    {dyAnalysis.hot_hashtags&&<>，收录 <b>{dyAnalysis.hot_hashtags.length}</b> 个热门标签</>}
                    。AI 已完成深度拆解，请选择风格后生成图文。
                  </div>}
                  <button className="xhs-resrch-btn" onClick={()=>{
                    setDyPhase("");setDyAnalysis(null);setDyAnalysisText("");setDyRecStyles([]);setDySelStyles([]);
                  }}><I.Refresh/> 重新搜索</button>
                </div>

                <div className="xhs-style-hd">
                  <div className="xhs-style-hd-t">选择创作风格</div>
                  <div className="xhs-style-hd-ct">已选 {dySelStyles.length} / {dyRecStyles.length}</div>
                </div>

                <div className="xhs-style-list">
                  {(()=>{const styleIcons={"干货教程":"📚","产品种草":"🛒","对比测评":"⚖️","避坑指南":"🛡️","清单合集":"📋","经验分享":"💬","热点蹭流":"🔥","痛点解决":"💡"};const badgeCls=m=>m==="高"?"s":m==="中"?"a":"b";const badgeTxt=m=>m==="高"?"S · 强推":m==="中"?"A · 推荐":"B · 可选";return dyRecStyles.map((r,i)=>{const sel=dySelStyles.includes(r.style);return(
                    <div key={i} className={`xhs-style-card${sel?" on":""}`} onClick={()=>setDySelStyles(prev=>prev.includes(r.style)?prev.filter(s=>s!==r.style):[...prev,r.style])}>
                      <div className="xsc-top">
                        <div className="xsc-ck">{sel&&<I.Check style={{color:"#fff",width:10,height:10}}/>}</div>
                        <div className="xsc-ic">{styleIcons[r.style]||"🎬"}</div>
                        <span className="xsc-name">{r.style}</span>
                        <div className="xsc-right">
                          {r.match&&<span className={`xsc-badge ${badgeCls(r.match)}`}>{badgeTxt(r.match)}</span>}
                          {r.frequency&&<span className="xsc-freq">{r.frequency}</span>}
                        </div>
                      </div>
                      {r.reason&&<div className="xsc-reason">{r.reason}</div>}
                    </div>
                  );})})()}
                </div>

                {dyRecStyles.length===0&&<div style={{fontSize:11,color:"var(--t3)",textAlign:"center",padding:20,background:"var(--s2)",borderRadius:12,border:"1px dashed var(--b)"}}>未获取到推荐风格，请重新搜索</div>}
              </div>

              <button className="it-gen-btn" onClick={generateDyNotes} disabled={dyBusy||!dySelStyles.length} style={dyBusy?{opacity:.7,cursor:"wait"}:!dySelStyles.length?{opacity:.5,cursor:"not-allowed"}:{}}>
                {dyBusy&&dyPhase==="generate"?<><I.Sparkle/> 正在生成 {dySelStyles.length} 篇图文...</>:<><I.Sparkle/> 生成 {dySelStyles.length} 篇图文</>}
              </button>
              </>}

              </>:<>
              <div className="it-fg">
                <div className="it-fg-l">产品/服务名称 <span style={{color:"#EF4444"}}>*</span></div>
                <input className="it-inp" value={wxProd} onChange={e=>setWxProd(e.target.value)} placeholder="如：企业管理咨询、少儿编程课、健康食品品牌..."/>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">目标受众 <span className="it-fg-ct">选填</span></div>
                <input className="it-inp" value={wxAudience} onChange={e=>setWxAudience(e.target.value)} placeholder="如：中小企业主、30-45岁家长、职场白领..."/>
              </div>

              <div className="it-fg">
                <div className="it-fg-l">核心卖点 <span className="it-fg-ct">选填，多个卖点用逗号分隔</span></div>
                <textarea className="it-inp" rows={3} value={wxSelling} onChange={e=>setWxSelling(e.target.value)} placeholder="如：10年行业经验、500+成功案例、一对一定制方案..." style={{resize:"vertical"}}/>
              </div>

              {/* 第一步按钮：搜索爆款 */}
              {(wxPhase===""||wxPhase==="search")&&<>
              <button className="it-gen-btn" onClick={searchWx} disabled={wxBusy} style={wxBusy?{opacity:.7,cursor:"wait"}:{}}>
                {wxBusy?<><I.Search/> 正在搜索同行爆款文章...</>:<><I.Search/> 搜索同行爆款</>}
              </button>
              {wxBusy&&<div style={{padding:"12px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)",marginBottom:12}}>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <div style={{flex:1,height:4,borderRadius:2,background:"var(--pl)",transition:"background .3s"}}/>
                  <div style={{flex:1,height:4,borderRadius:2,background:"var(--s3)"}}/>
                </div>
                <div style={{fontSize:11,color:"var(--t2)"}}>千问 AI 联网搜索微信公众号爆款文章，拆解套路并推荐创作风格...</div>
              </div>}
              <div className="it-tip">
                <div className="it-tip-ic" style={{background:"#E8F8EE",color:"#07C160"}}><I.Bulb/></div>
                <div>
                  <div className="it-tip-t">爆款驱动生成</div>
                  <div className="it-tip-d">AI 自动推导搜索词 → 联网搜索真实爆款 → 拆解套路 → 推荐风格 → 你选风格后生成文章</div>
                </div>
              </div>
              </>}

              {/* 第二步：拆解完成，展示推荐风格 + 生成按钮 */}
              {(wxPhase==="analyzed"||wxPhase==="generate"||wxPhase==="done")&&<>
              <div className="xhs-result">
                <div style={{padding:"12px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)",marginBottom:14}}>
                  <div style={{fontSize:12,fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:6,color:"var(--t1)"}}><I.Check style={{color:"#07C160"}}/> 爆款拆解完成</div>
                  {wxAnalysis&&<div style={{fontSize:11,color:"var(--t2)",lineHeight:1.7}}>
                    {wxAnalysis.searched_articles&&<>已搜索到 <b>{wxAnalysis.searched_articles.length}</b> 篇爆款文章</>}
                    {wxAnalysis.title_formulas&&<>，提炼 <b>{wxAnalysis.title_formulas.length}</b> 个标题公式</>}
                    {wxAnalysis.winning_structures&&<>、<b>{wxAnalysis.winning_structures.length}</b> 种内容结构</>}
                    {wxAnalysis.opening_hooks&&<>、<b>{wxAnalysis.opening_hooks.length}</b> 种开头 Hook</>}
                    。AI 已完成深度拆解，请选择风格后生成文章。
                  </div>}
                  <button className="xhs-resrch-btn" onClick={()=>{
                    setWxPhase("");setWxAnalysis(null);setWxAnalysisText("");setWxRecStyles([]);setWxSelStyles([]);
                  }}><I.Refresh/> 重新搜索</button>
                </div>

                <div className="xhs-style-hd">
                  <div className="xhs-style-hd-t">选择创作风格</div>
                  <div className="xhs-style-hd-ct">已选 {wxSelStyles.length} / {wxRecStyles.length}</div>
                </div>

                <div className="xhs-style-list">
                  {(()=>{const styleIcons={"深度长文":"📖","干货清单":"📋","案例拆解":"🔍","观点输出":"💡","故事叙事":"📝","数据报告":"📊","访谈对话":"🎙️","热点评论":"🔥"};const badgeCls=m=>m==="高"?"s":m==="中"?"a":"b";const badgeTxt=m=>m==="高"?"S · 强推":m==="中"?"A · 推荐":"B · 可选";return wxRecStyles.map((r,i)=>{const sel=wxSelStyles.includes(r.style);return(
                    <div key={i} className={`xhs-style-card${sel?" on":""}`} onClick={()=>setWxSelStyles(prev=>prev.includes(r.style)?prev.filter(s=>s!==r.style):[...prev,r.style])}>
                      <div className="xsc-top">
                        <div className="xsc-ck">{sel&&<I.Check style={{color:"#fff",width:10,height:10}}/>}</div>
                        <div className="xsc-ic">{styleIcons[r.style]||"✏️"}</div>
                        <span className="xsc-name">{r.style}</span>
                        <div className="xsc-right">
                          {r.match&&<span className={`xsc-badge ${badgeCls(r.match)}`}>{badgeTxt(r.match)}</span>}
                          {r.frequency&&<span className="xsc-freq">{r.frequency}</span>}
                        </div>
                      </div>
                      {r.reason&&<div className="xsc-reason">{r.reason}</div>}
                    </div>
                  );})})()}
                </div>

                {wxRecStyles.length===0&&<div style={{fontSize:11,color:"var(--t3)",textAlign:"center",padding:20,background:"var(--s2)",borderRadius:12,border:"1px dashed var(--b)"}}>未获取到推荐风格，请重新搜索</div>}
              </div>

              <button className="it-gen-btn" onClick={generateWxArticles} disabled={wxBusy||!wxSelStyles.length} style={wxBusy?{opacity:.7,cursor:"wait"}:!wxSelStyles.length?{opacity:.5,cursor:"not-allowed"}:{}}>
                {wxBusy&&wxPhase==="generate"?<><I.Sparkle/> 正在生成 {wxSelStyles.length} 篇文章...</>:<><I.Sparkle/> 生成 {wxSelStyles.length} 篇文章</>}
              </button>
              </>}

              </>}
            </div>
          </div>

          {/* Right - preview */}
          <div className="it-right">
            {itPlat==="小红书"&&xhsNotes.length>0?
            <div style={{width:"100%",maxWidth:520,display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
              {xhsAnalysis&&xhsAnalysis.searched_notes&&<div style={{padding:"14px 16px",background:"var(--s)",borderRadius:12,border:"1px solid var(--bl)",fontSize:11,color:"var(--t2)",lineHeight:1.8}}>
                <div style={{fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--t1)"}}><I.Search/> 爆款拆解报告</div>
                {xhsAnalysis.search_keywords&&<div style={{marginBottom:6}}>搜索词：{xhsAnalysis.search_keywords.slice(0,6).map((k,i)=><span key={i} style={{display:"inline-block",padding:"2px 8px",borderRadius:10,background:"var(--s3)",marginRight:4,marginBottom:2,fontSize:10}}>{k}</span>)}</div>}
                <div>找到 <b>{xhsAnalysis.searched_notes.length}</b> 篇爆款笔记{xhsAnalysis.title_formulas&&<>，提炼 <b>{xhsAnalysis.title_formulas.length}</b> 个标题公式</>}{xhsAnalysis.winning_structures&&<>，<b>{xhsAnalysis.winning_structures.length}</b> 种内容结构</>}</div>
                {xhsAnalysis.key_insights&&<div style={{marginTop:4,color:"var(--t3)"}}>{xhsAnalysis.key_insights.slice(0,2).join(" · ")}</div>}
              </div>}
              <div className="xhs-tabs">
                {xhsNotes.map((n,i)=>(
                  <button key={i} className={`xhs-tab ${xhsSel===i?"on":""}`} onClick={()=>setXhsSel(i)}>
                    {n.style||("笔记"+(i+1))}
                  </button>
                ))}
              </div>
              {(()=>{const note=xhsNotes[xhsSel];if(!note)return null;return(
              <div className="xhs-card">
                <div className="xhs-card-hd">
                  <div className="xhs-card-hd-ic">XHS</div>
                  <div>
                    <div className="xhs-card-hd-t">{note.style||"小红书笔记"}</div>
                    <div className="xhs-card-hd-d">{xhsProd} · {xhsAnalysis?"基于爆款拆解生成":"AI 生成"}</div>
                  </div>
                </div>

                <div className="xhs-sec">
                  <div className="xhs-sec-t">📌 标题选项 <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>点击复制</span></div>
                  {(note.titles||[]).map((t,i)=>(
                    <div key={i} className="xhs-title-opt" onClick={()=>{navigator.clipboard.writeText(t)}}>
                      <span className="xhs-title-n">{i+1}</span>
                      <span style={{flex:1}}>{t}</span>
                      <I.Copy/>
                    </div>
                  ))}
                </div>

                <div className="xhs-sec">
                  <div className="xhs-sec-t" style={{justifyContent:"space-between"}}>
                    <span>📄 正文内容</span>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <button className="xhs-copy-btn" onClick={()=>{setXhsEditIdx(xhsEditIdx===xhsSel?-1:xhsSel)}}><I.Edit/> {xhsEditIdx===xhsSel?"完成":"编辑"}</button>
                      <button className="xhs-copy-btn" onClick={()=>navigator.clipboard.writeText(note.content||"")}><I.Copy/> 复制正文</button>
                    </div>
                  </div>
                  {xhsEditIdx===xhsSel?<textarea style={{width:"100%",minHeight:260,fontSize:13,lineHeight:1.85,color:"var(--t1)",fontFamily:"inherit",border:"1.5px solid var(--pl)",borderRadius:10,padding:"12px 14px",background:"var(--s2)",resize:"vertical",outline:"none"}} value={note.content||""} onChange={e=>{const v=e.target.value;setXhsNotes(prev=>prev.map((n,i)=>i===xhsSel?{...n,content:v}:n));}}/>:<div className="xhs-content">{note.content}</div>}
                </div>

                {note.hashtags?.length>0&&<div className="xhs-sec">
                  <div className="xhs-sec-t">🏷️ 话题标签</div>
                  <div className="xhs-tags">{note.hashtags.map((h,i)=><span key={i} className="xhs-tag">{h}</span>)}</div>
                </div>}

                {note.interaction_guide&&<div className="xhs-sec">
                  <div className="xhs-sec-t">💬 互动引导</div>
                  <div className="xhs-meta">{note.interaction_guide}</div>
                </div>}

                {note.cover_suggestion&&<div className="xhs-sec">
                  <div className="xhs-sec-t">🖼️ 封面建议</div>
                  <div className="xhs-meta">{note.cover_suggestion}</div>
                </div>}

                {note.best_post_time&&<div className="xhs-sec">
                  <div className="xhs-sec-t">⏰ 最佳发布时间</div>
                  <div className="xhs-meta">{note.best_post_time}</div>
                </div>}

                <button className="xhs-copy-all" onClick={()=>{
                  const txt=[(note.titles||[])[0]||"","",note.content||"","",(note.hashtags||[]).join(" "),"",note.interaction_guide||""].join("\n");
                  navigator.clipboard.writeText(txt);
                }}>
                  <I.Copy/> 一键复制全部内容
                </button>
              </div>
              );})()}
            </div>
            :itPlat==="抖音"&&dyNotes.length>0?
            <div style={{width:"100%",maxWidth:520,display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
              {dyAnalysis&&dyAnalysis.searched_notes&&<div style={{padding:"14px 16px",background:"var(--s)",borderRadius:12,border:"1px solid var(--bl)",fontSize:11,color:"var(--t2)",lineHeight:1.8}}>
                <div style={{fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--t1)"}}><I.Search/> 爆款拆解报告</div>
                {dyAnalysis.search_keywords&&<div style={{marginBottom:6}}>搜索词：{dyAnalysis.search_keywords.slice(0,6).map((k,i)=><span key={i} style={{display:"inline-block",padding:"2px 8px",borderRadius:10,background:"var(--s3)",marginRight:4,marginBottom:2,fontSize:10}}>{k}</span>)}</div>}
                <div>找到 <b>{dyAnalysis.searched_notes.length}</b> 篇爆款图文{dyAnalysis.title_formulas&&<>，提炼 <b>{dyAnalysis.title_formulas.length}</b> 个标题公式</>}{dyAnalysis.winning_structures&&<>，<b>{dyAnalysis.winning_structures.length}</b> 种内容结构</>}</div>
                {dyAnalysis.key_insights&&<div style={{marginTop:4,color:"var(--t3)"}}>{dyAnalysis.key_insights.slice(0,2).join(" · ")}</div>}
              </div>}
              <div className="xhs-tabs">
                {dyNotes.map((n,i)=>(
                  <button key={i} className={`xhs-tab ${dySel===i?"on":""}`} onClick={()=>setDySel(i)}>
                    {n.style||("图文"+(i+1))}
                  </button>
                ))}
              </div>
              {(()=>{const note=dyNotes[dySel];if(!note)return null;return(
              <div className="dy-card">
                <div className="dy-card-hd">
                  <div className="dy-card-hd-ic">DY</div>
                  <div>
                    <div className="dy-card-hd-t">{note.style||"抖音图文"}</div>
                    <div className="dy-card-hd-d">{dyProd} · {dyAnalysis?"基于爆款拆解生成":"AI 生成"}</div>
                  </div>
                </div>

                <div className="dy-sec">
                  <div className="dy-sec-t">📌 标题选项 <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>点击复制</span></div>
                  {(note.titles||[]).map((t,i)=>(
                    <div key={i} className="xhs-title-opt" onClick={()=>{navigator.clipboard.writeText(t)}}>
                      <span className="xhs-title-n">{i+1}</span>
                      <span style={{flex:1}}>{t}</span>
                      <I.Copy/>
                    </div>
                  ))}
                </div>

                <div className="dy-sec">
                  <div className="dy-sec-t" style={{justifyContent:"space-between"}}>
                    <span>📄 正文内容</span>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <button className="xhs-copy-btn" onClick={()=>{setDyEditIdx(dyEditIdx===dySel?-1:dySel)}}><I.Edit/> {dyEditIdx===dySel?"完成":"编辑"}</button>
                      <button className="xhs-copy-btn" onClick={()=>navigator.clipboard.writeText(note.content||"")}><I.Copy/> 复制正文</button>
                    </div>
                  </div>
                  {dyEditIdx===dySel?<textarea style={{width:"100%",minHeight:260,fontSize:13,lineHeight:1.85,color:"var(--t1)",fontFamily:"inherit",border:"1.5px solid var(--pl)",borderRadius:10,padding:"12px 14px",background:"var(--s2)",resize:"vertical",outline:"none"}} value={note.content||""} onChange={e=>{const v=e.target.value;setDyNotes(prev=>prev.map((n,i)=>i===dySel?{...n,content:v}:n));}}/>:<div className="xhs-content">{note.content}</div>}
                </div>

                {note.hashtags?.length>0&&<div className="dy-sec">
                  <div className="dy-sec-t">🏷️ 话题标签</div>
                  <div className="dy-tags">{note.hashtags.map((h,i)=><span key={i} className="dy-tag">{h}</span>)}</div>
                </div>}

                {note.image_plan?.length>0&&<div className="dy-sec">
                  <div className="dy-sec-t">🖼️ 图片规划 <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>{note.image_plan.length} 张图</span></div>
                  {note.image_plan.map((p,i)=>(
                    <div key={i} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:i<note.image_plan.length-1?"1px solid var(--s3)":"none",fontSize:12}}>
                      <div style={{width:28,height:28,borderRadius:6,background:"var(--s3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"var(--t3)",flexShrink:0}}>P{p.page||i+1}</div>
                      <div style={{flex:1,color:"var(--t2)",lineHeight:1.5}}>{p.content}</div>
                    </div>
                  ))}
                </div>}

                {note.interaction_guide&&<div className="dy-sec">
                  <div className="dy-sec-t">💬 互动引导</div>
                  <div className="dy-meta">{note.interaction_guide}</div>
                </div>}

                {note.cover_suggestion&&<div className="dy-sec">
                  <div className="dy-sec-t">🎨 封面建议</div>
                  <div className="dy-meta">{note.cover_suggestion}</div>
                </div>}

                {note.best_post_time&&<div className="dy-sec">
                  <div className="dy-sec-t">⏰ 最佳发布时间</div>
                  <div className="dy-meta">{note.best_post_time}</div>
                </div>}

                <button className="dy-copy-all" onClick={()=>{
                  const txt=[(note.titles||[])[0]||"","",note.content||"","",(note.hashtags||[]).join(" "),"",note.interaction_guide||""].join("\n");
                  navigator.clipboard.writeText(txt);
                }}>
                  <I.Copy/> 一键复制全部内容
                </button>
              </div>
              );})()}
            </div>

            :itPlat==="微信公众号"&&wxArticles.length>0?
            <div style={{width:"100%",maxWidth:520,display:"flex",flexDirection:"column",gap:14,paddingBottom:24}}>
              {wxAnalysis&&wxAnalysis.searched_articles&&<div style={{padding:"14px 16px",background:"var(--s)",borderRadius:12,border:"1px solid var(--bl)",fontSize:11,color:"var(--t2)",lineHeight:1.8}}>
                <div style={{fontWeight:700,marginBottom:6,display:"flex",alignItems:"center",gap:6,fontSize:12,color:"var(--t1)"}}><I.Search/> 爆款拆解报告</div>
                {wxAnalysis.search_keywords&&<div style={{marginBottom:6}}>搜索词：{wxAnalysis.search_keywords.slice(0,6).map((k,i)=><span key={i} style={{display:"inline-block",padding:"2px 8px",borderRadius:10,background:"var(--s3)",marginRight:4,marginBottom:2,fontSize:10}}>{k}</span>)}</div>}
                <div>找到 <b>{wxAnalysis.searched_articles.length}</b> 篇爆款文章{wxAnalysis.title_formulas&&<>，提炼 <b>{wxAnalysis.title_formulas.length}</b> 个标题公式</>}{wxAnalysis.winning_structures&&<>，<b>{wxAnalysis.winning_structures.length}</b> 种内容结构</>}</div>
                {wxAnalysis.key_insights&&<div style={{marginTop:4,color:"var(--t3)"}}>{wxAnalysis.key_insights.slice(0,2).join(" · ")}</div>}
              </div>}
              <div className="xhs-tabs">
                {wxArticles.map((a,i)=>(
                  <button key={i} className={`xhs-tab ${wxSel===i?"on":""}`} onClick={()=>setWxSel(i)}>
                    {a.style||("文章"+(i+1))}
                  </button>
                ))}
              </div>
              {(()=>{const art=wxArticles[wxSel];if(!art)return null;return(
              <div className="wx-card">
                <div className="wx-card-hd">
                  <div className="wx-card-hd-ic">WX</div>
                  <div>
                    <div className="wx-card-hd-t">{art.style||"公众号文章"}</div>
                    <div style={{fontSize:11,color:"var(--t3)"}}>{wxProd} · {wxAnalysis?"基于爆款拆解生成":"AI 生成"}</div>
                  </div>
                </div>

                <div className="wx-sec">
                  <div className="wx-sec-t">📌 标题选项 <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>点击复制</span></div>
                  {(art.titles||[]).map((t,i)=>(
                    <div key={i} className="xhs-title-opt" onClick={()=>{navigator.clipboard.writeText(t)}}>
                      <span className="xhs-title-n">{i+1}</span>
                      <span style={{flex:1}}>{t}</span>
                      <I.Copy/>
                    </div>
                  ))}
                </div>

                {art.summary&&<div className="wx-sec">
                  <div className="wx-sec-t">📋 文章摘要</div>
                  <div className="wx-summary">{art.summary}</div>
                </div>}

                <div className="wx-sec">
                  <div className="wx-sec-t" style={{justifyContent:"space-between"}}>
                    <span>📄 正文内容</span>
                    <div style={{display:"flex",gap:10,alignItems:"center"}}>
                      <button className="xhs-copy-btn" onClick={()=>{setWxEditIdx(wxEditIdx===wxSel?-1:wxSel)}}><I.Edit/> {wxEditIdx===wxSel?"完成":"编辑"}</button>
                      <button className="xhs-copy-btn" onClick={()=>navigator.clipboard.writeText(art.content||"")}><I.Copy/> 复制正文</button>
                    </div>
                  </div>
                  {wxEditIdx===wxSel?<textarea style={{width:"100%",minHeight:400,fontSize:13,lineHeight:1.85,color:"var(--t1)",fontFamily:"inherit",border:"1.5px solid #07C160",borderRadius:10,padding:"12px 14px",background:"var(--s2)",resize:"vertical",outline:"none"}} value={art.content||""} onChange={e=>{const v=e.target.value;setWxArticles(prev=>prev.map((a,i)=>i===wxSel?{...a,content:v}:a));}}/>:<div className="wx-content">{art.content}</div>}
                </div>

                {art.tags?.length>0&&<div className="wx-sec">
                  <div className="wx-sec-t">🏷️ 标签</div>
                  <div className="wx-tags">{art.tags.map((h,i)=><span key={i} className="wx-tag">{h}</span>)}</div>
                </div>}

                {art.interaction_guide&&<div className="wx-sec">
                  <div className="wx-sec-t">💬 互动引导</div>
                  <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7,padding:"10px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)"}}>{art.interaction_guide}</div>
                </div>}

                {art.cover_suggestion&&<div className="wx-sec">
                  <div className="wx-sec-t">🖼️ 封面建议</div>
                  <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7,padding:"10px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)"}}>{art.cover_suggestion}</div>
                </div>}

                {art.best_post_time&&<div className="wx-sec">
                  <div className="wx-sec-t">⏰ 最佳发布时间</div>
                  <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7,padding:"10px 14px",background:"var(--s2)",borderRadius:10,border:"1px solid var(--bl)"}}>{art.best_post_time}</div>
                </div>}

                <button className="wx-copy-all" onClick={()=>{
                  const txt=[(art.titles||[])[0]||"","",art.summary||"","",art.content||"","",(art.tags||[]).join(" "),"",art.interaction_guide||""].join("\n");
                  navigator.clipboard.writeText(txt);
                }}>
                  <I.Copy/> 一键复制全部内容
                </button>
              </div>
              );})()}
            </div>
            :
            <div className="it-preview">
              {(itPlat==="小红书"&&xhsBusy)||(itPlat==="抖音"&&dyBusy)||(itPlat==="微信公众号"&&wxBusy)?
              <div className="it-pv-empty">
                <div className="it-pv-ic" style={{animation:"spin 2s linear infinite",background:itPlat==="小红书"?"#FFF0F1":itPlat==="微信公众号"?"#E8F8EE":"#F0F0F0",color:itPlat==="小红书"?"#FF2442":itPlat==="微信公众号"?"#07C160":"#333"}}>{(itPlat==="小红书"?xhsPhase:itPlat==="微信公众号"?wxPhase:dyPhase)==="search"?"🔍":"📝"}</div>
                <div className="it-pv-t">{(()=>{const phase=itPlat==="小红书"?xhsPhase:itPlat==="微信公众号"?wxPhase:dyPhase;const name=itPlat==="小红书"?"笔记":itPlat==="微信公众号"?"文章":"视频";return phase==="search"?`正在搜索同行爆款${name}...`:`正在生成${itPlat==="小红书"?"小红书笔记":itPlat==="微信公众号"?"公众号文章":"抖音图文"}...`;})()}</div>
                <div className="it-pv-d">{(()=>{const phase=itPlat==="小红书"?xhsPhase:itPlat==="微信公众号"?wxPhase:dyPhase;return phase==="search"?<>千问 AI 联网搜索{itPlat==="小红书"?"小红书":itPlat==="微信公众号"?"微信公众号":"抖音"}爆款<br/>拆解{itPlat==="小红书"?"标题、结构、转化套路":itPlat==="微信公众号"?"标题、结构、转化套路":"Hook、脚本结构、转化套路"}</>:<>基于真实爆款拆解报告<br/>Gemini 正在生成 {itPlat==="小红书"?(xhsSelStyles.length||3)+" 篇笔记":itPlat==="微信公众号"?(wxSelStyles.length||3)+" 篇文章":(dySelStyles.length||3)+" 个脚本"}</>;})()}</div>
                <div className="it-pv-skel">
                  <div className="it-pv-skel-line w60"/>
                  <div className="it-pv-skel-line w80"/>
                  <div className="it-pv-skel-block"/>
                  <div className="it-pv-skel-line w80"/>
                  <div className="it-pv-skel-line w40"/>
                </div>
              </div>
              :
              <div className="it-pv-empty">
                <div className="it-pv-ic">{itPlat==="小红书"?"📝":itPlat==="抖音"?"🎬":"📄"}</div>
                <div className="it-pv-t">{itPlat==="小红书"?"等待生成小红书笔记":itPlat==="抖音"?"等待生成抖音图文":"等待生成公众号文章"}</div>
                <div className="it-pv-d">{<>在左侧填写产品信息并点击<br/>"搜索同行爆款" 开始分析</>}</div>
                <div className="it-pv-skel">
                  <div className="it-pv-skel-line w60"/>
                  <div className="it-pv-skel-line w80"/>
                  <div className="it-pv-skel-block"/>
                  <div className="it-pv-skel-line w80"/>
                  <div className="it-pv-skel-line w40"/>
                </div>
              </div>}
            </div>}
          </div>
        </div>}
        {pg==="schedule"&&<>{/* Schedule page */}
        <div className="sch-wrap">
          <div className="sch-main">
            <div className="sch-top">
              <span className="sch-month-title">{schYear}年 {schMonth+1}月</span>
              <div className="sch-nav-arrows">
                <button className="sch-nav-arr" onClick={()=>{if(schMonth===0){setSchMonth(11);setSchYear(schYear-1)}else setSchMonth(schMonth-1)}}><I.ArrowL/></button>
                <button className="sch-nav-arr" onClick={()=>{if(schMonth===11){setSchMonth(0);setSchYear(schYear+1)}else setSchMonth(schMonth+1)}}><I.ArrowR/></button>
              </div>
              <button className="sch-today-btn" onClick={()=>{setSchMonth(new Date().getMonth());setSchYear(new Date().getFullYear())}}>今天</button>
              <div className="sch-legend"><span className="lg-sell">带货</span><span className="lg-edu">科普</span><span className="lg-story">剧情</span><span className="lg-daily">日常</span></div>
              <div className="sch-pub">
                <button className="sch-pub-btn pri" onClick={()=>setSchModal(true)}><I.Plus/> 新建排期</button>
              </div>
            </div>
            <div className="sch-cal">
              <div className="sch-grid-hd"><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span><span>周日</span></div>
              <div className="sch-grid">
                {(()=>{const allDays=getCalDays();let lastCur=0;for(let i=allDays.length-1;i>=0;i--){if(allDays[i].cur){lastCur=i;break;}}const rows=Math.ceil((lastCur+1)/7);return allDays.slice(0,rows*7);})().map((d,i)=>{
                  const dayTasks=d.cur?schGetTasksForDay(d.d):[];
                  const dayKey=`${schYear}-${schMonth}-${d.d}`;
                  const expanded=!!schExpandedDays[dayKey];
                  const maxShow=3;
                  const visibleTasks=expanded?dayTasks:dayTasks.slice(0,maxShow);
                  const hasMore=dayTasks.length>maxShow;
                  const pillBg=t=>{const c=t.color||"var(--p)";return t.status==="failed"?"#EF4444":t.status==="running"?"#3B82F6":t.status==="manual"?"#9CA3AF":c;};
                  const statusIcon=t=>t.status==="success"?"\u2713":t.status==="failed"?"\u2717":t.status==="running"?"\u25F7":t.status==="manual"?"\u270E":"";
                  return <div key={i} className={`sch-cell${d.cur?"":" dim"}${d.today?" today":""}${expanded?" expanded":""}`} onClick={()=>{if(d.cur){setSchDate(`${schYear}-${String(schMonth+1).padStart(2,'0')}-${String(d.d).padStart(2,'0')}`);setSchModal(true);}}}>
                    <div className="sch-cell-hd">
                      <span className="sch-day-n">{d.d}</span>
                      {dayTasks.length>0&&<span className="sch-task-count">{dayTasks.length}个排期</span>}
                    </div>
                    {visibleTasks.map(t=><div key={t.id} className="sch-pill" style={{background:pillBg(t)}} onClick={e=>{e.stopPropagation();setSchLogModal(t.id);}} title={`${t.title||t.content?.slice(0,30)||t.platform} [${t.status}]`}>
                      {statusIcon(t)&&<span className="sch-pill-icon">{statusIcon(t)}</span>}
                      {t.scheduled_at&&<span className="sch-pill-time">{new Date(t.scheduled_at).toTimeString().slice(0,5)}</span>}
                      <span className="sch-pill-title">{t.title||t.platform}</span>
                    </div>)}
                    {hasMore&&!expanded&&<div className="sch-more" onClick={e=>{e.stopPropagation();setSchExpandedDays(p=>({...p,[dayKey]:true}));}}>还有 {dayTasks.length-maxShow} 项 <I.ChevronD/></div>}
                    {hasMore&&expanded&&<div className="sch-more" onClick={e=>{e.stopPropagation();setSchExpandedDays(p=>{const n={...p};delete n[dayKey];return n;});}}>收起 <I.ChevronR style={{transform:"rotate(-90deg)"}}/></div>}
                  </div>;
                })}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="sch-side">
            <div className="sch-side-t">本月执行看板</div>
            <div className="sch-board">
              <div className="sch-board-row"><div><div className="sch-board-lbl">已发布内容</div><div className="sch-board-v">{schStats.published}<span style={{fontSize:12,color:"var(--t3)",fontWeight:400}}>/{schStats.total} 条</span></div></div><div><div className="sch-board-lbl" style={{textAlign:"right"}}>月达成率</div><div className="sch-board-pct">{schStats.completion_rate}%</div></div></div>
              <div className="sch-board-sub"><span>待发布 {schStats.pending}</span><span style={{color:"var(--r)"}}>异常数 {schStats.failed}</span></div>
            </div>

            <div className="sch-focus">
              <div className="sch-focus-tag">FOCUS OF TODAY / 今日重点</div>
              <div className="sch-focus-t">今日目标: {schTodayTasks.length?`${schTodayTasks.length}个发布任务`:"暂无发布任务"}</div>
              <div className="sch-focus-d">{schTodayTasks.length?schTodayTasks.map(t=>`${new Date(t.scheduled_at).toTimeString().slice(0,5)} ${t.title||t.content?.slice(0,20)||"待发布"}`).join(" | "):"休息一下，或者开始规划明天的精彩内容吧！"}</div>
            </div>

            {/* 账号管理 */}
            <div className="sch-acct-panel">
              <div className="sch-acct-hd">
                <div className="sch-acct-hd-t"><I.People/> 发布账号</div>
                <button className="sch-acct-add-btn" onClick={()=>setSchAcctModal(true)}><I.Plus/> 添加账号</button>
              </div>
              {schAccounts.length===0&&<div className="sch-acct-empty">
                <div className="sch-acct-empty-icon"><I.User/></div>
                <div className="sch-acct-empty-t">还没有绑定账号</div>
                <div className="sch-acct-empty-d">点击上方按钮添加你的第一个平台账号</div>
              </div>}
              {schAccounts.map(a=><div key={a.id} className="sch-acct-item">
                <div className="sch-acct-plat" style={{background:{"xiaohongshu":"#FF2442","douyin":"#111","kuaishou":"#FF6600","wechat":"#07C160"}[a.platform]||"#999"}}>{{"xiaohongshu":"红","douyin":"抖","kuaishou":"快","wechat":"微"}[a.platform]}</div>
                <div className="sch-acct-body">
                  <div className="sch-acct-row1">
                    <div className="sch-acct-info">
                      <span className="sch-acct-name">{a.nickname||{xiaohongshu:"小红书",douyin:"抖音",kuaishou:"快手",wechat:"微信公众号"}[a.platform]}</span>
                      <span className="sch-acct-plat-name">{{"xiaohongshu":"小红书","douyin":"抖音","kuaishou":"快手","wechat":"微信公众号"}[a.platform]}</span>
                    </div>
                    <button className="sch-acct-act del" onClick={()=>schDeleteAccount(a.id)}><I.Trash/></button>
                  </div>
                  <div className="sch-acct-row2">
                    <span className="sch-acct-status" style={{background:a.status==="active"?"#DCFCE7":a.status==="login_required"?"#FEF3C7":"#FEE2E2",color:a.status==="active"?"#16A34A":a.status==="login_required"?"#D97706":"#DC2626"}}>{a.status==="active"?"已登录":a.status==="login_required"?"待登录":"已过期"}</span>
                    {a.status!=="active"&&<button className="sch-acct-act login" onClick={()=>schStartLogin(a.id)}>登录</button>}
                  </div>
                </div>
              </div>)}
            </div>

            <div className="sch-add">
              <div className="sch-add-t">添加发布计划</div>
              <div className="sch-add-btn" onClick={()=>setSchModal(true)}><I.Plus/> 新建计划</div>
            </div>

            <div><div className="sch-detail-t">今日详细计划 <span className="sch-detail-ct">{schTodayTasks.length}个任务</span></div>
              {schTodayTasks.length===0&&<div style={{fontSize:11,color:"var(--t3)",textAlign:"center",padding:20}}>暂无计划</div>}
              {schTodayTasks.map(t=><div key={t.id} style={{padding:"8px 0",borderBottom:"1px solid var(--bl)",fontSize:11}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontWeight:600}}>{t.title||"无标题"}</span>
                  <span style={{fontSize:9,padding:"1px 6px",borderRadius:4,
                    background:t.status==="success"?"#DCFCE7":t.status==="failed"?"#FEE2E2":t.status==="running"?"#DBEAFE":t.status==="manual"?"#FEF3C7":"#F3F4F6",
                    color:t.status==="success"?"#16A34A":t.status==="failed"?"#DC2626":t.status==="running"?"#2563EB":t.status==="manual"?"#D97706":"var(--t3)"}}>
                    {t.status==="success"?"已发布":t.status==="failed"?"失败":t.status==="running"?"发布中":t.status==="manual"?"手动":"待发布"}
                  </span>
                </div>
                <div style={{display:"flex",gap:6,marginTop:4,color:"var(--t3)",fontSize:10}}>
                  <span>{new Date(t.scheduled_at).toTimeString().slice(0,5)}</span>
                  <span>{t.platform}</span>
                  {t.status==="pending"&&<span style={{color:"var(--p)",cursor:"pointer"}} onClick={()=>schPublishNow(t.id)}>立即发布</span>}
                  {t.status==="failed"&&<span style={{color:"var(--r)",cursor:"pointer"}} onClick={()=>schPublishNow(t.id)}>重试</span>}
                  {t.status==="running"&&(Date.now()-new Date(t.updated_at||t.scheduled_at).getTime()>300000)&&<span style={{color:"#F59E0B",cursor:"pointer"}} onClick={()=>schPublishNow(t.id)}>超时重试</span>}
                  {t.status==="manual"&&<><span style={{color:"#16A34A",cursor:"pointer"}} onClick={()=>schSetStatus(t.id,"success")}>标记已发布</span><span style={{color:"var(--p)",cursor:"pointer"}} onClick={()=>schPublishNow(t.id)}>自动发布</span></>}
                  <span style={{color:"var(--t3)",cursor:"pointer"}} onClick={()=>schDeleteTask(t.id)}>删除</span>
                </div>
              </div>)}
            </div>
          </div>
        </div>

        {/* Schedule modal */}
        {schModal&&<div className="sch-ov" onClick={()=>setSchModal(false)}><div className="sch-mdl" onClick={e=>e.stopPropagation()}>
          <div className="sch-mdl-main">
            <div className="sch-mdl-hd">
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,var(--p),var(--pl))",display:"flex",alignItems:"center",justifyContent:"center"}}><I.Calendar style={{color:"#fff",width:18,height:18}}/></div>
                <div><div className="sch-mdl-t">创建发布计划</div><div style={{fontSize:11,color:"var(--t3)",marginTop:1}}>填写内容后AI将智能推荐最佳发布时间</div></div>
              </div>
              <button className="mdl-x" onClick={()=>setSchModal(false)}><I.X/></button>
            </div>
            <div className="sch-mdl-tabs">
              {["内容发布","标签提醒"].map((t,i)=><button key={i} className={`sch-mdl-tab ${schTab===i?"on":""}`} onClick={()=>setSchTab(i)}>{t}</button>)}
            </div>
            <div className="sch-mdl-body">
              {/* Step 1: 平台 & 账号 */}
              <div className="sch-section">
                <div className="sch-section-t"><span className="sch-step-n">1</span> 选择平台与账号</div>
                <div className="sch-pick-label">发布平台 <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>可多选</span></div>
                <div className="sch-plats">
                  {[{k:"抖",c:"#000",bg:"#00000010"},{k:"快",c:"#FF6600",bg:"#FF660010"},{k:"红",c:"#FF2442",bg:"#FF244210"},{k:"微",c:"#07C160",bg:"#07C16010"}].map((p,i)=><div key={i} className={`sch-plat-chip ${schPlatBtns[i]?"on":""}`} style={{"--pc":p.c,"--pbg2":p.bg}} onClick={()=>{const n=[...schPlatBtns];n[i]=!n[i];setSchPlatBtns(n);if(!n[i]){setSchSelAccounts(prev=>prev.filter(x=>{const ac=schAccounts.find(a=>a.id===Number(x));return ac?ac.platform!==schPlatMap[i]:true}));return;}
                    if(i===0||i===1)setSchContentType("video");
                    if(i===2)setSchContentType("image");
                    if(i===3)setSchContentType("article");
                  }}><span className="sch-plat-dot" style={{background:p.c}}/>{schPlatLabels[i]}</div>)}
                </div>
                <div className="sch-pick-label" style={{marginTop:14}}>发布账号 <span style={{fontSize:10,color:"var(--t3)",fontWeight:400}}>可多选</span></div>
                {schPlatBtns.some(Boolean)?<div className="sch-acct-chips">
                  {schAccounts.filter(a=>a.status==="active"&&schPlatBtns[schPlatMap.indexOf(a.platform)]).length===0?<div className="sch-acct-empty-hint">所选平台暂无已绑定账号，请先在账号管理中添加</div>:
                  schAccounts.filter(a=>a.status==="active"&&schPlatBtns[schPlatMap.indexOf(a.platform)]).map(a=>{
                    const on=schSelAccounts.includes(String(a.id));
                    const pc={xiaohongshu:"#FF2442",douyin:"#000",kuaishou:"#FF6600",wechat:"#07C160"}[a.platform]||"var(--p)";
                    const platLabel={xiaohongshu:"红",douyin:"抖",kuaishou:"快",wechat:"微"}[a.platform];
                    return <div key={a.id} className={`sch-pick-chip ${on?"on":""}`} style={{"--pc":pc,"--pbg2":pc+"10"}} onClick={()=>setSchSelAccounts(prev=>on?prev.filter(x=>x!==String(a.id)):[...prev,String(a.id)])}>
                      <span className="spc-ck">{on&&<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}</span>
                      <span className="spc-tag" style={{background:pc}}>{platLabel}</span>
                      {a.nickname}
                    </div>
                  })}
                </div>:<div className="sch-acct-empty-hint">请先选择发布平台</div>}
              </div>

              {schTab!==1?<>
              {/* Step 2: 内容类型 & 素材上传 */}
              <div className="sch-section">
                <div className="sch-section-t"><span className="sch-step-n">2</span> 上传素材 <span className="sch-required">必填</span></div>
                <div className="sch-type-toggle">
                  {schPlatBtns[3]&&!schPlatBtns[0]&&!schPlatBtns[1]&&!schPlatBtns[2]&&<div className={`sch-type-btn ${schContentType==="article"?"on":""}`} onClick={()=>{setSchContentType("article");setSchFiles([]);}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                    <span>文章</span>
                    <span className="sch-type-desc">富文本图文</span>
                  </div>}
                  <div className={`sch-type-btn ${schContentType==="image"?"on":""}`} onClick={()=>{setSchContentType("image");setSchFiles([]);}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                    <span>{schPlatBtns[3]&&!schPlatBtns[2]?"贴图":"图文"}</span>
                    <span className="sch-type-desc">{schPlatBtns[3]&&!schPlatBtns[2]?"图片+标题+描述":"图片+文字笔记"}</span>
                  </div>
                  <div className={`sch-type-btn ${schContentType==="video"?"on":""}`} onClick={()=>{setSchContentType("video");setSchFiles([]);}}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                    <span>视频</span>
                    <span className="sch-type-desc">短视频发布</span>
                  </div>
                </div>
                <div className="sch-media-zone">
                  {schContentType==="article"?<div style={{display:"flex",flexDirection:"column",gap:12,width:"100%"}}>
                    {/* 隐藏的文件选择器 */}
                    <input ref={schFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{
                      const role=schFileRef.current?.getAttribute("data-role")||"inline";
                      const files=Array.from(e.target.files);
                      if(!files.length)return;
                      (async()=>{
                        const uploaded=[];
                        for(const f of files){const sp=await schUploadFile(f);uploaded.push({name:f.name,serverPath:sp,preview:URL.createObjectURL(f),_role:role});}
                        setSchFiles(prev=>role==="cover"?[...prev.filter(x=>x._role!=="cover"),...uploaded]:[...prev,...uploaded]);
                      })();
                      e.target.value="";
                    }}/>
                    {/* ── 封面图卡片 ── */}
                    <div style={{background:"var(--s1)",border:"1px solid var(--bl)",borderRadius:10,padding:12}}>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{background:"var(--pbg)",color:"var(--p)",width:20,height:20,borderRadius:6,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>封</span>
                        封面图
                        <span style={{fontWeight:400,color:"var(--t3)",fontSize:10,marginLeft:"auto"}}>可选 · 展示在文章列表</span>
                      </div>
                      {!schFiles.some(f=>f._role==="cover")?
                        <div style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",cursor:"pointer",color:"var(--t3)"}} onClick={()=>{schFileRef.current?.setAttribute("data-role","cover");schFileRef.current?.click();}}>
                          <div style={{width:72,height:48,borderRadius:8,border:"2px dashed var(--bl)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,transition:"var(--tr)"}} className="sch-cover-dashed">
                            <I.Plus style={{width:16,height:16,opacity:.5}}/>
                          </div>
                          <div>
                            <div style={{fontSize:12,color:"var(--t2)",fontWeight:500}}>点击上传封面图</div>
                            <div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>建议 2.35:1 横图，jpg / png</div>
                          </div>
                        </div>
                      :<div style={{display:"flex",alignItems:"center",gap:12}}>
                        {schFiles.filter(f=>f._role==="cover").map((f,i)=><div key={"c"+i} style={{width:90,height:60,borderRadius:8,overflow:"hidden",position:"relative",border:"1px solid var(--bl)",flexShrink:0}}>
                          <img src={f.preview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          <div style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"rgba(0,0,0,.55)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>setSchFiles(prev=>prev.filter(x=>x!==f))}><I.X style={{width:8,height:8}}/></div>
                        </div>)}
                        <div style={{fontSize:11,color:"var(--p)",cursor:"pointer",fontWeight:500}} onClick={()=>{schFileRef.current?.setAttribute("data-role","cover");schFileRef.current?.click();}}>更换封面</div>
                      </div>}
                    </div>
                    {/* ── 正文插图卡片 ── */}
                    <div style={{background:"var(--s1)",border:"1px solid var(--bl)",borderRadius:10,padding:12}}>
                      <div style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:8,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{background:"rgba(59,130,246,.1)",color:"#3B82F6",width:20,height:20,borderRadius:6,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700}}>图</span>
                        正文插图
                        <span style={{fontWeight:400,color:"var(--t3)",fontSize:10,marginLeft:"auto"}}>可选</span>
                      </div>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center"}}>
                        {schFiles.filter(f=>f._role==="inline").map((f,i)=><div key={"i"+i} style={{width:72,height:72,borderRadius:8,overflow:"hidden",position:"relative",border:"1px solid var(--bl)"}}>
                          <img src={f.preview} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                          <div style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:"50%",background:"rgba(0,0,0,.55)",color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",opacity:0,transition:"var(--tr)"}} className="sch-inline-del" onClick={()=>setSchFiles(prev=>prev.filter(x=>x!==f))}><I.X style={{width:8,height:8}}/></div>
                          <div style={{position:"absolute",bottom:0,left:0,right:0,background:"linear-gradient(transparent,rgba(59,130,246,.75))",color:"#fff",fontSize:8,fontWeight:700,textAlign:"center",padding:"1px 0 2px"}}>插图{i+1}</div>
                        </div>)}
                        <div style={{width:72,height:72,borderRadius:8,border:"2px dashed var(--bl)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--t3)",fontSize:10,gap:2,transition:"var(--tr)",flexShrink:0}} onClick={()=>{schFileRef.current?.setAttribute("data-role","inline");schFileRef.current?.click();}}>
                          <I.Plus style={{width:14,height:14}}/>
                          <span>添加</span>
                        </div>
                      </div>
                      {/* 插图位置选择 */}
                      {schFiles.some(f=>f._role==="inline")&&<div style={{marginTop:10,display:"flex",alignItems:"center",gap:6}}>
                        <span style={{fontSize:11,color:"var(--t2)"}}>插入位置</span>
                        <div style={{display:"flex",borderRadius:6,overflow:"hidden",border:"1px solid var(--bl)"}}>
                          <div onClick={()=>setSchImgPos("start")} style={{padding:"4px 12px",fontSize:10,fontWeight:600,cursor:"pointer",transition:"var(--tr)",background:schImgPos==="start"?"var(--p)":"var(--s)",color:schImgPos==="start"?"#fff":"var(--t3)"}}>正文开头</div>
                          <div onClick={()=>setSchImgPos("end")} style={{padding:"4px 12px",fontSize:10,fontWeight:600,cursor:"pointer",transition:"var(--tr)",background:schImgPos==="end"?"var(--p)":"var(--s)",color:schImgPos==="end"?"#fff":"var(--t3)"}}>正文结尾</div>
                        </div>
                      </div>}
                      {schFiles.filter(f=>f._role==="inline").length===0&&<div style={{fontSize:10,color:"var(--t3)",marginTop:6}}>上传图片后可选择插入到正文开头或结尾</div>}
                    </div>
                  </div>:schContentType==="image"?<>
                    <div className="sch-media-add" onClick={()=>schFileRef.current?.click()}>
                      <I.Plus style={{width:20,height:20}}/>
                      <span>添加图片</span>
                      <span style={{fontSize:9,color:"var(--t3)"}}>jpg/png/webp</span>
                      <input ref={schFileRef} type="file" multiple accept="image/*" style={{display:"none"}} onChange={schHandleFiles}/>
                    </div>
                    {schFiles.map((f,i)=><div key={i} className="sch-media-item">
                      <img src={f.preview} alt=""/>
                      <div className="sch-media-del" onClick={()=>setSchFiles(schFiles.filter((_,j)=>j!==i))}><I.X style={{width:10,height:10}}/></div>
                      {i===0&&<div className="sch-media-cover">封面</div>}
                    </div>)}
                  </>:<>
                    {schFiles.length===0?<div className="sch-video-add" onClick={()=>schFileRef.current?.click()}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{opacity:.4}}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
                      <span style={{fontWeight:600}}>点击上传视频</span>
                      <span style={{fontSize:10,color:"var(--t3)"}}>支持 mp4/mov/avi，最大 4GB</span>
                      <input ref={schFileRef} type="file" accept="video/*" style={{display:"none"}} onChange={schHandleFiles}/>
                    </div>:<div className="sch-video-preview">
                      <div className="sch-video-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                      <div className="sch-video-info">
                        <div style={{fontWeight:600,fontSize:12}}>{schFiles[0].name}</div>
                        <div style={{fontSize:10,color:"var(--t3)",marginTop:2}}>视频已上传</div>
                      </div>
                      <div className="sch-media-del" style={{opacity:1,position:"static",background:"var(--s2)",color:"var(--t3)"}} onClick={()=>setSchFiles([])}><I.X style={{width:10,height:10}}/></div>
                    </div>}
                  </>}
                </div>
                {schContentType==="video"&&schFiles.length===0&&<div className="sch-media-hint">请上传一个视频文件</div>}
                {schContentType==="image"&&schFiles.length===0&&<div className="sch-media-hint">请至少上传一张图片作为发布素材</div>}
              </div>

              {/* Step 3: 内容 */}
              <div className="sch-section">
                <div className="sch-section-t"><span className="sch-step-n">3</span> 编辑内容</div>
                {schNeedTitle&&(()=>{const isWxLong=schPlatBtns[3]&&(schContentType==="article"||schContentType==="video");const tMax=isWxLong?64:20;return<>
                  <input className="sch-inp-title" placeholder="输入吸引人的标题..." value={schTitle} onChange={e=>setSchTitle(e.target.value)} maxLength={tMax}/>
                  <div style={{textAlign:"right",fontSize:10,color:schTitle.length>tMax-2?"var(--r)":"var(--t3)",marginTop:2}}>{schTitle.length}/{tMax}</div>
                </>;})()}
                {/* 公众号文章模式：作者输入 */}
                {schIsWxArticle&&<div style={{marginBottom:10}}>
                  <input className="sch-inp-title" style={{fontSize:12,padding:"8px 12px"}} placeholder="输入作者名称（可选，默认使用账号昵称）" value={schAuthor} onChange={e=>setSchAuthor(e.target.value)} maxLength={16}/>
                </div>}
                {!schNeedTitle&&schPlatBtns.some(Boolean)&&<div style={{fontSize:11,color:"var(--t3)",marginBottom:8,display:"flex",alignItems:"center",gap:4}}><I.Bulb style={{width:12,height:12,color:"var(--p)"}}/> {schPlatBtns[0]?"抖音":"快手"}发布视频无需标题，仅需填写文案描述</div>}
                <textarea className="sch-inp-content" rows={schIsWxArticle?8:4} placeholder={schDescPlaceholder} value={schDesc} onChange={e=>setSchDesc(e.target.value)} maxLength={schDescMax}/>
                <div style={{textAlign:"right",fontSize:10,color:schDesc.length>schDescMax*0.9?"var(--r)":"var(--t3)",marginTop:2}}>{schDesc.length}/{schDescMax}</div>
              </div>
              </>:<>
                <div className="sch-section">
                  <div className="sch-section-t"><span className="sch-step-n">2</span> 提醒内容</div>
                  <input className="sch-inp-title" placeholder="输入提醒标题..." value={schTitle} onChange={e=>setSchTitle(e.target.value)}/>
                  <textarea className="sch-inp-content" rows={3} placeholder="输入提醒详细内容（可选）..." style={{marginTop:10}} value={schDesc} onChange={e=>setSchDesc(e.target.value)}/>
                </div>
              </>}

              {/* Step 4: 分类 & 时间 */}
              <div className="sch-section">
                <div className="sch-section-t"><span className="sch-step-n">{schTab===1?"3":"4"}</span> 分类与时间</div>
                <div style={{marginBottom:14}}>
                  <div className="sch-time-lbl" style={{marginBottom:6}}>内容分类</div>
                  <div className="sch-colors">
                    {[{c:"#3B82F6",l:"带货"},{c:"#10B981",l:"教程"},{c:"#7C3AED",l:"故事"},{c:"#F97316",l:"日常"},{c:"#F43F5E",l:"热点"},{c:"#6B7280",l:"其他"}].map((item,i)=><div key={i} className={`sch-color-tag ${schColor===i?"on":""}`} style={{"--cc":item.c}} onClick={()=>setSchColor(i)}>{item.l}</div>)}
                  </div>
                </div>
                <div className="sch-time-lbl" style={{marginBottom:6}}>发布时间</div>
                <div className="sch-schedule-row">
                  <div className="sch-schedule-picker">
                    <div className="sch-picker-item">
                      <I.Calendar style={{width:14,height:14,color:"var(--p)",flexShrink:0}}/>
                      <input type="date" className="sch-date-inp" value={schDate} onChange={e=>setSchDate(e.target.value)} min={new Date().toISOString().slice(0,10)} max={new Date(Date.now()+14*86400000).toISOString().slice(0,10)}/>
                    </div>
                    <div className="sch-picker-divider"/>
                    <div className="sch-picker-item">
                      <I.Clock style={{width:14,height:14,color:"var(--p)",flexShrink:0}}/>
                      <input type="time" className="sch-date-inp" value={schTime} onChange={e=>setSchTime(e.target.value)}/>
                    </div>
                  </div>
                  <button className="sch-ai-inline-btn" onClick={schGetAiTime} disabled={schAiLoading}>
                    {schAiLoading?<><span className="sch-ai-spin"/>分析中...</>:<><I.Sparkle style={{width:13,height:13}}/> AI推荐</>}
                  </button>
                </div>
                <div className="sch-time-hint">定时发布仅支持14天内</div>
              </div>
              {/* 发布方式选择 */}
              <div style={{background:"var(--s1)",border:"1px solid var(--bl)",borderRadius:10,padding:"10px 14px",marginTop:12}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontSize:12,fontWeight:600,color:"var(--t1)"}}>自动发布</span>
                    <span style={{fontSize:10,color:"var(--t3)"}}>{schAutoPublish?"AI自动打开浏览器发布到平台":"仅保存计划，稍后手动标记状态"}</span>
                  </div>
                  <div style={{cursor:"pointer"}} onClick={()=>setSchAutoPublish(!schAutoPublish)}>{schAutoPublish?<I.TglOn/>:<I.TglOff/>}</div>
                </div>
              </div>
            </div>
            <div className="sch-mdl-foot">
              <div className="sch-foot-info">{schFiles.length>0&&<span>{schFiles.length} 张素材已上传</span>}</div>
              <button className="sch-f-btn sch-f-cancel" onClick={()=>setSchModal(false)}>取消</button>
              <button className="sch-f-btn sch-f-confirm" onClick={schCreateTask} disabled={schPublishing}>{schPublishing?"创建中...":schTab===1?"确认提醒":schAutoPublish?"确认发布":"保存计划"}</button>
            </div>
          </div>

          {/* AI recommendation results sidebar */}
          <div className="sch-ai">
            <div className="sch-ai-head">
              <div className="sch-ai-icon"><I.Sparkle style={{width:16,height:16}}/></div>
              <div><div className="sch-ai-t">AI 推荐结果</div><div style={{fontSize:10,color:"var(--t3)"}}>点击卡片使用推荐时间</div></div>
            </div>
            {(!schAiTimes.length&&!schAiAnalysis&&!schAiLoading)&&<div className="sch-ai-empty"><I.Sparkle style={{width:20,height:20,opacity:.3}}/><span>填写内容后点击「AI推荐时间」</span><span style={{fontSize:10}}>AI将根据内容和平台分析最佳发布时间</span></div>}
            {schAiLoading&&<div className="sch-ai-empty"><span className="sch-ai-spin" style={{width:20,height:20}}/><span>正在分析内容...</span></div>}
            {schAiAnalysis&&<div className="sch-ai-analysis">
              <div className="sch-ai-analysis-row"><span className="sch-ai-tag">内容类型</span>{schAiAnalysis.type}</div>
              <div className="sch-ai-analysis-row"><span className="sch-ai-tag">目标受众</span>{schAiAnalysis.audience}</div>
            </div>}
            {schAiTimes.length>0&&<div className="sch-ai-lbl">推荐发布时间</div>}
            {schAiTimes.map((r,i)=><div key={i} className="sch-ai-card" onClick={()=>{
              const t=r.time.trim();setSchTime(t);
              // If selected time already passed today, switch to tomorrow
              const now=new Date();const [rh,rm]=(t.match(/(\d+):(\d+)/)||[]).slice(1).map(Number);
              if(rh!==undefined){const selDate=new Date(schDate);
                if(selDate.toDateString()===now.toDateString()&&(rh*60+(rm||0))<=now.getHours()*60+now.getMinutes()+10){
                  const tmr=new Date(now);tmr.setDate(tmr.getDate()+1);setSchDate(tmr.toISOString().slice(0,10));
                }}
            }}>
              <div className="sch-ai-card-top">
                <div className="sch-ai-card-time">{r.time}</div>
                <div className="sch-ai-card-score">{r.score}<span>/10</span></div>
              </div>
              {r.range&&<div className="sch-ai-card-range">{r.range}</div>}
              <div className="sch-ai-card-reason">{r.reason}</div>
              {r.tip&&<div className="sch-ai-card-tip"><I.Sparkle style={{width:10,height:10,flexShrink:0}}/> {r.tip}</div>}
              <div className="sch-ai-card-use">点击使用此时间</div>
            </div>)}
          </div>
        </div></div>}

        {/* QR Login modal */}
        {schQrModal&&<div className="sch-ov" style={{zIndex:150}} onClick={()=>{setSchQrModal(null);fetch(`/schedule-api/accounts/${schQrModal}/cancel-login`,{method:'POST'});}}>
          <div className="sch-nice-modal" style={{width:440}} onClick={e=>e.stopPropagation()}>
            <div className="sch-nm-hd">
              <div className="sch-nm-t">扫码登录</div>
              <button className="mdl-x" onClick={()=>{setSchQrModal(null);fetch(`/schedule-api/accounts/${schQrModal}/cancel-login`,{method:'POST'});}}><I.X/></button>
            </div>
            <div className="sch-nm-body">
              <div className="sch-qr-wrap">
                {schQrStatus==="loading"&&<div className="sch-qr-loading">正在启动浏览器，请稍候...</div>}
                {schQrStatus==="qr_ready"&&<>
                  <div className="sch-qr-sub">请使用手机 App 扫描屏幕上的二维码完成登录</div>
                  {schQrImg&&<img src={schQrImg} className="sch-qr-img"/>}
                </>}
                {schQrStatus==="done"&&<div className="sch-qr-success">
                  <div className="sch-qr-success-icon"><I.Check/></div>
                  <div className="sch-qr-success-t">登录成功</div>
                </div>}
                {schQrStatus==="error"&&<div className="sch-qr-error">
                  <div style={{fontSize:24,marginBottom:8}}>!</div>
                  登录出错，请关闭后重试
                </div>}
              </div>
            </div>
          </div>
        </div>}

        {/* Add Account modal */}
        {schAcctModal&&<div className="sch-ov" style={{zIndex:140}} onClick={()=>setSchAcctModal(false)}>
          <div className="sch-nice-modal" style={{width:480}} onClick={e=>e.stopPropagation()}>
            <div className="sch-nm-hd">
              <div className="sch-nm-t">添加平台账号</div>
              <button className="mdl-x" onClick={()=>setSchAcctModal(false)}><I.X/></button>
            </div>
            <div className="sch-nm-body">
              <div style={{fontSize:12,color:"var(--t3)",marginBottom:16}}>选择要绑定的社交平台</div>
              <div className="sch-nm-plat-grid">
                {[
                  {k:"xiaohongshu",nm:"小红书",desc:"图文 · 短视频",bg:"#FF2442",icon:"红"},
                  {k:"douyin",nm:"抖音",desc:"短视频 · 直播",bg:"#111",icon:"抖"},
                  {k:"kuaishou",nm:"快手",desc:"短视频 · 直播",bg:"#FF6600",icon:"快"},
                  {k:"wechat",nm:"微信公众号",desc:"文章 · 贴图 · 视频",bg:"#07C160",icon:"微"},
                ].map(p=><div key={p.k} className={`sch-nm-plat-card ${schNewAcctPlat===p.k?"on":""}`} onClick={()=>setSchNewAcctPlat(p.k)}>
                  <div className="sch-nm-plat-icon" style={{background:p.bg}}>{p.icon}</div>
                  <div className="sch-nm-plat-name">{p.nm}</div>
                  <div className="sch-nm-plat-desc">{p.desc}</div>
                </div>)}
              </div>
              <div style={{fontSize:12,fontWeight:600,marginBottom:8,color:"var(--t2)"}}>账号昵称</div>
              <input className="sch-nm-input" placeholder="输入昵称便于识别，如「工作号」「品牌号」" value={schNewAcctName} onChange={e=>setSchNewAcctName(e.target.value)}/>
              {schNewAcctPlat==="wechat"&&<div style={{fontSize:10,color:"var(--t3)",marginTop:12,lineHeight:1.6,padding:"8px 12px",background:"var(--s2)",borderRadius:8}}>添加后需扫码登录微信公众平台（mp.weixin.qq.com），与其他平台流程一致</div>}
              <div className="sch-nm-footer">
                <button className="sch-nm-btn sec" onClick={()=>setSchAcctModal(false)}>取消</button>
                <button className="sch-nm-btn pri" onClick={schAddAccount}>添加账号</button>
              </div>
            </div>
          </div>
        </div>}

        {/* Task Detail modal */}
        {schLogModal&&<div className="sch-ov" style={{zIndex:130}} onClick={()=>setSchLogModal(null)}>
          <div className="sch-nice-modal" style={{width:500}} onClick={e=>e.stopPropagation()}>
            <div className="sch-nm-hd">
              <div className="sch-nm-t">任务详情</div>
              <button className="mdl-x" onClick={()=>setSchLogModal(null)}><I.X/></button>
            </div>
            <div className="sch-nm-body">
              {(()=>{const t=schTasks.find(x=>x.id===schLogModal);if(!t)return<div style={{textAlign:"center",padding:20,color:"var(--t3)"}}>任务未找到</div>;
              const platColors={"xiaohongshu":"#FF2442","douyin":"#111","kuaishou":"#FF6600","wechat":"#07C160"};
              const platNames={"xiaohongshu":"小红书","douyin":"抖音","kuaishou":"快手","wechat":"微信公众号"};
              const platIcons={"xiaohongshu":"红","douyin":"抖","kuaishou":"快","wechat":"微"};
              const statusCfg={success:{bg:"#DCFCE7",color:"#16A34A",text:"已发布"},failed:{bg:"#FEE2E2",color:"#DC2626",text:"发布失败"},running:{bg:"#DBEAFE",color:"#2563EB",text:"发布中"},pending:{bg:"#F3F4F6",color:"#6B7280",text:"待发布"},manual:{bg:"#FEF3C7",color:"#D97706",text:"手动记录"},cancelled:{bg:"#F3F4F6",color:"#9CA3AF",text:"已取消"}};
              const sc=statusCfg[t.status]||statusCfg.pending;
              return<>
                <div className="sch-td-header">
                  <div className="sch-td-plat" style={{background:platColors[t.platform]||"#999"}}>{platIcons[t.platform]||"?"}</div>
                  <div className="sch-td-info">
                    <div className="sch-td-title">{t.title||t.content?.slice(0,30)||"无标题"}</div>
                    <div className="sch-td-meta">
                      <span>{platNames[t.platform]||t.platform}</span>
                      <span>{new Date(t.scheduled_at).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="sch-td-status" style={{background:sc.bg,color:sc.color}}>{sc.text}</div>
                </div>
                {t.content&&<div style={{fontSize:12,color:"var(--t2)",lineHeight:1.6,padding:"12px 14px",background:"var(--s2)",borderRadius:10,marginBottom:14}}>{t.content}</div>}
                {t.error_log&&<div className="sch-td-error">{t.error_log}</div>}
                {t.publish_url&&<div className="sch-td-link"><a href={t.publish_url} target="_blank" rel="noreferrer">查看已发布内容 →</a></div>}
                <div className="sch-td-actions">
                  {t.status==="pending"&&<button className="sch-nm-btn pri" style={{fontSize:12,padding:"8px 20px"}} onClick={()=>{schPublishNow(t.id);setSchLogModal(null);}}>立即发布</button>}
                  {t.status==="failed"&&<button className="sch-nm-btn pri" style={{fontSize:12,padding:"8px 20px"}} onClick={()=>{schPublishNow(t.id);setSchLogModal(null);}}>重新发布</button>}
                  {t.status==="running"&&<button className="sch-nm-btn pri" style={{fontSize:12,padding:"8px 20px",background:"#F59E0B"}} onClick={()=>{schPublishNow(t.id);setSchLogModal(null);}}>强制重试</button>}
                  {t.status==="manual"&&<>
                    <button className="sch-nm-btn pri" style={{fontSize:12,padding:"8px 20px",background:"#16A34A"}} onClick={()=>{schSetStatus(t.id,"success");setSchLogModal(null);}}>标记已发布</button>
                    <button className="sch-nm-btn pri" style={{fontSize:12,padding:"8px 20px"}} onClick={()=>{schPublishNow(t.id);setSchLogModal(null);}}>转为自动发布</button>
                  </>}
                  {t.status==="success"&&t.auto_publish===0&&<button className="sch-nm-btn sec" style={{fontSize:12,padding:"8px 20px",color:"#D97706"}} onClick={()=>{schSetStatus(t.id,"manual");setSchLogModal(null);}}>改为未发布</button>}
                  <button className="sch-nm-btn sec" style={{fontSize:12,padding:"8px 20px",color:"var(--r)"}} onClick={()=>{schDeleteTask(t.id);setSchLogModal(null);}}>删除任务</button>
                </div>
              </>;})()}
            </div>
          </div>
        </div>}
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
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
            <div className="hist-tabs">
              {["全部","快速模式","深度定制","数字人"].map((t,i)=><button key={i} className={`hist-tab ${histTab===i?"on":""}`} onClick={()=>setHistTab(i)}>{t}</button>)}
            </div>
            {creationHistory.length>0&&<button style={{padding:"6px 14px",border:"1.5px solid #F87171",borderRadius:8,background:"#FFF5F5",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={clearHistory}>清空历史</button>}
          </div>
          {(()=>{
            const modeMap=["","quick","deep","avatar"];
            const filtered=histTab===0?creationHistory:creationHistory.filter(r=>r.mode===modeMap[histTab]);
            if(filtered.length===0)return <div className="hist-empty">{histTab===0?"暂无创作记录，去快速模式创建第一个脚本吧":"该分类暂无记录"}</div>;
            return <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>{filtered.map(r=>{
              const modeLabel=r.mode==="deep"?"深度定制":r.mode==="avatar"?"数字人":"快速模式";
              const modeColor=r.mode==="deep"?"#8B5CF6":r.mode==="avatar"?"#14B8A6":"#F59E0B";
              const timeStr=(()=>{const d=new Date(r.time);const now=new Date();const diff=now-d;if(diff<60000)return"刚刚";if(diff<3600000)return Math.floor(diff/60000)+"分钟前";if(diff<86400000)return Math.floor(diff/3600000)+"小时前";if(diff<604800000)return Math.floor(diff/86400000)+"天前";return d.toLocaleDateString("zh-CN",{month:"short",day:"numeric"});})();
              return <div key={r.id} style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:14,padding:18,cursor:"pointer",transition:"all .25s ease"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--pl)";e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 14px rgba(0,0,0,.06)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bl)";e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}} onClick={()=>restoreFromHistory(r)}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                  <span style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:modeColor+"18",color:modeColor,fontWeight:600}}>{modeLabel}</span>
                  <span style={{fontSize:11,color:"var(--t3)"}}>{timeStr}</span>
                </div>
                <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{r.prod||"未命名"}</div>
                <div style={{fontSize:11,color:"var(--t3)",marginBottom:10,display:"flex",gap:12}}>
                  <span>品类：{r.cat||"通用"}</span><span>时长：{r.dur||"--"}</span><span>方案：{r.scripts?.length||0}个</span>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:10}}>{(r.scripts||[]).slice(0,3).map((s,i)=><span key={i} style={{fontSize:10,padding:"2px 8px",borderRadius:4,background:"var(--s3)",color:"var(--t2)"}}>{s.name}</span>)}</div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span style={{fontSize:11,color:"var(--p)",fontWeight:500,display:"flex",alignItems:"center",gap:3}}>点击继续编辑 <I.ChevronR/></span>
                  <button style={{border:"none",background:"none",cursor:"pointer",color:"var(--t3)",padding:4}} onClick={e=>{e.stopPropagation();deleteHistoryItem(r.id);}}><I.Trash/></button>
                </div>
              </div>;
            })}</div>;
          })()}
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
              <input className="tool-inp" value={hotLink} onChange={e=>setHotLink(e.target.value)} placeholder="请粘贴抖音分享链接（完整分享链接）" disabled={hotBusy}/>
            </div>
            <div className="tool-row">
              <div className="tool-fg">
                <div className="tool-fg-l">所属行业</div>
                <select className="tool-sel" value={hotIndustry} onChange={e=>setHotIndustry(e.target.value)} disabled={hotBusy}>
                  <option value="">选择目标行业</option><option>美妆护肤</option><option>食品保健</option><option>数码3C</option><option>教育培训</option><option>服装鞋包</option><option>家居生活</option>
                </select>
              </div>
              <div className="tool-fg">
                <div className="tool-fg-l">你的产品/服务是什么？</div>
                <input className="tool-inp" value={hotProduct} onChange={e=>setHotProduct(e.target.value)} placeholder="例如：补水保湿面膜 / 线上英语课程" disabled={hotBusy}/>
              </div>
            </div>
            <div className="tool-fg">
              <div className="tool-fg-l">对改写脚本的具体要求</div>
              <textarea className="tool-inp" rows={4} value={hotReq} onChange={e=>setHotReq(e.target.value)} placeholder="例如：30秒以内、适合信息流投放、语气专业可信、突出痛点和解决方案等" style={{resize:"vertical"}} disabled={hotBusy}/>
            </div>
            <button className="tool-btn blue" onClick={runHotBreak} disabled={hotBusy} style={hotBusy?{opacity:.7,cursor:"not-allowed"}:{}}>{hotBusy?<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .6s linear infinite"}}/> {hotStep}</>:<><I.Zap/> 生成爆款拆解报告</>}</button>
            <div className="tool-hint">AI将为您深度分析视频结构、情绪曲线及爆款逻辑，并生成6份优化脚本<br/>支持抖音和小红书分享链接</div>
          </div>
          {hotError&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"14px 18px",marginTop:16,color:"#DC2626",fontSize:13,fontWeight:500}}>{hotError}</div>}
          {hotBusy&&!hotResult&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:32,marginTop:16,textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:"var(--t1)",marginBottom:8}}>{hotStep}</div><div style={{width:200,height:4,background:"var(--s3)",borderRadius:2,margin:"0 auto",overflow:"hidden"}}><div style={{width:"60%",height:"100%",background:"#3B82F6",borderRadius:2,animation:"vgShimmer 1.5s infinite linear",backgroundSize:"200% 100%",backgroundImage:"linear-gradient(90deg,#3B82F6 25%,#60A5FA 50%,#3B82F6 75%)"}}/></div></div>}
          {hotResult&&hotResult.analysis&&(()=>{const a=hotResult.analysis;const vi=hotResult.videoInfo;return<div style={{marginTop:16}}>
            {vi.title&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:10}}>视频信息</div>
              <div style={{fontSize:15,fontWeight:700,marginBottom:6}}>{vi.title}</div>
              <div style={{display:"flex",gap:16,fontSize:12,color:"var(--t2)",flexWrap:"wrap"}}>
                {vi.author&&<span>作者：{vi.author}</span>}
                {vi.play_count>0&&<span>播放：{vi.play_count>=10000?(vi.play_count/10000).toFixed(1)+"w":vi.play_count}</span>}
                {vi.digg_count>0&&<span>点赞：{vi.digg_count>=10000?(vi.digg_count/10000).toFixed(1)+"w":vi.digg_count}</span>}
                {vi.comment_count>0&&<span>评论：{vi.comment_count}</span>}
                {vi.duration>0&&<span>时长：{Math.round(vi.duration/1000)}s</span>}
              </div>
            </div>}
            <div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>钩子分析</div>
              {a.hook&&<div><div style={{display:"flex",gap:8,marginBottom:8,flexWrap:"wrap"}}><span style={{background:"#DBEAFE",color:"#2563EB",padding:"2px 10px",borderRadius:6,fontSize:11,fontWeight:600}}>{a.hook.type||"钩子"}</span></div>
              <div style={{fontSize:14,fontWeight:600,marginBottom:4,color:"var(--t1)"}}>{a.hook.text}</div>
              <div style={{fontSize:12,color:"var(--t2)"}}>{a.hook.mechanism}</div></div>}
            </div>
            {a.tension_beats&&a.tension_beats.length>0&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>节奏节拍</div>
              {a.tension_beats.map((b,i)=><div key={i} style={{display:"flex",gap:12,marginBottom:8,fontSize:13,alignItems:"flex-start"}}><span style={{background:"#EFF6FF",color:"#3B82F6",padding:"2px 8px",borderRadius:4,fontSize:11,fontWeight:600,whiteSpace:"nowrap"}}>{b.time_range}</span><div><span style={{fontWeight:600}}>{b.device}</span><span style={{color:"var(--t2)",marginLeft:6}}>{b.function}</span></div></div>)}
            </div>}
            {a.emotional_arc&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>情绪曲线</div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{(Array.isArray(a.emotional_arc)?a.emotional_arc:String(a.emotional_arc).split("→")).map((e,i,arr)=><span key={i} style={{display:"flex",alignItems:"center",gap:4}}><span style={{background:"linear-gradient(135deg,#3B82F6,#8B5CF6)",color:"#fff",padding:"4px 12px",borderRadius:8,fontSize:12,fontWeight:600}}>{String(e).trim()}</span>{i<arr.length-1&&<span style={{color:"var(--t3)"}}>→</span>}</span>)}</div>
            </div>}
            {a.selling_point_insertion&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>卖点植入</div>
              <div style={{fontSize:13}}><span style={{fontWeight:600}}>方式：</span>{a.selling_point_insertion.method} <span style={{fontWeight:600,marginLeft:12}}>时机：</span>{a.selling_point_insertion.timing} <span style={{fontWeight:600,marginLeft:12}}>自然度：</span><span style={{color:a.selling_point_insertion.naturalness>=7?"#10B981":"#F59E0B",fontWeight:700}}>{a.selling_point_insertion.naturalness}/10</span></div>
            </div>}
            {a.creative_device&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>创意装置</div>
              <div style={{marginBottom:6}}><span style={{background:"#F0FDF4",color:"#16A34A",padding:"2px 10px",borderRadius:6,fontSize:11,fontWeight:600}}>{a.creative_device.type}</span></div>
              <div style={{fontSize:13,marginBottom:4}}>{a.creative_device.description}</div>
              <div style={{fontSize:12,color:"#7C3AED",fontWeight:600,background:"#F5F0FF",padding:"6px 12px",borderRadius:8,display:"inline-block"}}>可迁移公式：{a.creative_device.transferable_formula}</div>
            </div>}
            {a.speaking_style&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>口播风格</div>
              <div style={{fontSize:13}}><span style={{fontWeight:600}}>语气：</span>{a.speaking_style.tone} <span style={{fontWeight:600,marginLeft:12}}>节奏：</span>{a.speaking_style.rhythm}</div>
              {a.speaking_style.oral_fragments&&<div style={{display:"flex",gap:6,marginTop:8,flexWrap:"wrap"}}>{a.speaking_style.oral_fragments.map((f,i)=><span key={i} style={{background:"#FEF3C7",color:"#B45309",padding:"2px 8px",borderRadius:4,fontSize:11}}>{f}</span>)}</div>}
            </div>}
            {a.comment_insights&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>评论洞察</div>
              {a.comment_insights.top_concerns&&<div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>观众关心：</span>{a.comment_insights.top_concerns.map((c,i)=><span key={i} style={{background:"#EFF6FF",color:"#2563EB",padding:"2px 8px",borderRadius:4,fontSize:11,marginLeft:4}}>{c}</span>)}</div>}
              {a.comment_insights.emotional_triggers&&<div style={{marginBottom:8}}><span style={{fontSize:12,fontWeight:600}}>情绪触发：</span>{a.comment_insights.emotional_triggers.map((t,i)=><span key={i} style={{background:"#FEF2F2",color:"#DC2626",padding:"2px 8px",borderRadius:4,fontSize:11,marginLeft:4}}>{t}</span>)}</div>}
              {a.comment_insights.controversy&&<div><span style={{fontSize:12,fontWeight:600}}>争议点：</span><span style={{fontSize:12,color:"var(--t2)"}}>{a.comment_insights.controversy}</span></div>}
            </div>}
            {a.success_core&&<div style={{background:"linear-gradient(135deg,#EFF6FF,#F5F0FF)",border:"1px solid #DBEAFE",borderRadius:16,padding:20,marginBottom:12,textAlign:"center"}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:8}}>爆款核心</div>
              <div style={{fontSize:16,fontWeight:800,color:"#2563EB"}}>{a.success_core}</div>
            </div>}
          </div>;})()}
          {hotScripts&&hotScripts.length>0&&<div style={{marginTop:16}}>
            <div style={{fontSize:16,fontWeight:800,marginBottom:12,color:"var(--t1)"}}>6份优化脚本</div>
            {hotScripts.map((sc,si)=><div key={si} style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,flexWrap:"wrap",gap:8}}>
                <div style={{fontSize:14,fontWeight:700}}><span style={{background:"#3B82F6",color:"#fff",padding:"2px 8px",borderRadius:6,fontSize:11,fontWeight:600,marginRight:8}}>方案{si+1}</span>{sc.name}</div>
                <div style={{display:"flex",gap:6}}><span style={{background:"#EFF6FF",color:"#3B82F6",padding:"2px 8px",borderRadius:4,fontSize:11}}>{sc.type}</span><span style={{background:"#F5F0FF",color:"#7C3AED",padding:"2px 8px",borderRadius:4,fontSize:11}}>{sc.duration}</span></div>
              </div>
              {sc.strategy&&<div style={{fontSize:12,color:"var(--t2)",marginBottom:6}}>策略：{sc.strategy}</div>}
              {sc.emotion_arc&&<div style={{fontSize:12,color:"#7C3AED",marginBottom:10}}>情绪：{sc.emotion_arc}</div>}
              {sc.shots&&<div style={{borderTop:"1px solid var(--bl)",paddingTop:10}}>
                {sc.shots.map((sh,shi)=><div key={shi} style={{display:"flex",gap:10,marginBottom:8,fontSize:12,padding:"8px 10px",background:shi%2===0?"var(--s2)":"transparent",borderRadius:8}}>
                  <div style={{minWidth:36,fontWeight:700,color:"#3B82F6"}}>#{sh.shot||shi+1}</div>
                  <div style={{minWidth:36,color:"var(--t3)"}}>{sh.dur}</div>
                  <div style={{flex:1}}><div style={{fontWeight:600,marginBottom:2}}>{sh.copy}</div><div style={{color:"var(--t3)"}}>{sh.scene}</div></div>
                </div>)}
              </div>}
              <button style={{marginTop:8,padding:"8px 16px",border:"1.5px solid #3B82F6",borderRadius:8,background:"#EFF6FF",color:"#3B82F6",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{const txt=`【${sc.name}】\n类型：${sc.type}\n时长：${sc.duration}\n策略：${sc.strategy||""}\n情绪：${sc.emotion_arc||""}\n\n${(sc.shots||[]).map(s=>`[${s.dur}] ${s.copy}\n画面：${s.scene}`).join("\n\n")}`;navigator.clipboard.writeText(txt).then(()=>alert("已复制到剪贴板"));}}>复制此脚本</button>
            </div>)}
          </div>}
          {!hotResult&&!hotBusy&&!hotError&&<div className="tool-empty">
            <div className="tool-empty-ic">📊</div>
            <div className="tool-empty-t">粘贴视频链接，开始拆解爆款密码</div>
            <div className="tool-empty-d">分析结果将在此处展示</div>
          </div>}
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
              <input className="tool-inp" value={posMain} onChange={e=>setPosMain(e.target.value)} placeholder="请输入你的主要业务，例如：美妆护肤、健身私教、咖啡馆等" disabled={posBusy}/>
            </div>
            <div className="tool-row">
              <div className="tool-fg">
                <div className="tool-fg-l">所属行业</div>
                <select className="tool-sel" value={posInd} onChange={e=>setPosInd(e.target.value)} disabled={posBusy}>
                  <option value="">选择目标行业</option><option>美妆护肤</option><option>食品保健</option><option>数码3C</option><option>教育培训</option><option>服装鞋包</option><option>家居生活</option>
                </select>
                <input className="tool-inp" style={{marginTop:6}} placeholder="或输入自定义行业，如：新茶饮" disabled={posBusy}/>
              </div>
              <div className="tool-fg">
                <div className="tool-fg-l">分析深度 <span className="rq">*</span></div>
                <div style={{display:"flex",gap:6}}>
                  {[{k:"fast",l:"快速"},{k:"standard",l:"标准版"},{k:"deep",l:"深度"}].map(d=>(
                    <button key={d.k} className={`tool-hd-tag ${posDepth===d.k?"on":""}`} style={posDepth===d.k?{background:"var(--p)",borderColor:"var(--p)",color:"#fff"}:{}} onClick={()=>setPosDepth(d.k)} disabled={posBusy}>{d.l}</button>
                  ))}
                </div>
              </div>
            </div>
            <div className="tool-row">
              <div className="tool-fg">
                <div className="tool-fg-l">你的抖音主页链接</div>
                <input className="tool-inp" value={posDouyinLink} onChange={e=>setPosDouyinLink(e.target.value)} placeholder="例如：https://www.douyin.com/user/xxxxxx" disabled={posBusy}/>
              </div>
            </div>
            <div className="tool-fg">
              <div className="tool-fg-l">竞品抖音链接（选填）</div>
              <textarea className="tool-inp" rows={3} value={posCompLinks} onChange={e=>setPosCompLinks(e.target.value)} placeholder="可填写1~3个竞品抖音视频或主页链接，每行一个" style={{resize:"vertical"}} disabled={posBusy}/>
            </div>
            <button className="tool-btn purple" onClick={runPos360} disabled={posBusy} style={posBusy?{opacity:.7,cursor:"not-allowed"}:{}}>{posBusy?<><span style={{width:14,height:14,border:"2px solid rgba(255,255,255,.3)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin .6s linear infinite"}}/> {posStep}</>:<><I.Target/> 开始定位分析</>}</button>
          </div>
          {posError&&<div style={{background:"#FEF2F2",border:"1px solid #FECACA",borderRadius:12,padding:"14px 18px",marginTop:16,color:"#DC2626",fontSize:13,fontWeight:500}}>{posError}</div>}
          {posBusy&&!posResult&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:32,marginTop:16,textAlign:"center"}}><div style={{fontSize:14,fontWeight:600,color:"var(--t1)",marginBottom:8}}>{posStep}</div><div style={{width:200,height:4,background:"var(--s3)",borderRadius:2,margin:"0 auto",overflow:"hidden"}}><div style={{width:"60%",height:"100%",background:"var(--p)",borderRadius:2,animation:"vgShimmer 1.5s infinite linear",backgroundSize:"200% 100%",backgroundImage:"linear-gradient(90deg,var(--p) 25%,var(--pl) 50%,var(--p) 75%)"}}/></div></div>}
          {posResult&&(()=>{const r=posResult;return<div style={{marginTop:16}}>
            {r.industry_overview&&<div style={{background:"linear-gradient(135deg,#F5F0FF,#EDE9FE)",border:"1px solid #DDD6FE",borderRadius:16,padding:24,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>行业概览</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                <div><div style={{fontSize:11,color:"var(--t3)",marginBottom:2}}>市场规模</div><div style={{fontSize:14,fontWeight:700}}>{r.industry_overview.market_size}</div></div>
                <div><div style={{fontSize:11,color:"var(--t3)",marginBottom:2}}>增长趋势</div><div style={{fontSize:14,fontWeight:700}}>{r.industry_overview.growth_trend}</div></div>
                <div><div style={{fontSize:11,color:"var(--t3)",marginBottom:2}}>竞争程度</div><div style={{fontSize:14,fontWeight:700}}>{r.industry_overview.competition_level}</div></div>
                <div><div style={{fontSize:11,color:"var(--t3)",marginBottom:2}}>机会评分</div><div style={{fontSize:20,fontWeight:800,color:"var(--p)"}}>{r.industry_overview.opportunity_score}<span style={{fontSize:12,color:"var(--t3)"}}>/10</span></div></div>
              </div>
            </div>}
            {r.target_audience&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>目标用户</div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{r.target_audience.primary}</div>
              <div style={{fontSize:12,color:"var(--t2)",marginBottom:8}}>{r.target_audience.demographics}</div>
              {r.target_audience.pain_points&&<div style={{marginBottom:8}}><div style={{fontSize:11,fontWeight:600,color:"var(--t3)",marginBottom:4}}>用户痛点</div>{r.target_audience.pain_points.map((p,i)=><div key={i} style={{fontSize:12,padding:"4px 0",display:"flex",gap:6,alignItems:"flex-start"}}><span style={{color:"#DC2626",fontWeight:700}}>!</span>{p}</div>)}</div>}
              {r.target_audience.content_preferences&&<div><div style={{fontSize:11,fontWeight:600,color:"var(--t3)",marginBottom:4}}>内容偏好</div><div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{r.target_audience.content_preferences.map((c,i)=><span key={i} style={{background:"#F5F0FF",color:"var(--p)",padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600}}>{c}</span>)}</div></div>}
            </div>}
            {r.competitive_landscape&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>竞争格局</div>
              {r.competitive_landscape.top_players&&r.competitive_landscape.top_players.length>0&&<div style={{marginBottom:12}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>头部玩家</div>
                {r.competitive_landscape.top_players.map((p,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"8px 10px",background:i%2===0?"var(--s2)":"transparent",borderRadius:8,fontSize:12,marginBottom:2}}>
                  <div><span style={{fontWeight:700}}>{p.name}</span><span style={{color:"var(--t3)",marginLeft:8}}>{p.followers}</span></div>
                  <div style={{color:"var(--t2)"}}>{p.content_type}</div>
                </div>)}
              </div>}
              {r.competitive_landscape.gaps&&<div style={{marginBottom:8}}><div style={{fontSize:12,fontWeight:600,marginBottom:4}}>竞争空白</div>{r.competitive_landscape.gaps.map((g,i)=><span key={i} style={{background:"#F0FDF4",color:"#16A34A",padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600,marginRight:6,display:"inline-block",marginBottom:4}}>{g}</span>)}</div>}
              {r.competitive_landscape.differentiation_opportunities&&<div><div style={{fontSize:12,fontWeight:600,marginBottom:4}}>差异化机会</div>{r.competitive_landscape.differentiation_opportunities.map((d,i)=><span key={i} style={{background:"#FEF3C7",color:"#B45309",padding:"3px 10px",borderRadius:6,fontSize:11,fontWeight:600,marginRight:6,display:"inline-block",marginBottom:4}}>{d}</span>)}</div>}
            </div>}
            {r.positioning_recommendation&&<div style={{background:"linear-gradient(135deg,#EFF6FF,#F5F0FF)",border:"1px solid #DBEAFE",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>定位建议</div>
              <div style={{fontSize:18,fontWeight:800,color:"var(--p)",marginBottom:12,textAlign:"center",padding:"12px 0"}}>{r.positioning_recommendation.core_positioning}</div>
              {r.positioning_recommendation.content_pillars&&<div style={{marginBottom:10}}><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>内容支柱</div>{r.positioning_recommendation.content_pillars.map((cp,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 10px",background:"rgba(255,255,255,.6)",borderRadius:8,marginBottom:4,fontSize:12}}><span style={{fontWeight:700,minWidth:80}}>{cp.pillar}</span><span style={{color:"var(--t2)",flex:1}}>{cp.description}</span><span style={{color:"var(--p)",fontWeight:600,whiteSpace:"nowrap"}}>{cp.frequency}</span></div>)}</div>}
              <div style={{display:"flex",gap:16,fontSize:12}}>
                {r.positioning_recommendation.tone_style&&<div><span style={{fontWeight:600}}>调性：</span>{r.positioning_recommendation.tone_style}</div>}
                {r.positioning_recommendation.visual_identity&&<div><span style={{fontWeight:600}}>视觉：</span>{r.positioning_recommendation.visual_identity}</div>}
              </div>
            </div>}
            {r.content_strategy&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>内容策略</div>
              {r.content_strategy.hero_content&&<div style={{background:"#FEF3C7",borderRadius:10,padding:"10px 14px",marginBottom:10,fontSize:13}}><span style={{fontWeight:700,color:"#B45309"}}>杀手锏：</span>{r.content_strategy.hero_content}</div>}
              {r.content_strategy.quick_wins&&<div style={{marginBottom:8}}><div style={{fontSize:12,fontWeight:600,marginBottom:4}}>快速起量方向</div>{r.content_strategy.quick_wins.map((q,i)=><div key={i} style={{fontSize:12,padding:"3px 0",display:"flex",gap:6}}><span style={{color:"#10B981",fontWeight:700}}>+</span>{q}</div>)}</div>}
              {r.content_strategy.long_term_plays&&<div style={{marginBottom:10}}><div style={{fontSize:12,fontWeight:600,marginBottom:4}}>长期建设</div>{r.content_strategy.long_term_plays.map((l,i)=><div key={i} style={{fontSize:12,padding:"3px 0",display:"flex",gap:6}}><span style={{color:"#3B82F6",fontWeight:700}}>→</span>{l}</div>)}</div>}
              {r.content_strategy.content_calendar&&r.content_strategy.content_calendar.length>0&&<div><div style={{fontSize:12,fontWeight:600,marginBottom:6}}>内容日历</div>
                {r.content_strategy.content_calendar.map((w,i)=><div key={i} style={{display:"flex",gap:10,padding:"6px 10px",background:i%2===0?"var(--s2)":"transparent",borderRadius:6,fontSize:12,marginBottom:2}}>
                  <span style={{fontWeight:700,minWidth:40,color:"var(--p)"}}>{w.week}</span><span style={{flex:1}}>{w.theme}</span><span style={{color:"var(--t3)"}}>{(w.content_types||[]).join("、")}</span><span style={{fontWeight:600}}>{w.count}篇</span>
                </div>)}
              </div>}
            </div>}
            {r.monetization&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>变现路径</div>
              <div style={{fontSize:14,fontWeight:700,marginBottom:4}}>{r.monetization.primary_model}</div>
              {r.monetization.secondary_models&&<div style={{display:"flex",gap:6,marginBottom:6,flexWrap:"wrap"}}>{r.monetization.secondary_models.map((m,i)=><span key={i} style={{background:"#F0FDF4",color:"#16A34A",padding:"2px 10px",borderRadius:6,fontSize:11,fontWeight:600}}>{m}</span>)}</div>}
              <div style={{fontSize:12,color:"var(--t2)"}}>预计起量周期：{r.monetization.estimated_timeline}</div>
            </div>}
            {r.action_plan&&r.action_plan.length>0&&<div style={{background:"var(--s)",border:"1px solid var(--bl)",borderRadius:16,padding:20,marginBottom:12}}>
              <div style={{fontSize:11,color:"var(--t3)",fontWeight:600,textTransform:"uppercase",letterSpacing:1,marginBottom:12}}>行动计划</div>
              {r.action_plan.map((ap,i)=><div key={i} style={{display:"flex",gap:10,padding:"8px 10px",borderRadius:8,marginBottom:4,fontSize:13,background:ap.priority==="P0"?"#FEF2F2":ap.priority==="P1"?"#FEF3C7":"var(--s2)"}}>
                <span style={{fontWeight:800,fontSize:11,padding:"2px 8px",borderRadius:4,background:ap.priority==="P0"?"#DC2626":ap.priority==="P1"?"#F59E0B":"#71717A",color:"#fff"}}>{ap.priority}</span>
                <span style={{flex:1,fontWeight:500}}>{ap.action}</span>
                <span style={{color:"var(--t3)",whiteSpace:"nowrap"}}>{ap.timeline}</span>
              </div>)}
            </div>}
          </div>;})()}
          {!posResult&&!posBusy&&!posError&&<div className="tool-empty">
            <div className="tool-empty-ic">🎯</div>
            <div className="tool-empty-t">请先填写你的主要业务，选择行业与分析深度</div>
            <div className="tool-empty-d">例如：主要业务"线下皮肤管理工作室" + 行业"美妆/护肤" + 分析深度"标准版"</div>
          </div>}
        </div></div>}
        {pg==="tmpl"&&<div className="sc">
          <div className="tt" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{display:"flex",gap:4}}>{["KOL风格","营销方法论","行业专属","AI提炼"].map(t=><button key={t} className={`tti ${tTab===t?"on":""}`} onClick={()=>setTTab(t)}>{t}</button>)}</div>
            {tTab==="AI提炼"&&<div style={{display:"flex",gap:8}}>
              {aiTemplates.length>0&&!delMode&&<button style={{padding:"6px 14px",border:"1.5px solid #F87171",borderRadius:8,background:"#FFF5F5",color:"#EF4444",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>{setDelMode(true);setDelSel([])}}>删除模板</button>}
              {!delMode&&<button style={{padding:"6px 14px",border:"1.5px solid #3B82F6",borderRadius:8,background:"#EFF6FF",color:"#3B82F6",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:4}} onClick={()=>{setShowExtract(true);setExtStep("");setExtLink("");setExtName("");setExtCat("");}}><I.Link/> 提取模板</button>}
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
        {showExtract&&<div className="sb-ov" onClick={e=>{if(e.target===e.currentTarget&&!extBusy){setShowExtract(false);setExtStep("");setExtStepIdx(-1);}}}>
          <div style={{background:"var(--s)",borderRadius:18,padding:28,width:520,boxShadow:"0 8px 40px rgba(0,0,0,.12)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <div style={{fontSize:15,fontWeight:700}}>提取博主模板</div>
              {!extBusy&&<button style={{border:"none",background:"none",cursor:"pointer",color:"var(--t2)"}} onClick={()=>{setShowExtract(false);setExtStep("");setExtStepIdx(-1);}}><I.X/></button>}
            </div>
            <div style={{background:"linear-gradient(135deg,#EFF6FF,#F0F9FF)",borderRadius:12,padding:"14px 16px",marginBottom:16,border:"1px solid #BFDBFE"}}>
              <div style={{fontSize:12,fontWeight:600,color:"#1E40AF",marginBottom:10}}>获取链接只需三步</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {[{t:(<>打开抖音 App，找到你喜欢的博主主页</>)},{t:(<>点击主页右上角 <svg width="14" height="14" viewBox="0 0 24 24" style={{verticalAlign:"-2px",margin:"0 1px"}}><circle cx="12" cy="12" r="11" fill="none" stroke="#334155" strokeWidth="1.8"/><circle cx="7" cy="12" r="1.5" fill="#334155"/><circle cx="12" cy="12" r="1.5" fill="#334155"/><circle cx="17" cy="12" r="1.5" fill="#334155"/></svg> 选择「分享名片」再点「复制链接」</>)},{t:(<>回到这里，直接粘贴即可（包含文字也没关系）</>)}].map((s,i)=><div key={i} style={{display:"flex",alignItems:"flex-start",gap:10}}>
                  <div style={{width:22,height:22,borderRadius:"50%",background:"#fff",border:"1.5px solid #93C5FD",color:"#3B82F6",fontSize:11,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{i+1}</div>
                  <div style={{fontSize:12,color:"#334155",lineHeight:1.6}}>{s.t}</div>
                </div>)}
              </div>
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <div>
                <div style={{fontSize:12,fontWeight:600,marginBottom:4,color:"var(--t1)"}}>博主链接 <span style={{color:"#EF4444"}}>*</span></div>
                <input style={{width:"100%",padding:"10px 12px",border:"1.5px solid var(--bl)",borderRadius:10,fontSize:12,outline:"none",boxSizing:"border-box",fontFamily:"inherit"}} placeholder="直接粘贴复制的内容，如：7- 长按复制... https://v.douyin.com/xxx" value={extLink} onChange={e=>setExtLink(e.target.value)} disabled={extBusy}/>
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
            {extStepIdx>=0&&<div style={{marginTop:16,borderRadius:12,overflow:"hidden",border:"1px solid",borderColor:extStep.startsWith("err:")?"#FECACA":extStepIdx===4?"#BBF7D0":"#E2E8F0"}}>
              <div style={{background:extStep.startsWith("err:")?"#FEF2F2":extStepIdx===4?"#F0FDF4":"#F8FAFC",padding:"12px 16px"}}>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
                  {extBusy&&<span style={{display:"inline-block",width:16,height:16,border:"2.5px solid #DBEAFE",borderTopColor:"#3B82F6",borderRadius:"50%",animation:"spin .8s linear infinite",flexShrink:0}}/>}
                  {extStepIdx===4&&<div style={{width:16,height:16,borderRadius:"50%",background:"#10B981",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}><I.Check/></div>}
                  {extStep.startsWith("err:")&&<div style={{width:16,height:16,borderRadius:"50%",background:"#EF4444",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontSize:11,fontWeight:700}}>!</div>}
                  <span style={{fontSize:12,fontWeight:600,color:extStep.startsWith("err:")?"#DC2626":extStepIdx===4?"#16A34A":"#1E40AF"}}>{extStep.startsWith("err:")?"提取遇到问题":extStepIdx===4?"提取完成":extSteps[extStepIdx]+"..."}</span>
                </div>
                {!extStep.startsWith("err:")&&extStepIdx<5&&<div style={{background:"#E2E8F0",borderRadius:99,height:6,overflow:"hidden"}}>
                  <div style={{height:"100%",borderRadius:99,background:extStepIdx===4?"#10B981":"linear-gradient(90deg,#3B82F6,#6366F1)",transition:"width .5s ease",width:extStepIdx===4?"100%":(extStepIdx*25+12)+"%"}}/>
                </div>}
                {!extStep.startsWith("err:")&&extStepIdx<4&&<div style={{display:"flex",justifyContent:"space-between",marginTop:6}}>
                  {extSteps.slice(0,4).map((s,i)=><span key={i} style={{fontSize:9,color:i<=extStepIdx?"#3B82F6":"#94A3B8",fontWeight:i===extStepIdx?600:400,transition:"all .3s"}}>{s}</span>)}
                </div>}
                {extInfo&&!extStep.startsWith("err:")&&extStepIdx<4&&<div style={{marginTop:6,fontSize:11,color:"#64748B"}}>{extInfo}</div>}
                {extStepIdx===4&&<div style={{marginTop:4,fontSize:11,color:"#16A34A"}}>{extInfo}</div>}
              </div>
              {extStep.startsWith("err:")&&<div style={{padding:"10px 16px",background:"#fff",borderTop:"1px solid #FECACA",fontSize:10,color:"#92400E",whiteSpace:"pre-wrap",lineHeight:1.6,maxHeight:120,overflow:"auto"}}>{extStep.slice(4)}</div>}
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
            <div className="iph"><div className="iph-a">IP</div><div className="iph-n">我的创作者人设</div><div className="iph-d">基于AI访谈生成的个性化IP画像，自动融入脚本创作</div><div className="iph-ts">{["专业测评","亲和力强","干货分享","真实体验","数据说话"].map((t,i)=><span key={i} className="iph-t">{t}</span>)}</div><div className="iph-ac"><button className="bt bt-p" onClick={()=>{voiceCleanup();setIpFlow(true);setIpStep(0);setIpPhase(0);setIpQIdx(0);setIpAnswers([]);setIpCurAns("");setIpEditing(null);setIpMode("text");}}><I.Mic/> 重新访谈</button><button className="bt bt-g"><I.Edit/> 手动编辑</button></div></div>
            <div className="ips"><div className="ips-t"><I.User/> 人设基本信息</div><div className="ipg">{[{l:"表达风格",v:"轻松幽默、接地气"},{l:"专业领域",v:"美妆护肤、个人护理"},{l:"目标受众",v:"18-35岁女性用户"},{l:"内容调性",v:"真实测评+干货分享"},{l:"常用平台",v:"抖音、小红书"},{l:"视频风格",v:"对镜口播+实测对比"}].map((x,i)=><div key={i} className="ipi"><div className="ipi-l">{x.l}</div><div className="ipi-v">{x.v}</div></div>)}</div></div>
            <div className="ips"><div className="ips-t"><I.Sparkle/> 创作偏好</div><div style={{fontSize:12,color:"var(--t2)",lineHeight:1.8}}><p style={{marginBottom:8}}>开头习惯用反问句或痛点切入，善于用数据对比突出产品优势。文案风格偏口语化。</p><p>结尾通常以限时优惠或个人推荐作为转化钩子，偏好30-60秒的短视频节奏。</p></div></div>
            <div className="ips"><div className="ips-t"><I.BarChart/> IP应用效果</div><div className="ipg">{[{l:"IP融合脚本数",v:"18个"},{l:"平均匹配度",v:"92%"},{l:"完播率提升",v:"+15%"},{l:"转化率提升",v:"+8%"}].map((x,i)=><div key={i} className="ipi"><div className="ipi-l">{x.l}</div><div className="ipi-v" style={{color:"var(--p)",fontWeight:700}}>{x.v}</div></div>)}</div></div>
          </>:<div className="ip-fw">

            {/* Step 0: Choose mode */}
            {ipStep===0&&<div>
              <div className="ip-fw-t">开始IP人设访谈</div>
              <div className="ip-fw-d">通过AI深度访谈，生成专属于你的创作者人设画像<br/>你的回答将决定AI为你生成的每一条脚本的风格</div>
              <div className="ip-mode-wrap">
                <div className="ip-mode-main" onClick={()=>{setIpMode("text");setIpStep(1);}}>
                  <div className="im-ic"><I.Edit/></div>
                  <div className="im-t">开始文字访谈</div>
                  <div className="im-d">通过文字问答，逐步梳理你的IP定位和表达风格</div>
                </div>
                <div className="ip-mode-alt" onClick={()=>{setIpMode("voice");setIpStep(1);}}>
                  <div><div className="im-t">🎙️ 语音访谈</div><div className="im-d">像打电话一样，直接说就行</div></div>
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
              <div className="ip-acts"><button className="bt bt-g" onClick={()=>setIpStep(0)}>上一步</button><button className="bt bt-p" onClick={()=>{setIpStep(2);if(ipMode==="voice")setTimeout(startVoiceInterview,100);}}>{ipMode==="voice"?"开始语音访谈":"进入访谈"} <I.ArrowR/></button></div>
            </div>}

            {/* Step 2: Voice Interview */}
            {ipStep===2&&ipMode==="voice"&&<div>
              <style>{`@keyframes voicePulse{0%,100%{transform:scale(1);opacity:1}50%{transform:scale(1.15);opacity:0.4}}`}</style>
              <div className="iv-hd">
                <div className="iv-hd-l">
                  <div className="iv-hd-av" style={{background:'linear-gradient(135deg,#8b5cf6,#ec4899)'}}><I.Mic/></div>
                  <div><div className="iv-hd-nm">AI记者 · 语音访谈中</div><div className="iv-hd-sub">像打电话一样，直接说就行</div></div>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:12}}>
                  {voiceState==="connecting"&&<span style={{fontSize:12,color:"var(--t3)",background:"var(--s)",padding:"2px 8px",borderRadius:8}}>连接中...</span>}
                  {wsConnected&&<span style={{fontSize:12,color:"#10b981",background:"rgba(16,185,129,0.1)",padding:"2px 8px",borderRadius:8}}>已连接</span>}
                  <button style={{width:32,height:32,borderRadius:8,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t3)",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}} onClick={()=>{voiceCleanup();setIpFlow(false);setIpStep(0);}} title="退出"><I.X/></button>
                </div>
              </div>

              <div className="iv-phases">
                {[{key:'background',name:'背景采集',sub:'3-5轮'},{key:'hot_topics',name:'热点观点',sub:'3-5轮'},{key:'cognitive',name:'思维挖掘',sub:'4-6轮'},{key:'voice',name:'表达采样',sub:'3-4轮'}].map((p)=>{
                  const po=['background','hot_topics','cognitive','voice'];const ci2=po.indexOf(voicePhase);const pi=po.indexOf(p.key);
                  return <div key={p.key} className={`iv-ph ${pi===ci2?"on":""} ${pi<ci2?"dn":""}`}>
                    <div className="iv-ph-num">{pi<ci2?<I.Check/>:pi+1}</div>
                    <div className="iv-ph-nm">{p.name}</div><div className="iv-ph-sub">{p.sub}</div>
                  </div>;
                })}
              </div>

              {voiceState==="idle"&&!wsConnected?
                <div style={{textAlign:"center",padding:"60px 0"}}>
                  <button className="bt bt-p" style={{fontSize:16,padding:"14px 40px"}} onClick={startVoiceInterview}><I.Mic/> 开始语音访谈</button>
                </div>
              :<div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:250}}>
                <div style={{position:"relative",width:160,height:160,marginBottom:24}}>
                  <div style={{width:160,height:160,borderRadius:"50%",
                    background:voiceState==="ai_speaking"?"linear-gradient(135deg,#8b5cf6,#ec4899)":voiceState==="user_speaking"?"linear-gradient(135deg,#10b981,#06b6d4)":"linear-gradient(135deg,#d1d5db,#9ca3af)",
                    display:"flex",alignItems:"center",justifyContent:"center",transition:"all 0.3s ease",
                    boxShadow:(voiceState==="ai_speaking"||voiceState==="user_speaking")?"0 0 40px rgba(139,92,246,0.3)":"none"}}>
                    <div style={{color:"white",width:48,height:48}}>
                      {voiceState==="ai_speaking"?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                      :voiceState==="user_speaking"?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/></svg>
                      :(voiceState==="thinking"||voiceState==="connecting")?<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{animation:"spin 1s linear infinite"}}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                      :<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3z"/><path d="M3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>}
                    </div>
                  </div>
                  {(voiceState==="ai_speaking"||voiceState==="user_speaking")&&
                    <div style={{position:"absolute",top:-10,left:-10,width:180,height:180,borderRadius:"50%",border:"2px solid",
                      borderColor:voiceState==="ai_speaking"?"rgba(139,92,246,0.4)":"rgba(16,185,129,0.4)",animation:"voicePulse 1.5s ease-in-out infinite"}}/>}
                </div>
                <div style={{fontSize:16,fontWeight:"bold",marginBottom:8}}>
                  {voiceState==="connecting"&&<span style={{color:"var(--t3)"}}>正在连接语音服务...</span>}
                  {voiceState==="ai_speaking"&&<span style={{color:"#8b5cf6"}}>AI正在说话...</span>}
                  {voiceState==="user_speaking"&&<span style={{color:"#10b981"}}>正在听你说...</span>}
                  {voiceState==="thinking"&&<span style={{color:"#f59e0b"}}>AI思考中...</span>}
                  {voiceState==="idle"&&wsConnected&&<span style={{color:"#6b7280"}}>等待你说话...</span>}
                </div>
                {wsConnected&&<div style={{display:"flex",gap:16,fontSize:13,color:"var(--t3)",marginBottom:8}}>
                  <span>{voiceDuration}</span>
                  <span>第 {voiceTranscript.filter(t=>t.role==="user").length} 轮</span>
                </div>}
                {voiceTranscript.length>0&&<div style={{fontSize:13,color:"var(--t2)",maxWidth:400,textAlign:"center",lineHeight:1.5,minHeight:40}}>
                  {(()=>{const f=voiceTranscript.filter(t=>t.role!=='phase');const l=f[f.length-1];if(!l)return '';return l.text.length>80?l.text.slice(0,80)+'...':l.text;})()}
                </div>}
              </div>}

              {voiceTranscript.length>0&&<div style={{marginTop:16}}>
                <div style={{cursor:"pointer",fontSize:13,color:"var(--t3)",textAlign:"center",padding:8,userSelect:"none"}} onClick={()=>setVoiceShowLog(!voiceShowLog)}>
                  {voiceShowLog?"收起对话记录":"查看对话记录"} <I.ChevronD/>
                </div>
                {voiceShowLog&&<div style={{maxHeight:200,overflowY:"auto",padding:8,background:"var(--s)",borderRadius:8}}>
                  {voiceTranscript.map((t,i)=>(
                    <div key={i} style={{marginBottom:10}}>
                      {t.role==='phase'?
                        <div style={{textAlign:"center",padding:8}}><span style={{display:"inline-block",padding:"6px 16px",background:"linear-gradient(135deg,#ede9fe,#ddd6fe)",borderRadius:16,fontSize:12,color:"#6d28d9",fontWeight:"bold"}}>{t.text}</span></div>
                      :t.role==='ai'?
                        <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                          <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#8b5cf6,#ec4899)",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:10,flexShrink:0}}>AI</div>
                          <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.5}}>{t.text}</div>
                        </div>
                      :<div style={{display:"flex",gap:8,alignItems:"flex-start",justifyContent:"flex-end"}}>
                          <div style={{fontSize:13,color:"var(--t1)",lineHeight:1.5,textAlign:"right"}}>{t.text}</div>
                          <div style={{width:24,height:24,borderRadius:"50%",background:"#6b7280",display:"flex",alignItems:"center",justifyContent:"center",color:"white",fontSize:10,flexShrink:0}}>我</div>
                        </div>}
                    </div>
                  ))}
                </div>}
              </div>}

              <div style={{display:"flex",gap:12,justifyContent:"center",marginTop:20,paddingTop:16,borderTop:"1px solid var(--bl)"}}>
                <button style={{width:44,height:44,borderRadius:"50%",border:voiceMuted?"2px solid #ef4444":"1px solid var(--bl)",background:voiceMuted?"rgba(239,68,68,0.1)":"var(--s)",color:voiceMuted?"#ef4444":"var(--t2)",display:"flex",alignItems:"center",justifyContent:"center",cursor:wsConnected?"pointer":"not-allowed",opacity:wsConnected?1:0.5}} onClick={voiceToggleMute} disabled={!wsConnected}>
                  {voiceMuted?<I.X/>:<I.Mic/>}
                </button>
                <button style={{padding:"12px 32px",fontSize:15,background:"#ef4444",color:"white",border:"none",borderRadius:12,cursor:"pointer",display:"flex",alignItems:"center",gap:8,fontFamily:"inherit",fontWeight:600}} onClick={voiceEndCall}>
                  <I.X/> 结束通话
                </button>
              </div>
            </div>}

            {/* Step 2: AI Text Interview */}
            {ipStep===2&&ipMode==="text"&&<div>
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
            <div className="sl-hd"><div className="sl-bk" onClick={()=>{if(!isCreating)activeCreatePg.current=null;setPg("dash");}}><I.ArrowL/> 返回工作台</div><div style={{fontSize:15,fontWeight:700}}>脚本创作</div><button style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t2)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontFamily:"inherit"}} onClick={openModal}><I.Plus/> 新创作</button></div>
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
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}.spin-sm{display:inline-block;width:14px;height:14px;border:2px solid rgba(255,255,255,0.3);border-top-color:#fff;border-radius:50%;animation:spin .8s linear infinite;margin-right:4px;vertical-align:middle;}`}</style>
              <div style={{fontSize:15,fontWeight:600,color:"var(--p)"}}>{aiGenStep||"AI正在生成脚本..."}</div>
              <div style={{fontSize:12,color:"var(--t3)"}}>Gemini 正在根据{libSelTmpl?`「${libSelTmpl.name}」模板`:"您的需求"}创作，请稍候...</div>
            </div>}

            {cs==="results"&&<>
              <div className="rh"><div className="rht">{aiScripts.length>0?`AI脚本已生成 ${aiScripts.length} 条`:`AI生成失败，显示内置示例 ${SCRIPTS.length} 条`}</div><div className="rw">{aiScripts.length>0?"⚠️ 标红词语为违禁高风险词语":"⚠️ 这些是内置示例脚本，请重试AI生成"}</div></div>
              <div className="rb">{(aiScripts.length>0?aiScripts:SCRIPTS).map(s=>(
                <div key={s.id} className="scd fn">
                  <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:8}}>
                    <div className="scd-n">{s.name}</div>
                    <div style={{display:"flex",gap:5,flexShrink:0}}>{(s.badges||[]).map((b,i)=><span key={i} className={`bd bd-${b.c}`}>{b.t}</span>)}</div>
                  </div>
                  <div className="scd-m">预计时长：{s.dur||"--"}　镜头数：{s.shots||0}个　核心卖点：{s.sell||0}个</div>
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
                  <div style={{display:"flex",gap:5,flexShrink:0}}>{(s.badges||[]).map((b,i)=><span key={i} className={`bd bd-${b.c}`}>{b.t}</span>)}</div>
                </div>
                <div style={{fontSize:12,color:"var(--t2)",lineHeight:1.7,padding:"12px 16px",background:"var(--s)",borderRadius:"var(--rl)",border:"1px solid var(--bl)",marginBottom:24}}>
                  {s.desc||""}
                </div>
                <div className="ds">
                  <div className="dst">创作逻辑推导</div>
                  {(s.logic||[]).map((l,i)=><div key={i} className="li"><div className="ln">{i+1}</div>{l}</div>)}
                </div>
                {(s.table||[]).length>0&&<div className="ds">
                  <div className="dst">分镜脚本</div>
                  <div style={{overflowX:"auto"}}>
                    <table className="stb">
                      <thead><tr><th>镜头</th><th>时长</th><th>画面描述</th><th>口播台词</th><th>设计意图</th></tr></thead>
                      <tbody>{(s.table||[]).map((r,i)=><tr key={i}>
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
                  <button className="abi pr" onClick={()=>{if(avatarOn&&adopted?._avatarData){generateAvatarImages();}else{setCs("shots");}}}>采纳此方案</button>
                </div>
              </div></div>
            </>;})()}

            {cs==="shots"&&<div className="shw">
              <div className="shc">
                <div className="rh"><div className="rht" onClick={()=>setCs("detail")}><I.ArrowL/> 脚本记录</div><div className="tgs">显示分镜头脚本 <button className="trb" onClick={()=>setShowSc(!showSc)}>{showSc?<I.TglOn/>:<I.TglOff/>}</button></div></div>
                <div className="shb">{((adopted?.table||[]).length>0?(adopted.table.map(r=>({text:r.copy,note:r.scene,imgPrompt:r.image_prompt}))):SHOTS).map((s,i)=>(
                  <div key={i} className={`shi fn ${editIdx===i?"ed":""}`} style={{animationDelay:`${i*40}ms`}}>
                    <div className="shl"><span className="shx">{i+1}</span> 分镜头文案</div>
                    {editIdx===i?<textarea className="fin" rows={2} defaultValue={s.text} autoFocus style={{marginTop:3}} onBlur={()=>setEditIdx(null)}/>:<div className="shtx">{s.text}</div>}
                    <div className="sha"><button className="shab" onClick={()=>setEditIdx(i)}><I.Edit/></button><button className="shab"><I.Trash/></button><button className="shab" style={{color:"var(--p)"}}><I.Plus/></button></div>
                    {showSc&&<div className="scn fn"><div className="scn-l">参考画面/备注</div>{s.note}</div>}
                  </div>
                ))}</div>
                <div className="ba"><button className="bab bab-g"><I.Refresh/> 重新生成</button><button className="bab bab-p" onClick={()=>{buildSbShots();setCs("storyboard");}}><I.Eye/> 确认并预览分镜</button></div>
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
          <div style={{display:"flex",gap:16,padding:"0 24px",flex:1,overflow:"hidden"}}>
            {/* Left: frame grid */}
            <div style={{flex:1,overflow:"auto",paddingRight:8}}>
              <div className="sb-hd">
                <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
                  <button style={{padding:"5px 12px",borderRadius:8,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t2)",fontSize:12,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:4,fontFamily:"inherit"}} onClick={()=>setCs("shots")}><I.ArrowL/> 返回</button>
                  <div className="sb-hd-t">分镜预览</div>
                  {sbGenStatus&&<span style={{fontSize:11,color:"var(--p)"}}>{sbGenStatus}</span>}
                </div>
                <div className="sb-hd-acts">
                  <button className="sb-hd-btn green" disabled={sbImgBusy} onClick={generateSbImages}>{sbImgBusy?<><span className="spin-sm"/>生成中...</>:<><I.Sparkle/> 生成分镜图</>}</button>
                  <button className="sb-hd-btn" style={{background:"#059669",color:"#fff"}} onClick={approveAll} disabled={sbShots.every(s=>s.status!=="generated"&&s.status!=="rejected")}><I.Check/> 全部通过</button>
                  <button className="sb-hd-btn ghost" disabled={vidGenBusy||sbShots.some(s=>s.status==="pending")} onClick={generateFullVideo}><I.Camera/> 生成视频</button>
                  <button className="sb-hd-btn" style={{background:"var(--s)",color:"var(--t2)",border:"1px solid var(--bl)",marginLeft:8}} onClick={openModal}><I.Plus/> 新创作</button>
                </div>
              </div>
              <div className="sb-grid">
                {(sbShots.length>0?sbShots:adopted?.table||[]).map((c,i)=>{
                  const st=c.status||"pending";
                  const stColor=st==="approved"?"#059669":st==="rejected"?"#DC2626":st==="generating"||st==="regenerating"?"#7C3AED":st==="generated"?"#2563EB":"#9CA3AF";
                  const stLabel=st==="approved"?"已通过":st==="rejected"?"已驳回":st==="generating"?"生成中":st==="regenerating"?"重新生成中":st==="generated"?"待审核":"未生成";
                  return <div key={i} className="sb-card" style={{borderColor:st==="approved"?"#059669":st==="rejected"?"#DC2626":"var(--bl)"}}>
                    <div className="sb-card-img" onClick={()=>setSbEdit(i)} style={{cursor:"pointer",position:"relative"}}>
                      {c.imageUrl?<img src={c.imageUrl} alt={`shot ${i+1}`} style={{width:"100%",height:"100%",objectFit:"cover",borderRadius:"inherit"}}/>:(st==="generating"||st==="regenerating")?<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6}}><span className="spin-sm" style={{borderTopColor:"var(--p)",borderColor:"var(--bl)",width:24,height:24}}/>生成中...</div>:c.imgPrompt||c.image_prompt?<span style={{fontSize:9,color:"var(--t3)",padding:8,lineHeight:1.4,textAlign:"center"}}>{(c.imgPrompt||c.image_prompt||"").slice(0,80)}...</span>:"点击生成"}
                      <span style={{position:"absolute",top:6,right:6,fontSize:9,padding:"2px 6px",borderRadius:4,background:stColor,color:"#fff",fontWeight:600}}>{stLabel}</span>
                      {c.imageVersions?.length>1&&<div style={{position:"absolute",bottom:4,left:0,right:0,display:"flex",justifyContent:"center",gap:4}}>
                        {c.imageVersions.map((v,vi)=><span key={vi} onClick={e=>{e.stopPropagation();pickVersion(i,vi);}} style={{width:8,height:8,borderRadius:"50%",background:c.imageUrl===v?"var(--p)":"rgba(255,255,255,0.6)",border:"1px solid rgba(0,0,0,0.3)",cursor:"pointer"}}/>)}
                      </div>}
                    </div>
                    <div className="sb-card-body">
                      <div className="sb-card-meta">
                        {c.shotType==="presenter"?<span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"#FDF2F8",color:"#BE185D",fontWeight:600}}>🎙 数字人口播</span>:<span className={`sb-card-tag ${c.tag||(i===0?"hook":"medium")}`}>{SHOT_TAGS[c.tag]||c.tag||"中景"}</span>}
                        <span style={{fontSize:9,padding:"1px 5px",borderRadius:3,background:"#EEF2FF",color:"#4338CA"}}>{c.shotType==="presenter"?"Kling+LipSync":CAMERA_TAGS[c.camera]||"固定"}</span>
                        <span className="sb-card-dur">{c.dur}</span>
                        <span className="sb-card-num">#{i+1}</span>
                      </div>
                      <div className="sb-card-text" style={{fontSize:11}}>{c.text||c.copy}</div>
                      {c.audioUrl&&<div style={{marginTop:4}}><audio src={c.audioUrl} controls style={{width:"100%",height:24}}/></div>}
                      {c.videoUrl&&<div style={{marginTop:4,fontSize:10,color:"var(--p)"}}>✓ 视频片段已生成</div>}
                      {c.feedback&&<div style={{marginTop:4,fontSize:10,color:"#DC2626",fontStyle:"italic"}}>反馈: {c.feedback}</div>}
                      <div className="sb-card-acts">
                        {(st==="generated"||st==="rejected")&&<><span className="sb-card-act" style={{color:"#059669"}} onClick={e=>{e.stopPropagation();approveFrame(i);}}>✓通过</span><span className="sb-card-act" style={{color:"#DC2626"}} onClick={e=>{e.stopPropagation();const fb=window.prompt("驳回反馈（可选）：","");if(fb!==null)rejectFrame(i,fb);}}>✗驳回</span></>}
                        <span className="sb-card-act" onClick={e=>{e.stopPropagation();setSbEdit(i);}}>编辑</span>
                        <span className="sb-card-act" onClick={e=>{e.stopPropagation();const fb=st==="rejected"?c.feedback:"";regenFrame(i,fb);}}>重新生成</span>
                      </div>
                    </div>
                  </div>;})}
              </div>
            </div>
            {/* Right: voice selector + cost panel */}
            <div style={{width:260,flexShrink:0,overflow:"auto",display:"flex",flexDirection:"column",gap:12}}>
              {/* Voice selector */}
              <div className="fn" style={{padding:12}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>配音语音</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {VOICES.map(v=><label key={v.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 8px",borderRadius:8,border:sbVoice===v.id?"2px solid var(--p)":"1px solid var(--bl)",background:sbVoice===v.id?"#F5F3FF":"var(--s)",cursor:"pointer",fontSize:11}} onClick={()=>setSbVoice(v.id)}>
                    <input type="radio" name="sbv" checked={sbVoice===v.id} onChange={()=>setSbVoice(v.id)} style={{accentColor:"var(--p)"}}/>
                    <div><div style={{fontWeight:600}}>{v.name} <span style={{color:"var(--t3)",fontWeight:400}}>{v.gender}</span></div><div style={{fontSize:10,color:"var(--t3)"}}>{v.desc}</div></div>
                  </label>)}
                </div>
              </div>
              {/* Cost panel */}
              <div className="fn" style={{padding:12}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>费用预估</div>
                {(()=>{const c=sbCost();return <div style={{fontSize:11,display:"flex",flexDirection:"column",gap:4}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>分镜图 ×{c.imgCount}×2版</span><span>¥{c.imgCost}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>视频 {c.vidSec}秒</span><span>¥{c.vidCost}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>TTS配音</span><span style={{color:"#059669"}}>免费</span></div>
                  <div style={{borderTop:"1px solid var(--bl)",marginTop:4,paddingTop:4,display:"flex",justifyContent:"space-between",fontWeight:700,color:"var(--p)"}}><span>合计</span><span>¥{c.total}</span></div>
                </div>;})()}
              </div>
              {/* Status summary */}
              <div className="fn" style={{padding:12}}>
                <div style={{fontSize:13,fontWeight:700,marginBottom:8}}>审核进度</div>
                <div style={{fontSize:11,display:"flex",flexDirection:"column",gap:3}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>已通过</span><span style={{color:"#059669",fontWeight:600}}>{sbShots.filter(s=>s.status==="approved").length}/{sbShots.length}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>待审核</span><span style={{color:"#2563EB"}}>{sbShots.filter(s=>s.status==="generated").length}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>已驳回</span><span style={{color:"#DC2626"}}>{sbShots.filter(s=>s.status==="rejected").length}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>未生成</span><span style={{color:"var(--t3)"}}>{sbShots.filter(s=>s.status==="pending").length}</span></div>
                </div>
              </div>
            </div>
          </div>
          {/* Edit modal */}
          {sbEdit!==null&&(()=>{const sr=sbShots[sbEdit]||(adopted?.table?.[sbEdit]);const _ed={copy:sr?.text||sr?.copy||"",scene:sr?.scene||"",prompt:sr?.imgPrompt||sr?.image_prompt||"",feedback:sr?.feedback||""};return <div className="sb-ov" onClick={()=>setSbEdit(null)}><div className="sb-mdl" onClick={e=>e.stopPropagation()} style={{maxWidth:600}}>
            <div className="sb-mdl-t">编辑镜头 #{sbEdit+1} <span style={{fontSize:11,color:"var(--t3)",fontWeight:400,marginLeft:8}}>{SHOT_TAGS[sr?.tag]||sr?.tag} · {CAMERA_TAGS[sr?.camera]||sr?.camera} · {LIGHT_TAGS[sr?.lighting]||sr?.lighting} · {MOOD_TAGS[sr?.mood]||sr?.mood}</span><button className="mdl-x" onClick={()=>setSbEdit(null)}><I.X/></button></div>
            {/* Image versions */}
            {sr?.imageVersions?.length>0&&<div style={{display:"flex",gap:8,marginBottom:12,overflowX:"auto",padding:"4px 0"}}>
              {sr.imageVersions.map((v,vi)=><img key={vi} src={v} onClick={()=>{pickVersion(sbEdit,vi);setSbShots(prev=>{const n=[...prev];return n;});}} style={{width:80,height:120,objectFit:"cover",borderRadius:8,border:sr.imageUrl===v?"3px solid var(--p)":"2px solid var(--bl)",cursor:"pointer",flexShrink:0}} alt={`v${vi+1}`}/>)}
            </div>}
            <div className="sb-mdl-fg"><div className="sb-mdl-l">旁白台词</div><textarea className="sb-mdl-inp" rows={3} defaultValue={_ed.copy} onChange={e=>{_ed.copy=e.target.value;}}/></div>
            <div className="sb-mdl-fg"><div className="sb-mdl-l">画面描述</div><textarea className="sb-mdl-inp" rows={2} defaultValue={_ed.scene} onChange={e=>{_ed.scene=e.target.value;}}/></div>
            <div className="sb-mdl-fg"><div className="sb-mdl-l">AI生图提示词 (English)</div><textarea className="sb-mdl-inp" rows={3} defaultValue={_ed.prompt} onChange={e=>{_ed.prompt=e.target.value;}}/></div>
            <div className="sb-mdl-fg"><div className="sb-mdl-l">修改反馈 (驳回时填写)</div><textarea className="sb-mdl-inp" rows={2} defaultValue={_ed.feedback} placeholder="描述需要改进的方向..." onChange={e=>{_ed.feedback=e.target.value;}}/></div>
            <div className="sb-mdl-foot" style={{flexWrap:"wrap"}}>
              <button className="sb-mdl-btn cancel" onClick={()=>setSbEdit(null)}>取消</button>
              <button className="sb-mdl-btn" style={{background:"#059669",color:"#fff"}} onClick={()=>{approveFrame(sbEdit);setSbEdit(null);}}>✓ 通过</button>
              <button className="sb-mdl-btn" style={{background:"#DC2626",color:"#fff"}} onClick={()=>{const idx=sbEdit;rejectFrame(idx,_ed.feedback);setSbEdit(null);}}>✗ 驳回</button>
              <button className="sb-mdl-btn orange" onClick={async()=>{const idx=sbEdit;setSbShots(prev=>{const n=[...prev];n[idx]={...n[idx],text:_ed.copy,scene:_ed.scene,imgPrompt:_ed.prompt};return n;});setSbEdit(null);regenFrame(idx,_ed.feedback);}}>保存并重新生成</button>
              <button className="sb-mdl-btn blue" onClick={()=>{const idx=sbEdit;setSbShots(prev=>{const n=[...prev];n[idx]={...n[idx],text:_ed.copy,scene:_ed.scene,imgPrompt:_ed.prompt,feedback:_ed.feedback};return n;});setSbEdit(null);}}>仅保存文案</button>
            </div>
          </div></div>})()}
        </div>}

        {/* AVATAR IMAGE PREVIEW — 选择首帧 */}
        {pg==="create"&&cs==="avatar-preview"&&<div className="sb-pg">
          <div className="sb-steps">
            {[{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"图片预览",s:"on"},{l:"视频生成",s:""},{l:"完成",s:""}].map((st,i)=>
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4}}>{i>0&&<span className="sb-sep">›</span>}<span className={`sb-step ${st.s}`}><span className="sb-step-dot">{st.s==="done"?<I.Check/>:""}</span>{st.l}</span></span>
            )}
          </div>
          <div style={{maxWidth:860,margin:"0 auto",padding:"24px 0"}}>
            <div style={{fontSize:18,fontWeight:700,marginBottom:6}}>数字人展示图预览</div>
            <div style={{fontSize:12,color:"var(--t2)",marginBottom:16,lineHeight:1.6}}>
              场景：{adopted?._avatarData?.avatarSel?.nm} 手持 {adopted?._avatarData?.prod} 对镜头口播展示。请选择一张作为视频首帧。
            </div>
            <div style={{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"}}>
              {avatarPreviewImgs.map((url,i)=>(
                <div key={i} onClick={()=>setAvatarSelIdx(i)} style={{
                  width:220,cursor:"pointer",borderRadius:12,overflow:"hidden",
                  border:avatarSelIdx===i?"3px solid var(--p)":"3px solid var(--bl)",
                  boxShadow:avatarSelIdx===i?"0 0 0 2px var(--pbg)":"none",
                  transition:"all .2s",position:"relative",
                }}>
                  <img src={url} alt={`展示图${i+1}`} style={{width:"100%",display:"block"}}/>
                  {avatarSelIdx===i&&<div style={{
                    position:"absolute",top:8,right:8,width:24,height:24,borderRadius:"50%",
                    background:"var(--p)",display:"flex",alignItems:"center",justifyContent:"center",
                  }}><I.Check/></div>}
                </div>
              ))}
            </div>
            {avatarCleanProdImg&&<>
              <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>产品精修图</div>
              <div style={{display:"flex",gap:12,marginBottom:24}}>
                <div style={{width:100,height:100,borderRadius:10,overflow:"hidden",border:"1px solid var(--bl)"}}>
                  <img src={avatarCleanProdImg} alt="产品精修图" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                </div>
              </div>
            </>}
            {adopted?._avatarData?.script&&<>
              <div style={{fontSize:15,fontWeight:700,marginBottom:8}}>口播文案</div>
              <div style={{fontSize:13,color:"var(--t2)",lineHeight:1.8,padding:"14px 18px",background:"var(--s)",borderRadius:"var(--rl)",border:"1px solid var(--bl)",marginBottom:24,whiteSpace:"pre-wrap"}}>{adopted._avatarData.script}</div>
            </>}
            <div style={{display:"flex",gap:10,alignItems:"center"}}>
              <button style={{padding:"8px 18px",borderRadius:10,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t2)",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit"}} onClick={()=>setCs("detail")}><I.ArrowL/> 返回修改脚本</button>
              <button style={{padding:"8px 18px",borderRadius:10,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t2)",fontSize:13,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5,fontFamily:"inherit"}} onClick={()=>generateAvatarImages()}><I.Refresh/> 重新生成图片</button>
              <button style={{padding:"9px 24px",borderRadius:10,border:"none",background:"var(--p)",color:"#fff",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}} onClick={()=>confirmAvatarVideo()}>确认生成视频</button>
            </div>
          </div>
        </div>}

        {/* VIDEO GENERATING */}
        {pg==="create"&&cs==="generating"&&<div className="sb-pg">
          <div className="sb-steps">
            {(adopted?._avatarData
              ? (avatarPreviewImgs.length===0
                ? [{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"图片预览",s:"on"},{l:"视频生成",s:""},{l:"完成",s:""}]
                : [{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"图片预览",s:"done"},{l:"视频生成",s:"on"},{l:"完成",s:""}])
              :[{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"脚本打磨",s:"done"},{l:"分镜预览",s:"done"},{l:"视频生成",s:"on"},{l:"完成",s:""}]
            ).map((st,i)=>
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4}}>{i>0&&<span className="sb-sep">›</span>}<span className={`sb-step ${st.s}`}><span className="sb-step-dot">{st.s==="done"?<I.Check/>:""}</span>{st.l}</span></span>
            )}
          </div>
          <div className="vg-wrap">
            <div className="vg-card">
              {adopted?._avatarData&&avatarPreviewImgs.length===0?<>
                <div className="vg-t">图片生成中...</div>
                <div className="vg-bar-wrap"><div className="vg-bar"><div className="vg-bar-fill" style={{width:vgPct+"%"}}/></div><div className="vg-pct">{vgPct}%</div></div>
                <div className="vg-sub">{sbGenStatus||"正在生成展示图..."}</div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>已用时 {sbElapsed}秒</div>
                <div className="vg-timeline">
                  <div className={`vg-tl-item ${vgPct>=25?"done":"on"}`}>产品精修图</div>
                  <div className={`vg-tl-item ${vgPct>=100?"done":vgPct>=25?"on":""}`}>数字人展示图</div>
                </div>
              </>:<>
                <div className="vg-t">视频生成中...</div>
                <div className="vg-bar-wrap"><div className="vg-bar"><div className="vg-bar-fill" style={{width:vgPct+"%"}}/></div><div className="vg-pct">{vgPct}%</div></div>
                <div className="vg-sub">{sbGenStatus||`视频片段 ${Math.min(Math.round(vgPct/100*sbShots.length),sbShots.length)}/${sbShots.length} 完成`}</div>
                <div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>已用时 {sbElapsed}秒 · 配音: {VOICES.find(v=>v.id===sbVoice)?.name||"晓晓"}</div>
                <div className="vg-timeline">
                  <div className={`vg-tl-item ${vgStep>=1?"done":vgStep===0?"on":""}`}>TTS配音生成</div>
                  <div className={`vg-tl-item ${vgStep>=2?"done":vgStep===1?"on":""}`}>上传素材</div>
                  <div className={`vg-tl-item ${vgStep>=3?"done":vgStep===2?"on":""}`}>生成视频片段</div>
                  <div className={`vg-tl-item ${vgStep>=4?"done":vgStep===3?"on":""}`}>合成&完成</div>
                </div>
              </>}
            </div>
          </div>
        </div>}

        {/* VIDEO PREVIEW */}
        {pg==="create"&&cs==="preview"&&<div className="sb-pg">
          <div className="sb-steps">
            {(adopted?._avatarData
              ?[{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"图片预览",s:"done"},{l:"视频生成",s:"done"},{l:"完成",s:"on"}]
              :[{l:"产品信息",s:"done"},{l:"生成脚本",s:"done"},{l:"选择脚本",s:"done"},{l:"脚本打磨",s:"done"},{l:"分镜预览",s:"done"},{l:"视频生成",s:"done"},{l:"完成",s:"on"}]
            ).map((st,i)=>
              <span key={i} style={{display:"inline-flex",alignItems:"center",gap:4}}>{i>0&&<span className="sb-sep">›</span>}<span className={`sb-step ${st.s}`}><span className="sb-step-dot">{st.s==="done"?<I.Check/>:""}</span>{st.l}</span></span>
            )}
          </div>
          <div className="vp-wrap">
            <div className="vp-card">
              <div className="vp-player">{finalVideoUrl?<video src={finalVideoUrl} controls style={{width:"100%",height:"100%",borderRadius:"inherit",background:"#000"}}/>:<div className="vp-play"><I.Camera/></div>}</div>
              <div className="vp-info">
                <div className="vp-info-t">{prod} · 脚本视频</div>
                <div className="vp-info-meta"><span>⏱ {dur}</span><span>🎬 {sbShots.length}个分镜</span><span>📦 {cat}</span><span>⏳ 用时{sbElapsed}秒</span><span>🎙 {VOICES.find(v=>v.id===sbVoice)?.name||"晓晓"}</span></div>
                <div className="vp-acts">
                  <button className="vp-act pri" onClick={()=>{activeCreatePg.current=null;setPg("dash");}}><I.Check/> 确认完成</button>
                  {finalVideoUrl&&<a href={finalVideoUrl} download={`${prod}_视频.mp4`} style={{textDecoration:"none"}}><button className="vp-act sec"><I.Download/> 导出视频</button></a>}
                  <button className="vp-act sec" onClick={()=>{setPg("schedule");}}><I.Copy/> 发布到排期</button>
                  <button className="vp-act sec" onClick={()=>setCs("storyboard")}><I.Edit/> 编辑分镜</button>
                  <button className="vp-act sec" onClick={()=>generateFullVideo()}><I.Refresh/> 重新生成</button>
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* DEEP CHAT CREATE */}
        {pg==="create-deep"&&<div className="sw">
          <div className="sl">
            <div className="sl-hd"><div className="sl-bk" onClick={()=>{if(!isCreating)activeCreatePg.current=null;setPg("dash");}}><I.ArrowL/> 返回工作台</div><button style={{marginLeft:"auto",padding:"4px 10px",borderRadius:6,border:"1px solid var(--bl)",background:"var(--s)",color:"var(--t2)",fontSize:11,cursor:"pointer",display:"flex",alignItems:"center",gap:3,fontFamily:"inherit"}} onClick={openModal}><I.Plus/> 新创作</button></div>
            <div className="dp-hd">
              <div className="dp-hd-t"><I.Bot/> AI 创作顾问</div>
              <div className="dp-hd-d">对话式深度挖掘你的创作需求</div>
            </div>
            <div className="dp-sec-t">快捷指令</div>
            {[{icon:<I.Bulb/>,t:"帮我找灵感",d:"并行搜索多数据源挖掘角度"},{icon:<I.Search/>,t:"搜索爆款视频",d:"按爆款类型筛选抖音视频"},{icon:<I.Search/>,t:"搜小红书",d:"搜索同类小红书笔记"},{icon:<I.Link/>,t:"分析竞品链接",d:"拆解竞品脚本结构"}].map((c,i)=>
              <div key={i} className="dp-card" onClick={()=>send(c.t)}><div className="dp-ic">{c.icon}</div><div><div className="dp-t">{c.t}</div><div className="dp-d">{c.d}</div></div></div>
            )}
          </div>
          <div className="srt">
            <div className="cc">
              <div className="cmsg" ref={chatRef}>
                {msgs.length<=1&&<div className="chat-welcome"><div className="chat-welcome-ic"><I.Bot/></div><div className="chat-welcome-t">你好，我是你的AI创作顾问</div><div className="chat-welcome-d">告诉我你想创作什么内容，或者选择左侧快捷指令开始</div></div>}
                {msgs.map((m,i)=><div key={i} className={`mg ${m.r==="user"?"u":"bot"} fn`}><div className={`ma ${m.r==="user"?"usr":"bot"}`}>{m.r==="user"?"你":<I.Bot/>}</div><div style={{maxWidth:"85%",minWidth:0}}><div className={"mbu"+(m.typing?" typing-dots":"")}><div style={{whiteSpace:"pre-wrap"}}>{m.c}</div>
                {m.acts&&<div className="qab" style={{marginTop:10}}>{m.acts.map((a,j)=><button key={j} className="qa" onClick={()=>send(a)}>{a}</button>)}</div>}
                {m.viralTypes&&<div style={{marginTop:12}}><div style={{display:"grid",gap:8}}>{m.viralTypes.map((vt,j)=><div key={j} style={{padding:"12px 16px",background:"var(--s2)",borderRadius:10,border:"1.5px solid var(--bl)",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--pl)";e.currentTarget.style.background="var(--pbg)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bl)";e.currentTarget.style.background="var(--s2)";}} onClick={()=>{setCi("搜视频 ");document.querySelector(".cin")?.focus();setMsgs(prev=>[...prev,{r:"bot",c:"好的，选择了「"+vt.name+"」模式！\n\n请在输入框输入你想搜的产品/行业关键词，比如：\n• 搜视频 面膜 "+vt.name.replace(/[^一-鿿]/g,"")+"\n• 搜视频 宠物用品 "+vt.name.replace(/[^一-鿿]/g,"")}]);}}><div style={{fontSize:13,fontWeight:700,color:"var(--t1)",marginBottom:3}}>{vt.name}</div><div style={{fontSize:11,color:"var(--t3)",lineHeight:1.5}}>{vt.desc}</div></div>)}</div></div>}
                {m.videos&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginBottom:8}}>🎬 {m.viralLabel||"抖音视频"} · {m.videos.length}条 <span style={{fontWeight:400,fontSize:10}}>（点击可观看）</span></div>{m.videos.map((v,j)=><div key={j} style={{display:"flex",gap:10,padding:"10px 14px",background:"var(--s2)",borderRadius:10,marginBottom:6,border:"1px solid var(--bl)",cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="var(--pl)";e.currentTarget.style.background="var(--pbg)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--bl)";e.currentTarget.style.background="var(--s2)";}} onClick={()=>{const url=v.video_url||("https://www.douyin.com/video/"+(v.video_id||""));window.open(url,"_blank");}}>{v.cover_url&&<div style={{width:60,height:80,borderRadius:6,overflow:"hidden",flexShrink:0,background:"#000",position:"relative"}}><img src={v.cover_url} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/><div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:20,height:20,borderRadius:10,background:"rgba(255,255,255,.8)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10}}>▶</div></div>}<div style={{flex:1,minWidth:0}}><div style={{fontSize:12,fontWeight:600,color:"var(--t1)",lineHeight:1.5,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{(v.description||"").slice(0,80)}</div><div style={{display:"flex",gap:8,fontSize:10,color:"var(--t3)",flexWrap:"wrap",alignItems:"center"}}>{v.viral_tag&&<span style={{background:"linear-gradient(135deg,#FF6B6B,#EE5A24)",color:"#fff",padding:"2px 8px",borderRadius:10,fontWeight:700,fontSize:9}}>{v.viral_tag}</span>}<span>❤️ {(v.digg_count||0).toLocaleString()}</span><span>💬 {(v.comment_count||0).toLocaleString()}</span><span>▶️ {(v.play_count||0).toLocaleString()}</span>{v.duration?<span>⏱ {Math.round(v.duration/1000)}s</span>:null}</div></div></div>)}</div>}
                {m.notes&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginBottom:8}}>📕 小红书笔记 · {m.notes.length}条</div>{m.notes.map((n,j)=><div key={j} style={{padding:"10px 14px",background:"#FFF5F5",borderRadius:10,marginBottom:6,border:"1px solid #FED7D7"}}><div style={{fontSize:12,fontWeight:600,color:"var(--t1)",lineHeight:1.5,marginBottom:4}}>{n.title||""}</div><div style={{display:"flex",gap:12,fontSize:10,color:"var(--t3)"}}><span>❤️ {n.liked_count||0}</span><span>👤 {n.author||""}</span><span style={{background:"#FED7D7",color:"#E53E3E",padding:"1px 6px",borderRadius:4,fontWeight:600}}>{n.type==="video"?"视频":"图文"}</span></div></div>)}</div>}
                {m.webResults&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginBottom:8}}>🌐 网络搜索</div>{m.webResults.map((w,j)=><div key={j} style={{padding:"10px 14px",background:"#F0FFF4",borderRadius:10,marginBottom:6,border:"1px solid #C6F6D5"}}><div style={{fontSize:12,fontWeight:600,color:"var(--t1)",marginBottom:3}}>{(w.title||"").slice(0,60)}</div><div style={{fontSize:10,color:"var(--t3)",lineHeight:1.5}}>{(w.content||"").slice(0,120)}</div></div>)}</div>}
                {m.hots&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginBottom:8}}>🔥 营销灵感热点</div><div style={{display:"grid",gap:4}}>{m.hots.map((h,j)=><div key={j} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 12px",background:j<3?"linear-gradient(135deg,#FFF5F5,#FED7D7)":"var(--s2)",borderRadius:8,border:"1px solid "+(j<3?"#FEB2B2":"var(--bl)"),cursor:"pointer",transition:"all .15s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateX(3px)"} onMouseLeave={e=>e.currentTarget.style.transform="none"} onClick={()=>send("搜视频 "+h.t)}><span style={{width:20,height:20,borderRadius:6,background:j===0?"#E53E3E":j===1?"#ED8936":j===2?"#ECC94B":"var(--s3)",color:j<3?"#fff":"var(--t3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,flexShrink:0}}>{j+1}</span><div style={{flex:1,minWidth:0}}><span style={{fontSize:12,fontWeight:j<3?700:500,color:j<3?"var(--t1)":"var(--t2)"}}>{h.t}</span>{h.ma&&<div style={{fontSize:10,color:"var(--p)",marginTop:2,fontWeight:500}}>💡 {h.ma}</div>}</div><span style={{fontSize:10,color:"var(--t3)",flexShrink:0}}>{h.ct}</span></div>)}</div></div>}
                {m.angs&&<div style={{marginTop:12}}><div style={{fontSize:11,fontWeight:700,color:"var(--t3)",marginBottom:8}}>💡 推荐灵感角度</div><div style={{display:"grid",gap:8}}>{m.angs.map((a,j)=><div key={j} style={{padding:"14px 16px",background:"linear-gradient(135deg,var(--pbg),#EDE9FE)",borderRadius:12,border:"1.5px solid #DDD6FE",cursor:"pointer",transition:"all .2s"}} onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 4px 12px rgba(124,58,237,.12)";}} onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="none";}} onClick={()=>send(a.t+"方向，帮我深入分析")}><div style={{fontSize:13,fontWeight:700,color:"var(--pd)",marginBottom:4}}>{a.ic} {a.t}</div><div style={{fontSize:10,color:"var(--p)",marginBottom:6,fontWeight:600}}>{a.s}</div><div style={{fontSize:11,color:"var(--t2)",lineHeight:1.6}}>{a.d}</div></div>)}</div>
                  {m.sum&&<div style={{fontSize:10,color:"var(--t3)",lineHeight:1.6,marginTop:8,padding:"8px 12px",background:"var(--s2)",borderRadius:8,borderLeft:"3px solid var(--pl)"}}>{m.sum}</div>}
                </div>}</div></div></div>)}
              </div>
              <div className="cbr"><input className="cin" placeholder="聊聊你的创意想法..." value={ci} onChange={e=>setCi(e.target.value)} onKeyDown={e=>{if(e.key==="Enter")send(ci)}}/><button className="cmb"><I.Mic/></button><button className="csb" onClick={()=>send(ci)}><I.Send/></button></div>
              {msgs.length>2&&<button className="cgb" onClick={async()=>{
                setPg("create");setCs("ai-generating");setAiScripts([]);activeCreatePg.current="create";
                try{
                  setAiGenStep("AI正在从对话中提取需求，生成脚本...");
                  const chatCtx=msgs.filter(m=>m.r==="user"||m.r==="bot").map(m=>`${m.r==="user"?"用户":"顾问"}：${m.c||""}`).join("\n");
                  const ipCtx=getIpContext();
                  const extractData=await generateJSON({model:"gemini-2.5-flash",system:"你是一位短视频策划专家。从对话中提取关键信息，输出JSON。",prompt:`从以下对话中提取脚本创作所需的关键信息：\n\n${chatCtx}\n\n输出JSON：{"product":"产品名","category":"品类","duration":"推荐时长","audience":"目标受众","selling_points":"核心卖点","style_hints":"对话中提到的风格/策略偏好","key_context":"其他有价值的上下文"}`,temperature:0.3,maxTokens:2048});
                  const p=extractData.product||prod||"产品";const c=extractData.category||cat||"通用";const d=extractData.duration||dur||"30秒";
                  setAiGenStep("需求提取完成，正在设计脚本结构...");
                  const outlines=await generateJSON({model:"gemini-2.5-flash",system:`你是一位短视频脚本结构设计师。脚本将通过AI生图+AI生视频制作，不是真人拍摄。${ipCtx}`,prompt:`基于以下深度对话和用户需求，设计4个差异化脚本大纲。\n\n【对话摘要】\n产品：${p}（${c}）| 时长：${d}\n受众：${extractData.audience||"泛人群"}\n卖点：${extractData.selling_points||"未指定"}\n风格偏好：${extractData.style_hints||"未指定"}\n补充：${extractData.key_context||""}\n\n要求：4个方案视觉风格本质不同（产品大片/对比冲击/知识图解/场景沉浸/故事叙事/种草清单/痛点解决等），name要有创意不要用"方案一/二/三"编号。\nJSON：{"outlines":[{"name":"有创意的主题名","type":"视觉风格","emotion":"情绪","shots":6,"strategy":"策略","diff":"区别","structure":["步骤1","步骤2","步骤3","步骤4","步骤5"]}]}`,temperature:0.5,maxTokens:4096});
                  const ol=outlines.outlines||[];if(!ol.length)throw new Error("未生成大纲");
                  setAiGenStep(`正在并行创作${ol.length}个脚本...`);
                  const riskRules="禁止极限词(最好用/第一/唯一) | 禁止医疗词 | 敏感肌→敏敏肌 | 美白→提亮肤色";
                  const sideExpandOne=async(o)=>{for(let att=0;att<2;att++){try{const r=await generateJSON({model:"gemini-2.5-pro",system:`你是一位顶级短视频脚本创作者+AI视觉导演，台词100%口语化。脚本将通过AI生图+AI生视频制作。${ipCtx}`,prompt:`展开脚本大纲：\n产品：${p}（${c}）| 时长：${d}\n${prodDesc?"【⚠️产品真实信息—禁止编造】"+prodDesc+"\n":""}\n方案：${o.name}｜${o.type}｜${o.emotion}\n步骤：${o.structure.join("→")}\n${riskRules}\n台词铁律：①100%口语②每句≤15字③自然衔接④开场有钩子抓人⑤字数匹配时长(4-5字/秒)\n\n【最重要】视觉一致性：你必须先设计一个visual_anchor对象，这是保证整个视频视觉统一的关键：\n- character：固定主角外观（性别年龄发型服装配饰，足够具体让AI每次画出同一个人），不需要人物则写"none"\n- setting：固定主场景（所有镜头共享同一空间）\n- product：固定产品外观（极其具体+必须写no text no label no logo）\n- palette：统一摄影风格（Douyin lifestyle vlog aesthetic）\n所有字段必须英文！product必须含"no text no label no logo"！\n\nAI画面铁律：scene是中文画面描述，image_prompt是英文(40-80词)，每个必须以"no text, no words, no labels in image."结尾。\nbadges：2-3个标签，c用conv/exp/auth\nJSON：{"name":"${o.name}","dur":"${d}","shots":${o.shots},"sell":3,"desc":"30字内","badges":[{"t":"标签","c":"conv"}],"visual_anchor":{"character":"English","setting":"English","product":"English with no text no label no logo","palette":"English"},"logic":${JSON.stringify(o.structure)},"table":[{"shot":1,"dur":"3秒","scene":"中文画面","copy":"台词","image_prompt":"English, no text, no words, no labels in image.","risk":false,"intent":"情绪+目的"}]}`,temperature:0.7,maxTokens:6144});if(r?.table?.length>0)return r;if(att===0)await new Promise(r=>setTimeout(r,2000));}catch(e){console.error(`侧边栏方案「${o.name}」失败:`,e);if(att===0)await new Promise(r=>setTimeout(r,2000));}}return null;};
                  const rawResults=await Promise.all(ol.map(o=>sideExpandOne(o)));
                  const results=rawResults.filter(r=>r?.table?.length>0);
                  if(!results.length)throw new Error("所有方案生成失败");
                  const deepScripts=results.map((s,i)=>({...s,id:i+1,badges:s.badges||[],logic:s.logic||[],table:s.table||[],name:s.name||`方案${i+1}`,dur:s.dur||d,shots:s.shots||0,sell:s.sell||0,desc:s.desc||""}));setAiScripts(deepScripts);saveToHistory(deepScripts,{prod:p,cat:c,dur:d,mode:"deep"});setCs("results");
                }catch(e){console.error("[侧边栏AI生成失败]",e);setAiScripts([]);setCs("results");setTimeout(()=>alert("AI脚本生成失败："+e.message+"\n\n当前显示的是内置示例脚本。"),300);}
              }}><I.Zap/> 根据对话生成脚本</button>}
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
            <div className="fg2"><label className="fg2-l">产品实拍图 <span style={{color:"var(--t3)",fontWeight:400,fontSize:11}}>（强烈推荐，保证画面一致性）</span></label>
              <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>
                {prodImages.map((img,i)=><div key={i} style={{position:"relative",width:72,height:72,borderRadius:8,overflow:"hidden",border:"1.5px solid var(--bl)"}}>
                  <img src={img} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  <button onClick={()=>setProdImages(prev=>prev.filter((_,j)=>j!==i))} style={{position:"absolute",top:2,right:2,width:18,height:18,borderRadius:9,background:"rgba(0,0,0,.6)",color:"#fff",border:"none",cursor:"pointer",fontSize:11,lineHeight:"18px",textAlign:"center"}}>×</button>
                </div>)}
                {prodImages.length<4&&<label style={{width:72,height:72,borderRadius:8,border:"2px dashed var(--bl)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",cursor:"pointer",color:"var(--t3)",fontSize:11,gap:2}}>
                  <span style={{fontSize:20}}>+</span>上传
                  <input type="file" accept="image/*" multiple hidden onChange={e=>{
                    const files=Array.from(e.target.files||[]);
                    files.slice(0,4-prodImages.length).forEach(f=>{
                      const reader=new FileReader();
                      reader.onload=ev=>setProdImages(prev=>[...prev,ev.target.result].slice(0,4));
                      reader.readAsDataURL(f);
                    });
                    e.target.value="";
                  }}/>
                </label>}
              </div>
              <div style={{fontSize:11,color:"var(--t3)",marginTop:4}}>上传1-4张产品实物照片，AI会在所有镜头中使用同一产品形象</div>
            </div>
            <div className="fg2"><div className="tr"><span className="trl">数字人主播</span><button className="trb" onClick={()=>setAvatarOn(!avatarOn)}>{avatarOn?<I.TglOn/>:<I.TglOff/>}</button></div><div className="dh">启用数字人出镜带货，像真人拿着产品展示讲解</div></div>
{avatarOn&&<div className="fg2"><label className="fg2-l">选择主播形象</label>
  <div style={{display:"flex",gap:8,overflowX:"auto",paddingBottom:6}}>
    {AVATAR_PRESETS.map(a=><div key={a.id} onClick={()=>setAvatarSel(a)} style={{cursor:"pointer",minWidth:80,textAlign:"center",padding:6,borderRadius:10,border:avatarSel?.id===a.id?"2px solid var(--p)":"2px solid var(--bl)",background:avatarSel?.id===a.id?"var(--pbg)":"transparent",transition:"all .2s"}}>
      <div style={{width:64,height:64,borderRadius:8,overflow:"hidden",margin:"0 auto 4px",background:"var(--s3)"}}>
        <img src={a.imgUrl} alt={a.nm} style={{width:"100%",height:"100%",objectFit:"cover"}} onError={e=>{e.target.style.display="none"}}/>
      </div>
      <div style={{fontSize:11,fontWeight:600}}>{a.nm}</div>
      <div style={{fontSize:9,color:"var(--t3)"}}>{a.tags}</div>
    </div>)}
  </div>
</div>}
            <div className="fg2"><label className="fg2-l">产品描述/卖点 <span style={{color:"var(--t3)",fontWeight:400,fontSize:11}}>（强烈推荐，避免AI瞎编功能）</span></label>
              <textarea className="fin" value={prodDesc} onChange={e=>setProdDesc(e.target.value)} placeholder={"例如：粉色陶瓷马克杯，350ml容量，简约北欧风设计，适合办公室和家用。\n\n写清楚：产品是什么、材质/外观、核心卖点、使用场景等，AI会严格按你的描述来写脚本。"} rows={3} style={{resize:"vertical",lineHeight:1.6}}/>
            </div>
            <div className="fg2"><label className="fg2-l">品类</label><div className="chs">{["美妆护肤","食品保健","数码3C","服装鞋包","家居生活","教育培训","母婴","其他"].map(c=><button key={c} className={`ch ${cat===c?"on":""}`} onClick={()=>setCat(c)}>{c}</button>)}</div></div>
            <div className="fg2"><label className="fg2-l">视频时长</label><div className="chs">{["30秒","60秒","2分钟","3分钟"].map(d=><button key={d} className={`ch ${dur===d?"on":""}`} onClick={()=>setDur(d)}>{d}</button>)}</div></div>
            <div className="fg2"><div className="tr"><span className="trl">创意增强</span><button className="trb" onClick={()=>setDataOn(!dataOn)}>{dataOn?<I.TglOn/>:<I.TglOff/>}</button></div><div className="dh">分析真实爆款视频+评论，AI创意增强生成脚本(需增加约3-5分钟)</div></div>
          </div>}
        </div>
        <div className="mdl-f"><div className="step-dots">{[0,2].map(i=><div key={i} className={`step-dot ${mStep===i?"on":""}`}/>)}</div><div style={{display:"flex",gap:8}}>
          {mStep===2&&<button className="bt bt-g" onClick={()=>setMStep(0)}>上一步</button>}
          {mStep===0&&<button className="bt bt-p" onClick={()=>{if(mMode==="deep"){setModal(false);setPg("create-deep");setCs("input");activeCreatePg.current="create-deep";}else setMStep(2);}}>下一步 <I.ArrowR/></button>}
          {mStep===2&&<button className="bt bt-p" onClick={startCreate}><I.Zap/> 生成脚本</button>}
        </div></div>
      </div></div>}
    </div></>
  );
}
