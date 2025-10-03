import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import Navbar from "../components/Navbar";
import { useAuth } from '../context/AuthContext';

const DashboardEducator = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user?.token) {
        setError('You must be logged in to view students.');
        setLoading(false);
        return;
      }

      if (user.profileType !== 'educator') {
        setError('Access restricted to educator accounts.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await axiosInstance.get('/api/educator/students', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setStudents(response.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch students');
        console.error('Error fetching students:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  return (
    <div>
      <Navbar />
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Educator Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-semibold mb-4">Students</h2>
          
          {loading && (
            <div className="text-center py-4">
              <p className="text-gray-600">Loading students...</p>
            </div>
          )}
          
          {error && !loading && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {!loading && !error && students.length === 0 && (
            <p className="text-gray-600">No students found.</p>
          )}
          
          {!loading && !error && students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student.email} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {student.name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {student.email}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              <div className="mt-4 text-sm text-gray-600">
                Total students: {students.length}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardEducator;
