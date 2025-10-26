# ProConnect - Professional Networking Platform

A LinkedIn-like professional networking platform built with React, Node.js, Express, and MySQL.

## 🚀 Features

- **User Profiles** - Complete professional profiles with experience, education, and skills
- **Posts & Feed** - Share updates and engage with your network
- **Connections** - Build your professional network with smart suggestions
- **Activity Tracking** - Monitor all your interactions and engagement
- **Comments & Likes** - Engage with posts and comments
- **Resume Builder** - Create professional resumes from your profile
- **Real-time Updates** - Automatic count management via database triggers

## 📋 Recent Updates

### ✨ New Features
- **Activity Page** - Track all your posts, comments, likes, and connections
- **Connections Page** - Manage connections with tabs for pending, sent, and suggestions
- **Comment Likes** - Like and unlike comments with automatic count updates
- **Connection Suggestions** - Smart suggestions based on mutual connections
- **Automatic Counts** - Database triggers handle all like and comment counts

### 🐛 Fixes
- Feed no longer shows your own posts
- Comment likes now work correctly
- Connection status checking fixed
- All counts are now accurate and automatic

## 🛠️ Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- TailwindCSS
- Shadcn/ui
- React Query
- Zustand
- React Router

### Backend
- Node.js
- Express
- MySQL 8.0+
- JWT Authentication
- bcrypt

## 📦 Installation

### Prerequisites
- Node.js 16+
- MySQL 8.0+
- npm or yarn

### Quick Start

1. **Clone the repository**
```bash
git clone <repository-url>
cd ProConnect
```

2. **Setup Backend**
```bash
cd backend
npm install
```

Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=professional_network
PORT=5000
JWT_SECRET=your_jwt_secret_key
```

3. **Setup Database**

For fresh installation:
```bash
mysql -u root -p < backend/sql-schema/schema.sql
mysql -u root -p professional_network < backend/sql-schema/sample-entries.sql
```

For existing database (migration):
```bash
mysql -u root -p professional_network < backend/sql-schema/migration-add-triggers.sql
```

4. **Setup Frontend**
```bash
cd frontend
npm install
```

5. **Start Development Servers**

Backend:
```bash
cd backend
npm start
```

Frontend:
```bash
cd frontend
npm run dev
```

Visit `http://localhost:8080`

## 📚 Documentation

- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup and migration instructions
- **[CHANGES_SUMMARY.md](CHANGES_SUMMARY.md)** - Complete list of changes and improvements
- **[QUICK_REFERENCE.md](QUICK_REFERENCE.md)** - Quick reference for developers
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design decisions
- **[TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)** - Comprehensive testing guide
- **[backend/sql-schema/README.md](backend/sql-schema/README.md)** - Database schema documentation

## 🎯 Key Features Explained

### Automatic Count Management
All likes and comments counts are managed automatically by database triggers. No manual count updates needed in application code!

```javascript
// Just insert/delete - counts update automatically!
await db.query('INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (?, ?)', [postId, userId]);
// LIKES_COUNT automatically increments via trigger
```

### Activity Tracking
Every user action is automatically logged:
- Posts created
- Comments added
- Post likes
- Comment likes
- Connections accepted

View your activity at `/activity`

### Connection Suggestions
Smart suggestions based on your network:
- 2nd degree connections (friends of friends)
- Shows mutual connections count
- Prioritizes users with more mutual connections

### Feed Algorithm
- Excludes your own posts
- Shows posts from your connections
- Includes like status for each post
- Optimized with stored procedures

## 🔗 API Endpoints

### Posts
```
GET    /api/posts                          - Get feed
POST   /api/posts                          - Create post
POST   /api/posts/:postId/like             - Toggle post like
POST   /api/posts/:postId/comments         - Add comment
POST   /api/posts/comments/:commentId/like - Toggle comment like
GET    /api/posts/activity/me              - Get my activity
```

### Connections
```
GET    /api/connections/:userId            - Get connections
GET    /api/connections/suggestions        - Get suggestions
GET    /api/connections/pending/received   - Get pending requests
POST   /api/connections/request            - Send request
PUT    /api/connections/:connectionId/accept - Accept request
```

See [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for complete API documentation.

## 🗄️ Database

### Tables
- USERS - User profiles
- POSTS - User posts
- COMMENTS - Post comments
- POST_LIKES - Post likes
- COMMENT_LIKES - Comment likes
- CONNECTIONS - User connections
- USER_ACTIVITY - Activity tracking
- EXPERIENCE - Work experience
- EDUCATION - Educational background
- SKILLS - User skills
- PROJECTS - User projects

### Triggers (8)
Automatic count management and activity logging

### Stored Procedures (4)
Optimized queries for complex operations

See [backend/sql-schema/README.md](backend/sql-schema/README.md) for detailed schema documentation.

## 🧪 Testing

Run the complete test suite using [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)

Quick tests:
```bash
# Test backend
curl http://localhost:5000/

# Test database triggers
mysql -u root -p professional_network
> SELECT * FROM USER_ACTIVITY ORDER BY CREATED_AT DESC LIMIT 10;
```

## 🚀 Deployment

### Backend
- Deploy to AWS EC2, Heroku, or DigitalOcean
- Set environment variables
- Run migration script on production database

### Frontend
- Build: `npm run build`
- Deploy to Vercel, Netlify, or AWS S3
- Set API URL environment variable

### Database
- Use AWS RDS, DigitalOcean Managed Database, or similar
- Run migration script
- Set up automated backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md)
5. Submit a pull request

## 📝 License

MIT License - feel free to use this project for learning or commercial purposes.

## 🆘 Support

- Check [SETUP_GUIDE.md](SETUP_GUIDE.md) for setup issues
- Review [QUICK_REFERENCE.md](QUICK_REFERENCE.md) for quick answers
- See [ARCHITECTURE.md](ARCHITECTURE.md) for system design
- Use [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) for debugging

## 🎉 Acknowledgments

Built with modern web technologies and best practices for database management, including:
- Automatic count management via triggers
- Activity tracking system
- Smart connection suggestions
- Optimized queries with stored procedures

---

**Version:** 2.0.0  
**Last Updated:** October 2025  
**Status:** Production Ready ✅
