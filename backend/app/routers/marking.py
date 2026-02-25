from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Paper, Student
from app.schemas.paper import PaperResponse
from app.services.marking_service import mark_paper
from app.utils.file_handler import save_upload, delete_file

router = APIRouter(prefix="/api/marking", tags=["marking"])


@router.get("", response_model=list[PaperResponse])
def list_papers(
    student_id: int | None = None,
    subject: str | None = None,
    db: Session = Depends(get_db),
):
    query = db.query(Paper)
    if student_id:
        query = query.filter(Paper.student_id == student_id)
    if subject:
        query = query.filter(Paper.subject == subject)
    return query.order_by(Paper.created_at.desc()).all()


@router.post("/upload", response_model=PaperResponse, status_code=201)
async def upload_paper(
    student_id: int = Form(...),
    subject: str = Form(...),
    title: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    try:
        file_path, original_filename = await save_upload(file)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    paper = Paper(
        student_id=student_id,
        subject=subject,
        title=title,
        file_path=file_path,
        original_filename=original_filename,
    )
    db.add(paper)
    db.commit()
    db.refresh(paper)
    return paper


@router.post("/{paper_id}/mark", response_model=dict)
def mark_uploaded_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")

    try:
        result = mark_paper(db, paper)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Marking failed: {str(e)}")


@router.get("/{paper_id}", response_model=PaperResponse)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    return paper


@router.delete("/{paper_id}", status_code=204)
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.query(Paper).filter(Paper.id == paper_id).first()
    if not paper:
        raise HTTPException(status_code=404, detail="Paper not found")
    delete_file(paper.file_path)
    db.delete(paper)
    db.commit()
