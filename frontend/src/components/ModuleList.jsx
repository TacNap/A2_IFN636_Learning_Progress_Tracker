import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const ModuleList = ({ modules, setModules, setEditingModule }) => {
  const { user } = useAuth();

  const handleDelete = async (moduleId) => {
    try {
      await axiosInstance.delete(`/api/modules/${moduleId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setModules(modules.filter((module) => module._id !== moduleId));
    } catch (error) {
      alert('Failed to delete module.');
    }
  };

  // Add safety check for modules
  if (!modules) {
    return <div>Loading modules...</div>;
  }

  return (
    <div>
      {modules.map((module) => (
        <div key={module._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{module.title}</h2>
          <p>{module.description}</p>
          <p className="text-sm text-gray-500">
            Deadline: {new Date(module.deadline).toLocaleDateString()}
          </p>
          <div className="mt-2">
            <button
              onClick={() => setEditingModule(module)}
              className="mr-2 bg-yellow-500 text-white px-4 py-2 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(module._id)}
              className="bg-red-500 text-white px-4 py-2 rounded"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ModuleList;