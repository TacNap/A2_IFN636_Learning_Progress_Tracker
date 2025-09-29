const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    number: {
        type: Number,
        required: true,
        min: 1,
        validate: {
            validator: Number.isInteger,
            message: 'Semester number must be a whole integer.'
        }
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    modules: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Module'
        }],
        default: []
    }
}, {
    timestamps: true
});

semesterSchema.index({ userId: 1, number: 1 }, { unique: true });

semesterSchema.path('modules').validate(function(modules) {
    return !modules || modules.length <= 4;
}, 'A semester can include at most 4 modules.');

semesterSchema.pre('validate', function(next) {
    if (this.startDate && this.endDate && this.startDate > this.endDate) {
        const error = new Error('Semester startDate must be before endDate.');
        error.name = 'ValidationError';
        return next(error);
    }
    next();
});

module.exports = mongoose.model('Semester', semesterSchema);
