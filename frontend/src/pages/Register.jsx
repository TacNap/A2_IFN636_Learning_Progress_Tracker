import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    isEducator: false,
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        profileType: formData.isEducator ? 'educator' : 'student',
      };

      await axiosInstance.post('/api/auth/register', payload);
      alert('Registration successful. Please log in.');
      navigate('/login');
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  const handleChange = (key) => (event) => {
    const value = key === 'isEducator' ? event.target.checked : event.target.value;
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <form onSubmit={handleSubmit} className="bg-white p-6 shadow-md rounded">
        <h1 className="text-2xl font-bold mb-4 text-center">Register</h1>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange('name')}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange('email')}
          className="w-full mb-4 p-2 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange('password')}
          className="w-full mb-4 p-2 border rounded"
        />
        <label className="flex items-center mb-4 text-sm">
          <input
            type="checkbox"
            checked={formData.isEducator}
            onChange={handleChange('isEducator')}
            className="mr-2"
          />
          Educator?
        </label>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded">
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
