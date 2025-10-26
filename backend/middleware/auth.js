const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header
 * Adds userId to request object if valid
 */
const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    // Expected format: "Bearer <token>"
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Access denied. No token provided.',
        message: 'Authorization header is missing'
      });
    }
    
    // Check if header starts with "Bearer "
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Invalid token format',
        message: 'Token must be in format: Bearer <token>'
      });
    }
    
    // Extract token (remove "Bearer " prefix)
    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      return res.status(401).json({ 
        error: 'Access denied. Token is empty.',
        message: 'Please provide a valid token'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user data to request object
    req.userId = decoded.userId;
    req.userEmail = decoded.email; // Optional: if you included email in token
    
    // Continue to next middleware/route handler
    next();
    
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Invalid token',
        message: 'Token verification failed'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expired',
        message: 'Please login again',
        expiredAt: error.expiredAt
      });
    }
    
    // Generic error
    return res.status(500).json({ 
      error: 'Authentication error',
      message: error.message 
    });
  }
};

/**
 * Optional Authentication Middleware
 * Allows request to proceed even without token
 * But decodes token if present
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // No token, but that's okay - continue without userId
      req.userId = null;
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    if (!token || token === 'null' || token === 'undefined') {
      req.userId = null;
      return next();
    }
    
    // Try to verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    next();
    
  } catch (error) {
    // Even if token is invalid, allow request to proceed
    req.userId = null;
    next();
  }
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
