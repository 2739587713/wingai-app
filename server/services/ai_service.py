"""
AI service — Gemini API for content enhancement and schedule recommendations.
"""
import json
import logging
import httpx
from config import AI_BASE_URL, AI_API_KEY, AI_MODEL

log = logging.getLogger(__name__)


async def _chat(prompt: str, temperature=0.3) -> str:
    import os
    proxy = os.environ.get("HTTP_PROXY") or os.environ.get("http_proxy")
    async with httpx.AsyncClient(timeout=60, proxy=proxy) as c:
        r = await c.post(
            f"{AI_BASE_URL}/chat/completions",
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {AI_API_KEY}"},
            json={
                "model": AI_MODEL,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": temperature,
            },
        )
        data = r.json()
        return data.get("choices", [{}])[0].get("message", {}).get("content", "")


async def recommend_publish_time(platform: str, category: str, industry: str = "",
                                  title: str = "", content: str = "") -> dict:
    """AI-recommended publish times based on content analysis."""
    content_section = ""
    if title or content:
        content_section = f"""
用户准备发布的内容：
- 标题：{title or '未填写'}
- 正文：{content[:500] if content else '未填写'}

请根据内容的类型、情感基调和目标受众来推荐最佳发布时间。
"""
    else:
        content_section = f"""
- 内容类型：{category}
- 行业：{industry or '通用'}
"""

    prompt = f"""你是一个社交媒体运营专家，深谙各平台的流量规律。请为以下内容推荐最佳发布时间：

- 平台：{platform}
{content_section}
请先分析内容的类型和目标受众，然后推荐3个最佳发布时间段。

返回JSON格式：
{{"content_type": "内容类型分析（如：美食分享/穿搭种草/知识科普/情感语录...）",
  "target_audience": "目标受众分析",
  "recommendations": [
    {{"time": "08:00", "range": "07:30-09:00", "reason": "推荐原因（结合内容分析）", "score": 9, "tip": "发布小贴士"}},
    {{"time": "12:00", "range": "11:30-13:00", "reason": "...", "score": 8, "tip": "..."}},
    {{"time": "20:00", "range": "19:00-21:00", "reason": "...", "score": 9, "tip": "..."}}
  ]
}}

注意：time字段用"HH:MM"格式，是最佳精确发布时间点。range是推荐时间段。
只返回JSON，不要```标记，不要其他文字。"""

    text = await _chat(prompt, temperature=0.5)
    try:
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {
            "content_type": "通用内容",
            "target_audience": "大众用户",
            "recommendations": [
                {"time": "12:00", "range": "11:30-13:00", "reason": "午休高峰，用户刷手机频率高", "score": 8, "tip": "配合午间话题更易获得流量"},
                {"time": "18:30", "range": "18:00-20:00", "reason": "下班晚间黄金时段，用户活跃度最高", "score": 9, "tip": "这是全天最佳发布窗口"},
                {"time": "21:30", "range": "21:00-22:30", "reason": "睡前刷手机高峰期", "score": 8, "tip": "情感类内容在此时段效果最佳"},
            ],
        }


async def enhance_content(title: str, content: str, platform: str) -> dict:
    """AI-enhanced title and content for better engagement."""
    prompt = f"""你是{platform}平台的内容运营专家。请优化以下内容，使其更具吸引力和传播力：

原标题：{title}
原内容：{content}

请返回JSON格式：
{{"title": "优化后的标题", "content": "优化后的内容", "tags": ["建议话题标签1", "标签2", "标签3"], "tips": "优化说明"}}

只返回JSON，不要其他文字。"""

    text = await _chat(prompt, temperature=0.7)
    try:
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        return json.loads(text.strip())
    except Exception:
        return {"title": title, "content": content, "tags": [], "tips": "AI优化暂时不可用"}
