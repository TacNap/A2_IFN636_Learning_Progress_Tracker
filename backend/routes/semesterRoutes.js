const express = require('express');
const {
  getSemesters,
  addSemester,
  updateSemester,
  deleteSemester,
} = require('../controllers/semesterController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getSemesters)
  .post(protect, addSemester);

router.route('/:id')
  .put(protect, updateSemester)
  .delete(protect, deleteSemester);

module.exports = router;
