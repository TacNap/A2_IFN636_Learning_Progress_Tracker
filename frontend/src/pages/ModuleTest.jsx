import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import NavigationPanel from '../components/NavigationPanel';
import './ModulePage.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DB', to: '/student' },
  { id: 'module', label: 'Module', icon: 'MD', to: '/modules', active: true },
  { id: 'assignment', label: 'Assignment', icon: 'AS', to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: 'CF', to: '/certificates' },
];

const formatDeadline = (value) => {
  if (!value) return 'No deadline';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'No deadline';
  }
  return date.toLocaleDateString();
};

const clampLessonCounts = (completed, total) => {
  const safeTotal = Number.isFinite(total) && total >= 0 ? total : 0;
  const safeCompleted = Number.isFinite(completed) && completed >= 0 ? completed : 0;
  if (safeCompleted > safeTotal) {
    return { completed: safeTotal, total: safeTotal };
  }
  return { completed: safeCompleted, total: safeTotal };
};

const ModuleTest = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const displayName = user?.name || 'Ka Ki Yeung';
  const roleLabel = user?.profileType === 'student' ? 'Student' : 'Educator';
  const welcomeMessage = user?.name ? `Welcome back, ${user.name}` : 'Welcome back!';

  useEffect(() => {
    let isMounted = true;

    const fetchModules = async () => {
      if (!user?.token) {
        setModules([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/modules', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!isMounted) return;
        setModules(response.data || []);
        setError('');
      } catch (fetchError) {
        if (!isMounted) return;
        console.error('Failed to load modules:', fetchError);
        setError('Failed to load modules. Please try again later.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModules();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLessonUpdate = async (moduleId, increment) => {
    if (!moduleId || !user?.token) return;

    const previous = modules.find((module) => module._id === moduleId);
    const previousCounts = clampLessonCounts(
      Number(previous?.completedLessons),
      Number(previous?.totalLessons),
    );

    try {
      const response = await axiosInstance.patch(
        `/api/modules/${moduleId}/lessons`,
        { increment },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        },
      );

      const updatedModule = response.data?.module;
      if (!updatedModule) return;

      setModules((prev) =>
        prev.map((module) => (module._id === moduleId ? updatedModule : module))
      );

      const updatedCounts = clampLessonCounts(
        Number(updatedModule?.completedLessons),
        Number(updatedModule?.totalLessons),
      );

      const completedAllLessons =
        updatedCounts.total > 0 &&
        updatedCounts.completed === updatedCounts.total &&
        updatedCounts.completed !== previousCounts.completed;

      if (response.data?.certificateEarned || completedAllLessons) {
        window.alert('Congratulations! You have completed all lessons for this module.');
      }
    } catch (updateError) {
      if (updateError.response?.data?.message) {
        window.alert(updateError.response.data.message);
      } else {
        window.alert('Failed to update lessons. Please try again.');
      }
    }
  };

  if (!user) {
    return (
      <div className="module-page__unauthenticated">
        <div className="module-page__message-card">
          <p>Please log in to view modules.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="module-page">
      <NavigationPanel
        title="Navigation"
        welcomeMessage={welcomeMessage}
        initials={initials}
        userName={displayName}
        userRole={roleLabel}
        items={navItems}
      />

      <main className="module-page__content">
        <header className="module-page__header">
          <div className="module-page__breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">></span>
            <span className="module-page__breadcrumb-current">Modules</span>
          </div>
          <Link to="/modules/new" className="module-page__add-button">
            Add Module
          </Link>
        </header>

        {error && (
          <div className="module-page__alert" role="alert">
            {error}
          </div>
        )}

        <section className="module-list" aria-labelledby="module-list-heading">
          <article className="module-list__card">
            <div className="module-list__header">
              <div className="module-list__title">
                <h1 id="module-list-heading">Modules</h1>
                <p>Track progress and update completed lessons.</p>
              </div>
              <div className="module-list__summary">
                <span>{modules.length} module{modules.length === 1 ? '' : 's'}</span>
              </div>
            </div>

            <div className="module-list__table" role="table" aria-label="Module list">
              <div className="module-list__table-header" role="row">
                <span role="columnheader">Module</span>
                <span role="columnheader">Description</span>
                <span role="columnheader">Deadline</span>
                <span role="columnheader">Progress</span>
                <span role="columnheader">Lessons</span>
              </div>

              {loading ? (
                <div className="module-list__row module-list__row--empty" role="row">
                  <span role="cell">Loading modules...</span>
                </div>
              ) : modules.length === 0 ? (
                <div className="module-list__row module-list__row--empty" role="row">
                  <span role="cell">No modules available yet.</span>
                </div>
              ) : (
                modules.map((module) => {
                  const moduleId = module?._id;
                  const title = module?.title || 'Untitled module';
                  const secondary = module?.code || module?.courseCode || module?.courseId || '';
                  const description = module?.description || 'No description provided.';
                  const { completed, total } = clampLessonCounts(
                    Number(module?.completedLessons),
                    Number(module?.totalLessons),
                  );
                  const deadlineLabel = formatDeadline(module?.deadline);
                  const canDecrement = completed > 0;
                  const canIncrement = total === 0 ? true : completed < total;

                  return (
                    <div key={moduleId || title} className="module-list__row" role="row">
                      <div className="module-list__module" role="cell">
                        <span className="module-list__module-title">{title}</span>
                        {secondary && (
                          <span className="module-list__module-subtitle">{secondary}</span>
                        )}
                      </div>
                      <span className="module-list__description" role="cell">
                        {description}
                      </span>
                      <span className="module-list__deadline" role="cell">
                        {deadlineLabel}
                      </span>
                      <span className="module-list__progress" role="cell">
                        {`${completed} of ${total || 0}`}
                      </span>
                      <div className="module-list__controls" role="cell">
                        <button
                          type="button"
                          className="module-list__control-button module-list__control-button--decrement"
                          onClick={() => handleLessonUpdate(moduleId, -1)}
                          disabled={!canDecrement}
                          aria-label={`Decrease completed lessons for ${title}`}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          className="module-list__control-button module-list__control-button--increment"
                          onClick={() => handleLessonUpdate(moduleId, 1)}
                          disabled={!canIncrement}
                          aria-label={`Increase completed lessons for ${title}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          <footer className="semester-list__footer">
          </footer>
          </article>
        </section>
      </main>
    </div>
  );
};

export default ModuleTest;
