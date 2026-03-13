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
from fastapi.middleware.cors import CORSMiddleware

from database import init_db
from scheduler import start_scheduler, stop_scheduler
from routers import accounts, tasks, publish

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


@app.get("/health")
def health():
    return {"status": "ok"}
