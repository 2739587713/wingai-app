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
    img_position = Column(String(10), default="end")  # start/end — where inline images go relative to text
    tags = Column(Text, default="[]")              # JSON array
    scheduled_at = Column(DateTime, nullable=False)
    color = Column(String(20), default="#7C3AED")
    category = Column(String(20), default="daily") # sell/edu/story/daily
    auto_publish = Column(Integer, default=1)       # 1=自动发布 0=仅记录，手动标记
    status = Column(String(20), default="pending") # pending/running/success/failed/cancelled/manual
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
    # Migrate: add new columns if missing (SQLite)
    _text = __import__("sqlalchemy").text
    _migrations = [
        ("img_position", "ALTER TABLE tasks ADD COLUMN img_position VARCHAR(10) DEFAULT 'end'"),
        ("auto_publish", "ALTER TABLE tasks ADD COLUMN auto_publish INTEGER DEFAULT 1"),
    ]
    for col, sql in _migrations:
        try:
            with engine.connect() as conn:
                conn.execute(_text(f"SELECT {col} FROM tasks LIMIT 1"))
        except Exception:
            try:
                with engine.connect() as conn:
                    conn.execute(_text(sql))
                    conn.commit()
            except Exception:
                pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
