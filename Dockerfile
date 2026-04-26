# Dockerfile for Hugging Face Spaces (LMS Suite)
FROM python:3.11-slim

# Create a non-root user for security (recommended by Hugging Face)
RUN useradd -m -u 1000 user
USER user
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH

WORKDIR $HOME/app

# Install system dependencies
USER root
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*
USER user

# Copy requirements from root and install
COPY --chown=user requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Copy backend and frontend code
COPY --chown=user backend/ ./backend/
COPY --chown=user frontend/ ./frontend/

# Set working directory to backend for running the app
WORKDIR $HOME/app/backend

# Hugging Face Spaces uses port 7860
ENV PORT=7860
ENV JWT_SECRET=change-this-in-production
ENV ALLOWED_ORIGINS=*

# Expose port (mostly for documentation)
EXPOSE 7860

# Run with Gunicorn
CMD ["gunicorn", "app.main:app", "--workers", "2", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:7860"]
