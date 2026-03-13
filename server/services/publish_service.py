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

        # WeChat uses HTTP API, no browser needed
        if task.platform == "wechat":
            _log_task(db, task_id, "info", "Using WeChat MP API (no browser)")
            result_url = await wechat.publish(None, task, account)
            task.status = "success"
            task.publish_url = result_url
            task.updated_at = datetime.now()
            db.commit()
            _log_task(db, task_id, "info", f"Published successfully: {result_url}")
            return

        # CDP-based platforms: launch browser
        _log_task(db, task_id, "info", "Launching browser")
        proc, port = launch_chrome(profile_dir=account.profile_dir, headless=True)

        ws_url = get_ws_url(port)
        session = CDPSession()
        await session.connect(ws_url)
        _log_task(db, task_id, "info", "Browser connected")

        # Restore cookies if available
        cookies = load_cookies(account)
        if cookies:
            await session.set_cookies(cookies)
            _log_task(db, task_id, "info", "Cookies restored")

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
