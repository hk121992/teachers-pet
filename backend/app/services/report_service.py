from datetime import date

from sqlalchemy.orm import Session

from app.models import Student, Assessment, ParentConversation, Paper
from app.services.ai_service import chat


def _gather_student_data(db: Session, student: Student) -> str:
    """Gather all relevant data for a student into a text summary."""
    assessments = (
        db.query(Assessment)
        .filter(Assessment.student_id == student.id)
        .order_by(Assessment.date.desc())
        .all()
    )
    conversations = (
        db.query(ParentConversation)
        .filter(ParentConversation.student_id == student.id)
        .order_by(ParentConversation.date.desc())
        .all()
    )
    papers = (
        db.query(Paper)
        .filter(Paper.student_id == student.id, Paper.marked_at.isnot(None))
        .order_by(Paper.marked_at.desc())
        .all()
    )

    lines = [f"Student: {student.first_name} {student.last_name}"]
    if student.notes:
        lines.append(f"Teacher notes: {student.notes}")

    lines.append(f"\n--- Assessment History ({len(assessments)} records) ---")
    # Group by subject
    subjects: dict[str, list] = {}
    for a in assessments:
        subjects.setdefault(a.subject, []).append(a)

    for subject, records in subjects.items():
        valid = [r for r in records if r.max_score > 0]
        avg = sum(r.score / r.max_score * 100 for r in valid) / len(valid) if valid else 0
        lines.append(f"\n{subject} (avg: {avg:.0f}%):")
        for r in records[:5]:  # last 5 per subject
            pct = r.score / r.max_score * 100 if r.max_score > 0 else 0
            lines.append(f"  - {r.title} ({r.date}): {r.score}/{r.max_score} ({pct:.0f}%)")

    lines.append(f"\n--- Parent Conversations ({len(conversations)} records) ---")
    for c in conversations[:5]:
        lines.append(f"  - {c.date} ({c.type}): {c.summary}")
        if c.action_items:
            lines.append(f"    Action items: {c.action_items}")

    lines.append(f"\n--- Marked Papers ({len(papers)} records) ---")
    for p in papers[:5]:
        score_str = f"{p.score}/{p.max_score}" if p.score is not None else "N/A"
        lines.append(f"  - {p.subject}: {score_str}")

    return "\n".join(lines)


def generate_term_report(db: Session, student: Student) -> str:
    """Generate an end-of-term report for a student."""
    data = _gather_student_data(db, student)

    system_prompt = """You are a helpful assistant for a primary school teacher.
Write an end-of-term report comment for a student based on the data provided.

The report should:
- Be 2-3 paragraphs long
- Be warm, professional, and encouraging
- Highlight strengths and areas for growth
- Reference specific subjects and trends from the data
- Be appropriate for parents to read
- Use the student's first name

Do NOT make up data that isn't provided. If data is limited, keep the report shorter
and focus on what you know."""

    return chat(system_prompt, f"Please write a term report for this student:\n\n{data}")


def generate_meeting_prep(db: Session, student: Student) -> str:
    """Generate parent-teacher meeting preparation notes."""
    data = _gather_student_data(db, student)

    system_prompt = """You are a helpful assistant for a primary school teacher.
Prepare concise notes for a parent-teacher meeting based on the data provided.

The prep notes should include:
- Key talking points (bullet points)
- Strengths to celebrate
- Areas needing support
- Suggested action items for home and school
- Any follow-up items from previous conversations
- Questions to ask the parents

Keep it practical and concise. Use bullet points. The teacher will use these notes
during the meeting as a reference."""

    return chat(system_prompt, f"Please prepare parent-teacher meeting notes for:\n\n{data}")


def generate_class_overview(db: Session, classroom_id: int) -> str:
    """Generate an overview of class performance."""
    students = db.query(Student).filter(Student.classroom_id == classroom_id).all()

    if not students:
        return "No students found in this class."

    lines = [f"Class overview — {len(students)} students\n"]

    for student in students:
        assessments = (
            db.query(Assessment)
            .filter(Assessment.student_id == student.id)
            .all()
        )
        if assessments:
            valid = [a for a in assessments if a.max_score > 0]
            avg = sum(a.score / a.max_score * 100 for a in valid) / len(valid) if valid else 0
            lines.append(f"{student.first_name} {student.last_name}: {avg:.0f}% average ({len(assessments)} assessments)")
        else:
            lines.append(f"{student.first_name} {student.last_name}: No assessments yet")

    data = "\n".join(lines)

    system_prompt = """You are a helpful assistant for a primary school teacher.
Provide a brief class overview based on the data. Include:
- Overall class performance summary
- Students who are excelling
- Students who may need additional support
- Subject areas where the class is strong/weak
- Suggestions for the teacher

Keep it concise and actionable."""

    return chat(system_prompt, f"Please provide a class overview:\n\n{data}")
