const express = require('express');
const router = express.Router();
const projectsController = require('../controllers/projectsController');
const authMiddleware = require('../middleware/auth');

// All routes require authentication
router.get('/user/:userId', projectsController.getUserProjects);
router.post('/', authMiddleware, projectsController.createProject);
router.put('/:projectId', authMiddleware, projectsController.updateProject);
router.delete('/:projectId', authMiddleware, projectsController.deleteProject);

module.exports = router;
