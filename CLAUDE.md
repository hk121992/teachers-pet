# Project: Teacher's Pet

## Purpose

AI-powered teaching assistant for primary school teachers. Tracks student performance, logs parent conversations, marks papers using Claude Vision, and generates end-of-term and meeting prep reports.

## Tech Stack

- Backend: Python 3.11+ / FastAPI 0.115 / SQLAlchemy 2.0 / SQLite
- Frontend: React 19 / TypeScript / Vite 7 / Recharts
- AI: Anthropic SDK (Claude Sonnet — vision for marking, text for reports)
- Key dependencies:
  - Backend: `fastapi`, `uvicorn`, `sqlalchemy`, `anthropic`, `pillow`, `PyPDF2`, `alembic`
  - Frontend: `react`, `react-router-dom`, `axios`, `recharts`, `lucide-react`

## Project Structure

```
backend/
  app/
    main.py           # FastAPI app entry + CORS
    config.py          # Pydantic settings (env vars)
    database.py        # SQLAlchemy engine + session
    models/            # 5 ORM models: Classroom, Student, Assessment, ParentConversation, Paper
    routers/           # 6 route modules: classrooms, students, assessments, conversations, marking, reports
    schemas/           # Pydantic request/response models
    services/          # Business logic: ai_service, marking_service, report_service
    utils/             # file_handler (upload/base64)
  requirements.txt
  uploads/             # Paper uploads (gitignored)
frontend/
  src/
    App.tsx            # Router (8 pages)
    pages/             # Dashboard, Classes, ClassDetail, Students, StudentDetail, Marking, Conversations, Reports
    components/        # Layout
    api/client.ts      # Axios API client (http://localhost:8000/api)
    types/index.ts     # TypeScript interfaces
  package.json
  vite.config.ts
docs/                  # MM progress/decision files
```

## Workflows

- **Backend**: `cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000`
- **Frontend**: `cd frontend && npm install && npm run dev` (port 5173)
- **API docs**: http://localhost:8000/docs (Swagger UI)
- **Database**: Auto-created on first backend run (`teachers_pet.db`)
- **Test**: No test framework configured
- **Lint**: ESLint (frontend only)

## Important Notes

- No authentication — single-tenant, local use only
- Database migrations: Alembic installed but not yet configured
- AI marking uses Claude Vision (base64 images/PDFs) — costs per call
- AI reports use Claude text API — costs per call
- Frontend expects backend at `http://localhost:8000/api`

## Rules

- Always read `claude-progress.txt` first to understand current state
- Always update `claude-progress.txt` after completing a task
- Always update `docs/progress.md` with a session entry when done
- Never modify files outside this project's directory
- Ask before deleting files or making breaking changes
- Ask before adding new dependencies
- Commit work with clear messages referencing the task from the session brief

## Session Handoff (MANDATORY)

These three steps must be completed before any `git commit`. If the PM says "wrap up" or "handoff" at any point, complete these steps immediately even if objectives are unfinished.

### 1. Write `handoff.md` to the project root

Overwrite (or create) `handoff.md` — this file is gitignored. Middle Management reads it on re-entry.

```markdown
# Handoff — teachers-pet — [YYYY-MM-DD HH:MM]

## Status
[One sentence: current state]

## Completed
- [task]: [result/done/partial]

## Not Completed
- [task]: [why not — or "None"]

## Key Finding
[The single most important result or discovery. Include numbers where relevant.]

## Next Action
[Exactly what should happen next — specific enough to act on]

## Blockers / Decisions Needed
[Specific blockers, or "None"]

## Commit
[hash] — [message]
```

### 2. Update `claude-progress.txt`

Replace the entire contents:

```
Last updated: [YYYY-MM-DD]
Branch: [branch name]
Status: [one line summary]

Completed this session:
- [task]: [done / partial / blocked]

Next:
- [what should happen next]

Blockers / Decisions needed:
- [any, or "None"]
```

### 3. Append to `docs/progress.md`

Add a new entry at the top:

```markdown
## [YYYY-MM-DD] — [Session title]

**Completed:** [task list]
**Not completed:** [anything skipped or blocked, or "None"]

**Key Finding:**
[Same as handoff.md Key Finding]

**Decisions informed:** [Did findings change what to build? Or "None."]

**Files modified:** [list]
**Commit:** [hash]
```

### 4. Commit

Commit all work including `claude-progress.txt` and `docs/progress.md`. Do **not** commit `handoff.md` — it is gitignored.

## Context Files

- `claude-progress.txt` — Quick-resume: current state, last session, next steps
- `docs/plan.md` — Living project plan with milestones and tasks
- `docs/decisions.md` — All decisions made for this project
- `docs/progress.md` — Session-by-session progress log

## Managed By

This project is managed by the Middle Management system at `~/projects/Middle-management/`.
Session briefs and coordination come from there. If you need a decision that isn't covered
by existing decisions, create a note in the progress update — the management agent will
route it to the product manager.
