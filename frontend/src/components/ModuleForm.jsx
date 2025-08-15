import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ModuleForm = ({ modules, setModules, editingModule, setEditingModule }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ 
    title: '', 
    description: '', 
    deadline: '', 
    totalLessons: '',
    completedLessons: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingModule) {
      setFormData({
        title: editingModule.title || '',
        description: editingModule.description || '',
        deadline: editingModule.deadline ? editingModule.deadline.split('T')[0] : '',
        totalLessons: editingModule.totalLessons?.toString() || '0',
        completedLessons: editingModule.completedLessons?.toString() || '0'
      });
    } else {
      setFormData({ 
        title: '', 
        description: '', 
        deadline: '', 
        totalLessons: '',
        completedLessons: '0'
      });
    }
    setError('');
  }, [editingModule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const totalLessons = parseInt(formData.totalLessons) || 0;
    const completedLessons = parseInt(formData.completedLessons) || 0;
    
    if (completedLessons > totalLessons) {
      setError(`Only ${totalLessons} lessons in this module`);
      return;
    }

    try {
      const submitData = {
        ...formData,
        totalLessons,
        completedLessons
      };

      if (editingModule) {
        const response = await axiosInstance.put(`/api/modules/${editingModule._id}`, submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setModules(modules.map((module) => (module._id === response.data._id ? response.data : module)));
      } else {
        const response = await axiosInstance.post('/api/modules', submitData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setModules([...modules, response.data]);
      }
      setEditingModule(null);
      setFormData({ 
        title: '', 
        description: '', 
        deadline: '', 
        totalLessons: '',
        completedLessons: '0'
      });
    } catch (error) {
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to save module.');
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingModule ? 'Edit Module' : 'Add Module'}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
        required
      />
      
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded h-20 resize-none"
      />
      
      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Lessons
          </label>
          <input
            type="number"
            placeholder="Total Lessons"
            value={formData.totalLessons}
            onChange={(e) => setFormData({ ...formData, totalLessons: e.target.value })}
            className="w-full p-2 border rounded"
            min="0"
          />
        </div>
        
        {editingModule && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Completed Lessons
            </label>
            <input
              type="number"
              placeholder="Completed Lessons"
              value={formData.completedLessons}
              onChange={(e) => setFormData({ ...formData, completedLessons: e.target.value })}
              className="w-full p-2 border rounded"
              min="0"
            />
          </div>
        )}
      </div>
      
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
        {editingModule ? 'Update Module' : 'Add Module'}
      </button>
    </form>
  );
};

export default ModuleForm;