"""
Kuaishou (快手) creator platform publisher via CDP.
"""
import asyncio
import json
import logging

from cdp.actions import (
    upload_files, set_input_value, type_text, click,
    check_element_exists, get_current_url, human_delay,
)
from utils.anti_detect import human_delay as delay

log = logging.getLogger(__name__)

CREATOR_URL = "https://cp.kuaishou.com/article/publish/video"


async def check_login(session) -> bool:
    url = await get_current_url(session)
    if "/login" in url or "passport" in url:
        return False
    return await check_element_exists(session, selector_key="ks_login_check")


async def publish(session, task) -> str:
    """Publish video to Kuaishou. Returns published URL."""
    media_paths = json.loads(task.media_paths) if isinstance(task.media_paths, str) else task.media_paths
    tags = json.loads(task.tags) if isinstance(task.tags, str) else task.tags

    # 1. Navigate
    log.info("[KS] Navigating to upload page")
    await session.navigate(CREATOR_URL)
    await asyncio.sleep(4)

    if not await check_login(session):
        raise PermissionError("Kuaishou: Not logged in, cookies expired")

    # 2. Upload video
    if media_paths:
        log.info(f"[KS] Uploading {len(media_paths)} files")
        await upload_files(session, media_paths, selector_key="ks_upload_input")
        # Wait for processing
        for _ in range(120):
            ready = await session.evaluate("""
                (() => {
                    const el = document.querySelector('.upload-success, video, [class*="preview"]');
                    return !!el;
                })()
            """)
            if ready:
                break
            await asyncio.sleep(2)
        await delay(2, 3)

    # 3. Fill title
    if task.title:
        log.info(f"[KS] Setting title: {task.title[:30]}...")
        await set_input_value(session, selector_key="ks_title_input", value=task.title)

    # 4. Fill description
    if task.content:
        log.info(f"[KS] Typing description")
        await type_text(session, selector_key="ks_content_editor", text=task.content)

    # 5. Tags
    if tags:
        for tag in tags:
            tag_text = tag if tag.startswith("#") else f"#{tag}"
            await type_text(session, selector_key="ks_content_editor", text=f" {tag_text}")
            await delay(0.8, 1.5)

    await delay(1, 2)

    # 6. Click publish
    log.info("[KS] Clicking publish")
    await click(session, selector_key="ks_publish_btn")
    await delay(3, 5)

    # 7. Check success
    new_url = await get_current_url(session)
    success = await session.evaluate("""
        (() => {
            const el = document.querySelector('.ant-message-success, [class*="success"]');
            return !!el || window.location.href.includes('content');
        })()
    """)

    if success or "content" in new_url:
        log.info(f"[KS] Published successfully!")
        return new_url
    else:
        error = await session.evaluate("document.querySelector('.ant-message-error')?.textContent || ''")
        raise RuntimeError(f"Kuaishou publish failed: {error or 'unknown'}")
