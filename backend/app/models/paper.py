from datetime import datetime, timezone
from typing import Optional

from sqlalchemy import ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Paper(Base):
    __tablename__ = "papers"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    subject: Mapped[str] = mapped_column(String(100))
    title: Mapped[Optional[str]] = mapped_column(String(200), default=None)
    file_path: Mapped[str] = mapped_column(String(500))
    original_filename: Mapped[str] = mapped_column(String(300))
    ai_feedback: Mapped[Optional[str]] = mapped_column(Text, default=None)
    score: Mapped[Optional[float]] = mapped_column(default=None)
    max_score: Mapped[Optional[float]] = mapped_column(default=None)
    marked_at: Mapped[Optional[datetime]] = mapped_column(default=None)
    created_at: Mapped[datetime] = mapped_column(default=lambda: datetime.now(timezone.utc))

    student: Mapped["Student"] = relationship(back_populates="papers")  # noqa: F821
