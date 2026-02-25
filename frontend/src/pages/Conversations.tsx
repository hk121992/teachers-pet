import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  getConversations,
  createConversation,
  deleteConversation,
  getStudents,
} from "../api/client";
import type { ParentConversation, Student } from "../types";

const TYPES = ["in_person", "phone", "email", "whatsapp", "other"];

export default function Conversations() {
  const [conversations, setConversations] = useState<ParentConversation[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStudent, setFilterStudent] = useState<number | undefined>();
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    student_id: 0,
    type: "in_person",
    summary: "",
    action_items: "",
    follow_up_date: "",
    date: new Date().toISOString().split("T")[0],
  });

  const load = () => {
    Promise.all([
      getConversations({
        student_id: filterStudent,
        upcoming_only: showUpcoming,
      }),
      getStudents(),
    ])
      .then(([c, s]) => {
        setConversations(c);
        setStudents(s);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterStudent, showUpcoming]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createConversation({
      ...form,
      action_items: form.action_items || undefined,
      follow_up_date: form.follow_up_date || undefined,
    });
    setForm({
      student_id: 0,
      type: "in_person",
      summary: "",
      action_items: "",
      follow_up_date: "",
      date: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this conversation record?")) return;
    await deleteConversation(id);
    load();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Parent Conversations</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Log Conversation
        </button>
      </div>

      <div className="filters">
        <select
          value={filterStudent || ""}
          onChange={(e) =>
            setFilterStudent(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">All Students</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.first_name} {s.last_name}
            </option>
          ))}
        </select>
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={showUpcoming}
            onChange={(e) => setShowUpcoming(e.target.checked)}
          />
          Upcoming follow-ups only
        </label>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Student
              <select
                value={form.student_id}
                onChange={(e) =>
                  setForm({ ...form, student_id: Number(e.target.value) })
                }
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
              Type
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.replace("_", " ")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Date
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>
          </div>
          <label>
            Summary
            <textarea
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              rows={3}
              placeholder="What was discussed?"
              required
            />
          </label>
          <div className="form-row">
            <label>
              Action Items
              <textarea
                value={form.action_items}
                onChange={(e) => setForm({ ...form, action_items: e.target.value })}
                rows={2}
                placeholder="Any follow-up actions?"
              />
            </label>
            <label>
              Follow-up Date
              <input
                type="date"
                value={form.follow_up_date}
                onChange={(e) =>
                  setForm({ ...form, follow_up_date: e.target.value })
                }
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {conversations.length === 0 ? (
        <div className="empty-state">
          <p>No conversations logged yet.</p>
        </div>
      ) : (
        <div className="timeline">
          {conversations.map((c) => (
            <div key={c.id} className="timeline-item">
              <div className="timeline-header">
                <div>
                  <strong>{c.student_name}</strong>
                  <span className="badge">{c.type.replace("_", " ")}</span>
                  <span className="timeline-date">{c.date}</span>
                </div>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(c.id)}
                  title="Delete"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <p>{c.summary}</p>
              {c.action_items && (
                <p className="action-items">
                  <strong>Actions:</strong> {c.action_items}
                </p>
              )}
              {c.follow_up_date && (
                <p className="follow-up">
                  <strong>Follow up:</strong> {c.follow_up_date}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
