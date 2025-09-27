const Assignment = require('../models/Assignment');
const assignmentOperation = require('../operations/assignmentOperation');

// get all assignments for the current user
const getAssignments = async (req, res) => {
    try {
        const assignments = await assignmentOperation.getAssignments({ userId: req.user.id });
        res.json(assignments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// create an assignment for the current user
const addAssignment = async (req, res) => {
    const { title, description, score } = req.body;
    try {
        const assignment = await assignmentOperation.createAssignment({
            userId: req.user.id,
            title,
            description,
            score
        });
        res.status(201).json(assignment);
    } catch (error) {
        // bubble validation issues as 400. everything else is a 500
        const status = error.name === 'ValidationError' ? 400 : 500;
        res.status(status).json({ message: error.message });
    }
};

// update an assignment (with ownership check)
const updateAssignment = async (req, res) => {
    const { title, description, score } = req.body;
    try {
        // make sure it exists
        const found = await Assignment.findById(req.params.id);
        if (!found) return res.status(404).json({ message: 'Assignment not found' });

        // make sure it belongs to user
        if (found.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorised to update this assignment' });
        }

        // push the actual update into the operations layer
        const result = await assignmentOperation.UpdateAssignment(req.params.id, {
            title,
            description,
            score,
        });

        res.json(result.assignment);
    } catch (error) {
        if (error.name === 'ValidationError') {
            res.status(400).json({ message: error.message });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// delete an assignment (with ownership check)
const deleteAssignment = async (req, res) => {
    try {
        // make sure it exists
        const assignment = await Assignment.findById(req.params.id);
        if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

        // make sure it belongs to user
        if (assignment.userId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorised to delete this assignment' });
        }

        // delegate the delete to the operations layer
        await assignmentOperation.deleteById(req.params.id);
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
