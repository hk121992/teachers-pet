import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, Users } from "lucide-react";
import { getClassrooms, createClassroom, deleteClassroom } from "../api/client";
import type { Classroom } from "../types";

export default function Classes() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", year_group: "", academic_year: "2025-2026" });
  const [loading, setLoading] = useState(true);

  const load = () => {
    getClassrooms()
      .then(setClassrooms)
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createClassroom(form);
    setForm({ name: "", year_group: "", academic_year: "2025-2026" });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this class?")) return;
    try {
      await deleteClassroom(id);
      load();
    } catch {
      alert("Cannot delete a class that has students. Remove students first.");
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Classes</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Class
        </button>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              Class Name
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. 3A"
                required
              />
            </label>
            <label>
              Year Group
              <input
                type="text"
                value={form.year_group}
                onChange={(e) => setForm({ ...form, year_group: e.target.value })}
                placeholder="e.g. Year 3"
                required
              />
            </label>
            <label>
              Academic Year
              <input
                type="text"
                value={form.academic_year}
                onChange={(e) => setForm({ ...form, academic_year: e.target.value })}
                placeholder="e.g. 2025-2026"
                required
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Create</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {classrooms.length === 0 ? (
        <div className="empty-state">
          <p>No classes yet. Create your first class to get started!</p>
        </div>
      ) : (
        <div className="card-grid">
          {classrooms.map((c) => (
            <div key={c.id} className="card">
              <div className="card-header">
                <Link to={`/classes/${c.id}`}>
                  <h3>{c.name}</h3>
                </Link>
                <button
                  className="btn-icon btn-danger"
                  onClick={() => handleDelete(c.id)}
                  title="Delete class"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <p className="card-meta">{c.year_group} &middot; {c.academic_year}</p>
              <p className="card-stat">
                <Users size={16} /> {c.student_count} students
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
