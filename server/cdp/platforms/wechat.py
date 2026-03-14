"""
WeChat Official Account (微信公众号) publisher via CDP.
Supports 3 content types: article (文章), image (贴图), video (视频).
Flow: navigate to mp.weixin.qq.com → click content type → upload media → fill fields → publish.
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

MP_HOME = "https://mp.weixin.qq.com"


async def check_login(session) -> bool:
    """Check if logged into mp.weixin.qq.com."""
    url = await get_current_url(session)
    # If redirected to login/scan page
    if "/cgi-bin/loginpage" in url or "action=scanlogin" in url:
        return False
    # Check for dashboard elements (account name, avatar, 新的创作)
    logged_in = await session.evaluate("""
        (() => {
            const body = document.body.innerText || '';
            if (body.includes('新的创作') || body.includes('首页') ||
                body.includes('昨日阅读') || body.includes('总用户数')) return true;
            const avatar = document.querySelector('.weui-desktop-account__thumb, [class*="avatar"], .head_img');
            if (avatar) return true;
            return false;
        })()
    """)
    return logged_in


async def _dismiss_popups(session):
    """Dismiss any announcement popups on the dashboard."""
    for _ in range(3):
        dismissed = await session.evaluate("""
            (() => {
                // Close X buttons on popups/banners
                const closes = document.querySelectorAll(
                    '.weui-desktop-dialog__close, .dialog_wrp .btn_close, ' +
                    '[class*="close-btn"], [class*="dialog"] .icon-close, ' +
                    '.weui-desktop-btn_mini, [aria-label="关闭"]'
                );
                for (const btn of closes) {
                    if (btn.offsetParent !== null) { btn.click(); return true; }
                }
                // Click "稍后再说" type buttons
                const btns = document.querySelectorAll('button, a, span');
                for (const btn of btns) {
                    const t = (btn.textContent || '').trim();
                    if (t === '稍后再说' || t === '我知道了' || t === '关闭' || t === '取消') {
                        if (btn.offsetParent !== null) { btn.click(); return true; }
                    }
                }
                return false;
            })()
        """)
        if not dismissed:
            break
        await asyncio.sleep(1)


async def _click_create_type(session, content_type: str):
    """Click the appropriate content creation button on the dashboard.
    content_type: 'article' | 'image' | 'video'
    """
    type_map = {
        "article": "文章",
        "image": "贴图",
        "video": "视频",
    }
    target_text = type_map.get(content_type, "文章")
    log.info(f"[WX] Looking for '{target_text}' creation button")

    clicked = await session.evaluate(f"""
        (() => {{
            // Find creation buttons in the dashboard
            const els = document.querySelectorAll(
                '.weui-desktop-card__action, .new-creation__item, ' +
                '[class*="creation"] a, [class*="publish"] a, ' +
                '.card_create a, a, span, div'
            );
            for (const el of els) {{
                const text = (el.textContent || '').trim();
                if (text === '{target_text}') {{
                    el.click();
                    return true;
                }}
            }}
            return false;
        }})()
    """)
    if clicked:
        log.info(f"[WX] Clicked '{target_text}' button")
        await asyncio.sleep(3)
        return True

    # AI vision fallback
    log.info(f"[WX] Using AI to find '{target_text}' button")
    ai_clicked = await find_and_click(
        session,
        f'在页面底部"新的创作"区域找到"{target_text}"按钮并点击'
    )
    if ai_clicked:
        await asyncio.sleep(3)
        return True

    raise RuntimeError(f"WX: Could not find '{target_text}' creation button")


async def _wait_for_editor(session, timeout=30):
    """Wait until the article/video editor page loads."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        found = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                if (body.includes('请在这里输入标题') || body.includes('从这里开始写正文') ||
                    body.includes('填写描述信息') || body.includes('正文字数') ||
                    body.includes('保存为草稿')) return true;
                return false;
            })()
        """)
        if found:
            log.info("[WX] Editor page loaded")
            return True
        await asyncio.sleep(1)
    log.warning("[WX] Editor not detected within timeout")
    return False


async def _wait_for_image_editor(session, timeout=30):
    """Wait for the 贴图 editor to load."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        found = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                if (body.includes('选择或拖拽图片') || body.includes('请在这里输入标题') ||
                    body.includes('填写描述信息') || body.includes('保存为草稿')) return true;
                return false;
            })()
        """)
        if found:
            log.info("[WX] Image editor loaded")
            return True
        await asyncio.sleep(1)
    return False


async def _fill_title(session, title: str):
    """Fill the title field."""
    # Try standard selectors
    sel = await find_element(session, selector_key="wx_title_input")
    if sel:
        escaped_sel = _js_sel(sel)
        escaped_val = json.dumps(title)
        await session.evaluate(f"""
            (() => {{
                const el = document.querySelector('{escaped_sel}');
                if (el) {{
                    el.focus();
                    el.click();
                    // Clear existing content
                    document.execCommand('selectAll');
                    document.execCommand('delete');
                }}
            }})()
        """)
        await asyncio.sleep(0.3)
        for char in title:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.03)
        log.info(f"[WX] Title set: {title[:30]}...")
        return

    # AI vision fallback
    log.info("[WX] Using AI to find title input")
    clicked = await find_and_click(session, '找到标题输入框（显示"请在这里输入标题"的区域）并点击')
    if clicked:
        await asyncio.sleep(0.5)
        for char in title:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.03)
        log.info("[WX] Title typed via AI")


async def _fill_content(session, content: str):
    """Fill the body/content area (works for both article rich editor and image description)."""
    sel = await find_element(session, selector_key="wx_content_editor")
    if sel:
        escaped_sel = _js_sel(sel)
        # For rich editor, set innerHTML with paragraph wrapping
        paragraphs = content.split("\n")
        html_parts = []
        for p in paragraphs:
            html_parts.append(f"<p>{p}</p>" if p.strip() else "<p><br></p>")
        html_content = "".join(html_parts)
        escaped_html = json.dumps(html_content)
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
        log.info(f"[WX] Content set ({len(content)} chars)")
        return

    # Try description textarea for 贴图 mode
    desc_sel = await find_element(session, selector_key="wx_desc_input")
    if desc_sel:
        await set_input_value(session, selectors=[desc_sel], value=content)
        log.info(f"[WX] Description set ({len(content)} chars)")
        return

    # AI fallback
    log.info("[WX] Using AI to find content editor")
    clicked = await find_and_click(session, '找到正文编辑区域（显示"从这里开始写正文"或"填写描述信息"的区域）并点击')
    if clicked:
        await asyncio.sleep(0.5)
        for char in content:
            await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
            await asyncio.sleep(0.02)


async def _upload_cover(session, image_path: str):
    """Upload cover image for article/video."""
    # Try to find cover upload area
    clicked = await session.evaluate("""
        (() => {
            const els = document.querySelectorAll('span, div, p, a');
            for (const el of els) {
                const text = (el.textContent || '').trim();
                if (text.includes('拖拽或选择封面') || text.includes('选择封面')) {
                    el.click();
                    return true;
                }
            }
            return false;
        })()
    """)
    if clicked:
        await asyncio.sleep(2)
        # Upload via file input
        try:
            await upload_files(session, [image_path])
            log.info("[WX] Cover uploaded")
            await delay(2, 4)
        except Exception as e:
            log.warning(f"[WX] Cover upload failed: {e}")


async def _upload_images(session, image_paths: list):
    """Upload images for 贴图 mode."""
    if not image_paths:
        return

    # Click upload area or find file input
    clicked = await session.evaluate("""
        (() => {
            const els = document.querySelectorAll('span, div, p, a');
            for (const el of els) {
                const text = (el.textContent || '').trim();
                if (text.includes('选择或拖拽图片') || text.includes('拖拽图片')) {
                    el.click();
                    return true;
                }
            }
            return false;
        })()
    """)
    if clicked:
        await asyncio.sleep(1)

    try:
        await upload_files(session, image_paths, selector_key="wx_upload_input")
        log.info(f"[WX] Uploaded {len(image_paths)} images")
        await delay(2, 5)
    except Exception as e:
        log.warning(f"[WX] Image upload failed: {e}")
        # AI fallback
        ai_clicked = await find_and_click(session, '找到图片上传区域（显示"选择或拖拽图片到此处"的区域）并点击')
        if ai_clicked:
            await asyncio.sleep(1)
            await upload_files(session, image_paths)
            await delay(2, 5)


async def _upload_video(session, video_path: str):
    """Upload video for video mode."""
    # Click "本地上传" button in the video selection dialog
    clicked = await session.evaluate("""
        (() => {
            const btns = document.querySelectorAll('button, a, span, div');
            for (const btn of btns) {
                const text = (btn.textContent || '').trim();
                if (text === '本地上传') {
                    btn.click();
                    return true;
                }
            }
            return false;
        })()
    """)
    if clicked:
        await asyncio.sleep(2)

    try:
        await upload_files(session, [video_path], selector_key="wx_upload_input")
        log.info("[WX] Video uploaded")
        # Video upload takes longer
        await delay(5, 15)
    except Exception as e:
        log.warning(f"[WX] Video upload failed: {e}")
        ai_clicked = await find_and_click(session, '找到"本地上传"按钮并点击')
        if ai_clicked:
            await asyncio.sleep(2)
            await upload_files(session, [video_path])
            await delay(5, 15)

    # After upload, wait for the editor to appear
    await _wait_for_editor(session, timeout=60)


async def _click_publish(session):
    """Click the 发表 button."""
    # Try JS text match
    clicked = await session.evaluate("""
        (() => {
            const buttons = document.querySelectorAll('button, [role="button"], a');
            for (const btn of buttons) {
                const text = btn.textContent.trim();
                if (text === '发表') {
                    btn.scrollIntoView({block: 'center'});
                    btn.click();
                    return true;
                }
            }
            return false;
        })()
    """)
    if clicked:
        log.info("[WX] Clicked '发表' button")
        await asyncio.sleep(3)

        # Handle confirmation dialog if any
        await session.evaluate("""
            (() => {
                const btns = document.querySelectorAll('button, a');
                for (const btn of btns) {
                    const t = (btn.textContent || '').trim();
                    if (t === '确定' || t === '确认发表' || t === '确定发表') {
                        btn.click(); return true;
                    }
                }
                return false;
            })()
        """)
        return

    # AI fallback
    log.info("[WX] Using AI to find '发表' button")
    ai_clicked = await find_and_click(session, '找到页面底部的"发表"按钮（不是"保存为草稿"也不是"预览"）')
    if ai_clicked:
        await asyncio.sleep(3)
        return

    raise RuntimeError("WX: Could not find '发表' button")


async def publish(session, task) -> str:
    """
    Publish content to WeChat Official Account.
    Supports content_type: 'article' (文章), 'image' (贴图), 'video' (视频).
    """
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths
    content_type = getattr(task, "content_type", "article") or "article"

    # Map legacy types
    if content_type == "image":
        content_type = "image"  # 贴图
    elif content_type == "video":
        content_type = "video"
    else:
        content_type = "article"

    # 1. Navigate to dashboard
    log.info(f"[WX] Navigating to {MP_HOME}")
    await session.navigate(MP_HOME)
    await asyncio.sleep(4)

    # Check login
    if not await check_login(session):
        raise PermissionError("WX: Not logged in, please scan QR code first")
    log.info("[WX] Login confirmed")

    # Dismiss popups
    await _dismiss_popups(session)
    await asyncio.sleep(1)

    # 2. Click the creation type button
    await _click_create_type(session, content_type)

    # 3. Handle each content type
    if content_type == "image":
        # 贴图 mode
        if not await _wait_for_image_editor(session):
            analysis = await get_page_analysis(session, "当前页面是什么？贴图编辑器加载了吗？")
            log.info(f"[WX] Page analysis: {analysis[:200]}")

        await _dismiss_popups(session)
        await asyncio.sleep(1)

        # Upload images
        if media_paths:
            await _upload_images(session, media_paths)

        await delay(1, 2)

        # Fill title
        if task.title:
            await _fill_title(session, task.title)
            await delay(0.5, 1)

        # Fill description
        if task.content:
            await _fill_content(session, task.content)
            await delay(0.5, 1)

    elif content_type == "video":
        # Video mode — video selection dialog appears
        await asyncio.sleep(3)

        # Upload video
        if media_paths:
            await _upload_video(session, media_paths[0])

        await _dismiss_popups(session)
        await delay(1, 2)

        # Fill title
        if task.title:
            await _fill_title(session, task.title)
            await delay(0.5, 1)

        # Fill content
        if task.content:
            await _fill_content(session, task.content)
            await delay(0.5, 1)

    else:
        # Article mode (default)
        if not await _wait_for_editor(session):
            analysis = await get_page_analysis(session, "当前页面是什么？文章编辑器加载了吗？")
            log.info(f"[WX] Page analysis: {analysis[:200]}")

        await _dismiss_popups(session)
        await asyncio.sleep(1)

        # Fill title
        if task.title:
            await _fill_title(session, task.title)
            await delay(0.5, 1)

        # Fill content
        if task.content:
            await _fill_content(session, task.content)
            await delay(0.5, 1)

        # Upload cover image (use first image if available)
        if media_paths:
            await _upload_cover(session, media_paths[0])

    await delay(1, 2)

    # 4. Click publish
    log.info("[WX] Publishing...")
    old_url = await get_current_url(session)
    await _click_publish(session)
    await delay(3, 5)

    # 5. Check result
    new_url = await get_current_url(session)
    success = await session.evaluate("""
        (() => {
            const body = document.body.innerText || '';
            if (body.includes('发表成功') || body.includes('已发表') ||
                body.includes('发布成功') || body.includes('已发布')) return true;
            return false;
        })()
    """)

    if success or new_url != old_url:
        log.info(f"[WX] Published successfully! URL: {new_url}")
        return new_url

    # AI check
    analysis = await get_page_analysis(session, "发表是否成功了？有没有成功提示或错误信息？")
    log.info(f"[WX] AI result: {analysis[:200]}")
    if "成功" in analysis:
        return new_url

    raise RuntimeError(f"WX publish may have failed: {analysis[:100]}")
