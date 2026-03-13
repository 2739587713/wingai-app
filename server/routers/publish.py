"""Stats and AI endpoints."""
import logging
from datetime import datetime

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from database import get_db, Task
from services.ai_service import recommend_publish_time, enhance_content

log = logging.getLogger(__name__)
router = APIRouter(tags=["publish"])


class StatsOut(BaseModel):
    total: int
    published: int
    pending: int
    failed: int
    running: int
    completion_rate: float


@router.get("/stats/monthly", response_model=StatsOut)
def monthly_stats(month: str = None, db: Session = Depends(get_db)):
    """Monthly stats. month format: 'YYYY-MM'."""
    q = db.query(Task)
    if month:
        try:
            year, mon = month.split("-")
            start = datetime(int(year), int(mon), 1)
            end = datetime(int(year), int(mon) + 1, 1) if int(mon) < 12 else datetime(int(year) + 1, 1, 1)
            q = q.filter(Task.scheduled_at >= start, Task.scheduled_at < end)
        except Exception:
            pass

    total = q.count()
    published = q.filter(Task.status == "success").count()
    pending = q.filter(Task.status == "pending").count()
    failed = q.filter(Task.status == "failed").count()
    running = q.filter(Task.status == "running").count()

    return StatsOut(
        total=total,
        published=published,
        pending=pending,
        failed=failed,
        running=running,
        completion_rate=round(published / total * 100, 1) if total > 0 else 0,
    )


class AITimeRequest(BaseModel):
    platform: str
    category: str = "daily"
    industry: str = ""
    title: str = ""
    content: str = ""


class AIEnhanceRequest(BaseModel):
    title: str
    content: str
    platform: str


@router.post("/ai/recommend-time")
async def ai_recommend_time(data: AITimeRequest):
    result = await recommend_publish_time(data.platform, data.category, data.industry, data.title, data.content)
    return result


@router.post("/ai/enhance-content")
async def ai_enhance(data: AIEnhanceRequest):
    result = await enhance_content(data.title, data.content, data.platform)
    return result
