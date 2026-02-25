from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Classroom
from app.schemas.classroom import ClassroomCreate, ClassroomResponse, ClassroomWithStudents

router = APIRouter(prefix="/api/classrooms", tags=["classrooms"])


@router.get("", response_model=list[ClassroomResponse])
def list_classrooms(db: Session = Depends(get_db)):
    classrooms = db.query(Classroom).order_by(Classroom.name).all()
    results = []
    for c in classrooms:
        resp = ClassroomResponse.model_validate(c)
        resp.student_count = len(c.students)
        results.append(resp)
    return results


@router.post("", response_model=ClassroomResponse, status_code=201)
def create_classroom(data: ClassroomCreate, db: Session = Depends(get_db)):
    classroom = Classroom(**data.model_dump())
    db.add(classroom)
    db.commit()
    db.refresh(classroom)
    return ClassroomResponse.model_validate(classroom)


@router.get("/{classroom_id}", response_model=ClassroomWithStudents)
def get_classroom(classroom_id: int, db: Session = Depends(get_db)):
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    resp = ClassroomWithStudents.model_validate(classroom)
    resp.student_count = len(classroom.students)
    return resp


@router.delete("/{classroom_id}", status_code=204)
def delete_classroom(classroom_id: int, db: Session = Depends(get_db)):
    classroom = db.query(Classroom).filter(Classroom.id == classroom_id).first()
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    if classroom.students:
        raise HTTPException(status_code=400, detail="Cannot delete classroom with students")
    db.delete(classroom)
    db.commit()
