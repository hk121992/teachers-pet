export interface Classroom {
  id: number;
  name: string;
  year_group: string;
  academic_year: string;
  created_at: string;
  student_count: number;
}

export interface ClassroomWithStudents extends Classroom {
  students: StudentBrief[];
}

export interface StudentBrief {
  id: number;
  first_name: string;
  last_name: string;
}

export interface Student {
  id: number;
  first_name: string;
  last_name: string;
  classroom_id: number;
  date_of_birth: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  notes: string | null;
  created_at: string;
}

export interface SubjectAverage {
  subject: string;
  average_percentage: number;
  assessment_count: number;
}

export interface StudentSummary {
  student: Student;
  subject_averages: SubjectAverage[];
  recent_conversations: number;
  upcoming_follow_ups: number;
  papers_marked: number;
}

export interface Assessment {
  id: number;
  student_id: number;
  subject: string;
  title: string;
  score: number;
  max_score: number;
  percentage: number;
  grade: string | null;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface ParentConversation {
  id: number;
  student_id: number;
  date: string;
  type: string;
  summary: string;
  action_items: string | null;
  follow_up_date: string | null;
  created_at: string;
  student_name: string;
}

export interface Paper {
  id: number;
  student_id: number;
  subject: string;
  title: string | null;
  original_filename: string;
  ai_feedback: string | null;
  score: number | null;
  max_score: number | null;
  marked_at: string | null;
  created_at: string;
}

export interface MarkingResult {
  score: number;
  max_score: number;
  feedback: string;
  question_breakdown: QuestionFeedback[];
  overall_comments: string;
}

export interface QuestionFeedback {
  question: string;
  score: number;
  max_score: number;
  feedback: string;
}

export interface ReportResponse {
  student_id: number;
  report_type: string;
  content: string;
  student_name: string;
}
