const db = require('../config/database');

exports.getResumeData = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Get user info
    const [users] = await db.query(
      'SELECT * FROM USERS WHERE USER_ID = ?',
      [userId]
    );
    
    // Get education
    const [education] = await db.query(
      'SELECT * FROM EDUCATION WHERE USER_ID = ? ORDER BY START_DATE DESC',
      [userId]
    );
    
    // Get experience
    const [experience] = await db.query(
      'SELECT * FROM EXPERIENCE WHERE USER_ID = ? ORDER BY START_DATE DESC',
      [userId]
    );
    
    // Get skills
    const [skills] = await db.query(
      'SELECT * FROM SKILLS WHERE USER_ID = ? ORDER BY PROFICIENCY_LVL DESC',
      [userId]
    );
    
    // Get projects
    const [projects] = await db.query(
      'SELECT * FROM PROJECTS WHERE USER_ID = ? ORDER BY START_DATE DESC',
      [userId]
    );
    
    res.json({
      personalInfo: users[0] || null,
      education,
      experience,
      skills,
      projects
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.saveResumeSettings = async (req, res) => {
  try {
    const {
      templateId,
      includeProfilePic,
      includeBio,
      includeProjects,
      sectionsOrder,
      colorScheme,
      fontStyle
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO USER_RESUME_SETTINGS 
      (USER_ID, TEMPLATE_ID, INCLUDE_PROFILE_PIC, INCLUDE_BIO, 
       INCLUDE_PROJECTS, SECTIONS_ORDER, COLOR_SCHEME, FONT_STYLE)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        templateId,
        includeProfilePic,
        includeBio,
        includeProjects,
        JSON.stringify(sectionsOrder),
        colorScheme,
        fontStyle
      ]
    );
    
    res.status(201).json({
      message: 'Resume settings saved successfully',
      settingsId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateResumeSettings = async (req, res) => {
  try {
    const {
      templateId,
      includeProfilePic,
      includeBio,
      includeProjects,
      sectionsOrder,
      colorScheme,
      fontStyle
    } = req.body;
    
    await db.query(
      `UPDATE USER_RESUME_SETTINGS SET 
      TEMPLATE_ID = ?, INCLUDE_PROFILE_PIC = ?, INCLUDE_BIO = ?,
      INCLUDE_PROJECTS = ?, SECTIONS_ORDER = ?, COLOR_SCHEME = ?,
      FONT_STYLE = ?, UPDATED_AT = NOW()
      WHERE USER_ID = ?`,
      [
        templateId,
        includeProfilePic,
        includeBio,
        includeProjects,
        JSON.stringify(sectionsOrder),
        colorScheme,
        fontStyle,
        req.userId
      ]
    );
    
    res.json({ message: 'Resume settings updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
