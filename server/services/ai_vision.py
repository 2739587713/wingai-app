"""
AI Vision service — use Gemini to analyze screenshots and locate UI elements.
Takes a CDP screenshot, sends to Gemini vision, returns click coordinates.
"""
import base64
import json
import logging
import httpx
from config import AI_BASE_URL, AI_API_KEY

log = logging.getLogger(__name__)

# Use a vision-capable model
VISION_MODEL = "gemini-2.5-flash-preview"


async def analyze_screenshot(screenshot_b64: str, instruction: str) -> dict:
    """
    Send screenshot to Gemini and ask it to analyze the page.

    Args:
        screenshot_b64: base64-encoded PNG screenshot
        instruction: what to find/do on the page

    Returns:
        dict with 'x', 'y' coordinates and 'description' of found element,
        or {'error': ...} on failure.
    """
    prompt = f"""你是一个网页自动化助手。我给你一张浏览器截图（分辨率1280x900），请帮我找到以下元素的位置：

{instruction}

请返回JSON格式，包含：
- x: 元素中心的x坐标（像素，基于1280宽度）
- y: 元素中心的y坐标（像素，基于900高度）
- description: 元素的描述
- found: true/false 是否找到

只返回JSON，不要```标记，不要其他文字。"""

    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                f"{AI_BASE_URL}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {AI_API_KEY}",
                },
                json={
                    "model": VISION_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/png;base64,{screenshot_b64}",
                                    },
                                },
                                {
                                    "type": "text",
                                    "text": prompt,
                                },
                            ],
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 500,
                },
            )
            data = r.json()
            text = data.get("choices", [{}])[0].get("message", {}).get("content", "")
            log.info(f"[AI Vision] Raw response: {text[:200]}")

            # Parse JSON from response
            text = text.strip()
            if "```" in text:
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
                text = text.strip()

            result = json.loads(text)
            log.info(f"[AI Vision] Found: {result}")
            return result

    except Exception as e:
        log.error(f"[AI Vision] Error: {e}")
        return {"error": str(e), "found": False}


async def find_and_click(session, instruction: str) -> bool:
    """
    Take screenshot, ask AI to find element, click at returned coordinates.
    Returns True if click was performed.
    """
    # Take screenshot
    result = await session.send("Page.captureScreenshot", {"format": "png"})
    screenshot_b64 = result["data"]

    # Ask AI
    ai_result = await analyze_screenshot(screenshot_b64, instruction)

    if not ai_result.get("found", False):
        log.warning(f"[AI Vision] Element not found: {instruction}")
        return False

    x = ai_result.get("x", 0)
    y = ai_result.get("y", 0)
    desc = ai_result.get("description", "")
    log.info(f"[AI Vision] Clicking at ({x}, {y}): {desc}")

    # Click using CDP Input.dispatchMouseEvent
    await session.send("Input.dispatchMouseEvent", {
        "type": "mousePressed",
        "x": x,
        "y": y,
        "button": "left",
        "clickCount": 1,
    })
    await session.send("Input.dispatchMouseEvent", {
        "type": "mouseReleased",
        "x": x,
        "y": y,
        "button": "left",
        "clickCount": 1,
    })

    log.info(f"[AI Vision] Clicked at ({x}, {y})")
    return True


async def get_page_analysis(session, question: str) -> str:
    """
    Take screenshot and ask AI a question about the page state.
    Returns AI's text answer.
    """
    result = await session.send("Page.captureScreenshot", {"format": "png"})
    screenshot_b64 = result["data"]

    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(
                f"{AI_BASE_URL}/chat/completions",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {AI_API_KEY}",
                },
                json={
                    "model": VISION_MODEL,
                    "messages": [
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "image_url",
                                    "image_url": {
                                        "url": f"data:image/png;base64,{screenshot_b64}",
                                    },
                                },
                                {
                                    "type": "text",
                                    "text": question,
                                },
                            ],
                        }
                    ],
                    "temperature": 0.1,
                    "max_tokens": 500,
                },
            )
            data = r.json()
            return data.get("choices", [{}])[0].get("message", {}).get("content", "")
    except Exception as e:
        log.error(f"[AI Vision] Analysis error: {e}")
        return f"Error: {e}"
