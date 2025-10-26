# ProConnect Database Schema

## Overview
This directory contains the database schema and migration scripts for the ProConnect professional networking platform.

## Files

- **schema.sql** - Complete database schema with all tables, triggers, and stored procedures
- **sample-entries.sql** - Sample data for testing and development
- **migration-add-triggers.sql** - Migration script to add triggers and procedures to existing databases

## Setup Instructions

### Fresh Installation
```bash
# 1. Create and setup database
mysql -u root -p < schema.sql

# 2. (Optional) Load sample data
mysql -u root -p professional_network < sample-entries.sql
```

### Existing Database Migration
```bash
# Run migration to add new features
mysql -u root -p professional_network < migration-add-triggers.sql
```

## Key Features

### 1. Automatic Count Updates (Triggers)
The database now automatically maintains accurate counts for:
- Post likes count
- Post comments count
- Comment likes count

**No manual count updates needed in application code!**

### 2. User Activity Tracking
All user activities are automatically logged:
- Posts created
- Comments added
- Post likes
- Comment likes
- Connections accepted

Access via: `GET /api/posts/activity/me`

### 3. Stored Procedures

#### GetUserFeed(userId, limit, offset)
Returns personalized feed excluding user's own posts and including connection status.

#### GetUserActivity(userId, limit)
Returns user's activity history with references to posts and comments.

#### GetMutualConnectionsCount(userId1, userId2)
Calculates mutual connections between two users.

#### GetConnectionSuggestions(userId, limit)
Suggests 2nd degree connections based on mutual connections.

## API Endpoints

### Posts
- `GET /api/posts` - Get feed (excludes own posts)
- `GET /api/posts/user/:userId` - Get user's posts
- `POST /api/posts/:postId/like` - Toggle post like
- `POST /api/posts/:postId/comments` - Add comment
- `POST /api/posts/comments/:commentId/like` - Toggle comment like ✨ NEW
- `GET /api/posts/activity/me` - Get my activity ✨ NEW

### Connections
- `GET /api/connections/:userId` - Get user's connections
- `GET /api/connections/suggestions` - Get connection suggestions ✨ NEW
- `GET /api/connections/count/:userId` - Get connections count ✨ NEW
- `GET /api/connections/mutual/:userId` - Get mutual connections count ✨ NEW
- `GET /api/connections/pending/received` - Get pending requests
- `POST /api/connections/request` - Send connection request
- `PUT /api/connections/:connectionId/accept` - Accept request
- `PUT /api/connections/:connectionId/reject` - Reject request

## Database Schema

### Core Tables
- **USERS** - User profiles and authentication
- **CONNECTIONS** - User connections and requests
- **POSTS** - User posts and content
- **COMMENTS** - Post comments
- **POST_LIKES** - Post like tracking
- **COMMENT_LIKES** - Comment like tracking
- **EXPERIENCE** - Work experience
- **EDUCATION** - Educational background
- **SKILLS** - User skills
- **PROJECTS** - User projects
- **USER_ACTIVITY** - Activity tracking ✨ NEW

### Resume Features
- **RESUME_TEMPLATES** - Resume template definitions
- **USER_RESUME_SETTINGS** - User resume preferences
- **PROJECT_COLLABORATORS** - Project team members

## Fixes Applied

### 1. Feed Posts Issue ✅
- Feed now excludes user's own posts
- Added `isLiked` field to show if current user liked the post

### 2. Comment Likes Issue ✅
- Added comment like/unlike functionality
- Automatic count updates via triggers
- New endpoint: `POST /api/posts/comments/:commentId/like`

### 3. User Activity ✅
- New activity tracking table
- Automatic logging via triggers
- Activity history endpoint

### 4. Connection Issues ✅
- Fixed connection status checking
- Added mutual connections count
- Added connection suggestions
- Added connections count endpoint

## Triggers

All triggers automatically maintain data integrity:

1. **after_post_like_insert** - Increment post likes, log activity
2. **after_post_like_delete** - Decrement post likes
3. **after_comment_insert** - Increment comment count, log activity
4. **after_comment_delete** - Decrement comment count
5. **after_comment_like_insert** - Increment comment likes, log activity
6. **after_comment_like_delete** - Decrement comment likes
7. **after_post_insert** - Log post creation activity
8. **after_connection_accepted** - Log connection activity for both users

## Testing

After running the migration:

```sql
-- Test triggers
INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (1, 2);
SELECT LIKES_COUNT FROM POSTS WHERE POST_ID = 1; -- Should increment

-- Test activity tracking
SELECT * FROM USER_ACTIVITY WHERE USER_ID = 1 ORDER BY CREATED_AT DESC;

-- Test stored procedures
CALL GetUserActivity(1, 10);
CALL GetConnectionSuggestions(1, 5);
CALL GetMutualConnectionsCount(1, 2);
```

## Notes

- All triggers use `GREATEST(count - 1, 0)` to prevent negative counts
- Activity text is truncated to 100 characters for comments
- Connection suggestions are based on 2nd degree connections
- All timestamps use `CURRENT_TIMESTAMP` for consistency
