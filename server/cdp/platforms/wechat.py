"""
WeChat Official Account (微信公众号) publisher via official MP API.
Flow: get access_token → upload media → create draft → publish draft.
No CDP needed — uses HTTP API directly.
"""
import json
import logging
import time

import httpx

log = logging.getLogger(__name__)

MP_BASE = "https://api.weixin.qq.com/cgi-bin"


async def get_access_token(appid: str, secret: str) -> str:
    """Get or refresh access_token."""
    async with httpx.AsyncClient() as c:
        r = await c.get(f"{MP_BASE}/token", params={
            "grant_type": "client_credential",
            "appid": appid,
            "secret": secret,
        })
        data = r.json()
        if "access_token" not in data:
            raise RuntimeError(f"WeChat token error: {data}")
        return data["access_token"]


async def upload_image(token: str, image_path: str) -> str:
    """Upload image as permanent material. Returns media_id."""
    async with httpx.AsyncClient() as c:
        with open(image_path, "rb") as f:
            r = await c.post(
                f"{MP_BASE}/material/add_material",
                params={"access_token": token, "type": "image"},
                files={"media": (image_path.split("/")[-1].split("\\")[-1], f, "image/jpeg")},
            )
        data = r.json()
        if "media_id" not in data:
            raise RuntimeError(f"WeChat upload error: {data}")
        log.info(f"[WX] Uploaded image: {data['media_id']}")
        return data["media_id"]


async def upload_thumb(token: str, image_path: str) -> str:
    """Upload thumbnail image. Returns thumb_media_id."""
    async with httpx.AsyncClient() as c:
        with open(image_path, "rb") as f:
            r = await c.post(
                f"{MP_BASE}/material/add_material",
                params={"access_token": token, "type": "thumb"},
                files={"media": (image_path.split("/")[-1].split("\\")[-1], f, "image/jpeg")},
            )
        data = r.json()
        if "media_id" not in data:
            raise RuntimeError(f"WeChat thumb upload error: {data}")
        return data["media_id"]


async def create_draft(token: str, title: str, content: str, thumb_media_id: str) -> str:
    """Create a draft article. Returns media_id of the draft."""
    article = {
        "title": title,
        "author": "",
        "digest": content[:120] if len(content) > 120 else "",
        "content": content,
        "thumb_media_id": thumb_media_id,
        "need_open_comment": 0,
        "only_fans_can_comment": 0,
    }
    async with httpx.AsyncClient() as c:
        r = await c.post(
            f"{MP_BASE}/draft/add",
            params={"access_token": token},
            json={"articles": [article]},
        )
        data = r.json()
        if "media_id" not in data:
            raise RuntimeError(f"WeChat draft error: {data}")
        log.info(f"[WX] Draft created: {data['media_id']}")
        return data["media_id"]


async def publish_draft(token: str, media_id: str) -> str:
    """Publish a draft. Returns publish_id."""
    async with httpx.AsyncClient() as c:
        r = await c.post(
            f"{MP_BASE}/freepublish/submit",
            params={"access_token": token},
            json={"media_id": media_id},
        )
        data = r.json()
        if data.get("errcode", 0) != 0:
            raise RuntimeError(f"WeChat publish error: {data}")
        log.info(f"[WX] Published: {data.get('publish_id', '')}")
        return data.get("publish_id", "")


async def publish(session_unused, task, account) -> str:
    """
    Full WeChat publish flow. Does NOT use CDP — uses official API.
    account must have wx_appid and wx_secret.
    """
    if not account.wx_appid or not account.wx_secret:
        raise ValueError("WeChat account missing appid/secret")

    token = await get_access_token(account.wx_appid, account.wx_secret)
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths

    # Upload thumbnail (use cover or first image)
    thumb_path = task.cover_path or (media_paths[0] if media_paths else None)
    if not thumb_path:
        raise ValueError("WeChat publish requires at least one image for thumbnail")

    thumb_id = await upload_thumb(token, thumb_path)

    # Build content HTML (wrap plain text in paragraphs)
    content_html = task.content
    if not content_html.strip().startswith("<"):
        paragraphs = content_html.split("\n")
        content_html = "".join(f"<p>{p}</p>" for p in paragraphs if p.strip())

    # Insert images into content
    for path in media_paths:
        try:
            img_url = await upload_image(token, path)
            content_html += f'<p><img src="{img_url}"/></p>'
        except Exception as e:
            log.warning(f"[WX] Failed to upload image {path}: {e}")

    # Create draft and publish
    draft_id = await create_draft(token, task.title, content_html, thumb_id)
    publish_id = await publish_draft(token, draft_id)

    return f"wechat://publish/{publish_id}"
