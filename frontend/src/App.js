import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Module from './pages/Module';
import Quiz from '../pages/Quiz';

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
      </Routes>
    </Router>
  );
}

export default App;
