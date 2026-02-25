import { useEffect, useState } from "react";
import { Upload, Loader, CheckCircle } from "lucide-react";
import {
  getPapers,
  uploadPaper,
  markPaper,
  getStudents,
} from "../api/client";
import type { Paper, Student, MarkingResult } from "../types";

export default function Marking() {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [marking, setMarking] = useState<number | null>(null);
  const [result, setResult] = useState<MarkingResult | null>(null);
  const [selectedPaper, setSelectedPaper] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Upload form
  const [studentId, setStudentId] = useState(0);
  const [subject, setSubject] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = () => {
    Promise.all([getPapers(), getStudents()])
      .then(([p, s]) => {
        setPapers(p);
        setStudents(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("student_id", studentId.toString());
    formData.append("subject", subject);
    if (title) formData.append("title", title);
    formData.append("file", file);

    try {
      await uploadPaper(formData);
      setFile(null);
      setSubject("");
      setTitle("");
      setStudentId(0);
      load();
    } catch (err) {
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleMark = async (paperId: number) => {
    setMarking(paperId);
    setResult(null);
    setSelectedPaper(paperId);
    try {
      const res = await markPaper(paperId);
      setResult(res);
      load(); // refresh paper list to show updated scores
    } catch (err) {
      alert("Marking failed. Make sure your API key is configured.");
    } finally {
      setMarking(null);
    }
  };

  const viewFeedback = (paper: Paper) => {
    if (paper.ai_feedback) {
      setSelectedPaper(paper.id);
      try {
        setResult(JSON.parse(paper.ai_feedback));
      } catch {
        // If the feedback isn't valid JSON, show it raw
        setResult({
          score: paper.score || 0,
          max_score: paper.max_score || 0,
          feedback: paper.ai_feedback,
          question_breakdown: [],
          overall_comments: "",
        });
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h2>Mark Papers</h2>

      <div className="form-card">
        <h3>
          <Upload size={18} /> Upload Paper
        </h3>
        <form onSubmit={handleUpload}>
          <div className="form-row">
            <label>
              Student
              <select
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value))}
                required
              >
                <option value={0} disabled>Select student</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Subject
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Maths"
                required
              />
            </label>
            <label>
              Title (optional)
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Week 5 Test"
              />
            </label>
          </div>
          <div className="form-row">
            <label className="file-input">
              Paper Image/PDF
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={uploading || !file}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
        </form>
      </div>

      <div className="marking-layout">
        <div className="panel">
          <h3>Papers</h3>
          {papers.length === 0 ? (
            <p className="text-muted">No papers uploaded yet.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Subject</th>
                  <th>File</th>
                  <th>Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((p) => {
                  const student = students.find((s) => s.id === p.student_id);
                  return (
                    <tr
                      key={p.id}
                      className={selectedPaper === p.id ? "selected" : ""}
                    >
                      <td>
                        {student
                          ? `${student.first_name} ${student.last_name}`
                          : "Unknown"}
                      </td>
                      <td>{p.subject}</td>
                      <td>{p.original_filename}</td>
                      <td>
                        {p.score !== null
                          ? `${p.score}/${p.max_score}`
                          : "—"}
                      </td>
                      <td>
                        {p.marked_at ? (
                          <button
                            className="btn btn-sm btn-secondary"
                            onClick={() => viewFeedback(p)}
                          >
                            <CheckCircle size={14} /> View
                          </button>
                        ) : marking === p.id ? (
                          <span className="marking-indicator">
                            <Loader size={14} className="spin" /> Marking...
                          </span>
                        ) : (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => handleMark(p.id)}
                          >
                            Mark with AI
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {result && (
          <div className="panel feedback-panel">
            <h3>AI Feedback</h3>
            <div className="feedback-score">
              <span className="big-score">
                {result.score}/{result.max_score}
              </span>
              <span className="percentage">
                {result.max_score > 0
                  ? `(${((result.score / result.max_score) * 100).toFixed(0)}%)`
                  : ""}
              </span>
            </div>
            <p className="feedback-text">{result.feedback}</p>

            {result.question_breakdown.length > 0 && (
              <div className="question-breakdown">
                <h4>Question Breakdown</h4>
                {result.question_breakdown.map((q, i) => (
                  <div key={i} className="question-item">
                    <div className="question-header">
                      <strong>{q.question}</strong>
                      <span>
                        {q.score}/{q.max_score}
                      </span>
                    </div>
                    <p>{q.feedback}</p>
                  </div>
                ))}
              </div>
            )}

            {result.overall_comments && (
              <div className="overall-comments">
                <h4>Overall Comments</h4>
                <p>{result.overall_comments}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
