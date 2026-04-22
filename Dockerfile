# Production Dockerfile for LMS Suite
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies if needed
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and frontend code
COPY backend/ ./backend/
COPY frontend/ ./frontend/

# Set working directory to backend for running the app
WORKDIR /app/backend

# Environment variables (can be overridden at runtime)
ENV PORT=8000
ENV JWT_SECRET=change-this-in-production
ENV ALLOWED_ORIGINS=*

# Expose port
EXPOSE 8000

# Run with Gunicorn and Uvicorn workers for production
CMD ["gunicorn", "app.main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
