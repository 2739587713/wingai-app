"""
WeChat Official Account (微信公众号) publisher via CDP.
Supports 3 content types: article (文章), image (贴图), video (视频).
Flow: navigate to mp.weixin.qq.com → click content type → upload media → fill fields → publish.

Editor DOM structure (confirmed via diagnostic):
  - Title:   textarea#title  (placeholder="请在这里输入标题")
  - Author:  input#author    (placeholder="请输入作者")
  - Body:    div.ProseMirror  (contenteditable, the main rich-text editor)
  - Upload:  input[type=file]
"""
import asyncio
import json
import logging

from cdp.actions import (
    upload_files, set_input_value, type_text, click,
    check_element_exists, wait_for_element, get_current_url,
    find_element, _js_sel,
)
from cdp.browser import get_all_tabs, CDPSession
from services.ai_vision import find_and_click, get_page_analysis
from utils.anti_detect import human_delay as delay

log = logging.getLogger(__name__)

MP_HOME = "https://mp.weixin.qq.com"


# ─── Login & Popup helpers ───────────────────────────────────────────

async def check_login(session) -> bool:
    """Check if logged into mp.weixin.qq.com."""
    url = await get_current_url(session)
    if "/cgi-bin/loginpage" in url or "action=scanlogin" in url:
        return False
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
                const closes = document.querySelectorAll(
                    '.weui-desktop-dialog__close, .dialog_wrp .btn_close, ' +
                    '[class*="close-btn"], [class*="dialog"] .icon-close, ' +
                    '.weui-desktop-btn_mini, [aria-label="关闭"]'
                );
                for (const btn of closes) {
                    if (btn.offsetParent !== null) { btn.click(); return true; }
                }
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


# ─── Dashboard navigation ───────────────────────────────────────────

async def _click_create_type(session, content_type: str):
    """Click the appropriate content creation button on the dashboard."""
    type_map = {"article": "文章", "image": "贴图", "video": "视频"}
    target_text = type_map.get(content_type, "文章")
    log.info(f"[WX] Looking for '{target_text}' creation button")

    clicked = await session.evaluate(f"""
        (() => {{
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
        session, f'在页面底部"新的创作"区域找到"{target_text}"按钮并点击'
    )
    if ai_clicked:
        await asyncio.sleep(3)
        return True

    raise RuntimeError(f"WX: Could not find '{target_text}' creation button")


async def _switch_to_new_tab(session, cdp_port, tabs_before):
    """After clicking a button that opens a new tab, switch CDP session to it.
    Returns the new session, or the original if no new tab was found."""
    await asyncio.sleep(3)
    tabs_after = get_all_tabs(cdp_port)
    log.info(f"[WX] Tabs after click: {len(tabs_after)}")

    if len(tabs_after) > len(tabs_before):
        old_ws = {t["webSocketDebuggerUrl"] for t in tabs_before}
        new_tabs = [t for t in tabs_after if t["webSocketDebuggerUrl"] not in old_ws]
        if new_tabs:
            new_tab = new_tabs[-1]
            log.info(f"[WX] New tab detected: {new_tab.get('url', '')[:80]}")
            await session.close()
            new_session = CDPSession()
            await new_session.connect(new_tab["webSocketDebuggerUrl"])
            log.info("[WX] Switched to new editor tab")
            await asyncio.sleep(3)
            return new_session
    return session


# ─── Editor wait ─────────────────────────────────────────────────────

async def _wait_for_editor(session, timeout=30):
    """Wait until the article editor page loads."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        found = await session.evaluate("""
            (() => {
                // Direct element checks (most reliable)
                if (document.querySelector('#title')) return true;
                if (document.querySelector('.ProseMirror')) return true;
                // Placeholder text
                const phs = document.querySelectorAll('[placeholder]');
                for (const el of phs) {
                    const ph = el.getAttribute('placeholder') || '';
                    if (ph.includes('标题') || ph.includes('正文')) return true;
                }
                // Button text
                const body = document.body.innerText || '';
                if (body.includes('保存为草稿') || body.includes('正文字数')) return true;
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
                if (document.querySelector('#title')) return true;
                return false;
            })()
        """)
        if found:
            log.info("[WX] Image editor loaded")
            return True
        await asyncio.sleep(1)
    return False


# ─── Field filling ───────────────────────────────────────────────────

async def _fill_title(session, title: str) -> bool:
    """Fill the title field (textarea#title)."""
    # Direct selector first (confirmed by DOM diagnostic)
    filled = await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('#title') ||
                       document.querySelector('textarea[placeholder*="标题"]');
            if (!el) return false;
            el.focus();
            el.value = {json.dumps(title)};
            el.dispatchEvent(new Event('input', {{ bubbles: true }}));
            el.dispatchEvent(new Event('change', {{ bubbles: true }}));
            return true;
        }})()
    """)
    if filled:
        log.info(f"[WX] Title set: {title[:30]}...")
        return True

    # Fallback: try standard selectors
    sel = await find_element(session, selector_key="wx_title_input")
    if sel:
        await set_input_value(session, selectors=[sel], value=title)
        log.info(f"[WX] Title set via selector: {title[:30]}...")
        return True

    log.error("[WX] Failed to find title input")
    return False


async def _fill_author(session, author: str) -> bool:
    """Fill the author field (input#author)."""
    filled = await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('#author') ||
                       document.querySelector('input[placeholder*="作者"]');
            if (!el) return false;
            el.focus();
            el.value = {json.dumps(author)};
            el.dispatchEvent(new Event('input', {{ bubbles: true }}));
            el.dispatchEvent(new Event('change', {{ bubbles: true }}));
            return true;
        }})()
    """)
    if filled:
        log.info(f"[WX] Author set: {author}")
        return True

    log.warning("[WX] Author field not found (may not exist on this editor)")
    return False


async def _fill_content_with_images(session, content: str, image_paths: list, img_position: str = "end") -> bool:
    """Fill article body with text and inline images in the ProseMirror editor.

    img_position: "start" = images before text, "end" = images after text.
    """
    # Find the ProseMirror editor
    editor_found = await session.evaluate("""
        !!document.querySelector('.ProseMirror[contenteditable="true"]')
    """)

    if not editor_found:
        # Fallback: try any large contenteditable
        editor_found = await session.evaluate("""
            (() => {
                const eds = document.querySelectorAll('[contenteditable="true"]');
                for (const el of eds) {
                    const rect = el.getBoundingClientRect();
                    if (rect.height > 100) {
                        el.classList.add('__wx_editor');
                        return true;
                    }
                }
                return false;
            })()
        """)

    if not editor_found:
        log.error("[WX] Failed to find content editor (ProseMirror)")
        return False

    # Build HTML content — images go before or after text based on img_position
    paragraphs = [p for p in content.split("\n")]
    text_parts = []
    for p in paragraphs:
        text_parts.append(f"<p>{p}</p>" if p.strip() else "<p><br></p>")

    img_placeholders = []
    for idx in range(len(image_paths)):
        img_placeholders.append(f'<p data-img-placeholder="{idx}"><br></p>')

    html_parts = []
    if image_paths and img_position == "start":
        html_parts = img_placeholders + text_parts
    elif image_paths:
        html_parts = text_parts + img_placeholders
    else:
        html_parts = text_parts

    html_content = "".join(html_parts)
    escaped_html = json.dumps(html_content)

    # Set the HTML content
    await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('.ProseMirror[contenteditable="true"]') ||
                       document.querySelector('.__wx_editor');
            if (el) {{
                el.focus();
                el.innerHTML = {escaped_html};
                el.dispatchEvent(new Event('input', {{ bubbles: true }}));
            }}
        }})()
    """)
    log.info(f"[WX] Content set ({len(content)} chars)")

    # Upload inline images via the editor's image button
    if image_paths:
        await _insert_inline_images(session, image_paths)

    return True


async def _fill_content(session, content: str) -> bool:
    """Fill the body/content area (text only, no inline images)."""
    return await _fill_content_with_images(session, content, [])


async def _insert_inline_images(session, image_paths: list):
    """Insert images into the article body via the editor's image upload."""
    for i, img_path in enumerate(image_paths):
        try:
            # Click the image button in the editor toolbar
            clicked = await session.evaluate("""
                (() => {
                    // Look for image insert button in toolbar
                    const btns = document.querySelectorAll('[class*="toolbar"] button, [class*="menu"] button, .edui-for-image, [title*="图片"], [aria-label*="图片"]');
                    for (const btn of btns) {
                        const title = (btn.getAttribute('title') || btn.getAttribute('aria-label') || btn.textContent || '').trim();
                        if (title.includes('图片') || title.includes('image')) {
                            btn.click();
                            return true;
                        }
                    }
                    // Also try the top menu "图片" link
                    const menuItems = document.querySelectorAll('a, span, div');
                    for (const el of menuItems) {
                        const text = (el.textContent || '').trim();
                        if (text === '图片' && el.offsetParent !== null) {
                            const rect = el.getBoundingClientRect();
                            // Only click if it's in the top toolbar area (y < 100)
                            if (rect.y < 100) {
                                el.click();
                                return true;
                            }
                        }
                    }
                    return false;
                })()
            """)

            if clicked:
                await asyncio.sleep(2)
                # Look for "本地上传" or upload area in the dialog
                await session.evaluate("""
                    (() => {
                        const btns = document.querySelectorAll('button, a, span, div');
                        for (const btn of btns) {
                            const text = (btn.textContent || '').trim();
                            if (text === '本地上传' || text === '上传图片') {
                                btn.click();
                                return true;
                            }
                        }
                        return false;
                    })()
                """)
                await asyncio.sleep(1)

            # Upload the image file
            await upload_files(session, [img_path])
            log.info(f"[WX] Inline image {i+1}/{len(image_paths)} uploaded")
            await delay(2, 4)

            # Confirm/close dialog if needed
            await session.evaluate("""
                (() => {
                    const btns = document.querySelectorAll('button, a');
                    for (const btn of btns) {
                        const t = (btn.textContent || '').trim();
                        if (t === '确定' || t === '插入' || t === '完成') {
                            btn.click(); return true;
                        }
                    }
                    return false;
                })()
            """)
            await asyncio.sleep(1)

        except Exception as e:
            log.warning(f"[WX] Failed to insert inline image {i+1}: {e}")


# ─── Cover & media upload ────────────────────────────────────────────

async def _upload_cover(session, image_path: str):
    """Upload cover image for article/video."""
    clicked = await session.evaluate("""
        (() => {
            const els = document.querySelectorAll('span, div, p, a');
            for (const el of els) {
                const text = (el.textContent || '').trim();
                if (text.includes('拖拽或选择封面') || text.includes('选择封面') || text.includes('上传封面')) {
                    el.click();
                    return true;
                }
            }
            return false;
        })()
    """)
    if clicked:
        await asyncio.sleep(2)
        try:
            await upload_files(session, [image_path])
            log.info("[WX] Cover uploaded")
            await delay(2, 4)

            # Confirm cover selection if dialog appears
            await session.evaluate("""
                (() => {
                    const btns = document.querySelectorAll('button, a');
                    for (const btn of btns) {
                        const t = (btn.textContent || '').trim();
                        if (t === '确定' || t === '完成' || t === '下一步') {
                            btn.click(); return true;
                        }
                    }
                    return false;
                })()
            """)
            await asyncio.sleep(1)
        except Exception as e:
            log.warning(f"[WX] Cover upload failed: {e}")


async def _upload_images(session, image_paths: list):
    """Upload images for 贴图 mode."""
    if not image_paths:
        return

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


async def _upload_video(session, video_path: str):
    """Upload video for video mode."""
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
        await delay(5, 15)
    except Exception as e:
        log.warning(f"[WX] Video upload failed: {e}")

    await _wait_for_editor(session, timeout=60)


# ─── Publish action ──────────────────────────────────────────────────

async def _click_publish(session):
    """Click the 发表 button and handle confirmation dialogs."""
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

        # Handle confirmation dialogs (only click visible dialog buttons)
        for _ in range(3):
            await asyncio.sleep(2)
            confirmed = await session.evaluate("""
                (() => {
                    // Only look for buttons inside visible dialog/modal overlays
                    const dialogs = document.querySelectorAll(
                        '.weui-desktop-dialog, .weui-desktop-dialog__wrp, ' +
                        '[class*="dialog"], [class*="modal"], [class*="confirm"]'
                    );
                    for (const dlg of dialogs) {
                        if (dlg.offsetParent === null && !dlg.classList.contains('weui-desktop-dialog__wrp')) continue;
                        const btns = dlg.querySelectorAll('button, a');
                        for (const btn of btns) {
                            const t = (btn.textContent || '').trim();
                            if ((t === '确定' || t === '确认发表' || t === '确定发表' || t === '确认')
                                && btn.offsetParent !== null) {
                                btn.click(); return true;
                            }
                        }
                    }
                    return false;
                })()
            """)
            if not confirmed:
                break
            log.info("[WX] Confirmed dialog")
        return

    raise RuntimeError("WX: Could not find '发表' button")


# ─── Main publish flow ───────────────────────────────────────────────

async def publish(session, task, cdp_port=None) -> str:
    """
    Publish content to WeChat Official Account.
    Supports content_type: 'article' (文章), 'image' (贴图), 'video' (视频).

    For articles:
      - Fills title, author, body content
      - Inserts images inline in the article body
      - cover_path → used as cover image
      - media_paths → inserted as inline content images
    """
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths
    cover_path = getattr(task, "cover_path", "") or ""
    content_type = getattr(task, "content_type", "article") or "article"

    # Map legacy types
    if content_type not in ("article", "image", "video"):
        content_type = "article"

    # ── Step 1: Navigate to dashboard ──
    log.info(f"[WX] Navigating to {MP_HOME}")
    await session.navigate(MP_HOME)
    await asyncio.sleep(4)

    if not await check_login(session):
        raise PermissionError("WX: Not logged in, please scan QR code first")
    log.info("[WX] Login confirmed")

    await _dismiss_popups(session)
    await asyncio.sleep(1)

    # ── Step 2: Click creation type & switch to new tab ──
    tabs_before = get_all_tabs(cdp_port) if cdp_port else []
    if cdp_port:
        log.info(f"[WX] Tabs before click: {len(tabs_before)}")

    await _click_create_type(session, content_type)

    if cdp_port:
        session = await _switch_to_new_tab(session, cdp_port, tabs_before)

    # ── Step 3: Fill content based on type ──
    if content_type == "image":
        # 贴图 mode
        if not await _wait_for_image_editor(session):
            log.warning("[WX] Image editor may not have loaded fully")

        await _dismiss_popups(session)
        await asyncio.sleep(1)

        if media_paths:
            await _upload_images(session, media_paths)
        await delay(1, 2)

        if task.title:
            await _fill_title(session, task.title)
            await delay(0.5, 1)
        if task.content:
            await _fill_content(session, task.content)
            await delay(0.5, 1)

    elif content_type == "video":
        await asyncio.sleep(3)
        if media_paths:
            await _upload_video(session, media_paths[0])
        await _dismiss_popups(session)
        await delay(1, 2)

        if task.title:
            await _fill_title(session, task.title)
            await delay(0.5, 1)
        if task.content:
            await _fill_content(session, task.content)
            await delay(0.5, 1)

    else:
        # ── Article mode (default) ──
        if not await _wait_for_editor(session):
            log.warning("[WX] Article editor may not have loaded fully")

        await _dismiss_popups(session)
        await asyncio.sleep(1)

        # Fill title
        title_ok = False
        if task.title:
            title_ok = await _fill_title(session, task.title)
            await delay(0.5, 1)

        # Fill author (use account nickname if available)
        author = getattr(task, "author", "") or ""
        if not author:
            # Try to get from account
            try:
                from database import SessionLocal, Account
                db = SessionLocal()
                acct = db.query(Account).get(task.account_id)
                if acct and acct.nickname:
                    author = acct.nickname
                db.close()
            except Exception:
                pass
        if author:
            await _fill_author(session, author)
            await delay(0.3, 0.5)

        # Fill body content with inline images
        # Separate cover image from content images
        content_images = []
        if media_paths:
            if cover_path and cover_path in media_paths:
                # cover_path specified explicitly — everything else is content image
                content_images = [p for p in media_paths if p != cover_path]
            elif len(media_paths) == 1:
                # Single image: use as cover only (no inline images)
                content_images = []
            else:
                # Multiple images: first is cover, rest are content images
                content_images = media_paths[1:] if len(media_paths) > 1 else []

        content_ok = False
        if task.content:
            img_pos = getattr(task, "img_position", "end") or "end"
            content_ok = await _fill_content_with_images(session, task.content, content_images, img_pos)
            await delay(0.5, 1)

        # Safety check
        if not title_ok and not content_ok:
            raise RuntimeError("WX: Failed to fill both title and content — aborting to avoid publishing empty article")

        # Upload cover image
        cover = cover_path or (media_paths[0] if media_paths else "")
        if cover:
            await _upload_cover(session, cover)

    await delay(1, 2)

    # ── Step 4: Publish ──
    log.info("[WX] Publishing...")
    old_url = await get_current_url(session)
    await _click_publish(session)
    await delay(3, 5)

    # ── Step 5: Verify result ──
    new_url = await get_current_url(session)

    # Check for success indicators
    success = await session.evaluate("""
        (() => {
            const body = document.body.innerText || '';
            // Positive signals
            if (body.includes('发表成功') || body.includes('已发表') ||
                body.includes('发布成功') || body.includes('已发布') ||
                body.includes('内容管理') || body.includes('发表记录')) return 'success';
            // Error signals
            if (body.includes('请输入正文') || body.includes('标题不能为空') ||
                body.includes('内容不能为空')) return 'error_empty';
            if (body.includes('保存为草稿') && body.includes('发表')) return 'still_editor';
            return 'unknown';
        })()
    """)

    log.info(f"[WX] Publish result check: {success}, url changed: {new_url != old_url}")

    if success == "success" or (new_url != old_url and "appmsg_edit" not in new_url):
        log.info(f"[WX] Published successfully! URL: {new_url}")
        return new_url

    if success == "error_empty":
        raise RuntimeError("WX: Publish failed — article content is empty")

    if success == "still_editor":
        # Still on editor — publish button may have triggered a validation error
        # Check for error dialogs
        error_msg = await session.evaluate("""
            (() => {
                const dialogs = document.querySelectorAll('.weui-desktop-dialog, [class*="dialog"], [class*="toast"], [class*="error"]');
                for (const d of dialogs) {
                    if (d.offsetParent !== null) {
                        return d.innerText.substring(0, 200);
                    }
                }
                return '';
            })()
        """)
        if error_msg:
            raise RuntimeError(f"WX publish error: {error_msg}")

        # Maybe waiting for confirmation — wait a bit more
        await asyncio.sleep(5)
        final_url = await get_current_url(session)
        if final_url != old_url and "appmsg_edit" not in final_url:
            log.info(f"[WX] Published after delay! URL: {final_url}")
            return final_url

        raise RuntimeError("WX: Publish may have failed — still on editor page")

    # URL changed — likely success
    if new_url != old_url:
        log.info(f"[WX] URL changed, assuming success: {new_url}")
        return new_url

    # Last resort: wait longer and check again
    await asyncio.sleep(5)
    final_url = await get_current_url(session)
    if final_url != old_url:
        log.info(f"[WX] Published after extended wait! URL: {final_url}")
        return final_url

    raise RuntimeError("WX: Publish result unclear — check manually")
