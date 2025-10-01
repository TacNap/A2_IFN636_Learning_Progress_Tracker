import React from "react";
import { useAuth } from "../context/AuthContext";
import "./DashboardStudent.css";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: "??" },
  { id: "module", label: "Module", icon: "??", active: true },
  { id: "assignment", label: "Assignment", icon: "??" },
  { id: "certificate", label: "Certificate", icon: "??" },
  { id: "student-learning", label: "Student Learning", icon: "??" },
];

const mockSemesters = [
  {
    id: "semester-1",
    name: "Semester 1",
    modules: [
      {
        name: "Software Lifecycle Management",
        code: "IN20",
        courseId: "IFN657",
        content: "CI/CD",
        tutor: "Neha",
      },
      {
        name: "Software Lifecycle Management",
        code: "IN20",
        courseId: "IFN657",
        content: "Testing",
        tutor: "Neha",
      },
      {
        name: "Software Lifecycle Management",
        code: "IN20",
        courseId: "IFN657",
        content: "UI/UX",
        tutor: "Neha",
      },
    ],
  },
  {
    id: "semester-2",
    name: "Semester 2",
    modules: [
      {
        name: "Software Lifecycle Management",
        code: "IN20",
        courseId: "IFN657",
        content: "CI/CD",
        tutor: "Neha",
      },
      {
        name: "Software Lifecycle Management",
        code: "IN20",
        courseId: "IFN657",
        content: "Testing",
        tutor: "Neha",
      },
      {
        name: "Software Lifecycle Management",
        code: "IN20",
        courseId: "IFN657",
        content: "UI/UX",
        tutor: "Neha",
      },
    ],
  },
];

const DashboardStudent = () => {
  const { user } = useAuth();
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "KK";

  return (
    <div className="student-dashboard">
      <aside className="student-dashboard__sidebar" aria-label="Student navigation">
        <div className="sidebar-header">
          <h2>Navigation</h2>
          <p>Welcome back{user?.name ? `, ${user.name}` : "!"}</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav__item${item.active ? " sidebar-nav__item--active" : ""}`}
            >
              <span className="sidebar-nav__icon" aria-hidden="true">
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-footer__avatar" aria-hidden="true">
            {initials}
          </div>
          <div className="sidebar-footer__details">
            <p className="sidebar-footer__name">{user?.name || "Ka Ki Yeung"}</p>
            <p className="sidebar-footer__role">Educator</p>
          </div>
        </div>
      </aside>

      <main className="student-dashboard__content">
        <header className="content-header">
          <div className="breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">�</span>
            <span className="breadcrumb-current">Module</span>
          </div>
          <h1>Module</h1>
        </header>

        <div className="modules-area">
          {mockSemesters.map((semester) => (
            <section key={semester.id} className="semester-card">
              <header className="semester-card__header">
                <h2>{semester.name}</h2>

                <div className="semester-card__actions">
                  <label className="search-field">
                    <span className="search-icon" aria-hidden="true">
                      ??
                    </span>
                    <input type="search" placeholder="Search..." aria-label="Search modules" />
                  </label>
                  <button type="button" className="add-module-button">
                    + Add Module
                  </button>
                </div>
              </header>

              <div className="module-table" role="table" aria-label={`${semester.name} modules`}>
                <div className="module-table__header" role="row">
                  <span role="columnheader">Module Name</span>
                  <span role="columnheader">Course ID</span>
                  <span role="columnheader">Content</span>
                  <span role="columnheader">Tutor</span>
                  <span role="columnheader" className="column-actions">
                    View / Edit
                  </span>
                </div>

                {semester.modules.map((module, index) => (
                  <div key={`${semester.id}-${index}`} className="module-table__row" role="row">
                    <span role="cell">
                      <span className="module-name">{module.name}</span>
                      <span className="module-code">{module.code}</span>
                    </span>
                    <span role="cell">{module.courseId}</span>
                    <span role="cell">{module.content}</span>
                    <span role="cell">{module.tutor}</span>
                    <span role="cell" className="column-actions">
                      <button type="button" className="icon-button" aria-label="View module">
                        ??
                      </button>
                      <button type="button" className="icon-button" aria-label="Edit module">
                        ??
                      </button>
                    </span>
                  </div>
                ))}
              </div>

              <footer className="semester-card__footer">
                <span>Page 1 of 1</span>
              </footer>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
};

export default DashboardStudent;
