import axios from "axios";
import type {
  Classroom,
  ClassroomWithStudents,
  Student,
  StudentSummary,
  Assessment,
  ParentConversation,
  Paper,
  MarkingResult,
  ReportResponse,
} from "../types";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Classrooms
export const getClassrooms = () =>
  api.get<Classroom[]>("/classrooms").then((r) => r.data);

export const getClassroom = (id: number) =>
  api.get<ClassroomWithStudents>(`/classrooms/${id}`).then((r) => r.data);

export const createClassroom = (data: {
  name: string;
  year_group: string;
  academic_year: string;
}) => api.post<Classroom>("/classrooms", data).then((r) => r.data);

export const deleteClassroom = (id: number) =>
  api.delete(`/classrooms/${id}`);

// Students
export const getStudents = (params?: {
  classroom_id?: number;
  search?: string;
}) => api.get<Student[]>("/students", { params }).then((r) => r.data);

export const getStudent = (id: number) =>
  api.get<Student>(`/students/${id}`).then((r) => r.data);

export const getStudentSummary = (id: number) =>
  api.get<StudentSummary>(`/students/${id}/summary`).then((r) => r.data);

export const createStudent = (data: {
  first_name: string;
  last_name: string;
  classroom_id: number;
  date_of_birth?: string;
  parent_name?: string;
  parent_email?: string;
  parent_phone?: string;
  notes?: string;
}) => api.post<Student>("/students", data).then((r) => r.data);

export const updateStudent = (id: number, data: Partial<Student>) =>
  api.put<Student>(`/students/${id}`, data).then((r) => r.data);

export const deleteStudent = (id: number) =>
  api.delete(`/students/${id}`);

// Assessments
export const getAssessments = (params?: {
  student_id?: number;
  subject?: string;
}) => api.get<Assessment[]>("/assessments", { params }).then((r) => r.data);

export const createAssessment = (data: {
  student_id: number;
  subject: string;
  title: string;
  score: number;
  max_score: number;
  grade?: string;
  date?: string;
  notes?: string;
}) => api.post<Assessment>("/assessments", data).then((r) => r.data);

export const deleteAssessment = (id: number) =>
  api.delete(`/assessments/${id}`);

// Conversations
export const getConversations = (params?: {
  student_id?: number;
  upcoming_only?: boolean;
}) =>
  api
    .get<ParentConversation[]>("/conversations", { params })
    .then((r) => r.data);

export const createConversation = (data: {
  student_id: number;
  date?: string;
  type?: string;
  summary: string;
  action_items?: string;
  follow_up_date?: string;
}) =>
  api.post<ParentConversation>("/conversations", data).then((r) => r.data);

export const deleteConversation = (id: number) =>
  api.delete(`/conversations/${id}`);

// Marking
export const getPapers = (params?: {
  student_id?: number;
  subject?: string;
}) => api.get<Paper[]>("/marking", { params }).then((r) => r.data);

export const uploadPaper = (formData: FormData) =>
  api
    .post<Paper>("/marking/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((r) => r.data);

export const markPaper = (paperId: number) =>
  api.post<MarkingResult>(`/marking/${paperId}/mark`).then((r) => r.data);

export const deletePaper = (id: number) =>
  api.delete(`/marking/${id}`);

// Reports
export const generateReport = (data: {
  student_id: number;
  report_type: string;
}) => api.post<ReportResponse>("/reports/generate", data).then((r) => r.data);

export const getClassOverview = (classroomId: number) =>
  api.get(`/reports/class-overview/${classroomId}`).then((r) => r.data);
