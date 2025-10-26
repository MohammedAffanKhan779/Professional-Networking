const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
          
// Middleware
app.use(cors({
  origin: 'http://localhost:8080', // Lovable dev server
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Professional Network API Server' });
});

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const experienceRoutes = require('./routes/experience');
const educationRoutes = require('./routes/education');
const skillsRoutes = require('./routes/skills');
const projectsRoutes = require('./routes/projects');
const postsRoutes = require('./routes/posts');
const connectionsRoutes = require('./routes/connections');
const resumeRoutes = require('./routes/resume');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/experience', experienceRoutes);
app.use('/api/education', educationRoutes);
app.use('/api/skills', skillsRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/connections', connectionsRoutes);
app.use('/api/resume', resumeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
