import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import SemesterList from '../components/SemesterList';
import NavigationPanel from '../components/NavigationPanel';
import './DashboardStudent.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: '/student', active: true },
  { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules' },
  { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
];

const DashboardStudent = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedSemester, setSelectedSemester] = useState(null);

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

  const displayName = user?.name || 'Ka Ki Yeung';
  const roleLabel = user?.profileType === 'student' ? 'Student' : 'Educator';
  const welcomeMessage = user?.name ? `Welcome back, ${user.name}` : 'Welcome back!';

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

  useEffect(() => {
    setSelectedSemester(null);
  }, [user]);
  
  const handleSemesterEdit = (semester) => {
    setSelectedSemester(semester);
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
      <NavigationPanel
        title="Navigation"
        welcomeMessage={welcomeMessage}
        initials={initials}
        userName={displayName}
        userRole={roleLabel}
        items={navItems}
      />

      <main className="student-dashboard__content">
        <header className="content-header">
          <div className="breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true"></span>
            <span className="breadcrumb-current">Dashboard</span>
          </div>
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
          {loading ? (
            <div className="bg-white p-6 rounded shadow text-center text-gray-500">
              Loading semesters...
            </div>
          ) : (
            <SemesterList
              semesters={semesters}
              setSemesters={setSemesters}
              setEditingSemester={handleSemesterEdit}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardStudent;
