from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.routers import classrooms, students, assessments, conversations, marking, reports

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Teacher's Pet",
    description="AI-powered teaching assistant for primary school teachers",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(classrooms.router)
app.include_router(students.router)
app.include_router(assessments.router)
app.include_router(conversations.router)
app.include_router(marking.router)
app.include_router(reports.router)


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "app": "Teacher's Pet"}
