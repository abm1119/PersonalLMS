"""Supabase database connection."""

from __future__ import annotations

import inspect
import os
from pathlib import Path

import httpx
from dotenv import load_dotenv


def _patch_httpx_proxy_compat() -> None:
    """Map gotrue's `proxy=` kwarg onto older httpx `proxies=` clients."""

    if getattr(httpx.Client, "_lms_proxy_compat", False):
        return

    client_signature = inspect.signature(httpx.Client.__init__)
    async_client_signature = inspect.signature(httpx.AsyncClient.__init__)

    if "proxy" in client_signature.parameters:
        return

    if "proxies" not in client_signature.parameters:
        return

    original_client_init = httpx.Client.__init__
    original_async_client_init = httpx.AsyncClient.__init__

    def patched_client_init(self, *args, proxy=None, **kwargs):
        if proxy is not None and "proxies" not in kwargs:
            kwargs["proxies"] = proxy
        return original_client_init(self, *args, **kwargs)

    def patched_async_client_init(self, *args, proxy=None, **kwargs):
        if proxy is not None and "proxies" not in kwargs:
            kwargs["proxies"] = proxy
        return original_async_client_init(self, *args, **kwargs)

    if "proxy" not in async_client_signature.parameters and "proxies" in async_client_signature.parameters:
        httpx.AsyncClient.__init__ = patched_async_client_init
        httpx.AsyncClient._lms_proxy_compat = True

    httpx.Client.__init__ = patched_client_init
    httpx.Client._lms_proxy_compat = True


_patch_httpx_proxy_compat()

from supabase import Client, create_client


BASE_DIR = Path(__file__).resolve().parents[2]
load_dotenv(BASE_DIR / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    raise RuntimeError("SUPABASE_URL and SUPABASE_KEY must be set in backend/.env")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
