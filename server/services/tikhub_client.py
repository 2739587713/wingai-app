# -*- coding: utf-8 -*-
"""
TikHub API客户端 - 搜索抖音热门视频和话题
"""
import json
import httpx
from typing import List, Dict
from loguru import logger

from config import TIKHUB_API_KEY, TIKHUB_BASE_URL


class TikHubClient:
    """TikHub API客户端 - 获取抖音竞品视频数据"""

    def __init__(self, api_key: str = None, base_url: str = None):
        self.api_key = api_key or TIKHUB_API_KEY
        self.base_url = base_url or TIKHUB_BASE_URL

    async def search_videos(self, keyword: str, count: int = 20, sort_type: int = 0) -> List[Dict]:
        """
        搜索抖音视频 (使用POST搜索端点)

        Args:
            keyword: 搜索关键词
            count: 返回数量 (默认20)
            sort_type: 排序方式 (0=综合, 1=最多点赞, 2=最新发布)

        Returns:
            视频列表, 每项含 video_id, description, play_count, digg_count 等
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            # POST搜索端点要求字符串类型参数
            payload = {
                "keyword": keyword,
                "count": str(count),
                "sort_type": str(sort_type),
                "offset": "0"
            }

            async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
                resp = await client.post(
                    f"{self.base_url}/api/v1/douyin/search/fetch_video_search_v1",
                    headers=headers,
                    json=payload
                )

                if resp.status_code != 200:
                    logger.error(f"TikHub搜索失败: status={resp.status_code}, body={resp.text[:200]}")
                    return []

                data = resp.json()
                videos = self._parse_search_results(data)
                logger.info(f"TikHub搜索'{keyword}'返回{len(videos)}条视频")
                return videos

        except Exception as e:
            logger.error(f"TikHub搜索异常: {e}")
            return []

    async def get_hot_topics(self) -> List[Dict]:
        """
        获取抖音热搜榜

        Returns:
            热搜列表, 每项含 title, hot_value, position
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }

            async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
                # 优先使用 app 接口
                resp = await client.get(
                    f"{self.base_url}/api/v1/douyin/app/v3/fetch_hot_search_list",
                    headers=headers,
                    params={}
                )

                if resp.status_code != 200:
                    logger.error(f"TikHub热搜失败: status={resp.status_code}")
                    return []

                data = resp.json()
                topics = self._parse_hot_topics(data)

                # app 接口解析为空时，尝试 web 接口
                if len(topics) == 0:
                    if data and isinstance(data, dict):
                        logger.debug(f"TikHub app热搜空，尝试web接口。原始data.keys={list(data.keys())}")
                    resp_web = await client.get(
                        f"{self.base_url}/api/v1/douyin/web/fetch_hot_search_result",
                        headers=headers,
                        params={}
                    )
                    if resp_web.status_code == 200:
                        data_web = resp_web.json()
                        topics = self._parse_hot_topics(data_web)

                logger.info(f"TikHub热搜返回{len(topics)}条")
                return topics

        except Exception as e:
            logger.error(f"TikHub热搜异常: {e}")
            return []

    def _parse_search_results(self, data: dict) -> List[Dict]:
        """解析搜索结果"""
        videos = []
        try:
            # TikHub API 返回结构: data.data 或 data.aweme_list
            raw_list = []
            if isinstance(data, dict):
                if "data" in data and isinstance(data["data"], dict):
                    raw_list = data["data"].get("data") or data["data"].get("aweme_list") or []
                elif "data" in data and isinstance(data["data"], list):
                    raw_list = data["data"]

            for item in raw_list:
                # 提取aweme_info（如果嵌套）
                aweme = item.get("aweme_info", item)

                statistics = aweme.get("statistics", {})
                desc = aweme.get("desc", "")
                hashtags = []
                for tag in (aweme.get("text_extra") or []):
                    if isinstance(tag, dict) and tag.get("hashtag_name"):
                        hashtags.append(tag["hashtag_name"])

                # 提取封面图
                cover_url = ""
                video_info = aweme.get("video", {})
                if isinstance(video_info, dict):
                    for cover_key in ("origin_cover", "cover", "dynamic_cover"):
                        cover_obj = video_info.get(cover_key, {})
                        if isinstance(cover_obj, dict):
                            urls = cover_obj.get("url_list") or []
                            if urls:
                                cover_url = urls[0]
                                break

                vid = aweme.get("aweme_id", "")
                videos.append({
                    "video_id": vid,
                    "description": desc,
                    "play_count": statistics.get("play_count", 0),
                    "digg_count": statistics.get("digg_count", 0),
                    "comment_count": statistics.get("comment_count", 0),
                    "share_count": statistics.get("share_count", 0),
                    "duration": aweme.get("duration", 0),
                    "hashtags": hashtags,
                    "cover_url": cover_url,
                    "video_url": f"https://www.douyin.com/video/{vid}" if vid else "",
                })
        except Exception as e:
            logger.error(f"解析TikHub搜索结果失败: {e}")

        return videos

    async def get_video_download_url(self, aweme_id: str) -> str:
        """
        获取视频无水印高清下载URL

        Args:
            aweme_id: 视频ID

        Returns:
            无水印高清视频URL
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            params = {"aweme_id": aweme_id}

            async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/douyin/app/v3/fetch_video_high_quality_play_url",
                    headers=headers,
                    params=params
                )

                if resp.status_code != 200:
                    logger.error(f"TikHub获取视频URL失败: status={resp.status_code}, body={resp.text[:200]}")
                    return ""

                data = resp.json()
                # 提取视频URL
                video_data = data.get("data", {})
                if isinstance(video_data, dict):
                    url = video_data.get("original_video_url", "")
                    if not url:
                        # 备选字段
                        url = video_data.get("video_url", "")
                    if url:
                        logger.info(f"TikHub获取视频URL成功: aweme_id={aweme_id}")
                        return url

                logger.warning(f"TikHub视频URL为空: aweme_id={aweme_id}, resp={str(data)[:300]}")
                return ""

        except Exception as e:
            logger.error(f"TikHub获取视频URL异常: {e}")
            return ""

    async def get_video_comments(self, aweme_id: str, count: int = 50) -> List[Dict]:
        """
        获取视频评论（按点赞排序）

        Args:
            aweme_id: 视频ID
            count: 返回数量

        Returns:
            评论列表, 每项含 text, digg_count, user_nickname
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            params = {
                "aweme_id": aweme_id,
                "count": count,
                "cursor": 0
            }

            async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/douyin/app/v3/fetch_video_comments",
                    headers=headers,
                    params=params
                )

                if resp.status_code != 200:
                    logger.error(f"TikHub获取评论失败: status={resp.status_code}")
                    return []

                data = resp.json()
                comments = self._parse_comments(data)
                # 按点赞数排序
                comments.sort(key=lambda x: x.get("digg_count", 0), reverse=True)
                logger.info(f"TikHub获取评论成功: aweme_id={aweme_id}, count={len(comments)}")
                return comments

        except Exception as e:
            logger.error(f"TikHub获取评论异常: {e}")
            return []

    async def get_video_detail(self, aweme_id: str) -> Dict:
        """
        获取单个视频详细信息

        Args:
            aweme_id: 视频ID

        Returns:
            视频详情: video_id, desc, author, digg_count, comment_count, play_count, cover_url, duration
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            params = {"aweme_id": aweme_id}

            async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/douyin/web/fetch_one_video",
                    headers=headers,
                    params=params
                )

                if resp.status_code != 200:
                    logger.error(f"TikHub获取视频详情失败: status={resp.status_code}")
                    return {}

                data = resp.json()
                detail = self._parse_video_detail(data)
                if detail:
                    logger.info(f"TikHub获取视频详情成功: aweme_id={aweme_id}")
                return detail

        except Exception as e:
            logger.error(f"TikHub获取视频详情异常: {e}")
            return {}

    def _parse_comments(self, data: dict) -> List[Dict]:
        """解析评论结果"""
        comments = []
        try:
            raw_list = []
            if isinstance(data, dict):
                if "data" in data:
                    d = data["data"]
                    if isinstance(d, dict):
                        raw_list = d.get("comments", []) or d.get("data", [])
                    elif isinstance(d, list):
                        raw_list = d

            for item in raw_list:
                if not item:
                    continue
                user = item.get("user", {})
                comments.append({
                    "text": item.get("text", ""),
                    "digg_count": item.get("digg_count", 0),
                    "user_nickname": user.get("nickname", "匿名用户"),
                    "create_time": item.get("create_time", 0),
                })
        except Exception as e:
            logger.error(f"解析TikHub评论失败: {e}")

        return comments

    def _parse_video_detail(self, data: dict) -> Dict:
        """解析单个视频详情"""
        try:
            aweme = {}
            if isinstance(data, dict):
                if "data" in data:
                    d = data["data"]
                    if isinstance(d, dict):
                        aweme = d.get("aweme_detail", d)

            if not aweme:
                return {}

            statistics = aweme.get("statistics", {})
            author = aweme.get("author", {})

            # 封面URL
            cover = aweme.get("video", {}).get("cover", {}).get("url_list", [""])[0]
            if not cover:
                cover = aweme.get("video", {}).get("origin_cover", {}).get("url_list", [""])[0]

            return {
                "video_id": aweme.get("aweme_id", ""),
                "desc": aweme.get("desc", ""),
                "author": author.get("nickname", ""),
                "author_id": author.get("uid", ""),
                "digg_count": statistics.get("digg_count", 0),
                "comment_count": statistics.get("comment_count", 0),
                "play_count": statistics.get("play_count", 0),
                "share_count": statistics.get("share_count", 0),
                "cover_url": cover,
                "duration": aweme.get("duration", 0),
                "create_time": aweme.get("create_time", 0),
            }
        except Exception as e:
            logger.error(f"解析TikHub视频详情失败: {e}")
            return {}

    def _parse_hot_topics(self, data: dict) -> List[Dict]:
        """解析热搜结果，兼容多种 TikHub 返回格式"""
        topics = []
        try:
            raw_list = []
            if isinstance(data, dict):
                d = data.get("data")
                if d is not None:
                    # data 可能是 JSON 字符串
                    if isinstance(d, str):
                        try:
                            d = json.loads(d)
                        except (json.JSONDecodeError, TypeError):
                            d = {}
                    if isinstance(d, dict):
                        # 优先取 word_list/trending_list，确保 raw_list 为 list
                        cand = d.get("word_list") or d.get("trending_list") or d.get("data") or d.get("list")
                        if isinstance(cand, list):
                            raw_list = cand
                        elif isinstance(cand, dict):
                            # 嵌套结构：data.data 仍为 dict，从中取 word_list
                            raw_list = cand.get("word_list") or cand.get("trending_list") or []
                        else:
                            raw_list = []
                    elif isinstance(d, list):
                        raw_list = d

            for i, item in enumerate(raw_list):
                if item is None:
                    continue
                # 兼容 item 为字符串（直接为热搜词）
                if isinstance(item, str):
                    topics.append({"title": item, "hot_value": 0, "position": i + 1})
                    continue
                if not isinstance(item, dict):
                    continue
                title = item.get("word") or item.get("title") or item.get("keyword") or item.get("name") or ""
                if not title:
                    continue
                hot_value = item.get("hot_value") or item.get("hot_value_str") or item.get("heat") or 0
                if isinstance(hot_value, str):
                    try:
                        hot_value = int(hot_value.replace("万", "").replace("w", "").replace("W", ""))
                    except (ValueError, TypeError):
                        hot_value = 0
                topics.append({
                    "title": title,
                    "hot_value": hot_value,
                    "position": i + 1
                })
        except Exception as e:
            logger.error(f"解析TikHub热搜结果失败: {e}")

        return topics

    async def search_xiaohongshu(self, keyword: str, count: int = 10) -> List[Dict]:
        """
        搜索小红书笔记

        Args:
            keyword: 搜索关键词
            count: 返回数量

        Returns:
            笔记列表, 每项含 title, desc, liked_count 等
        """
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json"
            }
            params = {
                "keyword": keyword,
                "sort": "general",
                "page": "1",
            }

            async with httpx.AsyncClient(timeout=30.0, trust_env=False) as client:
                resp = await client.get(
                    f"{self.base_url}/api/v1/xiaohongshu/web/search_notes",
                    headers=headers,
                    params=params
                )

                if resp.status_code != 200:
                    logger.error(f"TikHub小红书搜索失败: status={resp.status_code}")
                    return []

                data = resp.json()
                return self._parse_xhs_results(data, count)

        except Exception as e:
            logger.error(f"TikHub小红书搜索异常: {e}")
            return []

    def _parse_xhs_results(self, data: dict, max_count: int = 10) -> List[Dict]:
        """解析小红书搜索结果，兼容多层嵌套"""
        notes = []
        try:
            # TikHub 返回结构: data.data (可能还有 data.data.data)
            raw = data.get("data", {})
            items = []

            if isinstance(raw, dict):
                # 尝试 data.data.data.items (三层嵌套)
                inner = raw.get("data")
                if isinstance(inner, dict):
                    items = inner.get("items") or inner.get("notes") or []
                # 尝试 data.data.items (两层)
                if not items:
                    items = raw.get("items") or raw.get("notes") or raw.get("data") or []
                # items 可能是 dict (key=id)
                if isinstance(items, dict):
                    items = list(items.values())
            elif isinstance(raw, list):
                items = raw

            for item in items[:max_count]:
                if not item or not isinstance(item, dict):
                    continue
                # item 可能有 note 或 note_card 字段
                note = item.get("note") or item.get("note_card") or item
                interact_info = note.get("interact_info") or {}
                user = note.get("user") or {}

                title = (note.get("display_title")
                         or note.get("title")
                         or note.get("desc", "")[:30]
                         or "")
                if not title:
                    continue

                notes.append({
                    "title": title,
                    "desc": (note.get("desc") or "")[:200],
                    "liked_count": interact_info.get("liked_count") or note.get("liked_count") or "0",
                    "author": user.get("nickname") or user.get("nick_name") or "",
                    "type": note.get("type") or "normal",
                })
        except Exception as e:
            logger.error(f"解析小红书结果失败: {e}")

        return notes
