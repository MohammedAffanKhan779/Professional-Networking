const express = require('express');
const router = express.Router();
const educationController = require('../controllers/educationController');
const authMiddleware = require('../middleware/auth');

router.get('/user/:userId', educationController.getUserEducation);
router.post('/', authMiddleware, educationController.createEducation);
router.put('/:educationId', authMiddleware, educationController.updateEducation);
router.delete('/:educationId', authMiddleware, educationController.deleteEducation);

module.exports = router;
