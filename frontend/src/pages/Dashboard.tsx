import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, School, MessageSquare, FileCheck, AlertCircle } from "lucide-react";
import { getClassrooms, getStudents, getConversations, getPapers } from "../api/client";
import type { Classroom, Student, ParentConversation, Paper } from "../types";

export default function Dashboard() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [conversations, setConversations] = useState<ParentConversation[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getClassrooms(),
      getStudents(),
      getConversations({ upcoming_only: false }),
      getPapers(),
    ])
      .then(([c, s, conv, p]) => {
        setClassrooms(c);
        setStudents(s);
        setConversations(conv);
        setPapers(p);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading...</div>;

  const upcomingFollowUps = conversations.filter(
    (c) => c.follow_up_date && new Date(c.follow_up_date) >= new Date()
  );
  const unmarkedPapers = papers.filter((p) => !p.marked_at);
  const recentConversations = conversations.slice(0, 5);

  return (
    <div className="page">
      <h2>Dashboard</h2>

      <div className="stats-grid">
        <Link to="/classes" className="stat-card">
          <School size={32} />
          <div className="stat-info">
            <span className="stat-number">{classrooms.length}</span>
            <span className="stat-label">Classes</span>
          </div>
        </Link>
        <Link to="/students" className="stat-card">
          <Users size={32} />
          <div className="stat-info">
            <span className="stat-number">{students.length}</span>
            <span className="stat-label">Students</span>
          </div>
        </Link>
        <Link to="/conversations" className="stat-card">
          <MessageSquare size={32} />
          <div className="stat-info">
            <span className="stat-number">{conversations.length}</span>
            <span className="stat-label">Parent Conversations</span>
          </div>
        </Link>
        <Link to="/marking" className="stat-card">
          <FileCheck size={32} />
          <div className="stat-info">
            <span className="stat-number">{papers.length}</span>
            <span className="stat-label">Papers</span>
          </div>
        </Link>
      </div>

      <div className="dashboard-panels">
        {upcomingFollowUps.length > 0 && (
          <div className="panel">
            <h3>
              <AlertCircle size={18} /> Upcoming Follow-ups
            </h3>
            <ul className="follow-up-list">
              {upcomingFollowUps.map((c) => (
                <li key={c.id}>
                  <strong>{c.student_name}</strong> — {c.follow_up_date}
                  <p>{c.action_items || c.summary}</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {unmarkedPapers.length > 0 && (
          <div className="panel">
            <h3>
              <FileCheck size={18} /> Papers Awaiting Marking ({unmarkedPapers.length})
            </h3>
            <ul className="paper-list">
              {unmarkedPapers.slice(0, 5).map((p) => (
                <li key={p.id}>
                  <Link to="/marking">
                    {p.subject} — {p.original_filename}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {recentConversations.length > 0 && (
          <div className="panel">
            <h3>
              <MessageSquare size={18} /> Recent Parent Conversations
            </h3>
            <ul className="conversation-list">
              {recentConversations.map((c) => (
                <li key={c.id}>
                  <strong>{c.student_name}</strong>{" "}
                  <span className="badge">{c.type}</span> — {c.date}
                  <p>{c.summary.slice(0, 100)}...</p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {students.length === 0 && (
          <div className="panel empty-state">
            <h3>Welcome to Teacher's Pet!</h3>
            <p>Get started by creating a class and adding students.</p>
            <Link to="/classes" className="btn btn-primary">
              Create Your First Class
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
