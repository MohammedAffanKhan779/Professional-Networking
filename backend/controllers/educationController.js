const db = require('../config/database');

// Get all education for a user
exports.getUserEducation = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [education] = await db.query(
      `SELECT * FROM EDUCATION 
       WHERE USER_ID = ? 
       ORDER BY START_DATE DESC`,
      [userId]
    );
    
    res.json(education);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create education
exports.createEducation = async (req, res) => {
  try {
    const {
      institutionName,
      fieldOfStudy,
      degree,
      description,
      startDate,
      endDate
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO EDUCATION 
      (USER_ID, INSTITUTION_NAME, FIELD_OF_STUDY, DEGREE, 
       DESCRIPTION, START_DATE, END_DATE)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        institutionName,
        fieldOfStudy,
        degree,
        description,
        startDate,
        endDate || null
      ]
    );
    
    res.status(201).json({
      message: 'Education created successfully',
      educationId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update education
exports.updateEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    const {
      institutionName,
      fieldOfStudy,
      degree,
      description,
      startDate,
      endDate
    } = req.body;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM EDUCATION WHERE EDUCATION_ID = ?',
      [educationId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Education not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      `UPDATE EDUCATION SET 
      INSTITUTION_NAME = ?, FIELD_OF_STUDY = ?, DEGREE = ?,
      DESCRIPTION = ?, START_DATE = ?, END_DATE = ?, 
      UPDATED_AT = NOW()
      WHERE EDUCATION_ID = ?`,
      [
        institutionName,
        fieldOfStudy,
        degree,
        description,
        startDate,
        endDate,
        educationId
      ]
    );
    
    res.json({ message: 'Education updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete education
exports.deleteEducation = async (req, res) => {
  try {
    const { educationId } = req.params;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM EDUCATION WHERE EDUCATION_ID = ?',
      [educationId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Education not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      'DELETE FROM EDUCATION WHERE EDUCATION_ID = ?',
      [educationId]
    );
    
    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
