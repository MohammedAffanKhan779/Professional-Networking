const express = require('express');
const router = express.Router();
const resumeController = require('../controllers/resumeController');
const authMiddleware = require('../middleware/auth');

router.get('/:userId', resumeController.getResumeData);
router.post('/settings', authMiddleware, resumeController.saveResumeSettings);
router.put('/settings', authMiddleware, resumeController.updateResumeSettings);

module.exports = router;
