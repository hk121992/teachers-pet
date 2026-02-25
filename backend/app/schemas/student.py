from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel


class StudentCreate(BaseModel):
    first_name: str
    last_name: str
    classroom_id: int
    date_of_birth: Optional[date] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None
    notes: Optional[str] = None


class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    classroom_id: Optional[int] = None
    date_of_birth: Optional[date] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None
    notes: Optional[str] = None


class StudentResponse(BaseModel):
    id: int
    first_name: str
    last_name: str
    classroom_id: int
    date_of_birth: Optional[date] = None
    parent_name: Optional[str] = None
    parent_email: Optional[str] = None
    parent_phone: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class SubjectAverage(BaseModel):
    subject: str
    average_percentage: float
    assessment_count: int


class StudentSummary(BaseModel):
    student: StudentResponse
    subject_averages: list[SubjectAverage] = []
    recent_conversations: int = 0
    upcoming_follow_ups: int = 0
    papers_marked: int = 0
