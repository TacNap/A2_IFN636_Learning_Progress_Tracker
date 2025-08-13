import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ModuleForm = ({ module, setModules, editingModule, setEditingModule }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '' });

  useEffect(() => {
    if (editingModule) {
      setFormData({
        title: editingModule.title,
        description: editingModule.description,
        deadline: editingModule.deadline,
      });
    } else {
      setFormData({ title: '', description: '', deadline: '' });
    }
  }, [editingModule]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingModule) {
        const response = await axiosInstance.put(`/api/modules/${editingModule._id}`, formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setModules(modules.map((module) => (module._id === response.data._id ? response.data : module)));
      } else {
        const response = await axiosInstance.post('/api/modules', formData, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setModules([...modules, response.data]);
      }
      setEditingModule(null);
      setFormData({ title: '', description: '', deadline: '' });
    } catch (error) {
      alert('Failed to save module.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingModule ? 'Edit Module' : 'Add Module'}</h1>
      <input
        type="text"
        placeholder="Title"
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="text"
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <input
        type="date"
        value={formData.deadline}
        onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
        className="w-full mb-4 p-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
        {editingModule ? 'Update Module' : 'Add Module'}
      </button>
    </form>
  );
};

export default ModuleForm;
