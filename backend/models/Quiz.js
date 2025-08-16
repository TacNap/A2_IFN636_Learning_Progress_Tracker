const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: {type: String },
    score: { type: Number, default: 0, min: 0, max: 100 }
});

module.exports = mongoose.model('Quiz', quizSchema);