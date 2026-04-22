"""YouTube API service for fetching playlist and video data"""
from googleapiclient.discovery import build
from dotenv import load_dotenv
import os
import re

load_dotenv()

YOUTUBE_API_KEY = os.getenv("YOUTUBE_API_KEY")


def get_youtube_client():
    return build("youtube", "v3", developerKey=YOUTUBE_API_KEY)


def extract_playlist_id(playlist_url: str) -> str:
    """Extract playlist ID from YouTube URL"""
    patterns = [
        r"[?&]list=([^&]+)",
        r"playlist\?list=([^&]+)"
    ]
    for pattern in patterns:
        match = re.search(pattern, playlist_url)
        if match:
            return match.group(1)
    return playlist_url


def get_playlist_info(playlist_id: str) -> dict:
    """Fetch playlist metadata"""
    youtube = get_youtube_client()
    request = youtube.playlists().list(
        part="snippet,contentDetails",
        id=playlist_id
    )
    response = request.execute()

    if not response.get("items"):
        return None

    item = response["items"][0]
    return {
        "playlist_id": playlist_id,
        "title": item["snippet"]["title"],
        "description": item["snippet"]["description"],
        "thumbnail": item["snippet"]["thumbnails"].get("high", {}).get("url", ""),
        "video_count": item["contentDetails"]["itemCount"]
    }


def get_playlist_videos(playlist_id: str) -> list:
    """Fetch all videos from a playlist"""
    youtube = get_youtube_client()
    videos = []
    next_page_token = None

    while True:
        request = youtube.playlistItems().list(
            part="snippet,contentDetails",
            playlistId=playlist_id,
            maxResults=50,
            pageToken=next_page_token
        )
        response = request.execute()

        for item in response["items"]:
            video_id = item["contentDetails"]["videoId"]
            videos.append({
                "video_id": video_id,
                "title": item["snippet"]["title"],
                "description": item["snippet"]["description"],
                "thumbnail": item["snippet"]["thumbnails"].get("medium", {}).get("url", ""),
                "position": item["snippet"]["position"],
                "url": f"https://www.youtube.com/watch?v={video_id}"
            })

        next_page_token = response.get("nextPageToken")
        if not next_page_token:
            break

    return videos
