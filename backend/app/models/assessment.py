import datetime as dt
from typing import Optional

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    subject: Mapped[str] = mapped_column(String(100))
    title: Mapped[str] = mapped_column(String(200))
    score: Mapped[float] = mapped_column()
    max_score: Mapped[float] = mapped_column()
    grade: Mapped[Optional[str]] = mapped_column(String(10), default=None)
    date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    notes: Mapped[Optional[str]] = mapped_column(Text, default=None)
    created_at: Mapped[dt.datetime] = mapped_column(default=dt.datetime.utcnow)

    student: Mapped["Student"] = relationship(back_populates="assessments")  # noqa: F821
