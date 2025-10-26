const db = require('../config/database');

// Get user connections (accepted)
exports.getUserConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [connections] = await db.query(
      `SELECT u.USER_ID, u.F_NAME, u.L_NAME, u.HEADLINE, 
       u.PROFILE_PIC_URL, u.CITY, u.COUNTRY, c.ACCEPTED_AT
       FROM CONNECTIONS c
       JOIN USERS u ON (c.RECEIVER_ID = u.USER_ID OR c.REQUEST_ID = u.USER_ID)
       WHERE (c.REQUEST_ID = ? OR c.RECEIVER_ID = ?)
       AND c.STATUS = 'accepted'
       AND u.USER_ID != ?
       ORDER BY c.ACCEPTED_AT DESC`,
      [userId, userId, userId]
    );
    
    res.json(connections);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get pending connection requests (received)
exports.getPendingRequests = async (req, res) => {
  try {
    const userId = req.userId;
    
    const [requests] = await db.query(
      `SELECT c.CONNECTION_ID, c.REQUESTED_AT, 
       u.USER_ID, u.F_NAME, u.L_NAME, u.HEADLINE, 
       u.PROFILE_PIC_URL
       FROM CONNECTIONS c
       JOIN USERS u ON c.REQUEST_ID = u.USER_ID
       WHERE c.RECEIVER_ID = ? AND c.STATUS = 'pending'
       ORDER BY c.REQUESTED_AT DESC`,
      [userId]
    );
    
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get sent connection requests
exports.getSentRequests = async (req, res) => {
  try {
    const userId = req.userId;
    
    console.log('Getting sent requests for user:', userId);
    
    const [requests] = await db.query(
      `SELECT c.CONNECTION_ID, c.REQUESTED_AT, c.STATUS,
       u.USER_ID, u.F_NAME, u.L_NAME, u.HEADLINE, 
       u.PROFILE_PIC_URL, u.CITY, u.COUNTRY
       FROM CONNECTIONS c
       JOIN USERS u ON c.RECEIVER_ID = u.USER_ID
       WHERE c.REQUEST_ID = ? AND c.STATUS = 'pending'
       ORDER BY c.REQUESTED_AT DESC`,
      [userId]
    );
    
    console.log('Found sent requests:', requests.length);
    
    res.json(requests);
  } catch (error) {
    console.error('Error getting sent requests:', error);
    res.status(500).json({ error: error.message });
  }
};

// Check connection status between two users
exports.getConnectionStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;
    
    const [connections] = await db.query(
      `SELECT STATUS FROM CONNECTIONS 
       WHERE (REQUEST_ID = ? AND RECEIVER_ID = ?)
       OR (REQUEST_ID = ? AND RECEIVER_ID = ?)`,
      [currentUserId, userId, userId, currentUserId]
    );
    
    if (connections.length === 0) {
      return res.json({ status: 'not_connected' });
    }
    
    res.json({ status: connections[0].STATUS });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send connection request
exports.sendConnectionRequest = async (req, res) => {
  try {
    const { receiverId } = req.body;
    const requesterId = req.userId;
    
    // Validate receiverId
    if (!receiverId || receiverId == requesterId) {
      return res.status(400).json({ 
        error: 'Invalid receiver ID' 
      });
    }
    
    // Check if connection already exists
    const [existing] = await db.query(
      `SELECT STATUS FROM CONNECTIONS 
       WHERE (REQUEST_ID = ? AND RECEIVER_ID = ?)
       OR (REQUEST_ID = ? AND RECEIVER_ID = ?)`,
      [requesterId, receiverId, receiverId, requesterId]
    );
    
    if (existing.length > 0) {
      const status = existing[0].STATUS;
      if (status === 'pending') {
        return res.status(400).json({ 
          error: 'Connection request already pending' 
        });
      } else if (status === 'accepted') {
        return res.status(400).json({ 
          error: 'Already connected' 
        });
      } else if (status === 'rejected') {
        // Allow re-sending after rejection
        await db.query(
          `UPDATE CONNECTIONS SET STATUS = 'pending', REQUESTED_AT = NOW() 
           WHERE (REQUEST_ID = ? AND RECEIVER_ID = ?)
           OR (REQUEST_ID = ? AND RECEIVER_ID = ?)`,
          [requesterId, receiverId, receiverId, requesterId]
        );
        return res.status(200).json({
          message: 'Connection request sent'
        });
      }
    }
    
    const [result] = await db.query(
      'INSERT INTO CONNECTIONS (REQUEST_ID, RECEIVER_ID, STATUS) VALUES (?, ?, ?)',
      [requesterId, receiverId, 'pending']
    );
    
    res.status(201).json({
      message: 'Connection request sent',
      connectionId: result.insertId
    });
  } catch (error) {
    console.error('Send connection error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Accept connection request
exports.acceptConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    // Verify this request is for current user
    const [connection] = await db.query(
      'SELECT * FROM CONNECTIONS WHERE CONNECTION_ID = ? AND RECEIVER_ID = ?',
      [connectionId, req.userId]
    );
    
    if (connection.length === 0) {
      return res.status(404).json({ error: 'Connection request not found' });
    }
    
    await db.query(
      `UPDATE CONNECTIONS SET STATUS = 'accepted', ACCEPTED_AT = NOW() 
       WHERE CONNECTION_ID = ?`,
      [connectionId]
    );
    
    res.json({ message: 'Connection request accepted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Reject connection request
exports.rejectConnectionRequest = async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    // Verify this request is for current user
    const [connection] = await db.query(
      'SELECT * FROM CONNECTIONS WHERE CONNECTION_ID = ? AND RECEIVER_ID = ?',
      [connectionId, req.userId]
    );
    
    if (connection.length === 0) {
      return res.status(404).json({ error: 'Connection request not found' });
    }
    
    await db.query(
      `UPDATE CONNECTIONS SET STATUS = 'rejected' WHERE CONNECTION_ID = ?`,
      [connectionId]
    );
    
    res.json({ message: 'Connection request rejected' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remove connection or cancel request
exports.removeConnection = async (req, res) => {
  try {
    const { connectionId } = req.params;
    
    // Verify user is part of this connection
    const [connection] = await db.query(
      `SELECT * FROM CONNECTIONS WHERE CONNECTION_ID = ? 
       AND (REQUEST_ID = ? OR RECEIVER_ID = ?)`,
      [connectionId, req.userId, req.userId]
    );
    
    if (connection.length === 0) {
      return res.status(404).json({ error: 'Connection not found' });
    }
    
    await db.query('DELETE FROM CONNECTIONS WHERE CONNECTION_ID = ?', [connectionId]);
    
    const message = connection[0].STATUS === 'pending' 
      ? 'Connection request cancelled' 
      : 'Connection removed';
    
    res.json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get connection suggestions (2nd degree connections)
exports.getConnectionSuggestions = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 10 } = req.query;
    
    const [suggestions] = await db.query(
      'CALL GetConnectionSuggestions(?, ?)',
      [userId, parseInt(limit)]
    );
    
    res.json(suggestions[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get mutual connections count
exports.getMutualConnectionsCount = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.userId;
    
    const [result] = await db.query(
      'CALL GetMutualConnectionsCount(?, ?)',
      [currentUserId, userId]
    );
    
    res.json({ mutualCount: result[0][0].mutual_count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get connections count
exports.getConnectionsCount = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [result] = await db.query(
      `SELECT COUNT(*) as count FROM CONNECTIONS 
       WHERE (REQUEST_ID = ? OR RECEIVER_ID = ?) 
       AND STATUS = 'accepted'`,
      [userId, userId]
    );
    
    res.json({ count: result[0].count });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Debug endpoint - check auth
exports.debugAuth = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Get all connection data for this user
    const [sent] = await db.query(
      `SELECT CONNECTION_ID, RECEIVER_ID, STATUS, REQUESTED_AT 
       FROM CONNECTIONS WHERE REQUEST_ID = ?`,
      [userId]
    );
    
    const [received] = await db.query(
      `SELECT CONNECTION_ID, REQUEST_ID, STATUS, REQUESTED_AT 
       FROM CONNECTIONS WHERE RECEIVER_ID = ?`,
      [userId]
    );
    
    res.json({
      authenticatedUserId: userId,
      sentRequests: sent,
      receivedRequests: received,
      totalSent: sent.length,
      totalReceived: received.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
