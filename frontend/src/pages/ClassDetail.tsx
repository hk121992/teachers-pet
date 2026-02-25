import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { getClassroom } from "../api/client";
import type { ClassroomWithStudents } from "../types";

export default function ClassDetail() {
  const { id } = useParams<{ id: string }>();
  const [classroom, setClassroom] = useState<ClassroomWithStudents | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getClassroom(Number(id))
      .then(setClassroom)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !classroom) return <div className="loading">Loading...</div>;

  return (
    <div className="page">
      <Link to="/classes" className="back-link">
        <ArrowLeft size={16} /> Back to Classes
      </Link>

      <div className="page-header">
        <h2>{classroom.name}</h2>
      </div>
      <p className="text-muted">
        {classroom.year_group} &middot; {classroom.academic_year}
      </p>

      <div className="panel">
        <h3>
          <Users size={18} /> Students ({classroom.students.length})
        </h3>
        {classroom.students.length === 0 ? (
          <p className="text-muted">
            No students in this class yet.{" "}
            <Link to="/students">Add students</Link>
          </p>
        ) : (
          <div className="student-grid">
            {classroom.students.map((s) => (
              <Link
                key={s.id}
                to={`/students/${s.id}`}
                className="student-card"
              >
                <span className="student-avatar">
                  {s.first_name[0]}{s.last_name[0]}
                </span>
                <span>
                  {s.first_name} {s.last_name}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
