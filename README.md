# LMS Suite

Personal Learning Hub - A clean, minimal learning management system.

## Features

- **Courses**: Import YouTube playlists as structured courses
- **Notes**: Markdown notes with tags
- **Bookmarks**: Quick-save links and resources

## Tech Stack

- **Frontend**: Pure HTML/CSS/JavaScript (SPA, no frameworks)
- **Backend**: FastAPI
- **Database**: Supabase
- **AI**: Groq / OpenRouter

## Setup

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Run the SQL schema in `supabase/schema.sql` in the SQL editor
3. Get your project URL and anon key from Settings > API

### 2. Get API Keys

- **YouTube API**: [Google Cloud Console](https://console.cloud.google.com) > Enable YouTube Data API v3
- **Groq API**: [console.groq.com](https://console.groq.com)
- **OpenRouter** (optional): [openrouter.ai](https://openrouter.ai)

### 3. Configure Environment

Copy `.env.example` to `backend/.env`, then fill in your keys:

```bash
# Backend (.env)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=your_anon_key
YOUTUBE_API_KEY=your_youtube_key
GROQ_API_KEY=your_groq_key
JWT_SECRET=your-random-secret
```

### 4. Run

**Backend:**
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
# Option 1: Python HTTP Server
python -m http.server 8080

# Option 2: Use the startup script
run-frontend.bat  # Windows
./run-frontend.sh # Linux/Mac
```

The frontend is now pure HTML/CSS/JavaScript with no dependencies. Simply serve the files with any HTTP server. See [frontend/FRONTEND_README.md](frontend/FRONTEND_README.md) for detailed frontend documentation.

### 5. Access

- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Project Structure

```
LMS_SUITE/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── courses.py
│   │   │   ├── notes.py
│   │   │   └── bookmarks.py
│   │   └── services/
│   │       ├── database.py
│   │       ├── youtube_service.py
│   │       └── ai_service.py
│   └── requirements.txt
├── frontend/
│   ├── index.html          # SPA entry point
│   ├── static/
│   │   ├── css/style.css   # All styling
│   │   └── js/app.js       # All logic
│   └── FRONTEND_README.md  # Frontend documentation
├── supabase/
│   └── schema.sql
└── .env.example
```

## License

MIT
