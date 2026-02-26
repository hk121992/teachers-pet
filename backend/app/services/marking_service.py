import json
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Paper
from app.services.ai_service import vision_chat
from app.utils.file_handler import file_to_base64

MARKING_SYSTEM_PROMPT = """You are an experienced primary school teacher's assistant helping to mark student papers.

When given an image of a student's work, you should:
1. Identify the subject and type of work (maths, English, science, etc.)
2. Mark each question/section, noting correct and incorrect answers
3. Provide constructive, encouraging feedback appropriate for a primary school student
4. Give an overall score

IMPORTANT: Respond in valid JSON format with this structure:
{
    "score": <number>,
    "max_score": <number>,
    "feedback": "<overall feedback summary>",
    "question_breakdown": [
        {
            "question": "<question identifier>",
            "score": <number>,
            "max_score": <number>,
            "feedback": "<specific feedback for this question>"
        }
    ],
    "overall_comments": "<encouraging overall comments for the student>"
}

Be encouraging and constructive. Remember these are young children learning.
Use age-appropriate language in feedback directed at students.
"""


def mark_paper(db: Session, paper: Paper) -> dict:
    """Use Claude Vision to mark a paper and update the database record."""
    image_data, media_type = file_to_base64(paper.file_path)

    user_prompt = f"Please mark this {paper.subject} paper and provide detailed feedback."
    if paper.title:
        user_prompt += f" The paper title/topic is: {paper.title}"

    response_text = vision_chat(
        system_prompt=MARKING_SYSTEM_PROMPT,
        user_text=user_prompt,
        image_data=image_data,
        media_type=media_type,
    )

    # Parse the JSON response
    # Strip markdown code fences if present
    cleaned = response_text.strip()
    if cleaned.startswith("```"):
        lines = cleaned.split("\n")
        lines = lines[1:]  # remove opening fence
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]  # remove closing fence
        cleaned = "\n".join(lines)

    result = json.loads(cleaned)

    # Update paper record
    paper.ai_feedback = response_text
    paper.score = result.get("score")
    paper.max_score = result.get("max_score")
    paper.marked_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(paper)

    return result
