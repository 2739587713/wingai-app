"""Task CRUD + publish trigger endpoints."""
import json
import logging
import os
import shutil
from datetime import datetime
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import get_db, Task, TaskLog, Account
from scheduler import schedule_task, cancel_task
from config import UPLOADS_DIR

log = logging.getLogger(__name__)
router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreate(BaseModel):
    account_id: int
    platform: str
    content_type: str = "image"  # image/video
    title: str = ""
    content: str = ""
    tags: list[str] = []
    scheduled_at: str  # ISO format datetime
    color: str = "#7C3AED"
    category: str = "daily"
    media_paths: list[str] = []
    cover_path: str = ""


class TaskUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    tags: list[str] | None = None
    scheduled_at: str | None = None
    color: str | None = None
    category: str | None = None
    status: str | None = None


class TaskOut(BaseModel):
    id: int
    account_id: int
    platform: str
    content_type: str
    title: str
    content: str
    media_paths: str
    tags: str
    scheduled_at: datetime | None
    color: str
    category: str
    status: str
    retry_count: int
    error_log: str
    publish_url: str
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class TaskLogOut(BaseModel):
    id: int
    task_id: int
    timestamp: datetime
    level: str
    message: str
    model_config = {"from_attributes": True}


@router.get("", response_model=list[TaskOut])
def list_tasks(month: str = None, account_id: int = None, db: Session = Depends(get_db)):
    """List tasks with optional filters. month format: 'YYYY-MM'."""
    q = db.query(Task)
    if month:
        try:
            year, mon = month.split("-")
            start = datetime(int(year), int(mon), 1)
            if int(mon) == 12:
                end = datetime(int(year) + 1, 1, 1)
            else:
                end = datetime(int(year), int(mon) + 1, 1)
            q = q.filter(Task.scheduled_at >= start, Task.scheduled_at < end)
        except Exception:
            pass
    if account_id:
        q = q.filter(Task.account_id == account_id)
    return q.order_by(Task.scheduled_at).all()


@router.post("", response_model=TaskOut)
def create_task(data: TaskCreate, db: Session = Depends(get_db)):
    # Validate account
    acct = db.query(Account).get(data.account_id)
    if not acct:
        raise HTTPException(404, "Account not found")

    scheduled = datetime.fromisoformat(data.scheduled_at)

    task = Task(
        account_id=data.account_id,
        platform=data.platform,
        content_type=data.content_type,
        title=data.title,
        content=data.content,
        media_paths=json.dumps(data.media_paths),
        cover_path=data.cover_path,
        tags=json.dumps(data.tags),
        scheduled_at=scheduled,
        color=data.color,
        category=data.category,
        status="pending",
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    # Register with scheduler
    schedule_task(task.id, scheduled)
    log.info(f"Task {task.id} created, scheduled for {scheduled}")

    return task


@router.put("/{task_id}", response_model=TaskOut)
def update_task(task_id: int, data: TaskUpdate, db: Session = Depends(get_db)):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")

    if data.title is not None:
        task.title = data.title
    if data.content is not None:
        task.content = data.content
    if data.tags is not None:
        task.tags = json.dumps(data.tags)
    if data.color is not None:
        task.color = data.color
    if data.category is not None:
        task.category = data.category
    if data.status is not None:
        task.status = data.status
        if data.status == "cancelled":
            cancel_task(task_id)
    if data.scheduled_at is not None:
        task.scheduled_at = datetime.fromisoformat(data.scheduled_at)
        if task.status == "pending":
            schedule_task(task_id, task.scheduled_at)

    task.updated_at = datetime.now()
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    cancel_task(task_id)
    db.delete(task)
    db.commit()
    return {"ok": True}


@router.post("/{task_id}/publish-now")
async def publish_now(task_id: int, db: Session = Depends(get_db)):
    """Immediately trigger a publish for this task."""
    task = db.query(Task).get(task_id)
    if not task:
        raise HTTPException(404, "Task not found")
    if task.status == "running":
        raise HTTPException(400, "Task is already running")

    task.status = "pending"
    task.updated_at = datetime.now()
    db.commit()

    # Schedule for now
    schedule_task(task_id, datetime.now())
    return {"ok": True, "message": "Publishing started"}


@router.get("/{task_id}/logs", response_model=list[TaskLogOut])
def get_task_logs(task_id: int, db: Session = Depends(get_db)):
    return db.query(TaskLog).filter(TaskLog.task_id == task_id).order_by(TaskLog.timestamp).all()


@router.post("/upload-media")
async def upload_media(file: UploadFile = File(...)):
    """Upload a media file to server. Returns the local path."""
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    safe_name = file.filename.replace(" ", "_") if file.filename else "upload"
    dest = UPLOADS_DIR / f"{timestamp}_{safe_name}"

    with open(dest, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"path": str(dest), "filename": safe_name, "size": len(content)}
