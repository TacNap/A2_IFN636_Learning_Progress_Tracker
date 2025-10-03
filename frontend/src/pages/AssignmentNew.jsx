import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import AssignmentForm from '../components/AssignmentForm';
import NavigationPanel from '../components/NavigationPanel';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './AssignmentNew.css';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";


const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: '/student'},
  { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules' },
  { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments', active: true },
  { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
];

const AssignmentNew = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [assignments, setAssignments] = useState([]);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [requestedAssignmentId, setRequestedAssignmentId] = useState(
    location.state?.assignmentId ?? null
  );
  const [requestedAssignmentData, setRequestedAssignmentData] = useState(
    location.state?.assignment ?? null
  );

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
  const welcomeMessage = user?.name ? 'Welcome back, ' + user.name : 'Welcome back!';

  useEffect(() => {
    if (location.state?.assignmentId || location.state?.assignment) {
      setRequestedAssignmentId(location.state?.assignmentId ?? null);
      setRequestedAssignmentData(location.state?.assignment ?? null);
    } else {
      setRequestedAssignmentId(null);
      setRequestedAssignmentData(null);
    }
  }, [location.state]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!user?.token) {
        setAssignments([]);
        return;
      }

      try {
        const response = await axiosInstance.get('/api/assignments', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAssignments(response.data);
      } catch (error) {
        window.alert('Failed to fetch assignments. Please try again later.');
      }
    };

    fetchAssignments();
  }, [user]);

  useEffect(() => {
    if (requestedAssignmentId) {
      const found = (Array.isArray(assignments) ? assignments : []).find(
        (assignment) => assignment?._id === requestedAssignmentId
      );
      if (found) {
        setEditingAssignment(found);
        setRequestedAssignmentId(null);
        setRequestedAssignmentData(null);
      }
      return;
    }

    if (requestedAssignmentData) {
      setEditingAssignment(requestedAssignmentData);
      setRequestedAssignmentData(null);
    }
  }, [requestedAssignmentId, requestedAssignmentData, assignments]);

  return (
    <div className='assignment-create'>
      <NavigationPanel
        title='Navigation'
        welcomeMessage={welcomeMessage}
        initials={initials}
        userName={displayName}
        userRole={roleLabel}
        items={navItems}
      />
      <main className='assignment-create__content'>
        <header className='assignment-create__header'>
          <div className='assignment-create__breadcrumb' aria-label='Breadcrumb'>
            <span>Home</span>
            <span aria-hidden='true'>&gt;</span>
            <span>Assignments</span>
            <span aria-hidden='true'>&gt;</span>
            <span className='assignment-create__breadcrumb-current'>Add Assignment</span>
          </div>
          <div className='assignment-create__heading'>
            <h1>Add a new assignment</h1>
            <p>Capture the assignment details so learners know what success looks like.</p>
          </div>
        </header>

        <section className='assignment-create__form-area' aria-label='Assignment form'>
          <AssignmentForm
            assignments={assignments}
            setAssignments={setAssignments}
            editingAssignment={editingAssignment}
            setEditingAssignment={setEditingAssignment}
          />
        </section>
      </main>
    </div>
  );
};

export default AssignmentNew;
