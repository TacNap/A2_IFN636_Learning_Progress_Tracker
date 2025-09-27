const express = require('express');
const { getAssignments, addAssignment, updateAssignment, deleteAssignment } = require('../controllers/assignmentController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getAssignments).post(protect, addAssignment);
router.route('/:id').put(protect, updateAssignment).delete(protect, deleteAssignment);  

module.exports = router;
