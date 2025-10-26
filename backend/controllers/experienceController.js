const db = require('../config/database');

// Get all experiences for a user
exports.getUserExperience = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [experiences] = await db.query(
      `SELECT * FROM EXPERIENCE 
       WHERE USER_ID = ? 
       ORDER BY IS_CURRENT DESC, START_DATE DESC`,
      [userId]
    );
    
    res.json(experiences);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single experience
exports.getExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    
    const [experiences] = await db.query(
      'SELECT * FROM EXPERIENCE WHERE EXPERIENCE_ID = ?',
      [experienceId]
    );
    
    if (experiences.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json(experiences[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create experience
exports.createExperience = async (req, res) => {
  try {
    const {
      companyName,
      jobTitle,
      employmentType,
      location,
      jobDescription,
      startDate,
      endDate,
      isCurrent
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO EXPERIENCE 
      (USER_ID, COMPANY_NAME, JOB_TITLE, EMPLOYMENT_TYPE, LOCATION, 
       JOB_DESCRIPTION, START_DATE, END_DATE, IS_CURRENT)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        companyName,
        jobTitle,
        employmentType,
        location,
        jobDescription,
        startDate,
        endDate || null,
        isCurrent || false
      ]
    );
    
    res.status(201).json({
      message: 'Experience created successfully',
      experienceId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update experience
exports.updateExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    const {
      companyName,
      jobTitle,
      employmentType,
      location,
      jobDescription,
      startDate,
      endDate,
      isCurrent
    } = req.body;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM EXPERIENCE WHERE EXPERIENCE_ID = ?',
      [experienceId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      `UPDATE EXPERIENCE SET 
      COMPANY_NAME = ?, JOB_TITLE = ?, EMPLOYMENT_TYPE = ?,
      LOCATION = ?, JOB_DESCRIPTION = ?, START_DATE = ?, 
      END_DATE = ?, IS_CURRENT = ?, UPDATED_AT = NOW()
      WHERE EXPERIENCE_ID = ?`,
      [
        companyName,
        jobTitle,
        employmentType,
        location,
        jobDescription,
        startDate,
        endDate,
        isCurrent,
        experienceId
      ]
    );
    
    res.json({ message: 'Experience updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete experience
exports.deleteExperience = async (req, res) => {
  try {
    const { experienceId } = req.params;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM EXPERIENCE WHERE EXPERIENCE_ID = ?',
      [experienceId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      'DELETE FROM EXPERIENCE WHERE EXPERIENCE_ID = ?',
      [experienceId]
    );
    
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
