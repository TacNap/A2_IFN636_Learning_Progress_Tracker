import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './SemesterForm.css';

const defaultFormState = {
  number: '',
  startDate: '',
  endDate: '',
  modules: [],
};

const SemesterForm = ({ setSemesters, editingSemester, setEditingSemester }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(defaultFormState);
  const [availableModules, setAvailableModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesError, setModulesError] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchModules = async () => {
      if (!user?.token) {
        setAvailableModules([]);
        return;
      }

      setModulesLoading(true);
      try {
        const response = await axiosInstance.get('/api/modules', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setAvailableModules(Array.isArray(response.data) ? response.data : []);
        setModulesError('');
      } catch (fetchError) {
        console.error('Failed to load modules:', fetchError);
        setModulesError('Failed to load modules. Please refresh and try again.');
      } finally {
        setModulesLoading(false);
      }
    };

    fetchModules();
  }, [user]);

  useEffect(() => {
    if (!editingSemester) {
      setFormData(defaultFormState);
      setError('');
      return;
    }

    setFormData({
      number: editingSemester.number?.toString() || '',
      startDate: editingSemester.startDate
        ? new Date(editingSemester.startDate).toISOString().split('T')[0]
        : '',
      endDate: editingSemester.endDate
        ? new Date(editingSemester.endDate).toISOString().split('T')[0]
        : '',
      modules: (editingSemester.modules || [])
        .map((module) => (typeof module === 'object' ? module?._id : module))
        .filter(Boolean),
    });
    setError('');
  }, [editingSemester]);

  const sortedModules = useMemo(() => {
    return [...availableModules].sort((a, b) => {
      const aTitle = a?.title || '';
      const bTitle = b?.title || '';
      return aTitle.localeCompare(bTitle, undefined, { sensitivity: 'base' });
    });
  }, [availableModules]);

  const isEditing = useMemo(() => Boolean(editingSemester), [editingSemester]);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  const handleCancelEdit = () => {
    if (typeof setEditingSemester === 'function') {
      setEditingSemester(null);
    }
    setFormData(defaultFormState);
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!user?.token) {
      setError('You need to be signed in to manage semesters.');
      return;
    }

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
      if (isEditing) {
        const response = await axiosInstance.put(
          `/api/semesters/${editingSemester._id}`,
          payload,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setSemesters((prev) =>
          (Array.isArray(prev) ? prev : []).map((semester) =>
            semester?._id === response.data._id ? response.data : semester
          )
        );
      } else {
        const response = await axiosInstance.post('/api/semesters', payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        setSemesters((prev) => [
          ...(Array.isArray(prev) ? prev : []),
          response.data,
        ]);
      }

      if (typeof setEditingSemester === 'function') {
        setEditingSemester(null);
      }
      setFormData(defaultFormState);
    } catch (submitError) {
      const message =
        submitError.response?.data?.message || 'Failed to save semester. Please try again.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="semester-form" onSubmit={handleSubmit}>
      <header className="semester-form__header">
        <div>
          <h2 className="semester-form__title">
            {isEditing ? 'Edit Semester' : 'Add Semester'}
          </h2>
          <p className="semester-form__subtitle">
            Set the semester timeline and assign the modules your students will follow.
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            className="semester-form__link"
            onClick={handleCancelEdit}
          >
            Cancel edit
          </button>
        )}
      </header>

      {error && <div className="semester-form__error">{error}</div>}
      {modulesError && (
        <div className="semester-form__alert" role="status">
          {modulesError}
        </div>
      )}

      <div className="semester-form__grid">
        <div className="semester-form__field">
          <label className="semester-form__label" htmlFor="semester-number">
            Semester number
          </label>
          <input
            id="semester-number"
            name="number"
            type="number"
            min="1"
            value={formData.number}
            onChange={handleFieldChange}
            className="semester-form__input"
            placeholder="e.g. 1"
            required
          />
        </div>

        <div className="semester-form__field">
          <label className="semester-form__label" htmlFor="semester-start">
            Start date
          </label>
          <input
            id="semester-start"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleFieldChange}
            className="semester-form__input"
            required
          />
        </div>

        <div className="semester-form__field">
          <label className="semester-form__label" htmlFor="semester-end">
            End date
          </label>
          <input
            id="semester-end"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleFieldChange}
            className="semester-form__input"
            required
          />
        </div>

        <div className="semester-form__field semester-form__field--full">
          <label className="semester-form__label" htmlFor="semester-modules">
            Modules (select up to 4)
          </label>
          {modulesLoading ? (
            <p className="semester-form__hint">Loading modules...</p>
          ) : sortedModules.length === 0 ? (
            <p className="semester-form__hint">
              No modules are available yet. Create a module first to link it here.
            </p>
          ) : (
            <>
              <select
                id="semester-modules"
                multiple
                value={formData.modules}
                onChange={handleModulesChange}
                className="semester-form__select"
                aria-label="Select modules for this semester"
              >
                {sortedModules.map((module) => (
                  <option key={module._id} value={module._id}>
                    {module.title || 'Untitled module'}
                  </option>
                ))}
              </select>
              <p className="semester-form__hint">
                Hold Ctrl (Windows) or Command (Mac) to select multiple modules.
              </p>
            </>
          )}
        </div>
      </div>

      <footer className="semester-form__actions">
        <button
          type="submit"
          className="semester-form__submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? (isEditing ? 'Updating...' : 'Saving...') : isEditing ? 'Update Semester' : 'Add Semester'}
        </button>
      </footer>
    </form>
  );
};

export default SemesterForm;
