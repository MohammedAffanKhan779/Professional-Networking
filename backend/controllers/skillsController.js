const db = require('../config/database');

// Get all skills for a user
exports.getUserSkills = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [skills] = await db.query(
      `SELECT * FROM SKILLS 
       WHERE USER_ID = ? 
       ORDER BY PROFICIENCY_LVL DESC, SKILL ASC`,
      [userId]
    );
    
    res.json(skills);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create skill
exports.createSkill = async (req, res) => {
  try {
    const { skill, proficiencyLevel } = req.body;
    
    // Check if skill already exists for this user
    const [existing] = await db.query(
      'SELECT * FROM SKILLS WHERE USER_ID = ? AND SKILL = ?',
      [req.userId, skill]
    );
    
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Skill already exists' });
    }
    
    const [result] = await db.query(
      `INSERT INTO SKILLS (USER_ID, SKILL, PROFICIENCY_LVL)
      VALUES (?, ?, ?)`,
      [req.userId, skill, proficiencyLevel]
    );
    
    res.status(201).json({
      message: 'Skill created successfully',
      skillId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update skill
exports.updateSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    const { skill, proficiencyLevel } = req.body;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM SKILLS WHERE SKILL_ID = ?',
      [skillId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      `UPDATE SKILLS SET SKILL = ?, PROFICIENCY_LVL = ?
      WHERE SKILL_ID = ?`,
      [skill, proficiencyLevel, skillId]
    );
    
    res.json({ message: 'Skill updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete skill
exports.deleteSkill = async (req, res) => {
  try {
    const { skillId } = req.params;
    
    // Verify ownership
    const [existing] = await db.query(
      'SELECT USER_ID FROM SKILLS WHERE SKILL_ID = ?',
      [skillId]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Skill not found' });
    }
    
    if (existing[0].USER_ID !== req.userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    await db.query(
      'DELETE FROM SKILLS WHERE SKILL_ID = ?',
      [skillId]
    );
    
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
