"""
Xiaohongshu (小红书) creator platform publisher via CDP.
Uses direct URL navigation + AI vision fallback.
Flow: navigate to image upload → upload files → fill title/content → add tags → publish.
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

# Direct URLs for different content types
CREATOR_URLS = {
    "image": "https://creator.xiaohongshu.com/publish/publish?from=menu&target=image",
    "video": "https://creator.xiaohongshu.com/publish/publish?from=menu&target=video",
}


async def check_login(session) -> bool:
    """Check if logged in."""
    url = await get_current_url(session)
    if "/login" in url:
        return False
    logged_in = await check_element_exists(session, selector_key="xhs_login_check")
    if logged_in:
        return True
    # Fallback: ask AI
    answer = await get_page_analysis(session, "这个页面是否已经登录？如果能看到头像或用户信息就是已登录。只回答 yes 或 no。")
    return "yes" in answer.lower()


async def _wait_for_upload_area(session, timeout=15):
    """Wait until upload area is visible (image or video)."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        found = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                if (body.includes('上传图片') || body.includes('拖拽图片') ||
                    body.includes('上传视频') || body.includes('拖拽视频')) return true;
                const fileInput = document.querySelector('input[type="file"]');
                if (fileInput) return true;
                return false;
            })()
        """)
        if found:
            return True
        await asyncio.sleep(0.5)
    return False


async def _wait_for_editor(session, timeout=30):
    """Wait until the editing form appears (after image upload completes)."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        found = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                // Look for title placeholder or content placeholder
                if (body.includes('填写标题') || body.includes('输入正文描述')) return true;
                // Or look for the editor elements
                const title = document.querySelector('input[placeholder*="标题"]');
                const editor = document.querySelector('.ProseMirror, [contenteditable="true"]');
                if (title || editor) return true;
                return false;
            })()
        """)
        if found:
            log.info("[XHS] Editor form detected")
            return True
        await asyncio.sleep(1)
    log.warning("[XHS] Editor form not detected within timeout")
    return False


async def _fill_title(session, title: str):
    """Fill the title field."""
    # Try CSS selector
    sel = await find_element(session, selector_key="xhs_title_input")
    if sel:
        await set_input_value(session, selectors=[sel], value=title)
        log.info(f"[XHS] Title set via selector: {sel}")
        return

    # Fallback: AI vision
    log.info("[XHS] Title selector not found, using AI vision")
    clicked = await find_and_click(session, '找到标题输入框（有placeholder文字"填写标题会有更多赞哦"的输入框）')
    if clicked:
        await asyncio.sleep(0.5)
        # Type via execCommand
        for char in title:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.03)
        log.info("[XHS] Title typed via AI vision")
        return

    log.warning("[XHS] Could not find title input, skipping")


async def _fill_content(session, content: str):
    """Fill content into ProseMirror/TipTap editor."""
    sel = await find_element(session, selector_key="xhs_content_editor")
    if sel:
        # ProseMirror: use innerHTML with <p> wrapping
        paragraphs = content.split("\n")
        html_parts = []
        for p in paragraphs:
            html_parts.append(f"<p>{p}</p>" if p.strip() else "<p><br></p>")
        html_content = "".join(html_parts)
        escaped_html = json.dumps(html_content)
        escaped_sel = _js_sel(sel)
        await session.evaluate(f"""
            (() => {{
                const el = document.querySelector('{escaped_sel}');
                if (el) {{
                    el.focus();
                    el.innerHTML = {escaped_html};
                    el.dispatchEvent(new Event('input', {{ bubbles: true }}));
                }}
            }})()
        """)
        log.info(f"[XHS] Content set via innerHTML ({len(content)} chars)")
        return

    # Fallback: AI click + type
    log.info("[XHS] Content editor not found, using AI vision")
    clicked = await find_and_click(session, '找到正文内容编辑区域（有placeholder"输入正文描述"的编辑框）')
    if clicked:
        await asyncio.sleep(0.5)
        for char in content:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.02)
        log.info("[XHS] Content typed via AI vision")
        return

    log.warning("[XHS] Could not find content editor, skipping")


async def _add_tags(session, tags: list):
    """Add topic tags by typing # in the content editor."""
    sel = await find_element(session, selector_key="xhs_content_editor")
    if not sel:
        log.warning("[XHS] Content editor not found for tags, skipping")
        return

    escaped_sel = _js_sel(sel)

    for tag in tags:
        tag_name = tag.lstrip("#")
        try:
            # Focus editor, move cursor to end
            await session.evaluate(f"""
                (() => {{
                    const el = document.querySelector('{escaped_sel}');
                    if (el) {{
                        el.focus();
                        const range = document.createRange();
                        const selection = window.getSelection();
                        range.selectNodeContents(el);
                        range.collapse(false);
                        selection.removeAllRanges();
                        selection.addRange(range);
                    }}
                }})()
            """)
            await delay(0.3, 0.5)

            # Type # + tag name char by char
            await session.evaluate("document.execCommand('insertText', false, '#')")
            await delay(0.3, 0.5)
            for char in tag_name:
                await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
                await asyncio.sleep(0.1)

            # Wait for suggestion dropdown
            await asyncio.sleep(3)

            # Try clicking first suggestion
            suggestion_clicked = await session.evaluate("""
                (() => {
                    const selectors = [
                        '.topic-list-item', '.suggest-item', 'li[class*="topic"]',
                        '[class*="mention"] li', '[class*="suggestion"] li',
                        '[class*="dropdown"] li', '[class*="hashtag"] li'
                    ];
                    for (const s of selectors) {
                        const items = document.querySelectorAll(s);
                        if (items.length > 0) { items[0].click(); return true; }
                    }
                    return false;
                })()
            """)

            if not suggestion_clicked:
                # AI fallback
                ai_clicked = await find_and_click(session, f'找到话题标签建议下拉列表中的第一个选项')
                if not ai_clicked:
                    await session.evaluate("document.execCommand('insertText', false, ' ')")

            await delay(0.5, 1)
            log.info(f"[XHS] Added tag: #{tag_name}")
        except Exception as e:
            log.warning(f"[XHS] Failed to add tag '#{tag_name}': {e}")


async def _set_scheduled_time(session, scheduled_at):
    """Set scheduled publish time on Xiaohongshu (定时发布)."""
    from datetime import datetime
    if isinstance(scheduled_at, str):
        scheduled_at = datetime.fromisoformat(scheduled_at)

    now = datetime.now()
    diff = (scheduled_at - now).total_seconds()
    if diff < 120:  # Less than 2 min, platform can't handle
        log.info("[XHS] Scheduled time is too soon (<2min), will publish immediately")
        return
    if diff > 14 * 86400:
        log.warning("[XHS] Scheduled time >14 days. Publishing immediately.")
        return

    date_str = scheduled_at.strftime("%Y-%m-%d")
    time_str = scheduled_at.strftime("%H:%M")
    dt_str = f"{date_str} {time_str}"
    log.info(f"[XHS] Setting 定时发布: {dt_str}")

    # Step 1: Find and click 定时发布 toggle
    clicked = await session.evaluate("""
        (() => {
            const els = document.querySelectorAll('span, div, label, p, button');
            for (const el of els) {
                const text = (el.textContent || '').trim();
                if (text === '定时发布' || text === '设置定时发布') {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 20 && rect.height > 10) {
                        // Try to find a toggle/switch near it
                        const parent = el.closest('div[class]') || el.parentElement;
                        const toggle = parent ? parent.querySelector(
                            'input[type="checkbox"], [role="switch"], [class*="switch"], [class*="toggle"]'
                        ) : null;
                        if (toggle) { toggle.click(); return 'clicked toggle'; }
                        el.click();
                        return 'clicked:' + text.substring(0, 20);
                    }
                }
            }
            return null;
        })()
    """)
    if clicked:
        log.info(f"[XHS] Schedule toggle: {clicked}")
        await asyncio.sleep(1.5)
    else:
        # AI vision fallback — reuse publish button detection pattern
        log.info("[XHS] Using AI to find 定时发布 toggle")
        ai_clicked = await find_and_click(
            session,
            '在页面底部找到"定时发布"的开关按钮、切换按钮或单选按钮并点击开启。'
            '它通常在"发布"按钮附近，可能是一个滑动开关(switch)或可点击的选项。'
        )
        if ai_clicked:
            await asyncio.sleep(1.5)
        else:
            log.warning("[XHS] Could not find 定时发布 toggle, publishing immediately")
            return

    # Step 2: Set date/time in the picker
    # Try JS first
    date_set = await session.evaluate(f"""
        (() => {{
            const inputs = document.querySelectorAll(
                'input[type="text"], input[type="date"], input[type="datetime-local"], '
                + 'input[placeholder*="日期"], input[placeholder*="选择"], '
                + '.el-input input, [class*="picker"] input, [class*="date"] input'
            );
            for (const inp of inputs) {{
                const rect = inp.getBoundingClientRect();
                if (rect.width > 50 && rect.height > 20 && rect.top > 0) {{
                    inp.focus();
                    inp.click();
                    const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
                    if (proto && proto.set) {{
                        proto.set.call(inp, '{dt_str}');
                    }} else {{
                        inp.value = '{dt_str}';
                    }}
                    inp.dispatchEvent(new Event('input', {{bubbles: true}}));
                    inp.dispatchEvent(new Event('change', {{bubbles: true}}));
                    return 'set via input';
                }}
            }}
            return false;
        }})()
    """)

    if date_set:
        log.info(f"[XHS] Schedule date/time set via JS: {dt_str}")
        await asyncio.sleep(1)
    else:
        # AI vision fallback
        log.info(f"[XHS] Using AI to set date/time: {dt_str}")
        ai_clicked = await find_and_click(
            session,
            f'找到定时发布下方的日期时间输入框或日历选择器并点击。'
            f'需要设置的日期是{date_str}，时间是{time_str}。'
        )
        if ai_clicked:
            await asyncio.sleep(1)
            await session.evaluate("document.execCommand('selectAll')")
            await asyncio.sleep(0.2)
            for char in dt_str:
                await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
                await asyncio.sleep(0.05)
            await asyncio.sleep(1)

    # Confirm/close the picker if needed
    await session.evaluate("""
        (() => {
            const btns = document.querySelectorAll('button, span, a');
            for (const btn of btns) {
                const t = (btn.textContent || '').trim();
                if ((t === '确定' || t === '确认') && btn.offsetParent !== null) {
                    btn.click(); return;
                }
            }
            document.body.click();
        })()
    """)
    await asyncio.sleep(1)

    # Step 3: Verify
    verify = await get_page_analysis(
        session,
        '请检查页面上"定时发布"是否已开启，日期时间是否已设置。'
        '只回答JSON: {"enabled": true/false, "time_set": true/false, "description": "简要描述"}'
    )
    log.info(f"[XHS] Schedule verification: {verify[:200]}")
    log.info("[XHS] Scheduled time configured")


async def _click_publish(session):
    """Click the red 发布 button at the bottom."""
    # Method 1: JS text match
    clicked = await session.evaluate("""
        (() => {
            const buttons = document.querySelectorAll('button, [role="button"], div[class*="btn"], a');
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
        log.info("[XHS] Clicked '发布' button via JS text match")
        return

    # Method 2: AI vision
    log.info("[XHS] Using AI vision to find '发布' button")
    ai_clicked = await find_and_click(session, '找到页面底部的红色"发布"按钮（不是"暂存离开"）')
    if ai_clicked:
        return

    raise RuntimeError("XHS: Could not find 发布 button")


async def publish(session, task) -> str:
    """
    Publish note to Xiaohongshu (image or video).
    Returns published URL or raises on failure.
    """
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths
    tags = json.loads(task.tags) if isinstance(task.tags, str) else task.tags
    content_type = getattr(task, "content_type", "image") or "image"

    # 1. Navigate to correct upload page based on content type
    url = CREATOR_URLS.get(content_type, CREATOR_URLS["image"])
    log.info(f"[XHS] Navigating to {content_type} upload page")
    await session.navigate(url)
    await asyncio.sleep(3)

    # Check login
    if not await check_login(session):
        raise PermissionError("XHS: Not logged in, cookies expired")
    log.info("[XHS] Login confirmed")

    # 2. Wait for upload area to appear
    tab_text = "上传图文" if content_type == "image" else "上传视频"
    if not await _wait_for_upload_area(session):
        log.info(f"[XHS] Upload area not found, trying to click '{tab_text}' tab")
        await session.evaluate(f"""
            (() => {{
                const els = document.querySelectorAll('span, a, div, li, button, p');
                for (const el of els) {{
                    if (el.textContent.trim() === "{tab_text}") {{
                        el.click(); return true;
                    }}
                }}
                return false;
            }})()
        """)
        await asyncio.sleep(2)

    # 3. Upload media files via DOM.setFileInputFiles (bypasses native file dialog)
    if media_paths:
        log.info(f"[XHS] Uploading {len(media_paths)} files via CDP")
        await upload_files(session, media_paths, selector_key="xhs_upload_input")

        # Wait for the editor form to appear (page transitions after upload)
        log.info("[XHS] Waiting for editor form...")
        if not await _wait_for_editor(session):
            # Try AI analysis
            analysis = await get_page_analysis(session, "当前页面状态是什么？图片上传成功了吗？有没有出现标题和内容编辑区域？")
            log.info(f"[XHS] Page analysis: {analysis[:200]}")
    else:
        log.warning("[XHS] No media files to upload!")
        raise RuntimeError(f"XHS requires at least one {'image' if content_type == 'image' else 'video'} to publish")

    await delay(1, 2)

    # 4. Fill title
    if task.title:
        log.info(f"[XHS] Setting title: {task.title[:30]}...")
        await _fill_title(session, task.title)
        await delay(0.5, 1)

    # 5. Fill content
    if task.content:
        log.info(f"[XHS] Setting content ({len(task.content)} chars)")
        await _fill_content(session, task.content)
        await delay(0.5, 1)

    # 6. Add tags
    if tags:
        log.info(f"[XHS] Adding {len(tags)} tags")
        await _add_tags(session, tags)

    await delay(1, 2)

    # 6.5. Set scheduled time if needed
    scheduled_at = getattr(task, "scheduled_at", None)
    if scheduled_at:
        await _set_scheduled_time(session, scheduled_at)
        await delay(1, 2)

    # 7. Click publish
    log.info("[XHS] Clicking publish button")
    old_url = await get_current_url(session)
    await _click_publish(session)
    await delay(3, 5)

    # 8. Check result
    new_url = await get_current_url(session)
    success = await session.evaluate("""
        (() => {
            const body = document.body.innerText || '';
            if (body.includes('发布成功') || body.includes('已发布')) return true;
            const toasts = document.querySelectorAll('.el-message--success, [class*="success"]');
            if (toasts.length > 0) return true;
            if (window.location.href.includes('/publish/success')) return true;
            return false;
        })()
    """)

    if success or new_url != old_url:
        log.info(f"[XHS] Published successfully! URL: {new_url}")
        note_url = await session.evaluate("""
            (() => {
                const link = document.querySelector('a[href*="/explore/"]');
                return link ? link.href : '';
            })()
        """) or new_url
        return note_url

    # AI check
    analysis = await get_page_analysis(session, "发布是否成功了？页面上有没有成功提示或错误信息？简要描述。")
    log.info(f"[XHS] AI result check: {analysis[:200]}")
    if "成功" in analysis:
        return new_url

    error = await session.evaluate("""
        (() => {
            const err = document.querySelector('.el-message--error, [class*="error"]');
            return err ? err.textContent : '';
        })()
    """)
    raise RuntimeError(f"XHS publish may have failed: {error or analysis[:100]}")
