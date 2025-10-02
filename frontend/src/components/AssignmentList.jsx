import { useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './AssignmentList.css';

const normaliseScore = (value) => {
  const numericScore = Number(value);
  if (Number.isNaN(numericScore)) {
    return null;
  }
  return Math.min(100, Math.max(0, numericScore));
};

const getScoreMeta = (score) => {
  if (typeof score !== 'number') {
    return { variant: 'unknown', label: 'Not graded' };
  }

  if (score >= 85) {
    return { variant: 'excellent', label: '7' };
  }

  if (score >= 75) {
    return { variant: 'excellent', label: '6' };
  }

  if (score >= 65) {
    return { variant: 'good', label: '5' };
  }

  if (score >= 50) {
    return { variant: 'good', label: '4' };
  }

  return { variant: 'danger', label: 'fail' };
};

const AssignmentList = ({ assignments, setAssignments, setEditingAssignment }) => {
  const { user } = useAuth();
  const token = user?.token;
  const [searchTerm, setSearchTerm] = useState('');

  const safeAssignments = useMemo(() => {
    if (!Array.isArray(assignments)) {
      return [];
    }
    return assignments.map((assignment) => assignment || {});
  }, [assignments]);

  const summary = useMemo(() => {
    let totalScore = 0;
    let gradedCount = 0;
    let topPerformers = 0;
    let needsSupport = 0;

    safeAssignments.forEach((assignment) => {
      const score = normaliseScore(assignment?.score);
      if (score === null) {
        return;
      }

      totalScore += score;
      gradedCount += 1;

      if (score >= 85) {
        topPerformers += 1;
      }

      if (score < 55) {
        needsSupport += 1;
      }
    });

    return {
      total: safeAssignments.length,
      gradedCount,
      averageScore: gradedCount > 0 ? totalScore / gradedCount : 0,
      topPerformers,
      needsSupport,
    };
  }, [safeAssignments]);

  const filteredAssignments = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return safeAssignments;
    }

    return safeAssignments.filter((assignment) => {
      const searchTarget = [assignment?.title, assignment?.description]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchTarget.includes(term);
    });
  }, [safeAssignments, searchTerm]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEdit = (assignment) => {
    if (typeof setEditingAssignment === 'function') {
      setEditingAssignment(assignment);
    }
  };

  const handleDelete = async (assignmentId) => {
    if (!assignmentId) {
      return;
    }

    if (!token) {
      window.alert('You need to be signed in to delete assignments.');
      return;
    }

    const confirmDelete = window.confirm('Are you sure you want to delete this assignment?');
    if (!confirmDelete) {
      return;
    }

    try {
      await axiosInstance.delete(`/api/assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (typeof setAssignments === 'function') {
        setAssignments((prev) => prev.filter((assignment) => assignment?._id !== assignmentId));
      }
    } catch (error) {
      console.error('Failed to delete assignment:', error);
      window.alert('Failed to delete assignment. Please try again.');
    }
  };

  const hasAssignments = summary.total > 0;
  const hasResults = filteredAssignments.length > 0;
  const averageScoreLabel = summary.gradedCount > 0 ? `${summary.averageScore.toFixed(1)}%` : '—';

  return (
    <div className="assignment-list">
      <section className="assignment-list__card" aria-label="Assignment list">
        <header className="assignment-list__header">
          <div className="assignment-list__title">
            <h2>Assignments</h2>
            <p className="assignment-list__subtitle">
              Track your assignment grades.
            </p>
          </div>

          <div className="assignment-list__controls">
            <label className="assignment-list__search" htmlFor="assignment-search">
              <svg
                aria-hidden="true"
                focusable="false"
                viewBox="0 0 24 24"
                className="assignment-list__search-icon"
              >
                <path
                  d="M10.5 3a7.5 7.5 0 015.916 12.09l3.247 3.247a1 1 0 01-1.414 1.414l-3.247-3.247A7.5 7.5 0 1110.5 3zm0 2a5.5 5.5 0 104.242 9.042A5.5 5.5 0 0010.5 5z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id="assignment-search"
                type="search"
                placeholder="Search assignments"
                value={searchTerm}
                onChange={handleSearchChange}
                aria-label="Search assignments"
              />
            </label>
          </div>
        </header>

        <div className="assignment-list__summary" aria-label="Assignment summary">
          <div className="assignment-list__summary-item">
            <span className="assignment-list__summary-value">{summary.total}</span>
            <span className="assignment-list__summary-label">Assignments</span>
          </div>
          <div className="assignment-list__summary-item">
            <span className="assignment-list__summary-value">{averageScoreLabel}</span>
            <span className="assignment-list__summary-label">Average score</span>
          </div>
          <div className="assignment-list__summary-item">
            <span className="assignment-list__summary-value">{summary.topPerformers}</span>
            <span className="assignment-list__summary-label">Excellent</span>
          </div>
          <div className="assignment-list__summary-item">
            <span className="assignment-list__summary-value">{summary.needsSupport}</span>
            <span className="assignment-list__summary-label">Needs support</span>
          </div>
        </div>

        <div className="assignment-list__table" role="table" aria-label="Assignments">
          <div className="assignment-list__table-header" role="row">
            <span role="columnheader">Assignment</span>
            <span role="columnheader">Description</span>
            <span role="columnheader">Progress</span>
            <span role="columnheader">Actions</span>
          </div>

          {!hasAssignments && (
            <div className="assignment-list__row assignment-list__row--empty" role="row">
              <span className="assignment-list__message" role="cell">
                No assignments yet. Add your first assignment above.
              </span>
            </div>
          )}

          {hasAssignments && !hasResults && (
            <div className="assignment-list__row assignment-list__row--empty" role="row">
              <span className="assignment-list__message" role="cell">
                No assignments match your search.
              </span>
            </div>
          )}

          {hasResults &&
            filteredAssignments.map((assignment, index) => {
              const assignmentId = assignment?._id;
              const title = assignment?.title || 'Untitled assignment';
              const description = assignment?.description || 'No description provided.';
              const score = normaliseScore(assignment?.score);
              const { variant, label: scoreLabel } = getScoreMeta(score);
              const progressLabel = score === null ? 'Not graded' : `${score}% of 100%`;

              return (
                <div
                  key={assignmentId || `${title}-${index}`}
                  className="assignment-list__row"
                  role="row"
                >
                  <div className="assignment-list__cell" role="cell">
                    <span className="assignment-list__assignment-title">{title}</span>
                    <span
                      className={`assignment-list__assignment-meta assignment-list__assignment-meta--${variant}`}
                    >
                      {scoreLabel}
                    </span>
                  </div>

                  <span className="assignment-list__description" role="cell">
                    {description}
                  </span>

                  <div className="assignment-list__progress" role="cell">
                    <div className="assignment-list__progress-track">
                      <div
                        className={`assignment-list__progress-bar assignment-list__progress-bar--${variant}`}
                        style={{ width: score === null ? '0%' : `${score}%` }}
                        aria-hidden="true"
                      />
                    </div>
                    <span className="assignment-list__progress-label">{progressLabel}</span>
                  </div>

                  <div className="assignment-list__actions" role="cell">
                    <button
                      type="button"
                      className="assignment-list__button assignment-list__button--primary"
                      onClick={() => handleEdit(assignment)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="assignment-list__button assignment-list__button--danger"
                      onClick={() => handleDelete(assignmentId)}
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

export default AssignmentList;
