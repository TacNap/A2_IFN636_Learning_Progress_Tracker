import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Module from './pages/Module';
import Assignment from './pages/Assignment';
import Certificates from './pages/Certificates';
import DashboardEducator from './pages/DashboardEducator';
import DashboardStudent from './pages/DashboardStudent';

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

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/modules" element={<Module />} />
        <Route path="/assignments" element={<Assignment />} />
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
