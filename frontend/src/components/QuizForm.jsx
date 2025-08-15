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
    