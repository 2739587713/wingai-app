"""
Kuaishou (快手) creator platform publisher via CDP.
Flow: navigate → upload → fill 作品描述 → scroll to bottom → click 发布 → click 确认发布.
Note: Kuaishou has NO title field, only 作品描述 (description textarea).
"""
import asyncio
import json
import logging

from cdp.actions import upload_files, get_current_url, take_screenshot
from utils.anti_detect import human_delay as delay

log = logging.getLogger(__name__)

UPLOAD_VIDEO_URL = "https://cp.kuaishou.com/article/publish/video"
UPLOAD_IMAGE_URL = "https://cp.kuaishou.com/article/publish/image"


async def check_login(session) -> bool:
    url = await get_current_url(session)
    if "passport" in url or "/login" in url:
        return False
    page = await session.evaluate("document.body.innerText.substring(0, 500)")
    if any(kw in page for kw in ['立即登录', '密码登录', '验证码登录', '扫码登录', '请输入手机号']):
        return False
    if any(kw in page for kw in ['发布作品', '内容管理', '数据中心']):
        return True
    return False


async def _close_modals_before_upload(session):
    """Only dismiss modals BEFORE the upload form appears.
    Safe to click: modal X buttons, 放弃(old drafts), 我知道了, 我再想想."""
    for _ in range(5):
        closed = await session.evaluate("""
            (() => {
                let n = 0;
                // Ant modal X buttons
                document.querySelectorAll('.ant-modal-close-x').forEach(el => {
                    if (el.offsetParent) { el.click(); n++; }
                });
                // Text buttons that are safe to click
                document.querySelectorAll('button, span, a').forEach(el => {
                    const t = (el.textContent || '').trim();
                    if (['我再想想', '我知道了', '放弃', '暂不', '跳过', '知道了'].includes(t)
                        && el.offsetParent && el.offsetWidth > 0 && el.offsetWidth < 200) {
                        el.click(); n++;
                    }
                });
                return n;
            })()
        """)
        if not closed:
            break
        await asyncio.sleep(1)


async def _close_guide_tips(session):
    """Close the step-by-step guide (作品信息 1/4 → 下一步)."""
    for _ in range(8):
        ok = await session.evaluate("""
            (() => {
                const els = document.querySelectorAll('button, span, div');
                for (const el of els) {
                    const t = (el.textContent || '').trim();
                    if ((t === '下一步' || t === '我知道了' || t === '完成')
                        && el.offsetParent && el.offsetWidth > 0 && el.offsetWidth < 150) {
                        el.click(); return true;
                    }
                }
                // Also try X on small guide overlays
                const xs = document.querySelectorAll('[class*="guide"] [class*="close"]');
                for (const x of xs) { if (x.offsetParent) { x.click(); return true; } }
                return false;
            })()
        """)
        if not ok:
            break
        await asyncio.sleep(0.8)


async def publish(session, task) -> str:
    """Publish video/image to Kuaishou."""
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths
    content_type = getattr(task, 'content_type', 'video') or 'video'
    upload_url = UPLOAD_IMAGE_URL if content_type == "image" else UPLOAD_VIDEO_URL

    # ── Step 1: Navigate ──
    log.info(f"[KS] Navigating to {upload_url}")
    await session.navigate(upload_url)
    await asyncio.sleep(4)

    if not await check_login(session):
        raise PermissionError("Kuaishou: Not logged in, cookies expired")

    # Close popups/old-draft prompts (safe here, before upload form)
    await _close_modals_before_upload(session)

    # Verify URL
    url = await get_current_url(session)
    if "/article/publish" not in url:
        await session.navigate(upload_url)
        await asyncio.sleep(3)
        await _close_modals_before_upload(session)

    # ── Step 2: Upload file ──
    if media_paths:
        log.info(f"[KS] Uploading {len(media_paths)} file(s)")
        await upload_files(session, media_paths, selector_key="ks_upload_input")
        await asyncio.sleep(3)

        # Wait for "上传中" to disappear
        log.info("[KS] Waiting for upload to finish...")
        for i in range(120):
            status = await session.evaluate("""
                document.body.innerText.includes('上传中') ? 'uploading'
                : document.body.innerText.includes('上传失败') ? 'error' : 'done'
            """)
            if status == 'done':
                log.info(f"[KS] Upload finished ({i*2}s)")
                break
            if status == 'error':
                raise RuntimeError("Kuaishou: Upload failed")
            if i % 5 == 0:
                log.info(f"[KS] Uploading... ({i*2}s)")
            await asyncio.sleep(2)
        await delay(2, 3)

    # Close guide tooltips (作品信息 1/4 etc.) — only guide tips, nothing else
    await _close_guide_tips(session)

    # ── Step 3: Fill 作品描述 (the ONLY text field — no title on Kuaishou) ──
    desc = task.title or ""
    if task.content:
        desc = f"{task.title} {task.content}" if task.title else task.content
    if not desc.strip():
        desc = "分享生活"

    log.info(f"[KS] Filling 作品描述: {desc[:60]}...")

    # Fill description: focus textarea, selectAll, then insertText (works with all frameworks)
    filled = await session.evaluate("""
        (() => {
            const text = """ + json.dumps(desc) + """;

            // Find the textarea
            const ta = document.querySelector(
                'textarea[placeholder*="描述"], textarea[placeholder*="智能文案"], textarea'
            );
            if (ta && ta.offsetParent) {
                ta.focus();
                ta.scrollIntoView({ block: 'center' });
                // Select all existing text and replace
                ta.select();
                document.execCommand('selectAll');
                document.execCommand('insertText', false, text);
                return 'textarea:' + ta.value.substring(0, 30);
            }

            // Fallback: contenteditable
            const ce = document.querySelector('[contenteditable="true"]');
            if (ce && ce.offsetParent && ce.offsetHeight > 30) {
                ce.focus();
                ce.scrollIntoView({ block: 'center' });
                document.execCommand('selectAll');
                document.execCommand('insertText', false, text);
                return 'ce:' + ce.innerText.substring(0, 30);
            }
            return null;
        })()
    """)
    log.info(f"[KS] Description result: {filled}")

    if not filled:
        log.warning("[KS] Could not find description field!")

    await asyncio.sleep(2)

    # Verify the description was actually written
    verify = await session.evaluate("""
        (() => {
            const ta = document.querySelector('textarea');
            return ta ? ta.value.substring(0, 50) : 'no textarea';
        })()
    """)
    log.info(f"[KS] Description verify: '{verify}'")

    # ── Step 4: Scroll to very bottom to reveal 发布 button ──
    log.info("[KS] Scrolling to bottom")
    for _ in range(8):
        await session.evaluate("window.scrollBy(0, 500)")
        await asyncio.sleep(0.4)
    await asyncio.sleep(1)

    # ── Step 5: Set scheduled time if needed ──
    if hasattr(task, 'scheduled_at') and task.scheduled_at:
        from datetime import datetime
        now = datetime.now()
        sched = task.scheduled_at if isinstance(task.scheduled_at, datetime) else datetime.fromisoformat(str(task.scheduled_at).replace("Z", "+00:00"))
        diff = (sched - now).total_seconds()

        if diff > 600:
            log.info(f"[KS] Setting 定时发布 ({diff/60:.0f}min ahead)")
            dt_str = sched.strftime("%Y-%m-%d %H:%M:%S")

            # Click 定时发布 radio (the 2nd radio under 发布时间)
            await session.evaluate("""
                (() => {
                    const wrappers = document.querySelectorAll('.ant-radio-wrapper');
                    for (const w of wrappers) {
                        if ((w.textContent || '').includes('定时发布')) {
                            const inp = w.querySelector('.ant-radio-input, input');
                            if (inp) inp.click(); else w.click();
                            return;
                        }
                    }
                })()
            """)
            await asyncio.sleep(1)

            # Fill the date picker — click to open, set value, then CLOSE the picker
            await session.evaluate("""
                (() => {
                    const dtStr = """ + json.dumps(dt_str) + """;
                    const inp = document.querySelector('.ant-picker input');
                    if (inp) {
                        inp.focus(); inp.click();
                        const s = Object.getOwnPropertyDescriptor(
                            window.HTMLInputElement.prototype, 'value'
                        ).set;
                        s.call(inp, dtStr);
                        inp.dispatchEvent(new Event('input', { bubbles: true }));
                        inp.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                })()
            """)
            await asyncio.sleep(1)

            # Click "确定" button inside the picker popup to confirm and close it
            await session.evaluate("""
                (() => {
                    // Find the OK/确定 button in the ant-picker dropdown
                    const btns = document.querySelectorAll('.ant-picker-ok button, .ant-btn-primary, .ant-btn-sm');
                    for (const btn of btns) {
                        const t = (btn.textContent || '').trim();
                        if (t === '确定' && btn.offsetParent !== null) {
                            btn.click();
                            return;
                        }
                    }
                    // Fallback: click body to close any open dropdown
                    document.body.click();
                })()
            """)
            await asyncio.sleep(1)

            # Make sure the picker popup is closed by clicking page body
            await session.evaluate("document.querySelector('h2, h1, .ant-layout-content, body').click()")
            await asyncio.sleep(0.5)

    # ── Step 6: Click 发布 button (red button at bottom) ──
    # Scroll to absolute bottom first
    await session.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    await asyncio.sleep(1)

    # Debug: list all buttons on page to understand what's available
    btn_info = await session.evaluate("""
        (() => {
            const btns = document.querySelectorAll('button');
            const info = [];
            for (const btn of btns) {
                const t = btn.textContent.trim().substring(0, 20);
                if (t) info.push(t + '|dis=' + btn.disabled + '|vis=' + (btn.offsetParent !== null));
            }
            return info.join(' ; ');
        })()
    """)
    log.info(f"[KS] All buttons on page: {btn_info}")

    log.info("[KS] Clicking 发布 button")
    clicked = False
    for attempt in range(5):
        clicked = await session.evaluate("""
            (() => {
                const btns = document.querySelectorAll('button');
                for (const btn of btns) {
                    const text = btn.textContent.trim();
                    // Match exact "发布" (the red publish button at bottom)
                    if (text === '发布' && btn.offsetParent !== null && btn.offsetHeight > 0) {
                        btn.scrollIntoView({ block: 'center' });
                        if (btn.disabled) return 'disabled';
                        btn.click();
                        return 'clicked';
                    }
                }
                return null;
            })()
        """)
        if clicked == 'clicked':
            log.info(f"[KS] 发布 clicked! (attempt {attempt+1})")
            break
        if clicked == 'disabled':
            log.warning(f"[KS] 发布 button found but DISABLED (attempt {attempt+1})")
            # Button is disabled — description might not be registered, wait and retry
            await asyncio.sleep(3)
            continue
        log.info(f"[KS] 发布 not found, scrolling more (attempt {attempt+1})")
        await session.evaluate("window.scrollTo(0, document.body.scrollHeight)")
        await asyncio.sleep(2)

    if clicked != 'clicked':
        # Debug screenshot
        try:
            ss = await take_screenshot(session)
            from pathlib import Path
            Path("data/debug").mkdir(parents=True, exist_ok=True)
            Path("data/debug/ks_no_publish_btn.png").write_bytes(ss)
        except Exception:
            pass
        raise RuntimeError("Kuaishou: 发布 button not found")

    await asyncio.sleep(2)

    # ── Step 7: Click 确认发布 in the confirmation dialog ──
    log.info("[KS] Waiting for 确认发布 dialog")
    for i in range(10):
        confirmed = await session.evaluate("""
            (() => {
                const btns = document.querySelectorAll('button, span, a, div');
                for (const el of btns) {
                    const t = (el.textContent || '').trim();
                    if (t === '确认发布' && el.offsetParent !== null) {
                        el.click();
                        return true;
                    }
                }
                return false;
            })()
        """)
        if confirmed:
            log.info("[KS] 确认发布 clicked!")
            break

        # Already redirected?
        url = await get_current_url(session)
        if "/manage/" in url or "status=2" in url:
            log.info("[KS] Redirected to success page")
            break
        await asyncio.sleep(1)

    await asyncio.sleep(3)

    # ── Step 8: Check success ──
    log.info("[KS] Checking result")
    for i in range(15):
        url = await get_current_url(session)
        if "/manage/" in url or "status=2" in url or "from=publish" in url:
            log.info(f"[KS] Published successfully! {url}")
            return url
        body = await session.evaluate("document.body.innerText.substring(0, 300)")
        if "发布成功" in body or "作品已发布" in body:
            log.info("[KS] Success text found")
            return url
        await asyncio.sleep(1)

    url = await get_current_url(session)
    body = await session.evaluate("document.body.innerText.substring(0, 300)")
    if "失败" in body or "错误" in body:
        raise RuntimeError(f"Kuaishou publish failed: {body[:200]}")
    log.warning(f"[KS] No clear success signal. URL={url}")
    return url
