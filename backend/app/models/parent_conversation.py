import datetime as dt
from enum import Enum
from typing import Optional

from sqlalchemy import Date, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ConversationType(str, Enum):
    phone = "phone"
    email = "email"
    in_person = "in_person"
    whatsapp = "whatsapp"
    other = "other"


class ParentConversation(Base):
    __tablename__ = "parent_conversations"

    id: Mapped[int] = mapped_column(primary_key=True)
    student_id: Mapped[int] = mapped_column(ForeignKey("students.id"))
    date: Mapped[dt.date] = mapped_column(Date, default=dt.date.today)
    type: Mapped[str] = mapped_column(String(20), default=ConversationType.in_person.value)
    summary: Mapped[str] = mapped_column(Text)
    action_items: Mapped[Optional[str]] = mapped_column(Text, default=None)
    follow_up_date: Mapped[Optional[dt.date]] = mapped_column(Date, default=None)
    created_at: Mapped[dt.datetime] = mapped_column(default=lambda: dt.datetime.now(dt.timezone.utc))

    student: Mapped["Student"] = relationship(back_populates="parent_conversations")  # noqa: F821
