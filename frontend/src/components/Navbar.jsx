import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-[#005691] text-white p-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-bold">Online Learning Progress Tracker</Link>
      <div>
        {user ? (
          <>
            <Link to="/modules" className="mr-4">Modules</Link>
            <Link to="/assignments" className="mr-4">Assignments</Link>
            <Link to="/certificates" className="mr-4">Certificates</Link>
            <Link to="/semesters/new" className="mr-4">Create Semester</Link>
            <Link to="/profile" className="mr-4">Profile</Link>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-700"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="mr-4">Login</Link>
            <Link
              to="/register"
              className="bg-green-500 px-4 py-2 rounded hover:bg-green-700"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
