import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import SemesterList from '../components/SemesterList';
import NavigationPanel from '../components/NavigationPanel';
import './DashboardStudent.css';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";
import Navbar from "../components/Navbar";




const DashboardStudent = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [semesters, setSemesters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const dashboardPath = user?.profileType === 'educator' ? '/educator' : '/student';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: dashboardPath, active: true },
    { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules' },
    { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments' },
    { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
  ];
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

  const handleSemesterEdit = (semester) => {
    if (!semester) {
      return;
    }

    navigate('/semester/new', {
      state: {
        semesterId: semester?._id ?? null,
        semester,
      },
    });
  };

  const handleModuleEdit = (module) => {
    if (!module) {
      return;
    }

    navigate('/modules/new', {
      state: {
        moduleId: module?._id ?? null,
        module,
      },
    });
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
    <div>
      <Navbar />
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

        <div className="student-dashboard__actions mb-4">
          <Link
            to="/semester/new"
            className="inline-flex items-center gap-2 bg-[#005691] text-white px-4 py-2 rounded shadow-sm hover:bg-[#004080] transition-colors"
          >
            Add Semester
          </Link>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded">
            {error}
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
              onEditSemester={handleSemesterEdit}
              onEditModule={handleModuleEdit}
            />
          )}
        </div>
      </main>
    </div>
    </div>
  );
};

export default DashboardStudent;
