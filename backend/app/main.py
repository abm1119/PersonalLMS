"""
LMS Suite Backend - FastAPI
Personal Learning Hub API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI(
    title="LMS Suite API",
    description="Personal Learning Hub - Courses, Notes, Bookmarks",
    version="1.0.0"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "").split(",")
if not any(allowed_origins):
    allowed_origins = [
        "http://localhost:5500",      # Live Server (VS Code)
        "http://127.0.0.1:5500",      # Live Server with IP
        "http://localhost:8080",      # Python HTTP Server
        "http://127.0.0.1:8080",      # Python HTTP Server with IP
        "http://localhost:8000",      # Any other local dev
        "http://127.0.0.1:8000",      # Any other local dev with IP
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
from app.routes import courses, notes, bookmarks, auth
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(courses.router, prefix="/api/courses", tags=["courses"])
app.include_router(notes.router, prefix="/api/notes", tags=["notes"])
app.include_router(bookmarks.router, prefix="/api/bookmarks", tags=["bookmarks"])

# Serve static files from the frontend/static directory
# Note: In the final structure, we'll ensure paths match
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend")
static_path = os.path.join(frontend_path, "static")

if os.path.exists(static_path):
    app.mount("/static", StaticFiles(directory=static_path), name="static")

@app.get("/")
async def serve_index():
    index_file = os.path.join(frontend_path, "index.html")
    if os.path.exists(index_file):
        return FileResponse(index_file)
    return {"message": "LMS Suite API", "version": "1.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
