import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import ModuleForm from '../components/ModuleForm';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import './ModuleNew.css';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: 'DB', to: '/student' },
  { id: 'module', label: 'Module', icon: 'MD', to: '/modules', active: true },
  { id: 'assignment', label: 'Assignment', icon: 'AS', to: '/assignments' },
  { id: 'certificate', label: 'Certificate', icon: 'CF', to: '/certificates' },
];

const ModuleNew = () => {
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
    <div className="module-create">
      <NavigationPanel
        title="Navigation"
        welcomeMessage={welcomeMessage}
        initials={initials}
        userName={displayName}
        userRole={roleLabel}
        items={navItems}
      />
      <main className="module-create__content">
        <header className="module-create__header">
          <div className="module-create__breadcrumb" aria-label="Breadcrumb">
            <span>Home</span>
            <span aria-hidden="true">&gt;</span>
            <span>Modules</span>
            <span aria-hidden="true">&gt;</span>
            <span className="module-create__breadcrumb-current">Add Module</span>
          </div>
          <div className="module-create__heading">
            <h1>Add a new module</h1>
            <p>Create a module so students can begin tracking their lesson progress right away.</p>
          </div>
        </header>

        <section className="module-create__form-area" aria-label="Module form">
          <ModuleForm
            modules={modules}
            setModules={setModules}
            editingModule={editingModule}
            setEditingModule={setEditingModule}
          />
        </section>
      </main>
    </div>
  );
};

export default ModuleNew;
