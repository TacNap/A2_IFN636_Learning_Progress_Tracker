import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import ModuleForm from '../components/ModuleForm';
import ModuleList from '../components/ModuleList';
import { useAuth } from '../context/AuthContext';

const Modules = () => {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [editingModule, setEditingModule] = useState(null);

  useEffect(() => {
    const fetchModules = async () => {
      try {
        const response = await axiosInstance.get('/api/modules', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setModules(response.data);
      } catch (error) {
        alert('Failed to fetch modules.');
      }
    };

    fetchModules();
  }, [user]);

  return (
    <div className="container mx-auto p-6">
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
  );
};

export default Modules;