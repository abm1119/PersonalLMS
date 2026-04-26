# 🎓 LMS Suite: Your Distraction-Free Learning Sanctuary

![Status: Amazing](https://img.shields.io/badge/Status-Amazing-brightgreen?style=for-the-badge)
![Focus: Maximum](https://img.shields.io/badge/Focus-Maximum-blue?style=for-the-badge)
![Architecture: Clean](https://img.shields.io/badge/Architecture-Clean--Layered-orange?style=for-the-badge)

**Escape the YouTube noise. Build your own library. Master your skills.**

LMS Suite is a high-performance, distraction-free environment that transforms YouTube playlists into structured educational courses.

---

## 🔗 Live Deployments

| Component | URL |
| :--- | :--- |
| **🚀 Frontend Application** | [https://abmlms.wasmer.app/](https://abmlms.wasmer.app/) |
| **⚙️ Backend API** | [https://abm-111-abmlms.hf.space](https://abm-111-abmlms.hf.space) |

---

## 🏗️ Accurate Project Architecture

### 1. System Components Diagram
This diagram illustrates the high-level interaction between the client, the server, and external integrations.

```mermaid
graph TB
    subgraph "Client Layer (Frontend)"
        FE[SPA: HTML/CSS/JS]
    end

    subgraph "API Layer (FastAPI Backend)"
        API[FastAPI Router]
        AuthS[Auth Service: bcrypt/JWT]
        CourseS[Course Management]
        DB[Database Interface: Supabase]
    end

    subgraph "External Intelligence"
        YT[YouTube Data API v3]
        AI[Groq Cloud: Llama 3]
    end

    FE <-->|REST API / JWT| API
    API --> AuthS
    API --> CourseS
    CourseS --> YT
    CourseS --> AI
    API <--> DB
```

### 2. Sequence Diagram: Course Import Workflow
This UML sequence diagram accurately tracks the logic flow when a user converts a YouTube playlist into a course.

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant YT as YouTube API
    participant AI as Groq AI
    participant DB as Supabase

    User->>Frontend: Paste Playlist URL
    Frontend->>Backend: POST /api/courses/ (token)
    Backend->>YT: Fetch Playlist & Video metadata
    YT-->>Backend: Return JSON data
    Backend->>AI: Send titles for Syllabus generation
    AI-->>Backend: Return Description & Objectives
    Backend->>DB: Insert Course Record
    Backend->>DB: Insert Multiple Video Records
    DB-->>Backend: Confirm Persistence
    Backend-->>Frontend: 201 Created (Course Data)
    Frontend-->>User: Display New Course
```

### 3. Database UML (Entity Relationship)
The underlying data structure is optimized for fast lookups and relational integrity.

```mermaid
erDiagram
    USER ||--o{ COURSE : "owns"
    USER ||--o{ NOTE : "writes"
    USER ||--o{ BOOKMARK : "saves"
    COURSE ||--|{ VIDEO : "contains"
    COURSE ||--o{ NOTE : "linked to"
    VIDEO ||--o{ NOTE : "linked to"

    USER {
        uuid id PK
        string email UK
        string password_hash
        string name
        timestamp created_at
    }
    COURSE {
        uuid id PK
        uuid user_id FK
        string playlist_id
        string title
        text description
        jsonb objectives
        int video_count
    }
    VIDEO {
        uuid id PK
        uuid course_id FK
        string video_id
        string title
        int position
        string url
    }
    NOTE {
        uuid id PK
        uuid user_id FK
        uuid course_id FK
        string video_id
        text content
        jsonb tags
    }
```

---

## 🌟 The Philosophy: Learning Without the Noise

YouTube is designed to keep you clicking. **LMS Suite** is designed to keep you learning.

*   **Extraction:** We pull the core educational value (the videos) out of the social media noise.
*   **Isolation:** We provide a clean interface where the only thing on your screen is your lesson and your notes.
*   **Retention:** By using **Markdown Notes** and **AI-generated Objectives**, we help you move from passive watching to active mastery.

---

## 🛠️ Tech Stack & Technical Details

### Backend
- **Framework**: FastAPI (Asynchronous Python)
- **Security**: JWT tokens, bcrypt-sha256 hashing.
- **AI**: Groq (Llama 3.1 70B) for instant syllabus generation.
- **Database Client**: Patched `httpx` for reliable Supabase connectivity.

### Frontend
- **Architecture**: Single Page Application (SPA).
- **Styling**: Vanilla CSS (Flexbox/Grid).
- **State**: Centralized `APP` object managing auth and navigation.

---

## 🚀 Get Started

1.  **Register:** At [abmlms.wasmer.app](https://abmlms.wasmer.app/).
2.  **Import:** Paste your favorite YouTube Playlist URL.
3.  **Master:** Take notes, save bookmarks, and build your resource library with **Lifetime Access**.

---

### 🤝 Reclaim your focus.
*LMS Suite: Designed for those who take learning seriously.*

Built with ❤️ by **[Abdul Basit](https://www.engrabm.com)**
