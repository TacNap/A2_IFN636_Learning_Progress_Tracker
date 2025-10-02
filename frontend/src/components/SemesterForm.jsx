import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const defaultFormState = {
  number: '',
  startDate: '',
  endDate: '',
  modules: [],
};

const SemesterForm = ({
  semesters,
  setSemesters,
  editingSemester,
  setEditingSemester,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(defaultFormState);
  const [availableModules, setAvailableModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      if (!user?.token) {
        setAvailableModules([]);
        setModulesLoading(false);
        return;
      }

      setModulesLoading(true);
      try {
        const response = await axiosInstance.get('/api/modules', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAvailableModules(response.data || []);
      } catch (fetchError) {
        setError('Failed to load modules. Please refresh and try again.');
      } finally {
        setModulesLoading(false);
      }
    };

    fetchModules();
  }, [user]);

  useEffect(() => {
    if (editingSemester) {
      setFormData({
        number: editingSemester.number?.toString() || '',
        startDate: editingSemester.startDate
          ? new Date(editingSemester.startDate).toISOString().split('T')[0]
          : '',
        endDate: editingSemester.endDate
          ? new Date(editingSemester.endDate).toISOString().split('T')[0]
          : '',
        modules: (editingSemester.modules || []).map((module) =>
          typeof module === 'object' ? module._id : module
        ),
      });
      setError('');
    } else {
      setFormData(defaultFormState);
      setError('');
    }
  }, [editingSemester]);

  const sortedModules = useMemo(() => {
    return [...availableModules].sort((a, b) => {
      const aTitle = a.title || '';
      const bTitle = b.title || '';
      return aTitle.localeCompare(bTitle, undefined, { sensitivity: 'base' });
    });
  }, [availableModules]);

  const resetForm = () => {
    setFormData(defaultFormState);
    setEditingSemester(null);
    setError('');
  };

  const handleModulesChange = (event) => {
    const selected = Array.from(event.target.selectedOptions).map((option) => option.value);

    if (selected.length > 4) {
      setError('You can select at most 4 modules per semester.');
      return;
    }

    setError('');
    setFormData((prev) => ({ ...prev, modules: selected }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const parsedNumber = Number(formData.number);
    if (!Number.isInteger(parsedNumber) || parsedNumber < 1) {
      setError('Semester number must be a positive whole number.');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      setError('Please provide both start and end dates.');
      return;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      setError('Start date must be before end date.');
      return;
    }

    if ((formData.modules || []).length > 4) {
      setError('You can select at most 4 modules per semester.');
      return;
    }

    const payload = {
      number: parsedNumber,
      startDate: formData.startDate,
      endDate: formData.endDate,
      modules: formData.modules,
    };

    setIsSubmitting(true);

    try {
      if (editingSemester) {
        const response = await axiosInstance.put(
          `/api/semesters/${editingSemester._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        setSemesters(
          semesters.map((semester) =>
            semester._id === response.data._id ? response.data : semester
          )
        );
      } else {
        const response = await axiosInstance.post('/api/semesters', payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setSemesters([...semesters, response.data]);
      }

      resetForm();
    } catch (submitError) {
      if (submitError.response?.data?.message) {
        setError(submitError.response.data.message);
      } else {
        setError('Failed to save semester.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded mb-6">
      <h1 className="text-2xl font-bold mb-4">
        {editingSemester ? 'Edit Semester' : 'Add Semester'}
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Semester Number
          </label>
          <input
            type="number"
            min="1"
            value={formData.number}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, number: event.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={formData.startDate}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, startDate: event.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={formData.endDate}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, endDate: event.target.value }))
            }
            className="w-full p-2 border rounded"
            required
          />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Modules (Select up to 4)
        </label>
        {modulesLoading ? (
          <p className="text-sm text-gray-500">Loading modules...</p>
        ) : sortedModules.length === 0 ? (
          <p className="text-sm text-gray-500">
            No modules available yet. Create a module first to link it to a semester.
          </p>
        ) : (
          <select
            multiple
            value={formData.modules}
            onChange={handleModulesChange}
            className="w-full p-2 border rounded h-32"
            aria-label="Select modules for this semester"
          >
            {sortedModules.map((module) => (
              <option key={module._id} value={module._id}>
                {module.title || 'Untitled Module'}
              </option>
            ))}
          </select>
        )}
        {sortedModules.length > 0 && (
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl (Windows) or Command (Mac) to select multiple modules.
          </p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3">
        {editingSemester && (
          <button
            type="button"
            onClick={resetForm}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="bg-[#005691] text-white px-4 py-2 rounded hover:bg-[#004080] disabled:opacity-60"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? editingSemester
              ? 'Updating...'
              : 'Saving...'
            : editingSemester
            ? 'Update Semester'
            : 'Add Semester'}
        </button>
      </div>
    </form>
  );
};

export default SemesterForm;
