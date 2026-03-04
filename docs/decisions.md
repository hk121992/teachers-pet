# Teacher's Pet — Decision Log

## Pre-MM Decisions

### FastAPI + React stack
**Decision:** Python FastAPI backend with React/TypeScript frontend.
**Rationale:** FastAPI for rapid API development with automatic OpenAPI docs. React for rich interactive UI.

### SQLite database
**Decision:** Use SQLite (via SQLAlchemy) instead of PostgreSQL.
**Rationale:** Single-tenant local app — SQLite is simpler, no server needed, file-based.

### Direct Claude Vision for marking
**Decision:** Send base64-encoded paper images directly to Claude Vision API.
**Rationale:** No need for OCR pre-processing. Claude can read handwritten and printed text from images.

### No authentication
**Decision:** Ship MVP without auth.
**Rationale:** Single teacher using locally. Auth adds complexity without benefit at this stage.
