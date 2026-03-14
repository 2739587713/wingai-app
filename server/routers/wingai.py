# -*- coding: utf-8 -*-
"""
Wing AI 专用 API - 分镜图生成、视频生产等
"""
import base64
import re
import time
import uuid
import httpx
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from loguru import logger

from config import IMAGE_PROVIDER, ARK_API_KEY, OUTPUTS_DIR
from services.provider_factory import get_image_client
from services.script_preview_service import ScriptPreviewService
from services.metadata_manager import MetadataManager

router = APIRouter(prefix="/api/wingai", tags=["wingai"])
preview_service = ScriptPreviewService()


def _sse_stream(gen):
    """将异步生成器转为 SSE 流"""
    import json
    import asyncio

    async def stream():
        try:
            async for event in gen:
                ev = event.get("event", "message")
                data = event.get("data", event)
                yield f"event: {ev}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
        except Exception as e:
            logger.error(f"Wing AI produce_video SSE error: {e}")
            yield f"event: error\ndata: {json.dumps({'message': str(e)}, ensure_ascii=False)}\n\n"

    return StreamingResponse(
        stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


class GenerateKeyframeRequest(BaseModel):
    """单张分镜图生成请求"""
    prompt: str
    aspect_ratio: str = "16:9"


class ProduceVideoShot(BaseModel):
    """分镜项"""
    text: str = ""
    duration: Optional[float] = None
    dur: Optional[str] = None  # 前端格式如 "8.6s"


class ProduceVideoRequest(BaseModel):
    """视频生产请求"""
    images: List[str] = Field(..., description="分镜图 URL 或 base64 data URI")
    shots: List[ProduceVideoShot] = Field(..., description="分镜文案与时长")
    product_name: str = Field(default="", description="产品名称")


@router.post("/generate-keyframe")
async def generate_keyframe(req: GenerateKeyframeRequest):
    """
    根据提示词生成单张分镜图
    NanoBanana 失败时自动尝试 Seedream（若已配置 ARK_API_KEY）
    """
    if not req.prompt or not req.prompt.strip():
        raise HTTPException(status_code=400, detail="提示词不能为空")
    prompt = req.prompt.strip()

    clients_to_try = [("primary", get_image_client())]
    if IMAGE_PROVIDER.lower() == "nanobanana" and ARK_API_KEY:
        try:
            from config import ARK_BASE_URL
            from services.seedream_client import SeedreamClient
            clients_to_try.append(("seedream", SeedreamClient(api_key=ARK_API_KEY, base_url=ARK_BASE_URL)))
        except Exception:
            pass

    last_err = None
    for name, c in clients_to_try:
        try:
            images = await c.generate_image(prompt=prompt, num_images=1)
            if images:
                return {"image_url": images[0], "success": True}
        except Exception as e:
            last_err = e
            logger.warning(f"Wing AI 分镜图 {name} 失败: {e}，尝试备用...")

    logger.error(f"Wing AI 分镜图生成失败: {last_err}")
    raise HTTPException(
        status_code=500,
        detail=f"图片生成失败，请检查 NANOBANANA_API_KEY 或 ARK_API_KEY 配置。错误: {last_err}"
    )


def _parse_duration(s: str) -> float:
    """解析时长字符串，如 '8.6s' -> 5, '6.9s' -> 5"""
    if not s:
        return 5.0
    m = re.search(r"([\d.]+)\s*s?", str(s))
    if m:
        v = float(m.group(1))
        return max(3, min(10, round(v)))
    return 5.0


async def _save_image_to_file(img_src: str, out_path: Path) -> bool:
    """将图片 URL 或 base64 保存到文件"""
    out_path.parent.mkdir(parents=True, exist_ok=True)
    if img_src.startswith("data:"):
        # data:image/png;base64,xxx
        try:
            b64 = img_src.split(",", 1)[1]
            data = base64.b64decode(b64)
            with open(out_path, "wb") as f:
                f.write(data)
            return True
        except Exception as e:
            logger.warning(f"Base64 解码失败: {e}")
            return False
    # HTTP URL
    try:
        async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
            resp = await client.get(img_src)
            resp.raise_for_status()
            with open(out_path, "wb") as f:
                f.write(resp.content)
            return True
    except Exception as e:
        logger.warning(f"下载图片失败 {img_src[:80]}: {e}")
        return False


@router.post("/produce-video")
async def produce_video(req: ProduceVideoRequest, request: Request):
    """
    SSE: 根据分镜图+文案生产视频（图生视频+TTS+FFmpeg合成）
    前端需先完成分镜图生成，再调用此接口
    """
    if not req.images or not req.shots:
        raise HTTPException(status_code=400, detail="分镜图和文案不能为空")
    n = min(len(req.images), len(req.shots))
    if n == 0:
        raise HTTPException(status_code=400, detail="至少需要 1 个分镜")

    project_id = f"wingai_{int(time.time())}_{uuid.uuid4().hex[:6]}"
    project_dir = OUTPUTS_DIR / project_id
    project_dir.mkdir(parents=True, exist_ok=True)
    preview_dir = project_dir / "preview"
    preview_dir.mkdir(exist_ok=True)

    # 保存分镜图
    base_url = str(request.base_url).rstrip("/")
    for i in range(n):
        img_src = req.images[i]
        if img_src.startswith("/"):
            img_src = base_url + img_src
        frame_path = preview_dir / f"frame_{i+1:03d}.png"
        ok = await _save_image_to_file(img_src, frame_path)
        if not ok:
            raise HTTPException(status_code=400, detail=f"分镜图 {i+1} 保存失败，请检查图片格式")

    # 构建 shots 元数据（与 script_preview_service 期望格式一致）
    shots = []
    for i in range(n):
        s = req.shots[i]
        dur = s.duration if s.duration is not None else _parse_duration(s.dur or "5s")
        shots.append({
            "shot_id": i + 1,
            "narration": s.text or "",
            "duration": dur,
            "camera_movement": "static",
            "visual_description": "",
            "mood": "neutral",
        })

    metadata = {
        "project_id": project_id,
        "product_name": req.product_name or "Wing AI 视频",
        "shots": shots,
        "style": "cinematic",
    }
    MetadataManager.save_metadata(project_dir, metadata)

    return _sse_stream(preview_service.produce_video(project_id))
