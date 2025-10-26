const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const [existing] = await db.query(
      'SELECT * FROM USERS WHERE EMAIL = ?', 
      [email]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert user
    const [result] = await db.query(
      'INSERT INTO USERS (EMAIL, PASSWORD_HASH, F_NAME, L_NAME, STATUS) VALUES (?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, 'active']
    );
    
    // Generate token
    const token = jwt.sign(
      { userId: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.status(201).json({
      message: 'User created successfully',
      token,
      userId: result.insertId,
      user: {
        id: result.insertId,
        email,
        firstName,
        lastName
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const [users] = await db.query(
      'SELECT * FROM USERS WHERE EMAIL = ?',
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.PASSWORD_HASH);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { userId: user.USER_ID },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    res.json({
      message: 'Login successful',
      token,
      userId: user.USER_ID,
      user: {
        id: user.USER_ID,
        email: user.EMAIL,
        firstName: user.F_NAME,
        lastName: user.L_NAME
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
