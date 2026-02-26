import datetime as dt
from typing import Optional

from pydantic import BaseModel, Field, model_validator


class AssessmentCreate(BaseModel):
    student_id: int
    subject: str
    title: str
    score: float
    max_score: float = Field(gt=0)
    grade: Optional[str] = None
    date: dt.date = Field(default_factory=dt.date.today)
    notes: Optional[str] = None


class AssessmentBulkCreate(BaseModel):
    assessments: list[AssessmentCreate]


class AssessmentResponse(BaseModel):
    id: int
    student_id: int
    subject: str
    title: str
    score: float
    max_score: float
    percentage: float = 0.0
    grade: Optional[str] = None
    date: dt.date
    notes: Optional[str] = None
    created_at: dt.datetime

    model_config = {"from_attributes": True}

    @model_validator(mode="after")
    def compute_percentage(self) -> "AssessmentResponse":
        if self.max_score > 0:
            self.percentage = round((self.score / self.max_score) * 100, 1)
        return self
