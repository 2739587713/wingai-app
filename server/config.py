import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "tasks.db"
PROFILES_DIR = DATA_DIR / "profiles"
UPLOADS_DIR = DATA_DIR / "uploads"

# Gemini API via apiyi
AI_BASE_URL = "https://api.apiyi.com/v1"
AI_API_KEY = "sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b"
AI_MODEL = "gemini-2.5-flash-preview"

# Chrome
CHROME_PATHS = [
    r"C:\Program Files\Google\Chrome\Application\chrome.exe",
    r"C:\Program Files (x86)\Google\Chrome\Application\chrome.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"),
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    os.path.expandvars(r"%LOCALAPPDATA%\Microsoft\Edge\Application\msedge.exe"),
]

CDP_PORT_START = 9300
COOKIE_CACHE_HOURS = 12
MAX_RETRY = 3
RETRY_DELAY_MINUTES = 5

# Platform creator URLs
PLATFORM_URLS = {
    "xiaohongshu": {
        "publish": "https://creator.xiaohongshu.com/publish/publish",
        "login": "https://creator.xiaohongshu.com/login",
        "home": "https://creator.xiaohongshu.com",
    },
    "douyin": {
        "publish": "https://creator.douyin.com/creator-micro/content/upload",
        "publish_image": "https://creator.douyin.com/creator-micro/content/upload",
        "publish_video": "https://creator.douyin.com/creator-micro/content/upload",
        "login": "https://creator.douyin.com/login",
        "home": "https://creator.douyin.com",
    },
    "kuaishou": {
        "publish": "https://cp.kuaishou.com/article/publish/video",
        "login": "https://cp.kuaishou.com/login",
        "home": "https://cp.kuaishou.com",
    },
}
