"""Account management: CRUD + QR login flow."""
import asyncio
import base64
import json
import logging
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, Account
from config import PROFILES_DIR, PLATFORM_URLS
from cdp.browser import launch_chrome, get_ws_url, CDPSession, kill_chrome
from cdp.actions import take_screenshot, take_element_screenshot, check_element_exists
from utils.cookies import save_cookies

log = logging.getLogger(__name__)
router = APIRouter(prefix="/accounts", tags=["accounts"])

# Active login sessions
_login_sessions = {}


class AccountCreate(BaseModel):
    platform: str  # xiaohongshu/douyin/kuaishou/wechat
    nickname: str = ""
    wx_appid: str = ""
    wx_secret: str = ""


class AccountOut(BaseModel):
    id: int
    platform: str
    nickname: str
    status: str
    created_at: datetime
    model_config = {"from_attributes": True}


@router.get("", response_model=list[AccountOut])
def list_accounts(db: Session = Depends(get_db)):
    return db.query(Account).order_by(Account.created_at.desc()).all()


@router.post("", response_model=AccountOut)
def create_account(data: AccountCreate, db: Session = Depends(get_db)):
    profile_dir = str(PROFILES_DIR / f"{data.platform}_{datetime.now().strftime('%Y%m%d%H%M%S')}")
    Path(profile_dir).mkdir(parents=True, exist_ok=True)

    acct = Account(
        platform=data.platform,
        nickname=data.nickname or f"{data.platform} account",
        profile_dir=profile_dir,
        wx_appid=data.wx_appid,
        wx_secret=data.wx_secret,
        status="active" if data.platform == "wechat" and data.wx_appid else "login_required",
    )
    db.add(acct)
    db.commit()
    db.refresh(acct)
    return acct


@router.delete("/{account_id}")
def delete_account(account_id: int, db: Session = Depends(get_db)):
    acct = db.query(Account).get(account_id)
    if not acct:
        raise HTTPException(404, "Account not found")
    db.delete(acct)
    db.commit()
    return {"ok": True}


@router.post("/{account_id}/login")
async def start_login(account_id: int, db: Session = Depends(get_db)):
    """Launch browser and navigate to login page. Returns screenshot with QR code."""
    acct = db.query(Account).get(account_id)
    if not acct:
        raise HTTPException(404, "Account not found")

    if acct.platform == "wechat":
        raise HTTPException(400, "WeChat uses API key, not QR login")

    urls = PLATFORM_URLS.get(acct.platform)
    if not urls:
        raise HTTPException(400, f"Unknown platform: {acct.platform}")

    # Kill existing session if any
    if account_id in _login_sessions:
        old = _login_sessions.pop(account_id)
        try:
            await old["session"].close()
            kill_chrome(old["proc"])
        except Exception:
            pass

    # Launch browser (headed so user can see QR)
    proc, port = launch_chrome(profile_dir=acct.profile_dir, headless=False)
    ws_url = get_ws_url(port)
    session = CDPSession()
    await session.connect(ws_url)

    # Navigate to login page
    await session.navigate(urls["login"])
    await asyncio.sleep(3)

    # Take screenshot
    screenshot = await take_screenshot(session)
    screenshot_b64 = base64.b64encode(screenshot).decode()

    _login_sessions[account_id] = {"proc": proc, "session": session, "port": port}

    return {
        "status": "qr_ready",
        "screenshot": f"data:image/png;base64,{screenshot_b64}",
        "message": "请用手机扫描二维码登录",
    }


@router.get("/{account_id}/login-status")
async def check_login_status(account_id: int, db: Session = Depends(get_db)):
    """Poll login status. Returns screenshot updates and login result."""
    acct = db.query(Account).get(account_id)
    if not acct:
        raise HTTPException(404)

    login_data = _login_sessions.get(account_id)
    if not login_data:
        return {"status": "no_session", "message": "No login session active"}

    session = login_data["session"]

    try:
        # Check if we've been redirected away from login page
        url = await session.evaluate("window.location.href")
        is_login_page = "/login" in url or "passport" in url

        if not is_login_page:
            # Logged in! Save cookies
            cookies = await session.get_cookies()
            save_cookies(acct, cookies)
            db.commit()

            # Try to get nickname
            nickname = await session.evaluate("""
                (() => {
                    const el = document.querySelector('.user-name, .nick-name, [class*="nickname"]');
                    return el ? el.textContent.trim() : '';
                })()
            """) or acct.nickname
            acct.nickname = nickname
            db.commit()

            # Cleanup
            await session.close()
            kill_chrome(login_data["proc"])
            _login_sessions.pop(account_id, None)

            return {"status": "logged_in", "nickname": nickname}

        # Still on login page — return updated screenshot
        screenshot = await take_screenshot(session)
        screenshot_b64 = base64.b64encode(screenshot).decode()
        return {
            "status": "waiting",
            "screenshot": f"data:image/png;base64,{screenshot_b64}",
        }

    except Exception as e:
        return {"status": "error", "message": str(e)}


@router.post("/{account_id}/cancel-login")
async def cancel_login(account_id: int):
    """Cancel an active login session."""
    login_data = _login_sessions.pop(account_id, None)
    if login_data:
        try:
            await login_data["session"].close()
            kill_chrome(login_data["proc"])
        except Exception:
            pass
    return {"ok": True}
