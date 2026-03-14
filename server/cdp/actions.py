"""
Generic CDP actions: click, type, upload files, wait for elements.
Uses multi-fallback selectors from utils/selectors.py.
"""
import asyncio
import json
import logging
import random

from utils.anti_detect import human_delay, typing_delay, short_delay
from utils.selectors import SELECTORS

log = logging.getLogger(__name__)


def _js_sel(sel: str) -> str:
    """Escape a CSS selector for safe embedding in JS strings."""
    return sel.replace("\\", "\\\\").replace("'", "\\'")


async def find_element(session, selector_key: str = None, selectors: list = None) -> str | None:
    """Try multiple selectors, return the first one that matches."""
    sels = selectors or SELECTORS.get(selector_key, [])
    for sel in sels:
        try:
            found = await session.evaluate(f"!!document.querySelector('{_js_sel(sel)}')")
            if found:
                return sel
        except Exception:
            continue
    return None


async def wait_for_element(session, selector_key: str = None, selectors: list = None, timeout=15) -> str:
    """Wait until an element appears. Returns the working selector."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        sel = await find_element(session, selector_key, selectors)
        if sel:
            return sel
        await asyncio.sleep(0.5)
    sels = selectors or SELECTORS.get(selector_key, [])
    raise TimeoutError(f"Element not found: {selector_key or sels}")


async def click(session, selector_key: str = None, selectors: list = None):
    """Click an element using JS click."""
    sel = await wait_for_element(session, selector_key, selectors)
    escaped = _js_sel(sel)
    await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('{escaped}');
            if (el) {{ el.scrollIntoView({{block:'center'}}); el.click(); }}
        }})()
    """)
    await short_delay()
    log.info(f"Clicked: {sel}")


async def set_input_value(session, selector_key: str = None, value: str = "", selectors: list = None):
    """React-compatible value injection."""
    sel = await wait_for_element(session, selector_key, selectors)
    escaped_sel = _js_sel(sel)
    escaped_val = json.dumps(value)
    await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('{escaped_sel}');
            if (!el) return false;
            const proto = el.tagName === 'TEXTAREA'
                ? window.HTMLTextAreaElement.prototype
                : window.HTMLInputElement.prototype;
            const desc = Object.getOwnPropertyDescriptor(proto, 'value');
            if (desc && desc.set) {{
                desc.set.call(el, {escaped_val});
            }} else {{
                el.value = {escaped_val};
            }}
            el.dispatchEvent(new Event('input', {{ bubbles: true }}));
            el.dispatchEvent(new Event('change', {{ bubbles: true }}));
            return true;
        }})()
    """)
    await short_delay()
    log.info(f"Set value on {sel}: {value[:50]}...")


async def type_text(session, selector_key: str = None, text: str = "", selectors: list = None):
    """Type text into a contenteditable or input using batch insertText."""
    sel = await wait_for_element(session, selector_key, selectors)
    escaped = _js_sel(sel)
    await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('{escaped}');
            if (el) {{ el.focus(); el.click(); }}
        }})()
    """)
    await short_delay()

    # Insert full text at once to avoid race conditions with char-by-char input
    await session.evaluate(f"document.execCommand('insertText', false, {json.dumps(text)})")
    await short_delay()

    log.info(f"Typed into {sel}: {text[:50]}...")


async def clear_and_type(session, selector_key: str = None, text: str = "", selectors: list = None):
    """Clear field then type text."""
    sel = await wait_for_element(session, selector_key, selectors)
    escaped = _js_sel(sel)
    await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('{escaped}');
            if (el) {{
                el.focus();
                el.click();
                document.execCommand('selectAll');
                document.execCommand('delete');
            }}
        }})()
    """)
    await short_delay()
    await type_text(session, selectors=[sel], text=text)


async def upload_files(session, file_paths: list, selector_key: str = None, selectors: list = None, timeout: int = 30):
    """Upload files via DOM.setFileInputFiles CDP command.
    Retries with increasing DOM depth to find hidden/lazy file inputs."""
    sel_list = selectors or SELECTORS.get(selector_key, ["input[type='file']"])

    deadline = asyncio.get_event_loop().time() + timeout
    node_id = None

    while asyncio.get_event_loop().time() < deadline:
        # Use deeper depth to find nested file inputs
        for depth in (-1, 3, 6):
            try:
                doc = await session.send("DOM.getDocument", {"depth": depth})
                root_id = doc["root"]["nodeId"]
                for sel in sel_list:
                    try:
                        result = await session.send("DOM.querySelector", {"nodeId": root_id, "selector": sel})
                        if result.get("nodeId", 0) > 0:
                            node_id = result["nodeId"]
                            log.info(f"Found file input with selector '{sel}' at depth={depth}")
                            break
                    except Exception:
                        continue
                if node_id:
                    break
            except Exception:
                continue
        if node_id:
            break

        # Try querySelectorAll via JS to check if any file inputs exist at all
        count = await session.evaluate("document.querySelectorAll('input[type=\"file\"]').length")
        log.info(f"[upload] JS found {count} file inputs on page, retrying DOM query...")

        await asyncio.sleep(2)

    if not node_id:
        # Fallback: use JS to find the element and get its backendNodeId via DOM.describeNode
        log.info("[upload] DOM.querySelector failed, trying JS + DOM.resolveNode fallback")
        try:
            # Make hidden file inputs visible first
            await session.evaluate("""
                document.querySelectorAll('input[type="file"]').forEach(el => {
                    el.style.display = 'block';
                    el.style.opacity = '1';
                    el.style.position = 'relative';
                    el.style.zIndex = '99999';
                })
            """)
            await asyncio.sleep(0.5)

            # Get the element via JS and use DOM.pushNodeByPathToFrontend
            remote_obj = await session.send("Runtime.evaluate", {
                "expression": "document.querySelector('input[type=\"file\"]')",
                "returnByValue": False,
            })
            obj_id = remote_obj.get("result", {}).get("objectId")
            if obj_id:
                node_info = await session.send("DOM.requestNode", {"objectId": obj_id})
                node_id = node_info.get("nodeId", 0)
                if node_id > 0:
                    log.info(f"[upload] Found file input via JS fallback, nodeId={node_id}")
        except Exception as e:
            log.warning(f"[upload] JS fallback also failed: {e}")

    if not node_id:
        raise RuntimeError(f"File input not found: {selector_key or sel_list}")

    # Normalize file paths (forward slashes for CDP)
    files = [str(p).replace("\\", "/") for p in file_paths]

    await session.send("DOM.setFileInputFiles", {
        "nodeId": node_id,
        "files": files,
    })
    log.info(f"Uploaded {len(file_paths)} files via {sel_list}")
    await human_delay(2, 5)


async def check_element_exists(session, selector_key: str = None, selectors: list = None) -> bool:
    """Check if any of the selectors match."""
    sel = await find_element(session, selector_key, selectors)
    return sel is not None


async def get_current_url(session) -> str:
    return await session.evaluate("window.location.href")


async def wait_for_url_change(session, old_url: str, timeout=30):
    """Wait until the URL changes from old_url."""
    deadline = asyncio.get_event_loop().time() + timeout
    while asyncio.get_event_loop().time() < deadline:
        current = await get_current_url(session)
        if current != old_url:
            return current
        await asyncio.sleep(0.5)
    return await get_current_url(session)


async def take_screenshot(session) -> bytes:
    """Take a screenshot."""
    result = await session.send("Page.captureScreenshot", {"format": "png"})
    import base64
    return base64.b64decode(result["data"])


async def take_element_screenshot(session, selector: str) -> bytes | None:
    """Screenshot a specific element."""
    escaped = _js_sel(selector)
    bounds = await session.evaluate(f"""
        (() => {{
            const el = document.querySelector('{escaped}');
            if (!el) return null;
            const r = el.getBoundingClientRect();
            return {{x: r.x, y: r.y, width: r.width, height: r.height}};
        }})()
    """)
    if not bounds:
        return None
    result = await session.send("Page.captureScreenshot", {
        "format": "png",
        "clip": {
            "x": bounds["x"], "y": bounds["y"],
            "width": bounds["width"], "height": bounds["height"],
            "scale": 1,
        }
    })
    import base64
    return base64.b64decode(result["data"])
