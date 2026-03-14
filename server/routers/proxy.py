# -*- coding: utf-8 -*-
"""
Wing AI 前端所需的 API 代理（api-proxy、tikhub-proxy 等）
开发时由 Vite 代理，生产环境由此模块转发
"""
import json
from fastapi import APIRouter, Request
from fastapi.responses import Response
import httpx
from loguru import logger

from config import QWEN_API_KEY, QWEN_BASE_URL, QWEN_MODEL

router = APIRouter(tags=["proxy"])

# 代理目标（与 wingai vite.config.js 一致）
PROXY_TARGETS = {
    "api-proxy": "https://api.apiyi.com",
    "tikhub-proxy": "https://api.tikhub.io",
    "blt-proxy": "https://api.bltcy.ai",
    "tmpfiles-proxy": "https://tmpfiles.org",
}

# 千问模型（走阿里云百炼官网 API）
QWEN_MODELS = ("qwen3-max", "qwen-max", "qwen-plus", "qwen-turbo")


async def _proxy_request(prefix: str, path: str, request: Request, body: bytes = None, headers_override: dict = None) -> Response:
    """将请求转发到目标服务"""
    base = PROXY_TARGETS.get(prefix)
    if not base:
        return Response(content="Unknown proxy", status_code=404)

    url = f"{base.rstrip('/')}/{path.lstrip('/')}" if path else base
    if request.url.query:
        url = f"{url}?{request.url.query}"

    skip_headers = {"host", "connection", "content-length"}
    headers = headers_override or {
        k: v for k, v in request.headers.items()
        if k.lower() not in skip_headers
    }
    req_body = body if body is not None else await request.body()

    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            resp = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=req_body,
            )
        skip = {"host", "connection", "content-length", "content-encoding", "transfer-encoding"}
        return Response(
            content=resp.content,
            status_code=resp.status_code,
            headers={k: v for k, v in resp.headers.items() if k.lower() not in skip},
        )
    except Exception as e:
        logger.error(f"Proxy {prefix} error: {e}")
        return Response(content=str(e), status_code=502)


@router.api_route("/api-proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_api_proxy(path: str, request: Request):
    """转发到目标 API。Qwen 请求走阿里云百炼官网"""
    body = await request.body()
    skip_headers = {"host", "connection", "content-length"}
    headers = {k: v for k, v in request.headers.items() if k.lower() not in skip_headers}

    # Qwen 请求 → 阿里云百炼官网
    if request.method == "POST" and "chat/completions" in path:
        try:
            data = json.loads(body)
            model = (data.get("model") or "").lower()
            if any(m in model for m in QWEN_MODELS):
                data["model"] = QWEN_MODEL
                headers["Authorization"] = f"Bearer {QWEN_API_KEY}"
                url = f"{QWEN_BASE_URL.rstrip('/')}/chat/completions"
                if request.url.query:
                    url = f"{url}?{request.url.query}"
                body = json.dumps(data).encode("utf-8")
                async with httpx.AsyncClient(timeout=120.0) as client:
                    resp = await client.request(
                        method="POST",
                        url=url,
                        headers=headers,
                        content=body,
                    )
                skip = {"host", "connection", "content-length", "content-encoding", "transfer-encoding"}
                return Response(
                    content=resp.content,
                    status_code=resp.status_code,
                    headers={k: v for k, v in resp.headers.items() if k.lower() not in skip},
                )
        except json.JSONDecodeError:
            pass
        except Exception as e:
            logger.error(f"api-proxy Qwen error: {e}")

    return await _proxy_request("api-proxy", path, request, body=body)


@router.api_route("/tikhub-proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_tikhub(path: str, request: Request):
    """转发到 api.tikhub.io（抖音/小红书数据）"""
    return await _proxy_request("tikhub-proxy", path, request)


@router.api_route("/blt-proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_blt(path: str, request: Request):
    """转发到 api.bltcy.ai"""
    return await _proxy_request("blt-proxy", path, request)


@router.api_route("/tmpfiles-proxy/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_tmpfiles(path: str, request: Request):
    """转发到 tmpfiles.org"""
    return await _proxy_request("tmpfiles-proxy", path, request)
