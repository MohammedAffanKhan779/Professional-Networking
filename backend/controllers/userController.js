const db = require('../config/database');

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [users] = await db.query(
      `SELECT USER_ID, EMAIL, F_NAME, L_NAME, DOB, INDUSTRY, 
       PROFILE_PIC_URL, COUNTRY, CITY, BIO, HEADLINE, STATUS, 
       CREATED_AT, UPDATED_AT 
       FROM USERS WHERE USER_ID = ?`,
      [userId]
    );
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const {
      firstName,
      lastName,
      dob,
      industry,
      profilePicUrl,
      country,
      city,
      bio,
      headline
    } = req.body;
    
    // Verify user owns this profile
    if (req.userId !== parseInt(userId)) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      `UPDATE USERS SET 
       F_NAME = ?, L_NAME = ?, DOB = ?, INDUSTRY = ?,
       PROFILE_PIC_URL = ?, COUNTRY = ?, CITY = ?, BIO = ?,
       HEADLINE = ?, UPDATED_AT = NOW()
       WHERE USER_ID = ?`,
      [firstName, lastName, dob, industry, profilePicUrl, country, city, bio, headline, userId]
    );
    
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query, industry, city } = req.query;
    
    let sql = `SELECT USER_ID, EMAIL, F_NAME, L_NAME, HEADLINE, 
               PROFILE_PIC_URL, CITY, COUNTRY, INDUSTRY 
               FROM USERS WHERE STATUS = 'active'`;
    const params = [];
    
    if (query) {
      sql += ` AND (F_NAME LIKE ? OR L_NAME LIKE ? OR HEADLINE LIKE ?)`;
      const searchTerm = `%${query}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    if (industry) {
      sql += ` AND INDUSTRY = ?`;
      params.push(industry);
    }
    
    if (city) {
      sql += ` AND CITY = ?`;
      params.push(city);
    }
    
    sql += ` LIMIT 50`;
    
    const [users] = await db.query(sql, params);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    console.log('Getting all users...');
    const [users] = await db.query(
      `SELECT USER_ID, EMAIL, F_NAME, L_NAME, HEADLINE, 
       PROFILE_PIC_URL, CITY, COUNTRY, INDUSTRY 
       FROM USERS WHERE STATUS = 'active' 
       ORDER BY CREATED_AT DESC 
       LIMIT 100`
    );
    console.log('Found users:', users.length);
    res.json(users);
  } catch (error) {
    console.error('Error getting all users:', error);
    res.status(500).json({ error: error.message });
  }
};
