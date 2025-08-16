const express = require('express');
const { getQuizzes, addQuiz, updateQuiz, deleteQuiz } = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getQuizzes).post(protect, addQuiz);
router.route('/:id').put(protect, updateQuiz).delete(protect, deleteQuiz);  

module.exports = router;
