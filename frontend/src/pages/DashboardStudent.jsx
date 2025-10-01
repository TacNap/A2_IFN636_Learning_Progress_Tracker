import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './DashboardStudent.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DB' },
  { id: 'module', label: 'Module', icon: 'MD', active: true },
  { id: 'assignment', label: 'Assignment', icon: 'AS' },
  { id: 'certificate', label: 'Certificate', icon: 'CF' },
  { id: 'student-learning', label: 'Student Learning', icon: 'SL' },
];

const DashboardStudent = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [modulesById, setModulesById] = useState({});
  const [modulesLoading, setModulesLoading] = useState(true);
  const [moduleError, setModuleError] = useState('');
  const [searchTerms, setSearchTerms] = useState({});

  // don't think we need this.
  const initials = useMemo(() => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return 'KK';
  }, [user]);

  // get semesters
  useEffect(() => {
    let isActive = true;

    const fetchSemesters = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/semesters', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!isActive) return;
        setSemesters(response.data || []);
        setError('');
      } catch (fetchError) {
        if (!isActive) return;
        console.error('Failed to load semesters:', fetchError);
        setError('Failed to load semesters. Please try again later.');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchSemesters();

    return () => {
      isActive = false;
    };
  }, [user]);

  // get modules
  useEffect(() => {
    if (!user?.token) {
      setModulesById({});
      setModulesLoading(false);
      return undefined;
    }

    let isActive = true;

    const fetchModules = async () => {
      setModulesLoading(true);
      try {
        const response = await axiosInstance.get('/api/modules', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!isActive) return;
        const map = (response.data || []).reduce((acc, module) => {
          if (module?._id) {
            acc[module._id] = module;
          }
          return acc;
        }, {});
        setModulesById(map);
        setModuleError('');
      } catch (fetchError) {
        if (!isActive) return;
        console.error('Failed to load modules:', fetchError);
        setModuleError('Failed to load module details. Some modules may not display correctly.');
      } finally {
        if (isActive) {
          setModulesLoading(false);
        }
      }
    };

    fetchModules();

    return () => {
      isActive = false;
    };
  }, [user]);

  useEffect(() => {
    setSelectedSemester(null);
  }, [user]);

  // sorting semesters
  const sortedSemesters = useMemo(() => {
    if (!Array.isArray(semesters)) return [];
    return [...semesters].sort((a, b) => {
      const aNumber = Number(a?.number) || 0;
      const bNumber = Number(b?.number) || 0;
      return aNumber - bNumber;
    });
  }, [semesters]);

  const formatDate = (value) => {
    if (!value) return 'N/A';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const getModulesForSemester = (semester) =>
    (semester?.modules || []).map((moduleRef) => {
      if (moduleRef && typeof moduleRef === 'object') {
        return moduleRef;
      }
      return modulesById[moduleRef] || null;
    });

  const handleSemesterDelete = async (semesterId) => {
    if (!semesterId) return;

    try {
      await axiosInstance.delete(`/api/semesters/${semesterId}`, {
        headers: { Authorization: `Bearer ${user?.token}` },
      });
      setSemesters((prev) => prev.filter((semester) => semester._id !== semesterId));
    } catch (deleteError) {
      console.error('Failed to delete semester:', deleteError);
      window.alert('Failed to delete semester. Please try again.');
    }
  };

  // placeholder
  const handleModuleEdit = (semester) => {
    setSelectedSemester(semester);
    window.alert('Module editing from this dashboard is coming soon.');
  };

  // placeholder
  const handleModuleDelete = () => {
    window.alert('Module removal from a semester is coming soon.');
  };

  // placeholder
  const handleSearchChange = (semesterId, value) => {
    setSearchTerms((prev) => ({ ...prev, [semesterId]: value }));
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white p-6 rounded shadow text-center text-gray-600">
          <p>Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="student-dashboard">
      <aside className="student-dashboard__sidebar" aria-label="Student navigation">
        <div className="sidebar-header">
          <h2>Navigation</h2>
          <p>Welcome back{user?.name ? `, ${user.name}` : '!'}</p>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`sidebar-nav__item${item.active ? ' sidebar-nav__item--active' : ''}`}
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
            <p className="sidebar-footer__name">{user?.name || 'Ka Ki Yeung'}</p>
            <p className="sidebar-footer__role">{user?.profileType === 'student' ? 'Student' : 'Educator'}</p>
          </div>
        </div>
      </aside>

      <main className="student-dashboard__content">
        <header className="content-header">
          <div className="breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">></span>
            <span className="breadcrumb-current">Module</span>
          </div>
          <h1>Module</h1>
        </header>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {selectedSemester && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded flex flex-col gap-2">
            <div>
              <strong>Heads up:</strong> Editing from this dashboard is coming soon.
              Semester {selectedSemester.number} is ready to edit in the management preview.
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/testing"
                className="bg-[#005691] text-white px-3 py-2 rounded hover:bg-[#004080]"
              >
                Open Semester Management
              </Link>
              <button
                type="button"
                onClick={() => setSelectedSemester(null)}
                className="px-3 py-2 border border-blue-200 rounded hover:bg-blue-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        <div className="modules-area">
          {moduleError && (
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
              {moduleError}
            </div>
          )}

          {loading ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-500">
              Loading semesters...
            </div>
          ) : sortedSemesters.length === 0 ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-500">
              <p>No semesters created yet. Use the form above to add your first semester.</p>
            </div>
          ) : (
            sortedSemesters.map((semester) => {
              const moduleEntries = getModulesForSemester(semester);

              return (
                <section key={semester._id} className="semester-card">
                  <div className="semester-card__header">
                    <div className="semester-card__title">
                      <h2>Semester {semester.number || 'N/A'}</h2>
                      <p className="semester-card__meta">
                        {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                      </p>
                    </div>
                    <div className="semester-card__actions">
                      <label className="search-field" htmlFor={`semester-search-${semester._id}`}>
                        <svg
                          className="search-icon"
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          aria-hidden="true"
                        >
                          <path
                            d="M7 12C9.76142 12 12 9.76142 12 7C12 4.23858 9.76142 2 7 2C4.23858 2 2 4.23858 2 7C2 9.76142 4.23858 12 7 12Z"
                            stroke="#828299"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M14 14L10.5 10.5"
                            stroke="#828299"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <input
                          id={`semester-search-${semester._id}`}
                          type="search"
                          placeholder="Search..."
                          value={searchTerms[semester._id] || ''}
                          onChange={(event) => handleSearchChange(semester._id, event.target.value)}
                          aria-label={`Search modules in Semester ${semester.number}`}
                        />
                      </label>
                      <div className="semester-card__actions-buttons">
                        <button
                          type="button"
                          className="edit-semester-button"
                          onClick={() => setSelectedSemester(semester)}
                        >
                          Edit Semester
                        </button>
                        <button
                          type="button"
                          className="delete-semester-button"
                          onClick={() => handleSemesterDelete(semester._id)}
                        >
                          Delete Semester
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="module-table" role="table" aria-label={`Modules for Semester ${semester.number}`}>
                    <div className="module-table__header" role="row">
                      <span role="columnheader">Module Name</span>
                      <span role="columnheader">Description</span>
                      <span role="columnheader">Lessons Completed</span>
                      <span role="columnheader">Actions</span>
                    </div>

                    {modulesLoading ? (
                      <div className="module-table__row module-table__row--empty" role="row">
                        <span className="module-table__empty-message" role="cell">
                          Loading modules...
                        </span>
                      </div>
                    ) : moduleEntries.length === 0 ? (
                      <div className="module-table__row module-table__row--empty" role="row">
                        <span className="module-table__empty-message" role="cell">
                          No modules linked to this semester yet.
                        </span>
                      </div>
                    ) : (
                      moduleEntries.map((module, index) => {
                        const key = module?._id || `${semester._id}-module-${index}`;
                        const title = module?.title || 'Module unavailable';
                        const description = module?.description || 'No description provided';
                        const totalLessons = Number(module?.totalLessons ?? 0);
                        const completedLessons = Number(module?.completedLessons ?? 0);
                        const lessonsLabel = `${completedLessons} of ${totalLessons}`;

                        return (
                          <div key={key} className="module-table__row" role="row">
                            <div className="module-name-cell" role="cell">
                              <span className="module-name">{title}</span>
                            </div>
                            <span className="module-description" role="cell">
                              {description}
                            </span>
                            <span className="module-lessons" role="cell">
                              {lessonsLabel}
                            </span>
                            <div className="module-row-actions" role="cell">
                              <button
                                type="button"
                                className="row-action-button"
                                onClick={() => handleModuleEdit(semester)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="row-action-button row-action-button--danger"
                                onClick={handleModuleDelete}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <div className="semester-card__footer">
                    <button type="button" className="pagination-button" disabled>
                      Previous
                    </button>
                    <span className="pagination-info">Page 1 of 1</span>
                    <button type="button" className="pagination-button" disabled>
                      Next
                    </button>
                  </div>
                </section>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardStudent;
