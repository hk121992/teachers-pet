import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2 } from "lucide-react";
import {
  getStudents,
  getClassrooms,
  createStudent,
  deleteStudent,
} from "../api/client";
import type { Student, Classroom } from "../types";

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [search, setSearch] = useState("");
  const [filterClassroom, setFilterClassroom] = useState<number | undefined>();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    classroom_id: 0,
    parent_name: "",
    parent_email: "",
    parent_phone: "",
  });
  const [loading, setLoading] = useState(true);

  const load = () => {
    Promise.all([
      getStudents({ classroom_id: filterClassroom, search: search || undefined }),
      getClassrooms(),
    ])
      .then(([s, c]) => {
        setStudents(s);
        setClassrooms(c);
      })
      .finally(() => setLoading(false));
  };

  useEffect(load, [filterClassroom, search]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStudent({
      ...form,
      parent_name: form.parent_name || undefined,
      parent_email: form.parent_email || undefined,
      parent_phone: form.parent_phone || undefined,
    });
    setForm({
      first_name: "",
      last_name: "",
      classroom_id: 0,
      parent_name: "",
      parent_email: "",
      parent_phone: "",
    });
    setShowForm(false);
    load();
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this student and all their records?")) return;
    await deleteStudent(id);
    load();
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Students</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <Plus size={16} /> Add Student
        </button>
      </div>

      <div className="filters">
        <div className="search-input">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={filterClassroom || ""}
          onChange={(e) =>
            setFilterClassroom(e.target.value ? Number(e.target.value) : undefined)
          }
        >
          <option value="">All Classes</option>
          {classrooms.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {showForm && (
        <form className="form-card" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>
              First Name
              <input
                type="text"
                value={form.first_name}
                onChange={(e) => setForm({ ...form, first_name: e.target.value })}
                required
              />
            </label>
            <label>
              Last Name
              <input
                type="text"
                value={form.last_name}
                onChange={(e) => setForm({ ...form, last_name: e.target.value })}
                required
              />
            </label>
            <label>
              Class
              <select
                value={form.classroom_id}
                onChange={(e) => setForm({ ...form, classroom_id: Number(e.target.value) })}
                required
              >
                <option value={0} disabled>
                  Select a class
                </option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="form-row">
            <label>
              Parent/Guardian Name
              <input
                type="text"
                value={form.parent_name}
                onChange={(e) => setForm({ ...form, parent_name: e.target.value })}
              />
            </label>
            <label>
              Parent Email
              <input
                type="email"
                value={form.parent_email}
                onChange={(e) => setForm({ ...form, parent_email: e.target.value })}
              />
            </label>
            <label>
              Parent Phone
              <input
                type="tel"
                value={form.parent_phone}
                onChange={(e) => setForm({ ...form, parent_phone: e.target.value })}
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary">Add Student</button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {students.length === 0 ? (
        <div className="empty-state">
          <p>No students found. Add your first student!</p>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Parent/Guardian</th>
                <th>Contact</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <Link to={`/students/${s.id}`} className="student-link">
                      {s.first_name} {s.last_name}
                    </Link>
                  </td>
                  <td>{s.parent_name || "—"}</td>
                  <td>
                    {s.parent_email && <span className="contact">{s.parent_email}</span>}
                    {s.parent_phone && <span className="contact">{s.parent_phone}</span>}
                    {!s.parent_email && !s.parent_phone && "—"}
                  </td>
                  <td>
                    <button
                      className="btn-icon btn-danger"
                      onClick={() => handleDelete(s.id)}
                      title="Delete student"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
