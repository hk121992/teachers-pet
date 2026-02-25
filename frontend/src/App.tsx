import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import ClassDetail from "./pages/ClassDetail";
import Students from "./pages/Students";
import StudentDetail from "./pages/StudentDetail";
import Marking from "./pages/Marking";
import Conversations from "./pages/Conversations";
import Reports from "./pages/Reports";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="classes" element={<Classes />} />
          <Route path="classes/:id" element={<ClassDetail />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="marking" element={<Marking />} />
          <Route path="conversations" element={<Conversations />} />
          <Route path="reports" element={<Reports />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
