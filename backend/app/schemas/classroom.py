from datetime import datetime

from pydantic import BaseModel


class ClassroomCreate(BaseModel):
    name: str
    year_group: str
    academic_year: str


class ClassroomResponse(BaseModel):
    id: int
    name: str
    year_group: str
    academic_year: str
    created_at: datetime
    student_count: int = 0

    model_config = {"from_attributes": True}


class ClassroomWithStudents(ClassroomResponse):
    students: list["StudentBrief"] = []


class StudentBrief(BaseModel):
    id: int
    first_name: str
    last_name: str

    model_config = {"from_attributes": True}


ClassroomWithStudents.model_rebuild()
