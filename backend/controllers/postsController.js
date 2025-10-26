const db = require('../config/database');

// Get all posts (feed) - Exclude current user's posts
exports.getAllPosts = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;
    const userId = req.userId || req.query.userId; // Support both authenticated and query param
    
    let query = `SELECT p.*, u.F_NAME, u.L_NAME, u.PROFILE_PIC_URL, u.HEADLINE,
        p.CREATED_AT as createdAt`;
    
    // Add isLiked field if user is authenticated
    if (userId) {
      query += `,
        EXISTS(
          SELECT 1 FROM POST_LIKES pl 
          WHERE pl.POST_ID = p.POST_ID AND pl.USER_ID = ?
        ) as isLiked`;
    }
    
    query += `
       FROM POSTS p
       JOIN USERS u ON p.USER_ID = u.USER_ID
       WHERE u.STATUS = 'active'`;
    
    // Exclude current user's posts from feed
    if (userId) {
      query += ` AND p.USER_ID != ?`;
    }
    
    query += `
       ORDER BY p.CREATED_AT DESC
       LIMIT ? OFFSET ?`;
    
    const params = userId 
      ? [userId, userId, parseInt(limit), parseInt(offset)]
      : [parseInt(limit), parseInt(offset)];
    
    const [posts] = await db.query(query, params);
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's posts
exports.getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [posts] = await db.query(
      `SELECT p.*, u.F_NAME, u.L_NAME, u.PROFILE_PIC_URL,
        p.CREATED_AT as createdAt
       FROM POSTS p
       JOIN USERS u ON p.USER_ID = u.USER_ID
       WHERE p.USER_ID = ?
       ORDER BY p.CREATED_AT DESC`,
      [userId]
    );
    
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single post
exports.getPost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const [posts] = await db.query(
      `SELECT p.*, u.F_NAME, u.L_NAME, u.PROFILE_PIC_URL, u.HEADLINE,
        p.CREATED_AT as createdAt
       FROM POSTS p
       JOIN USERS u ON p.USER_ID = u.USER_ID
       WHERE p.POST_ID = ?`,
      [postId]
    );
    
    if (posts.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    res.json(posts[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create post
exports.createPost = async (req, res) => {
  try {
    const { title, content, mediaUrl, postType } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO POSTS (USER_ID, TITLE, CONTENT, MEDIA_URL, POST_TYPE)
      VALUES (?, ?, ?, ?, ?)`,
      [req.userId, title || null, content, mediaUrl || null, postType || 'text']
    );
    
    res.status(201).json({
      message: 'Post created successfully',
      postId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update post
exports.updatePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { title, content, mediaUrl } = req.body;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM POSTS WHERE POST_ID = ?',
      [postId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      `UPDATE POSTS SET TITLE = ?, CONTENT = ?, MEDIA_URL = ?, 
      UPDATED_AT = NOW() WHERE POST_ID = ?`,
      [title, content, mediaUrl, postId]
    );
    
    res.json({ message: 'Post updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete post
exports.deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM POSTS WHERE POST_ID = ?',
      [postId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query('DELETE FROM POSTS WHERE POST_ID = ?', [postId]);
    
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like/Unlike post
exports.togglePostLike = async (req, res) => {
  try {
    const { postId } = req.params;
    
    // Check if already liked
    const [existing] = await db.query(
      'SELECT * FROM POST_LIKES WHERE POST_ID = ? AND USER_ID = ?',
      [postId, req.userId]
    );
    
    if (existing.length > 0) {
      // Unlike - trigger will handle count decrement
      await db.query(
        'DELETE FROM POST_LIKES WHERE POST_ID = ? AND USER_ID = ?',
        [postId, req.userId]
      );
      
      res.json({ message: 'Post unliked', liked: false });
    } else {
      // Like - trigger will handle count increment
      await db.query(
        'INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (?, ?)',
        [postId, req.userId]
      );
      
      res.json({ message: 'Post liked', liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get comments for a post
exports.getPostComments = async (req, res) => {
  try {
    const { postId } = req.params;
    
    const [comments] = await db.query(
      `SELECT c.*, u.F_NAME, u.L_NAME, u.PROFILE_PIC_URL
       FROM COMMENTS c
       JOIN USERS u ON c.USER_ID = u.USER_ID
       WHERE c.POST_ID = ?
       ORDER BY c.CREATED_AT DESC`,
      [postId]
    );
    
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add comment
exports.addComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    
    const [result] = await db.query(
      'INSERT INTO COMMENTS (POST_ID, USER_ID, CONTENT) VALUES (?, ?, ?)',
      [postId, req.userId, content]
    );
    
    // Trigger will handle comment count increment
    
    res.status(201).json({
      message: 'Comment added successfully',
      commentId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete comment
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID, POST_ID FROM COMMENTS WHERE COMMENT_ID = ?',
      [commentId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query('DELETE FROM COMMENTS WHERE COMMENT_ID = ?', [commentId]);
    
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Like/Unlike comment
exports.toggleCommentLike = async (req, res) => {
  try {
    const { commentId } = req.params;
    
    // Check if already liked
    const [existing] = await db.query(
      'SELECT * FROM COMMENT_LIKES WHERE COMMENT_ID = ? AND USER_ID = ?',
      [commentId, req.userId]
    );
    
    if (existing.length > 0) {
      // Unlike
      await db.query(
        'DELETE FROM COMMENT_LIKES WHERE COMMENT_ID = ? AND USER_ID = ?',
        [commentId, req.userId]
      );
      
      res.json({ message: 'Comment unliked', liked: false });
    } else {
      // Like
      await db.query(
        'INSERT INTO COMMENT_LIKES (COMMENT_ID, USER_ID) VALUES (?, ?)',
        [commentId, req.userId]
      );
      
      res.json({ message: 'Comment liked', liked: true });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get user activity
exports.getUserActivity = async (req, res) => {
  try {
    const userId = req.userId || req.params.userId;
    const { limit = 50 } = req.query;
    
    console.log('Getting activity for user:', userId, 'limit:', limit);
    
    const [activities] = await db.query(
      'CALL GetUserActivity(?, ?)',
      [userId, parseInt(limit)]
    );
    
    console.log('Found activities:', activities[0]?.length || 0);
    
    res.json(activities[0]);
  } catch (error) {
    console.error('Error getting user activity:', error);
    res.status(500).json({ error: error.message });
  }
};
