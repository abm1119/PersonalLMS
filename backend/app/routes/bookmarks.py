"""Bookmarks routes - quick save links and assets"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from app.services.database import supabase

router = APIRouter()


class BookmarkCreate(BaseModel):
    user_id: str
    title: str
    url: str
    description: Optional[str] = None
    category: Optional[str] = "general"


class BookmarkUpdate(BaseModel):
    title: Optional[str] = None
    url: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None


@router.post("/")
async def create_bookmark(bookmark: BookmarkCreate):
    """Create a new bookmark"""
    result = supabase.table("bookmarks").insert({
        "user_id": bookmark.user_id,
        "title": bookmark.title,
        "url": bookmark.url,
        "description": bookmark.description,
        "category": bookmark.category
    }).execute()
    return {"bookmark": result.data[0]}


@router.get("/")
async def list_bookmarks(user_id: str, category: Optional[str] = None):
    """List bookmarks for a user"""
    query = supabase.table("bookmarks").select("*").eq("user_id", user_id)

    if category:
        query = query.eq("category", category)

    result = query.order("created_at", desc=True).execute()
    return {"bookmarks": result.data}


@router.get("/{bookmark_id}")
async def get_bookmark(bookmark_id: str):
    """Get a specific bookmark"""
    result = supabase.table("bookmarks").select("*").eq("id", bookmark_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Bookmark not found")
    return {"bookmark": result.data[0]}


@router.put("/{bookmark_id}")
async def update_bookmark(bookmark_id: str, bookmark: BookmarkUpdate, user_id: str):
    """Update a bookmark"""
    updates = {"updated_at": datetime.utcnow().isoformat()}
    if bookmark.title:
        updates["title"] = bookmark.title
    if bookmark.url:
        updates["url"] = bookmark.url
    if bookmark.description is not None:
        updates["description"] = bookmark.description
    if bookmark.category:
        updates["category"] = bookmark.category

    result = supabase.table("bookmarks").update(updates).eq("id", bookmark_id).eq("user_id", user_id).execute()
    return {"bookmark": result.data[0]}


@router.delete("/{bookmark_id}")
async def delete_bookmark(bookmark_id: str, user_id: str):
    """Delete a bookmark"""
    supabase.table("bookmarks").delete().eq("id", bookmark_id).eq("user_id", user_id).execute()
    return {"message": "Bookmark deleted"}


@router.get("/categories/{user_id}")
async def get_categories(user_id: str):
    """Get all unique categories for a user"""
    result = supabase.table("bookmarks").select("category").eq("user_id", user_id).execute()
    categories = set(b["category"] for b in result.data if b.get("category"))
    return {"categories": sorted(list(categories))}
