import os
from pathlib import Path

BASE_DIR = Path(__file__).parent
PROJECT_ROOT = BASE_DIR  # alias used by content creation services
DATA_DIR = BASE_DIR / "data"
DB_PATH = DATA_DIR / "tasks.db"
PROFILES_DIR = DATA_DIR / "profiles"
UPLOADS_DIR = DATA_DIR / "uploads"
OUTPUTS_DIR = BASE_DIR / "outputs"
BRAND_PROFILES_DIR = BASE_DIR / "brand_profiles"

# ==================== Gemini API ====================
AI_BASE_URL = "https://api.apiyi.com/v1"
AI_API_KEY = "sk-QFvD052YMpEvAN3oBc7228BcD24a44FdB9A73f2a62BeDb3b"
AI_MODEL = "gemini-2.5-flash-preview"

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", AI_API_KEY)
GEMINI_BASE_URL = os.getenv("GEMINI_BASE_URL", AI_BASE_URL)
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

# ==================== Chrome / CDP ====================
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

# ==================== Platform creator URLs ====================
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
    "wechat": {
        "publish": "https://mp.weixin.qq.com",
        "login": "https://mp.weixin.qq.com",
        "home": "https://mp.weixin.qq.com",
    },
}

# ==================== Helper ====================
def _env_bool(name: str, default: bool) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in ("1", "true", "yes", "on")

# ==================== NanoBanana API (图片生成) ====================
NANOBANANA_API_KEY = os.getenv("NANOBANANA_API_KEY", "Q0X6CV17w4th5qwBxxaKAcjatj")
NANOBANANA_API_BASE_URL = os.getenv("NANOBANANA_API_BASE_URL", "https://api.wuyinkeji.com/api")

KEYFRAME_DEFAULT_MODEL = "nano-banana"
KEYFRAME_DEFAULT_QUALITY = "high"
KEYFRAME_ASPECT_RATIO = "16:9"
KEYFRAME_NUM_VERSIONS = 3

# ==================== 成本配置 ====================
COST_PER_IMAGE = 0.05
COST_PER_VIDEO = 1.20
COST_PER_IMAGE_SEEDREAM = 0.25
COST_PER_SECOND_SEEDANCE = 1.0

# ==================== AI评分 / 提示词优化 ====================
ENABLE_AI_SCORING = False
AI_SCORE_PROVIDER = "none"
ENABLE_PROMPT_OPTIMIZATION = True
PROMPT_OPTIMIZER_PROVIDER = "rule-based"

# ==================== 阿里云百炼 Qwen ====================
QWEN_BASE_URL = os.getenv("QWEN_BASE_URL", "https://dashscope.aliyuncs.com/compatible-mode/v1")
QWEN_API_KEY = os.getenv("QWEN_API_KEY", "sk-bf8c49192e5a461a86aca4b121c3ac03")
QWEN_MODEL = os.getenv("QWEN_MODEL", "qwen-max")

# ==================== TikHub API ====================
TIKHUB_API_KEY = os.getenv("TIKHUB_API_KEY", "k40dDp4s0V2pqHGuTJC15k36ahixSsFavT3U7EyjUv29lHOfJWWZUAqRMw==")
TIKHUB_BASE_URL = "https://api.tikhub.io"

# ==================== Tavily API (AI搜索) ====================
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "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")
TAVILY_BASE_URL = "https://api.tavily.com"

# ==================== Kling API (图生视频) ====================
KLING_API_KEY = os.getenv("KLING_API_KEY", "sk-gd4jp9vmEl0pwIFg0dA37MFtIuo0wRT0J6a0qMb8ZJWWHPxq")
KLING_API_BASE_URL = os.getenv("KLING_API_BASE_URL", "https://api.remenbaike.com")

VIDEO_DEFAULT_MODEL = "kling-v1"
VIDEO_DEFAULT_DURATION = 5
VIDEO_DEFAULT_CFG_SCALE = 0.5

# ==================== 阶跃星辰 Realtime API (语音访谈) ====================
STEPFUN_API_KEY = os.getenv("STEPFUN_API_KEY", "2LEhcYyCUsSBnNX7hgQnZfvdVGjBMTKlIqmlNxhVbzZbk9og92VMngcmGE4YMAbUr")
STEPFUN_REALTIME_URL = "wss://api.stepfun.com/v1/realtime?model=step-audio-2"
STEPFUN_VOICE = "qingchunshaonv"

# ==================== 火山引擎 Ark (Seedream / Seedance) ====================
ARK_API_KEY = os.getenv("ARK_API_KEY", "")
ARK_BASE_URL = os.getenv("ARK_BASE_URL", "https://ark.cn-beijing.volces.com/api/v3")
SEEDREAM_MODEL = os.getenv("SEEDREAM_MODEL", "doubao-seedream-5-0-260128")
SEEDANCE_MODEL = os.getenv("SEEDANCE_MODEL", "doubao-seedance-1-0-pro-250528")
SEEDANCE_DEFAULT_RESOLUTION = os.getenv("SEEDANCE_DEFAULT_RESOLUTION", "1080p")
SEEDANCE_DEFAULT_CAMERA_FIXED = _env_bool("SEEDANCE_DEFAULT_CAMERA_FIXED", False)
SEEDANCE_DEFAULT_WATERMARK = _env_bool("SEEDANCE_DEFAULT_WATERMARK", True)

IMAGE_PROVIDER = os.getenv("IMAGE_PROVIDER", "nanobanana")
VIDEO_PROVIDER = os.getenv("VIDEO_PROVIDER", "seedance")

# ==================== 漫剧生成配置 ====================
COMIC_DRAMA_OUTPUT_DIR = OUTPUTS_DIR / "comic_drama"
COMIC_DRAMA_DEFAULT_STYLE = "cinematic"
COMIC_DRAMA_SCENES_COUNT = 6
COMIC_DRAMA_SCENE_DURATION = 5.0
TTS_DEFAULT_VOICE = "zh-CN-YunxiNeural"

# ==================== 阿里云 DashScope ASR ====================
DASHSCOPE_API_KEY = os.getenv("DASHSCOPE_API_KEY", "sk-bf8c49192e5a461a86aca4b121c3ac03")

# ==================== 视频处理 ====================
DEFAULT_RESOLUTION = "1920x1080"
DEFAULT_FPS = 30
DEFAULT_BITRATE = "5M"
MAX_CONCURRENT_EXPORTS = 3
CACHE_TTL = 300

# ==================== 素创API (视频生成多模型) ====================
SUCHUANG_API_KEY = os.getenv("SUCHUANG_API_KEY", "Q0X6CV17w4th5qwBxxaKAcjatj")
SUCHUANG_BASE_URL = "https://api.wuyinkeji.com/api"

MAX_CONCURRENT_SUBMISSIONS = 50
MAX_CONCURRENT_DOWNLOADS = 10
TASK_POLL_INTERVAL = 15
TASK_MAX_WAIT_TIME = 600

VIDEO_MODELS = {
    "sora2-new": {
        "name": "Sora2 New", "provider": "openai",
        "endpoint": f"{SUCHUANG_BASE_URL}/sora2-new/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/sora2-new/detail",
        "cost_per_video": 2.5, "duration_options": [10, 15],
        "strengths": ["表情自然", "人物对话", "AI音频"],
        "best_for": ["talking_head", "scene"], "quality_score": 90, "speed_score": 75,
    },
    "sora2-pro": {
        "name": "Sora2 Pro", "provider": "openai",
        "endpoint": f"{SUCHUANG_BASE_URL}/sora2-pro/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/sora2-pro/detail",
        "cost_per_video": 3.5, "duration_options": [10, 15],
        "strengths": ["超高质量", "复杂场景"],
        "best_for": ["product", "effect"], "quality_score": 95, "speed_score": 60,
    },
    "veo3": {
        "name": "Veo 3", "provider": "google",
        "endpoint": f"{SUCHUANG_BASE_URL}/veo3/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/veo3/detail",
        "cost_per_video": 2.0, "duration_options": [8, 12],
        "strengths": ["4K画质", "高分辨率"],
        "best_for": ["product", "scene"], "quality_score": 92, "speed_score": 70,
    },
    "veo3.1": {
        "name": "Veo 3.1", "provider": "google",
        "endpoint": f"{SUCHUANG_BASE_URL}/veo3.1/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/veo3.1/detail",
        "cost_per_video": 2.2, "duration_options": [8, 12],
        "strengths": ["最新版本", "优化画质"],
        "best_for": ["product", "scene", "effect"], "quality_score": 93, "speed_score": 72,
    },
    "veo3.1-pro": {
        "name": "Veo 3.1 Pro", "provider": "google",
        "endpoint": f"{SUCHUANG_BASE_URL}/veo3.1-pro/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/veo3.1-pro/detail",
        "cost_per_video": 3.0, "duration_options": [8, 12],
        "strengths": ["顶级画质", "产品细节"],
        "best_for": ["product", "hands_on"], "quality_score": 96, "speed_score": 65,
    },
    "veo3.1-fast": {
        "name": "Veo 3.1 Fast", "provider": "google",
        "endpoint": f"{SUCHUANG_BASE_URL}/veo3.1-fast/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/veo3.1-fast/detail",
        "cost_per_video": 1.5, "duration_options": [8, 12],
        "strengths": ["生成快速", "成本低"],
        "best_for": ["scene", "transition"], "quality_score": 85, "speed_score": 95,
    },
    "jimeng": {
        "name": "即梦AI", "provider": "bytedance",
        "endpoint": f"{SUCHUANG_BASE_URL}/jimeng/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/jimeng/detail",
        "cost_per_video": 1.8, "duration_options": [10, 15],
        "strengths": ["中文场景", "本土化"],
        "best_for": ["talking_head", "scene"], "quality_score": 88, "speed_score": 80,
    },
    "runway": {
        "name": "Runway Gen-3", "provider": "runway",
        "endpoint": f"{SUCHUANG_BASE_URL}/runway/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/runway/detail",
        "cost_per_video": 2.8, "duration_options": [10, 15],
        "strengths": ["专业后期", "特效"],
        "best_for": ["effect", "transition"], "quality_score": 91, "speed_score": 68,
    },
    "kling": {
        "name": "可灵 Kling", "provider": "kuaishou",
        "endpoint": f"{SUCHUANG_BASE_URL}/kling/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/kling/detail",
        "cost_per_video": 2.0, "duration_options": [10, 15],
        "strengths": ["高帧率", "1080p@30fps"],
        "best_for": ["hands_on", "scene"], "quality_score": 89, "speed_score": 77,
    },
    "vidu": {
        "name": "Vidu AI", "provider": "shengsu",
        "endpoint": f"{SUCHUANG_BASE_URL}/vidu/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/vidu/detail",
        "cost_per_video": 1.6, "duration_options": [8, 12],
        "strengths": ["性价比高", "稳定"],
        "best_for": ["scene", "talking_head"], "quality_score": 86, "speed_score": 82,
    },
    "pixverse": {
        "name": "PixVerse", "provider": "pixverse",
        "endpoint": f"{SUCHUANG_BASE_URL}/pixverse/submit",
        "query_endpoint": f"{SUCHUANG_BASE_URL}/pixverse/detail",
        "cost_per_video": 1.2, "duration_options": [8, 12],
        "strengths": ["超低成本", "快速"],
        "best_for": ["transition", "scene"], "quality_score": 80, "speed_score": 90,
    },
}
