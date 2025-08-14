const mongoose = require('mongoose');

const moduleSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    completed: { type: Boolean, default: false },
    deadline: { type: Date },
    totalLessons: { type: Number, default: 0, min: 0 },
    completedLessons: { type: Number, default: 0, min: 0 }
});

// Validation to ensure completedLessons doesn't exceed totalLessons
moduleSchema.pre('save', function(next) {
    if (this.completedLessons > this.totalLessons) {
        const error = new Error(`Completed lessons (${this.completedLessons}) cannot exceed total lessons (${this.totalLessons})`);
        error.name = 'ValidationError';
        return next(error);
    }
    next();
});

module.exports = mongoose.model('Module', moduleSchema);