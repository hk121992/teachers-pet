import { useEffect, useState } from "react";
import { FileText, Loader, Users } from "lucide-react";
import {
  getStudents,
  getClassrooms,
  generateReport,
  getClassOverview,
} from "../api/client";
import type { Student, Classroom } from "../types";

export default function Reports() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [selectedStudent, setSelectedStudent] = useState(0);
  const [reportType, setReportType] = useState("term_report");
  const [selectedClassroom, setSelectedClassroom] = useState(0);
  const [report, setReport] = useState("");
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStudents(), getClassrooms()])
      .then(([s, c]) => {
        setStudents(s);
        setClassrooms(c);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!selectedStudent) return;
    setGenerating(true);
    setReport("");
    try {
      const res = await generateReport({
        student_id: selectedStudent,
        report_type: reportType,
      });
      setReport(res.content);
    } catch {
      alert("Report generation failed. Check your API key is configured.");
    } finally {
      setGenerating(false);
    }
  };

  const handleClassOverview = async () => {
    if (!selectedClassroom) return;
    setGenerating(true);
    setReport("");
    try {
      const res = await getClassOverview(selectedClassroom);
      setReport(res.content);
    } catch {
      alert("Class overview failed. Check your API key is configured.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <h2>Reports</h2>

      <div className="reports-grid">
        <div className="panel">
          <h3>
            <FileText size={18} /> Student Report
          </h3>
          <p className="text-muted">
            Generate an AI-written report for a student based on their assessment
            data and parent conversations.
          </p>
          <div className="form-stack">
            <label>
              Student
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(Number(e.target.value))}
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
              Report Type
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="term_report">End of Term Report</option>
                <option value="meeting_prep">Parent Meeting Prep</option>
              </select>
            </label>
            <button
              className="btn btn-primary"
              onClick={handleGenerate}
              disabled={generating || !selectedStudent}
            >
              {generating ? (
                <>
                  <Loader size={16} className="spin" /> Generating...
                </>
              ) : (
                "Generate Report"
              )}
            </button>
          </div>
        </div>

        <div className="panel">
          <h3>
            <Users size={18} /> Class Overview
          </h3>
          <p className="text-muted">
            Get an AI-generated overview of your class performance, highlighting
            students who are excelling and those who may need support.
          </p>
          <div className="form-stack">
            <label>
              Class
              <select
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(Number(e.target.value))}
              >
                <option value={0} disabled>Select class</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.year_group})
                  </option>
                ))}
              </select>
            </label>
            <button
              className="btn btn-primary"
              onClick={handleClassOverview}
              disabled={generating || !selectedClassroom}
            >
              {generating ? (
                <>
                  <Loader size={16} className="spin" /> Generating...
                </>
              ) : (
                "Generate Overview"
              )}
            </button>
          </div>
        </div>
      </div>

      {report && (
        <div className="panel report-output">
          <div className="report-header">
            <h3>Generated Report</h3>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => navigator.clipboard.writeText(report)}
            >
              Copy to Clipboard
            </button>
          </div>
          <div className="report-content">
            {report.split("\n").map((line, i) => (
              <p key={i}>{line || <br />}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
