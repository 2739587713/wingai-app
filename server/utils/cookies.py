import json
import logging
from datetime import datetime, timedelta
from config import COOKIE_CACHE_HOURS

log = logging.getLogger(__name__)


def save_cookies(account, cookies_list):
    account.cookies_json = json.dumps(cookies_list, ensure_ascii=False)
    account.cookie_expiry = datetime.now() + timedelta(hours=COOKIE_CACHE_HOURS)
    account.status = "active"
    account.updated_at = datetime.now()


def load_cookies(account):
    if not account.cookies_json:
        return None
    if account.cookie_expiry and datetime.now() > account.cookie_expiry:
        log.info(f"Cookies expired for account {account.id}")
        account.status = "expired"
        return None
    try:
        return json.loads(account.cookies_json)
    except json.JSONDecodeError:
        return None


def cookies_valid(account):
    if account.status not in ("active",):
        return False
    if not account.cookies_json:
        return False
    if account.cookie_expiry and datetime.now() > account.cookie_expiry:
        return False
    return True
