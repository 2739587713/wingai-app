"""
APScheduler setup — manages timed publish jobs.
Uses AsyncIOScheduler which runs jobs as coroutines in the main event loop.
All times are LOCAL (not UTC) to match user input from the frontend.
"""
import asyncio
import logging
from datetime import datetime, timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.date import DateTrigger

log = logging.getLogger(__name__)

scheduler = AsyncIOScheduler(timezone="Asia/Shanghai")


async def _run_publish(task_id: int):
    """Async wrapper — runs directly in the event loop (no thread issues)."""
    from services.publish_service import execute_task
    log.info(f"Scheduler firing task {task_id}")
    await execute_task(task_id)


def schedule_task(task_id: int, run_at: datetime):
    """Register a task to run at a specific time (local time)."""
    job_id = f"task_{task_id}"
    # Remove existing job if any
    try:
        scheduler.remove_job(job_id)
    except Exception:
        pass

    now = datetime.now()
    if run_at <= now:
        # Already past due — run immediately via the event loop
        log.info(f"Task {task_id} is past due, running now")
        try:
            loop = asyncio.get_running_loop()
            loop.create_task(_run_publish(task_id))
        except RuntimeError:
            # No running loop yet (e.g. during startup) — schedule 2s from now
            run_at = now + timedelta(seconds=2)
            scheduler.add_job(
                _run_publish,
                trigger=DateTrigger(run_date=run_at),
                args=[task_id],
                id=job_id,
                replace_existing=True,
            )
        return

    scheduler.add_job(
        _run_publish,
        trigger=DateTrigger(run_date=run_at),
        args=[task_id],
        id=job_id,
        replace_existing=True,
    )
    log.info(f"Scheduled task {task_id} for {run_at}")


def cancel_task(task_id: int):
    """Remove a scheduled job."""
    try:
        scheduler.remove_job(f"task_{task_id}")
        log.info(f"Cancelled task {task_id}")
    except Exception:
        pass


def reschedule_task(task_id: int, delay_minutes: int = 5):
    """Reschedule a task to run after a delay (for retries)."""
    run_at = datetime.now() + timedelta(minutes=delay_minutes)
    schedule_task(task_id, run_at)


def load_pending_tasks():
    """Load all pending tasks from DB and schedule them. Called on startup."""
    from database import SessionLocal, Task

    db = SessionLocal()
    try:
        tasks = db.query(Task).filter(Task.status == "pending").all()
        for task in tasks:
            if task.scheduled_at:
                schedule_task(task.id, task.scheduled_at)
        log.info(f"Loaded {len(tasks)} pending tasks from database")
    finally:
        db.close()


def start_scheduler():
    scheduler.start()
    load_pending_tasks()
    log.info("Scheduler started")


def stop_scheduler():
    scheduler.shutdown()
    log.info("Scheduler stopped")
