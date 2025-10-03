import { useEffect, useMemo, useState } from 'react';
import axiosInstance from '../axiosConfig';
import ModuleForm from '../components/ModuleForm';
import { useLocation } from 'react-router-dom';
import NavigationPanel from '../components/NavigationPanel';
import { useAuth } from '../context/AuthContext';
import './ModuleNew.css';
import { ReactComponent as CertificateIcon } from "../icons/certificate.svg";
import { ReactComponent as AssignmentIcon } from "../icons/assignment.svg";
import { ReactComponent as DashboardIcon } from "../icons/dashboard.svg";
import { ReactComponent as ModuleIcon } from "../icons/module.svg";
import Navbar from "../components/Navbar";




const ModuleNew = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);
  const [requestedModuleId, setRequestedModuleId] = useState(location.state?.moduleId ?? null);
  const [requestedModuleData, setRequestedModuleData] = useState(location.state?.module ?? null);
  
  const dashboardPath = user?.profileType === 'educator' ? '/educator' : '/student';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, to: dashboardPath },
    { id: 'module', label: 'Module', icon: <ModuleIcon />, to: '/modules', active: true },
    { id: 'assignment', label: 'Assignment', icon: <AssignmentIcon />, to: '/assignments' },
    { id: 'certificate', label: 'Certificate', icon: <CertificateIcon />, to: '/certificates' },
  ];

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
    if (location.state?.moduleId || location.state?.module) {
      setRequestedModuleId(location.state?.moduleId ?? null);
      setRequestedModuleData(location.state?.module ?? null);
    } else {
      setRequestedModuleId(null);
      setRequestedModuleData(null);
    }
  }, [location.state]);

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

  useEffect(() => {
    if (requestedModuleId) {
      const found = (Array.isArray(modules) ? modules : []).find((module) => module?._id === requestedModuleId);
      if (found) {
        setEditingModule(found);
        setRequestedModuleId(null);
        setRequestedModuleData(null);
      }
      return;
    }

    if (requestedModuleData) {
      setEditingModule(requestedModuleData);
      setRequestedModuleData(null);
    }
  }, [requestedModuleId, requestedModuleData, modules]);
  return (
    <div>
      <Navbar />
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
    </div>
  );
};

export default ModuleNew;

