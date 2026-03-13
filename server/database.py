from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
from config import DB_PATH

engine = create_engine(f"sqlite:///{DB_PATH}", echo=False, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()


class Account(Base):
    __tablename__ = "accounts"
    id = Column(Integer, primary_key=True)
    platform = Column(String(20), nullable=False)  # xiaohongshu/douyin/kuaishou/wechat
    nickname = Column(String(100), default="")
    profile_dir = Column(String(500), default="")
    cookies_json = Column(Text, default="")
    cookie_expiry = Column(DateTime, nullable=True)
    wx_appid = Column(String(100), default="")      # WeChat only
    wx_secret = Column(String(100), default="")      # WeChat only
    wx_token = Column(Text, default="")              # WeChat only
    status = Column(String(20), default="login_required")  # active/expired/login_required
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    tasks = relationship("Task", back_populates="account", cascade="all, delete-orphan")


class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True)
    account_id = Column(Integer, ForeignKey("accounts.id"), nullable=False)
    platform = Column(String(20), nullable=False)
    content_type = Column(String(20), default="image")  # image/video
    title = Column(String(500), default="")
    content = Column(Text, default="")
    media_paths = Column(Text, default="[]")       # JSON array
    cover_path = Column(String(500), default="")
    tags = Column(Text, default="[]")              # JSON array
    scheduled_at = Column(DateTime, nullable=False)
    color = Column(String(20), default="#7C3AED")
    category = Column(String(20), default="daily") # sell/edu/story/daily
    status = Column(String(20), default="pending") # pending/running/success/failed/cancelled
    retry_count = Column(Integer, default=0)
    error_log = Column(Text, default="")
    publish_url = Column(String(1000), default="")
    created_at = Column(DateTime, default=datetime.now)
    updated_at = Column(DateTime, default=datetime.now, onupdate=datetime.now)
    account = relationship("Account", back_populates="tasks")
    logs = relationship("TaskLog", back_populates="task", order_by="TaskLog.timestamp", cascade="all, delete-orphan")


class TaskLog(Base):
    __tablename__ = "task_logs"
    id = Column(Integer, primary_key=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.now)
    level = Column(String(10), default="info")  # info/warn/error
    message = Column(Text, default="")
    task = relationship("Task", back_populates="logs")


def init_db():
    Base.metadata.create_all(engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
