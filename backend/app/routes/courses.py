"""Course routes - create and manage courses from YouTube playlists"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.services.database import supabase
from app.services.youtube_service import extract_playlist_id, get_playlist_info, get_playlist_videos
from app.services.ai_service import generate_course_structure
from app.routes.auth import JWT_SECRET
import jwt

router = APIRouter()


def get_current_user(token: str = None):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token")


class CourseCreate(BaseModel):
    playlist_url: str
    user_id: str


class CourseUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None


@router.post("/")
async def create_course(course: CourseCreate):
    """Create a course from a YouTube playlist URL"""
    playlist_id = extract_playlist_id(course.playlist_url)

    # Get playlist info
    playlist_info = get_playlist_info(playlist_id)
    if not playlist_info:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Get all videos
    videos = get_playlist_videos(playlist_id)

    # Generate AI-enhanced course structure
    ai_structure = await generate_course_structure(playlist_info["title"], videos)

    # Create course in database
    course_data = supabase.table("courses").insert({
        "user_id": course.user_id,
        "title": playlist_info["title"],
        "description": ai_structure.get("description", playlist_info["description"]),
        "playlist_id": playlist_id,
        "thumbnail": playlist_info["thumbnail"],
        "objectives": ai_structure.get("objectives", []),
        "video_count": len(videos)
    }).execute()

    course_id = course_data.data[0]["id"]

    # Insert videos
    video_records = [
        {
            "course_id": course_id,
            "video_id": v["video_id"],
            "title": v["title"],
            "description": v["description"],
            "thumbnail": v["thumbnail"],
            "position": v["position"],
            "url": v["url"]
        }
        for v in videos
    ]
    supabase.table("videos").insert(video_records).execute()

    return {"course": course_data.data[0], "video_count": len(videos)}


@router.get("/")
async def list_courses(user_id: str):
    """List all courses for a user"""
    result = supabase.table("courses").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return {"courses": result.data}


@router.get("/{course_id}")
async def get_course(course_id: str):
    """Get course details with all videos"""
    course = supabase.table("courses").select("*").eq("id", course_id).execute()
    if not course.data:
        raise HTTPException(status_code=404, detail="Course not found")

    videos = supabase.table("videos").select("*").eq("course_id", course_id).order("position").execute()

    return {"course": course.data[0], "videos": videos.data}


@router.delete("/{course_id}")
async def delete_course(course_id: str, user_id: str):
    """Delete a course and all its videos"""
    # Verify ownership
    course = supabase.table("courses").select("user_id").eq("id", course_id).execute()
    if not course.data or course.data[0]["user_id"] != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Delete videos first
    supabase.table("videos").delete().eq("course_id", course_id).execute()
    # Delete course
    supabase.table("courses").delete().eq("id", course_id).execute()

    return {"message": "Course deleted"}
