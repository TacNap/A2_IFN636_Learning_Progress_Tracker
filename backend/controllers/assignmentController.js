const Assignment = require('../models/Assignment');

const getAssignments = async (req, res) => {
    try {
        const assignments = await Assignment.find({ userId: req.user.id });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addAssignment = async (req, res) => {
    const { title, description, score } = req.body;
    try {
        const assignment = await Assignment.create({ 
            userId: req.user.id,
            title,
            description,
            score: score || 0
        });
        res.status(201).json(assignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateAssignment = async (req, res) => {
    const { title, description, score } = req.body;
    try {
        const assignment = await Assignment.findById( req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });
        
        assignment.title = title || assignment.title;
        assignment.description = description || assignment.description;

        if( score !== undefined) {
            if(score < 0 || score > 100){
                return res.status(400).json({ message: 'Score must be between 0 and 100' });
            }
            assignment.score = score;
        }
        
        const updatedAssignment = await assignment.save();
        res.json(updatedAssignment);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteAssignment = async (req, res) => {
    try {
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        await Assignment.findByIdAndDelete(req.params.id);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAssignments,
    addAssignment,
    updateAssignment,
    deleteAssignment
};