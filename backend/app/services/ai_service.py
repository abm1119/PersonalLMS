"""AI service for course generation using Groq or OpenRouter"""
from dotenv import load_dotenv
import os
import httpx

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")


async def generate_course_structure(playlist_title: str, videos: list) -> dict:
    """Use AI to generate a structured course from video titles"""
    video_titles = [v["title"] for v in videos]

    prompt = f"""Given a YouTube playlist titled "{playlist_title}" with these videos:
{chr(10).join(f"- {t}" for t in video_titles)}

Generate a brief course description (2-3 sentences) and suggest 3-5 key learning objectives.
Return as JSON: {{"description": "...", "objectives": ["...", "..."]}}"""

    # Try Groq first, fallback to OpenRouter
    result = await _call_groq(prompt)
    if not result:
        result = await _call_openrouter(prompt)

    return result if result else {"description": f"Course: {playlist_title}", "objectives": []}


async def _call_groq(prompt: str) -> dict:
    """Call Groq API"""
    if not GROQ_API_KEY:
        return None

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {GROQ_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "llama-3.1-70b-versatile",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7
                }
            )
            if response.status_code == 200:
                import json
                content = response.json()["choices"][0]["message"]["content"]
                # Extract JSON from response
                return json.loads(content.strip("```json").strip("```"))
    except Exception:
        pass
    return None


async def _call_openrouter(prompt: str) -> dict:
    """Call OpenRouter API"""
    if not OPENROUTER_API_KEY:
        return None

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENROUTER_API_KEY}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3-haiku",
                    "messages": [{"role": "user", "content": prompt}]
                }
            )
            if response.status_code == 200:
                import json
                content = response.json()["choices"][0]["message"]["content"]
                return json.loads(content.strip("```json").strip("```"))
    except Exception:
        pass
    return None
