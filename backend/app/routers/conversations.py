from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ParentConversation, Student
from app.schemas.parent_conversation import (
    ParentConversationCreate,
    ParentConversationResponse,
    ParentConversationUpdate,
)

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ParentConversationResponse])
def list_conversations(
    student_id: int | None = None,
    upcoming_only: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(ParentConversation)
    if student_id:
        query = query.filter(ParentConversation.student_id == student_id)
    if upcoming_only:
        query = query.filter(ParentConversation.follow_up_date >= date.today())
    conversations = query.order_by(ParentConversation.date.desc()).all()

    results = []
    for c in conversations:
        resp = ParentConversationResponse.model_validate(c)
        student = db.query(Student).filter(Student.id == c.student_id).first()
        if student:
            resp.student_name = f"{student.first_name} {student.last_name}"
        results.append(resp)
    return results


@router.post("", response_model=ParentConversationResponse, status_code=201)
def create_conversation(data: ParentConversationCreate, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == data.student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    conversation = ParentConversation(**data.model_dump())
    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    resp = ParentConversationResponse.model_validate(conversation)
    resp.student_name = f"{student.first_name} {student.last_name}"
    return resp


@router.get("/{conversation_id}", response_model=ParentConversationResponse)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(ParentConversation).filter(ParentConversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    resp = ParentConversationResponse.model_validate(conversation)
    student = db.query(Student).filter(Student.id == conversation.student_id).first()
    if student:
        resp.student_name = f"{student.first_name} {student.last_name}"
    return resp


@router.put("/{conversation_id}", response_model=ParentConversationResponse)
def update_conversation(
    conversation_id: int,
    data: ParentConversationUpdate,
    db: Session = Depends(get_db),
):
    conversation = db.query(ParentConversation).filter(ParentConversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(conversation, key, value)
    db.commit()
    db.refresh(conversation)
    resp = ParentConversationResponse.model_validate(conversation)
    student = db.query(Student).filter(Student.id == conversation.student_id).first()
    if student:
        resp.student_name = f"{student.first_name} {student.last_name}"
    return resp


@router.delete("/{conversation_id}", status_code=204)
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    conversation = db.query(ParentConversation).filter(ParentConversation.id == conversation_id).first()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    db.delete(conversation)
    db.commit()
