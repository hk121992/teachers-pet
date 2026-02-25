# Teacher's Pet — Implementation Plan

## Overview
A multi-modal AI-powered assistant for primary school teachers. Supports student performance tracking, parent conversation logging, paper marking, and report writing. Accessible via a React web app (and later WhatsApp).

## Tech Stack
- **Backend**: Python 3.11+ / FastAPI
- **Database**: SQLite (via SQLAlchemy + Alembic for migrations)
- **AI**: Anthropic Claude API (vision + text)
- **Frontend**: React + Vite + TypeScript
- **WhatsApp**: Meta Cloud API / Twilio (phase 2)
- **File handling**: Local filesystem (phase 1), S3-compatible (later)

---

## Phase 1: Backend Foundation

### 1.1 Project structure
```
teachers-pet/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app entry
│   │   ├── config.py            # Settings / env vars
│   │   ├── database.py          # DB engine + session
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── student.py
│   │   │   ├── classroom.py
│   │   │   ├── assessment.py
│   │   │   ├── parent_conversation.py
│   │   │   └── paper.py
│   │   ├── routers/             # API route handlers
│   │   │   ├── students.py
│   │   │   ├── classrooms.py
│   │   │   ├── assessments.py
│   │   │   ├── conversations.py
│   │   │   ├── marking.py
│   │   │   └── reports.py
│   │   ├── schemas/             # Pydantic request/response models
│   │   ├── services/            # Business logic + AI calls
│   │   │   ├── ai_service.py    # Claude API integration
│   │   │   ├── marking_service.py
│   │   │   └── report_service.py
│   │   └── utils/
│   │       └── file_handler.py  # File upload/processing
│   ├── alembic/                 # DB migrations
│   ├── uploads/                 # Uploaded files (gitignored)
│   ├── requirements.txt
│   └── alembic.ini
├── frontend/                    # React + Vite app
├── .env.example
├── .gitignore
└── README.md
```

### 1.2 Data Model

**Classroom**
- id, name, year_group, academic_year, created_at

**Student**
- id, first_name, last_name, classroom_id (FK), date_of_birth, parent_name, parent_email, parent_phone, notes, created_at

**Assessment**
- id, student_id (FK), subject, title, score, max_score, grade, date, notes, created_at

**ParentConversation**
- id, student_id (FK), date, type (enum: phone/email/in-person/whatsapp), summary, action_items, follow_up_date, created_at

**Paper**
- id, student_id (FK), subject, file_path, original_filename, ai_feedback, score, max_score, marked_at, created_at

### 1.3 API Endpoints

**Classrooms**: CRUD + list students in class
**Students**: CRUD + search + performance summary
**Assessments**: CRUD + bulk create + trends per student
**Parent Conversations**: CRUD + list by student + upcoming follow-ups
**Marking**: Upload paper (image/PDF) → AI marks and returns feedback
**Reports**: Generate student report / parent meeting prep / class overview

---

## Phase 2: AI Integration

### 2.1 Paper Marking
- Accept image/PDF upload
- Send to Claude Vision API with marking rubric prompt
- Return: score, detailed feedback per question, overall comments
- Store results linked to student

### 2.2 Report Writing
- Pull student's assessment history + parent conversation log
- Generate end-of-term style comments
- Teacher can edit/approve before finalising

### 2.3 Parent Meeting Prep
- Aggregate all data for a student
- Generate talking points, strengths, areas for improvement
- List recent parent interactions and follow-ups

---

## Phase 3: React Frontend

### 3.1 Pages
- **Dashboard**: Overview — upcoming follow-ups, recent activity, class stats
- **Classes**: List/manage classes
- **Students**: List/search, individual student profile with all data
- **Mark Papers**: Upload interface, review AI marking, approve/edit
- **Parent Log**: Log and view conversations, see follow-ups
- **Reports**: Generate and preview reports

### 3.2 Key Components
- File upload (drag & drop, camera capture for mobile)
- Student performance charts (simple bar/line charts)
- Conversation timeline
- AI feedback review/edit panel

---

## Phase 4: WhatsApp Integration (Later)
- Webhook endpoint for incoming WhatsApp messages
- Message router: detect intent (log grade, log conversation, mark paper, quick query)
- Send photos of papers → get marking back
- Quick commands: "How is [student] doing in maths?"
- Uses same backend services as web app

---

## Implementation Order (for this session)

1. **Backend setup** — project scaffolding, database, models, migrations
2. **Core CRUD APIs** — classrooms, students, assessments, parent conversations
3. **AI marking service** — Claude Vision integration for paper marking
4. **AI report service** — student reports and meeting prep
5. **Frontend setup** — React + Vite scaffolding, routing, API client
6. **Frontend pages** — Dashboard, students, marking, conversations, reports
7. **Integration testing** — end-to-end flow verification
