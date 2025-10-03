import { useState, useEffect, useMemo } from 'react';
import axiosInstance from '../axiosConfig';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";
import Navbar from "../components/Navbar";
import './DashboardEducator.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: '/educator', active: true },
  { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules' },
  { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
];

const DashboardEducator = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const displayName = user?.name || 'Educator';
  const roleLabel = 'Educator';
  const welcomeMessage = user?.name ? `Welcome back, ${user.name}` : 'Welcome back!';

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.token) {
        setError('You must be logged in to view students.');
        setLoading(false);
        return;
      }

      if (user.profileType !== 'educator') {
        setError('Access restricted to educator accounts.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/educator/students', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStudents(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  return (
    <div>
      <Navbar />
      <div className="educator-dashboard">
        <NavigationPanel
          title="Navigation"
          welcomeMessage={welcomeMessage}
          initials={initials}
          userName={displayName}
          userRole={roleLabel}
          items={navItems}
        />
        
        <main className="educator-dashboard__content">
          <div className="educator-dashboard__inner">
            <header className='educator-dashboard__header'>
              <div className='educator-dashboard__breadcrumb' aria-label='Breadcrumb'>
                <span>Home</span>
                <span aria-hidden='true'>&gt;</span>
                <span className='educator-dashboard__breadcrumb-current'>Dashboard</span>
              </div>
              <div className='educator-dashboard__heading'>
                <h1>Dashboard</h1>
                <p>Track your modules and progress.</p>
              </div>
            </header>

            {loading && (
              <div className="educator-dashboard__loading">
                <p>Loading students...</p>
              </div>
            )}

            {error && !loading && (
              <div className="educator-dashboard__error">
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="educator-dashboard__retry-btn"
                >
                  Try Again
                </button>
              </div>
            )}

            {!loading && !error && (
              <section className="educator-dashboard__students">
                <div className="students-card">
                  <div className="students-card__header">
                    <h2>Students</h2>
                    <p>Total students: {students.length}</p>
                  </div>

                  {students.length === 0 ? (
                    <div className="students-empty">
                      No students found.
                    </div>
                  ) : (
                    <div className="students-table">
                      <div className="students-table__header">
                        <span>Name</span>
                        <span>Email</span>
                      </div>
                      {students.map((student) => (
                        <div key={student._id || student.email} className="students-table__row">
                          <div className="student-name">
                            {student.name}
                          </div>
                          <div className="student-email">
                            {student.email}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardEducator;