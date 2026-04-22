"""Notes routes - markdown notes with tags"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.services.database import supabase

router = APIRouter()


class NoteCreate(BaseModel):
    user_id: str
    title: str
    content: str
    tags: List[str] = []
    course_id: Optional[str] = None
    video_id: Optional[str] = None


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    tags: Optional[List[str]] = None


@router.post("/")
async def create_note(note: NoteCreate):
    """Create a new note"""
    result = supabase.table("notes").insert({
        "user_id": note.user_id,
        "title": note.title,
        "content": note.content,
        "tags": note.tags,
        "course_id": note.course_id,
        "video_id": note.video_id
    }).execute()
    return {"note": result.data[0]}


@router.get("/")
async def list_notes(user_id: str, tag: Optional[str] = None, course_id: Optional[str] = None):
    """List notes for a user with optional filters"""
    query = supabase.table("notes").select("*").eq("user_id", user_id)

    if tag:
        query = query.contains("tags", [tag])
    if course_id:
        query = query.eq("course_id", course_id)

    result = query.order("created_at", desc=True).execute()
    return {"notes": result.data}


@router.get("/{note_id}")
async def get_note(note_id: str):
    """Get a specific note"""
    result = supabase.table("notes").select("*").eq("id", note_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Note not found")
    return {"note": result.data[0]}


@router.put("/{note_id}")
async def update_note(note_id: str, note: NoteUpdate, user_id: str):
    """Update a note"""
    # Build update dict with only provided fields
    updates = {"updated_at": datetime.utcnow().isoformat()}
    if note.title:
        updates["title"] = note.title
    if note.content:
        updates["content"] = note.content
    if note.tags is not None:
        updates["tags"] = note.tags

    result = supabase.table("notes").update(updates).eq("id", note_id).eq("user_id", user_id).execute()
    return {"note": result.data[0]}


@router.delete("/{note_id}")
async def delete_note(note_id: str, user_id: str):
    """Delete a note"""
    supabase.table("notes").delete().eq("id", note_id).eq("user_id", user_id).execute()
    return {"message": "Note deleted"}


@router.get("/tags/{user_id}")
async def get_user_tags(user_id: str):
    """Get all unique tags used by a user"""
    result = supabase.table("notes").select("tags").eq("user_id", user_id).execute()
    all_tags = set()
    for note in result.data:
        for tag in note.get("tags", []):
            all_tags.add(tag)
    return {"tags": sorted(list(all_tags))}
