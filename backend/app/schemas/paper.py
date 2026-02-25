from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class PaperResponse(BaseModel):
    id: int
    student_id: int
    subject: str
    title: Optional[str] = None
    original_filename: str
    ai_feedback: Optional[str] = None
    score: Optional[float] = None
    max_score: Optional[float] = None
    marked_at: Optional[datetime] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class MarkingResult(BaseModel):
    score: float
    max_score: float
    feedback: str
    question_breakdown: list["QuestionFeedback"] = []
    overall_comments: str = ""


class QuestionFeedback(BaseModel):
    question: str
    score: float
    max_score: float
    feedback: str


MarkingResult.model_rebuild()
