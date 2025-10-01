import { useAuth } from '../context/AuthContext';

const DashboardEducator = () => {
  const { user } = useAuth();

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">Educator Dashboard</h1>
      <p className="text-gray-700">
        Educator specific content will go here...
      </p>
    </div>
  );
};

export default DashboardEducator;
