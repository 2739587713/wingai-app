# -*- coding: utf-8 -*-
"""
智能脚本创作服务 - 核心编排
研究竞品 → 生成方向 → 选择Hook → 多步生成脚本 → 对话打磨
"""
import json
import uuid
import random
import asyncio
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from loguru import logger

from config import PROJECT_ROOT, OUTPUTS_DIR, BRAND_PROFILES_DIR
from .tikhub_client import TikHubClient
from .tavily_client import TavilyClient
from .gemini_client import GeminiClient
from .metadata_manager import MetadataManager

# 确保 engines 可导入
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))

from engines.director import Director
from .storyboard_director import StoryboardDirector
from .category_knowledge import get_category_knowledge

# 创意手法库
CREATIVE_TECHNIQUES = [
    "反转叙事", "跨界类比", "极端放大", "打破第四面墙",
    "反常识", "悬念故事", "自嘲示弱", "数据震撼"
]

# Hook风格定义
HOOK_STYLES = ["悬念型", "痛点型", "数据型", "反常识型", "场景代入型"]


class ScriptCreator:
    """智能脚本创作服务"""

    def __init__(self):
        self.tikhub = TikHubClient()
        self.tavily = TavilyClient()
        self.gemini = GeminiClient()
        self.sessions: Dict[str, Dict] = {}  # session_id -> session data

    async def save_draft(
        self,
        step: int,
        product_info: Optional[Dict] = None,
        session_id: Optional[str] = None,
        scripts: Optional[List[Dict]] = None,
        mode: str = "quick",
        target_duration: int = 60,
    ) -> Dict:
        """
        保存未完成项目为草稿（步骤0-2），使其出现在项目列表和最近项目中。

        Returns:
            {project_id, title}
        """
        product_name = (product_info or {}).get("product_name", "未命名产品")
        title = f"{product_name} - 草稿"

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_id = f"video_{timestamp}"
        project_dir = Path(OUTPUTS_DIR) / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        metadata = {
            "title": title,
            "topic": product_name,
            "generation_stage": "draft",
            "draft_step": step,
            "product_info": product_info,
            "session_id": session_id,
            "scripts": scripts or [],
            "mode": mode,
            "target_duration": target_duration,
            "shots": [],
            "total_duration": 0.0,
            "shot_count": 0,
            "created_at": datetime.now().isoformat(),
        }

        MetadataManager.save_metadata(project_dir, metadata)
        logger.info(f"草稿已保存: {project_id}, step={step}")

        return {"project_id": project_id, "title": title}

    async def create_session(
        self,
        product_name: str,
        industry: Optional[str] = None,
        target_duration: int = 60,
        reference_text: Optional[str] = None,
        brand_profile: Optional[Dict] = None,
        product_detail: Optional[str] = None,
        mode: str = "quick",
        template_id: Optional[str] = None
    ) -> Dict:
        """
        创建智能创作会话

        mode="quick":    跳过联网调研，单次 Gemini 调用秒出3个方向，自动读取历史缓存
        mode="detailed": 完整流程：TikHub竞品 + Tavily市场调研 + 多次 Gemini，慢工出细活

        Returns:
            {session_id, competitor_summary, market_summary, directions, mode}
        """
        if mode == "quick":
            return await self._create_quick_session(
                product_name=product_name,
                industry=industry,
                target_duration=target_duration,
                reference_text=reference_text,
                brand_profile=brand_profile,
                product_detail=product_detail
            )

        # ===== 详细模式：完整联网调研流程 =====
        session_id = str(uuid.uuid4())[:8]
        logger.info(f"[详细模式] 创建会话 {session_id}: product={product_name}, template={template_id}")

        # 加载用户选择的模板（如有）
        selected_template = None
        if template_id:
            try:
                from data.templates import TEMPLATE_INDEX
                selected_template = TEMPLATE_INDEX.get(template_id)
                if selected_template:
                    logger.info(f"[详细模式] 使用模板: {selected_template['name']}")
            except Exception as e:
                logger.warning(f"加载模板失败: {e}")

        # 1. 并行执行: TikHub竞品搜索 + Tavily市场调研
        search_keyword = f"{industry} {product_name}" if industry else product_name
        tikhub_task = self.tikhub.search_videos(search_keyword, count=20, sort_type=1)
        tavily_task = self.tavily.research_product(product_name, industry)

        tikhub_result, tavily_result = await asyncio.gather(
            tikhub_task, tavily_task, return_exceptions=True
        )

        if isinstance(tikhub_result, Exception):
            logger.warning(f"TikHub搜索失败: {tikhub_result}")
            tikhub_result = []
        if isinstance(tavily_result, Exception):
            logger.warning(f"Tavily调研失败: {tavily_result}")
            tavily_result = {"summary": "", "key_findings": [], "sources": []}

        # 2. 用Gemini分析竞品数据
        competitor_summary = await self._analyze_competitors(tikhub_result, product_name)

        # 3. 用Gemini生成3个创意方向
        directions = await self._generate_directions(
            product_name=product_name,
            industry=industry,
            competitor_summary=competitor_summary,
            market_summary=tavily_result,
            reference_text=reference_text,
            brand_profile=brand_profile,
            target_duration=target_duration,
            product_detail=product_detail,
            selected_template=selected_template
        )

        # 4. 存储会话
        self.sessions[session_id] = {
            "product_name": product_name,
            "industry": industry,
            "target_duration": target_duration,
            "reference_text": reference_text,
            "product_detail": product_detail,
            "brand_profile": brand_profile,
            "competitor_data": tikhub_result,
            "competitor_summary": competitor_summary,
            "market_summary": tavily_result,
            "directions": directions,
            "mode": "detailed",
            "selected_template": selected_template,
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"[详细模式] 会话 {session_id} 创建完成, {len(directions)}个方向")
        return {
            "session_id": session_id,
            "competitor_summary": competitor_summary,
            "market_summary": tavily_result,
            "directions": directions,
            "mode": "detailed"
        }

    async def _create_quick_session(
        self,
        product_name: str,
        industry: Optional[str],
        target_duration: int,
        reference_text: Optional[str],
        brand_profile: Optional[Dict],
        product_detail: Optional[str]
    ) -> Dict:
        """
        快速模式：单次 Gemini 调用直接生成3个完整脚本（含镜头），自动读取历史缓存提升质量
        """
        session_id = str(uuid.uuid4())[:8]
        logger.info(f"[快速模式] 创建会话 {session_id}: product={product_name}")

        # 读取历史缓存（如有，自动补充产品信息）
        cached = self._load_product_cache(product_name)
        if cached:
            logger.info(f"[快速模式] 命中历史缓存: {product_name}")
            if not industry:
                industry = cached.get("industry")
            if not product_detail:
                product_detail = cached.get("product_detail")

        # 一次 Gemini 调用：直接生成3个完整脚本（含镜头）
        quick_result = await self._quick_generate_full_scripts(
            product_name=product_name,
            industry=industry,
            target_duration=target_duration,
            reference_text=reference_text,
            brand_profile=brand_profile,
            product_detail=product_detail,
            cached=cached
        )

        scripts = quick_result.get("scripts", [])
        competitor_summary = quick_result.get("competitor_summary", {
            "winning_patterns": [], "hook_strategies": [],
            "content_structures": [], "emotional_triggers": []
        })
        market_summary = quick_result.get("market_summary", {"summary": "", "key_findings": []})

        # 为兼容现有流程，从scripts中提取directions
        directions = []
        for s in scripts:
            directions.append({
                "direction_id": s.get("script_id", 0),
                "name": s.get("name", ""),
                "risk_level": s.get("risk_level", "moderate"),
                "description": s.get("description", ""),
                "hook": s.get("hook", ""),
                "structure_preview": s.get("structure_preview", []),
                "creative_techniques": s.get("creative_techniques", []),
            })

        self.sessions[session_id] = {
            "product_name": product_name,
            "industry": industry,
            "target_duration": target_duration,
            "reference_text": reference_text,
            "product_detail": product_detail,
            "brand_profile": brand_profile,
            "competitor_data": [],
            "competitor_summary": competitor_summary,
            "market_summary": market_summary,
            "directions": directions,
            "quick_scripts": scripts,  # 存储完整脚本（含shots）
            "mode": "quick",
            "created_at": datetime.now().isoformat()
        }

        logger.info(f"[快速模式] 会话 {session_id} 创建完成, {len(scripts)}个完整脚本")
        return {
            "session_id": session_id,
            "competitor_summary": competitor_summary,
            "market_summary": market_summary,
            "directions": directions,
            "scripts": scripts,
            "mode": "quick"
        }

    async def _quick_generate_full_scripts(
        self,
        product_name: str,
        industry: Optional[str],
        target_duration: int,
        reference_text: Optional[str],
        brand_profile: Optional[Dict],
        product_detail: Optional[str],
        cached: Optional[Dict]
    ) -> Dict:
        """快速模式：单次 Gemini 调用直接生成3个完整脚本（含镜头）"""
        brand_section = ""
        if brand_profile:
            brand_section = f"品牌调性: {brand_profile.get('brand_tone', '')}\n目标受众: {brand_profile.get('target_audience', '')}\n"

        reference_section = f"参考文案: {reference_text}\n" if reference_text else ""
        product_detail_section = f"产品详细信息: {product_detail}\n" if product_detail else ""

        cache_section = ""
        if cached and cached.get("selling_points"):
            cache_section = f"上次为该产品生成的卖点（可参考）: {json.dumps(cached['selling_points'], ensure_ascii=False)}\n"

        # 注入品类知识
        category = get_category_knowledge(industry)
        category_section = f"""品类知识库（{industry or '通用'}）:
- 常用Hook模式: {json.dumps(category['hooks'][:3], ensure_ascii=False)}
- 推荐结构: {json.dumps(category['structures'][:2], ensure_ascii=False)}
- 情绪触发点: {json.dumps(category['emotional_triggers'], ensure_ascii=False)}
- 创意手法: {json.dumps(category['creative_approaches'], ensure_ascii=False)}
"""
        shot_guides = category.get("shot_guides", {})
        shot_guide_section = "\n".join([f"  - {k}: {v}" for k, v in shot_guides.items()])

        creative_approaches = category.get("creative_approaches", ["实验对比", "痛点故事", "反常识"])
        # 确保至少3种手法
        if len(creative_approaches) < 3:
            creative_approaches = creative_approaches + ["反常识", "悬念叙事", "数据震撼"]

        num_shots = max(6, min(8, target_duration // 8))

        prompt = f"""你是短视频创意总监+分镜编剧。请根据以下信息，一次性生成3个完整的短视频脚本，每个脚本包含{num_shots}个镜头。

产品: {product_name}
行业: {industry or '请根据产品名自行判断'}
目标时长: {target_duration}秒
{product_detail_section}{reference_section}{brand_section}{cache_section}
{category_section}
镜头视觉参考:
{shot_guide_section}

请输出完整JSON（不要其他文字）：
{{
  "competitor_summary": {{
    "winning_patterns": ["该品类短视频最常用的成功内容模式1", "模式2", "模式3"],
    "hook_strategies": ["高转化开场策略1", "策略2", "策略3"],
    "content_structures": ["内容结构1", "内容结构2"],
    "emotional_triggers": ["情绪触发点1", "情绪触发点2"]
  }},
  "market_summary": {{
    "summary": "该产品/品类的市场现状和用户痛点概述（100字以内）",
    "key_findings": ["洞察1", "洞察2", "洞察3"]
  }},
  "scripts": [
    {{
      "script_id": 0,
      "name": "稳妥款 · {creative_approaches[0]}",
      "risk_level": "safe",
      "description": "基于该品类验证过的{creative_approaches[0]}打法",
      "hook": "具体的开场钩子（15-25字）",
      "structure_preview": ["开场: 具体内容", "主体: 具体内容", "结尾: 具体内容"],
      "creative_techniques": ["{creative_approaches[0]}"],
      "shots": [
        {{
          "shot_id": 1,
          "shot_type": "hook",
          "act_type": "hook",
          "visual_description": "English visual description for video generation, specific camera angle and lighting",
          "narration": "中文口播文案，15-25字，具体针对产品",
          "duration": 3.0,
          "camera_movement": "push_in",
          "text_overlay": "字幕贴片（如有）"
        }}
      ],
      "total_duration": {target_duration},
      "selling_points": ["卖点1", "卖点2", "卖点3"]
    }},
    {{
      "script_id": 1,
      "name": "优化款 · {creative_approaches[1]}",
      "risk_level": "moderate",
      "description": "...",
      "hook": "...",
      "structure_preview": [...],
      "creative_techniques": ["{creative_approaches[1]}"],
      "shots": [...],
      "total_duration": {target_duration},
      "selling_points": [...]
    }},
    {{
      "script_id": 2,
      "name": "创意款 · {creative_approaches[2]}",
      "risk_level": "creative",
      "description": "...",
      "hook": "...",
      "structure_preview": [...],
      "creative_techniques": ["{creative_approaches[2]}"],
      "shots": [...],
      "total_duration": {target_duration},
      "selling_points": [...]
    }}
  ]
}}

要求：
1. 每个脚本必须包含{num_shots}个完整镜头，所有字段都要填写
2. 所有内容必须具体针对"{product_name}"，不要模板化或占位符
3. narration是中文口播文案（15-25字/镜头），要有节奏感和感染力
4. visual_description是英文，描述具体画面、机位、灯光，可直接用于AI视频生成
5. 3个脚本用不同的创意手法，覆盖不同风格偏好
6. 每个镜头duration之和应接近{target_duration}秒
7. shot_type可选: hook/close_up/medium/wide/product/hands_on/transition/cta
8. act_type可选: hook/main/cta"""

        try:
            result = await self.gemini.generate(prompt)
            logger.info(f"[快速模式] Gemini原始响应长度: {len(result) if result else 0}")
            parsed = self._parse_json_response(result)

            if isinstance(parsed, dict) and "scripts" in parsed:
                # 验证并修复scripts
                scripts = parsed["scripts"]
                for script in scripts:
                    shots = script.get("shots", [])
                    if not shots:
                        continue
                    # 确保shot_id连续
                    for i, shot in enumerate(shots):
                        shot["shot_id"] = i + 1
                        # 确保必要字段
                        shot.setdefault("shot_type", "medium")
                        shot.setdefault("act_type", "main")
                        shot.setdefault("visual_description", "")
                        shot.setdefault("narration", "")
                        shot.setdefault("duration", 5.0)
                        shot.setdefault("camera_movement", "static")
                        shot.setdefault("lighting", "natural")
                        shot.setdefault("mood", "neutral")
                        shot.setdefault("text_overlay", "")
                        shot.setdefault("use_product_image", shot["shot_type"] in ("product", "hands_on"))
                    # 重新计算total_duration
                    script["total_duration"] = sum(s.get("duration", 5) for s in shots)
                logger.info(f"[快速模式] Gemini一次生成{len(scripts)}个完整脚本成功")
                return parsed
            elif isinstance(parsed, list) and len(parsed) > 0:
                # Gemini有时直接返回scripts数组而不是外层对象
                logger.info(f"[快速模式] Gemini返回了数组格式，自动包装为标准结构")
                wrapped = {
                    "competitor_summary": {"winning_patterns": [], "hook_strategies": [], "content_structures": [], "emotional_triggers": []},
                    "market_summary": {"summary": "", "key_findings": []},
                    "scripts": parsed
                }
                for script in wrapped["scripts"]:
                    shots = script.get("shots", [])
                    for i, shot in enumerate(shots):
                        shot["shot_id"] = i + 1
                        shot.setdefault("shot_type", "medium")
                        shot.setdefault("act_type", "main")
                        shot.setdefault("visual_description", "")
                        shot.setdefault("narration", "")
                        shot.setdefault("duration", 5.0)
                        shot.setdefault("camera_movement", "static")
                        shot.setdefault("lighting", "natural")
                        shot.setdefault("mood", "neutral")
                        shot.setdefault("text_overlay", "")
                        shot.setdefault("use_product_image", shot["shot_type"] in ("product", "hands_on"))
                    script["total_duration"] = sum(s.get("duration", 5) for s in shots)
                return wrapped
            else:
                logger.warning(f"[快速模式] Gemini返回了非预期格式: type={type(parsed).__name__}, keys={list(parsed.keys()) if isinstance(parsed, dict) else 'N/A'}")
                logger.warning(f"[快速模式] 原始响应前500字: {result[:500] if result else 'empty'}")
        except Exception as e:
            logger.warning(f"[快速模式] Gemini生成完整脚本失败，使用fallback: {e}")
            logger.warning(f"[快速模式] 错误详情: {type(e).__name__}: {e}")

        # 回退：生成基础完整脚本
        return self._quick_fallback_scripts(product_name, industry, target_duration, creative_approaches, shot_guides)

    def _quick_fallback_scripts(
        self, product_name: str, industry: Optional[str],
        target_duration: int, creative_approaches: List[str],
        shot_guides: Dict
    ) -> Dict:
        """快速模式fallback：返回基础完整脚本结构"""
        def make_shots(hook_text: str) -> List[Dict]:
            dur_per_shot = target_duration / 7
            return [
                {"shot_id": 1, "shot_type": "hook", "act_type": "hook",
                 "visual_description": shot_guides.get("hook", f"Eye-catching opening of {product_name}"),
                 "narration": hook_text, "duration": round(dur_per_shot * 0.8, 1),
                 "camera_movement": "push_in", "lighting": "dramatic", "mood": "intriguing",
                 "text_overlay": "", "use_product_image": False},
                {"shot_id": 2, "shot_type": "medium", "act_type": "main",
                 "visual_description": shot_guides.get("product", f"Product showcase of {product_name}"),
                 "narration": f"这款{product_name}真的让我眼前一亮", "duration": round(dur_per_shot, 1),
                 "camera_movement": "static", "lighting": "natural", "mood": "positive",
                 "text_overlay": "", "use_product_image": True},
                {"shot_id": 3, "shot_type": "close_up", "act_type": "main",
                 "visual_description": shot_guides.get("demo", f"Close-up detail of {product_name} features"),
                 "narration": f"最让我惊喜的是它的核心功能", "duration": round(dur_per_shot, 1),
                 "camera_movement": "slow_pan", "lighting": "natural", "mood": "curious",
                 "text_overlay": "", "use_product_image": False},
                {"shot_id": 4, "shot_type": "medium", "act_type": "main",
                 "visual_description": f"Person using {product_name} in daily life, natural setting",
                 "narration": f"日常使用起来真的很方便", "duration": round(dur_per_shot, 1),
                 "camera_movement": "follow", "lighting": "natural", "mood": "satisfied",
                 "text_overlay": "", "use_product_image": False},
                {"shot_id": 5, "shot_type": "wide", "act_type": "main",
                 "visual_description": f"Lifestyle shot showing {product_name} in context",
                 "narration": f"用了一段时间，效果真的很明显", "duration": round(dur_per_shot, 1),
                 "camera_movement": "static", "lighting": "warm", "mood": "confident",
                 "text_overlay": "", "use_product_image": False},
                {"shot_id": 6, "shot_type": "close_up", "act_type": "main",
                 "visual_description": shot_guides.get("result", f"Result showcase, {product_name} benefit visible"),
                 "narration": f"对比一下使用前后的差别", "duration": round(dur_per_shot, 1),
                 "camera_movement": "static", "lighting": "bright", "mood": "amazed",
                 "text_overlay": "", "use_product_image": False},
                {"shot_id": 7, "shot_type": "medium", "act_type": "cta",
                 "visual_description": shot_guides.get("cta", f"Product with price, {product_name} call to action"),
                 "narration": f"感兴趣的朋友赶紧去试试吧", "duration": round(dur_per_shot * 0.8, 1),
                 "camera_movement": "zoom_out", "lighting": "warm", "mood": "encouraging",
                 "text_overlay": "点击链接", "use_product_image": True},
            ]

        scripts = [
            {
                "script_id": 0, "name": f"稳妥款 · {creative_approaches[0]}", "risk_level": "safe",
                "description": "场景化展示产品核心价值",
                "hook": f"用了{product_name}之后，我再也不想换回去了",
                "structure_preview": ["开场: 痛点场景", "主体: 产品展示+使用效果", "结尾: 行动号召"],
                "creative_techniques": [creative_approaches[0]],
                "shots": make_shots(f"用了{product_name}之后，我再也不想换回去了"),
                "total_duration": target_duration,
                "selling_points": ["核心功能", "使用便捷", "效果显著"],
            },
            {
                "script_id": 1, "name": f"优化款 · {creative_approaches[1]}", "risk_level": "moderate",
                "description": "对比竞品，突出差异化优势",
                "hook": f"同样是{product_name}，差距怎么这么大？",
                "structure_preview": ["开场: 对比引入", "主体: 差异化展示", "结尾: 号召"],
                "creative_techniques": [creative_approaches[1]],
                "shots": make_shots(f"同样是{product_name}，差距怎么这么大？"),
                "total_duration": target_duration,
                "selling_points": ["差异化优势", "性价比", "用户口碑"],
            },
            {
                "script_id": 2, "name": f"创意款 · {creative_approaches[2]}", "risk_level": "creative",
                "description": "用反转叙事引发强烈好奇",
                "hook": f"千万别买{product_name}，除非你能接受……",
                "structure_preview": ["开场: 反转钩子", "主体: 揭秘过程", "结尾: 惊喜收尾"],
                "creative_techniques": [creative_approaches[2]],
                "shots": make_shots(f"千万别买{product_name}，除非你能接受……"),
                "total_duration": target_duration,
                "selling_points": ["独特卖点", "意想不到", "高记忆点"],
            },
        ]
        return {
            "competitor_summary": {
                "winning_patterns": ["产品场景化展示", "用户痛点引入", "效果对比"],
                "hook_strategies": ["直击痛点提问", "反常识开场"],
                "content_structures": ["痛点-解决方案-效果"],
                "emotional_triggers": ["好奇心", "共鸣感"]
            },
            "market_summary": {"summary": f"{product_name}市场竞争激烈，差异化是关键", "key_findings": []},
            "scripts": scripts,
        }

    async def select_direction(self, session_id: str, direction_id: int) -> Dict:
        """
        选择方向 → 提取卖点 + 生成5个Hook候选

        Returns:
            {session_id, direction, selling_points, hooks}
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话不存在: {session_id}")

        # 找到选中的方向
        selected = None
        for d in session["directions"]:
            if d["direction_id"] == direction_id:
                selected = d
                break
        if not selected:
            raise ValueError(f"方向不存在: {direction_id}")

        logger.info(f"会话 {session_id} 选择方向: {selected['name']}")

        # 1. 提取核心卖点
        selling_points = await self._extract_selling_points(
            product_name=session["product_name"],
            reference_text=session.get("reference_text"),
            market_summary=session["market_summary"],
            competitor_summary=session["competitor_summary"],
            product_detail=session.get("product_detail")
        )

        # 2. 生成5个Hook候选
        hooks = await self._generate_hook_candidates(
            product_name=session["product_name"],
            direction=selected,
            selling_points=selling_points,
            competitor_summary=session["competitor_summary"]
        )

        # 3. 存入session
        session["selected_direction"] = selected
        session["selling_points"] = selling_points
        session["hooks"] = hooks

        return {
            "session_id": session_id,
            "direction": selected,
            "selling_points": selling_points,
            "hooks": hooks
        }

    async def select_hook(self, session_id: str, hook_id: int) -> Dict:
        """
        选择Hook后多步生成完整脚本

        Returns:
            {project_id, title, shots, shot_count, total_duration, quality_check}
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话不存在: {session_id}")

        selected_direction = session.get("selected_direction")
        if not selected_direction:
            raise ValueError("请先选择创意方向")

        hooks = session.get("hooks", [])
        selected_hook = None
        for h in hooks:
            if h["hook_id"] == hook_id:
                selected_hook = h
                break
        if not selected_hook:
            raise ValueError(f"Hook不存在: {hook_id}")

        selling_points = session.get("selling_points", [])
        logger.info(f"会话 {session_id} 选择Hook: {selected_hook['style']} - {selected_hook['hook_text'][:20]}...")

        # 1. Director创建镜头结构骨架
        director = Director()
        video_plan = director.create_video_plan(
            topic=session["product_name"],
            target_duration=session["target_duration"],
            style="marketing"
        )
        script = director.generate_script_structure(video_plan)

        # 2. 准备镜头结构
        shots_structure = []
        for shot in script.get_all_shots():
            shots_structure.append({
                "id": shot.id,
                "shot_type": shot.shot_type.value,
                "act_type": shot.act_type.value,
                "duration": shot.duration,
                "emotion_score": shot.emotion_score
            })

        # 3. 用选中Hook填充act1第一个镜头
        hook_shot = self._build_hook_shots(selected_hook, shots_structure)

        # 4. Gemini生成act1剩余 + act2主体内容
        body_shots = await self._generate_body_content(
            product_name=session["product_name"],
            direction=selected_direction,
            selling_points=selling_points,
            hook_shot=hook_shot,
            shots_structure=shots_structure,
            competitor_summary=session["competitor_summary"],
            market_summary=session["market_summary"],
            brand_profile=session.get("brand_profile"),
            product_detail=session.get("product_detail")
        )

        # 5. Gemini生成act3结尾（传完整正文narrations，保证首尾呼应）
        body_narrations = [s.get("narration", "") for s in body_shots if s.get("narration")]
        cta_shots = await self._generate_cta_ending(
            product_name=session["product_name"],
            hook=selected_hook,
            selling_points=selling_points,
            shots_structure=shots_structure,
            body_narrations=body_narrations,
            brand_profile=session.get("brand_profile")
        )

        # 6. 合并所有镜头（归一化shot_id为整数）
        all_content = [hook_shot] + body_shots + cta_shots
        self._normalize_shot_ids_in_list(all_content)
        content_map = {item["shot_id"]: item for item in all_content}

        shots_data = []
        for shot_s in shots_structure:
            content = content_map.get(shot_s["id"], {})
            shots_data.append({
                "id": shot_s["id"],
                "shot_type": shot_s["shot_type"],
                "act_type": shot_s["act_type"],
                "visual_description": content.get("visual_description", f"[待生成] {shot_s['shot_type']} scene"),
                "narration": content.get("narration", f"[待生成] 第{shot_s['id']}镜文案"),
                "rationale": content.get("rationale", ""),
                "duration": shot_s["duration"],
                "emotion_score": shot_s.get("emotion_score", 5),
                "use_product_image": shot_s["shot_type"] in ("product", "hands_on")
            })

        # 7. 质量自检
        quality_check = self._quality_check(shots_data, selling_points)

        # 8. 如有缺失卖点，自动补充
        if quality_check["missing_selling_points"]:
            shots_data, auto_fixes = await self._apply_auto_fixes(
                shots_data, selling_points, quality_check["missing_selling_points"],
                session["product_name"]
            )
            quality_check["auto_fixes"] = auto_fixes
            # 重新检查
            quality_check = self._quality_check(shots_data, selling_points)
            quality_check["auto_fixes"] = auto_fixes

        # 8.5 品牌禁用词合规检查
        brand_profile = session.get("brand_profile")
        if brand_profile and brand_profile.get("forbidden_words"):
            forbidden = brand_profile["forbidden_words"]
            violations = []
            for shot in shots_data:
                narration = shot.get("narration", "")
                for word in forbidden:
                    if word in narration:
                        violations.append({"shot_id": shot["id"], "word": word})
                        shot["narration"] = narration.replace(word, "")
            if violations:
                quality_check["brand_violations"] = violations
                logger.info(f"品牌合规检查: 替换了{len(violations)}处禁用词")

        # 9. 创建项目目录 + metadata.json
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_id = f"video_{timestamp}"
        project_dir = Path(OUTPUTS_DIR) / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        title = f"{session['product_name']} - {selected_direction['name']}"
        metadata = {
            "title": title,
            "topic": session["product_name"],
            "target_duration": session["target_duration"],
            "total_duration": script.total_duration,
            "shot_count": script.shot_count,
            "viral_score": script.viral_score,
            "generation_stage": "script",
            "style": "marketing",
            "selling_points": selling_points,
            "shots": shots_data,
            "product_images": [],
            "keyframes": [],
            "quality_check": quality_check,
            "smart_create": {
                "session_id": session_id,
                "direction": selected_direction,
                "selected_hook": selected_hook,
                "competitor_summary": session["competitor_summary"],
                "market_summary": session["market_summary"]
            },
            "created_at": datetime.now().isoformat()
        }

        metadata_path = project_dir / "metadata.json"
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        # 详细模式生成成功后保存产品缓存，下次快速模式可复用
        if session.get("mode") == "detailed":
            self._save_product_cache(
                product_name=session["product_name"],
                industry=session.get("industry"),
                selling_points=selling_points,
                product_detail=session.get("product_detail"),
                competitor_summary=session.get("competitor_summary", {})
            )

        logger.info(f"脚本生成完成: {project_id}, {len(shots_data)}个镜头")
        return {
            "project_id": project_id,
            "title": title,
            "shots": shots_data,
            "shot_count": len(shots_data),
            "total_duration": script.total_duration,
            "quality_check": quality_check,
            "selling_points": selling_points
        }

    async def chat_refine(
        self, project_id: str, message: str, chat_history: List[Dict],
        all_scripts_context: Optional[List[Dict]] = None
    ) -> Dict:
        """
        对话式脚本修改（支持多脚本混搭上下文）

        Returns:
            {ai_response, changes_made, updated_shots}
        """
        # 1. 读取当前 metadata.json
        project_dir = Path(OUTPUTS_DIR) / project_id
        metadata = MetadataManager.load_metadata(project_dir)
        if not metadata:
            raise ValueError(f"项目不存在: {project_id}")

        current_shots = metadata.get("shots", [])

        # 2. Gemini对话式修改
        result = await self._chat_refine_script(
            product_name=metadata.get("topic", ""),
            current_shots=current_shots,
            message=message,
            chat_history=chat_history,
            all_scripts_context=all_scripts_context,
        )

        # 3. 更新metadata.json
        if result.get("updated_shots"):
            metadata["shots"] = result["updated_shots"]
            # 重新质量自检
            selling_points = metadata.get("selling_points", [])
            if isinstance(selling_points, list) and selling_points:
                metadata["quality_check"] = self._quality_check(result["updated_shots"], selling_points)
            MetadataManager.save_metadata(project_dir, metadata)
            logger.info(f"脚本已通过对话修改: {project_id}, 改动: {result['changes_made']}")

        return result

    async def lock_script(self, project_id: str) -> Dict:
        """锁定脚本，标记为可以进入关键帧阶段"""
        project_dir = Path(OUTPUTS_DIR) / project_id
        metadata = MetadataManager.load_metadata(project_dir)
        if not metadata:
            raise ValueError(f"项目不存在: {project_id}")

        metadata["script_locked"] = True
        MetadataManager.save_metadata(project_dir, metadata)
        logger.info(f"脚本已锁定: {project_id}")
        return {"project_id": project_id, "locked": True}

    # ==================== V2: 多Agent一体化流水线 ====================

    async def generate_full_scripts(self, session_id: str) -> Dict:
        """
        核心V2方法：并行运行3次StoryboardDirector多Agent管道，
        每次传不同策略参数(稳妥/优化/创意)，返回3个完整脚本。

        Returns:
            {session_id, competitor_summary, market_summary, scripts: List[FullScriptOption]}
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话不存在: {session_id}")

        product_name = session.get("product_name", "")
        product_detail = session.get("product_detail", "")
        industry = session.get("industry", "")
        target_duration = session.get("target_duration", 60)
        selling_points = session.get("selling_points", [])
        reference_text = session.get("reference_text", "")

        # 如果还没提取卖点，先提取
        if not selling_points:
            selling_points = await self._extract_selling_points(
                product_name,
                product_detail or reference_text or "",
                session.get("market_summary", {}),
                session.get("competitor_summary", {}),
            )
            session["selling_points"] = selling_points

        director = StoryboardDirector()
        strategies = [
            {"name": "稳妥款", "risk_level": "safe", "style": "product_hero"},
            {"name": "优化款", "risk_level": "moderate", "style": "lifestyle"},
            {"name": "创意款", "risk_level": "creative", "style": "before_after"},
        ]

        async def run_one(idx: int, strategy: dict) -> dict:
            try:
                storyboard = await director.generate_storyboard(
                    product_name=product_name,
                    product_detail=product_detail,
                    industry=industry,
                    selling_points=selling_points,
                    target_duration=target_duration,
                    style=strategy["style"],
                    reference_text=reference_text,
                )
                frames = storyboard.get("frames", [])
                shots = []
                for i, frame in enumerate(frames):
                    shots.append({
                        "shot_id": i + 1,
                        "shot_type": frame.get("shot_type", "medium"),
                        "act_type": frame.get("act", "main"),
                        "visual_description": frame.get("visual_prompt", ""),
                        "narration": frame.get("narration", ""),
                        "duration": frame.get("duration", 5.0),
                        "camera_movement": frame.get("camera_movement", "static"),
                        "lighting": frame.get("lighting", "natural"),
                        "mood": frame.get("mood", "neutral"),
                        "text_overlay": frame.get("text_overlay", ""),
                        "use_product_image": frame.get("product_in_frame", False),
                    })
                total_dur = sum(s["duration"] for s in shots)
                quality = storyboard.get("quality_report", {})
                covered_sp = quality.get("selling_point_coverage", selling_points[:3])

                return {
                    "script_id": idx,
                    "name": strategy["name"],
                    "risk_level": strategy["risk_level"],
                    "description": storyboard.get("title", strategy["name"]),
                    "shots": shots,
                    "total_duration": total_dur,
                    "selling_points": covered_sp if isinstance(covered_sp, list) else selling_points,
                    "quality_report": quality,
                }
            except Exception as e:
                logger.error(f"脚本{idx}生成失败: {e}")
                return {
                    "script_id": idx,
                    "name": strategy["name"],
                    "risk_level": strategy["risk_level"],
                    "description": f"{strategy['name']}（生成失败，使用默认模板）",
                    "shots": self._fallback_shots(product_name, target_duration),
                    "total_duration": float(target_duration),
                    "selling_points": selling_points[:3],
                    "quality_report": {},
                }

        # 并行生成3个脚本
        tasks = [run_one(i, s) for i, s in enumerate(strategies)]
        scripts = await asyncio.gather(*tasks)

        # 存储到session中
        session["scripts"] = list(scripts)

        return {
            "session_id": session_id,
            "competitor_summary": session.get("competitor_summary", {}),
            "market_summary": session.get("market_summary", {}),
            "scripts": list(scripts),
        }

    async def generate_single_script_and_create_project(self, session_id: str, script_id: int) -> Dict:
        """
        选中方向后生成完整脚本 + 创建项目
        快速模式: 直接使用预生成的shots，跳过StoryboardDirector
        详细模式: 调1次StoryboardDirector生成
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话不存在: {session_id}")

        # 快速模式：如果有预生成的完整脚本，直接使用
        quick_scripts = session.get("quick_scripts", [])
        if quick_scripts:
            selected_script = None
            for s in quick_scripts:
                if s.get("script_id") == script_id:
                    selected_script = s
                    break
            if not selected_script and 0 <= script_id < len(quick_scripts):
                selected_script = quick_scripts[script_id]
            if selected_script and selected_script.get("shots"):
                return await self._create_project_from_quick_script(session, session_id, script_id, selected_script)

        directions = session.get("directions", [])
        selected_dir = None
        for d in directions:
            if d.get("direction_id") == script_id:
                selected_dir = d
                break
        if not selected_dir:
            # fallback: 使用script_id作为index
            if 0 <= script_id < len(directions):
                selected_dir = directions[script_id]
            else:
                selected_dir = {"name": f"方案{script_id}", "risk_level": "moderate"}

        product_name = session.get("product_name", "")
        product_detail = session.get("product_detail", "")
        industry = session.get("industry", "")
        target_duration = session.get("target_duration", 60)
        reference_text = session.get("reference_text", "")
        selling_points = session.get("selling_points", [])

        if not selling_points:
            # 把方向的description和hook也作为参考，帮助提取更好的卖点
            dir_context = f"创意方向: {selected_dir.get('description', '')}; 开场Hook: {selected_dir.get('hook', '')}"
            selling_points = await self._extract_selling_points(
                product_name,
                product_detail or dir_context or "",
                session.get("market_summary", {}),
                session.get("competitor_summary", {}),
                product_detail=product_detail,
            )
            session["selling_points"] = selling_points

        styles = {"safe": "product_hero", "moderate": "lifestyle", "creative": "before_after"}
        style = styles.get(selected_dir.get("risk_level", "moderate"), "lifestyle")

        # 把方向描述、hook、结构预览、竞品分析都作为参考文本传给Director
        enriched_reference = reference_text or ""
        dir_desc = selected_dir.get("description", "")
        dir_hook = selected_dir.get("hook", "")
        dir_structure = selected_dir.get("structure_preview", [])
        dir_techniques = selected_dir.get("creative_techniques", [])
        competitor_summary = session.get("competitor_summary", {})

        context_parts = []
        if dir_desc:
            context_parts.append(f"创意策略: {dir_desc}")
        if dir_hook:
            context_parts.append(f"开场钩子: {dir_hook}")
        if dir_structure:
            context_parts.append(f"内容结构: {'→'.join(dir_structure)}")
        if dir_techniques:
            context_parts.append(f"创意手法: {'、'.join(dir_techniques)}")
        if competitor_summary:
            comp_text = competitor_summary.get("summary", "") or str(competitor_summary)[:500]
            if comp_text:
                context_parts.append(f"竞品分析参考: {comp_text}")

        if context_parts:
            enriched_reference = enriched_reference + "\n\n" + "\n".join(context_parts)

        # 如果product_detail为空，用卖点组合补充
        enriched_detail = product_detail
        if not enriched_detail and selling_points:
            enriched_detail = f"核心卖点: {'; '.join(selling_points)}"

        director = StoryboardDirector()
        try:
            storyboard = await director.generate_storyboard(
                product_name=product_name,
                product_detail=enriched_detail,
                industry=industry,
                selling_points=selling_points,
                target_duration=target_duration,
                style=style,
                reference_text=enriched_reference,
            )
            frames = storyboard.get("frames", [])
            shots = []
            for i, frame in enumerate(frames):
                shots.append({
                    "shot_id": i + 1,
                    "shot_type": frame.get("shot_type", "medium"),
                    "act_type": frame.get("act", "main"),
                    "visual_description": frame.get("visual_prompt", ""),
                    "narration": frame.get("narration", ""),
                    "duration": frame.get("duration", 5.0),
                    "camera_movement": frame.get("camera_movement", "static"),
                    "lighting": frame.get("lighting", "natural"),
                    "mood": frame.get("mood", "neutral"),
                    "text_overlay": frame.get("text_overlay", ""),
                    "use_product_image": frame.get("product_in_frame", False),
                })
            quality = storyboard.get("quality_report", {})
        except Exception as e:
            logger.error(f"StoryboardDirector生成失败: {e}, 使用fallback")
            shots = self._fallback_shots(product_name, target_duration)
            quality = {}

        # 创建项目目录
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_id = f"video_{timestamp}"
        project_dir = Path(OUTPUTS_DIR) / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        total_dur = sum(s["duration"] for s in shots)
        metadata = {
            "title": selected_dir.get("name", "营销视频"),
            "topic": product_name,
            "product_name": product_name,
            "product_detail": product_detail,
            "industry": industry,
            "target_duration": target_duration,
            "total_duration": total_dur,
            "shot_count": len(shots),
            "shots": shots,
            "selling_points": selling_points,
            "quality_report": quality,
            "generation_stage": "script",
            "style": "cinematic",
            "smart_create": {
                "session_id": session_id,
                "script_id": script_id,
                "script_name": selected_dir.get("name", ""),
                "risk_level": selected_dir.get("risk_level", "moderate"),
                "competitor_summary": session.get("competitor_summary", {}),
                "market_summary": session.get("market_summary", {}),
            },
            "created_at": datetime.now().isoformat(),
        }
        MetadataManager.save_metadata(project_dir, metadata)
        logger.info(f"项目已创建: {project_id}, 脚本: {selected_dir.get('name')}, {len(shots)}个镜头")

        # 存储到session供打磨阶段使用
        session["scripts"] = [{
            "script_id": script_id,
            "name": selected_dir.get("name", ""),
            "risk_level": selected_dir.get("risk_level", "moderate"),
            "shots": shots,
            "total_duration": total_dur,
            "selling_points": selling_points,
            "quality_report": quality,
        }]

        return {
            "project_id": project_id,
            "title": metadata["title"],
            "shots": shots,
            "total_duration": total_dur,
            "shot_count": len(shots),
            "quality_report": quality,
        }

    async def _create_project_from_quick_script(
        self, session: Dict, session_id: str, script_id: int, selected_script: Dict
    ) -> Dict:
        """快速模式：直接使用预生成的完整脚本创建项目，跳过StoryboardDirector"""
        shots = selected_script.get("shots", [])
        for i, shot in enumerate(shots):
            shot["shot_id"] = i + 1

        total_dur = sum(s.get("duration", 5) for s in shots)
        product_name = session.get("product_name", "")

        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_id = f"video_{timestamp}"
        project_dir = Path(OUTPUTS_DIR) / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        metadata = {
            "title": selected_script.get("name", "快速脚本"),
            "topic": product_name,
            "product_name": product_name,
            "product_detail": session.get("product_detail", ""),
            "industry": session.get("industry", ""),
            "target_duration": session.get("target_duration", 60),
            "total_duration": total_dur,
            "shot_count": len(shots),
            "shots": shots,
            "selling_points": selected_script.get("selling_points", []),
            "quality_report": {},
            "generation_stage": "script",
            "style": "cinematic",
            "smart_create": {
                "session_id": session_id,
                "script_id": script_id,
                "script_name": selected_script.get("name", ""),
                "risk_level": selected_script.get("risk_level", "moderate"),
                "competitor_summary": session.get("competitor_summary", {}),
                "market_summary": session.get("market_summary", {}),
            },
            "created_at": datetime.now().isoformat(),
        }
        MetadataManager.save_metadata(project_dir, metadata)
        logger.info(f"[快速模式] 项目直接创建: {project_id}, {len(shots)}个镜头 (跳过StoryboardDirector)")

        session["scripts"] = [{
            "script_id": script_id,
            "name": selected_script.get("name", ""),
            "risk_level": selected_script.get("risk_level", "moderate"),
            "shots": shots,
            "total_duration": total_dur,
            "selling_points": selected_script.get("selling_points", []),
            "quality_report": {},
        }]

        return {
            "project_id": project_id,
            "title": metadata["title"],
            "shots": shots,
            "total_duration": total_dur,
            "shot_count": len(shots),
            "quality_report": {},
        }

    async def select_script(self, session_id: str, script_id: int) -> Dict:
        """
        选择一个脚本，创建项目目录+metadata.json
        替代旧的 select_direction + select_hook

        Returns:
            {project_id, title, shots, total_duration}
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话不存在: {session_id}")

        scripts = session.get("scripts", [])
        selected = None
        for s in scripts:
            if s.get("script_id") == script_id:
                selected = s
                break
        if not selected:
            raise ValueError(f"脚本不存在: {script_id}")

        # 创建项目目录
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_id = f"video_{timestamp}"
        project_dir = Path(OUTPUTS_DIR) / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        shots = selected.get("shots", [])
        metadata = {
            "title": selected.get("description", selected["name"]),
            "topic": session.get("product_name", ""),
            "product_name": session.get("product_name", ""),
            "product_detail": session.get("product_detail", ""),
            "industry": session.get("industry", ""),
            "target_duration": session.get("target_duration", 60),
            "total_duration": selected.get("total_duration", 0),
            "shot_count": len(shots),
            "shots": shots,
            "selling_points": selected.get("selling_points", []),
            "quality_report": selected.get("quality_report", {}),
            "generation_stage": "script",
            "style": "cinematic",
            "smart_create": {
                "session_id": session_id,
                "script_id": script_id,
                "script_name": selected["name"],
                "risk_level": selected["risk_level"],
                "competitor_summary": session.get("competitor_summary", {}),
                "market_summary": session.get("market_summary", {}),
            },
            "created_at": datetime.now().isoformat(),
        }

        MetadataManager.save_metadata(project_dir, metadata)
        logger.info(f"项目已创建: {project_id}, 脚本: {selected['name']}, {len(shots)}个镜头")

        return {
            "project_id": project_id,
            "title": metadata["title"],
            "shots": shots,
            "total_duration": selected.get("total_duration", 0),
            "shot_count": len(shots),
        }

    async def regenerate_scripts(self, session_id: str, feedback: Optional[str] = None) -> Dict:
        """
        换一批脚本：根据反馈重新生成3个脚本

        Returns:
            {session_id, scripts: List[FullScriptOption]}
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话不存在: {session_id}")

        if feedback:
            # 把反馈加入reference_text以影响生成
            existing_ref = session.get("reference_text", "") or ""
            session["reference_text"] = f"{existing_ref}\n用户反馈: {feedback}"

        return await self.generate_full_scripts(session_id)

    async def parse_user_script(self, session_id: str, user_script: str, target_duration: int = 60) -> Dict:
        """
        深度模式：解析用户自由文本为标准shots格式，创建项目直接进入预览

        Returns:
            {project_id, shots, total_duration}
        """
        prompt = f"""你是专业短视频分镜师。将用户提供的脚本文本解析为标准分镜格式。

【用户脚本】
{user_script}

【目标时长】{target_duration}秒

【输出JSON格式】
{{
  "title": "视频标题",
  "shots": [
    {{
      "shot_id": 1,
      "shot_type": "close_up/medium/wide/extreme_close_up",
      "act_type": "hook/main/cta",
      "visual_description": "Professional English description for AI image generation, 40-60 words, cinematic style",
      "narration": "中文口播文案",
      "duration": 5.0,
      "camera_movement": "static/zoom_in/pan_left/etc",
      "mood": "exciting/calm/emotional/etc"
    }}
  ]
}}

要求:
1. visual_description必须是英文，用于AI图片生成，包含光线、构图、色调等专业描述
2. narration保持用户原文的中文口播，适当调整以适合短视频节奏
3. 每个shot的duration合理分配，总时长接近{target_duration}秒
4. 第一个镜头必须是hook类型，最后一个是cta类型
5. 只输出JSON，不要其他文字"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
        except Exception as e:
            logger.error(f"用户脚本解析失败: {e}")
            parsed = None

        if not parsed or not isinstance(parsed, dict):
            # fallback: 简单分段
            lines = [l.strip() for l in user_script.split("\n") if l.strip()]
            shots = []
            dur_per = target_duration / max(len(lines), 1)
            for i, line in enumerate(lines):
                shots.append({
                    "shot_id": i + 1,
                    "shot_type": "medium",
                    "act_type": "hook" if i == 0 else ("cta" if i == len(lines) - 1 else "main"),
                    "visual_description": "Professional product shot with soft lighting on clean background",
                    "narration": line,
                    "duration": round(dur_per, 1),
                    "camera_movement": "static",
                    "mood": "neutral",
                })
            parsed = {"title": lines[0][:30] if lines else "用户脚本", "shots": shots}

        shots = parsed.get("shots", [])
        title = parsed.get("title", "用户自定义脚本")

        # 创建项目
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        project_id = f"video_{timestamp}"
        project_dir = Path(OUTPUTS_DIR) / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        total_dur = sum(s.get("duration", 5) for s in shots)
        metadata = {
            "title": title,
            "topic": title,
            "target_duration": target_duration,
            "total_duration": total_dur,
            "shot_count": len(shots),
            "shots": shots,
            "selling_points": [],
            "generation_stage": "script",
            "style": "cinematic",
            "smart_create": {"session_id": session_id, "user_script": True},
            "created_at": datetime.now().isoformat(),
        }
        MetadataManager.save_metadata(project_dir, metadata)

        return {
            "project_id": project_id,
            "title": title,
            "shots": shots,
            "total_duration": total_dur,
        }

    def _fallback_shots(self, product_name: str, target_duration: int) -> List[Dict]:
        """生成默认模板shots作为fallback"""
        structure = [
            ("hook", "hook", 3),
            ("medium", "main", 5),
            ("close_up", "main", 5),
            ("medium", "main", 6),
            ("wide", "main", 5),
            ("close_up", "main", 4),
            ("medium", "cta", 4),
        ]
        shots = []
        for i, (shot_type, act_type, dur) in enumerate(structure):
            shots.append({
                "shot_id": i + 1,
                "shot_type": shot_type,
                "act_type": act_type,
                "visual_description": f"Professional {shot_type} shot of {product_name}, studio lighting, clean background",
                "narration": f"镜头{i+1}的口播文案",
                "duration": float(dur),
                "camera_movement": "static",
                "lighting": "natural",
                "mood": "neutral",
                "text_overlay": "",
                "use_product_image": False,
            })
        return shots

    # ==================== 深度模式: AI对话采集产品信息 ====================

    async def intake_next_question(self, session_id: str, chat_history: List[Dict]) -> Dict:
        """
        深度模式：根据已收集信息动态生成下一个产品问题
        Returns: {question: str, is_complete: bool, collected_summary: Dict}
        """
        # 分析已收集的维度
        collected_dims = self._analyze_collected_dimensions(chat_history)

        prompt = f"""你是一位专业的产品经理，正在通过对话了解用户的产品信息，以便为其创作营销短视频脚本。

【已收集到的信息维度】
{json.dumps(collected_dims, ensure_ascii=False, indent=2)}

【对话历史】
{self._format_chat_history(chat_history)}

【你需要收集的核心维度】
1. 产品名称和品类
2. 核心功能/特点（至少3个）
3. 目标用户群体
4. 价格区间
5. 与竞品的差异化优势
6. 使用场景
7. 品牌调性/风格

【任务】
- 判断还缺少哪些关键信息
- 如果信息已经足够充分（至少覆盖维度1-4），设置is_complete=true
- 如果还需要更多信息，针对最重要的缺失维度提一个问题
- 问题要自然、有针对性，不要像填表

输出JSON（不要其他文字）：
{{
  "question": "下一个问题（如果is_complete=true，写一句总结确认的话）",
  "is_complete": false,
  "collected_summary": {{
    "product_name": "已识别的产品名或空",
    "category": "已识别的品类或空",
    "core_features": ["已识别的特点"],
    "target_audience": "已识别的目标用户或空",
    "price_range": "已识别的价格或空",
    "differentiators": ["已识别的差异化"],
    "use_cases": ["已识别的场景"],
    "brand_tone": "已识别的调性或空"
  }}
}}"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            if isinstance(parsed, dict) and "question" in parsed:
                return parsed
        except Exception as e:
            logger.warning(f"深度模式问题生成失败: {e}")

        # Fallback
        round_count = len([m for m in chat_history if m.get("role") == "user"])
        fallback_questions = [
            "你好！请先告诉我你的产品叫什么名字，属于什么品类？",
            "这个产品最核心的3个功能或特点是什么？",
            "你的目标用户是谁？他们通常在什么场景下使用？",
            "和市面上的竞品相比，你的产品最大的优势是什么？",
            "你希望这个产品给人什么样的感觉？（比如高端、亲民、专业等）",
        ]
        q = fallback_questions[min(round_count, len(fallback_questions) - 1)]
        return {"question": q, "is_complete": round_count >= 5, "collected_summary": {}}

    def _analyze_collected_dimensions(self, chat_history: List[Dict]) -> Dict:
        """分析对话中已收集到的信息维度"""
        dims = {
            "has_product_name": False,
            "has_features": False,
            "has_target_audience": False,
            "has_price": False,
            "has_differentiators": False,
            "has_use_cases": False,
            "has_brand_tone": False,
            "round_count": 0,
        }
        user_texts = []
        for msg in chat_history:
            if msg.get("role") == "user":
                dims["round_count"] += 1
                user_texts.append(msg.get("content", ""))

        combined = " ".join(user_texts)
        if len(combined) > 10:
            dims["has_product_name"] = True
        if any(kw in combined for kw in ["功能", "特点", "特色", "优势", "好处"]):
            dims["has_features"] = True
        if any(kw in combined for kw in ["用户", "客户", "消费者", "人群", "受众"]):
            dims["has_target_audience"] = True
        if any(kw in combined for kw in ["价格", "元", "块", "¥", "价位"]):
            dims["has_price"] = True
        if any(kw in combined for kw in ["不同", "区别", "差异", "竞品", "对手"]):
            dims["has_differentiators"] = True
        if any(kw in combined for kw in ["场景", "使用", "用途", "怎么用"]):
            dims["has_use_cases"] = True
        if any(kw in combined for kw in ["风格", "调性", "感觉", "定位", "品牌"]):
            dims["has_brand_tone"] = True

        return dims

    def _format_chat_history(self, chat_history: List[Dict]) -> str:
        """格式化对话历史为文本"""
        if not chat_history:
            return "（对话刚开始）"
        parts = []
        for msg in chat_history:
            role = "AI" if msg.get("role") == "ai" else "用户"
            parts.append(f"{role}：{msg.get('content', '')}")
        return "\n\n".join(parts)

    # ==================== 新增核心方法 ====================

    async def _extract_selling_points(
        self,
        product_name: str,
        reference_text: Optional[str],
        market_summary: Dict,
        competitor_summary: Dict,
        product_detail: Optional[str] = None
    ) -> List[str]:
        """从调研数据提取3个核心卖点"""
        product_detail_section = f"产品详细信息（最高优先级）: {product_detail}" if product_detail else ""
        prompt = f"""你是产品营销专家。请从以下信息中提取"{product_name}"最核心的3个卖点。

{product_detail_section}
参考文案: {reference_text or '无'}
市场洞察: {market_summary.get('summary', '无')}
竞品成功模式: {', '.join(competitor_summary.get('winning_patterns', []))}
情绪触发: {', '.join(competitor_summary.get('emotional_triggers', []))}

请输出JSON数组，格式如下，不要其他文字:
["卖点1：具体描述+支撑依据", "卖点2：具体描述+支撑依据", "卖点3：具体描述+支撑依据"]

要求:
1. 从用户参考文案中优先提取，尽量保留原文中的具体数字、场景、对比描述
2. 每个卖点必须包含两部分：核心主张 + 支撑依据（数据、对比、用户场景任选其一）
   好的示例："续航超长：单次充电可用72小时，同类产品平均只有24小时"
   好的示例："上手极简：开箱即用，3步完成设置，无需任何技术背景"
   差的示例（禁止输出）："品质优异"、"性价比高"、"用户好评"
3. 如果参考文案没有数据，从市场洞察中补充，或用用户可感知的场景描述替代
4. 3个卖点之间不要重复，要覆盖不同维度（功能/体验/价值）"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            if isinstance(parsed, list) and len(parsed) >= 3:
                return parsed[:3]
        except Exception as e:
            logger.warning(f"卖点提取失败: {e}")

        # 回退默认
        return [f"{product_name}品质优异", f"性价比高", f"用户好评如潮"]

    async def _generate_hook_candidates(
        self,
        product_name: str,
        direction: Dict,
        selling_points: List[str],
        competitor_summary: Dict
    ) -> List[Dict]:
        """生成5种风格的Hook候选"""
        prompt = f"""你是短视频爆款开场专家。请为"{product_name}"生成5个不同风格的开场Hook。

创意方向: {direction['name']} - {direction['description']}
核心卖点: {', '.join(selling_points)}
竞品开场策略: {', '.join(competitor_summary.get('hook_strategies', []))}

请生成5个Hook(不要其他文字，直接输出JSON数组):
[
  {{
    "hook_id": 1,
    "style": "悬念型",
    "hook_text": "开场口播文案(15-25字，制造悬念让人想看下去)",
    "visual_hint": "English visual description for opening shot (20-30 words)",
    "rationale": "为什么这个开场有效的简短分析(20-40字)"
  }},
  {{
    "hook_id": 2,
    "style": "痛点型",
    "hook_text": "直击用户痛点的开场(15-25字)",
    "visual_hint": "English visual description",
    "rationale": "创作依据"
  }},
  {{
    "hook_id": 3,
    "style": "数据型",
    "hook_text": "用震撼数据开场(15-25字)",
    "visual_hint": "English visual description",
    "rationale": "创作依据"
  }},
  {{
    "hook_id": 4,
    "style": "反常识型",
    "hook_text": "打破常规认知的开场(15-25字)",
    "visual_hint": "English visual description",
    "rationale": "创作依据"
  }},
  {{
    "hook_id": 5,
    "style": "场景代入型",
    "hook_text": "让观众代入具体场景(15-25字)",
    "visual_hint": "English visual description",
    "rationale": "创作依据"
  }}
]

要求:
1. 5个Hook必须风格完全不同，各有特色
2. hook_text必须是中文，15-25字，口语化自然
3. visual_hint必须是英文，描述适合AI生图的画面
4. rationale要说明这种开场方式为什么对这个产品有效
5. 每个Hook都要和至少一个核心卖点相关"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            if isinstance(parsed, list) and len(parsed) >= 5:
                return parsed[:5]
        except Exception as e:
            logger.warning(f"Hook生成失败: {e}")

        # 回退默认
        return [
            {"hook_id": 1, "style": "悬念型", "hook_text": f"用了{product_name}之后，我再也回不去了...", "visual_hint": f"Close-up shot of hands holding {product_name}, warm lighting, curious expression", "rationale": "悬念引发好奇心，3秒内留住观众"},
            {"hook_id": 2, "style": "痛点型", "hook_text": f"还在为选{product_name}纠结？看完你就知道了", "visual_hint": f"Person looking confused at multiple products, soft natural lighting", "rationale": "直击选择困难痛点，精准锁定目标用户"},
            {"hook_id": 3, "style": "数据型", "hook_text": f"超过10万人选择的{product_name}，到底好在哪？", "visual_hint": f"Dynamic data visualization transitioning to {product_name} product shot", "rationale": "数据建立信任感，激发从众心理"},
            {"hook_id": 4, "style": "反常识型", "hook_text": f"千万别买{product_name}！除非你想...", "visual_hint": f"Dramatic close-up with warning gesture, then reveal {product_name}", "rationale": "反常识表达制造认知冲突，点击率最高"},
            {"hook_id": 5, "style": "场景代入型", "hook_text": f"每天早上起来第一件事，就是用{product_name}", "visual_hint": f"Morning routine scene, person reaching for {product_name}, cozy bedroom", "rationale": "场景代入让观众产生共鸣和向往"}
        ]

    def _build_hook_shots(self, selected_hook: Dict, shots_structure: List[Dict]) -> Dict:
        """用选中的Hook填充act1第一个镜头（纯逻辑，不调Gemini）"""
        first_shot = shots_structure[0]
        return {
            "shot_id": first_shot["id"],
            "visual_description": selected_hook["visual_hint"],
            "narration": selected_hook["hook_text"],
            "rationale": f"[{selected_hook['style']}开场] {selected_hook['rationale']}"
        }

    async def _generate_body_content(
        self,
        product_name: str,
        direction: Dict,
        selling_points: List[str],
        hook_shot: Dict,
        shots_structure: List[Dict],
        competitor_summary: Dict,
        market_summary: Dict,
        brand_profile: Optional[Dict] = None,
        product_detail: Optional[str] = None
    ) -> List[Dict]:
        """生成act1剩余 + act2主体内容，每个镜头带rationale"""
        # 找出需要生成的镜头（排除第一个hook镜头和act3镜头）
        body_shots = []
        for s in shots_structure[1:]:
            if s["act_type"] not in ("act3", "climax"):
                body_shots.append(s)

        if not body_shots:
            return []

        shots_desc = ""
        for shot in body_shots:
            shots_desc += f"- Shot {shot['id']}: type={shot['shot_type']}, act={shot['act_type']}, duration={shot['duration']}s\n"

        brand_section = ""
        if brand_profile:
            brand_section = f"""
品牌调性: {brand_profile.get('brand_tone', '')}
禁用词: {', '.join(brand_profile.get('forbidden_words', []))}
偏好表达: {', '.join(brand_profile.get('preferred_expressions', []))}
"""

        product_detail_section = f"产品详细信息（优先参考）: {product_detail}\n" if product_detail else ""
        prompt = f"""你是专业短视频脚本编剧。请为视频主体部分生成每个镜头的内容。

产品: {product_name}
{product_detail_section}创意方向: {direction['name']} - {direction['description']}
开场Hook（上一句话，正文要自然衔接）: {hook_shot['narration']}
核心卖点（作为叙事骨架，不要直接念出来）: {json.dumps(selling_points, ensure_ascii=False)}
{brand_section}
竞品成功模式: {', '.join(competitor_summary.get('winning_patterns', []))}
市场洞察: {market_summary.get('summary', '')[:200]}

需要生成的镜头:
{shots_desc}

请为每个镜头生成(不要其他文字，直接输出JSON数组):
[
  {{
    "shot_id": 镜头ID,
    "visual_description": "英文画面描述(40-70词，描述具体场景、人物状态、构图、光线、色调，要让看到描述的人能脑补出画面)",
    "narration": "中文口播文案(1-2句，像在跟朋友说话，不像念产品说明书)",
    "rationale": "创作依据(20-40字，说明这个镜头如何推进叙事、自然呈现了哪个卖点)"
  }},
  ...
]

脚本创作要求:
1. 把卖点融入故事和场景，让观众自己感受到，不要直接念出卖点词语
   好的示例："用了三周，我妈打电话问我最近皮肤怎么了" （传递效果卖点）
   差的示例："它的保湿效果非常好，使用后皮肤水润有光泽" （直接念卖点）
2. narration要口语自然，有情绪，有节奏感，单镜头不超过25字
3. 镜头之间要有叙事连贯性，承接上一镜头的情绪和内容走向
4. product/hands_on 类型镜头：画面聚焦产品细节，口播说使用感受而非参数
5. visual_description 要足够具体，让 AI 生图时风格统一（保持相近的光线色调）"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            if isinstance(parsed, list) and len(parsed) > 0:
                # 补齐Gemini可能遗漏的镜头
                parsed = self._fill_missing_shots(parsed, body_shots, product_name, selling_points)
                return parsed
        except Exception as e:
            logger.warning(f"主体内容生成失败: {e}")

        # 回退
        fallback = []
        for i, s in enumerate(body_shots):
            sp = selling_points[i % len(selling_points)] if selling_points else ""
            fallback.append({
                "shot_id": s["id"],
                "visual_description": f"Product demonstration shot of {product_name}, clean background, professional lighting",
                "narration": f"关于{sp}的展示",
                "rationale": f"展示核心卖点: {sp}"
            })
        return fallback

    async def _generate_cta_ending(
        self,
        product_name: str,
        hook: Dict,
        selling_points: List[str],
        shots_structure: List[Dict],
        body_narrations: List[str],
        brand_profile: Optional[Dict] = None
    ) -> List[Dict]:
        """生成act3结尾，与Hook首尾呼应"""
        # 找出act3镜头
        cta_shots = [s for s in shots_structure if s["act_type"] in ("act3", "climax")]
        if not cta_shots:
            return []

        shots_desc = ""
        for s in cta_shots:
            shots_desc += f"- Shot {s['id']}: type={s['shot_type']}, duration={s['duration']}s\n"

        brand_section = ""
        if brand_profile:
            brand_section = f"品牌调性: {brand_profile.get('brand_tone', '')}\n"

        # 完整正文口播，供结尾生成时参考叙事走向
        body_text = "\n".join([f"- {n}" for n in body_narrations if n]) if body_narrations else "（无正文内容）"

        prompt = f"""你是短视频结尾专家。请为视频结尾生成镜头内容，要与开场Hook形成首尾呼应。

产品: {product_name}
开场Hook（{hook['style']}）: {hook['hook_text']}
核心卖点: {json.dumps(selling_points, ensure_ascii=False)}
正文完整口播（按顺序）:
{body_text}
{brand_section}
需要生成的结尾镜头:
{shots_desc}

请生成(不要其他文字，直接输出JSON数组):
[
  {{
    "shot_id": 镜头ID,
    "visual_description": "英文画面描述(40-60词)",
    "narration": "中文口播文案(1-2句话)",
    "rationale": "创作依据(说明如何与开场呼应)"
  }},
  ...
]

要求:
1. 仔细阅读正文口播，结尾要接住正文的情绪走向，不能跳脱
2. 必须与开场Hook形成呼应闭环（开场提问→结尾揭晓答案；开场悬念→结尾解开悬念；开场痛点→结尾给出解法）
3. 包含明确的行动号召(CTA)，但要自然，不要硬喊"快来购买"
4. narration口语化，有情感收尾感，最后一句留下记忆点"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            if isinstance(parsed, list) and len(parsed) > 0:
                # 归一化shot_id并补齐遗漏的镜头
                self._normalize_shot_ids_in_list(parsed)
                existing_ids = {item.get("shot_id") for item in parsed}
                for s in cta_shots:
                    if s["id"] not in existing_ids:
                        parsed.append({
                            "shot_id": s["id"],
                            "visual_description": f"Call to action shot with {product_name}, bold text overlay, energetic composition",
                            "narration": f"心动不如行动，点击下方链接把{product_name}带回家！",
                            "rationale": f"与开场{hook['style']}呼应，促进转化"
                        })
                return parsed
        except Exception as e:
            logger.warning(f"结尾生成失败: {e}")

        # 回退
        fallback = []
        for s in cta_shots:
            fallback.append({
                "shot_id": s["id"],
                "visual_description": f"Call to action shot with {product_name}, bold text overlay, energetic composition",
                "narration": f"心动不如行动，点击下方链接把{product_name}带回家！",
                "rationale": f"与开场{hook['style']}呼应，促进转化"
            })
        return fallback

    def _quality_check(self, shots: List[Dict], selling_points: List[str]) -> Dict:
        """规则自检：字数/时长匹配、卖点覆盖、节奏评分（纯规则，不调Gemini）"""
        issues = []
        covered = []
        missing = []

        # 1. 字数/时长匹配检查（中文约4字/秒）
        total_words = 0
        total_duration = 0
        word_duration_ok = True
        for shot in shots:
            narration = shot.get("narration", "")
            duration = shot.get("duration", 5)
            word_count = len(narration.replace(" ", "").replace("[", "").replace("]", ""))
            total_words += word_count
            total_duration += duration

            # 每个镜头检查：口播字数 vs 时长
            expected_words = duration * 4  # 4字/秒
            if word_count > expected_words * 1.3:
                issues.append(f"镜头#{shot.get('id', '?')}口播偏长({word_count}字/{duration}秒)")
                word_duration_ok = False

        # 总体检查
        if total_words > total_duration * 4.5:
            issues.append(f"总口播偏长({total_words}字/{total_duration}秒)，建议精简")
            word_duration_ok = False

        # 2. 卖点覆盖检查
        all_narration = " ".join(shot.get("narration", "") for shot in shots)
        for sp in selling_points:
            # 简单匹配：卖点关键词出现在口播中
            sp_keywords = [w for w in sp if len(w) > 1]
            sp_text = sp.replace(" ", "")
            if any(kw in all_narration for kw in [sp_text, sp_text[:3], sp_text[-3:]]):
                covered.append(sp)
            else:
                # 更宽松的匹配：检查rationale中是否提到
                all_rationale = " ".join(shot.get("rationale", "") for shot in shots)
                if sp_text[:3] in all_rationale or sp_text[-3:] in all_rationale:
                    covered.append(sp)
                else:
                    missing.append(sp)

        if missing:
            issues.append(f"缺失卖点: {', '.join(missing)}")

        # 3. 节奏评分（基于emotion_score变化）
        emotion_scores = [shot.get("emotion_score", 5) for shot in shots]
        if len(emotion_scores) >= 3:
            # 好的节奏应该有起伏：开头高→中间变化→结尾高
            has_opening_peak = emotion_scores[0] >= 6
            has_climax = max(emotion_scores[-2:]) >= 7 if len(emotion_scores) >= 2 else True
            has_variation = max(emotion_scores) - min(emotion_scores) >= 2
            rhythm_score = 0.0
            if has_opening_peak:
                rhythm_score += 0.35
            if has_climax:
                rhythm_score += 0.35
            if has_variation:
                rhythm_score += 0.30
        else:
            rhythm_score = 0.6  # 镜头太少，给个中等分

        return {
            "word_duration_match": word_duration_ok,
            "selling_point_coverage": covered,
            "missing_selling_points": missing,
            "rhythm_score": round(rhythm_score, 2),
            "issues": issues,
            "auto_fixes": []
        }

    async def _apply_auto_fixes(
        self,
        shots: List[Dict],
        selling_points: List[str],
        missing_points: List[str],
        product_name: str
    ) -> tuple:
        """自动补充缺失卖点（可能调用1次Gemini）"""
        auto_fixes = []

        # 找到act2中最适合插入卖点的镜头（duration最长或narration最短的）
        act2_shots = [s for s in shots if s.get("act_type") in ("act2", "main")]
        if not act2_shots:
            act2_shots = shots[1:-1] if len(shots) > 2 else shots

        # 构建需要修改的镜头信息
        candidates = sorted(act2_shots, key=lambda s: len(s.get("narration", "")))[:len(missing_points)]

        if not candidates:
            return shots, ["无法自动修复，请手动添加卖点"]

        candidates_data = [
            {"shot_id": s.get("id"), "narration": s.get("narration", ""), "visual_description": s.get("visual_description", "")}
            for s in candidates
        ]

        prompt = f"""你是短视频脚本优化专家。以下镜头需要自然地融入缺失的卖点。

产品: {product_name}
缺失卖点: {json.dumps(missing_points, ensure_ascii=False)}

需要优化的镜头:
{json.dumps(candidates_data, ensure_ascii=False)}

请输出优化后的镜头(不要其他文字，直接输出JSON数组):
[
  {{
    "shot_id": 镜头ID,
    "narration": "融入卖点后的口播文案",
    "visual_description": "对应调整的画面描述(英文)",
    "rationale": "说明融入了哪个卖点"
  }}
]

要求: 自然融入，不要生硬插入卖点"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            if isinstance(parsed, list):
                self._normalize_shot_ids_in_list(parsed)
                fix_map = {item["shot_id"]: item for item in parsed}
                for i, shot in enumerate(shots):
                    fix = fix_map.get(shot.get("id"))
                    if fix:
                        old_narration = shot.get("narration", "")
                        shot["narration"] = fix.get("narration", old_narration)
                        shot["visual_description"] = fix.get("visual_description", shot.get("visual_description", ""))
                        shot["rationale"] = fix.get("rationale", shot.get("rationale", ""))
                        auto_fixes.append(f"镜头#{shot.get('id')}已融入卖点: {fix.get('rationale', '')}")
        except Exception as e:
            logger.warning(f"自动修复失败: {e}")
            auto_fixes.append("自动修复失败，请手动检查卖点覆盖")

        return shots, auto_fixes

    @staticmethod
    def _normalize_shot_id(val) -> Optional[int]:
        """将各种格式的shot_id归一化为整数，如 'Shot 2' → 2, '2' → 2, 2 → 2"""
        import re
        if isinstance(val, int):
            return val
        if isinstance(val, float):
            return int(val)
        if isinstance(val, str):
            # 提取字符串中的数字
            nums = re.findall(r'\d+', val)
            if nums:
                return int(nums[0])
        return None

    def _normalize_shot_ids_in_list(self, items: List[Dict]) -> List[Dict]:
        """归一化列表中所有item的shot_id"""
        for item in items:
            normalized = self._normalize_shot_id(item.get("shot_id"))
            if normalized is not None:
                item["shot_id"] = normalized
        return items

    def _fill_missing_shots(
        self,
        generated: List[Dict],
        expected_shots: List[Dict],
        product_name: str,
        selling_points: List[str]
    ) -> List[Dict]:
        """补齐Gemini返回中遗漏的镜头"""
        self._normalize_shot_ids_in_list(generated)
        existing_ids = {item.get("shot_id") for item in generated}
        logger.debug(f"Gemini返回的shot_ids: {existing_ids}, 期望: {[s['id'] for s in expected_shots]}")
        for i, s in enumerate(expected_shots):
            if s["id"] not in existing_ids:
                sp = selling_points[i % len(selling_points)] if selling_points else ""
                shot_type = s.get("shot_type", "scene")
                # 根据镜头类型生成合理的画面描述
                visual_map = {
                    "product": f"Clean product shot of {product_name} on minimalist background, soft studio lighting, elegant composition",
                    "hands_on": f"Close-up hands demonstrating {product_name}, showing texture and application, warm natural lighting",
                    "effect": f"Before and after comparison or visual effect demonstration of {product_name}, split screen, bright lighting",
                    "scene": f"Lifestyle scene featuring {product_name} in daily use context, natural ambient lighting, warm tones",
                    "talking_head": f"Confident presenter speaking to camera about {product_name}, clean background, professional lighting",
                    "transition": f"Smooth visual transition with {product_name} as focal point, dynamic camera movement, modern style",
                }
                visual = visual_map.get(shot_type, f"Professional shot featuring {product_name}, clean composition, good lighting")
                generated.append({
                    "shot_id": s["id"],
                    "visual_description": visual,
                    "narration": f"关于{sp}的展示" if sp else f"展示{product_name}的独特优势",
                    "rationale": f"展示核心卖点: {sp}" if sp else "补充产品展示"
                })
                logger.info(f"补齐遗漏镜头 Shot#{s['id']} ({shot_type})")
        return generated

    def _summarize_body(self, body_shots: List[Dict]) -> str:
        """概括主体内容（纯逻辑，不调Gemini）"""
        if not body_shots:
            return "无主体内容"
        summaries = []
        for s in body_shots[:5]:
            narr = s.get("narration", "")[:30]
            summaries.append(narr)
        return " → ".join(summaries)

    # ==================== 产品缓存（跨会话记忆） ====================

    def _cache_file_path(self) -> Path:
        cache_dir = Path(PROJECT_ROOT) / "cache"
        cache_dir.mkdir(parents=True, exist_ok=True)
        return cache_dir / "product_cache.json"

    def _load_product_cache(self, product_name: str) -> Optional[Dict]:
        """读取产品历史缓存"""
        try:
            path = self._cache_file_path()
            if not path.exists():
                return None
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            return data.get(product_name)
        except Exception as e:
            logger.warning(f"读取产品缓存失败: {e}")
            return None

    def _save_product_cache(self, product_name: str, industry: Optional[str],
                             selling_points: List[str], product_detail: Optional[str],
                             competitor_summary: Dict) -> None:
        """保存产品信息到缓存（详细模式生成成功后调用）"""
        try:
            path = self._cache_file_path()
            data = {}
            if path.exists():
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
            data[product_name] = {
                "industry": industry,
                "selling_points": selling_points,
                "product_detail": product_detail,
                "competitor_summary": competitor_summary,
                "last_used": datetime.now().isoformat()
            }
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            logger.info(f"产品缓存已保存: {product_name}")
        except Exception as e:
            logger.warning(f"保存产品缓存失败: {e}")

    # ==================== 原有内部方法 ====================

    async def _analyze_competitors(self, videos: List[Dict], product_name: str) -> Dict:
        """用Gemini分析竞品视频数据"""
        if not videos:
            return {
                "top_videos": [],
                "winning_patterns": ["产品特写展示", "用户痛点引入", "效果对比"],
                "hook_strategies": ["直击痛点提问", "惊人数据开场", "用户故事引入"],
                "content_structures": ["痛点-解决方案-效果", "故事-产品-号召行动"]
            }

        # 取播放量最高的10条
        sorted_videos = sorted(videos, key=lambda v: v.get("play_count", 0), reverse=True)[:10]
        videos_text = ""
        top_videos = []
        for i, v in enumerate(sorted_videos):
            videos_text += f"{i+1}. 描述: {v['description'][:100]}, 播放:{v.get('play_count',0)}, 点赞:{v.get('digg_count',0)}, 评论:{v.get('comment_count',0)}\n"
            top_videos.append({
                "description": v["description"][:100],
                "play_count": v.get("play_count", 0),
                "digg_count": v.get("digg_count", 0)
            })

        prompt = f"""你是短视频营销分析专家。以下是关于"{product_name}"的10条高播放抖音视频数据:

{videos_text}

请分析这些成功视频的共同模式，输出JSON格式(不要其他文字):
{{
  "winning_patterns": ["模式1", "模式2", "模式3"],
  "hook_strategies": ["开场策略1", "开场策略2", "开场策略3"],
  "content_structures": ["结构1", "结构2"],
  "emotional_triggers": ["情绪触发1", "情绪触发2"]
}}"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            parsed["top_videos"] = top_videos
            return parsed
        except Exception as e:
            logger.warning(f"竞品分析失败，使用默认值: {e}")
            return {
                "top_videos": top_videos,
                "winning_patterns": ["产品特写展示", "用户痛点引入", "效果对比"],
                "hook_strategies": ["直击痛点提问", "惊人数据开场"],
                "content_structures": ["痛点-解决方案-效果"],
                "emotional_triggers": ["好奇心", "焦虑感", "惊喜感"]
            }

    async def _generate_directions(
        self,
        product_name: str,
        industry: Optional[str],
        competitor_summary: Dict,
        market_summary: Dict,
        reference_text: Optional[str],
        brand_profile: Optional[Dict],
        target_duration: int,
        product_detail: Optional[str] = None,
        selected_template: Optional[Dict] = None
    ) -> List[Dict]:
        """生成3个创意方向"""
        # 随机选择1-2个创意手法给创意款
        creative_techs = random.sample(CREATIVE_TECHNIQUES, min(2, len(CREATIVE_TECHNIQUES)))

        brand_section = ""
        if brand_profile:
            brand_section = f"""
品牌调性: {brand_profile.get('brand_tone', '')}
目标受众: {brand_profile.get('target_audience', '')}
禁用词: {', '.join(brand_profile.get('forbidden_words', []))}
"""

        reference_section = ""
        if reference_text:
            reference_section = f"\n参考文案: {reference_text}\n"

        product_detail_section = f"\n产品详细信息: {product_detail}\n" if product_detail else ""

        template_section = ""
        if selected_template:
            t = selected_template
            template_section = f"""
【已选内容模板·必须参考】
模板名称: {t['name']}（来源: {t['source']['name']} - {t['source']['label']}）
核心策略: {t['core_strategy']}
叙事风格: {t['narration_style']}
开场公式: {t['hook_formula']}
结构参考:
  开场({t['structure']['act1']['name']}): {t['structure']['act1']['description']}
  主体({t['structure']['act2']['name']}): {t['structure']['act2']['description']}
  结尾({t['structure']['act3']['name']}): {t['structure']['act3']['description']}
口播示例: {', '.join(t.get('narration_examples', [])[:2])}

请务必让3个方向都继承该模板的叙事风格和结构逻辑，再在此基础上做差异化变化。
"""

        prompt = f"""你是短视频创意总监。基于以下信息，生成3个创意方向。

产品: {product_name}
行业: {industry or '通用'}
目标时长: {target_duration}秒
{brand_section}{reference_section}{product_detail_section}{template_section}
竞品分析:
- 成功模式: {', '.join(competitor_summary.get('winning_patterns', []))}
- 开场策略: {', '.join(competitor_summary.get('hook_strategies', []))}
- 情绪触发: {', '.join(competitor_summary.get('emotional_triggers', []))}

市场洞察: {market_summary.get('summary', '无')}

请生成3个方向(不要其他文字，直接输出JSON数组):
[
  {{
    "direction_id": 1,
    "name": "稳妥款",
    "risk_level": "safe",
    "description": "基于竞品成功模式的稳妥方案...",
    "hook": "开场钩子示例...",
    "structure_preview": ["开场: ...", "主体: ...", "结尾: ..."],
    "creative_techniques": []
  }},
  {{
    "direction_id": 2,
    "name": "优化款",
    "risk_level": "moderate",
    "description": "在成功模式基础上优化...",
    "hook": "开场钩子示例...",
    "structure_preview": ["开场: ...", "主体: ...", "结尾: ..."],
    "creative_techniques": []
  }},
  {{
    "direction_id": 3,
    "name": "创意款",
    "risk_level": "creative",
    "description": "使用创意手法{creative_techs[0]}...",
    "hook": "创意开场钩子...",
    "structure_preview": ["开场: ...", "主体: ...", "结尾: ..."],
    "creative_techniques": {json.dumps(creative_techs, ensure_ascii=False)}
  }}
]

要求:
1. 稳妥款: 复制已验证的成功模式，风险最低
2. 优化款: 在成功模式基础上做微创新
3. 创意款: 必须使用创意手法: {', '.join(creative_techs)}，做差异化突破
4. 每个方向的hook要具体生动，可以直接使用
5. structure_preview要简洁明了，3-5个步骤"""

        try:
            result = await self.gemini.generate(prompt)
            directions = self._parse_json_response(result)
            if isinstance(directions, list) and len(directions) >= 3:
                return directions[:3]
        except Exception as e:
            logger.warning(f"方向生成失败，使用默认方向: {e}")

        # 回退默认方向
        return [
            {
                "direction_id": 1,
                "name": "稳妥款",
                "risk_level": "safe",
                "description": f"基于同类{product_name}爆款视频的经典结构，痛点引入+产品展示+效果对比",
                "hook": f"你还在为选择{product_name}而纠结吗？",
                "structure_preview": ["开场: 痛点提问", "主体: 产品展示+卖点讲解", "结尾: 效果对比+号召行动"],
                "creative_techniques": []
            },
            {
                "direction_id": 2,
                "name": "优化款",
                "risk_level": "moderate",
                "description": f"在经典结构基础上加入用户证言和场景化展示",
                "hook": f"用了3个月的{product_name}，真实感受告诉你...",
                "structure_preview": ["开场: 真实体验引入", "主体: 场景化展示+数据佐证", "结尾: 真诚推荐+限时优惠"],
                "creative_techniques": []
            },
            {
                "direction_id": 3,
                "name": "创意款",
                "risk_level": "creative",
                "description": f"使用{creative_techs[0]}手法打造差异化内容",
                "hook": f"千万别买{product_name}！除非你想...",
                "structure_preview": ["开场: 反转悬念", "主体: 创意展示+惊喜揭示", "结尾: 情感共鸣+行动号召"],
                "creative_techniques": creative_techs
            }
        ]

    async def _chat_refine_script(
        self,
        product_name: str,
        current_shots: List[Dict],
        message: str,
        chat_history: List[Dict],
        all_scripts_context: Optional[List[Dict]] = None,
    ) -> Dict:
        """对话式修改脚本（保留并更新rationale，支持多脚本混搭）"""
        shots_text = ""
        for shot in current_shots:
            rationale_part = f" | rationale: {shot.get('rationale', '')}" if shot.get('rationale') else ""
            shots_text += f"Shot {shot.get('shot_id', shot.get('id', '?'))}: [{shot.get('shot_type', '')}] visual: {shot.get('visual_description', '')[:80]}... | narration: {shot.get('narration', '')}{rationale_part}\n"

        history_text = ""
        for msg in chat_history[-6:]:
            role = "用户" if msg.get("role") == "user" else "AI"
            history_text += f"{role}: {msg.get('content', '')}\n"

        # 多脚本上下文（用于混搭）
        other_scripts_text = ""
        if all_scripts_context:
            for script in all_scripts_context:
                other_scripts_text += f"\n--- {script.get('name', '脚本')} (ID:{script.get('script_id')}) ---\n"
                for shot in script.get("shots", []):
                    other_scripts_text += f"  Shot {shot.get('shot_id', '?')}: narration: {shot.get('narration', '')[:60]}... | visual: {shot.get('visual_description', '')[:40]}...\n"

        scripts_section = ""
        if other_scripts_text:
            scripts_section = f"""
【其他可参考脚本（用户可能要求混搭）】
{other_scripts_text}

注意：如果用户说"用第一个脚本的开头"或"把第三个的CTA换过来"等混搭指令，
请从对应脚本中提取对应镜头内容，替换到当前脚本的相应位置。
"""

        prompt = f"""你是短视频脚本编辑助手。用户正在修改关于"{product_name}"的视频脚本。

当前脚本:
{shots_text}
{scripts_section}
对话历史:
{history_text}

用户新消息: {message}

请根据用户要求修改脚本。输出JSON格式(不要其他文字):
{{
  "ai_response": "你的回复(简洁，告诉用户做了什么修改)",
  "changes_made": ["改动1", "改动2"],
  "updated_shots": [完整的shots数组，包含所有镜头，格式和当前脚本一致]
}}

要求:
1. 只修改用户要求的部分，其他保持不变
2. updated_shots必须包含所有镜头(不是只返回修改的)
3. 每个shot必须保持原有的shot_id(整数)、shot_type、act_type、duration、use_product_image等字段完全不变
4. 可以修改visual_description、narration和rationale字段
5. 如果修改了某个镜头的内容，同步更新该镜头的rationale字段说明修改原因
6. shot_id字段必须是整数(如1,2,3)，不要改成字符串
7. ai_response要简洁友好"""

        try:
            result = await self.gemini.generate(prompt)
            parsed = self._parse_json_response(result)
            if isinstance(parsed, dict):
                return {
                    "ai_response": parsed.get("ai_response", "已根据您的要求进行修改"),
                    "changes_made": parsed.get("changes_made", []),
                    "updated_shots": parsed.get("updated_shots", current_shots)
                }
        except Exception as e:
            logger.error(f"对话修改失败: {e}")

        return {
            "ai_response": "抱歉，修改暂时失败，请稍后再试",
            "changes_made": [],
            "updated_shots": current_shots
        }

    def _parse_json_response(self, text: str) -> any:
        """解析可能包含markdown代码块的JSON响应，带容错修复"""
        import re
        text = text.strip()

        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()

        # 找JSON数组或对象
        start_arr = text.find("[")
        start_obj = text.find("{")

        if start_arr >= 0 and (start_obj < 0 or start_arr < start_obj):
            end = text.rfind("]") + 1
            if end > start_arr:
                text = text[start_arr:end]
        elif start_obj >= 0:
            end = text.rfind("}") + 1
            if end > start_obj:
                text = text[start_obj:end]

        # 第一次尝试直接解析
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            pass

        # 修复常见LLM JSON问题
        fixed = text
        # 1. 移除尾部逗号 (,] 或 ,})
        fixed = re.sub(r',\s*([}\]])', r'\1', fixed)
        # 2. 修复字符串内的未转义换行符
        fixed = re.sub(r'(?<!\\)\n', r'\\n', fixed)
        try:
            return json.loads(fixed)
        except json.JSONDecodeError:
            pass

        # 3. 如果是数组，尝试截断到最后一个完整对象
        if fixed.startswith("["):
            # 从后往前找最后一个完整的 "},"或"}" 并截断
            last_obj_end = fixed.rfind("}")
            if last_obj_end > 0:
                truncated = fixed[:last_obj_end + 1]
                # 确保闭合数组
                if not truncated.rstrip().endswith("]"):
                    truncated = truncated.rstrip().rstrip(",") + "]"
                try:
                    result = json.loads(truncated)
                    logger.warning(f"JSON截断修复成功，解析了部分结果")
                    return result
                except json.JSONDecodeError:
                    pass

        # 最后抛出异常
        raise json.JSONDecodeError("无法解析JSON", text, 0)

    # ==================== 数据驱动脚本生成 (V3) ====================

    async def create_session_v2(
        self,
        product_name: str,
        industry: Optional[str] = None,
        target_duration: int = 60,
        reference_text: Optional[str] = None,
        brand_profile: Optional[Dict] = None,
        product_detail: Optional[str] = None,
    ) -> str:
        """
        数据驱动创建会话 — 触发异步三方向调研

        立即返回session_id，后台异步执行调研+脚本生成

        Returns:
            session_id
        """
        session_id = str(uuid.uuid4())[:8]
        logger.info(f"[数据驱动V3] 创建会话 {session_id}: product={product_name}")

        # 初始化session
        self.sessions[session_id] = {
            "session_id": session_id,
            "product_name": product_name,
            "industry": industry or "",
            "target_duration": target_duration,
            "reference_text": reference_text or "",
            "product_detail": product_detail or "",
            "brand_profile": brand_profile,
            "mode": "data_driven",
            "created_at": datetime.now().isoformat(),
            # 调研状态
            "research_phase": "searching",
            "research_progress": 0.0,
            "research_details": ["开始数据调研..."],
            "research_error": None,
            # 调研结果
            "research_data": None,
            # 生成的脚本
            "data_driven_scripts": None,
        }

        # 启动后台异步调研任务
        asyncio.create_task(self._run_data_driven_research(session_id))

        return session_id

    async def _run_data_driven_research(self, session_id: str):
        """后台异步执行三方向调研 + 脚本生成"""
        from .script_research_service import ScriptResearchService

        session = self.sessions.get(session_id)
        if not session:
            return

        research_service = ScriptResearchService()

        async def on_progress(message: str, progress: float):
            """进度回调 — 更新session状态"""
            if session_id in self.sessions:
                s = self.sessions[session_id]
                s["research_progress"] = progress
                s["research_details"].append(message)
                # 保留最近20条明细
                if len(s["research_details"]) > 20:
                    s["research_details"] = s["research_details"][-20:]

                # 更新phase
                if progress < 0.3:
                    s["research_phase"] = "searching"
                elif progress < 0.7:
                    s["research_phase"] = "analyzing"
                elif progress < 0.95:
                    s["research_phase"] = "generating"
                else:
                    s["research_phase"] = "done"

        try:
            # Phase 1: 三方向并行调研
            research_result = await research_service.research(
                product_name=session["product_name"],
                industry=session["industry"],
                product_detail=session["product_detail"],
                on_progress=on_progress,
            )

            session["research_data"] = research_result.to_dict()

            # Phase 2: 基于调研结果生成3个方向的脚本
            await on_progress("正在生成3个数据驱动脚本...", 0.90)

            scripts = await self._generate_data_driven_scripts(session_id, research_result)
            session["data_driven_scripts"] = scripts

            session["research_phase"] = "done"
            session["research_progress"] = 1.0
            session["research_details"].append("三方向脚本生成完成!")

            logger.info(f"[数据驱动V3] 会话 {session_id} 调研+生成完成, {len(scripts)}个脚本")

        except Exception as e:
            logger.error(f"[数据驱动V3] 会话 {session_id} 调研失败: {e}", exc_info=True)
            session["research_phase"] = "error"
            session["research_error"] = str(e)
            session["research_details"].append(f"调研失败: {str(e)}")

    async def _generate_data_driven_scripts(self, session_id: str, research_result) -> List[Dict]:
        """基于调研数据生成3个方向的脚本"""
        session = self.sessions[session_id]
        product_name = session["product_name"]
        product_detail = session.get("product_detail", "")
        industry = session.get("industry", "")
        target_duration = session.get("target_duration", 60)

        scripts = []

        # 方向A: 同行业模仿
        script_a = await self._gen_script_from_industry(
            research_result.industry, product_name, industry, product_detail, target_duration
        )
        script_a["script_id"] = 0
        script_a["direction"] = "industry"
        script_a["direction_label"] = "同行业模仿"
        scripts.append(script_a)

        # 方向B: 评论区需求
        script_b = await self._gen_script_from_comments(
            research_result.comments, product_name, industry, product_detail, target_duration
        )
        script_b["script_id"] = 1
        script_b["direction"] = "comments"
        script_b["direction_label"] = "评论区需求"
        scripts.append(script_b)

        # 方向C: 跨行业创意迁移
        script_c = await self._gen_script_from_creative(
            research_result.creative, product_name, industry, product_detail, target_duration
        )
        script_c["script_id"] = 2
        script_c["direction"] = "creative"
        script_c["direction_label"] = "创意迁移"
        scripts.append(script_c)

        return scripts

    async def _gen_script_from_industry(
        self, industry_data, product_name, industry, product_detail, target_duration
    ) -> Dict:
        """方向A: 基于同行业DNA重组+变异生成脚本"""
        ref_videos = []
        analyses = industry_data.analyses if hasattr(industry_data, 'analyses') else industry_data.get("analyses", [])
        for a in analyses[:3]:
            if isinstance(a, dict):
                ref_videos.append({
                    "title": a.get("title", "")[:50],
                    "play_count": a.get("play_count", 0),
                    "digg_count": a.get("digg_count", 0),
                })

        # 优先使用结构化DNA
        structured_dna = industry_data.structured_dna if hasattr(industry_data, 'structured_dna') else industry_data.get("structured_dna", {})
        success_patterns = industry_data.success_patterns if hasattr(industry_data, 'success_patterns') else industry_data.get("success_patterns", "")

        # 构建DNA上下文
        dna_context = ""
        if structured_dna:
            import json
            # 提取关键DNA信息
            if structured_dna.get("proven_structures"):
                dna_context += "验证过的结构模式:\n"
                for s in structured_dna["proven_structures"][:2]:
                    dna_context += f"- {s.get('name', '')}: {' → '.join(s.get('beat_sequence', [])[:5])}\n"
            if structured_dna.get("hook_arsenal"):
                dna_context += "有效钩子:\n"
                for h in structured_dna["hook_arsenal"][:2]:
                    dna_context += f"- {h.get('type', '')}: {h.get('example', '')[:60]}\n"
            if structured_dna.get("selling_insertion_playbook"):
                dna_context += "卖点植入:\n"
                for p in structured_dna["selling_insertion_playbook"][:2]:
                    dna_context += f"- {p.get('method', '')}, 时机: {p.get('best_timing', '')}\n"
            if structured_dna.get("speaking_dna"):
                sd = structured_dna["speaking_dna"]
                dna_context += f"口播DNA: {sd.get('common_tone', '')}, 碎片: {', '.join(sd.get('effective_fragments', [])[:3])}\n"
            if structured_dna.get("mutation_opportunities"):
                dna_context += "变异机会:\n"
                for m in structured_dna["mutation_opportunities"][:2]:
                    dna_context += f"- {m.get('gap', '')} → {m.get('opportunity', '')}\n"
            if structured_dna.get("recommended_skeleton"):
                sk = structured_dna["recommended_skeleton"]
                dna_context += f"推荐骨架: {sk.get('structure', '')}\n变异点: {sk.get('mutation_point', '')}\n"
        else:
            # 回退到清理后的文本
            videos_context = ""
            for i, a in enumerate(analyses[:3], 1):
                if isinstance(a, dict):
                    title = self._clean_for_prompt(a.get('title', ''), 50)
                    asr = self._clean_for_prompt(a.get('asr_text', ''), 150)
                    deep = self._clean_for_prompt(a.get('deep_analysis', ''), 200)
                    videos_context += f"视频{i}({a.get('play_count', 0)}播放): {title}\n口播: {asr}\n拆解: {deep}\n\n"
            clean_patterns = self._clean_for_prompt(success_patterns, 400) if success_patterns else "（暂无）"
            dna_context = f"参考视频:\n{videos_context}\n成功模式: {clean_patterns}"

        prompt = f"""你是顶级带货脚本编剧+爆款DNA重组专家。

以下是从同品类爆款视频中提取的结构DNA:
{self._clean_for_prompt(dna_context, 800)}

任务: 用这套DNA为"{product_name}"重组一个{target_duration}秒种草脚本，并在关键节拍注入一个变异点
行业: {industry}
产品详情: {product_detail or '无'}

DNA重组规则:
1. 用验证过的结构骨架（已被爆款证明有效的节奏）
2. 用验证过的钩子类型（但换成全新的内容）
3. 用验证过的卖点植入时机和方式
4. 口播学习DNA中的语气和口语碎片风格
5. 在推荐的变异点注入一个新颖创意（这是超越竞品的关键）
6. 6-8个镜头，总时长约{target_duration}秒

直接输出JSON数组，不要其他文字:
[{{"shot_id":1,"shot_type":"opening","narration":"中文口播","visual_description":"English scene description","duration":5}}]"""

        shots = await self._generate_script_with_retry(prompt, product_name, target_duration, "方向A")

        total_dur = sum(s.get("duration", 5) for s in shots)
        data_source = f"基于同行业{len(ref_videos)}个爆款视频的DNA重组+变异"
        if ref_videos:
            data_source += f"（最高{max(v.get('play_count',0) for v in ref_videos)}播放）"

        return {
            "name": f"DNA重组 — {product_name}",
            "data_source": data_source,
            "reference_videos": ref_videos,
            "shots": shots,
            "total_duration": total_dur,
            "selling_points": [],
            "quality_report": {},
        }

    async def _gen_script_from_comments(
        self, comments_data, product_name, industry, product_detail, target_duration
    ) -> Dict:
        """方向B: 基于评论区争议+情绪冲突生成审判式脚本"""
        cluster_analysis = comments_data.cluster_analysis if hasattr(comments_data, 'cluster_analysis') else comments_data.get("cluster_analysis", "")
        total_comments = comments_data.total_comments if hasattr(comments_data, 'total_comments') else comments_data.get("total_comments", 0)
        controversy = comments_data.controversy_topic if hasattr(comments_data, 'controversy_topic') else comments_data.get("controversy_topic", "")
        hook_comments = comments_data.real_comments_for_hook if hasattr(comments_data, 'real_comments_for_hook') else comments_data.get("real_comments_for_hook", [])

        clean_cluster = self._clean_for_prompt(cluster_analysis, 800) if cluster_analysis else "（暂无）"
        controversy_text = self._clean_for_prompt(controversy, 200) if controversy else ""
        hooks_text = "\n".join(f"- {c}" for c in hook_comments[:3]) if hook_comments else ""

        prompt = f"""你是顶级带货脚本编剧+评论区情绪操盘手。

评论区深度分析（来自{total_comments}条真实评论）:
{clean_cluster}
"""
        if controversy_text:
            prompt += f"\n最具争议的话题: {controversy_text}\n"
        if hooks_text:
            prompt += f"\n可做钩子的真实评论:\n{hooks_text}\n"

        prompt += f"""
任务: 为"{product_name}"写一个{target_duration}秒的「审判式」种草脚本
行业: {industry}
产品详情: {product_detail or '无'}

脚本叙事结构（审判式翻盘）:
1. 开头: 直接引用评论区的质疑/争议作为钩子（如"评论区有人说XXX，今天我当面验证"）
2. 升级: 搬出实验/数据/对比，制造紧张感
3. 翻盘: 结果出乎意料，打脸质疑者
4. 升华: 重新定义产品价值，输出态度

关键要求:
- 第一句话必须引用真实评论或争议话题，不要用"很多人问我"这种温吞开头
- 口播带情绪、有立场，像在给产品做"公审"
- 用可视化实验/对比来证明，不是空口说教
- 结尾要有态度输出，不只是"买它"
- 6-8个镜头，总时长约{target_duration}秒

直接输出JSON数组，不要其他文字:
[{{"shot_id":1,"shot_type":"opening","narration":"中文口播","visual_description":"English scene description","duration":5}}]"""

        shots = await self._generate_script_with_retry(prompt, product_name, target_duration, "方向B")

        total_dur = sum(s.get("duration", 5) for s in shots)
        data_source = f"基于{total_comments}条评论的争议挖掘+审判式叙事"
        if controversy_text:
            data_source += f"（核心争议: {controversy_text[:30]}）"

        return {
            "name": f"评论区审判 — {product_name}",
            "data_source": data_source,
            "reference_videos": [],
            "shots": shots,
            "total_duration": total_dur,
            "selling_points": [],
            "quality_report": {},
        }

    async def _gen_script_from_creative(
        self, creative_data, product_name, industry, product_detail, target_duration
    ) -> Dict:
        """方向C: 基于创意博主机制拆解+结构同构迁移生成脚本"""
        creative_patterns = creative_data.creative_patterns if hasattr(creative_data, 'creative_patterns') else creative_data.get("creative_patterns", "")
        migration_ideas = creative_data.migration_ideas if hasattr(creative_data, 'migration_ideas') else creative_data.get("migration_ideas", "")
        creator_info = creative_data.creator_info if hasattr(creative_data, 'creator_info') else creative_data.get("creator_info", [])

        ref_videos = []
        analyses = creative_data.analyses if hasattr(creative_data, 'analyses') else creative_data.get("analyses", [])
        for a in analyses[:3]:
            if isinstance(a, dict):
                ref_videos.append({
                    "title": a.get("title", "")[:50],
                    "play_count": a.get("play_count", 0),
                    "digg_count": a.get("digg_count", 0),
                })

        clean_patterns = self._clean_for_prompt(creative_patterns, 600) if creative_patterns else "（暂无）"
        clean_migration = self._clean_for_prompt(migration_ideas, 400) if migration_ideas else ""

        # 构建创意博主上下文
        creator_context = ""
        if creator_info:
            for c in creator_info[:2]:
                creator_context += f"灵感博主: {c.get('name', '')}, 类型: {c.get('category', '')}, 招牌手法: {c.get('signature_device', '')}\n"

        prompt = f"""你是顶级创意迁移大师。你的任务是找到创意机制和产品属性之间的「结构同构」，创造哇哦时刻。

创意机制拆解（来自创意博主的爆款视频）:
{clean_patterns}
{creator_context}"""

        if clean_migration:
            prompt += f"\n迁移方案参考:\n{clean_migration}\n"

        prompt += f"""
目标产品: "{product_name}" ({industry})
产品详情: {product_detail or '无'}

请完成两步思考（在脑中完成，不要输出思考过程）:

第1步 - 找产品可放大属性:
"{product_name}"的哪个物理/功效/情感属性可以被极端化或可视化？
（例: 防水→泡水测试, 修复→破坏再修复, 美白→前后对比）

第2步 - 结构同构匹配:
哪个创意博主的机制模板能承载这个属性的放大？
（例: 极致实验机制 x 产品防水属性 = 把产品扔进极端环境）

基于以上思考，直接输出脚本JSON:
- 创意装置必须让观众觉得"这个角度我没想到"
- 不到最后不能看出是在卖什么（泰式悬念优先）
- 口播有趣有个性，不像广告
- 6-8个镜头，总时长约{target_duration}秒

直接输出JSON数组，不要其他文字:
[{{"shot_id":1,"shot_type":"opening","narration":"中文口播","visual_description":"English scene description","duration":5}}]"""

        shots = await self._generate_script_with_retry(prompt, product_name, target_duration, "方向C")

        total_dur = sum(s.get("duration", 5) for s in shots)

        inspiration_source = ""
        if creator_info:
            names = [c.get("name", "") for c in creator_info[:2]]
            inspiration_source = f"灵感来自{'/'.join(names)}的创意机制 × 产品属性同构迁移"
        elif ref_videos:
            inspiration_source = f"灵感来自{len(ref_videos)}个创意博主的机制拆解"

        return {
            "name": f"创意同构 — {product_name}",
            "data_source": inspiration_source or "创意博主机制 × 产品属性结构同构",
            "reference_videos": ref_videos,
            "shots": shots,
            "total_duration": total_dur,
            "selling_points": [],
            "quality_report": {},
        }

    @staticmethod
    def _clean_for_prompt(text: str, max_len: int = 300) -> str:
        """清理文本用于嵌入prompt，去除可能干扰JSON解析的字符"""
        if not text:
            return "（无）"
        import re
        # 去除markdown标记
        text = re.sub(r'```[\s\S]*?```', '', text)
        text = re.sub(r'[#*`]', '', text)
        # 去除多余空行
        text = re.sub(r'\n{3,}', '\n\n', text)
        return text[:max_len].strip() or "（无）"

    async def _generate_script_with_retry(
        self, prompt: str, product_name: str, target_duration: int, label: str
    ) -> List[Dict]:
        """生成脚本JSON，失败时自动重试（简化prompt）"""
        # 第一次尝试：完整prompt
        for attempt in range(2):
            try:
                result_text = await self.gemini.generate(prompt, max_tokens=4096)
                logger.info(f"[{label}] Gemini返回 {len(result_text)} 字符, 前200: {result_text[:200]}")
                shots = self._parse_json_response(result_text)
                if isinstance(shots, list) and len(shots) >= 3:
                    # 验证每个shot有必要字段
                    valid = True
                    for s in shots:
                        if not s.get("narration") or s.get("narration", "").startswith("镜头"):
                            valid = False
                            break
                    if valid:
                        logger.info(f"[{label}] 脚本解析成功: {len(shots)}个镜头")
                        return shots
                    else:
                        logger.warning(f"[{label}] 脚本内容无效(含占位符), 重试...")
                else:
                    logger.warning(f"[{label}] 解析结果非列表或太少: {type(shots).__name__}, 重试...")
            except Exception as e:
                logger.error(f"[{label}] 第{attempt+1}次生成失败: {e}, 原文前200字: {result_text[:200] if 'result_text' in dir() else 'N/A'}")

            if attempt == 0:
                # 第二次尝试：极简prompt，确保JSON输出
                logger.info(f"[{label}] 用简化prompt重试...")
                prompt = f"""为"{product_name}"写一个{target_duration}秒短视频种草脚本。设计一个创意装置（实验/对比/故事），口播自然像博主说话。6-8个镜头。

只输出JSON数组:
[{{"shot_id":1,"shot_type":"opening","narration":"中文口播","visual_description":"English scene","duration":5}},{{"shot_id":2,...}}]"""

        logger.error(f"[{label}] 两次生成均失败，使用fallback")
        return self._fallback_shots(product_name, target_duration)

    def get_research_status(self, session_id: str) -> Dict:
        """获取调研进度状态"""
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话 {session_id} 不存在")

        return {
            "session_id": session_id,
            "phase": session.get("research_phase", "unknown"),
            "progress": session.get("research_progress", 0.0),
            "details": session.get("research_details", []),
            "error": session.get("research_error"),
        }

    def get_research_result(self, session_id: str) -> Dict:
        """获取调研结果（调研完成后调用）"""
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话 {session_id} 不存在")

        if session.get("research_phase") != "done":
            raise ValueError(f"调研尚未完成，当前状态: {session.get('research_phase')}")

        return {
            "session_id": session_id,
            "scripts": session.get("data_driven_scripts", []),
            "research_data": session.get("research_data", {}),
        }

    async def select_data_driven_script(self, session_id: str, script_id: int) -> Dict:
        """
        选择数据驱动脚本并创建项目

        Args:
            session_id: 会话ID
            script_id: 脚本ID (0, 1, 2)

        Returns:
            {project_id, title, shots, shot_count, total_duration}
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话 {session_id} 不存在")

        scripts = session.get("data_driven_scripts", [])
        selected = None
        for s in scripts:
            if s.get("script_id") == script_id:
                selected = s
                break

        if not selected:
            raise ValueError(f"脚本 {script_id} 不存在")

        # 创建项目目录
        project_id = f"video_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        project_dir = OUTPUTS_DIR / project_id
        project_dir.mkdir(parents=True, exist_ok=True)

        shots = selected.get("shots", [])
        # 确保shot_id为int
        for i, shot in enumerate(shots):
            shot["shot_id"] = i + 1

        total_duration = sum(s.get("duration", 5) for s in shots)

        # 写入metadata.json
        metadata = {
            "title": selected.get("name", "数据驱动脚本"),
            "topic": session["product_name"],
            "product_name": session["product_name"],
            "target_duration": session["target_duration"],
            "total_duration": total_duration,
            "shot_count": len(shots),
            "shots": shots,
            "selling_points": selected.get("selling_points", []),
            "quality_check": selected.get("quality_report", {}),
            "generation_stage": "script",
            "data_driven": {
                "session_id": session_id,
                "direction": selected.get("direction", ""),
                "direction_label": selected.get("direction_label", ""),
                "data_source": selected.get("data_source", ""),
                "reference_videos": selected.get("reference_videos", []),
            },
            "created_at": datetime.now().isoformat(),
        }

        metadata_path = project_dir / "metadata.json"
        with open(metadata_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, ensure_ascii=False, indent=2)

        logger.info(f"[数据驱动V3] 项目创建: {project_id}, {len(shots)}镜头, {total_duration}秒")

        return {
            "project_id": project_id,
            "title": metadata["title"],
            "shots": shots,
            "shot_count": len(shots),
            "total_duration": total_duration,
            "direction": selected.get("direction", ""),
            "direction_label": selected.get("direction_label", ""),
            "data_source": selected.get("data_source", ""),
        }

    # ==================== 深度模式: 创意工作室 ====================

    async def deep_chat_with_tools(
        self, session_id: str, message: str, chat_history: List[Dict]
    ) -> Dict:
        """
        深度模式对话：带工具调用能力的AI对话

        AI可以调用搜索抖音、搜索小红书、分析视频、获取热点、网页搜索等工具，
        也可以直接生成脚本。

        Returns:
            {response, tool_used, tool_data, script_ready}
        """
        if session_id not in self.sessions:
            self.sessions[session_id] = {
                "mode": "deep",
                "deep_context": {"messages": [], "tool_results": [], "inspirations": []},
                "created_at": datetime.now().isoformat(),
            }

        session = self.sessions[session_id]
        deep_ctx = session.setdefault("deep_context", {"messages": [], "tool_results": [], "inspirations": []})

        # 记录用户消息
        deep_ctx["messages"].append({"role": "user", "content": message})

        # ── 自动提取产品/行业信息存入 session ──
        if not session.get("product_name") or not session.get("industry"):
            self._try_extract_product_industry(message, session)

        # ── 检查是否有上一轮遗留的 pending_tool（用户正在补充信息） ──
        pending_tool = session.pop("pending_tool", None)
        tool_intent = self._detect_tool_intent(message)

        if pending_tool and not tool_intent:
            # 用户的回复是对上一轮 need_input 的补充，用当前消息作为关键词重跑那个工具
            tool_intent = pending_tool

        if tool_intent:
            tool_result = await self._execute_deep_tool(tool_intent, message, session)

            # 如果工具又返回 need_input，继续挂起
            if tool_result.get("data", {}).get("need_input"):
                session["pending_tool"] = tool_intent

            deep_ctx["tool_results"].append(tool_result)
            deep_ctx["messages"].append({"role": "assistant", "content": tool_result.get("summary", "")})
            return {
                "response": tool_result.get("summary", ""),
                "tool_used": tool_result.get("tool", ""),
                "tool_data": tool_result.get("data", {}),
                "script_ready": False,
            }

        # 无工具意图 → 让AI自由对话，同时检测是否要求生成脚本
        generate_intent = any(kw in message for kw in ["出脚本", "生成脚本", "写脚本", "开始生成", "就这个方向"])

        # 构建对话上下文
        tool_context = ""
        if deep_ctx["tool_results"]:
            recent_tools = deep_ctx["tool_results"][-3:]
            tool_context = "\n\n之前的调研数据:\n" + "\n".join(
                f"- [{r.get('tool', '')}] {r.get('summary', '')[:200]}" for r in recent_tools
            )

        chat_text = "\n".join(
            f"{'用户' if m['role'] == 'user' else 'AI'}: {m['content']}"
            for m in chat_history[-10:]
        )

        prompt = f"""你是短视频创意工作室的AI顾问。你正在和用户讨论视频脚本创意。

对话历史:
{chat_text}
{tool_context}

用户最新消息: {message}

请自然地回应用户。你可以:
1. 讨论创意方向和想法
2. 提供专业建议
3. 如果用户想搜索数据，告诉他们可以说"帮我搜XXX"
4. 如果用户确定了方向想生成脚本，回应确认

回复要简洁专业，不超过200字。回复中不要提及播放量、点赞量、评论数等视频热度数据。"""

        try:
            response = await self.gemini.generate(prompt, model_override="gemini-3.1-pro-preview")
            if not response or not str(response).strip():
                response = "我理解你的想法了。你可以告诉我更多细节，或者说'帮我搜一下相关视频'来获取灵感。"
        except Exception as e:
            logger.warning(f"深度对话Gemini失败: {e}")
            response = (
                "抱歉，AI 服务暂时繁忙，请稍后重试。"
                "你也可以试试快捷指令：'帮我找灵感'、'搜索爆款视频'、'分析竞品链接'。"
            )

        deep_ctx["messages"].append({"role": "assistant", "content": response})

        return {
            "response": response,
            "tool_used": None,
            "tool_data": None,
            "script_ready": generate_intent,
        }

    async def _filter_hot_topics_by_product(
        self, topics: List[Dict], product: str
    ) -> List[Dict]:
        """根据产品关键词从全量热搜中筛选最相关的 Top10"""
        if not topics:
            return []
        if len(topics) <= 10:
            return topics[:10]
        try:
            titles = [t.get("title", "") for t in topics[:50]]
            prompt = f"""产品/服务: {product}

以下是抖音热搜列表（按热度排序）:
{chr(10).join(f"{i+1}. {t}" for i, t in enumerate(titles))}

请从上述热搜中选出与「{product}」最相关的10条（可用于内容创作、蹭热点、借势营销）。按相关性从高到低排序，返回JSON数组，格式如 ["热搜1", "热搜2", ...]。只返回数组，不要其他文字。"""
            resp = await self.gemini.generate(prompt, max_tokens=500, model_override="gemini-3.1-pro-preview")
            if not resp or not resp.strip():
                return topics[:10]
            import json
            resp = resp.strip()
            if resp.startswith("```"):
                resp = resp.split("\n", 1)[-1].rsplit("```", 1)[0].strip()
            selected = json.loads(resp)
            if not isinstance(selected, list) or len(selected) == 0:
                return topics[:10]
            result = []
            seen = set()
            for i, title in enumerate(selected[:10]):
                title = str(title).strip() if title else ""
                if not title or title in seen:
                    continue
                seen.add(title)
                matched = False
                for t in topics:
                    tt = t.get("title", "")
                    if tt == title or title in tt or tt in title:
                        result.append({**t, "position": len(result) + 1})
                        matched = True
                        break
                if not matched:
                    result.append({"title": title, "hot_value": 0, "position": len(result) + 1})
            if len(result) < 10:
                for t in topics:
                    if t.get("title", "") not in seen and len(result) < 10:
                        result.append({**t, "position": len(result) + 1})
                        seen.add(t.get("title", ""))
            return result[:10]
        except Exception as e:
            logger.warning(f"按产品筛选热搜失败: {e}")
            return topics[:10]

    # ── 行业关键词映射表 ──
    _INDUSTRY_KEYWORDS = {
        "美妆护肤": ["美妆", "护肤", "化妆品", "面膜", "精华", "防晒", "口红", "粉底", "美白", "祛痘", "乳液", "面霜", "卸妆", "彩妆"],
        "食品饮料": ["食品", "饮料", "零食", "保健", "奶茶", "咖啡", "茶叶", "酒", "营养", "代餐", "蛋白粉"],
        "数码3C": ["数码", "3c", "手机", "电脑", "耳机", "键盘", "相机", "平板", "充电", "智能手表", "音箱"],
        "服装鞋包": ["服装", "穿搭", "鞋", "包", "衣服", "裤子", "外套", "运动鞋", "女装", "男装"],
        "家居生活": ["家居", "家电", "厨房", "收纳", "清洁", "床品", "灯具", "沙发", "装修"],
        "教育培训": ["教育", "培训", "课程", "考研", "考公", "英语", "编程", "学习", "网课", "知识付费"],
        "母婴": ["母婴", "宝宝", "婴儿", "奶粉", "纸尿裤", "儿童", "孕妇", "早教", "辅食"],
        "宠物": ["宠物", "猫", "狗", "猫粮", "狗粮", "宠物零食", "宠物用品"],
        "汽车": ["汽车", "车", "新能源", "电车", "suv", "自驾"],
        "健身运动": ["健身", "运动", "瑜伽", "减脂", "增肌", "跑步", "蛋白粉"],
    }

    def _try_extract_product_industry(self, message: str, session: Dict):
        """
        从用户消息中提取产品名和行业，存入 session。
        规则：
        1. "我做XX" / "我们是XX" / "我卖XX" → 提取 XX 为产品/行业
        2. 消息中命中行业关键词表 → 设置 industry
        3. 去掉行业词后剩余部分作为 product_name 候选
        """
        import re as _re
        msg = message.strip()

        # 模式1: "我做美妆护肤" / "我们卖面膜" / "产品是智能手表"
        m = _re.search(r"(?:我做|我们做|我卖|我们卖|我是做|产品是|品牌是|主营)\s*(.+)", msg)
        if m:
            extracted = m.group(1).strip().rstrip("的了呢吗哦啊")
            # 先查行业表
            for industry, keywords in self._INDUSTRY_KEYWORDS.items():
                if any(kw in extracted for kw in keywords) or extracted == industry:
                    session["industry"] = industry
                    # 去掉行业名看是否还有更具体的产品词
                    remainder = extracted.replace(industry, "").strip()
                    if len(remainder) >= 2:
                        session["product_name"] = remainder
                    elif not session.get("product_name"):
                        session["product_name"] = extracted
                    return
            # 没匹配到行业表，整段作为产品名
            if len(extracted) >= 2:
                session["product_name"] = extracted
            return

        # 模式2: 消息中散落着行业/产品关键词
        msg_lower = msg.lower()
        for industry, keywords in self._INDUSTRY_KEYWORDS.items():
            for kw in keywords:
                if kw in msg_lower:
                    if not session.get("industry"):
                        session["industry"] = industry
                    if not session.get("product_name") and len(kw) >= 2:
                        session["product_name"] = kw
                    return

    async def _gemini_search_xiaohongshu(self, keyword: str, count: int = 10) -> List[Dict]:
        """用 Gemini 联网搜索小红书笔记（TikHub 不可用时的备用方案）"""
        ask = min(count, 8)
        prompt = f"""搜索小红书(xiaohongshu.com)上关于「{keyword}」的热门笔记，返回{ask}篇。

严格输出JSON数组，每项字段：
- title: 笔记标题
- desc: 内容摘要(30字内)
- liked_count: 点赞数
- author: 作者昵称
- type: "normal"或"video"
- reason: 推荐理由(10字内，如"高赞种草""真实测评""高转化""互动率高""专业成分分析"等)
- url: 笔记链接(如有，格式为 https://www.xiaohongshu.com/explore/笔记ID，没有则留空字符串)

只输出JSON数组，无其他文字。"""

        try:
            raw = await self.gemini.generate(
                prompt,
                temperature=0.3,
                max_tokens=4096,
                enable_search=True,
            )
            parsed = GeminiClient._extract_json(raw)
            if isinstance(parsed, list) and len(parsed) > 0:
                logger.info(f"Gemini联网搜索小红书成功: {len(parsed)}篇笔记")
                return parsed[:count]
            logger.warning(f"Gemini联网搜索小红书解析失败: {raw[:200]}")
            return []
        except Exception as e:
            logger.error(f"Gemini联网搜索小红书异常: {e}")
            return []

    def _detect_tool_intent(self, message: str) -> Optional[str]:
        """从用户消息中检测工具调用意图"""
        msg = message.lower()

        # 搜索抖音视频
        if any(kw in msg for kw in ["搜抖音", "搜视频", "搜一下", "找视频", "爆款视频", "搜索视频"]):
            return "search_douyin"

        # 搜索小红书
        if any(kw in msg for kw in ["搜小红书", "搜笔记", "小红书", "xhs"]):
            return "search_xiaohongshu"

        # 获取热点（排除"用XX热点设计方案"这类对话）
        if any(kw in msg for kw in ["热点", "热搜", "热门话题", "trending"]):
            if not any(kw in msg for kw in ["设计", "方案", "创意", "怎么用", "怎么蹭", "用「", "用这个"]):
                return "get_hot_topics"

        # 分析视频链接
        if any(kw in msg for kw in ["分析", "拆解", "拆一下"]) and any(c.isdigit() for c in msg):
            return "analyze_video"

        # 网页搜索
        if any(kw in msg for kw in ["搜一搜", "查一下", "搜网上", "最新消息", "行业报告"]):
            return "search_web"

        # 找灵感（并行多数据源）
        if any(kw in msg for kw in ["找灵感", "灵感", "创意角度", "帮我找", "给我灵感"]):
            return "get_inspiration"

        # 热点创意方案设计（用XX热点为XX设计方案）
        if any(kw in msg for kw in ["设计", "方案", "创意"]) and any(kw in msg for kw in ["热点", "热门", "趋势"]):
            return "design_trend_plan"

        return None

    async def _execute_deep_tool(self, tool: str, message: str, session: Dict) -> Dict:
        """执行深度模式工具调用"""
        import re

        # 从消息中提取关键词
        keyword = re.sub(r"(帮我|请|搜|一下|搜索|找|分析|拆解|查|看看|爆款|视频|方向)", "", message).strip()
        if not keyword:
            keyword = session.get("product_name", "")

        try:
            if tool == "search_douyin":
                # 判断是否有实际搜索关键词（去掉指令词后是否为空）
                generic_words = {"爆款视频", "视频", "抖音", "爆款", "抖音热点", "同类", "高播放", "内容", ""}
                real_keyword = keyword.strip()
                if real_keyword in generic_words or len(real_keyword) < 2:
                    # 没有实际关键词 → 引导用户提供
                    return {
                        "tool": "search_douyin",
                        "summary": "我来帮你搜爆款视频！先告诉我：\n\n"
                                   "1️⃣ 你想搜什么？（产品名/行业/关键词，如：面膜、宠物用品、健身）\n\n"
                                   "2️⃣ 你想看哪种爆款？",
                        "data": {
                            "need_input": True,
                            "viral_types": [
                                {"id": "low_fan", "name": "🔥 低粉爆款", "desc": "粉丝<1万但播放量超10万，内容本身有爆发力，最适合新号对标学习"},
                                {"id": "recent_hot", "name": "📈 近期火爆", "desc": "最近发布且快速起量，反映当下用户兴趣热点"},
                                {"id": "high_engage", "name": "💬 高互动", "desc": "评论/收藏异常高，说明内容引发了强烈共鸣或争议"},
                                {"id": "top_like", "name": "❤️ 点赞之王", "desc": "纯点赞量排序，行业内影响力最大的内容"},
                            ],
                        },
                    }

                # 识别爆款类型
                viral_type = "top_like"  # 默认: 点赞最高
                if any(kw in message for kw in ["低粉", "小号", "新号", "素人"]):
                    viral_type = "low_fan"
                elif any(kw in message for kw in ["近期", "最新", "最近", "这几天", "本周"]):
                    viral_type = "recent_hot"
                elif any(kw in message for kw in ["互动", "评论", "收藏", "转发", "讨论"]):
                    viral_type = "high_engage"

                # 根据类型选择排序方式
                sort_type = 1  # 默认按点赞排序
                count = 20
                if viral_type == "recent_hot":
                    sort_type = 2  # 按最新排序

                videos = await self.tikhub.search_videos(real_keyword, count=count, sort_type=sort_type)

                # 根据爆款类型二次筛选
                type_label = "点赞之王"
                if viral_type == "low_fan":
                    type_label = "低粉爆款"
                    # 低粉爆款: 播放量>10万 且 互动率高
                    scored = []
                    for v in videos:
                        plays = v.get("play_count", 0) or 0
                        likes = v.get("digg_count", 0) or 0
                        comments = v.get("comment_count", 0) or 0
                        if plays < 100000:
                            continue
                        engage_rate = round((likes + comments * 3) / max(plays, 1) * 100, 2)
                        v["engage_rate"] = engage_rate
                        v["viral_tag"] = f"互动率{engage_rate}%"
                        scored.append(v)
                    scored.sort(key=lambda v: v.get("engage_rate", 0), reverse=True)
                    videos = scored if scored else videos
                elif viral_type == "recent_hot":
                    type_label = "近期火爆"
                    # 按播放量筛选近期视频
                    for v in videos:
                        plays = v.get("play_count", 0) or 0
                        v["viral_tag"] = f"播放{plays//10000}万" if plays >= 10000 else f"播放{plays}"
                    videos.sort(key=lambda v: v.get("play_count", 0), reverse=True)
                elif viral_type == "high_engage":
                    type_label = "高互动"
                    for v in videos:
                        comments = v.get("comment_count", 0) or 0
                        shares = v.get("share_count", 0) or 0
                        v["viral_tag"] = f"评论{comments} 转发{shares}"
                    videos.sort(key=lambda v: (v.get("comment_count", 0) + v.get("share_count", 0) * 2), reverse=True)
                else:
                    type_label = "点赞之王"
                    for v in videos:
                        likes = v.get("digg_count", 0) or 0
                        v["viral_tag"] = f"点赞{likes//10000}万" if likes >= 10000 else f"点赞{likes}"

                top_videos = videos[:8]
                summary = f"为「{real_keyword}」找到{len(top_videos)}条{type_label}视频："
                return {
                    "tool": "search_douyin",
                    "summary": summary,
                    "data": {
                        "videos": top_videos,
                        "keyword": real_keyword,
                        "viral_type": viral_type,
                        "viral_label": type_label,
                        "total": len(videos),
                    },
                }

            elif tool == "search_xiaohongshu":
                generic_xhs = {"小红书", "笔记", "搜笔记", "搜小红书", "xhs", ""}
                real_kw = keyword.strip()
                if real_kw in generic_xhs or len(real_kw) < 2:
                    return {
                        "tool": "search_xiaohongshu",
                        "summary": (
                            "我来帮你搜小红书笔记！先告诉我你想搜什么：\n\n"
                            "输入产品名或关键词，比如：「搜小红书 美白面膜」「搜小红书 宠物零食」"
                        ),
                        "data": {"need_input": True},
                    }
                notes = await self.tikhub.search_xiaohongshu(real_kw, count=10)

                # TikHub 小红书端点不可用时，用 Gemini 联网搜索作为备用
                if not notes:
                    logger.info(f"TikHub小红书搜索无结果，使用Gemini联网搜索: {real_kw}")
                    notes = await self._gemini_search_xiaohongshu(real_kw)

                # 为缺少 reason 的笔记（如 TikHub 来源）补充推荐理由
                for n in notes:
                    if not n.get("reason"):
                        lc = n.get("liked_count", 0)
                        try:
                            lc_num = int(str(lc).replace(",", "").replace("万", "0000").replace("w", "0000"))
                        except (ValueError, TypeError):
                            lc_num = 0
                        if lc_num >= 10000:
                            n["reason"] = "高赞爆款"
                        elif lc_num >= 5000:
                            n["reason"] = "热门笔记"
                        elif lc_num >= 1000:
                            n["reason"] = "优质内容"
                        else:
                            n["reason"] = "相关推荐"

                top_notes = notes[:5]
                summary_parts = [f"找到{len(notes)}篇相关小红书笔记:"]
                for n in top_notes:
                    title = n.get("title", "")[:40]
                    summary_parts.append(f"  · {title}")
                return {
                    "tool": "search_xiaohongshu",
                    "summary": "\n".join(summary_parts),
                    "data": {"notes": top_notes, "keyword": keyword},
                }

            elif tool == "get_hot_topics":
                deep_ctx = session.get("deep_context", {})
                product = session.get("product_name", "")
                industry = session.get("industry", "")

                # ── 判定规则：产品/行业信息是否充足 ──
                # 1. session 里有明确 product_name 或 industry → 充足
                # 2. 用户本条消息自带产品/行业词（如"面膜热点""美妆热搜"）→ 从消息提取
                # 3. 对话历史中提到过产品 → 从历史提取
                # 4. 都没有 → 引导用户先说清楚
                if not product:
                    # 尝试从当前消息中提取产品/行业关键词
                    import re as _re
                    # 必须把所有指令词、平台词、语气词都剥干净，只留真正的产品/行业词
                    cleaned = _re.sub(
                        r"(热点|热搜|热门话题|热门|trending|帮我|请|看看|有哪些|推荐|相关"
                        r"|找|搜|搜索|查|给我|我要|我想|一下|看下|有没有"
                        r"|抖音|小红书|快手|视频|笔记|话题|内容|行业"
                        r"|的|了|吗|呢|啊|哦|吧)",
                        "", message
                    ).strip()
                    # 清洗后还剩>=2字的实词才算有效产品关键词
                    if len(cleaned) >= 2:
                        product = cleaned

                if not product:
                    # 尝试从对话历史中回溯产品信息
                    for m in reversed(deep_ctx.get("messages", [])):
                        if m.get("role") == "user":
                            c = m.get("content", "")
                            # 跳过纯指令消息
                            if any(kw in c for kw in ["热点", "热搜", "找灵感", "搜视频", "搜小红书"]):
                                continue
                            if len(c) >= 3:
                                product = c[:30]
                                break

                if not product and not industry:
                    # 信息不足 → 引导用户先说清楚
                    return {
                        "tool": "get_hot_topics",
                        "summary": (
                            "我来帮你找适合蹭的热点！为了推荐更精准，先告诉我：\n\n"
                            "1️⃣ 你的产品/品牌是什么？（如：美白面膜、智能手表、宠物零食）\n"
                            "2️⃣ 所在行业？（如：美妆护肤、数码3C、食品饮料）\n\n"
                            "比如你可以说：「面膜 热点」「美妆行业热搜」「宠物用品有什么热门话题」"
                        ),
                        "data": {"need_input": True},
                    }

                # ── 信息充足：用 Gemini 联网搜索当前抖音流行梗/挑战/趋势 ──
                context_label = product or industry

                prompt = f"""请联网搜索当前抖音（Douyin/TikTok中国版）上正在流行的热门趋势，然后为「{context_label}」（{industry or '未明确行业'}）品牌找出 8-10 个可以借势的热点。

你需要搜索：
1. 抖音近期最火的梗、挑战、话题、流行文化现象
2. 近期热门的 BGM、拍摄手法、叙事模板
3. 「{context_label}」相关的借势营销案例

这里的「热点」是指：
✅ 抖音上正在流行的梗、挑战、文化现象（如之前的"刀盾狗""多巴胺穿搭""City不City""你是我的XX"等类似的）
✅ 可以跟「{context_label}」结合做创意短视频的趋势
✅ 近期热门的 BGM 和拍摄模板

不是指：
❌ 时政新闻、体育赛事、灾难事件
❌ {context_label}品类本身的产品内容（如面膜测评、面膜推荐——那是"爆款视频"不是"热点"）

每个热点的 marketing_angle 必须具体说明「{context_label}」怎么借势——比如"拍一条'给面膜做刀盾狗挑战'的搞笑视频"。

严格输出 JSON：
{{"intro": "1-2句总结当前抖音有哪些值得{context_label}借势的热点趋势", "topics": [{{"title": "热点/梗名称（8字内）", "hot_value": "热度描述", "marketing_angle": "{context_label}怎么蹭这个热点（25字内）", "search_keyword": "用于在抖音搜索该热点参考视频的精准关键词（如'素颜爆改妆容'而非泛泛的'爆改'）", "position": 序号}}]}}"""

                try:
                    raw = await self.gemini.generate(
                        prompt, model_override="gemini-3.1-pro-preview",
                        max_tokens=8192, temperature=0.7,
                        enable_search=True,
                    )
                    parsed = GeminiClient._extract_json(raw)
                    if not parsed or "topics" not in parsed:
                        logger.warning(f"热点JSON解析失败, raw[:500]: {raw[:500] if raw else 'empty'}")
                        raise ValueError("AI 未返回有效 JSON")

                    summary = parsed.get("intro", "").strip() or f"为「{context_label}」找到以下可借势的抖音热点："
                    marketing_topics = []
                    for i, t in enumerate(parsed["topics"][:10]):
                        marketing_topics.append({
                            "title": t.get("title", ""),
                            "hot_value": t.get("hot_value", ""),
                            "position": i + 1,
                            "marketing_angle": t.get("marketing_angle", ""),
                        })

                except Exception as e:
                    logger.error(f"热点借势分析失败: {e}", exc_info=True)
                    return {
                        "tool": "get_hot_topics",
                        "summary": f"热点搜索失败：{str(e)[:100]}，请稍后重试",
                        "data": {"topics": [], "context": context_label},
                    }

                return {
                    "tool": "get_hot_topics",
                    "summary": summary,
                    "data": {"topics": marketing_topics, "context": context_label},
                }

            elif tool == "analyze_video":
                # 从消息中提取视频ID
                import re
                video_id_match = re.search(r"(\d{18,20})", message)
                if video_id_match:
                    video_id = video_id_match.group(1)
                    from .video_analyzer import VideoAnalyzer
                    analyzer = VideoAnalyzer()
                    analysis = await analyzer.analyze_video(video_id)
                    return {
                        "tool": "analyze_video",
                        "summary": f"视频分析完成: {analysis.title[:30]}...\n结构拆解: {analysis.structure_analysis[:150] if analysis.structure_analysis else '分析中...'}",
                        "data": {
                            "title": analysis.title,
                            "play_count": analysis.play_count,
                            "structure_analysis": analysis.structure_analysis,
                            "creative_device": analysis.creative_device,
                        },
                    }
                return {
                    "tool": "analyze_video",
                    "summary": "请提供视频ID（18-20位数字），例如：帮我分析 7456789012345678901",
                    "data": {},
                }

            elif tool == "search_web":
                result = await self.tavily.search(keyword, max_results=5)
                summary = result.get("answer", result.get("summary", ""))
                sources = result.get("results", [])[:3]
                summary_parts = [f"网络搜索结果: {summary[:150]}"]
                for s in sources:
                    summary_parts.append(f"  · {s.get('title', '')[:40]}")
                return {
                    "tool": "search_web",
                    "summary": "\n".join(summary_parts),
                    "data": {"summary": summary, "sources": sources, "keyword": keyword},
                }

            elif tool == "get_inspiration":
                product = session.get("product_name", "") or keyword
                industry = session.get("industry", "")
                if not product:
                    # 从对话历史中提取产品名
                    deep_ctx = session.get("deep_context", {})
                    for m in deep_ctx.get("messages", [])[::-1]:
                        if m.get("role") == "user" and len(m.get("content", "")) > 4:
                            c = m["content"]
                            if not any(kw in c for kw in ["找灵感", "灵感", "帮我找"]):
                                product = c[:30]
                                break
                if not product:
                    return {
                        "tool": "get_inspiration",
                        "summary": (
                            "我来帮你找灵感！先告诉我你的产品或行业：\n\n"
                            "比如直接输入：「美白面膜」「智能手表」「宠物零食」\n"
                            "我会并行搜索抖音、小红书、热搜等多个数据源，帮你挖掘创意角度"
                        ),
                        "data": {"need_input": True},
                    }
                result = await self.deep_get_inspiration(
                    session_id="", product_name=product, industry=industry
                )
                inspirations = result.get("inspirations", [])
                raw_data = result.get("raw_data", {})
                summary_parts = [f"为「{product}」找到{len(inspirations)}个灵感角度:"]
                for ins in inspirations:
                    summary_parts.append(f"  · {ins.get('angle', '')}: {ins.get('suggested_hook', '')}")
                return {
                    "tool": "get_inspiration",
                    "summary": "\n".join(summary_parts),
                    "data": {
                        "inspirations": inspirations,
                        "hot_topics": raw_data.get("hot_topics", []),
                        "douyin_videos": raw_data.get("douyin_videos", []),
                        "xhs_notes": raw_data.get("xhs_notes", []),
                    },
                }

            elif tool == "design_trend_plan":
                import re as _re

                # 1. 提取热点名称（「」内）和产品名
                trend_match = _re.search(r"[「](.+?)[」]", message)
                trend_name = trend_match.group(1) if trend_match else keyword
                product_name = session.get("product_name", "")
                if not product_name:
                    prod_match = _re.search(r"为(.+?)(设计|创作)", message)
                    if prod_match:
                        product_name = prod_match.group(1).replace("的", "").replace("我", "").strip()
                if not product_name:
                    return {
                        "tool": "design_trend_plan",
                        "summary": "请先告诉我你的产品是什么，我好为你量身定制创意方案",
                        "data": {"need_input": True},
                    }

                # 2. 提取精准搜索词（前端通过【搜索词：xxx】传入）
                sk_match = _re.search(r"【搜索词[：:](.+?)】", message)
                search_kw = sk_match.group(1).strip() if sk_match else trend_name

                # 搜抖音获取热点参考视频
                ref_videos_raw = await self.tikhub.search_videos(search_kw, count=10, sort_type=1)
                ref_videos = []
                for v in sorted(ref_videos_raw, key=lambda x: x.get("digg_count", 0) or 0, reverse=True)[:5]:
                    if not (v.get("description") or "").strip():
                        continue
                    ref_videos.append({
                        "video_id": v.get("video_id", ""),
                        "description": (v.get("description", "") or "")[:80],
                        "cover_url": v.get("cover_url", ""),
                        "digg_count": v.get("digg_count", 0) or 0,
                        "video_url": v.get("video_url", ""),
                    })

                ref_summary = "\n".join(
                    f"- {v['description']} (点赞{v['digg_count']})"
                    for v in ref_videos
                ) or "（暂无参考视频）"

                # 3. AI 生成 3 个创意方案
                prompt = f"""你是顶级短视频创意总监。当前抖音热点「{trend_name}」正在流行。

客户产品：{product_name}

抖音上「{trend_name}」的参考爆款视频：
{ref_summary}

请为「{product_name}」设计3个借势「{trend_name}」热点的短视频创意方案。每个方案风格迥异。

严格输出JSON，所有文本不得包含**加粗标记：
{{"plans": [
  {{
    "title": "方案名称（6字以内）",
    "subtitle": "一句话概括创意核心（15字以内）",
    "hook": "开场钩子台词（20-30字，可直接拍）",
    "description": "详细创意说明：拍摄场景、演员表演、产品植入方式（80-120字）",
    "steps": ["步骤1：具体拍摄指导", "步骤2", "步骤3", "步骤4"],
    "style_tags": ["标签1", "标签2", "标签3"]
  }}
]}}

要求：
1. 3个方案风格差异大（搞笑/走心/悬疑/反转等）
2. 每个必须具体说明「{trend_name}」如何与「{product_name}」结合
3. hook是可直接拍的台词
4. steps是具体拍摄步骤，每步15-20字"""

                raw = await self.gemini.generate(
                    prompt, model_override="gemini-3.1-pro-preview",
                    max_tokens=8192, temperature=0.8,
                )
                parsed = GeminiClient._extract_json(raw)
                plans = parsed.get("plans", [])[:4] if isinstance(parsed, dict) else []

                # 清理 ** 标记
                for p in plans:
                    for key in ("title", "subtitle", "hook", "description"):
                        if key in p and isinstance(p[key], str):
                            p[key] = p[key].replace("**", "")
                    if "steps" in p:
                        p["steps"] = [s.replace("**", "") for s in p["steps"]]

                if not plans:
                    return {
                        "tool": "design_trend_plan",
                        "summary": (raw or "创意方案生成失败").replace("**", ""),
                        "data": {},
                    }

                summary = f"为「{product_name}」x「{trend_name}」设计了{len(plans)}个创意方案"
                return {
                    "tool": "design_trend_plan",
                    "summary": summary,
                    "data": {
                        "trend": trend_name,
                        "product": product_name,
                        "ref_videos": ref_videos,
                        "plans": plans,
                    },
                }

        except Exception as e:
            logger.error(f"深度模式工具执行失败 [{tool}]: {e}")
            return {
                "tool": tool,
                "summary": f"工具调用失败: {str(e)[:100]}，请稍后重试",
                "data": {},
            }

        return {"tool": tool, "summary": "未知工具", "data": {}}

    async def deep_get_inspiration(
        self, session_id: str, product_name: str, industry: Optional[str] = None
    ) -> Dict:
        """
        深度模式灵感获取：并行搜索多个数据源，AI筛选出3-5个灵感角度

        Returns:
            {inspirations: [{angle, source, data_backing, suggested_hook}]}
        """
        # 并行获取数据
        keyword = f"{industry} {product_name}" if industry else product_name

        results = await asyncio.gather(
            self.tikhub.get_hot_topics(),
            self.tikhub.search_videos(keyword, count=10, sort_type=1),
            self.tikhub.search_xiaohongshu(product_name, count=10),
            self.tavily.search(f"{product_name} 营销 热点 2026", max_results=5),
            return_exceptions=True,
        )

        hot_topics = results[0] if not isinstance(results[0], Exception) else []
        douyin_videos = results[1] if not isinstance(results[1], Exception) else []
        xhs_notes = results[2] if not isinstance(results[2], Exception) else []
        web_results = results[3] if not isinstance(results[3], Exception) else {}

        # TikHub 小红书不可用时，用 Gemini 联网搜索备用
        if not xhs_notes:
            xhs_notes = await self._gemini_search_xiaohongshu(product_name)

        # 构建数据摘要给Gemini筛选
        data_summary = f"""产品: {product_name}
行业: {industry or '未知'}

抖音热搜Top5:
{json.dumps([t.get('title','') for t in hot_topics[:5]], ensure_ascii=False)}

抖音相关爆款视频:
{json.dumps([{'desc': v.get('description','')[:50]} for v in douyin_videos[:5]], ensure_ascii=False)}

小红书相关笔记:
{json.dumps([{'title': n.get('title','')} for n in xhs_notes[:5]], ensure_ascii=False)}

网络搜索摘要:
{web_results.get('answer', web_results.get('summary', ''))[:300] if isinstance(web_results, dict) else ''}
"""

        prompt = f"""你是短视频创意总监。根据以下实时数据，为"{product_name}"推荐3-5个灵感角度。

{data_summary}

请输出JSON（不要其他文字）：
{{
  "inspirations": [
    {{
      "angle": "灵感角度名称（8字以内）",
      "source": "数据来源：抖音热搜/爆款视频/小红书/行业趋势",
      "data_backing": "具体数据支撑（引用上面的真实数据）",
      "suggested_hook": "基于此角度的开场钩子建议（15-25字）"
    }}
  ]
}}

要求：
1. 每个角度必须有真实数据支撑
2. 角度之间要有差异化
3. suggested_hook要具体可用
4. data_backing 中不要提及播放量、点赞量、评论数等视频热度数据"""

        try:
            result = await self.gemini.generate(prompt, model_override="gemini-3.1-pro-preview")
            parsed = self._parse_json_response(result)
            if isinstance(parsed, dict) and "inspirations" in parsed:
                inspirations = parsed["inspirations"]
            else:
                inspirations = []
        except Exception as e:
            logger.warning(f"灵感生成失败: {e}")
            inspirations = [{
                "angle": "热点借势",
                "source": "抖音热搜",
                "data_backing": f"当前热搜包含相关话题",
                "suggested_hook": f"最近都在讨论这个，{product_name}居然也能这样用",
            }]

        # 存入session
        if session_id in self.sessions:
            self.sessions[session_id].setdefault("deep_context", {})["inspirations"] = inspirations

        return {
            "inspirations": inspirations,
            "raw_data": {
                "hot_topics": hot_topics[:5],
                "douyin_videos": [{"description": v.get("description", "")[:60], "play_count": v.get("play_count", 0)} for v in douyin_videos[:5]],
                "xhs_notes": xhs_notes[:5],
            },
        }

    async def deep_generate_from_conversation(
        self,
        session_id: str,
        ip_context: str = "",
        product_desc: str = "",
    ) -> Dict:
        """
        深度模式：三步策略从对话上下文生成脚本（与前端 generateJSON 三步对齐）

        Step 1 (Flash): 从对话提取产品信息
        Step 2 (Flash): 设计 4 个差异化大纲
        Step 3 (Pro × 4 并行): 展开完整脚本（scene/copy/image_prompt 格式）

        Returns:
            {session_id, scripts: [...]}
        """
        session = self.sessions.get(session_id)
        if not session:
            raise ValueError(f"会话不存在: {session_id}")

        deep_ctx = session.get("deep_context", {})
        messages = deep_ctx.get("messages", [])

        # 拼接对话文本
        chat_ctx = "\n".join(
            f"{'用户' if m['role'] == 'user' else '顾问'}：{m['content']}"
            for m in messages[-20:]
        )

        # ── Step 1: Flash 提取需求 ──
        logger.info(f"[深度模式] Step1: 提取需求, session={session_id}")
        extract_data = await self.gemini.generate_json(
            model="gemini-3.1-pro-preview",
            system="你是一位短视频策划专家。从对话中提取关键信息，输出JSON。",
            prompt=(
                f"从以下对话中提取脚本创作所需的关键信息：\n\n{chat_ctx}\n\n"
                f'输出JSON：{{"product":"产品名","category":"品类","duration":"推荐时长",'
                f'"audience":"目标受众","selling_points":"核心卖点",'
                f'"style_hints":"对话中提到的风格/策略偏好",'
                f'"key_context":"其他有价值的上下文"}}'
            ),
            temperature=0.3,
            max_tokens=2048,
        )

        prod = extract_data.get("product") or session.get("product_name") or "产品"
        cat = extract_data.get("category") or session.get("industry") or "通用"
        dur = extract_data.get("duration") or "30秒"

        # ── Step 2: Flash 设计 4 个差异化大纲 ──
        logger.info(f"[深度模式] Step2: 设计大纲, prod={prod}")
        risk_rules = "禁止极限词(最好用/第一/唯一) | 禁止医疗词 | 敏感肌→敏敏肌 | 美白→提亮肤色"
        outlines_data = await self.gemini.generate_json(
            model="gemini-3.1-pro-preview",
            system=f"你是一位短视频脚本结构设计师。脚本将通过AI生图+AI生视频制作，不是真人拍摄。{ip_context}",
            prompt=(
                f"基于以下深度对话和用户需求，设计4个差异化脚本大纲。\n\n"
                f"【对话摘要】\n产品：{prod}（{cat}）| 时长：{dur}\n"
                f"受众：{extract_data.get('audience', '泛人群')}\n"
                f"卖点：{extract_data.get('selling_points', '未指定')}\n"
                f"风格偏好：{extract_data.get('style_hints', '未指定')}\n"
                f"补充：{extract_data.get('key_context', '')}\n\n"
                f"要求：4个方案视觉风格本质不同（产品大片/对比冲击/知识图解/场景沉浸/"
                f"故事叙事/种草清单/痛点解决等），name要有创意不要用\"方案一/二/三\"编号。\n"
                f'JSON：{{"outlines":[{{"name":"有创意的主题名","type":"视觉风格",'
                f'"emotion":"情绪","shots":6,"strategy":"策略","diff":"区别",'
                f'"structure":["步骤1","步骤2","步骤3","步骤4","步骤5"]}}]}}'
            ),
            temperature=0.5,
            max_tokens=4096,
        )

        outlines = outlines_data.get("outlines", [])
        if not outlines:
            raise RuntimeError("未生成大纲")

        # ── Step 3: Pro × 4 并行展开 ──
        logger.info(f"[深度模式] Step3: 并行展开 {len(outlines)} 个脚本")

        product_info_block = ""
        if product_desc:
            product_info_block = f"【⚠️产品真实信息—禁止编造】{product_desc}\n"

        async def expand_one(o: dict) -> Optional[dict]:
            for att in range(2):
                try:
                    r = await self.gemini.generate_json(
                        model="gemini-3.1-pro-preview",
                        system=(
                            f"你是一位顶级短视频脚本创作者+AI视觉导演，台词100%口语化。"
                            f"脚本将通过AI生图+AI生视频制作。{ip_context}"
                        ),
                        prompt=(
                            f"展开脚本大纲：\n"
                            f"产品：{prod}（{cat}）| 时长：{dur}\n"
                            f"{product_info_block}"
                            f"方案：{o['name']}｜{o.get('type', '')}｜{o.get('emotion', '')}\n"
                            f"步骤：{'→'.join(o.get('structure', []))}\n"
                            f"{risk_rules}\n"
                            f"台词铁律：①100%口语②每句≤15字③自然衔接④开场有钩子抓人"
                            f"⑤字数匹配时长(4-5字/秒)\n\n"
                            f"【最重要】视觉一致性：你必须先设计一个visual_anchor对象，"
                            f"这是保证整个视频视觉统一的关键：\n"
                            f"- character：固定主角外观（性别年龄发型服装配饰，足够具体"
                            f"让AI每次画出同一个人），不需要人物则写\"none\"\n"
                            f"- setting：固定主场景（所有镜头共享同一空间）\n"
                            f"- product：固定产品外观（极其具体+必须写no text no label no logo）\n"
                            f"- palette：统一摄影风格（Douyin lifestyle vlog aesthetic）\n"
                            f"所有字段必须英文！product必须含\"no text no label no logo\"！\n\n"
                            f"AI画面铁律：scene是中文画面描述，image_prompt是英文(40-80词)，"
                            f"每个必须以\"no text, no words, no labels in image.\"结尾。\n"
                            f"badges：2-3个标签，c用conv/exp/auth\n"
                            f'JSON：{{"name":"{o["name"]}","dur":"{dur}","shots":{o.get("shots", 6)},'
                            f'"sell":3,"desc":"30字内","badges":[{{"t":"标签","c":"conv"}}],'
                            f'"visual_anchor":{{"character":"English","setting":"English",'
                            f'"product":"English with no text no label no logo","palette":"English"}},'
                            f'"logic":{json.dumps(o.get("structure", []), ensure_ascii=False)},'
                            f'"table":[{{"shot":1,"dur":"3秒","scene":"中文画面",'
                            f'"copy":"台词","image_prompt":"English, no text, no words, no labels in image.",'
                            f'"risk":false,"intent":"情绪+目的"}}]}}'
                        ),
                        temperature=0.7,
                        max_tokens=6144,
                    )
                    if r and r.get("table") and len(r["table"]) > 0:
                        return r
                    if att == 0:
                        await asyncio.sleep(2)
                except Exception as e:
                    logger.warning(f"展开方案「{o.get('name', '')}」失败(att={att}): {e}")
                    if att == 0:
                        await asyncio.sleep(2)
            return None

        raw_results = await asyncio.gather(*(expand_one(o) for o in outlines))
        results = [r for r in raw_results if r and r.get("table")]

        if not results:
            raise RuntimeError("所有方案生成失败")

        # 格式化输出
        scripts = []
        for i, s in enumerate(results):
            scripts.append({
                "id": i + 1,
                "name": s.get("name", f"方案{i+1}"),
                "dur": s.get("dur", dur),
                "shots": s.get("shots", len(s.get("table", []))),
                "sell": s.get("sell", 0),
                "desc": s.get("desc", ""),
                "badges": s.get("badges", []),
                "visual_anchor": s.get("visual_anchor", {}),
                "logic": s.get("logic", []),
                "table": s.get("table", []),
            })

        # 更新 session
        session["product_name"] = prod
        session["industry"] = cat

        logger.info(f"[深度模式] 生成 {len(scripts)} 个脚本, session={session_id}")

        return {
            "session_id": session_id,
            "scripts": scripts,
        }
