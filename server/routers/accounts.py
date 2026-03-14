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
        status="login_required",
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

    # Save session FIRST so polling can work even if screenshot fails
    _login_sessions[account_id] = {"proc": proc, "session": session, "port": port}

    # Navigate to login page
    await session.navigate(urls["login"])
    await asyncio.sleep(5)  # Wait longer for page to fully load

    # Take screenshot (with retry)
    screenshot_b64 = ""
    for attempt in range(3):
        try:
            screenshot = await take_screenshot(session)
            screenshot_b64 = base64.b64encode(screenshot).decode()
            break
        except Exception as e:
            log.warning(f"Screenshot attempt {attempt+1} failed: {e}")
            await asyncio.sleep(2)

    return {
        "status": "qr_ready",
        "screenshot": f"data:image/png;base64,{screenshot_b64}" if screenshot_b64 else "",
        "message": "请用手机扫描二维码登录（浏览器已打开）",
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
        log.info(f"[Login] Account {account_id} current URL: {url}")

        # Detect pages that are still part of the login/verification flow
        # These pages mean the user is NOT fully logged in yet
        still_in_login_flow = any(p in url.lower() for p in [
            "/login", "passport.", "sso.", "accounts.google", "signin",
            "verify", "captcha", "sms", "phone", "security_check",
            "authenticate", "validation", "scanlogin", "loginpage",
        ])

        # WeChat MP: login page is just mp.weixin.qq.com (no /login in URL)
        # Must check if it's the QR login page by looking at the page content
        is_wechat_domain = "mp.weixin.qq.com" in url

        # Also check page content for verification-related text
        # (SMS code input, captcha, phone verification etc.)
        is_verification_page = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                const inputs = document.querySelectorAll('input[type="text"], input[type="tel"], input[type="number"]');
                // Check for verification-related Chinese text
                const verifyTexts = ['验证码', '短信验证', '输入验证码', '安全验证',
                                     '手机验证', '请输入', '发送验证码', '获取验证码',
                                     '滑块', '请完成验证', '点击验证'];
                for (const t of verifyTexts) {
                    if (body.includes(t)) return true;
                }
                return false;
            })()
        """)

        if is_verification_page:
            log.info(f"[Login] Account {account_id} on verification page, waiting...")
            still_in_login_flow = True

        # Check if we're on a known "fully logged in" creator page
        is_creator_page = any(p in url for p in [
            "creator.douyin.com/creator-micro",
            "creator.xiaohongshu.com/publish",
            "creator.xiaohongshu.com/user",
            "creator.xiaohongshu.com/",
            "cp.kuaishou.com/article",
            "cp.kuaishou.com/profile",
            "cp.kuaishou.com/",
            "mp.weixin.qq.com/cgi-bin/home",
        ])
        if url.rstrip("/") == "https://creator.douyin.com":
            is_creator_page = True

        # For WeChat: if on mp.weixin.qq.com but NOT on cgi-bin/home,
        # we need to check if we're on the QR login page or the dashboard
        if is_wechat_domain and not is_creator_page:
            # Check for WeChat QR login page indicators
            wechat_login_check = await session.evaluate("""
                (() => {
                    const body = document.body.innerText || '';
                    // QR login page has these elements/text
                    const loginIndicators = [
                        '扫码登录', '微信扫一扫', '扫一扫登录', '使用微信扫一扫',
                        '请扫码', '扫描二维码', '微信公众平台',
                    ];
                    for (const t of loginIndicators) {
                        if (body.includes(t)) return 'login_page';
                    }
                    // Check for QR code image (WeChat login has an img for QR)
                    const qrImg = document.querySelector('.login__type__container__scan__qrcode img, .qrcode img, img[src*="qrcode"], .login_qrcode_area img, .wrp_code img');
                    if (qrImg) return 'login_page';
                    // Check for iframe-based QR code
                    const qrIframe = document.querySelector('iframe[src*="login"]');
                    if (qrIframe) return 'login_page';
                    // If we see dashboard content, it's logged in
                    if (body.includes('新的创作') || body.includes('内容管理') || body.includes('数据分析')) return 'dashboard';
                    // Default: treat as login page (safer — avoids false positive)
                    return 'unknown';
                })()
            """)
            log.info(f"[Login] WeChat check result: {wechat_login_check}, url: {url}")
            if wechat_login_check != 'dashboard':
                still_in_login_flow = True

        # WeChat with token in URL = definitely logged in (cgi-bin/home?token=...)
        # Confirm immediately without further JS checks that might fail during page load
        if is_creator_page and is_wechat_domain and "token=" in url:
            log.info(f"[Login] Account {account_id} WeChat login confirmed via URL token")
            # Logged in! Save cookies (with retry for page loading)
            try:
                cookies = await session.get_cookies()
                save_cookies(acct, cookies)
            except Exception as e:
                log.warning(f"[Login] Cookie save failed (will retry next time): {e}")

            acct.status = "active"
            db.commit()

            nickname = acct.nickname
            try:
                nickname = await session.evaluate("""
                    (() => {
                        const el = document.querySelector('.user-name, .nick-name, [class*="nickname"]');
                        return el ? el.textContent.trim() : '';
                    })()
                """) or acct.nickname
            except Exception:
                pass
            acct.nickname = nickname
            db.commit()

            await session.close()
            kill_chrome(login_data["proc"])
            _login_sessions.pop(account_id, None)
            return {"status": "logged_in", "nickname": nickname}

        # Check for avatar/user elements as strong login signal
        # Use platform-specific selectors to avoid false positives
        has_user_element = await session.evaluate("""
            (() => {
                const el = document.querySelector('img[class*="avatar"], .user-name, .nick-name, [class*="nickname"], .weui-desktop-account__thumb, .head_img');
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.width > 0 && rect.height > 0) return true;
                }
                return false;
            })()
        """)

        # Check if the page shows "not logged in" indicators
        shows_login_prompt = await session.evaluate("""
            (() => {
                const body = document.body.innerText || '';
                const prompts = ['立即登录', '扫码登录', '密码登录', '验证码登录',
                                  '请输入手机号', '登录/注册', '登录或注册',
                                  '使用微信扫一扫', '微信扫一扫', '扫一扫登录',
                                  '请扫码', '扫描二维码'];
                for (const t of prompts) { if (body.includes(t)) return true; }
                return false;
            })()
        """)
        if shows_login_prompt:
            still_in_login_flow = True

        log.info(f"[Login] Account {account_id} | still_in_login={still_in_login_flow} | is_creator={is_creator_page} | has_user={has_user_element} | login_prompt={shows_login_prompt}")

        # Only confirm login if:
        # 1. On a known creator page with user elements, AND
        # 2. NOT on a verification/login page
        if not still_in_login_flow and (is_creator_page or has_user_element):
            if is_creator_page or has_user_element:
                # Logged in! Save cookies
                cookies = await session.get_cookies()
                save_cookies(acct, cookies)

                acct.status = "active"
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

        # Still in login/verification flow — return updated screenshot
        screenshot = await take_screenshot(session)
        screenshot_b64 = base64.b64encode(screenshot).decode()

        status_msg = "请完成短信验证" if is_verification_page else "等待扫码登录"
        return {
            "status": "waiting",
            "screenshot": f"data:image/png;base64,{screenshot_b64}",
            "message": status_msg,
        }

    except Exception as e:
        log.warning(f"[Login] Account {account_id} poll error (may be transient): {e}")
        # During page navigation (e.g. after QR scan), JS evaluation often fails temporarily.
        # Return "waiting" instead of "error" to let the frontend keep polling.
        # Only return error if the session itself is dead.
        if account_id not in _login_sessions:
            return {"status": "error", "message": str(e)}
        # Try a simple connectivity check
        try:
            session = _login_sessions[account_id]["session"]
            await session.evaluate("1+1")
            # Session is alive, just a transient error during page load
            return {"status": "waiting", "message": "页面加载中，请稍候..."}
        except Exception:
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
