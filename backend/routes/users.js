const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

// Specific routes MUST come before parameterized routes
router.get('/all', userController.getAllUsers);
router.get('/search', userController.searchUsers);
router.get('/:userId', userController.getUserProfile);
router.put('/:userId', authMiddleware, userController.updateUserProfile);

module.exports = router;
