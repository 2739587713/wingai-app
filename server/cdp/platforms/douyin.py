"""
Douyin (抖音) creator platform publisher via CDP.
Supports both video and image-text (图文) publishing.
Uses AI vision fallback for element identification.
Flow: navigate → click type tab → upload → fill title/content → scroll down → publish.
"""
import asyncio
import json
import logging

from cdp.actions import (
    upload_files, set_input_value, type_text, click,
    check_element_exists, wait_for_element, get_current_url,
    find_element, _js_sel,
)
from services.ai_vision import find_and_click, get_page_analysis
from utils.anti_detect import human_delay as delay

log = logging.getLogger(__name__)

# Douyin creator upload page (default shows video tab)
UPLOAD_URL = "https://creator.douyin.com/creator-micro/content/upload"


async def check_login(session) -> bool:
    url = await get_current_url(session)
    if "/login" in url or "passport" in url:
        return False
    logged_in = await check_element_exists(session, selector_key="dy_login_check")
    if logged_in:
        return True
    answer = await get_page_analysis(session, "这个页面是否已经登录？能看到头像就是已登录。只回答 yes 或 no。")
    return "yes" in answer.lower()


async def _click_tab(session, content_type: str):
    """Click '发布视频' or '发布图文' tab."""
    tab_text = "发布图文" if content_type == "image" else "发布视频"
    clicked = await session.evaluate(f"""
        (() => {{
            const els = document.querySelectorAll('span, a, div, li, button, p, h3');
            for (const el of els) {{
                const text = el.textContent.trim();
                if (text === "{tab_text}") {{
                    el.scrollIntoView({{block: 'center'}});
                    el.click();
                    return true;
                }}
            }}
            return false;
        }})()
    """)
    if clicked:
        log.info(f"[DY] Clicked '{tab_text}' tab via JS")
        return
    # AI fallback
    await find_and_click(session, f'找到"{tab_text}"标签/按钮/卡片')


async def _wait_for_editor(session, timeout=60):
    """Wait for the editing form to appear after upload completes."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        found = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                if (body.includes('作品描述') || body.includes('填写作品标题') ||
                    body.includes('添加作品标题') || body.includes('添加作品简介') ||
                    body.includes('基础信息')) return true;
                return false;
            })()
        """)
        if found:
            log.info("[DY] Editor form detected")
            return True
        await asyncio.sleep(2)
    log.warning("[DY] Editor form not detected within timeout")
    return False


async def _fill_title(session, title: str):
    """Fill title (0/30 char limit on Douyin)."""
    truncated = title[:30]
    sel = await find_element(session, selector_key="dy_title_input")
    if sel:
        await set_input_value(session, selectors=[sel], value=truncated)
        log.info(f"[DY] Title set via selector: {sel}")
        return

    log.info("[DY] Title selector not found, using AI vision")
    clicked = await find_and_click(session, '找到"填写作品标题"的输入框（在"作品描述"下方）')
    if clicked:
        await asyncio.sleep(0.5)
        for char in truncated:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.03)
        log.info("[DY] Title typed via AI vision")


async def _fill_content(session, content: str):
    """Fill description/content (0/1000 char limit)."""
    truncated = content[:1000]
    sel = await find_element(session, selector_key="dy_content_editor")
    if sel:
        escaped_sel = _js_sel(sel)
        # Focus and type
        await session.evaluate(f"""
            (() => {{
                const el = document.querySelector('{escaped_sel}');
                if (el) {{ el.focus(); el.click(); }}
            }})()
        """)
        await asyncio.sleep(0.3)
        for char in truncated:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.02)
        log.info(f"[DY] Content typed ({len(truncated)} chars)")
        return

    log.info("[DY] Content editor not found, using AI vision")
    clicked = await find_and_click(session, '找到"添加作品简介"的文本编辑区域')
    if clicked:
        await asyncio.sleep(0.5)
        for char in truncated:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.02)
        log.info("[DY] Content typed via AI vision")


async def _scroll_to_bottom(session):
    """Scroll the page to make the publish button visible."""
    await session.evaluate("""
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
    """)
    await asyncio.sleep(1.5)
    # Scroll again in case of lazy-loaded content
    await session.evaluate("""
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
    """)
    await asyncio.sleep(1)
    log.info("[DY] Scrolled to bottom")


async def _click_publish(session):
    """Click the red 发布 button at the bottom."""
    # First scroll to bottom to make it visible
    await _scroll_to_bottom(session)

    # Method 1: JS text match
    clicked = await session.evaluate("""
        (() => {
            const buttons = document.querySelectorAll('button, [role="button"]');
            for (const btn of buttons) {
                const text = btn.textContent.trim();
                if (text === "发布") {
                    btn.scrollIntoView({block: 'center'});
                    btn.click();
                    return true;
                }
            }
            return false;
        })()
    """)
    if clicked:
        log.info("[DY] Clicked '发布' via JS text match")
        return

    # Method 2: AI vision
    log.info("[DY] Using AI vision to find publish button")
    ai_clicked = await find_and_click(session, '找到红色的"发布"按钮（不是"暂存离开"）')
    if ai_clicked:
        return

    raise RuntimeError("DY: Could not find 发布 button")


async def publish(session, task) -> str:
    """
    Publish to Douyin (video or image-text).
    Returns published URL or raises on failure.
    """
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths
    tags = json.loads(task.tags) if isinstance(task.tags, str) else task.tags
    content_type = getattr(task, "content_type", "video") or "video"

    # 1. Navigate to upload page
    log.info(f"[DY] Navigating to upload page (type={content_type})")
    await session.navigate(UPLOAD_URL)
    await asyncio.sleep(4)

    # Check login
    if not await check_login(session):
        raise PermissionError("Douyin: Not logged in, cookies expired")
    log.info("[DY] Login confirmed")

    # 2. Click the correct tab (发布视频 or 发布图文)
    await _click_tab(session, content_type)
    await delay(1, 2)

    # 3. Upload media files
    if not media_paths:
        raise RuntimeError(f"Douyin requires at least one {'video' if content_type == 'video' else 'image'}")

    log.info(f"[DY] Uploading {len(media_paths)} files")
    await upload_files(session, media_paths, selector_key="dy_upload_input")

    # Wait for upload to complete and editor to appear
    log.info("[DY] Waiting for upload and editor...")
    if not await _wait_for_editor(session):
        analysis = await get_page_analysis(session, "当前页面状态是什么？上传完成了吗？有没有出现标题和描述编辑区域？")
        log.info(f"[DY] Page analysis: {analysis[:200]}")

    await delay(2, 3)

    # 4. Fill title
    if task.title:
        log.info(f"[DY] Setting title: {task.title[:30]}...")
        await _fill_title(session, task.title)
        await delay(0.5, 1)

    # 5. Fill content/description
    if task.content:
        log.info(f"[DY] Setting content ({len(task.content)} chars)")
        await _fill_content(session, task.content)
        await delay(0.5, 1)

    # 6. Add tags in content editor
    if tags:
        log.info(f"[DY] Adding {len(tags)} tags")
        sel = await find_element(session, selector_key="dy_content_editor")
        if sel:
            escaped_sel = _js_sel(sel)
            for tag in tags:
                tag_name = tag.lstrip("#")
                try:
                    await session.evaluate(f"""
                        (() => {{
                            const el = document.querySelector('{escaped_sel}');
                            if (el) el.focus();
                        }})()
                    """)
                    await asyncio.sleep(0.3)
                    await session.evaluate(f"document.execCommand('insertText', false, ' #{tag_name}')")
                    await asyncio.sleep(2)
                    # Try click suggestion
                    await session.evaluate("""
                        (() => {
                            const items = document.querySelectorAll('[class*="mention-item"], [class*="suggest"], [class*="topic-item"]');
                            if (items.length > 0) items[0].click();
                        })()
                    """)
                    await delay(0.5, 1)
                    log.info(f"[DY] Added tag: #{tag_name}")
                except Exception as e:
                    log.warning(f"[DY] Failed to add tag #{tag_name}: {e}")

    await delay(1, 2)

    # 7. Scroll down and click publish
    log.info("[DY] Publishing...")
    old_url = await get_current_url(session)
    await _click_publish(session)
    await delay(3, 5)

    # 8. Check result
    new_url = await get_current_url(session)
    success = await session.evaluate("""
        (() => {
            const body = document.body.innerText || '';
            if (body.includes('发布成功') || body.includes('已发布') ||
                body.includes('作品发布成功')) return true;
            const el = document.querySelector('[class*="success"], [class*="publish-done"]');
            if (el) return true;
            if (window.location.href.includes('manage')) return true;
            return false;
        })()
    """)

    if success or "manage" in new_url or new_url != old_url:
        log.info(f"[DY] Published successfully!")
        return new_url

    # AI check
    analysis = await get_page_analysis(session, "发布成功了吗？页面显示什么状态？")
    log.info(f"[DY] AI result: {analysis[:200]}")
    if "成功" in analysis:
        return new_url

    error = await session.evaluate("""
        document.querySelector('[class*="error"], .semi-toast')?.textContent || ''
    """)
    raise RuntimeError(f"Douyin publish failed: {error or analysis[:100]}")
