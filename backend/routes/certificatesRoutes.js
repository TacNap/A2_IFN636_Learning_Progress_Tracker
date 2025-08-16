const express = require('express');
const { getCertificates, createCertificate, deleteCertificate } = require('../controllers/certificateController');
const { protect } = require('../middleware/authMiddleware');
const router = express.Router();

router.route('/').get(protect, getCertificates).post(protect, createCertificate);
router.route('/:id').delete(protect, deleteCertificate);

module.exports = router;
