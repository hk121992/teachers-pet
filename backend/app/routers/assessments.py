from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Assessment
from app.schemas.assessment import AssessmentCreate, AssessmentResponse, AssessmentBulkCreate

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


@router.get("", response_model=list[AssessmentResponse])
def list_assessments(
    student_id: int | None = None,
    subject: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Assessment)
    if student_id:
        query = query.filter(Assessment.student_id == student_id)
    if subject:
        query = query.filter(Assessment.subject == subject)
    return query.order_by(Assessment.date.desc()).all()


@router.post("", response_model=AssessmentResponse, status_code=201)
def create_assessment(data: AssessmentCreate, db: Session = Depends(get_db)):
    assessment = Assessment(**data.model_dump())
    db.add(assessment)
    db.commit()
    db.refresh(assessment)
    return assessment


@router.post("/bulk", response_model=list[AssessmentResponse], status_code=201)
def bulk_create_assessments(data: AssessmentBulkCreate, db: Session = Depends(get_db)):
    results = []
    for item in data.assessments:
        assessment = Assessment(**item.model_dump())
        db.add(assessment)
        results.append(assessment)
    db.commit()
    for a in results:
        db.refresh(a)
    return results


@router.get("/{assessment_id}", response_model=AssessmentResponse)
def get_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    return assessment


@router.delete("/{assessment_id}", status_code=204)
def delete_assessment(assessment_id: int, db: Session = Depends(get_db)):
    assessment = db.query(Assessment).filter(Assessment.id == assessment_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")
    db.delete(assessment)
    db.commit()
