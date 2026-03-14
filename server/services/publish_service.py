"""
Publish service — orchestrates the full publish flow:
load task → launch browser → restore cookies → call platform driver → update DB.
"""
import asyncio
import json
import logging
import traceback
from datetime import datetime

from database import SessionLocal, Task, TaskLog, Account
from cdp.browser import launch_chrome, get_ws_url, CDPSession, kill_chrome
from cdp.platforms import xiaohongshu, douyin, kuaishou, wechat
from utils.cookies import load_cookies, save_cookies
from config import MAX_RETRY, RETRY_DELAY_MINUTES

log = logging.getLogger(__name__)

PLATFORM_DRIVERS = {
    "xiaohongshu": xiaohongshu,
    "douyin": douyin,
    "kuaishou": kuaishou,
    "wechat": wechat,
}


def _log_task(db, task_id: int, level: str, message: str):
    entry = TaskLog(task_id=task_id, level=level, message=message, timestamp=datetime.now())
    db.add(entry)
    db.commit()


async def execute_task(task_id: int):
    """Execute a publish task. Called by APScheduler at scheduled time."""
    db = SessionLocal()
    proc = None
    session = None

    try:
        task = db.query(Task).get(task_id)
        if not task:
            log.error(f"Task {task_id} not found")
            return
        if task.status not in ("pending", "running"):
            log.info(f"Task {task_id} status is {task.status}, skipping")
            return

        account = db.query(Account).get(task.account_id)
        if not account:
            task.status = "failed"
            task.error_log = "Account not found"
            db.commit()
            return

        task.status = "running"
        task.updated_at = datetime.now()
        db.commit()
        _log_task(db, task_id, "info", f"Starting publish to {task.platform}")

        driver = PLATFORM_DRIVERS.get(task.platform)
        if not driver:
            raise ValueError(f"Unknown platform: {task.platform}")

        # CDP-based platforms: close any active login session for this account first
        try:
            from routers.accounts import _login_sessions
            login_data = _login_sessions.pop(task.account_id, None)
            if login_data:
                log.info(f"Closing active login session for account {task.account_id}")
                try:
                    await login_data["session"].close()
                except Exception:
                    pass
                from cdp.browser import kill_chrome as _kill
                _kill(login_data["proc"])
                await asyncio.sleep(1)  # Let Chrome release the profile lock
        except Exception:
            pass

        # Launch browser (headed mode — headless is detected by most platforms)
        _log_task(db, task_id, "info", "Launching browser")
        proc, port = launch_chrome(profile_dir=account.profile_dir, headless=False)

        ws_url = get_ws_url(port)
        session = CDPSession()
        await session.connect(ws_url)
        # Don't minimize — user may need to interact (e.g. SMS verification on Douyin)
        _log_task(db, task_id, "info", "Browser connected")

        # Restore cookies: navigate to domain FIRST, then inject cookies, then refresh
        cookies = load_cookies(account)
        if cookies:
            # Navigate to the platform domain first so cookies can be set on correct domain
            domain_urls = {
                "douyin": "https://creator.douyin.com",
                "xiaohongshu": "https://creator.xiaohongshu.com",
                "kuaishou": "https://cp.kuaishou.com",
                "wechat": "https://mp.weixin.qq.com",
            }
            domain_url = domain_urls.get(task.platform)
            if domain_url:
                _log_task(db, task_id, "info", f"Navigating to {domain_url} for cookie injection")
                await session.navigate(domain_url)
                await asyncio.sleep(2)

            await session.set_cookies(cookies)
            _log_task(db, task_id, "info", f"Cookies injected ({len(cookies)} cookies)")

            # Refresh page so cookies take effect
            if domain_url:
                await session.navigate(domain_url)
                await asyncio.sleep(3)

                # Check if login form is still shown (cookies didn't work)
                url_now = await session.evaluate("window.location.href")
                page_text = await session.evaluate("document.body.innerText.substring(0, 300)")
                login_keywords = ["扫码登录", "验证码登录", "密码登录", "登录/注册",
                                  "账号登录", "手机号登录", "立即登录", "请输入手机号"]
                is_login_page = (any(kw in page_text for kw in login_keywords)
                                 or "passport" in (url_now or "")
                                 or "/login" in (url_now or ""))
                if is_login_page:
                    _log_task(db, task_id, "warn", f"Cookies did not restore login (url={url_now})")
                    log.warning(f"Cookie restore failed, url={url_now}, page: {page_text[:100]}")
                else:
                    _log_task(db, task_id, "info", "Cookie login confirmed")
        else:
            _log_task(db, task_id, "warn", "No valid cookies found - login may be required")

        # Execute platform-specific publish
        _log_task(db, task_id, "info", f"Publishing to {task.platform}...")
        result_url = await driver.publish(session, task)

        # Save fresh cookies after successful publish
        fresh_cookies = await session.get_cookies()
        save_cookies(account, fresh_cookies)
        db.commit()

        task.status = "success"
        task.publish_url = result_url or ""
        task.updated_at = datetime.now()
        db.commit()
        _log_task(db, task_id, "info", f"Published successfully: {result_url}")

    except PermissionError as e:
        # Login expired
        log.warning(f"Task {task_id} login required: {e}")
        task.status = "failed"
        task.error_log = str(e)
        if account:
            account.status = "login_required"
        db.commit()
        _log_task(db, task_id, "error", f"Login required: {e}")

    except Exception as e:
        log.error(f"Task {task_id} failed: {e}\n{traceback.format_exc()}")
        task.error_log = str(e)
        task.retry_count = (task.retry_count or 0) + 1

        if task.retry_count < MAX_RETRY:
            task.status = "pending"
            # Reschedule via scheduler (imported lazily to avoid circular)
            from scheduler import reschedule_task
            reschedule_task(task_id, delay_minutes=RETRY_DELAY_MINUTES)
            _log_task(db, task_id, "warn", f"Retry {task.retry_count}/{MAX_RETRY} in {RETRY_DELAY_MINUTES}min: {e}")
        else:
            task.status = "failed"
            _log_task(db, task_id, "error", f"Failed after {MAX_RETRY} retries: {e}")

        task.updated_at = datetime.now()
        db.commit()

    finally:
        if session:
            try:
                await session.close()
            except Exception:
                pass
        if proc:
            kill_chrome(proc)
        db.close()
