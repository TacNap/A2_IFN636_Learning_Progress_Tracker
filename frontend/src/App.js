import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Module from './pages/Module';
import Quiz from './pages/Quiz';
import Certificates from './pages/Certificates';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/modules" element={<Module />} />
        <Route path="/quizzes" element={<Quiz />} />
        <Route path="/certificates" element={<Certificates />} />
      </Routes>
    </Router>
  );
}

export default App;
