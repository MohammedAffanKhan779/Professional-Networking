# ProConnect - Quick Reference Card

## 🚀 Quick Start Commands

```bash
# Backend
cd backend
npm install
mysql -u root -p professional_network < sql-schema/migration-add-triggers.sql
npm start

# Frontend
cd frontend
npm install
npm run dev
```

## 🔗 New Routes

### Frontend
- `/connections` - Manage connections, requests, and suggestions
- `/activity` - View your activity history

### Backend API
```
POST   /api/posts/comments/:commentId/like    # Like/unlike comment
GET    /api/posts/activity/me                 # Get my activity
GET    /api/connections/suggestions           # Get connection suggestions
GET    /api/connections/count/:userId         # Get connections count
GET    /api/connections/mutual/:userId        # Get mutual connections
```

## 🗄️ Database Quick Commands

```sql
-- Check triggers
SHOW TRIGGERS FROM professional_network;

-- Check procedures
SHOW PROCEDURE STATUS WHERE Db = 'professional_network';

-- Test activity tracking
SELECT * FROM USER_ACTIVITY ORDER BY CREATED_AT DESC LIMIT 10;

-- Fix counts if needed
UPDATE POSTS p SET LIKES_COUNT = (SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID);
UPDATE POSTS p SET COMMENTS_COUNT = (SELECT COUNT(*) FROM COMMENTS c WHERE c.POST_ID = p.POST_ID);
UPDATE COMMENTS c SET LIKES_COUNT = (SELECT COUNT(*) FROM COMMENT_LIKES cl WHERE cl.COMMENT_ID = c.COMMENT_ID);
```

## 🐛 What Was Fixed

| Issue | Solution | Files |
|-------|----------|-------|
| Feed shows own posts | Exclude user's posts in query | `postsController.js` |
| Comment likes broken | Added toggle endpoint + triggers | `postsController.js`, `posts.js`, `schema.sql` |
| No activity tracking | New table + triggers + page | `Activity.tsx`, `schema.sql` |
| Connection issues | Fixed queries + suggestions | `connectionsController.js`, `Connections.tsx` |

## 📊 New Database Objects

### Tables
- `USER_ACTIVITY` - Activity tracking

### Triggers (8)
- Post like insert/delete
- Comment insert/delete
- Comment like insert/delete
- Post insert
- Connection accepted

### Procedures (4)
- `GetUserFeed(userId, limit, offset)`
- `GetUserActivity(userId, limit)`
- `GetMutualConnectionsCount(userId1, userId2)`
- `GetConnectionSuggestions(userId, limit)`

## 🧪 Quick Test

```bash
# Test backend
curl http://localhost:5000/

# Test with auth
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/posts/activity/me

# Test frontend
# Open http://localhost:8080 in browser
```

## 📝 Key Changes

1. **Feed** - No longer shows your own posts
2. **Comments** - Can now be liked/unliked
3. **Activity** - New page to track all your actions
4. **Connections** - New page with suggestions and mutual connections
5. **Counts** - All managed automatically by database triggers

## 🔧 Troubleshooting

```bash
# Backend not starting?
# Check .env file exists with correct DB credentials

# Frontend errors?
npm install
rm -rf node_modules package-lock.json && npm install

# Database errors?
# Run migration script again
mysql -u root -p professional_network < backend/sql-schema/migration-add-triggers.sql

# Counts incorrect?
# Run fix queries (see Database Quick Commands above)
```

## 📚 Documentation Files

- `SETUP_GUIDE.md` - Complete setup instructions
- `CHANGES_SUMMARY.md` - Detailed changes list
- `backend/sql-schema/README.md` - Database documentation
- `QUICK_REFERENCE.md` - This file

## ⚡ Pro Tips

1. **Triggers handle counts** - Don't manually update LIKES_COUNT or COMMENTS_COUNT
2. **Use stored procedures** - They're optimized for complex queries
3. **Activity is automatic** - No need to manually log activities
4. **Check triggers first** - If counts are wrong, triggers might not be installed
5. **Migration is safe** - Can be run multiple times (drops and recreates)

## 🎯 Next Steps

1. Run migration script on your database
2. Restart backend server
3. Test new endpoints
4. Check new frontend pages
5. Verify triggers are working

---

**Need help?** Check the full documentation in `SETUP_GUIDE.md`
