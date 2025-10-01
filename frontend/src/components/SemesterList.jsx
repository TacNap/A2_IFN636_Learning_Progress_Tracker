import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const SemesterList = ({ semesters, setSemesters, setEditingSemester }) => {
  const { user } = useAuth();
  const [modulesById, setModulesById] = useState({});
  const [modulesLoading, setModulesLoading] = useState(true);
  const [moduleError, setModuleError] = useState('');

  useEffect(() => {
    if (!user?.token) {
      setModulesById({});
      setModulesLoading(false);
      return;
    }

    let isActive = true;

    const fetchModules = async () => {
      setModulesLoading(true);
      try {
        const response = await axiosInstance.get('/api/modules', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!isActive) return;
        const map = (response.data || []).reduce((acc, module) => {
          if (module?._id) {
            acc[module._id] = module;
          }
          return acc;
        }, {});
        setModulesById(map);
        setModuleError('');
      } catch (error) {
        if (!isActive) return;
        console.error('Failed to load modules:', error);
        setModuleError('Failed to load module details. Some modules may not display correctly.');
      } finally {
        if (isActive) {
          setModulesLoading(false);
        }
      }
    };

    fetchModules();

    return () => {
      isActive = false;
    };
  }, [user]);

  const sortedSemesters = useMemo(() => {
    if (!Array.isArray(semesters)) return [];
    return [...semesters].sort((a, b) => {
      const aNumber = Number(a?.number) || 0;
      const bNumber = Number(b?.number) || 0;
      return aNumber - bNumber;
    });
  }, [semesters]);

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString();
  };

  const normaliseModuleEntry = (moduleRef) => {
    if (moduleRef && typeof moduleRef === 'object') {
      return moduleRef;
    }
    return modulesById[moduleRef] || null;
  };

  const handleDelete = async (semesterId) => {
    if (!semesterId) return;

    try {
      await axiosInstance.delete(`/api/semesters/${semesterId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSemesters(semesters.filter((semester) => semester._id !== semesterId));
    } catch (error) {
      console.error('Failed to delete semester:', error);
      alert('Failed to delete semester. Please try again.');
    }
  };

  if (!semesters || semesters.length === 0) {
    return (
      <div className="bg-white p-6 rounded shadow text-center text-gray-500">
        <p>No semesters created yet. Use the form above to add your first semester.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {moduleError && (
        <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-3 rounded">
          {moduleError}
        </div>
      )}

      {sortedSemesters.map((semester) => {
        const moduleEntries = (semester.modules || []).map((moduleRef) =>
          normaliseModuleEntry(moduleRef)
        );

        return (
          <div key={semester._id} className="bg-white p-6 rounded shadow">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Semester {semester.number || '—'}
                </h2>
                <p className="text-sm text-gray-500">
                  {formatDate(semester.startDate)} – {formatDate(semester.endDate)}
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setEditingSemester(semester)}
                  className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(semester._id)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Modules</h3>
              {modulesLoading ? (
                <p className="text-sm text-gray-500">Loading modules...</p>
              ) : moduleEntries.length === 0 ? (
                <p className="text-sm text-gray-500">No modules linked to this semester yet.</p>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {moduleEntries.map((module, index) => (
                    <div
                      key={module?._id || index}
                      className="px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg min-w-[180px]"
                    >
                      <p className="text-sm font-semibold text-blue-900">
                        {module?.title || 'Module unavailable'}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Lessons: {(module?.completedLessons ?? 0)} / {(module?.totalLessons ?? 0)}
                      </p>
                      {module?.deadline && (
                        <p className="text-xs text-blue-500 mt-1">
                          Deadline: {formatDate(module.deadline)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SemesterList;
