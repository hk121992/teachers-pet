import datetime as dt
from typing import Optional

from pydantic import BaseModel, Field


class ParentConversationCreate(BaseModel):
    student_id: int
    date: dt.date = Field(default_factory=dt.date.today)
    type: str = "in_person"
    summary: str
    action_items: Optional[str] = None
    follow_up_date: Optional[dt.date] = None


class ParentConversationUpdate(BaseModel):
    date: Optional[dt.date] = None
    type: Optional[str] = None
    summary: Optional[str] = None
    action_items: Optional[str] = None
    follow_up_date: Optional[dt.date] = None


class ParentConversationResponse(BaseModel):
    id: int
    student_id: int
    date: dt.date
    type: str
    summary: str
    action_items: Optional[str] = None
    follow_up_date: Optional[dt.date] = None
    created_at: dt.datetime
    student_name: str = ""

    model_config = {"from_attributes": True}
