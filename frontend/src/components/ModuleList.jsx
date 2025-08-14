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

  const handleLessonUpdate = async (moduleId, increment) => {
    try {
      const response = await axiosInstance.patch(`/api/modules/${moduleId}/lessons`, 
        { increment },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );
      
      setModules(modules.map((module) => 
        module._id === moduleId ? response.data : module
      ));
    } catch (error) {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to update lessons.');
      }
    }
  };

  const getProgressPercentage = (completed, total) => {
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  const getProgressColor = (percentage) => {
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 70) return 'bg-blue-500';
    if (percentage >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (!modules) {
    return <div>Loading modules...</div>;
  }

  return (
    <div>
      {modules.map((module) => {
        const progressPercentage = getProgressPercentage(module.completedLessons, module.totalLessons);
        const progressColor = getProgressColor(progressPercentage);
        
        return (
          <div key={module._id} className="bg-gray-100 p-4 mb-4 rounded shadow">
            <div className="flex justify-between items-start mb-2">
              <h2 className="font-bold text-lg">{module.title}</h2>
              <span className={`px-2 py-1 rounded text-white text-sm ${progressColor}`}>
                {progressPercentage}% Complete
              </span>
            </div>
            
            <p className="text-gray-700 mb-2">{module.description}</p>
            
            <p className="text-sm text-gray-500 mb-2">
              Deadline: {new Date(module.deadline).toLocaleDateString()}
            </p>
            
            {/* Lessons Section */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">
                  Lessons: {module.completedLessons || 0} / {module.totalLessons || 0}
                </span>
                
                {/* +/- Buttons */}
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleLessonUpdate(module._id, -1)}
                    disabled={!module.completedLessons || module.completedLessons === 0}
                    className="bg-red-500 text-white w-8 h-8 rounded-full hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    -
                  </button>
                  
                  <span className="px-3 py-1 bg-gray-200 rounded">
                    {module.completedLessons || 0}
                  </span>
                  
                  <button
                    onClick={() => handleLessonUpdate(module._id, 1)}
                    disabled={module.completedLessons >= module.totalLessons}
                    className="bg-green-500 text-white w-8 h-8 rounded-full hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Progress Bar */}
              {module.totalLessons > 0 && (
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${progressColor}`}
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => setEditingModule(module)}
                className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(module._id)}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ModuleList;