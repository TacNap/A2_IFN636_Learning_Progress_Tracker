import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import ModuleList from '../components/ModuleList';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import './Module.css';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";
import Navbar from "../components/Navbar";


const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: '/student'},
  { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules', active: true },
  { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
];

const Modules = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);

  const initials = useMemo(() => {
    if (user?.name) {
      return user.name
        .split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
    }
    return 'NA';
  }, [user]);

  const displayName = user?.name || 'Guest';
  const roleLabel = user?.profileType === 'student' ? 'Student' : 'Educator';
  const welcomeMessage = user?.name ? 'Welcome back, ' + user.name : 'Welcome back!';

  useEffect(() => {
    const fetchModules = async () => {
      if (!user?.token) {
        setModules([]);
        return;
      }

      try {
        const response = await axiosInstance.get('/api/modules', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setModules(response.data);
      } catch (error) {
        window.alert('Failed to fetch modules.');
      }
    };

    fetchModules();
  }, [user]);

  return (
    <div>
      <Navbar />
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
        <div className="module-page__inner">
          <header className="module-create__header">
          <div className="module-create__breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">&gt;</span>
            <span className="module-create__breadcrumb-current">Modules</span>
          </div>
          <div className="module-create__heading">
            <h1>Modules</h1>
            <p>Track your modules and progress.</p>
          </div>
        </header>
          <ModuleList modules={modules} setModules={setModules} />
        </div>
      </main>
    </div>
    </div>
  );
};

export default Modules;
