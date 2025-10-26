const express = require('express');
const router = express.Router();
const connectionsController = require('../controllers/connectionsController');
const authMiddleware = require('../middleware/auth');

// Get routes
router.get('/debug/auth', authMiddleware, connectionsController.debugAuth);
router.get('/suggestions', authMiddleware, connectionsController.getConnectionSuggestions);
router.get('/pending/received', authMiddleware, connectionsController.getPendingRequests);
router.get('/pending/sent', authMiddleware, connectionsController.getSentRequests);
router.get('/count/:userId', connectionsController.getConnectionsCount);
router.get('/mutual/:userId', authMiddleware, connectionsController.getMutualConnectionsCount);
router.get('/status/:userId', authMiddleware, connectionsController.getConnectionStatus);
router.get('/:userId', connectionsController.getUserConnections);

// Post/Put/Delete routes
router.post('/request', authMiddleware, connectionsController.sendConnectionRequest);
router.put('/:connectionId/accept', authMiddleware, connectionsController.acceptConnectionRequest);
router.put('/:connectionId/reject', authMiddleware, connectionsController.rejectConnectionRequest);
router.delete('/:connectionId', authMiddleware, connectionsController.removeConnection);

module.exports = router;
