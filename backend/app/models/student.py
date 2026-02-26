from datetime import date, datetime, timezone
from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[int] = mapped_column(primary_key=True)
    first_name: Mapped[str] = mapped_column(String(100))
    last_name: Mapped[str] = mapped_column(String(100))
    classroom_id: Mapped[int] = mapped_column(ForeignKey("classrooms.id"))
    date_of_birth: Mapped[Optional[date]] = mapped_column(default=None)
    parent_name: Mapped[Optional[str]] = mapped_column(String(200), default=None)
    parent_email: Mapped[Optional[str]] = mapped_column(String(200), default=None)
    parent_phone: Mapped[Optional[str]] = mapped_column(String(50), default=None)
    notes: Mapped[Optional[str]] = mapped_column(Text, default=None)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    classroom: Mapped["Classroom"] = relationship(back_populates="students")  # noqa: F821
    assessments: Mapped[list["Assessment"]] = relationship(back_populates="student", cascade="all, delete-orphan")  # noqa: F821
    parent_conversations: Mapped[list["ParentConversation"]] = relationship(back_populates="student", cascade="all, delete-orphan")  # noqa: F821
    papers: Mapped[list["Paper"]] = relationship(back_populates="student", cascade="all, delete-orphan")  # noqa: F821
