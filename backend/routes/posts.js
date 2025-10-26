const express = require('express');
const router = express.Router();
const postsController = require('../controllers/postsController');
const authMiddleware = require('../middleware/auth');

router.get('/', postsController.getAllPosts);
router.get('/user/:userId', postsController.getUserPosts);
router.get('/:postId', postsController.getPost);
router.post('/', authMiddleware, postsController.createPost);
router.put('/:postId', authMiddleware, postsController.updatePost);
router.delete('/:postId', authMiddleware, postsController.deletePost);

// Likes and comments
router.post('/:postId/like', authMiddleware, postsController.togglePostLike);
router.get('/:postId/comments', postsController.getPostComments);
router.post('/:postId/comments', authMiddleware, postsController.addComment);
router.delete('/comments/:commentId', authMiddleware, postsController.deleteComment);
router.post('/comments/:commentId/like', authMiddleware, postsController.toggleCommentLike);

// User activity
router.get('/activity/me', authMiddleware, postsController.getUserActivity);
router.get('/activity/:userId', postsController.getUserActivity);

module.exports = router;
