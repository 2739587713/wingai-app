# -*- coding: utf-8 -*-
"""
Seedance 2.0 图生视频客户端 - 火山引擎 Ark API
提交+轮询方式，支持可变时长 2-15秒
"""
import asyncio
import httpx
from typing import Dict, List, Optional
from loguru import logger


class SeedanceClient:
    """Seedance 2.0 图生视频客户端 - 火山引擎方舟API"""

    def __init__(
        self,
        api_key: str,
        base_url: str = "https://ark.cn-beijing.volces.com/api/v3",
        model: str = "doubao-seedance-1-0-pro-250528",
        resolution: str = "1080p",
        camera_fixed: bool = False,
        watermark: bool = True,
    ):
        self.api_key = api_key
        self.base_url = base_url
        self.model = model
        self.resolution = resolution
        self.camera_fixed = camera_fixed
        self.watermark = watermark
        self.submit_url = f"{self.base_url}/contents/generations/tasks"
        self.cost_per_second = 1.0  # ¥1.0/秒

    async def generate_video(
        self,
        image_url: str,
        prompt: Optional[str] = None,
        duration: int = 5,
        model: Optional[str] = None,
        cfg_scale: float = 0.5,
        mode: str = "std",
        generate_audio: bool = False,
        ref_images: Optional[List[str]] = None,
        resolution: Optional[str] = None,
        camera_fixed: Optional[bool] = None,
        watermark: Optional[bool] = None,
    ) -> str:
        """
        从图片生成视频（提交+轮询方式）

        Args:
            image_url: 关键帧图片URL或base64
            prompt: 可选的提示词
            duration: 视频时长（2-15秒）
            model: 模型名称，不传则使用初始化默认值
            cfg_scale: 运镜强度
            mode: 模式
            generate_audio: 是否生成原生音频
            ref_images: 额外参考图列表（最多9张）

        Returns:
            str: 生成的视频URL
        """
        logger.info(f"Seedance图生视频: duration={duration}s, audio={generate_audio}")

        try:
            async with httpx.AsyncClient(timeout=600.0, trust_env=False) as client:
                # 1. 提交生成请求
                task_id = await self._submit_request(
                    client=client,
                    image_url=image_url,
                    prompt=prompt,
                    duration=duration,
                    generate_audio=generate_audio,
                    ref_images=ref_images,
                    model=model or self.model,
                    resolution=resolution or self.resolution,
                    camera_fixed=self.camera_fixed if camera_fixed is None else camera_fixed,
                    watermark=self.watermark if watermark is None else watermark,
                )

                if not task_id:
                    raise RuntimeError("Seedance提交请求失败")

                logger.info(f"Seedance请求已提交: task_id={task_id}")

                # 2. 轮询状态直到完成
                result = await self._poll_until_complete(client, task_id)

                if result.get("status") != "succeed":
                    raise RuntimeError(
                        f"Seedance生成失败: {result.get('status')}, {result.get('message', '未知')}"
                    )

                video_url = result.get("video_url")
                if not video_url:
                    raise RuntimeError("Seedance生成成功但未获取到视频URL")

                logger.info(f"Seedance视频生成成功: {video_url[:80]}...")
                return video_url

        except Exception as e:
            logger.error(f"Seedance API调用失败: {e}")
            raise

    async def _submit_request(
        self,
        client: httpx.AsyncClient,
        image_url: str,
        prompt: Optional[str],
        duration: int,
        generate_audio: bool,
        ref_images: Optional[List[str]],
        model: str,
        resolution: str,
        camera_fixed: bool,
        watermark: bool,
    ) -> Optional[str]:
        """提交图生视频请求"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        text_prompt = self._build_prompt_text(
            prompt=prompt,
            duration=duration,
            resolution=resolution,
            camera_fixed=camera_fixed,
            watermark=watermark,
        )

        # Ark 文档推荐格式: text + image_url
        content = []
        if text_prompt:
            content.append({"type": "text", "text": text_prompt})

        # 主图片
        normalized_image_url = self._normalize_image_url(image_url)
        if normalized_image_url:
            content.append({
                "type": "image_url",
                "image_url": {"url": normalized_image_url},
            })

        # 额外参考图（最多9张）
        if ref_images:
            for ref_img in ref_images[:9]:
                normalized_ref = self._normalize_image_url(ref_img)
                if normalized_ref:
                    content.append({
                        "type": "image_url",
                        "image_url": {"url": normalized_ref},
                    })

        if not any(item["type"] == "image_url" for item in content):
            raise ValueError("Seedance 图生视频至少需要一张输入图片")

        payload = {
            "model": model,
            "content": content,
        }

        if generate_audio:
            payload["generate_audio"] = True

        try:
            resp = await client.post(
                self.submit_url,
                json=payload,
                headers=headers,
                timeout=60.0,
            )

            if resp.status_code not in (200, 201):
                logger.error(f"Seedance提交失败: status={resp.status_code}, body={resp.text[:500]}")
                return None

            data = resp.json()
            logger.debug(f"Seedance提交响应: {data}")

            # 从响应中提取task_id
            task_id = data.get("id") or data.get("task_id")
            if not task_id and "data" in data:
                task_id = data["data"].get("id") or data["data"].get("task_id")

            return task_id

        except Exception as e:
            logger.error(f"Seedance提交异常: {e}")
            return None

    async def _poll_until_complete(
        self,
        client: httpx.AsyncClient,
        task_id: str,
        max_retries: int = 180,
        interval: float = 5.0,
    ) -> Dict:
        """轮询任务状态直到完成"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
        }

        poll_url = f"{self.submit_url}/{task_id}"

        for attempt in range(max_retries):
            try:
                resp = await client.get(poll_url, headers=headers, timeout=15.0)

                if resp.status_code != 200:
                    logger.warning(f"Seedance轮询HTTP错误: {resp.status_code}")
                    await asyncio.sleep(interval)
                    continue

                data = resp.json()
                status = data.get("status", "unknown")

                logger.info(f"Seedance轮询 {attempt + 1}/{max_retries}: status={status}")

                # 成功
                if status in ("succeed", "succeeded", "completed", "success"):
                    video_url = self._extract_video_url(data)
                    return {"status": "succeed", "video_url": video_url}

                # 失败
                if status in ("failed", "cancelled", "error"):
                    error_msg = data.get("error", {}).get("message", "未知错误")
                    return {"status": status, "message": error_msg}

                # 处理中
                await asyncio.sleep(interval)

            except Exception as e:
                logger.warning(f"Seedance轮询异常 (尝试 {attempt + 1}/{max_retries}): {e}")
                await asyncio.sleep(interval)

        return {"status": "timeout", "message": "轮询超时"}

    def _extract_video_url(self, response_data: Dict) -> Optional[str]:
        """从响应中提取视频URL"""
        # 尝试常见路径
        # content.video_url
        content = response_data.get("content", {})
        if isinstance(content, dict):
            if "video_url" in content:
                video_url = content["video_url"]
                if isinstance(video_url, str):
                    return video_url
                if isinstance(video_url, dict) and "url" in video_url:
                    return video_url["url"]
            # content.data[0].video.url
            data_list = content.get("data", [])
            if isinstance(data_list, list):
                for item in data_list:
                    if isinstance(item, dict):
                        video = item.get("video", {})
                        if isinstance(video, dict) and "url" in video:
                            return video["url"]
                        if "url" in item:
                            return item["url"]
            # content.result.videos[0].url
            result = content.get("result", {})
            if isinstance(result, dict):
                videos = result.get("videos", [])
                if isinstance(videos, list):
                    for item in videos:
                        if isinstance(item, dict) and "url" in item:
                            return item["url"]

        # data.video_url
        if "video_url" in response_data:
            return response_data["video_url"]

        # output.video_url
        output = response_data.get("output", {})
        if isinstance(output, dict) and "video_url" in output:
            return output["video_url"]

        logger.error(f"Seedance无法提取视频URL: {response_data}")
        return None

    def _build_prompt_text(
        self,
        prompt: Optional[str],
        duration: int,
        resolution: str,
        camera_fixed: bool,
        watermark: bool,
    ) -> str:
        """按 Ark 文档推荐格式拼装文本提示词。"""
        base_prompt = (prompt or "").strip()
        options = [
            f"--resolution {resolution}",
            f"--duration {duration}",
            f"--camerafixed {'true' if camera_fixed else 'false'}",
            f"--watermark {'true' if watermark else 'false'}",
        ]
        return " ".join(part for part in [base_prompt, *options] if part).strip()

    def _normalize_image_url(self, image_url: Optional[str]) -> Optional[str]:
        """兼容公网 URL、data URL 和原始 base64。"""
        if not image_url:
            return None
        if image_url.startswith("http://") or image_url.startswith("https://"):
            return image_url
        if image_url.startswith("data:image/"):
            return image_url
        return f"data:image/png;base64,{image_url}"

    def calculate_cost(self, num_videos: int = 1, duration: int = 5) -> float:
        """计算生成成本（按秒计费）"""
        return self.cost_per_second * duration * num_videos

    async def batch_generate(
        self,
        image_prompts: List[Dict],
        duration: int = 5,
        generate_audio: bool = False,
    ) -> List[Optional[str]]:
        """批量生成多个视频"""
        tasks = []
        for item in image_prompts:
            task = self.generate_video(
                image_url=item["image_url"],
                prompt=item.get("prompt"),
                duration=item.get("duration", duration),
                generate_audio=generate_audio,
            )
            tasks.append(task)

        results = await asyncio.gather(*tasks, return_exceptions=True)

        final_results = []
        for i, result in enumerate(results):
            if isinstance(result, Exception):
                logger.error(f"Seedance批量第{i+1}个失败: {result}")
                final_results.append(None)
            else:
                final_results.append(result)

        return final_results
