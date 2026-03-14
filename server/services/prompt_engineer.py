# -*- coding: utf-8 -*-
"""
PromptEngineer: 把中文镜头描述 → 专业英文生图提示词
使用 Gemini AI，支持全局风格词注入
"""
import asyncio
from typing import Dict, List, Optional
from loguru import logger

from .gemini_client import GeminiClient


# 镜头类型 → 构图说明
SHOT_TYPE_HINTS: Dict[str, str] = {
    "hook": "attention-grabbing opening shot, dynamic composition",
    "product": "product hero shot, studio lighting, clean background",
    "scene": "lifestyle scene, environmental storytelling",
    "talking_head": "presenter / talking head, medium shot, eye-level",
    "hands_on": "close-up hands demonstration, first-person POV",
    "effect": "before-after comparison, split-frame or two-panel layout",
    "transition": "smooth cinematic transition frame",
    "wide": "wide establishing shot, sweeping view",
    "medium": "medium shot, waist-up framing",
    "close_up": "extreme close-up, macro detail",
    "cta": "call-to-action closing frame, warm and inviting",
    "hook_opening": "bold attention-grabbing opener, cinematic wide",
    "result": "result / outcome showcase shot",
}

# 情绪 → 光线色调描述
MOOD_HINTS: Dict[str, str] = {
    "warm": "warm golden tones, soft natural light",
    "cool": "cool blue palette, clean clinical lighting",
    "energetic": "high contrast, vibrant saturated colors, dynamic angle",
    "calm": "soft diffused light, muted tones, peaceful atmosphere",
    "luxurious": "dramatic rim light, deep shadows, rich dark tones",
    "fresh": "bright airy light, clean whites, pastel accents",
    "professional": "neutral balanced lighting, corporate clean look",
}

# 摄像运动 → 画面构图暗示
CAMERA_HINTS: Dict[str, str] = {
    "zoom_in": "tightly framed subject, compressed foreground",
    "zoom_out": "expanding scene, wide reveal",
    "pan_left": "lateral motion implied, side-lit subject",
    "pan_right": "lateral motion implied, side-lit subject",
    "tilt_up": "low angle looking up, heroic perspective",
    "tilt_down": "high angle looking down, bird's-eye feel",
    "static": "static composition, stable framing",
    "handheld": "slightly off-center, natural handheld feel",
    "dolly": "smooth depth perspective, foreground/background separation",
}

# 风格预设
STYLE_PRESETS: Dict[str, str] = {
    "商业广告": "commercial photography style, professional advertising, highly polished, brand-quality visual",
    "电影质感": "cinematic color grade, film grain, anamorphic lens, movie-like atmosphere",
    "ins写真": "instagram lifestyle photography, natural light, authentic feel, trendy aesthetic",
    "极简白": "minimalist white background, clean negative space, product-focused",
    "国风写意": "Chinese aesthetic, ink wash inspired, elegant traditional mood",
    "科技感": "futuristic tech aesthetic, blue neon accent, dark background, digital vibe",
}

_SYSTEM_INSTRUCTION = """You are an expert visual prompt engineer for AI image generation (DALL-E, Midjourney, Stable Diffusion style).
Convert the given Chinese video shot description into a high-quality English image generation prompt.

Output rules:
1. Output ONLY the English prompt, no explanations, no labels
2. Include: subject/object details, composition, lighting, color tone, style keywords
3. Always end with quality boosters: photorealistic, commercial photography, 8k, sharp focus
4. Keep it concise (80-120 words)
5. Incorporate the global style requirements naturally if provided
6. If the shot includes people and the user does not explicitly request a nationality or ethnicity, default the human appearance to Chinese / East Asian
7. If the user explicitly requests foreign people or another nationality / ethnicity, follow that request and do not force Chinese appearance
"""

_EXPLICIT_FOREIGN_KEYWORDS = [
    "外国人", "欧美", "欧洲", "美国", "英国", "法国", "德国", "俄罗斯", "白人", "黑人",
    "拉丁", "中东", "印度", "日韩", "日本人", "韩国人", "西方", "异国",
    "foreigner", "foreign", "western", "american", "british", "french", "german",
    "russian", "european", "white person", "black person", "latino", "middle eastern",
    "indian", "japanese", "korean", "non-chinese", "caucasian",
]

_EXPLICIT_CHINESE_KEYWORDS = [
    "中国人", "华人", "亚洲人", "东亚", "中式", "国风", "汉服",
    "chinese", "east asian", "asian",
]

# 生图模型需要明确关键词才能生成中国人形象，模糊指令无效
_DEFAULT_CHINESE_SUFFIX = ", Chinese person, East Asian appearance, Asian features"

# 可能包含人物的镜头类型（纯产品展示也可能有人手/模特，扩大范围确保中国人形象）
_SHOT_TYPES_WITH_PEOPLE = frozenset({
    "hook", "talking_head", "hands_on", "scene", "close_up",
    "effect", "cta", "wide", "medium", "hook_opening", "result",
    "product", "main", "broll", "opening", "macro_close_up", "pov",
    "product_showcase", "extreme_close_up",
})

# 描述中暗示人物的关键词（命中则强制加中国人，即使 shot_type 不在上述集合）
_PEOPLE_HINT_KEYWORDS = (
    "人", "手", "脸", "模特", "主播", "用户", "展示", "使用", "涂抹", "涂抹",
    "person", "people", "hand", "hands", "face", "model", "presenter",
    "apply", "using", "demonstrate", "show",
)


class PromptEngineer:
    """中文镜头描述 → 专业英文生图提示词"""

    def __init__(self):
        self.client = GeminiClient()

    async def build_prompt(
        self,
        shot: Dict,
        global_style: str = "",
        product_name: str = "",
    ) -> str:
        """
        为单个镜头生成专业英文提示词

        Args:
            shot: 镜头数据（含 visual_description/narration/shot_type 等）
            global_style: 用户输入的全局风格描述（中英文均可）
            product_name: 产品名称，用于语境参考

        Returns:
            专业英文提示词字符串
        """
        visual = shot.get("visual_prompt", "") or shot.get("visual_description", "")
        narration = shot.get("narration", "")
        shot_type = shot.get("shot_type", "scene")
        duration = shot.get("duration", 5)
        mood = shot.get("mood", "")
        camera = shot.get("camera_movement", "")

        # 如果本身已经是高质量英文 prompt（长于 30 个词），只做风格融合
        if visual and self._is_quality_english(visual) and not global_style:
            out = self._append_quality_boosters(visual)
            return self._inject_default_chinese(out, shot_type, visual, narration, global_style)

        # 构建结构化描述给 Gemini
        parts: List[str] = []
        if visual:
            parts.append(f"Scene: {visual}")
        if narration:
            parts.append(f"Narration context (Chinese): {narration}")
        if product_name:
            parts.append(f"Product: {product_name}")

        shot_hint = SHOT_TYPE_HINTS.get(shot_type, "medium shot")
        parts.append(f"Shot type: {shot_hint}")

        if mood and mood in MOOD_HINTS:
            parts.append(f"Mood: {MOOD_HINTS[mood]}")
        if camera and camera in CAMERA_HINTS:
            parts.append(f"Camera: {CAMERA_HINTS[camera]}")
        if duration:
            parts.append(f"Duration: {duration}s")

        if global_style:
            # 先尝试匹配预设
            preset = STYLE_PRESETS.get(global_style.strip(), "")
            style_desc = preset if preset else global_style
            parts.append(f"Global style: {style_desc}")

        # 不再依赖 Gemini 输出，改为在最终 prompt 中直接追加关键词（见 _inject_default_chinese）
        user_msg = "\n".join(parts)
        prompt_text = f"{_SYSTEM_INSTRUCTION}\n\n---\n{user_msg}\n---\nOutput the English prompt:"

        try:
            result = await self.client.generate(prompt_text, temperature=0.6, max_tokens=300)
            result = result.strip().strip('"').strip("'")
            # 清除可能的前缀说明
            for prefix in ["Prompt:", "English prompt:", "Output:"]:
                if result.lower().startswith(prefix.lower()):
                    result = result[len(prefix):].strip()
            out = self._append_quality_boosters(result)
            return self._inject_default_chinese(out, shot_type, visual, narration, global_style)
        except Exception as e:
            logger.warning(f"PromptEngineer Gemini调用失败, 使用fallback: {e}")
            return self._fallback_prompt(shot, global_style, product_name)

    async def build_batch(
        self,
        shots: List[Dict],
        global_style: str = "",
        product_name: str = "",
        concurrency: int = 3,
    ) -> Dict[int, str]:
        """
        并发为所有镜头生成提示词

        Returns:
            {shot_id: prompt_str} 映射
        """
        sem = asyncio.Semaphore(concurrency)

        async def _one(shot: Dict, idx: int):
            shot_id = shot.get("shot_id", idx + 1)
            async with sem:
                prompt = await self.build_prompt(shot, global_style, product_name)
            return shot_id, prompt

        tasks = [asyncio.create_task(_one(s, i)) for i, s in enumerate(shots)]
        results_list = await asyncio.gather(*tasks, return_exceptions=True)

        out: Dict[int, str] = {}
        for i, res in enumerate(results_list):
            if isinstance(res, Exception):
                shot_id = shots[i].get("shot_id", i + 1)
                out[shot_id] = self._fallback_prompt(shots[i], global_style, product_name)
                logger.warning(f"Shot {shot_id} prompt generation failed: {res}")
            else:
                shot_id, prompt = res
                out[shot_id] = prompt
        return out

    # ------------------------------------------------------------------ #
    #  内部工具方法
    # ------------------------------------------------------------------ #

    def _is_quality_english(self, text: str) -> bool:
        """判断是否已经是足够长的英文描述"""
        if not text:
            return False
        words = text.split()
        non_ascii = sum(1 for c in text if ord(c) > 127)
        return len(words) >= 20 and non_ascii < 5

    def _append_quality_boosters(self, prompt: str) -> str:
        """确保末尾有质量关键词"""
        boosters = "photorealistic, commercial photography, 8k, sharp focus"
        if "photorealistic" not in prompt.lower() and "commercial" not in prompt.lower():
            return f"{prompt.rstrip('., ')}, {boosters}"
        return prompt

    def _should_apply_default_chinese(
        self,
        visual: str,
        narration: str,
        global_style: str,
    ) -> bool:
        """未明确指定人物国籍/人种时，默认人物形象偏中国人。"""
        text = " ".join(filter(None, [visual, narration, global_style])).lower()
        if not text:
            return True

        for keyword in _EXPLICIT_FOREIGN_KEYWORDS:
            if keyword.lower() in text:
                return False

        if any(keyword.lower() in text for keyword in _EXPLICIT_CHINESE_KEYWORDS):
            return False

        return True

    def _shot_has_people(self, shot_type: str, visual: str = "", narration: str = "") -> bool:
        """该镜头类型是否通常包含人物，或描述中暗示有人物。"""
        if shot_type in _SHOT_TYPES_WITH_PEOPLE:
            return True
        text = (visual + " " + narration).lower()
        return any(kw in text for kw in _PEOPLE_HINT_KEYWORDS)

    def _inject_default_chinese(
        self,
        prompt: str,
        shot_type: str,
        visual: str,
        narration: str,
        global_style: str,
    ) -> str:
        """
        在最终 prompt 中直接追加中国人形象关键词。
        生图模型需要明确英文关键词，模糊指令无效。
        """
        if not self._should_apply_default_chinese(visual, narration, global_style):
            return prompt
        if not self._shot_has_people(shot_type, visual, narration):
            return prompt
        # 避免重复追加
        pl = prompt.lower()
        if any(kw in pl for kw in ("chinese", "east asian", "asian person", "asian features")):
            return prompt
        return f"{prompt.rstrip('., ')}{_DEFAULT_CHINESE_SUFFIX}"

    def _fallback_prompt(self, shot: Dict, global_style: str, product_name: str) -> str:
        """Gemini 失败时的模板 fallback"""
        visual = shot.get("visual_prompt", "") or shot.get("visual_description", "")
        narration = shot.get("narration", "")
        shot_type = shot.get("shot_type", "scene")
        mood = shot.get("mood", "warm")

        shot_hint = SHOT_TYPE_HINTS.get(shot_type, "medium shot")
        mood_hint = MOOD_HINTS.get(mood, "natural lighting, balanced tones")

        subject = visual if visual and self._is_quality_english(visual) else (
            f"product advertisement scene for {product_name}" if product_name else "product lifestyle scene"
        )

        style_suffix = ""
        if global_style:
            preset = STYLE_PRESETS.get(global_style.strip(), "")
            style_suffix = f", {preset}" if preset else f", {global_style} style"

        base = (
            f"{subject}, {shot_hint}, {mood_hint}{style_suffix}, "
            f"photorealistic, commercial photography, 8k, sharp focus"
        )
        return self._inject_default_chinese(
            base, shot_type, visual, narration, global_style
        )
