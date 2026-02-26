from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student, Assessment, ParentConversation, Paper
from app.schemas.student import (
    StudentCreate,
    StudentResponse,
    StudentUpdate,
    StudentSummary,
    SubjectAverage,
)

router = APIRouter(prefix="/api/students", tags=["students"])


@router.get("", response_model=list[StudentResponse])
def list_students(
    classroom_id: int | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Student)
    if classroom_id:
        query = query.filter(Student.classroom_id == classroom_id)
    if search:
        term = f"%{search}%"
        query = query.filter(
            (Student.first_name.ilike(term)) | (Student.last_name.ilike(term))
        )
    return query.order_by(Student.last_name, Student.first_name).all()


@router.post("", response_model=StudentResponse, status_code=201)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    student = Student(**data.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(student_id: int, data: StudentUpdate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(student, key, value)
    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()


@router.get("/{student_id}/summary", response_model=StudentSummary)
def get_student_summary(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    # Subject averages
    assessments = db.query(Assessment).filter(Assessment.student_id == student_id).all()
    subjects: dict[str, list] = {}
    for a in assessments:
        subjects.setdefault(a.subject, []).append(a)

    subject_averages = []
    for subject, records in subjects.items():
        avg = sum(r.score / r.max_score * 100 for r in records if r.max_score > 0) / max(sum(1 for r in records if r.max_score > 0), 1)
        subject_averages.append(
            SubjectAverage(subject=subject, average_percentage=round(avg, 1), assessment_count=len(records))
        )

    # Conversation stats
    recent_convos = (
        db.query(ParentConversation)
        .filter(ParentConversation.student_id == student_id)
        .count()
    )
    upcoming = (
        db.query(ParentConversation)
        .filter(
            ParentConversation.student_id == student_id,
            ParentConversation.follow_up_date >= date.today(),
        )
        .count()
    )
    papers_marked = (
        db.query(Paper)
        .filter(Paper.student_id == student_id, Paper.marked_at.isnot(None))
        .count()
    )

    return StudentSummary(
        student=StudentResponse.model_validate(student),
        subject_averages=subject_averages,
        recent_conversations=recent_convos,
        upcoming_follow_ups=upcoming,
        papers_marked=papers_marked,
    )
