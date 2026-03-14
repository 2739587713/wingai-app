# -*- coding: utf-8 -*-
"""
视频合并器 - 使用ffmpeg合并多个视频片段
"""
import uuid
import asyncio
import subprocess
from pathlib import Path
from typing import Dict, AsyncIterator, Optional
from datetime import datetime
from loguru import logger

from config import OUTPUTS_DIR, MAX_CONCURRENT_EXPORTS, TTS_DEFAULT_VOICE
from models.schemas import ExportStatus
from .ffmpeg_composer import CinematicComposer
from .metadata_manager import MetadataManager
from .tts_service import TTSService


class VideoMerger:
    """视频合并器 - 封装ffmpeg实现视频拼接"""

    def __init__(self):
        self.export_tasks: Dict[str, Dict] = {}  # 存储导出任务状态
        self.outputs_dir = Path(OUTPUTS_DIR)
        self.composer = CinematicComposer()
        self.tts = TTSService(default_voice=TTS_DEFAULT_VOICE)
        self.metadata_manager = MetadataManager()

    async def create_export_task(
        self,
        project_id: str,
        config: Dict
    ) -> Dict:
        """
        创建导出任务

        Args:
            project_id: 项目ID
            config: 导出配置

        Returns:
            任务信息
        """
        task_id = str(uuid.uuid4())

        task = {
            "task_id": task_id,
            "project_id": project_id,
            "config": config,
            "status": ExportStatus.PENDING,
            "progress": 0.0,
            "message": "等待开始...",
            "output_url": None,
            "created_at": datetime.now().isoformat()
        }

        self.export_tasks[task_id] = task
        logger.info(f"创建导出任务: {task_id} for project {project_id}")

        return task

    async def process_export(self, task_id: str):
        """
        执行视频合并（后台任务）

        Args:
            task_id: 任务ID
        """
        task = self.export_tasks.get(task_id)
        if not task:
            logger.error(f"任务不存在: {task_id}")
            return

        project_id = task["project_id"]
        config = task["config"]
        project_dir = self.outputs_dir / project_id

        try:
            # 更新状态：处理中
            task["status"] = ExportStatus.PROCESSING
            task["message"] = "准备视频文件..."
            task["progress"] = 0.1
            logger.info(f"开始处理导出任务: {task_id}")

            # 1. 检查项目目录
            if not project_dir.exists():
                raise FileNotFoundError(f"项目目录不存在: {project_dir}")

            metadata = self.metadata_manager.load_metadata(project_dir)
            shots = metadata.get("shots", [])
            if not shots:
                raise FileNotFoundError("没有找到镜头数据")

            logger.info(f"找到 {len(shots)} 个镜头，开始准备导出")
            task["message"] = f"找到 {len(shots)} 个分镜..."
            task["progress"] = 0.2

            await asyncio.sleep(0.5)  # 让前端看到进度

            task["message"] = "准备配音与场景..."
            task["progress"] = 0.35

            compose_scenes = self._build_compose_scenes(project_dir, shots)
            if not compose_scenes:
                raise FileNotFoundError("没有找到可用于导出的动态视频或分镜图")

            narration_text = "。".join(
                (shot.get("narration") or "").strip()
                for shot in shots
                if (shot.get("narration") or "").strip()
            )
            narration_path = None
            if narration_text:
                narration_path = await self.tts.generate_full_narration(
                    full_text=narration_text,
                    output_path=str(project_dir / "narration.mp3"),
                    voice=TTS_DEFAULT_VOICE,
                )

            task["message"] = "正在合成宣传视频..."
            task["progress"] = 0.55

            # 3. 构建输出文件路径
            output_filename = config.get("output_filename", "final_video.mp4")
            output_path = project_dir / output_filename

            # 4. 使用电影级合成器，保留字幕和口播
            await self.composer.compose(
                scenes=compose_scenes,
                narration_audio=narration_path if narration_path and Path(narration_path).exists() else None,
                output_path=str(output_path),
                style=metadata.get("style", "cinematic"),
            )

            # 5. 完成
            task["status"] = ExportStatus.COMPLETED
            task["progress"] = 1.0
            task["message"] = "导出完成！"
            task["output_url"] = f"/videos/{project_id}/{output_filename}"

            logger.info(f"导出任务完成: {task_id}")

        except Exception as e:
            logger.error(f"导出任务失败 {task_id}: {e}")
            task["status"] = ExportStatus.FAILED
            task["message"] = f"导出失败: {str(e)}"
            task["progress"] = 0.0

    def _build_compose_scenes(self, project_dir: Path, shots: list) -> list:
        """从项目元数据构建合成场景，优先使用已生成的动态视频。"""
        compose_scenes = []
        for shot in sorted(shots, key=lambda item: item.get("shot_id", 0)):
            shot_id = shot.get("shot_id", 0)
            if not shot_id:
                continue

            root_video = project_dir / f"scene_{shot_id:03d}.mp4"
            nested_video = project_dir / "videos" / f"scene_{shot_id:03d}.mp4"
            if root_video.exists():
                video_path = str(root_video)
            elif nested_video.exists():
                video_path = str(nested_video)
            else:
                video_path = None

            preview_image = project_dir / "preview" / f"frame_{shot_id:03d}.png"
            image_path = str(preview_image) if preview_image.exists() else None

            if not video_path and not image_path:
                continue

            compose_scenes.append({
                "video_path": video_path,
                "image_path": image_path,
                "duration": shot.get("duration", 5.0),
                "camera": shot.get("camera_movement", "static"),
                "narration": shot.get("narration", ""),
                "mood": shot.get("mood", "neutral"),
            })
        return compose_scenes

    async def _merge_videos(
        self,
        concat_file: Path,
        output_path: Path,
        config: Dict,
        task: Dict
    ):
        """
        使用ffmpeg合并视频

        Args:
            concat_file: concat列表文件
            output_path: 输出文件路径
            config: 导出配置
            task: 任务对象（用于更新进度）
        """
        # 构建ffmpeg命令
        resolution = config.get("resolution", "1920x1080")
        fps = config.get("fps", 30)
        bitrate = config.get("bitrate", "5M")

        # 基础命令：使用concat协议合并
        cmd = [
            "ffmpeg",
            "-f", "concat",
            "-safe", "0",
            "-i", str(concat_file),
            "-c:v", "libx264",       # H.264编码
            "-preset", "medium",      # 编码速度
            "-crf", "23",             # 质量（18-28，越小质量越高）
            "-r", str(fps),           # 帧率
            "-vf", f"scale={resolution}",  # 分辨率
            "-b:v", bitrate,          # 视频码率
            "-c:a", "aac",            # 音频编码
            "-b:a", "128k",           # 音频码率
            "-movflags", "+faststart",  # 快速启动（web优化）
            "-y",                     # 覆盖输出文件
            str(output_path)
        ]

        logger.info(f"执行ffmpeg命令: {' '.join(cmd)}")

        # 在后台线程中执行ffmpeg
        try:
            # 启动ffmpeg进程
            task["progress"] = 0.4
            task["message"] = "正在合并视频..."

            # 使用run_in_executor在线程池中执行阻塞的subprocess调用（兼容Python 3.8+）
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None,  # 使用默认线程池
                lambda: subprocess.run(
                    cmd,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    timeout=300  # 5分钟超时
                )
            )

            # 更新进度
            task["progress"] = 0.9
            task["message"] = "处理完成中..."

            if result.returncode != 0:
                error_msg = result.stderr.decode('utf-8', errors='ignore')
                logger.error(f"ffmpeg错误输出: {error_msg}")
                raise RuntimeError(f"ffmpeg执行失败（返回码 {result.returncode}）: {error_msg[:500]}")

            logger.info(f"视频合并成功: {output_path}")

        except FileNotFoundError as e:
            logger.error(f"ffmpeg未找到，请确保已安装ffmpeg并添加到PATH: {e}")
            raise RuntimeError("ffmpeg未安装或不在PATH中。请安装ffmpeg: https://ffmpeg.org/download.html")
        except Exception as e:
            logger.error(f"执行ffmpeg失败: {e}")
            logger.exception("详细错误信息:")
            raise

    async def get_progress_stream(
        self,
        task_id: str
    ) -> AsyncIterator[Dict]:
        """
        获取进度流（用于WebSocket推送）

        Args:
            task_id: 任务ID

        Yields:
            进度更新字典
        """
        logger.info(f"开始推送进度: {task_id}")

        while True:
            task = self.export_tasks.get(task_id)

            if not task:
                logger.warning(f"任务不存在: {task_id}")
                break

            # 推送当前进度
            yield {
                "task_id": task_id,
                "progress": task["progress"],
                "current_step": task["message"],
                "status": task["status"]
            }

            # 如果任务已完成或失败，停止推送
            if task["status"] in [ExportStatus.COMPLETED, ExportStatus.FAILED]:
                logger.info(f"任务 {task_id} 已结束，停止推送")
                break

            # 每0.5秒推送一次
            await asyncio.sleep(0.5)

    def get_task_status(self, task_id: str) -> Optional[Dict]:
        """
        获取任务状态

        Args:
            task_id: 任务ID

        Returns:
            任务状态字典
        """
        return self.export_tasks.get(task_id)
