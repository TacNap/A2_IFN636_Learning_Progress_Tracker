import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Module from './pages/Module';
import ModuleNew from './pages/ModuleNew';
import SemesterNew from './pages/SemesterNew';
import Assignment from './pages/Assignment';
import AssignmentNew from './pages/AssignmentNew';
import Certificates from './pages/Certificates';
import DashboardEducator from './pages/DashboardEducator';
import DashboardStudent from './pages/DashboardStudent';

// I think i did this one wrong.. 
const EducatorRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.profileType !== 'educator') {
    return <Navigate to="/modules" replace />;
  }

  return children;
};

const StudentRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.profileType !== 'student') {
    return <Navigate to="/modules" replace />;
  }

  return children;
};

// Defines home route based on user / profile type
const HomeRoute = () => {
  const { user } = useAuth();

  // if not logged in, send to login 
  if (!user) {
    return <Login />;
  }

  const profileType = (user.profileType || '').toLowerCase();

  // if student, send to student dashboard
  if (profileType === 'student') {
    return <Navigate to="/student" replace />;
  }

  // if educator, send to educator dashboard
  if (profileType === 'educator') {
    return <Navigate to="/educator" replace />;
  }

  return <Login />;
};

function App() {
  return (
    <Router>
      {/* <Navbar /> */}
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/modules" element={<Module />} />
        <Route path="/modules/new" element={<ModuleNew />} />
        <Route path="/semester/new" element={<SemesterNew />} />
        <Route path="/assignments" element={<Assignment />} />
        <Route path="/assignments/new" element={<AssignmentNew />} />
        <Route path="/certificates" element={<Certificates />} />
        <Route
          path="/educator"
          element={(
            <EducatorRoute>
              <DashboardEducator />
            </EducatorRoute>
          )}
        />
        <Route
          path="/student"
          element={(
            <StudentRoute>
              <DashboardStudent />
            </StudentRoute>
          )}
        />
        
      </Routes>
    </Router>
  );
}

export default App;
