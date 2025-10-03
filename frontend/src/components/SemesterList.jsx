import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './SemesterList.css';

const SemesterList = ({ semesters, setSemesters, setEditingSemester }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [modulesById, setModulesById] = useState({});
  const [modulesLoading, setModulesLoading] = useState(true);
  const [moduleError, setModuleError] = useState('');
  const [searchTerms, setSearchTerms] = useState({});

  useEffect(() => {
    if (!user?.token) {
      setModulesById({});
      setModulesLoading(false);
      return;
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
      } catch (error) {
        if (!isActive) return;
        console.error('Failed to load modules:', error);
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

  const normaliseModuleEntry = (moduleRef) => {
    if (moduleRef && typeof moduleRef === 'object') {
      return moduleRef;
    }
    return modulesById[moduleRef] || null;
  };

  const handleDeleteSemester = async (semesterId) => {
    if (!semesterId) return;

    try {
      await axiosInstance.delete(`/api/semesters/${semesterId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSemesters((prev) => prev.filter((semester) => semester._id !== semesterId));
    } catch (error) {
      console.error('Failed to delete semester:', error);
      window.alert('Failed to delete semester. Please try again.');
    }
  };

  const handleSearchChange = (semesterId, value) => {
    setSearchTerms((prev) => ({ ...prev, [semesterId]: value }));
  };

  const matchesSearch = (module, rawTerm) => {
    if (!rawTerm) return true;

    const term = rawTerm.trim().toLowerCase();
    if (!term) return true;

    const searchTarget = [
      module?.title,
      module?.description,
      module?.code,
      module?.courseCode,
      module?.courseId,
      Array.isArray(module?.tags) ? module.tags.join(' ') : '',
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return searchTarget.includes(term);
  };

  const handleModuleEdit = () => {
    window.alert('Module editing from this list is coming soon.');
  };

  const handleModuleDelete = () => {
    window.alert('Module removal from a semester is coming soon.');
  };

  const handleSemesterEdit = (semester) => {
    if (!semester) {
      return;
    }

    if (typeof setEditingSemester === 'function') {
      setEditingSemester(semester);
      return;
    }

    const semesterId = semester?._id;
    if (semesterId) {
      navigate('/semester/new', {
        state: { semesterId, semester },
      });
      return;
    }

    navigate('/semester/new', {
      state: { semester },
    });
  };

  const canEditSemester = true;

  if (!sortedSemesters.length) {
    return (
      <div className="semester-list__empty">
        No semesters created yet. Use the form above to add your first semester.
      </div>
    );
  }

  return (
    <div className="semester-list">
      {moduleError && (
        <div className="semester-list__alert semester-list__alert--warning" role="alert">
          {moduleError}
        </div>
      )}

      {sortedSemesters.map((semester) => {
        const semesterId = semester._id;
        const searchTerm = searchTerms[semesterId] || '';
        const moduleEntries = (semester.modules || []).map((moduleRef) => normaliseModuleEntry(moduleRef));
        const filteredModules = moduleEntries.filter((module) => matchesSearch(module, searchTerm));
        const hasModules = moduleEntries.length > 0;
        const hasSearchResults = filteredModules.length > 0;

        return (
          <section key={semesterId} className="semester-list__card">
            <div className="semester-list__header">
              <div className="semester-list__title">
                <h3>Semester {semester.number || 'N/A'}</h3>
                <p className="semester-list__subtitle">
                  {formatDate(semester.startDate)} - {formatDate(semester.endDate)}
                </p>
              </div>

              <div className="semester-list__controls">
                <label className="semester-list__search" htmlFor={`semester-search-${semesterId}`}>
                  <svg
                    aria-hidden="true"
                    focusable="false"
                    viewBox="0 0 16 16"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M11.3333 6.66667C11.3333 9.244 9.244 11.3333 6.66667 11.3333C4.08934 11.3333 2 9.244 2 6.66667C2 4.08934 4.08934 2 6.66667 2C9.244 2 11.3333 4.08934 11.3333 6.66667Z"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14 14L10.5 10.5"
                      stroke="currentColor"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>

                  <input
                    id={`semester-search-${semesterId}`}
                    type="search"
                    value={searchTerm}
                    placeholder="Search..."
                    onChange={(event) => handleSearchChange(semesterId, event.target.value)}
                    aria-label={`Search modules in Semester ${semester.number || ''}`}
                  />
                </label>

                <div className="semester-list__actions">
                  {canEditSemester && (
                    <button
                      type="button"
                      className="semester-list__edit-button"
                      onClick={() => handleSemesterEdit(semester)}
                    >
                      Edit Semester
                    </button>
                  )}
                  <button
                    type="button"
                    className="semester-list__delete-button"
                    onClick={() => handleDeleteSemester(semesterId)}
                  >
                    Delete Semester
                  </button>
                </div>
              </div>
            </div>

            <div
              className="semester-list__table"
              role="table"
              aria-label={`Modules for Semester ${semester.number || ''}`}
            >
              <div className="semester-list__table-header" role="row">
                <span role="columnheader">Module Name</span>
                <span role="columnheader">Description</span>
                <span role="columnheader">Lessons Completed</span>
                <span role="columnheader">Actions</span>
              </div>

              {modulesLoading ? (
                <div className="semester-list__row semester-list__row--empty" role="row">
                  <span className="semester-list__message" role="cell">
                    Loading modules...
                  </span>
                </div>
              ) : !hasModules ? (
                <div className="semester-list__row semester-list__row--empty" role="row">
                  <span className="semester-list__message" role="cell">
                    No modules linked to this semester yet.
                  </span>
                </div>
              ) : !hasSearchResults ? (
                <div className="semester-list__row semester-list__row--empty" role="row">
                  <span className="semester-list__message" role="cell">
                    No modules match your search.
                  </span>
                </div>
              ) : (
                filteredModules.map((module, index) => {
                  const key = module?._id || `${semesterId}-module-${index}`;
                  const title = module?.title || 'Module unavailable';
                  const secondary =
                    module?.code ||
                    module?.courseCode ||
                    module?.courseId ||
                    module?.shortCode ||
                    '';
                  const description = module?.description || 'No description provided.';
                  const totalLessonsRaw = Number(module?.totalLessons);
                  const totalLessons = Number.isNaN(totalLessonsRaw) ? 0 : totalLessonsRaw;
                  const completedLessonsRaw = Number(module?.completedLessons);
                  const completedLessons = Number.isNaN(completedLessonsRaw) ? 0 : completedLessonsRaw;
                  const lessonsLabel = `${completedLessons} of ${totalLessons}`;

                  return (
                    <div key={key} className="semester-list__row" role="row">
                      <div className="semester-list__module" role="cell">
                        <span className="semester-list__module-title">{title}</span>
                        {secondary && (
                          <span className="semester-list__module-subtitle">{secondary}</span>
                        )}
                      </div>
                      <span className="semester-list__description" role="cell">
                        {description}
                      </span>
                      <span className="semester-list__lessons" role="cell">
                        {lessonsLabel}
                      </span>
                      <div className="semester-list__actions-cell" role="cell">
                        <button
                          type="button"
                          className="semester-list__row-button"
                          onClick={handleModuleEdit}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="semester-list__row-button semester-list__row-button--danger"
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

            <footer className="semester-list__footer">
            </footer>
          </section>
        );
      })}
    </div>
  );
};

export default SemesterList;
