import { useEffect, useState } from 'react';
import SemesterForm from '../components/SemesterForm';
import SemesterList from '../components/SemesterList';
import axiosInstance from '../axiosConfig';
import { useAuth } from '../context/AuthContext';

const SemesterNew = () => {
  const { user } = useAuth();
  const [semesters, setSemesters] = useState([]);
  const [editingSemester, setEditingSemester] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isActive = true;

    const fetchSemesters = async () => {
      if (!user?.token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/semesters', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (!isActive) return;
        setSemesters(response.data || []);
        setError('');
      } catch (fetchError) {
        if (!isActive) return;
        console.error('Failed to load semesters:', fetchError);
        setError('Failed to load semesters. Please try again later.');
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchSemesters();

    return () => {
      isActive = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-white p-6 rounded shadow text-center text-gray-600">
          <p>Please log in to manage semesters.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <SemesterForm
        semesters={semesters}
        setSemesters={setSemesters}
        editingSemester={editingSemester}
        setEditingSemester={setEditingSemester}
      />

      {loading ? (
        <div className="bg-white p-6 rounded shadow text-center text-gray-500">
          Loading semesters...
        </div>
      ) : (
        <SemesterList
          semesters={semesters}
          setSemesters={setSemesters}
          onEditSemester={setEditingSemester}
        />
      )}
    </div>
  );
};

export default SemesterNew;
