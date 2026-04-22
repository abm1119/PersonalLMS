"""Authentication routes."""

from __future__ import annotations

import hashlib
import logging
import os
from datetime import datetime, timedelta

import bcrypt
import httpx
import jwt
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key")
PASSWORD_SCHEME = "bcrypt_sha256"


def _normalize_password(password: str) -> bytes:
    """Pre-hash user input so bcrypt can safely handle any password length."""

    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("ascii")


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(_normalize_password(password), bcrypt.gensalt())
    return f"{PASSWORD_SCHEME}${hashed.decode('utf-8')}"


def verify_password(password: str, password_hash: str) -> bool:
    try:
        if password_hash.startswith(f"{PASSWORD_SCHEME}$"):
            stored_hash = password_hash.split("$", 1)[1].encode("utf-8")
            return bcrypt.checkpw(_normalize_password(password), stored_hash)

        # Backward compatibility for any users stored with plain bcrypt hashes.
        return bcrypt.checkpw(password.encode("utf-8"), password_hash.encode("utf-8"))
    except ValueError:
        return False


class UserCreate(BaseModel):
    email: str
    password: str
    name: str = ""


class UserLogin(BaseModel):
    email: str
    password: str


@router.post("/register")
async def register(user: UserCreate):
    from app.services.database import supabase

    try:
        existing = supabase.table("users").select("*").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="Email already registered")

        result = supabase.table("users").insert({
            "email": user.email,
            "password_hash": hash_password(user.password),
            "name": user.name
        }).execute()
    except HTTPException:
        raise
    except httpx.HTTPError:
        logger.exception("Supabase connection failed during registration for %s", user.email)
        raise HTTPException(status_code=503, detail="Database unavailable. Check Supabase connectivity.")
    except Exception:
        logger.exception("Registration failed for %s", user.email)
        raise HTTPException(status_code=500, detail="Registration failed due to a server error.")

    return {"message": "User created", "user_id": result.data[0]["id"]}


@router.post("/login")
async def login(user: UserLogin):
    from app.services.database import supabase

    try:
        result = supabase.table("users").select("*").eq("email", user.email).execute()
    except httpx.HTTPError:
        logger.exception("Supabase connection failed during login for %s", user.email)
        raise HTTPException(status_code=503, detail="Database unavailable. Check Supabase connectivity.")
    except Exception:
        logger.exception("Login lookup failed for %s", user.email)
        raise HTTPException(status_code=500, detail="Login failed due to a server error.")

    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    db_user = result.data[0]
    if not verify_password(user.password, db_user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = jwt.encode({
        "user_id": db_user["id"],
        "email": db_user["email"],
        "exp": datetime.utcnow() + timedelta(days=7)
    }, JWT_SECRET, algorithm="HS256")

    return {"token": token, "user": {"id": db_user["id"], "email": db_user["email"], "name": db_user["name"]}}
