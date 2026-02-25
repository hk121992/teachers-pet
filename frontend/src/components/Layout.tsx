import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  School,
  Users,
  FileCheck,
  MessageSquare,
  FileText,
} from "lucide-react";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/classes", icon: School, label: "Classes" },
  { to: "/students", icon: Users, label: "Students" },
  { to: "/marking", icon: FileCheck, label: "Mark Papers" },
  { to: "/conversations", icon: MessageSquare, label: "Parent Log" },
  { to: "/reports", icon: FileText, label: "Reports" },
];

export default function Layout() {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1>Teacher's Pet</h1>
        </div>
        <ul className="nav-list">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? "active" : ""}`
                }
                end={item.to === "/"}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
