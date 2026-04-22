# Production Deployment Guide — LMS Suite

This application is now production-ready. It is designed to be self-contained, serving both the API and the Frontend from a single port (8000).

## 🚀 Quick Start (Docker)

The easiest way to deploy is using Docker Compose:

1. **Configure Environment:**
   Ensure `backend/.env` has your production keys (Supabase, YouTube, AI).
   
2. **Build and Run:**
   ```bash
   docker-compose up --build -d
   ```

3. **Access:**
   Your app will be live at `http://localhost:8000`.

## 🛠 Manual Production Setup (without Docker)

If you prefer to run directly on a server:

1. **Install Dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Set Environment Variables:**
   ```bash
   export JWT_SECRET="your-secure-secret"
   export ALLOWED_ORIGINS="https://yourdomain.com"
   ```

3. **Run with Gunicorn (Linux/macOS):**
   ```bash
   gunicorn app.main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
   ```

## 🔐 Security Checklist

- [ ] **JWT Secret:** Change `JWT_SECRET` in `.env` to a long, random string.
- [ ] **HTTPS:** Use a reverse proxy like Nginx or Caddy with Cloudflare to provide SSL/TLS.
- [ ] **Supabase RLS:** Ensure Row Level Security is enabled on your Supabase tables.
- [ ] **API Keys:** Ensure your YouTube and AI keys are restricted to your server's IP if possible.

## 📁 Project Structure (Production)

- `/backend`: FastAPI application logic.
- `/frontend`: Static assets (HTML, CSS, JS).
- `Dockerfile`: Multi-stage production build.
- `docker-compose.yml`: Orchestration for the suite.
