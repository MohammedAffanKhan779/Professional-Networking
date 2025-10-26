const express = require('express');
const router = express.Router();
const skillsController = require('../controllers/skillsController');
const authMiddleware = require('../middleware/auth');

router.get('/user/:userId', skillsController.getUserSkills);
router.post('/', authMiddleware, skillsController.createSkill);
router.put('/:skillId', authMiddleware, skillsController.updateSkill);
router.delete('/:skillId', authMiddleware, skillsController.deleteSkill);

module.exports = router;
