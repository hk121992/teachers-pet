from datetime import datetime

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Classroom(Base):
    __tablename__ = "classrooms"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100))
    year_group: Mapped[str] = mapped_column(String(20))
    academic_year: Mapped[str] = mapped_column(String(9))  # e.g. "2025-2026"
    created_at: Mapped[datetime] = mapped_column(default=datetime.utcnow)

    students: Mapped[list["Student"]] = relationship(back_populates="classroom")  # noqa: F821
