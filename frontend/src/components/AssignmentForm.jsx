import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const AssignmentForm = ({assignments, setAssignments, editingAssignment, setEditingAssignment}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        score: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingAssignment) {
            setFormData({
                title: editingAssignment.title || '',
                description: editingAssignment.description || '',
                score: editingAssignment.score || '0'
            });
        } else {
            setFormData({
                title: '',
                description: '',
                score: ''
            });
        }
        setError('');
    }, [editingAssignment]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const score = parseInt(formData.score, 0);

        if ( score < 0 || score > 100) {
            setError('Score must be between 0 and 100');
            return;
        }

        try {
            const submitData = { ...formData, score };
            if (editingAssignment) {
                const response = await axiosInstance.put(`/api/assignments/${editingAssignment._id}`, submitData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setAssignments(assignments.map((assignment) => (assignment._id === response.data._id ? response.data : assignment)));
            } else {
                const response = await axiosInstance.post('/api/assignments', submitData, {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setAssignments([...assignments, response.data]);
            }
            setEditingAssignment(null);
            setFormData({
                title: '',
                description: '',
                score: ''
            });
        } catch (error) {
            if (error.response?.data?.message) {
                setError(error.response.data.message);
            } else {
                setError('Failed to save assignment.');
            }
        }
    };

    return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded-3xl mb-6">
      <h1 className="text-2xl font-bold mb-4">{editingAssignment ? 'Edit Assignment' : 'Add Assignment'}</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <input
        type="text"
        placeholder="Assignment Title"
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
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Score (0-100)
        </label>
        <input
          type="number"
          placeholder="Score"
          value={formData.score}
          onChange={(e) => setFormData({ ...formData, score: e.target.value })}
          className="w-full p-2 border rounded"
          min="0"
          max="100"
        />
      </div>

      <button type="submit" className="w-full bg-[#2563eb] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#1d4ed8] transition-colors">
        {editingAssignment ? 'Update Assignment' : 'Add Assignment'}
      </button>
    </form>
  );
};

export default AssignmentForm;