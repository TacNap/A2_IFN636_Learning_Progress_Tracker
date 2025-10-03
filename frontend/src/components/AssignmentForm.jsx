import { useEffect, useMemo, useState } from "react";
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';
import './AssignmentForm.css';

const initialFormState = {
  title: '',
  description: '',
  score: '',
};

const AssignmentForm = ({
  assignments,
  setAssignments,
  editingAssignment,
  setEditingAssignment,
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState(initialFormState);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingAssignment) {
      setFormData({
        title: editingAssignment.title || '',
        description: editingAssignment.description || '',
        score:
          typeof editingAssignment.score === 'number'
            ? String(editingAssignment.score)
            : editingAssignment.score || '',
      });
    } else {
      setFormData(initialFormState);
    }
    setError('');
  }, [editingAssignment]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validateScore = (rawValue) => {
    if (rawValue === '') {
      return '';
    }

    const numeric = Number(rawValue);
    if (Number.isNaN(numeric) || numeric < 0 || numeric > 100) {
      return null;
    }

    return Math.floor(numeric);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    if (!user?.token) {
      setError('You need to be signed in to manage assignments.');
      return;
    }

    const validatedScore = validateScore(formData.score);
    if (validatedScore === null) {
      setError('Score must be a number between 0 and 100.');
      return;
    }

    if (validatedScore === '') {
      setError('Score is required.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      score: validatedScore,
    };

    try {
      if (editingAssignment?._id) {
        const response = await axiosInstance.put(
          `/api/assignments/${editingAssignment._id}`,
          payload,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        if (typeof setAssignments === 'function') {
          setAssignments((prev) =>
            (Array.isArray(prev) ? prev : []).map((assignment) =>
              assignment?._id === response.data?._id ? response.data : assignment
            )
          );
        }
      } else {
        const response = await axiosInstance.post('/api/assignments', payload, {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (typeof setAssignments === 'function') {
          setAssignments((prev) => [ ...(Array.isArray(prev) ? prev : []), response.data ]);
        }
      }

      setEditingAssignment?.(null);
      setFormData(initialFormState);
    } catch (submitError) {
      const message =
        submitError.response?.data?.message || 'Failed to save assignment. Please try again.';
      setError(message);
    }
  };

  const isEditing = useMemo(() => Boolean(editingAssignment), [editingAssignment]);

  return (
    <form className="assignment-form" onSubmit={handleSubmit}>
      <header className="assignment-form__header">
        <div>
          <h2 className="assignment-form__title">
            {isEditing ? 'Edit Assignment' : 'Add Assignment'}
          </h2>
          <p className="assignment-form__subtitle">
            Define the assignment details and scoring so learners understand the expectations.
          </p>
        </div>
        {isEditing && (
          <button
            type="button"
            className="assignment-form__link"
            onClick={() => setEditingAssignment?.(null)}
          >
            Cancel edit
          </button>
        )}
      </header>

      {error && <div className="assignment-form__error">{error}</div>}

      <div className="assignment-form__grid">
        <div className="assignment-form__field assignment-form__field--full">
          <label className="assignment-form__label" htmlFor="assignment-title">
            Title
          </label>
          <input
            id="assignment-title"
            name="title"
            type="text"
            value={formData.title}
            onChange={handleChange}
            className="assignment-form__input"
            placeholder="Enter assignment title"
            required
          />
        </div>

        <div className="assignment-form__field assignment-form__field--full">
          <label className="assignment-form__label" htmlFor="assignment-description">
            Description
          </label>
          <textarea
            id="assignment-description"
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            className="assignment-form__textarea"
            placeholder="Outline the assignment requirements"
          />
        </div>

        <div className="assignment-form__field assignment-form__field--half">
          <label className="assignment-form__label" htmlFor="assignment-score">
            Score (0-100)
          </label>
          <input
            id="assignment-score"
            name="score"
            type="number"
            min="0"
            max="100"
            value={formData.score}
            onChange={handleChange}
            className="assignment-form__input"
            placeholder="0"
            required
          />
        </div>
      </div>

      <footer className="assignment-form__actions">
        <button type="submit" className="assignment-form__submit">
          {isEditing ? 'Update Assignment' : 'Add Assignment'}
        </button>
      </footer>
    </form>
  );
};

export default AssignmentForm;
