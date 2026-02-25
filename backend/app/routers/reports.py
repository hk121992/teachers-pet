from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Student, Classroom
from app.schemas.report import ReportRequest, ReportResponse
from app.services.report_service import (
    generate_term_report,
    generate_meeting_prep,
    generate_class_overview,
)

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.post("/generate", response_model=ReportResponse)
def generate_report(data: ReportRequest, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    if data.report_type == "term_report":
        content = generate_term_report(db, student)
    elif data.report_type == "meeting_prep":
        content = generate_meeting_prep(db, student)
    else:
        raise HTTPException(status_code=400, detail=f"Unknown report type: {data.report_type}")

    return ReportResponse(
        student_id=student.id,
        report_type=data.report_type,
        content=content,
        student_name=f"{student.first_name} {student.last_name}",
    )


@router.get("/class-overview/{classroom_id}")
def class_overview(classroom_id: int, db: Session = Depends(get_db)):
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    content = generate_class_overview(db, classroom_id)
    return {"classroom_id": classroom_id, "classroom_name": classroom.name, "content": content}
