const Quiz = require('../models/Quiz');

const getQuizzes = async (req, res) => {
    try {
        const quizzes = await Quiz.find({ userId: req.user.id });
        res.json(quizzes);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addQuiz = async (req, res) => {
    const { title, description, score } = req.body;
    try {
        const quiz = await Quiz.create({ 
            userId: req.user.id,
            title,
            description,
            score: score || 0
        });
        res.status(201).json(quiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateQuiz = async (req, res) => {
    const { title, description, score } = req.body;
    try {
        const quiz = await Quiz.findById( req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
        
        quiz.title = title || quiz.title;
        quiz.description = description || quiz.description;

        if( score !== undefined) {
            if(score < 0 || score > 100){
                return res.status(400).json({ message: 'Score must be between 0 and 100' });
            }
            quiz.score = score;
        }
        
        const updatedQuiz = await quiz.save();
        res.json(updatedQuiz);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        await Quiz.findByIdAndDelete(req.params.id);
        res.json({ message: 'Quiz deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getQuizzes,
    addQuiz,
    updateQuiz,
    deleteQuiz
};