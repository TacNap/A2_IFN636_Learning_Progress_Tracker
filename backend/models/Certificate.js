const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    moduleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Module',
        required: true
    },
    moduleName: {
        type: String,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    completionDate: {
        type: Date,
        default: Date.now
    },
    totalLessons: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

certificateSchema.index({ userId: 1, moduleId:1}, { unique: true });