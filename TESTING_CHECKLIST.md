# ProConnect - Testing Checklist

## 🗄️ Database Setup

### Migration
- [ ] Run migration script successfully
  ```bash
  mysql -u root -p professional_network < backend/sql-schema/migration-add-triggers.sql
  ```
- [ ] Verify no errors in output
- [ ] Check "Migration completed successfully!" message appears

### Verify Database Objects
```sql
-- Check triggers (should show 8)
SHOW TRIGGERS FROM professional_network;

-- Check procedures (should show 4)
SHOW PROCEDURE STATUS WHERE Db = 'professional_network';

-- Check USER_ACTIVITY table exists
DESCRIBE USER_ACTIVITY;
```

- [ ] 8 triggers created
- [ ] 4 stored procedures created
- [ ] USER_ACTIVITY table exists

## 🔧 Backend Testing

### Server Startup
- [ ] Backend starts without errors
  ```bash
  cd backend
  npm start
  ```
- [ ] See "Server running on port 5000" message
- [ ] No database connection errors

### API Endpoints - Posts
```bash
# Get feed (should exclude own posts)
curl http://localhost:5000/api/posts

# Get user activity (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/posts/activity/me
```

- [ ] GET /api/posts returns posts
- [ ] Feed excludes current user's posts
- [ ] GET /api/posts/activity/me returns activities

### API Endpoints - Connections
```bash
# Get connection suggestions (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/connections/suggestions

# Get connections count
curl http://localhost:5000/api/connections/count/1

# Get mutual connections (requires auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/connections/mutual/2
```

- [ ] GET /api/connections/suggestions returns suggestions
- [ ] GET /api/connections/count/:userId returns count
- [ ] GET /api/connections/mutual/:userId returns mutual count

## 🎨 Frontend Testing

### Build & Start
- [ ] Frontend builds without errors
  ```bash
  cd frontend
  npm install
  npm run dev
  ```
- [ ] No TypeScript errors
- [ ] App opens at http://localhost:8080

### Navigation
- [ ] Navbar shows "Home", "My Network", "Activity" links
- [ ] Clicking "My Network" goes to /connections
- [ ] Clicking "Activity" goes to /activity
- [ ] All navigation links work

### Pages Load
- [ ] Feed page loads (/feed)
- [ ] Connections page loads (/connections)
- [ ] Activity page loads (/activity)
- [ ] Profile page loads (/profile/:userId)
- [ ] No console errors

## 🧪 Feature Testing

### 1. Feed (Exclude Own Posts)
- [ ] Login as User A
- [ ] Go to /feed
- [ ] Verify User A's posts are NOT shown
- [ ] Verify other users' posts ARE shown
- [ ] Create a new post
- [ ] Verify it doesn't appear in feed immediately

### 2. Comment Likes
- [ ] Find a comment on any post
- [ ] Click like button on comment
- [ ] Verify like count increases
- [ ] Verify button shows "liked" state
- [ ] Click unlike
- [ ] Verify like count decreases
- [ ] Check database: `SELECT LIKES_COUNT FROM COMMENTS WHERE COMMENT_ID = X`
- [ ] Verify count matches UI

### 3. Activity Tracking
- [ ] Go to /activity page
- [ ] Verify activities are listed
- [ ] Create a new post
- [ ] Refresh activity page
- [ ] Verify new post activity appears
- [ ] Like a post
- [ ] Verify like activity appears
- [ ] Comment on a post
- [ ] Verify comment activity appears
- [ ] Click on an activity
- [ ] Verify it navigates to the related post

### 4. Connections Page
- [ ] Go to /connections page
- [ ] Verify 4 tabs: Connections, Pending, Sent, Suggestions

#### Connections Tab
- [ ] Shows list of accepted connections
- [ ] Shows user avatar, name, headline
- [ ] "View Profile" button works

#### Pending Tab
- [ ] Shows received connection requests
- [ ] "Accept" button works
- [ ] "Reject" button works
- [ ] Count updates after action

#### Sent Tab
- [ ] Shows sent connection requests
- [ ] Shows pending status

#### Suggestions Tab
- [ ] Shows connection suggestions
- [ ] Shows mutual connections count
- [ ] "Connect" button sends request
- [ ] User moves to "Sent" tab after connecting

### 5. Connection Suggestions
- [ ] Suggestions show users not already connected
- [ ] Mutual connections count is accurate
- [ ] Suggestions are based on 2nd degree connections
- [ ] No duplicate suggestions

### 6. Mutual Connections
- [ ] View another user's profile
- [ ] Check mutual connections count
- [ ] Verify count is accurate
- [ ] Test with multiple users

## 🔍 Database Trigger Testing

### Post Likes
```sql
-- Before
SELECT LIKES_COUNT FROM POSTS WHERE POST_ID = 1;

-- Like the post via UI or API
-- After
SELECT LIKES_COUNT FROM POSTS WHERE POST_ID = 1;
-- Should be +1

-- Check activity logged
SELECT * FROM USER_ACTIVITY WHERE ACTIVITY_TYPE = 'like_post' ORDER BY CREATED_AT DESC LIMIT 1;
```

- [ ] Like count increases automatically
- [ ] Activity is logged
- [ ] Unlike decreases count
- [ ] Count never goes negative

### Comments
```sql
-- Before
SELECT COMMENTS_COUNT FROM POSTS WHERE POST_ID = 1;

-- Add comment via UI or API
-- After
SELECT COMMENTS_COUNT FROM POSTS WHERE POST_ID = 1;
-- Should be +1

-- Check activity logged
SELECT * FROM USER_ACTIVITY WHERE ACTIVITY_TYPE = 'comment' ORDER BY CREATED_AT DESC LIMIT 1;
```

- [ ] Comment count increases automatically
- [ ] Activity is logged
- [ ] Delete decreases count
- [ ] Count never goes negative

### Comment Likes
```sql
-- Before
SELECT LIKES_COUNT FROM COMMENTS WHERE COMMENT_ID = 1;

-- Like comment via UI or API
-- After
SELECT LIKES_COUNT FROM COMMENTS WHERE COMMENT_ID = 1;
-- Should be +1

-- Check activity logged
SELECT * FROM USER_ACTIVITY WHERE ACTIVITY_TYPE = 'like_comment' ORDER BY CREATED_AT DESC LIMIT 1;
```

- [ ] Comment like count increases automatically
- [ ] Activity is logged
- [ ] Unlike decreases count
- [ ] Count never goes negative

### Connections
```sql
-- Accept a connection request
-- Check activity logged for both users
SELECT * FROM USER_ACTIVITY WHERE ACTIVITY_TYPE = 'connection' ORDER BY CREATED_AT DESC LIMIT 2;
```

- [ ] Activity logged for requester
- [ ] Activity logged for receiver
- [ ] Both activities have same connection_id

## 🔄 Stored Procedure Testing

### GetUserActivity
```sql
CALL GetUserActivity(1, 10);
```
- [ ] Returns user's activities
- [ ] Includes activity type, text, timestamp
- [ ] Includes reference titles
- [ ] Includes post_id for navigation
- [ ] Ordered by most recent first

### GetConnectionSuggestions
```sql
CALL GetConnectionSuggestions(1, 5);
```
- [ ] Returns 2nd degree connections
- [ ] Excludes already connected users
- [ ] Includes mutual_connections count
- [ ] Ordered by mutual connections DESC
- [ ] Limit works correctly

### GetMutualConnectionsCount
```sql
CALL GetMutualConnectionsCount(1, 2);
```
- [ ] Returns accurate count
- [ ] Works for users with no mutual connections (returns 0)
- [ ] Works for users with multiple mutual connections

## 🐛 Edge Cases

### Empty States
- [ ] Activity page with no activities shows empty state
- [ ] Connections page with no connections shows empty state
- [ ] Suggestions with no suggestions shows empty state
- [ ] Feed with no posts shows empty state

### Error Handling
- [ ] Invalid post ID returns 404
- [ ] Unauthorized actions return 403
- [ ] Missing auth token returns 401
- [ ] Database errors show user-friendly messages

### Concurrent Operations
- [ ] Multiple users liking same post simultaneously
- [ ] Multiple comments on same post
- [ ] Multiple connection requests
- [ ] Counts remain accurate

### Data Integrity
- [ ] Deleting a post removes all likes
- [ ] Deleting a post removes all comments
- [ ] Deleting a comment removes all likes
- [ ] Removing connection removes from both users

## 📱 UI/UX Testing

### Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Navigation adapts to screen size

### Loading States
- [ ] Shows loading indicator while fetching data
- [ ] Skeleton loaders for cards
- [ ] Smooth transitions

### User Feedback
- [ ] Toast notifications for actions
- [ ] Success messages for likes, comments, connections
- [ ] Error messages for failures
- [ ] Confirmation dialogs for destructive actions

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Alt text for images
- [ ] ARIA labels present

## 🔐 Security Testing

### Authentication
- [ ] Protected routes redirect to login
- [ ] Invalid tokens are rejected
- [ ] Expired tokens are handled
- [ ] Logout clears token

### Authorization
- [ ] Users can only edit their own posts
- [ ] Users can only delete their own comments
- [ ] Connection requests require auth
- [ ] Activity endpoint requires auth

### Input Validation
- [ ] SQL injection attempts fail
- [ ] XSS attempts are sanitized
- [ ] Long inputs are handled
- [ ] Special characters are escaped

## 📊 Performance Testing

### Load Times
- [ ] Feed loads in < 2 seconds
- [ ] Connections page loads in < 2 seconds
- [ ] Activity page loads in < 2 seconds
- [ ] Profile page loads in < 2 seconds

### Database Queries
- [ ] No N+1 query problems
- [ ] Indexes are used (check EXPLAIN)
- [ ] Stored procedures are faster than equivalent queries
- [ ] Connection pooling works

### Frontend Performance
- [ ] No memory leaks
- [ ] React Query caching works
- [ ] Images lazy load
- [ ] Code splitting works

## ✅ Final Checklist

### Documentation
- [ ] SETUP_GUIDE.md is accurate
- [ ] CHANGES_SUMMARY.md is complete
- [ ] QUICK_REFERENCE.md is helpful
- [ ] ARCHITECTURE.md is clear
- [ ] README files are updated

### Code Quality
- [ ] No console.log statements in production
- [ ] No commented-out code
- [ ] Consistent code style
- [ ] Meaningful variable names
- [ ] Functions are documented

### Deployment Ready
- [ ] Environment variables documented
- [ ] Database migration script tested
- [ ] Build process works
- [ ] No hardcoded credentials
- [ ] Error logging configured

## 🎉 Sign-Off

- [ ] All critical features tested
- [ ] All bugs fixed
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Ready for production

---

**Testing Date:** _______________

**Tested By:** _______________

**Issues Found:** _______________

**Status:** ⬜ Pass | ⬜ Fail | ⬜ Needs Review
