# Teacher's Pet

AI-powered teaching assistant for primary school teachers. Track student performance, log parent conversations, mark papers with AI vision, and generate reports.

## Features

- **Student Performance Tracking** — Record assessments per subject, view trends and averages
- **Parent Conversation Log** — Log phone/email/in-person interactions, track follow-ups
- **AI Paper Marking** — Upload photos or PDFs of student work, get AI-powered marking and feedback via Claude Vision
- **Report Generation** — AI-generated end-of-term reports and parent meeting prep notes
- **Class Management** — Organise students by class and year group

## Tech Stack

- **Backend**: Python / FastAPI / SQLAlchemy / SQLite
- **Frontend**: React / TypeScript / Vite
- **AI**: Anthropic Claude API (vision + text generation)

## Quick Start

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Set your API key
cp ../.env.example .env
# Edit .env and add your ANTHROPIC_API_KEY

# Run the server
uvicorn app.main:app --reload --port 8000
```

API docs available at http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Opens at http://localhost:5173

## API Endpoints

| Resource | Endpoints |
|----------|-----------|
| Health | `GET /api/health` |
| Classrooms | `GET/POST /api/classrooms`, `GET/DELETE /api/classrooms/:id` |
| Students | `GET/POST /api/students`, `GET/PUT/DELETE /api/students/:id`, `GET /api/students/:id/summary` |
| Assessments | `GET/POST /api/assessments`, `POST /api/assessments/bulk`, `GET/DELETE /api/assessments/:id` |
| Conversations | `GET/POST /api/conversations`, `GET/PUT/DELETE /api/conversations/:id` |
| Paper Marking | `GET /api/marking`, `POST /api/marking/upload`, `POST /api/marking/:id/mark` |
| Reports | `POST /api/reports/generate`, `GET /api/reports/class-overview/:id` |

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key (required for AI features) | — |
| `DATABASE_URL` | SQLite database URL | `sqlite:///./teachers_pet.db` |
| `UPLOAD_DIR` | Directory for uploaded papers | `./uploads` |
| `MAX_UPLOAD_SIZE_MB` | Max upload file size | `10` |
