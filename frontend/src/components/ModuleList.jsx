import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './ModuleList.css';

// needs module add button 
// edit page needs to link to a separate page. 
const normaliseCount = (value) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) {
    return 0;
  }
  return Math.max(0, Math.floor(numeric));
};

const getProgressDetails = (completedLessons, totalLessons) => {
  const completed = normaliseCount(completedLessons);
  const total = Math.max(0, normaliseCount(totalLessons));
  const percentage =
    total > 0 ? Math.min(100, Math.round((completed / total) * 100)) : 0;

  if (total === 0) {
    return { percentage: 0, variant: 'unknown', label: 'No lessons set' };
  }

  if (percentage >= 100) {
    return { percentage, variant: 'complete', label: 'Completed' };
  }

  if (percentage >= 70) {
    return { percentage, variant: 'good', label: 'On track' };
  }

  if (percentage >= 40) {
    return { percentage, variant: 'warning', label: 'Making progress' };
  }

  return { percentage, variant: 'danger', label: 'Needs focus' };
};

const formatDate = (value) => {
  if (!value) {
    return null;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleDateString();
};

const ModuleList = ({ modules, setModules, setEditingModule }) => {
  const { user } = useAuth();
  const token = user?.token;
  const [searchTerm, setSearchTerm] = useState('');

  const safeModules = useMemo(() => {
    if (!Array.isArray(modules)) {
      return [];
    }
    return modules.map((module) => module || {});
  }, [modules]);

  const summary = useMemo(() => {
    const totals = {
      total: safeModules.length,
      averageCompletion: 0,
      completed: 0,
      inProgress: 0,
    };

    if (totals.total === 0) {
      return totals;
    }

    let completionAccumulator = 0;

    safeModules.forEach((module) => {
      const details = getProgressDetails(
        module?.completedLessons,
        module?.totalLessons
      );
      completionAccumulator += details.percentage;

      if (details.percentage >= 100) {
        totals.completed += 1;
      } else if (details.percentage >= 50) {
        totals.inProgress += 1;
      }
    });

    totals.averageCompletion = completionAccumulator / totals.total;

    return totals;
  }, [safeModules]);

  const filteredModules = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return safeModules;
    }

    return safeModules.filter((module) => {
      const searchTarget = [
        module?.title,
        module?.description,
        module?.code,
        module?.courseCode,
        module?.courseName,
        Array.isArray(module?.tags) ? module.tags.join(' ') : '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchTarget.includes(term);
    });
  }, [safeModules, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (module) => {
    if (typeof setEditingModule === 'function') {
      setEditingModule(module);
    }
  };

  const handleLessonUpdate = async (moduleId, increment) => {
    if (!moduleId || !Number.isInteger(increment)) {
      return;
    }

    if (!token) {
      window.alert('You need to be signed in to update lessons.');
      return;
    }

    try {
      const response = await axiosInstance.patch(
        `/api/modules/${moduleId}/lessons`,
        { increment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const updatedModule = response.data?.module;

      if (typeof setModules === 'function' && updatedModule?._id) {
        setModules((prev) =>
          (Array.isArray(prev) ? prev : []).map((module) =>
            module?._id === updatedModule._id ? updatedModule : module
          )
        );
      }

      if (response.data?.certificateEarned) {
        window.alert(
          'Congratulations! You earned a certificate for completing this module!'
        );
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Failed to update lessons. Please try again.';
      window.alert(message);
    }
  };

  const handleDelete = async (moduleId) => {
    if (!moduleId) {
      return;
    }

    if (!token) {
      window.alert('You need to be signed in to delete modules.');
      return;
    }

    const confirmDelete = window.confirm(
      'Are you sure you want to delete this module?'
    );
    if (!confirmDelete) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (typeof setModules === 'function') {
        setModules((prev) =>
          (Array.isArray(prev) ? prev : []).filter(
            (module) => module?._id !== moduleId
          )
        );
      }
    } catch (error) {
      window.alert('Failed to delete module. Please try again.');
    }
  };

  const hasModules = summary.total > 0;
  const hasResults = filteredModules.length > 0;
  const averageCompletionLabel = hasModules
    ? `${summary.averageCompletion.toFixed(1)}%`
    : '—';

  return (
    <div className="module-list">
      <section className="module-list__card" aria-label="Module list">
        <header className="module-list__header">
          <div className="module-list__title">
            <h2>Modules</h2>
            <p className="module-list__subtitle">
              Monitor module progress and manage lessons as students complete their work.
            </p>
          </div>

          <div className="module-list__controls">
            <label className="module-list__search" htmlFor="module-search">
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                className="module-list__search-icon"
              >
                <path
                  d="M10.5 3a7.5 7.5 0 015.916 12.09l3.247 3.247a1 1 0 01-1.414 1.414l-3.247-3.247A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 104.242 9.042A5.5 5.5 0 0010.5 5z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id="module-search"
                type="search"
                placeholder="Search modules"
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Search modules"
              />
            </label>
            <Link
              to="/modules/new"
              className="module-list__add-button"
            >
              <span aria-hidden="true">+</span>
              Add Module
            </Link>
          </div>
        </header>

        <div className="module-list__summary" aria-label="Module summary">
          <div className="module-list__summary-item">
            <span className="module-list__summary-value">{summary.total}</span>
            <span className="module-list__summary-label">Modules</span>
          </div>
          <div className="module-list__summary-item">
            <span className="module-list__summary-value">
              {averageCompletionLabel}
            </span>
            <span className="module-list__summary-label">Avg. completion</span>
          </div>
          <div className="module-list__summary-item">
            <span className="module-list__summary-value">{summary.completed}</span>
            <span className="module-list__summary-label">Completed</span>
          </div>
        </div>

        <div className="module-list__table" role="table" aria-label="Modules">
          <div className="module-list__table-header" role="row">
            <span role="columnheader">Module</span>
            <span role="columnheader">Description</span>
            <span role="columnheader">Lessons</span>
            <span role="columnheader">Actions</span>
          </div>

          {!hasModules && (
            <div className="module-list__row module-list__row--empty" role="row">
              <span className="module-list__message" role="cell">
                No modules available yet. Add a new module to get started.
              </span>
            </div>
          )}

          {hasModules && !hasResults && (
            <div className="module-list__row module-list__row--empty" role="row">
              <span className="module-list__message" role="cell">
                No modules match your search.
              </span>
            </div>
          )}

          {hasResults &&
            filteredModules.map((module, index) => {
              const moduleId = module?._id;
              const title = module?.title || 'Untitled module';
              const description =
                module?.description || 'No description provided.';
              const deadlineLabel = formatDate(module?.deadline);
              const completed = normaliseCount(module?.completedLessons);
              const totalLessons = Math.max(
                0,
                normaliseCount(module?.totalLessons)
              );
              const progressDetails = getProgressDetails(
                module?.completedLessons,
                module?.totalLessons
              );
              const { percentage, variant } =
                progressDetails;

              const canDecrease = completed > 0;
              const canIncrease =
                totalLessons > 0 && completed < totalLessons;

              return (
                <div
                  key={moduleId || `${title}-${index}`}
                  className="module-list__row"
                  role="row"
                >
                  <div className="module-list__cell" role="cell">
                    <span className="module-list__module-title">{title}</span>
                    <span className="module-list__module-deadline">
                      {deadlineLabel
                        ? `Due ${deadlineLabel}`
                        : 'No deadline set'}
                    </span>
                  </div>

                  <span className="module-list__description" role="cell">
                    {description}
                  </span>

                  <div className="module-list__lessons" role="cell">
                    <div className="module-list__progress">
                      <div className="module-list__progress-track">
                        <div
                          className={`module-list__progress-bar module-list__progress-bar--${variant}`}
                          style={{ width: `${percentage}%` }}
                          aria-hidden="true"
                        />
                      </div>
                      <div className="module-list__progress-meta">
                        <span>{`${completed} of ${totalLessons} lessons`}</span>
                        <span className="module-list__progress-percentage">
                          {`${percentage}%`}
                        </span>
                      </div>
                    </div>

                    <div className="module-list__lesson-controls">
                      <button
                        type="button"
                        className="module-list__lesson-button module-list__lesson-button--decrease"
                        onClick={() => handleLessonUpdate(moduleId, -1)}
                        disabled={!canDecrease}
                        aria-label="Decrease completed lessons"
                      >
                        −
                      </button>
                      <span className="module-list__lesson-count">
                        {completed}
                      </span>
                      <button
                        type="button"
                        className="module-list__lesson-button module-list__lesson-button--increase"
                        onClick={() => handleLessonUpdate(moduleId, 1)}
                        disabled={!canIncrease}
                        aria-label="Increase completed lessons"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="module-list__actions" role="cell">
                    <button
                      type="button"
                      className="module-list__button module-list__button--primary"
                      onClick={() => handleEdit(module)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="module-list__button module-list__button--danger"
                      onClick={() => handleDelete(moduleId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};

export default ModuleList;

