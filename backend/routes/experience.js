const express = require('express');
const router = express.Router();
const experienceController = require('../controllers/experienceController');
const authMiddleware = require('../middleware/auth');

router.get('/user/:userId', experienceController.getUserExperience);
router.get('/:experienceId', experienceController.getExperience);
router.post('/', authMiddleware, experienceController.createExperience);
router.put('/:experienceId', authMiddleware, experienceController.updateExperience);
router.delete('/:experienceId', authMiddleware, experienceController.deleteExperience);

module.exports = router;
