import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import SemesterForm from '../components/SemesterForm';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import './SemesterNew.css';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: '/student', active: true },
  { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules'},
  { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
];

const SemesterNew = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [semesters, setSemesters] = useState([]);
  const [editingSemester, setEditingSemester] = useState(null);
  const [requestedSemesterId, setRequestedSemesterId] = useState(location.state?.semesterId ?? null);
  const [requestedSemesterData, setRequestedSemesterData] = useState(location.state?.semester ?? null);

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

  const displayName = user?.name || 'Guest';
  const roleLabel = user?.profileType === 'student' ? 'Student' : 'Educator';
  const welcomeMessage = user?.name ? `Welcome back, ${user.name}` : 'Welcome back!';

  useEffect(() => {
    if (location.state?.semesterId || location.state?.semester) {
      setRequestedSemesterId(location.state?.semesterId ?? null);
      setRequestedSemesterData(location.state?.semester ?? null);
    } else {
      setRequestedSemesterId(null);
      setRequestedSemesterData(null);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchSemesters = async () => {
      if (!user?.token) {
        setSemesters([]);
        return;
      }

      try {
        const response = await axiosInstance.get('/api/semesters', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSemesters(response.data || []);
      } catch (error) {
        window.alert('Failed to fetch semesters.');
      }
    };

    fetchSemesters();
  }, [user]);

  useEffect(() => {
    if (requestedSemesterId) {
      const match = (Array.isArray(semesters) ? semesters : []).find(
        (semester) => semester?._id === requestedSemesterId
      );
      if (match) {
        setEditingSemester(match);
        setRequestedSemesterId(null);
        setRequestedSemesterData(null);
        return;
      }
    }

    if (requestedSemesterData) {
      setEditingSemester(requestedSemesterData);
      setRequestedSemesterData(null);
      setRequestedSemesterId(null);
    }
  }, [requestedSemesterId, requestedSemesterData, semesters]);

  return (
    <div className="semester-create">
      <NavigationPanel
        title="Navigation"
        welcomeMessage={welcomeMessage}
        initials={initials}
        userName={displayName}
        userRole={roleLabel}
        items={navItems}
      />
      <main className="semester-create__content">
        <header className="semester-create__header">
          <div className="semester-create__breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">&gt;</span>
            <span>Dashboard</span>
            <span aria-hidden="true">&gt;</span>
            <span className="semester-create__breadcrumb-current">
              {editingSemester ? 'Edit Semester' : 'Add Semester'}
            </span>
          </div>
          <div className="semester-create__heading">
            <h1>{editingSemester ? 'Edit semester details' : 'Add a new semester'}</h1>
            <p>Define semester dates and attached modules.</p>
          </div>
        </header>

        <section className="semester-create__form-area" aria-label="Semester form">
          <SemesterForm
            semesters={semesters}
            setSemesters={setSemesters}
            editingSemester={editingSemester}
            setEditingSemester={setEditingSemester}
          />
        </section>
      </main>
    </div>
  );
};

export default SemesterNew;
