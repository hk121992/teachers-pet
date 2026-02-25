import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Plus, ArrowLeft } from "lucide-react";
import {
  getStudentSummary,
  getAssessments,
  createAssessment,
  getConversations,
} from "../api/client";
import type { StudentSummary, Assessment, ParentConversation } from "../types";

export default function StudentDetail() {
  const { id } = useParams<{ id: string }>();
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [conversations, setConversations] = useState<ParentConversation[]>([]);
  const [showAssessmentForm, setShowAssessmentForm] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    title: "",
    score: 0,
    max_score: 100,
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(true);

  const studentId = Number(id);

  const load = () => {
    Promise.all([
      getStudentSummary(studentId),
      getAssessments({ student_id: studentId }),
      getConversations({ student_id: studentId }),
    ])
      .then(([s, a, c]) => {
        setSummary(s);
        setAssessments(a);
        setConversations(c);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [studentId]);

  const handleAddAssessment = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAssessment({ ...form, student_id: studentId });
    setShowAssessmentForm(false);
    setForm({ subject: "", title: "", score: 0, max_score: 100, date: new Date().toISOString().split("T")[0] });
    load();
  };

  if (loading || !summary) return <div className="loading">Loading...</div>;

  const { student, subject_averages } = summary;

  const chartData = subject_averages.map((sa) => ({
    subject: sa.subject,
    average: sa.average_percentage,
  }));

  return (
    <div className="page">
      <Link to="/students" className="back-link">
        <ArrowLeft size={16} /> Back to Students
      </Link>

      <div className="student-header">
        <h2>
          {student.first_name} {student.last_name}
        </h2>
        <div className="student-meta">
          {student.parent_name && <span>Parent: {student.parent_name}</span>}
          {student.parent_email && <span>{student.parent_email}</span>}
          {student.parent_phone && <span>{student.parent_phone}</span>}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card small">
          <span className="stat-number">{subject_averages.length}</span>
          <span className="stat-label">Subjects</span>
        </div>
        <div className="stat-card small">
          <span className="stat-number">{assessments.length}</span>
          <span className="stat-label">Assessments</span>
        </div>
        <div className="stat-card small">
          <span className="stat-number">{summary.recent_conversations}</span>
          <span className="stat-label">Conversations</span>
        </div>
        <div className="stat-card small">
          <span className="stat-number">{summary.papers_marked}</span>
          <span className="stat-label">Papers Marked</span>
        </div>
      </div>

      {chartData.length > 0 && (
        <div className="panel">
          <h3>Performance by Subject</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => `${Number(value).toFixed(1)}%`} />
                <Bar dataKey="average" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="panel">
        <div className="panel-header">
          <h3>Assessments</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowAssessmentForm(!showAssessmentForm)}
          >
            <Plus size={14} /> Add
          </button>
        </div>

        {showAssessmentForm && (
          <form className="inline-form" onSubmit={handleAddAssessment}>
            <input
              type="text"
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
            <input
              type="number"
              placeholder="Score"
              value={form.score}
              onChange={(e) => setForm({ ...form, score: Number(e.target.value) })}
              min={0}
              required
            />
            <span>/</span>
            <input
              type="number"
              placeholder="Max"
              value={form.max_score}
              onChange={(e) => setForm({ ...form, max_score: Number(e.target.value) })}
              min={1}
              required
            />
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
            <button type="submit" className="btn btn-primary btn-sm">Save</button>
          </form>
        )}

        {assessments.length === 0 ? (
          <p className="text-muted">No assessments yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Subject</th>
                <th>Title</th>
                <th>Score</th>
                <th>%</th>
              </tr>
            </thead>
            <tbody>
              {assessments.map((a) => (
                <tr key={a.id}>
                  <td>{a.date}</td>
                  <td>{a.subject}</td>
                  <td>{a.title}</td>
                  <td>
                    {a.score}/{a.max_score}
                  </td>
                  <td>
                    <span
                      className={`percentage ${
                        a.percentage >= 70
                          ? "good"
                          : a.percentage >= 50
                          ? "ok"
                          : "needs-work"
                      }`}
                    >
                      {a.percentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {conversations.length > 0 && (
        <div className="panel">
          <h3>Parent Conversations</h3>
          <div className="timeline">
            {conversations.map((c) => (
              <div key={c.id} className="timeline-item">
                <div className="timeline-date">
                  {c.date} <span className="badge">{c.type}</span>
                </div>
                <p>{c.summary}</p>
                {c.action_items && (
                  <p className="action-items">Action: {c.action_items}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
