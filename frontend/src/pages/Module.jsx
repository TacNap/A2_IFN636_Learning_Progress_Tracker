import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import ModuleForm from '../components/ModuleForm';
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
  const [editingModule, setEditingModule] = useState(null);

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
        <div className="module-page__inner">
          <ModuleForm
            modules={modules}
            setModules={setModules}
            editingModule={editingModule}
            setEditingModule={setEditingModule}
          />
          <ModuleList
            modules={modules}
            setModules={setModules}
            setEditingModule={setEditingModule}
          />
        </div>
      </main>
    </div>
  );
};

export default Modules;
