"""
WingAI Schedule Server — FastAPI + APScheduler + CDP automation.
Run: cd server && python -m uvicorn main:app --port 8000 --reload --reload-exclude "data/*" --reload-exclude "*.db" --reload-exclude "*.jsonl"
"""
import logging
import sys
from contextlib import asynccontextmanager
from pathlib import Path

# Add server dir to path
sys.path.insert(0, str(Path(__file__).parent))

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from config import OUTPUTS_DIR, COMIC_DRAMA_OUTPUT_DIR
from database import init_db
from scheduler import start_scheduler, stop_scheduler
from routers import (
    accounts, tasks, publish,
    proxy, wingai, projects, shots, export, keyframes,
    script, brand_profiles, templates, user_templates,
    ip_studio, product_profiles, comic_drama, storyboard,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(name)s] %(levelname)s: %(message)s",
    datefmt="%H:%M:%S",
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    start_scheduler()
    logging.info("WingAI Schedule Server started")
    yield
    # Shutdown
    stop_scheduler()
    logging.info("WingAI Schedule Server stopped")


app = FastAPI(title="WingAI Schedule API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(accounts.router)
app.include_router(tasks.router)
app.include_router(publish.router)

# New routers from wingai-app content creation pipeline
app.include_router(proxy.router)
app.include_router(wingai.router)
app.include_router(projects.router)
app.include_router(shots.router)
app.include_router(export.router)
app.include_router(keyframes.router)
app.include_router(script.router)
app.include_router(brand_profiles.router)
app.include_router(templates.router)
app.include_router(user_templates.router)
app.include_router(ip_studio.router)
app.include_router(product_profiles.router)
app.include_router(comic_drama.router)
app.include_router(storyboard.router)

# Mount output directories for video/media serving
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
COMIC_DRAMA_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/videos", StaticFiles(directory=str(OUTPUTS_DIR)), name="videos")
app.mount("/comic-drama/output", StaticFiles(directory=str(COMIC_DRAMA_OUTPUT_DIR)), name="comic_drama_output")


@app.get("/health")
def health():
    return {"status": "ok"}
