"""
Douyin (抖音) creator platform publisher via CDP.
Supports both video and image-text (图文) publishing.

Real flow (from screenshot):
1. Navigate to /creator-micro/content/upload → shows homepage with cards
2. Click "发布视频" or "发布图文" CARD → navigates to upload form page
3. On upload form: click upload area / find file input → upload files
4. Wait for editor form → fill title + content + tags
5. Scroll down → click 发布 button
6. Check for success (toast "发布成功" or redirect to /manage)
"""
import asyncio
import json
import logging
from pathlib import Path

from cdp.actions import (
    upload_files, set_input_value, type_text, click,
    check_element_exists, wait_for_element, get_current_url,
    find_element, _js_sel, take_screenshot,
)
from services.ai_vision import find_and_click, get_page_analysis
from utils.anti_detect import human_delay as delay

log = logging.getLogger(__name__)

# Douyin creator center — this shows the homepage with publish cards
CREATOR_HOME = "https://creator.douyin.com/creator-micro/content/upload"


async def check_login(session) -> bool:
    url = await get_current_url(session)
    log.info(f"[DY] Current URL for login check: {url}")

    # URL-based login detection
    login_indicators = ["/login", "passport.", "sso.", "signin"]
    if any(p in url.lower() for p in login_indicators):
        return False

    # CRITICAL: Douyin shows login form on same URL without redirect
    # Must check page content for login form
    is_login_form = await session.evaluate("""
        (() => {
            const body = document.body.innerText || '';
            const loginTexts = ['扫码登录', '验证码登录', '密码登录', '登录/注册',
                                '登录或注册', '如何扫码', '我是MCN机构'];
            for (const t of loginTexts) {
                if (body.includes(t)) return true;
            }
            return false;
        })()
    """)
    if is_login_form:
        log.info("[DY] Login form detected on page — NOT logged in")
        return False

    # Positive login indicators
    if "creator.douyin.com" in url:
        logged_in = await check_element_exists(session, selector_key="dy_login_check")
        if logged_in:
            return True
        has_content = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                return body.includes('内容管理') || body.includes('新的创作') ||
                       body.includes('作品管理') || body.includes('数据中心') ||
                       body.includes('粉丝');
            })()
        """)
        if has_content:
            return True

    return False


async def _dismiss_popups(session):
    """Close any popup dialogs like '我知道了' etc."""
    await session.evaluate("""
        (() => {
            const btns = document.querySelectorAll('button, span, div, a');
            for (const btn of btns) {
                const text = btn.textContent.trim();
                if (text === '我知道了' || text === '知道了' || text === '关闭' ||
                    text === '暂不' || text === '取消') {
                    btn.click();
                    return true;
                }
            }
            // Close X buttons on modals
            const closeBtn = document.querySelector('.semi-modal-close, [class*="modal"] [class*="close"], [aria-label="close"]');
            if (closeBtn) { closeBtn.click(); return true; }
            return false;
        })()
    """)
    await asyncio.sleep(0.5)


async def _click_publish_card(session, content_type: str):
    """Click the '发布视频' or '发布图文' CARD on the homepage to navigate to upload form."""
    card_text = "发布图文" if content_type == "image" else "发布视频"

    # The cards on homepage contain text like "发布视频\n支持常用格式..."
    # We need to find the card element and click it — it's a navigation link
    clicked = await session.evaluate(f"""
        (() => {{
            // Method 1: Find card by partial text match
            const allEls = document.querySelectorAll('div, a, span, button, li, p, h3, label');
            for (const el of allEls) {{
                // Only match elements where the text starts with the card name
                const text = el.textContent.trim();
                if (text.startsWith("{card_text}") && text.length < 50) {{
                    // Make sure it's a clickable card, not a tiny text node
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 50 && rect.height > 30) {{
                        el.scrollIntoView({{block: 'center'}});
                        el.click();
                        return 'clicked: ' + text.substring(0, 30);
                    }}
                }}
            }}
            // Method 2: Try exact text match on smaller elements
            for (const el of allEls) {{
                const text = el.textContent.trim();
                if (text === "{card_text}") {{
                    // Click the parent card container
                    const card = el.closest('div[class]') || el.parentElement;
                    if (card) {{
                        card.click();
                        return 'clicked parent of: ' + text;
                    }}
                    el.click();
                    return 'clicked exact: ' + text;
                }}
            }}
            return false;
        }})()
    """)

    if clicked:
        log.info(f"[DY] {clicked}")
        await asyncio.sleep(4)  # Wait for navigation to upload form
        new_url = await get_current_url(session)
        log.info(f"[DY] After card click, URL: {new_url}")
        return True

    # AI vision fallback
    log.info(f"[DY] Using AI to find '{card_text}' card")
    ai_clicked = await find_and_click(
        session,
        f'在"新的创作"区域找到"{card_text}"卡片并点击。卡片上有图标和文字"{card_text}"，下面有灰色小字描述。'
    )
    if ai_clicked:
        await asyncio.sleep(4)
        new_url = await get_current_url(session)
        log.info(f"[DY] After AI card click, URL: {new_url}")
        return True

    log.warning(f"[DY] Could not find '{card_text}' card")
    return False


async def _wait_for_upload_page(session, timeout=15):
    """Wait for the upload form page to fully load (with file input or upload area)."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        # Check for file input
        has_input = await session.evaluate('document.querySelectorAll(\'input[type="file"]\').length > 0')
        if has_input:
            log.info("[DY] Upload page ready (file input found)")
            return True

        # Check for upload area text
        has_upload_area = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                return body.includes('点击上传') || body.includes('拖拽') ||
                       body.includes('上传视频') || body.includes('上传图片') ||
                       body.includes('选择文件');
            })()
        """)
        if has_upload_area:
            log.info("[DY] Upload page ready (upload area text found)")
            return True

        await asyncio.sleep(1)

    log.warning("[DY] Upload page did not load within timeout")
    return False


async def _wait_for_editor(session, timeout=120):
    """Wait for the editing form to appear after upload completes."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        # Check URL change to publish page
        url = await get_current_url(session)
        if "publish" in url and "upload" not in url:
            log.info(f"[DY] Redirected to publish page: {url}")
            await asyncio.sleep(2)
            return True

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
        await asyncio.sleep(3)
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
    clicked = await find_and_click(session, '找到"填写作品标题"的输入框并点击')
    if clicked:
        await asyncio.sleep(0.5)
        # Insert full text at once to avoid race conditions with char-by-char input
        await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(truncated)})")
        await asyncio.sleep(0.3)
        log.info("[DY] Title typed via AI vision")


async def _fill_content(session, content: str):
    """Fill description/content. Type into the .ace-line editor or contenteditable."""
    truncated = content[:1000]

    # Try known selectors
    sel = await find_element(session, selector_key="dy_content_editor")
    if sel:
        escaped_sel = _js_sel(sel)
        await session.evaluate(f"""
            (() => {{
                const el = document.querySelector('{escaped_sel}');
                if (el) {{ el.focus(); el.click(); }}
            }})()
        """)
        await asyncio.sleep(0.3)
        # Insert full text at once to avoid race conditions
        await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(truncated)})")
        await asyncio.sleep(0.5)
        log.info(f"[DY] Content typed ({len(truncated)} chars)")
        return

    # Try .ace-line (Douyin's custom editor)
    ace_found = await session.evaluate("""
        (() => {
            const el = document.querySelector('.ace-line > div, .ace-line');
            if (el) { el.click(); return true; }
            return false;
        })()
    """)
    if ace_found:
        await asyncio.sleep(0.3)
        # Insert full text at once to avoid race conditions
        await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(truncated)})")
        await asyncio.sleep(0.5)
        log.info(f"[DY] Content typed via .ace-line ({len(truncated)} chars)")
        return

    log.info("[DY] Content editor not found, using AI vision")
    clicked = await find_and_click(session, '找到"添加作品简介"或"作品描述"的文本编辑区域并点击')
    if clicked:
        await asyncio.sleep(0.5)
        # Insert full text at once to avoid race conditions
        await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(truncated)})")
        await asyncio.sleep(0.5)
        log.info("[DY] Content typed via AI vision")


async def _scroll_to_bottom(session):
    """Scroll the page to make the publish button visible."""
    await session.evaluate("""
        (() => {
            // Scroll all possible containers (some platforms use inner scrollable divs)
            const all = document.querySelectorAll('div, section, main');
            for (const el of all) {
                if (el.scrollHeight > el.clientHeight + 100 && el.clientHeight > 200) {
                    el.scrollTop = el.scrollHeight;
                }
            }
            window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'});
            document.documentElement.scrollTop = document.documentElement.scrollHeight;
        })()
    """)
    await asyncio.sleep(1.5)
    await session.evaluate("""
        window.scrollTo({top: document.body.scrollHeight, behavior: 'smooth'})
    """)
    await asyncio.sleep(1)
    log.info("[DY] Scrolled to bottom")


async def _set_scheduled_time(session, scheduled_at):
    """Set Douyin's built-in scheduled publish time (定时发布). Max 14 days ahead."""
    from datetime import datetime, timedelta

    if isinstance(scheduled_at, str):
        scheduled_at = datetime.fromisoformat(scheduled_at)

    now = datetime.now()
    diff = (scheduled_at - now).total_seconds()
    if diff < 120:  # Less than 2 min away, platform can't handle
        log.info("[DY] Scheduled time is too soon (<2min), will publish immediately")
        return
    if diff > 14 * 86400:
        log.warning("[DY] Scheduled time >14 days, Douyin max is 14 days. Publishing immediately.")
        return

    log.info(f"[DY] Setting scheduled publish time: {scheduled_at}")
    await _scroll_to_bottom(session)
    await asyncio.sleep(1)

    # Step 1: Find and click "定时发布" radio/toggle
    # Douyin uses radio buttons: ● 立即发布  ○ 定时发布
    clicked_toggle = await session.evaluate("""
        (() => {
            // Method 1: Find all radio-like elements containing "定时发布"
            // Douyin uses Semi Design radio: label.semi-radio > input.semi-radio-inner-input + span
            const allEls = document.querySelectorAll('label, span, div, p');
            for (const el of allEls) {
                const text = el.textContent.trim();
                if (text === '定时发布') {
                    // Try clicking the parent radio label (Semi Design pattern)
                    const radioLabel = el.closest('label[class*="radio"], [class*="radio-wrapper"], label');
                    if (radioLabel) {
                        const radioInput = radioLabel.querySelector('input[type="radio"], [class*="radio-inner"]');
                        if (radioInput) { radioInput.click(); return 'clicked radio input in label'; }
                        radioLabel.click();
                        return 'clicked radio label';
                    }
                    // Try finding radio input in parent container
                    const parent = el.parentElement;
                    if (parent) {
                        const radio = parent.querySelector('input[type="radio"], [class*="radio-input"], [class*="semi-radio"]');
                        if (radio) { radio.click(); return 'clicked radio in parent'; }
                        parent.click();
                        return 'clicked parent of 定时发布';
                    }
                    el.click();
                    return 'clicked text directly';
                }
            }
            // Method 2: Search radio groups for second option (定时发布 is typically the 2nd radio)
            const radioGroups = document.querySelectorAll('[class*="radio-group"], [role="radiogroup"]');
            for (const group of radioGroups) {
                const radios = group.querySelectorAll('label, [class*="radio-wrapper"]');
                for (const r of radios) {
                    if (r.textContent.includes('定时发布')) {
                        const inp = r.querySelector('input');
                        if (inp) { inp.click(); return 'clicked radio in group'; }
                        r.click();
                        return 'clicked radio wrapper in group';
                    }
                }
            }
            return false;
        })()
    """)
    if clicked_toggle:
        log.info(f"[DY] Schedule toggle: {clicked_toggle}")
        await asyncio.sleep(2)
    else:
        # AI vision fallback
        log.info("[DY] Using AI to find 定时发布 radio button")
        await _save_debug_screenshot(session, "before_schedule_toggle")
        ai_clicked = await find_and_click(
            session,
            '在"发布设置"区域的"发布时间"一行中，找到"定时发布"旁边的圆形单选按钮(radio button)并点击。'
            '当前"立即发布"被选中（红色圆点），需要点击右边"定时发布"前面的空心圆圈来切换。'
        )
        if ai_clicked:
            await asyncio.sleep(2)
        else:
            log.warning("[DY] Could not find 定时发布 radio, will publish immediately")
            return

    await _save_debug_screenshot(session, "after_schedule_toggle")

    # Step 2: Set date and time in the picker that appeared after clicking 定时发布
    date_str = scheduled_at.strftime("%Y-%m-%d")
    time_str = scheduled_at.strftime("%H:%M")
    dt_str = f"{date_str} {time_str}"

    # After clicking 定时发布 radio, a DatePicker should appear
    # Douyin uses Semi Design DatePicker — it renders an input inside a .semi-datepicker
    # First, click the date picker input to open the calendar popup
    picker_clicked = await session.evaluate("""
        (() => {
            // Find the date picker input that appeared after toggling 定时发布
            const selectors = [
                '.semi-datepicker input',
                '.semi-datepicker-input',
                '[class*="datepicker"] input',
                '[class*="date-picker"] input',
                '[class*="scheduled"] input',
                'input[placeholder*="日期"]',
                'input[placeholder*="选择时间"]',
                'input[placeholder*="请选择"]',
            ];
            for (const sel of selectors) {
                const inp = document.querySelector(sel);
                if (inp && inp.offsetParent !== null) {
                    inp.focus();
                    inp.click();
                    return 'clicked:' + sel;
                }
            }
            // Fallback: find any new input near "发布时间" row
            const labels = document.querySelectorAll('span, div, label');
            for (const lbl of labels) {
                if (lbl.textContent.trim() === '发布时间') {
                    const row = lbl.closest('div[class]') || lbl.parentElement;
                    if (row) {
                        const inp = row.querySelector('input');
                        if (inp) { inp.focus(); inp.click(); return 'clicked input near label'; }
                    }
                }
            }
            return false;
        })()
    """)

    if picker_clicked:
        log.info(f"[DY] Date picker opened: {picker_clicked}")
        await asyncio.sleep(1)

        # Now the calendar popup should be open. Clear and type the date/time.
        typed = await session.evaluate(f"""
            (() => {{
                // Find the focused/active input in the picker
                const inp = document.activeElement;
                if (inp && inp.tagName === 'INPUT') {{
                    // Use React-compatible setter
                    const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
                    if (proto && proto.set) {{
                        proto.set.call(inp, '{dt_str}');
                    }} else {{
                        inp.value = '{dt_str}';
                    }}
                    inp.dispatchEvent(new Event('input', {{bubbles: true}}));
                    inp.dispatchEvent(new Event('change', {{bubbles: true}}));
                    return 'set active input';
                }}
                // Try all visible picker inputs
                const inputs = document.querySelectorAll('.semi-datepicker input, [class*="picker"] input');
                for (const i of inputs) {{
                    if (i.offsetParent) {{
                        const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
                        if (proto && proto.set) {{ proto.set.call(i, '{dt_str}'); }}
                        else {{ i.value = '{dt_str}'; }}
                        i.dispatchEvent(new Event('input', {{bubbles: true}}));
                        i.dispatchEvent(new Event('change', {{bubbles: true}}));
                        return 'set picker input';
                    }}
                }}
                return false;
            }})()
        """)

        if typed:
            log.info(f"[DY] Date/time value set: {typed}")
        else:
            # Fallback: select all text and type char by char
            log.info("[DY] Typing date/time char by char")
            await session.evaluate("document.execCommand('selectAll')")
            await asyncio.sleep(0.2)
            for char in dt_str:
                await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
                await asyncio.sleep(0.05)

        await asyncio.sleep(1)

        # Press Enter or click 确定 to confirm the date
        await session.evaluate("""
            (() => {
                // Try pressing Enter on active element
                const inp = document.activeElement;
                if (inp) {
                    inp.dispatchEvent(new KeyboardEvent('keydown', {key: 'Enter', keyCode: 13, bubbles: true}));
                }
                // Also try clicking 确定 button in picker popup
                const btns = document.querySelectorAll('.semi-datepicker-footer button, .semi-button, button');
                for (const btn of btns) {
                    const t = (btn.textContent || '').trim();
                    if ((t === '确定' || t === '确认') && btn.offsetParent !== null) {
                        btn.click(); return;
                    }
                }
            })()
        """)
        await asyncio.sleep(1)
    else:
        # AI vision fallback
        log.info("[DY] Using AI to find and fill date/time picker")
        await _save_debug_screenshot(session, "no_picker_found")
        ai_clicked = await find_and_click(
            session,
            '在"发布时间"行中，"定时发布"被选中后应该出现一个日期时间选择器。'
            '请找到这个日期时间输入框并点击它。'
        )
        if ai_clicked:
            await asyncio.sleep(1)
            await session.evaluate("document.execCommand('selectAll')")
            await asyncio.sleep(0.2)
            for char in dt_str:
                await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(char)})")
                await asyncio.sleep(0.05)
            await asyncio.sleep(1)
            # Confirm
            await session.evaluate("""
                (() => {
                    const btns = document.querySelectorAll('button, span');
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

    # Step 3: Verify scheduled time was set
    await _save_debug_screenshot(session, "scheduled_time")
    verify = await get_page_analysis(
        session,
        '请检查页面上的"发布时间"一行：是否已选中"定时发布"（而不是"立即发布"）？'
        '日期时间是否已正确填入？只回答JSON: {"scheduled": true/false, "time_shown": "显示的时间", "description": "简要描述"}'
    )
    log.info(f"[DY] Schedule verification: {verify[:200]}")
    log.info(f"[DY] Scheduled publish time configured: {scheduled_at}")


async def _click_publish(session):
    """Click the red 发布 button at the bottom."""
    await _scroll_to_bottom(session)

    # Method 1: Search all clickable elements for exact "发布" text
    clicked = await session.evaluate("""
        (() => {
            const els = document.querySelectorAll('button, [role="button"], a, div, span');
            for (const el of els) {
                const text = (el.textContent || '').replace(/\\s+/g, '').trim();
                const rect = el.getBoundingClientRect();
                if (text === '发布' && rect.height > 20 && rect.width > 50) {
                    el.scrollIntoView({block: 'center'});
                    el.click();
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
    ai_clicked = await find_and_click(session, '找到红色的"发布"按钮（不是"暂存离开"），在页面底部')
    if ai_clicked:
        return

    raise RuntimeError("DY: Could not find 发布 button")


async def _save_debug_screenshot(session, label: str):
    """Save a debug screenshot for troubleshooting."""
    try:
        debug_dir = Path(__file__).parent.parent.parent / "data" / "debug"
        debug_dir.mkdir(parents=True, exist_ok=True)
        screenshot = await take_screenshot(session)
        debug_path = debug_dir / f"dy_{label}_{int(asyncio.get_event_loop().time())}.png"
        debug_path.write_bytes(screenshot)
        log.info(f"[DY] Debug screenshot saved: {debug_path}")
    except Exception as e:
        log.warning(f"[DY] Failed to save debug screenshot: {e}")


async def publish(session, task) -> str:
    """
    Publish to Douyin (video or image-text).
    Returns published URL or raises on failure.
    """
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths
    tags = json.loads(task.tags) if isinstance(task.tags, str) else task.tags
    content_type = getattr(task, "content_type", "video") or "video"

    # 1. Navigate to creator center homepage
    log.info(f"[DY] Navigating to creator center (type={content_type})")
    await session.navigate(CREATOR_HOME)
    await asyncio.sleep(5)

    # Check login
    if not await check_login(session):
        raise PermissionError("Douyin: Not logged in, cookies expired")
    log.info("[DY] Login confirmed")

    # Dismiss any popup dialogs (like "我知道了")
    await _dismiss_popups(session)
    await asyncio.sleep(1)

    # Debug: log page state
    page_text = await session.evaluate("document.body.innerText.substring(0, 300)")
    log.info(f"[DY] Page text: {page_text[:150]}")
    await _save_debug_screenshot(session, "homepage")

    # 2. Click the publish card (发布视频 or 发布图文) to navigate to upload form
    if not await _click_publish_card(session, content_type):
        # Fallback: try direct URL navigation
        direct_url = "https://creator.douyin.com/creator-micro/content/publish?enter_from=publish_page"
        log.info(f"[DY] Card click failed, trying direct URL: {direct_url}")
        await session.navigate(direct_url)
        await asyncio.sleep(4)

    # Dismiss popups again on the new page
    await _dismiss_popups(session)

    # 3. Wait for upload page to be ready
    await _save_debug_screenshot(session, "upload_page")
    page_text2 = await session.evaluate("document.body.innerText.substring(0, 300)")
    log.info(f"[DY] Upload page text: {page_text2[:150]}")
    file_count = await session.evaluate('document.querySelectorAll(\'input[type="file"]\').length')
    log.info(f"[DY] File inputs on upload page: {file_count}")

    if not await _wait_for_upload_page(session, timeout=15):
        analysis = await get_page_analysis(session, "当前页面是什么？有没有上传文件的区域？有没有input[type=file]元素？")
        log.info(f"[DY] Page analysis: {analysis[:200]}")

    # 4. Upload media files
    if not media_paths:
        raise RuntimeError(f"Douyin requires at least one {'video' if content_type == 'video' else 'image'}")

    log.info(f"[DY] Uploading {len(media_paths)} files")
    await upload_files(session, media_paths, selector_key="dy_upload_input", timeout=30)

    # 4.5. Check for upload failure and retry (up to 3 times)
    for upload_retry in range(3):
        await asyncio.sleep(5)  # Wait for upload to start processing
        upload_failed = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                return body.includes('上传失败') || body.includes('重新上传') ||
                       body.includes('上传出错') || body.includes('上传异常');
            })()
        """)
        if not upload_failed:
            break
        log.warning(f"[DY] Upload failed detected, retry {upload_retry + 1}/3")
        await _save_debug_screenshot(session, f"upload_failed_{upload_retry}")

        # Try clicking "重新上传" link/button first
        retry_clicked = await session.evaluate("""
            (() => {
                const els = document.querySelectorAll('a, button, span, div');
                for (const el of els) {
                    const text = el.textContent.trim();
                    if (text === '重新上传' || text === '重试') {
                        el.click();
                        return true;
                    }
                }
                return false;
            })()
        """)
        if retry_clicked:
            log.info("[DY] Clicked '重新上传' button")
            await asyncio.sleep(3)
            # Re-upload files
            try:
                await upload_files(session, media_paths, selector_key="dy_upload_input", timeout=30)
            except Exception as e:
                log.warning(f"[DY] Re-upload attempt failed: {e}")
        else:
            # Reload the page and try from scratch
            log.info("[DY] No retry button found, reloading page")
            await session.navigate(await get_current_url(session))
            await asyncio.sleep(5)
            try:
                await upload_files(session, media_paths, selector_key="dy_upload_input", timeout=30)
            except Exception as e:
                log.warning(f"[DY] Re-upload after reload failed: {e}")

    # 5. Wait for upload processing + editor form
    log.info("[DY] Waiting for upload and editor...")
    if not await _wait_for_editor(session, timeout=120):
        await _save_debug_screenshot(session, "editor_wait_timeout")
        analysis = await get_page_analysis(session, "当前页面状态是什么？上传完成了吗？有没有出现标题和描述编辑区域？")
        log.info(f"[DY] Page analysis: {analysis[:200]}")

    await delay(2, 3)
    await _save_debug_screenshot(session, "editor")

    # 6. Fill title (required for video, optional for image-text)
    title_text = task.title or (task.content[:30] if task.content and content_type == "video" else "")
    if title_text:
        log.info(f"[DY] Setting title: {title_text[:30]}...")
        await _fill_title(session, title_text)
        await delay(0.5, 1)

    # 7. Fill content/description
    if task.content:
        log.info(f"[DY] Setting content ({len(task.content)} chars)")
        await _fill_content(session, task.content)
        await delay(0.5, 1)

    # 8. Add tags in content editor
    if tags:
        log.info(f"[DY] Adding {len(tags)} tags")
        # Focus content editor first
        sel = await find_element(session, selector_key="dy_content_editor")
        target_sel = sel or '.ace-line'
        if sel or await session.evaluate("!!document.querySelector('.ace-line')"):
            escaped_sel = _js_sel(target_sel)
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
                    # Try click suggestion dropdown
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

    # 9. Set scheduled publish time (if task has a future scheduled_at)
    scheduled_at = getattr(task, "scheduled_at", None)
    if scheduled_at:
        await _set_scheduled_time(session, scheduled_at)
        await delay(1, 2)

    # 10. Scroll down and click publish
    log.info("[DY] Publishing...")
    old_url = await get_current_url(session)
    await _click_publish(session)
    await delay(3, 5)

    # 11. Check for SMS verification dialog — if present, restore window and wait for user
    sms_wait_timeout = 300  # 5 minutes for user to complete SMS verification
    sms_poll_interval = 3

    for attempt in range(sms_wait_timeout // sms_poll_interval):
        # Check if SMS verification dialog is showing
        has_sms = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                return body.includes('接收短信验证码') || body.includes('请输入验证码') ||
                       body.includes('短信验证码') || body.includes('获取验证码') ||
                       body.includes('发送短信验证') || body.includes('安全验证');
            })()
        """)

        if has_sms:
            if attempt == 0:
                log.info("[DY] SMS verification dialog detected — waiting for user to complete...")
                await _save_debug_screenshot(session, "sms_verification")
                # Restore browser window so user can see and interact
                try:
                    await session.send("Browser.setWindowBounds", {
                        "windowId": 1,
                        "bounds": {"windowState": "normal"}
                    })
                except Exception:
                    pass
            if attempt % 10 == 0 and attempt > 0:
                log.info(f"[DY] Still waiting for SMS verification... ({attempt * sms_poll_interval}s)")
            await asyncio.sleep(sms_poll_interval)
            continue

        # No SMS dialog — check result
        break

    # 12. Check result — look for toast message or URL change
    new_url = await get_current_url(session)

    # Check toast messages (Douyin uses semi-toast)
    toast_text = await session.evaluate("""
        (() => {
            const toasts = document.querySelectorAll('.semi-toast-content-text, [class*="toast"], [class*="Toast"]');
            return Array.from(toasts).map(t => t.textContent.trim()).join('|');
        })()
    """)
    log.info(f"[DY] Toast messages: {toast_text}")

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

    if success or "manage" in new_url or "发布成功" in toast_text or "上传成功" in toast_text:
        # If toast says "上传成功", might need to click a secondary publish button
        if "上传成功" in toast_text and "发布成功" not in toast_text:
            log.info("[DY] Upload success, looking for secondary publish button...")
            await session.evaluate("""
                (() => {
                    const btns = document.querySelectorAll('button');
                    for (const btn of btns) {
                        if (btn.textContent.trim() === '发布') { btn.click(); return true; }
                    }
                    return false;
                })()
            """)
            await delay(3, 5)

        log.info(f"[DY] Published successfully!")
        await _save_debug_screenshot(session, "success")
        return new_url

    # AI check
    await _save_debug_screenshot(session, "result")
    analysis = await get_page_analysis(session, "发布成功了吗？页面显示什么状态？有什么提示消息？")
    log.info(f"[DY] AI result: {analysis[:200]}")
    if "成功" in analysis:
        return new_url

    error = await session.evaluate("""
        document.querySelector('[class*="error"], .semi-toast-content-text')?.textContent || ''
    """)
    raise RuntimeError(f"Douyin publish failed: {error or analysis[:100]}")
