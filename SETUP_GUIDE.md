# ProConnect Setup & Migration Guide

## 🚀 Quick Start

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Configure Environment**
Create `backend/.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=professional_network
PORT=5000
JWT_SECRET=your_jwt_secret_key_here
```

3. **Setup Database**

**For Fresh Installation:**
```bash
mysql -u root -p < backend/sql-schema/schema.sql
mysql -u root -p professional_network < backend/sql-schema/sample-entries.sql
```

**For Existing Database (Migration):**
```bash
mysql -u root -p professional_network < backend/sql-schema/migration-add-triggers.sql
```

4. **Start Backend Server**
```bash
npm start
# or for development with auto-reload
npm run dev
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install
```

2. **Start Development Server**
```bash
npm run dev
```

The app will be available at `http://localhost:8080`

## ✨ What's New

### Backend Improvements

#### 1. **Automatic Count Management (Triggers)**
- Post likes count auto-updates
- Comment count auto-updates
- Comment likes count auto-updates
- No manual count management needed!

#### 2. **User Activity Tracking**
- Automatically logs all user activities
- Tracks posts, comments, likes, and connections
- New endpoint: `GET /api/posts/activity/me`

#### 3. **Enhanced Connection Features**
- Connection suggestions based on mutual connections
- Mutual connections count
- Fixed connection status checking
- New endpoints:
  - `GET /api/connections/suggestions`
  - `GET /api/connections/count/:userId`
  - `GET /api/connections/mutual/:userId`

#### 4. **Comment Likes**
- Full comment like/unlike functionality
- New endpoint: `POST /api/posts/comments/:commentId/like`

#### 5. **Fixed Feed**
- Feed now excludes user's own posts
- Added `isLiked` field to show like status
- Better query performance

### Frontend Improvements

#### 1. **New Pages**
- **Connections Page** (`/connections`)
  - View all connections
  - Manage pending requests
  - See sent requests
  - Get connection suggestions with mutual connections count
  
- **Activity Page** (`/activity`)
  - View all your activities
  - See posts, comments, and likes history
  - Click to navigate to related posts

#### 2. **Updated Navigation**
- Added "My Network" link to Connections page
- Added "Activity" link to Activity page
- Better navigation structure

## 📊 Database Schema

### New Tables
- `USER_ACTIVITY` - Tracks all user activities

### New Triggers
1. `after_post_like_insert` - Auto-increment post likes
2. `after_post_like_delete` - Auto-decrement post likes
3. `after_comment_insert` - Auto-increment comment count
4. `after_comment_delete` - Auto-decrement comment count
5. `after_comment_like_insert` - Auto-increment comment likes
6. `after_comment_like_delete` - Auto-decrement comment likes
7. `after_post_insert` - Log post creation
8. `after_connection_accepted` - Log connection acceptance

### New Stored Procedures
1. `GetUserFeed(userId, limit, offset)` - Get personalized feed
2. `GetUserActivity(userId, limit)` - Get user activity history
3. `GetMutualConnectionsCount(userId1, userId2)` - Get mutual connections
4. `GetConnectionSuggestions(userId, limit)` - Get connection suggestions

## 🔧 API Endpoints

### Posts
```
GET    /api/posts                          - Get feed (excludes own posts)
GET    /api/posts/user/:userId             - Get user's posts
GET    /api/posts/:postId                  - Get single post
POST   /api/posts                          - Create post
PUT    /api/posts/:postId                  - Update post
DELETE /api/posts/:postId                  - Delete post
POST   /api/posts/:postId/like             - Toggle post like
GET    /api/posts/:postId/comments         - Get comments
POST   /api/posts/:postId/comments         - Add comment
DELETE /api/posts/comments/:commentId      - Delete comment
POST   /api/posts/comments/:commentId/like - Toggle comment like ✨ NEW
GET    /api/posts/activity/me              - Get my activity ✨ NEW
GET    /api/posts/activity/:userId         - Get user activity ✨ NEW
```

### Connections
```
GET    /api/connections/:userId                - Get user connections
GET    /api/connections/suggestions            - Get suggestions ✨ NEW
GET    /api/connections/pending/received       - Get pending requests
GET    /api/connections/pending/sent           - Get sent requests
GET    /api/connections/count/:userId          - Get connections count ✨ NEW
GET    /api/connections/mutual/:userId         - Get mutual count ✨ NEW
GET    /api/connections/status/:userId         - Get connection status
POST   /api/connections/request                - Send request
PUT    /api/connections/:connectionId/accept   - Accept request
PUT    /api/connections/:connectionId/reject   - Reject request
DELETE /api/connections/:connectionId          - Remove connection
```

## 🐛 Bugs Fixed

1. ✅ **Feed showing own posts** - Now excludes user's own posts
2. ✅ **Comment likes not working** - Full functionality added
3. ✅ **No activity tracking** - Complete activity system implemented
4. ✅ **Connection issues** - Fixed status checking and added suggestions
5. ✅ **Manual count updates** - Now automatic via triggers

## 🧪 Testing

### Test Triggers
```sql
-- Test post like trigger
INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (1, 2);
SELECT LIKES_COUNT FROM POSTS WHERE POST_ID = 1;

-- Test activity tracking
SELECT * FROM USER_ACTIVITY WHERE USER_ID = 1 ORDER BY CREATED_AT DESC;
```

### Test API Endpoints
```bash
# Get activity
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/posts/activity/me

# Get connection suggestions
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/connections/suggestions

# Toggle comment like
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/posts/comments/1/like
```

## 📝 Notes

- All triggers prevent negative counts using `GREATEST(count - 1, 0)`
- Activity text is truncated to 100 characters for comments
- Connection suggestions are based on 2nd degree connections
- Feed query is optimized with proper indexes
- All new features are backward compatible

## 🆘 Troubleshooting

### Database Issues
```bash
# Check if triggers exist
SHOW TRIGGERS FROM professional_network;

# Check if procedures exist
SHOW PROCEDURE STATUS WHERE Db = 'professional_network';

# Fix counts if incorrect
UPDATE POSTS p SET LIKES_COUNT = (SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID);
```

### Backend Issues
```bash
# Check if server is running
curl http://localhost:5000/

# Check database connection
# Look for connection errors in console
```

### Frontend Issues
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if backend is accessible
# Open browser console and check for CORS errors
```

## 📚 Additional Resources

- See `backend/sql-schema/README.md` for detailed database documentation
- Check `backend/sql-schema/migration-add-triggers.sql` for migration details
- Review trigger and procedure definitions in `backend/sql-schema/schema.sql`
