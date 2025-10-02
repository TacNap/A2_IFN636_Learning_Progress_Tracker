import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './ModuleForm.css';

const initialFormState = {
  title: '',
  description: '',
  deadline: '',
  totalLessons: '',
};

const ModuleForm = ({ modules, setModules, editingModule, setEditingModule }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingModule) {
      setFormData({
        title: editingModule.title || '',
        description: editingModule.description || '',
        deadline: editingModule.deadline ? editingModule.deadline.split('T')[0] : '',
        totalLessons:
          typeof editingModule.totalLessons === 'number'
            ? String(editingModule.totalLessons)
            : editingModule.totalLessons || '',
      });
    } else {
      setFormData(initialFormState);
    }
    setError('');
  }, [editingModule]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateTotalLessons = (rawValue) => {
    if (rawValue === '') {
      return 0;
    }
    const numeric = Number(rawValue);
    if (Number.isNaN(numeric) || numeric < 0) {
      return null;
    }
    return Math.floor(numeric);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const totalLessons = validateTotalLessons(formData.totalLessons);
    if (totalLessons === null) {
      setError('Total lessons must be a non-negative number.');
      return;
    }

    const completedLessons = editingModule?.completedLessons ?? 0;
    if (completedLessons > totalLessons) {
      setError('Total lessons cannot be less than completed lessons.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      deadline: formData.deadline || null,
      totalLessons,
      completedLessons,
    };

    try {
      if (editingModule) {
        const response = await axiosInstance.put(
          `/api/modules/${editingModule._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        setModules((prev) =>
          (Array.isArray(prev) ? prev : []).map((module) =>
            module?._id === response.data._id ? response.data : module
          )
        );
      } else {
        const response = await axiosInstance.post('/api/modules', payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setModules((prev) => [ ...(Array.isArray(prev) ? prev : []), response.data]);
      }

      setEditingModule(null);
      setFormData(initialFormState);
    } catch (submitError) {
      const message = submitError.response?.data?.message || 'Failed to save module.';
      setError(message);
    }
  };

  const isEditing = useMemo(() => Boolean(editingModule), [editingModule]);

  return (
    <form className="module-form" onSubmit={handleSubmit}>
      <header className="module-form__header">
        <div>
          <h2 className="module-form__title">{isEditing ? 'Edit Module' : 'Add Module'}</h2>
          <p className="module-form__subtitle">
            Provide the essential details for this module so students know what to expect.
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            className="module-form__link"
            onClick={() => setEditingModule(null)}
          >
            Cancel edit
          </button>
        )}
      </header>

      {error && <div className="module-form__error">{error}</div>}

      <div className="module-form__grid">
        <div className="module-form__field">
          <label className="module-form__label" htmlFor="module-title">
            Title
          </label>
          <input
            id="module-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="module-form__input"
            placeholder="Enter module title"
            required
          />
        </div>

        <div className="module-form__field">
          <label className="module-form__label" htmlFor="module-deadline">
            Deadline
          </label>
          <input
            id="module-deadline"
            name="deadline"
            type="date"
            value={formData.deadline}
            onChange={handleChange}
            className="module-form__input"
          />
        </div>

        <div className="module-form__field module-form__field--half">
          <label className="module-form__label" htmlFor="module-total-lessons">
            Total Lessons
          </label>
          <input
            id="module-total-lessons"
            name="totalLessons"
            type="number"
            min="0"
            value={formData.totalLessons}
            onChange={handleChange}
            className="module-form__input"
            placeholder="0"
          />
        </div>

        <div className="module-form__field module-form__field--full">
          <label className="module-form__label" htmlFor="module-description">
            Description
          </label>
          <textarea
            id="module-description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="module-form__textarea"
            placeholder="Enter overview of the module"
          />
        </div>
      </div>

      <footer className="module-form__actions">
        <button type="submit" className="module-form__submit">
          {isEditing ? 'Update Module' : 'Add Module'}
        </button>
      </footer>
    </form>
  );
};

export default ModuleForm;
