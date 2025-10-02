import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import ModuleList from '../components/ModuleList';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import './Module.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DB', to: '/student' },
  { id: 'module', label: 'Module', icon: 'MD', to: '/modules', active: true },
  { id: 'assignment', label: 'Assignment', icon: 'AS', to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: 'CF', to: '/certificates' },
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
    return 'KK';
  }, [user]);

  const displayName = user?.name || 'Ka Ki Yeung';
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
        <div className="module-page__inner">
          <ModuleList modules={modules} setModules={setModules} />
        </div>
      </main>
    </div>
  );
};

export default Modules;
