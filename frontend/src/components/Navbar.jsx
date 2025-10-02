import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isEducator = user?.profileType === 'educator';
  const isStudent = user?.profileType === 'student';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="p-4 flex justify-between items-center">
      <Link to="/" className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#005691] to-[#0f1c77] text-lg font-semibold text-white shadow-lg">
            LP
          </div>
        </Link>
      <Link to="/" className="text-2xl font-bold">Online Learning Progress Tracker</Link>
      <div>
        {user ? (
          <>
            <Link to="/moduletesting" className="mr-4">ModuleTest</Link>
            <Link to="/testing" className="mr-4">Testing</Link>
            <Link to="/modules" className="mr-4">Modules</Link>
            <Link to="/assignments" className="mr-4">Assignments</Link>
            <Link to="/certificates" className="mr-4">Certificates</Link>
            {isEducator && (
              <Link to="/educator" className="mr-4">Educator Hub</Link>
            )}
            {isStudent && (
              <Link to="/student" className="mr-4">Student Hub</Link>
            )}
            <Link to="/profile" className="mr-4">Profile</Link>
            
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-700"
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
