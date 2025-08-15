import { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import QuizForm from '../components/QuizForm';
import QuizList from '../components/QuizList';
import { useAuth } from '../context/AuthContext';

const Quizzes = () => {
    const { user } = useAuth();
    const [quizzes, setQuizzes] = useState([]);
    const [editingQuiz, setEditingQuiz] = useState(null);

    useEffect(() => {
        const fetchQuizzes = async () => {
            try {
                const response = await axiosInstance.get('/api/quizzes', {
                    headers: { Authorization: `Bearer ${user.token}` },
                });
                setQuizzes(response.data);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };

        fetchQuizzes();
    }, [user]);

    return (
        <div className="container mx-auto p-6">
            <QuizForm
                quizzes={quizzes}
                setQuizzes={setQuizzes}
                editingQuiz={editingQuiz}
                setEditingQuiz={setEditingQuiz}
            />
            <QuizList
                quizzes={quizzes}
                setQuizzes={setQuizzes}
                setEditingQuiz={setEditingQuiz}
            />
        </div>
    );
};

export default Quizzes;