
const express = require('express');
const { getModules, addModule, updateModule, deleteModule } = require('../controllers/moduleController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getModules).post(protect, addModule);
router.route('/:id').put(protect, updateModule).delete(protect, deleteModule);

module.exports = router;
