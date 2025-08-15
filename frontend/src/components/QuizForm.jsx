import { useState, useEffect } from "react";
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const QuizForm = ({quizzes, setQuizzes, editingQuiz, setEditingQuiz}) => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        score: ''
    });
    const [error, setError] = useState('');

    useEffect(() => {
        if (editingQuiz) {
            setFormData({
                title: editingQuiz.title || '',
                description: editingQuiz.description || '',
                score: editingQuiz.score || '0'
            });
        } else {
            setFormData({
                title: '',
                description: '',
                score: ''
            });
        }
        setError('');
    }, [editingQuiz]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const score = parseInt(formData.score, 0);

        if ( score < 0 || score > 100) {
            setError('Score must be between 0 and 100');
            return;
        }

        try {
            const submitData = { ...formData, score };
            if (editingQuiz) {
                // Update existing quiz
                const updatedQuizzes = quizzes.map((quiz) =>
                    quiz.id === editingQuiz.id ? { ...quiz, ...formData, score } : quiz
                );
                setQuizzes(updatedQuizzes);
                setEditingQuiz(null);
            } else {
                // Create new quiz
                const newQuiz = { id: Date.now(), ...formData, score };
                setQuizzes([...quizzes, newQuiz]);
            }

            // Clear form
            setFormData({
                title: '',
                description: '',
                score: ''
            });
        } catch (err) {
            setError('Failed to save quiz');
        }
    };