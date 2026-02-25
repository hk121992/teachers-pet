from pydantic import BaseModel


class ReportRequest(BaseModel):
    student_id: int
    report_type: str = "term_report"  # term_report, meeting_prep, class_overview


class ReportResponse(BaseModel):
    student_id: int
    report_type: str
    content: str
    student_name: str = ""
