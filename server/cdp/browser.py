"""
CDP browser management — launch Chrome, connect via WebSocket, send commands.
Only depends on `websockets` and `requests`.
"""
import asyncio
import json
import logging
import os
import subprocess
import time
from pathlib import Path

import requests
import websockets

from config import CHROME_PATHS, CDP_PORT_START, PROFILES_DIR
from utils.anti_detect import STEALTH_JS

log = logging.getLogger(__name__)

# Bypass system proxy for local CDP connections
_no_proxy = {"http": None, "https": None}

# Track allocated ports
_port_counter = 0


def _find_chrome():
    for p in CHROME_PATHS:
        if os.path.isfile(p):
            return p
    # Fallback: try 'chrome' on PATH
    return "chrome"


def _next_port():
    """Find the next available CDP port, skipping ports already in use."""
    global _port_counter
    for _ in range(100):
        port = CDP_PORT_START + _port_counter
        _port_counter = (_port_counter + 1) % 100
        # Check if port is already in use
        try:
            r = requests.get(f"http://127.0.0.1:{port}/json/version", timeout=0.5, proxies=_no_proxy)
            if r.ok:
                log.info(f"Port {port} already in use, skipping")
                continue
        except Exception:
            pass
        return port
    # Fallback: just return the next one
    port = CDP_PORT_START + _port_counter
    _port_counter = (_port_counter + 1) % 100
    return port


def _kill_port(port: int):
    """Kill any process listening on the given port (Windows)."""
    try:
        result = subprocess.run(
            ["netstat", "-ano"],
            capture_output=True, text=True, timeout=5
        )
        for line in result.stdout.splitlines():
            if f"127.0.0.1:{port}" in line and "LISTENING" in line:
                pid = line.strip().split()[-1]
                log.warning(f"Port {port} occupied by PID {pid}, killing it")
                subprocess.run(
                    ["taskkill", "/PID", pid, "/F", "/T"],
                    capture_output=True, timeout=10
                )
                time.sleep(1)
                return True
    except Exception as e:
        log.warning(f"Failed to kill process on port {port}: {e}")
    return False


def launch_chrome(profile_dir: str | None = None, headless=False) -> tuple[subprocess.Popen, int]:
    """Launch Chrome with remote debugging. Returns (process, port)."""
    chrome = _find_chrome()
    port = _next_port()

    # Kill any zombie browser on this port
    _kill_port(port)

    if not profile_dir:
        profile_dir = str(PROFILES_DIR / f"default_{port}")

    Path(profile_dir).mkdir(parents=True, exist_ok=True)

    args = [
        chrome,
        f"--remote-debugging-port={port}",
        f"--user-data-dir={profile_dir}",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-infobars",
        "--disable-extensions",
        "--disable-popup-blocking",
        "--disable-translate",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--window-size=1280,900",
    ]
    if headless:
        args.append("--headless=new")

    log.info(f"Launching Chrome on port {port}, profile={profile_dir}")
    proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    # Wait for CDP to be ready
    for i in range(30):
        try:
            r = requests.get(f"http://127.0.0.1:{port}/json/version", timeout=1, proxies=_no_proxy)
            if r.ok:
                log.info(f"Chrome ready on port {port}")
                return proc, port
        except Exception:
            pass
        time.sleep(0.5)

    proc.kill()
    raise RuntimeError(f"Chrome failed to start on port {port}")


def get_ws_url(port: int, tab_index=0) -> str:
    """Get WebSocket URL for a browser tab."""
    r = requests.get(f"http://127.0.0.1:{port}/json", timeout=5, proxies=_no_proxy)
    tabs = r.json()
    # Filter to page tabs
    pages = [t for t in tabs if t.get("type") == "page"]
    if not pages:
        # Open a new tab
        requests.get(f"http://127.0.0.1:{port}/json/new", timeout=5, proxies=_no_proxy)
        time.sleep(0.5)
        r = requests.get(f"http://127.0.0.1:{port}/json", timeout=5, proxies=_no_proxy)
        pages = [t for t in r.json() if t.get("type") == "page"]
    if tab_index >= len(pages):
        tab_index = 0
    return pages[tab_index]["webSocketDebuggerUrl"]


class CDPSession:
    """WebSocket connection to a Chrome tab via CDP."""

    def __init__(self):
        self.ws = None
        self._id = 0
        self._responses = {}
        self._events = []
        self._listener_task = None

    async def connect(self, ws_url: str):
        self.ws = await websockets.connect(ws_url, max_size=50 * 1024 * 1024, proxy=None)
        self._listener_task = asyncio.create_task(self._listen())
        # Enable required domains
        await self.send("Page.enable")
        await self.send("Runtime.enable")
        await self.send("DOM.enable")
        await self.send("Network.enable")
        # Input domain is always available, no enable needed
        # Inject stealth script
        await self.send("Page.addScriptToEvaluateOnNewDocument", {"source": STEALTH_JS})

    async def _listen(self):
        try:
            async for msg in self.ws:
                data = json.loads(msg)
                if "id" in data:
                    self._responses[data["id"]] = data
                else:
                    self._events.append(data)
        except websockets.exceptions.ConnectionClosed:
            pass

    async def send(self, method: str, params: dict = None, timeout=30) -> dict:
        self._id += 1
        msg_id = self._id
        payload = {"id": msg_id, "method": method}
        if params:
            payload["params"] = params
        await self.ws.send(json.dumps(payload))

        # Wait for response
        deadline = asyncio.get_event_loop().time() + timeout
        while asyncio.get_event_loop().time() < deadline:
            if msg_id in self._responses:
                resp = self._responses.pop(msg_id)
                if "error" in resp:
                    raise RuntimeError(f"CDP error: {resp['error']}")
                return resp.get("result", {})
            await asyncio.sleep(0.05)
        raise TimeoutError(f"CDP command {method} timed out")

    async def evaluate(self, expression: str, await_promise=False) -> any:
        params = {"expression": expression, "returnByValue": True}
        if await_promise:
            params["awaitPromise"] = True
        result = await self.send("Runtime.evaluate", params)
        if result.get("exceptionDetails"):
            raise RuntimeError(f"JS error: {result['exceptionDetails']}")
        return result.get("result", {}).get("value")

    async def minimize_window(self):
        """Minimize the browser window to reduce visual interference."""
        try:
            await self.send("Browser.setWindowBounds", {
                "windowId": 1,
                "bounds": {"windowState": "minimized"}
            })
        except Exception:
            # Browser.setWindowBounds may not be available
            pass

    async def navigate(self, url: str, wait_event="load"):
        await self.send("Page.navigate", {"url": url})
        # Wait for load
        deadline = asyncio.get_event_loop().time() + 30
        while asyncio.get_event_loop().time() < deadline:
            for evt in list(self._events):
                if evt.get("method") == f"Page.{wait_event}Event" or evt.get("method") == "Page.loadEventFired":
                    self._events.remove(evt)
                    return
            await asyncio.sleep(0.1)
        # Fallback: just wait a bit more
        await asyncio.sleep(2)

    async def get_cookies(self) -> list:
        result = await self.send("Network.getAllCookies")
        return result.get("cookies", [])

    async def set_cookies(self, cookies: list):
        """Set cookies. Cleans up fields from getAllCookies format to setCookies format."""
        cleaned = []
        for c in cookies:
            cookie = {
                "name": c["name"],
                "value": c["value"],
                "domain": c.get("domain", ""),
                "path": c.get("path", "/"),
                "secure": c.get("secure", False),
                "httpOnly": c.get("httpOnly", False),
            }
            if c.get("expires", -1) > 0:
                cookie["expires"] = c["expires"]
            if c.get("sameSite"):
                cookie["sameSite"] = c["sameSite"]
            cleaned.append(cookie)
        if cleaned:
            await self.send("Network.setCookies", {"cookies": cleaned})

    async def close(self):
        if self._listener_task:
            self._listener_task.cancel()
        if self.ws:
            await self.ws.close()


def kill_chrome(proc: subprocess.Popen):
    """Kill Chrome process."""
    try:
        proc.terminate()
        proc.wait(timeout=5)
    except Exception:
        try:
            proc.kill()
        except Exception:
            pass
