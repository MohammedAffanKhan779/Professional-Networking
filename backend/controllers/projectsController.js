const db = require('../config/database');

// Get all projects for a user
exports.getUserProjects = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const [projects] = await db.query(
      'SELECT * FROM PROJECTS WHERE USER_ID = ? ORDER BY START_DATE DESC',
      [userId]
    );
    
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new project
exports.createProject = async (req, res) => {
  try {
    const {
      projectTitle,
      description,
      technologiesUsed,
      projectUrl,
      githubUrl,
      startDate,
      endDate,
      isOngoing
    } = req.body;
    
    const [result] = await db.query(
      `INSERT INTO PROJECTS 
      (USER_ID, PROJECT_TITLE, DESCRIPTION, TECHNOLOGIES_USED, 
       PROJECT_URL, GITHUB_URL, START_DATE, END_DATE, IS_ONGOING)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.userId,
        projectTitle,
        description,
        technologiesUsed,
        projectUrl,
        githubUrl,
        startDate,
        endDate || null,
        isOngoing
      ]
    );
    
    res.status(201).json({
      message: 'Project created successfully',
      projectId: result.insertId
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update project
exports.updateProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const {
      projectTitle,
      description,
      technologiesUsed,
      projectUrl,
      githubUrl,
      startDate,
      endDate,
      isOngoing
    } = req.body;
    
    await db.query(
      `UPDATE PROJECTS SET 
      PROJECT_TITLE = ?, DESCRIPTION = ?, TECHNOLOGIES_USED = ?,
      PROJECT_URL = ?, GITHUB_URL = ?, START_DATE = ?, 
      END_DATE = ?, IS_ONGOING = ?, UPDATED_AT = NOW()
      WHERE PROJECT_ID = ? AND USER_ID = ?`,
      [
        projectTitle,
        description,
        technologiesUsed,
        projectUrl,
        githubUrl,
        startDate,
        endDate,
        isOngoing,
        projectId,
        req.userId
      ]
    );
    
    res.json({ message: 'Project updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    await db.query(
      'DELETE FROM PROJECTS WHERE PROJECT_ID = ? AND USER_ID = ?',
      [projectId, req.userId]
    );
    
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
