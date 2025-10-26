# ProConnect - Architecture Overview

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│                     (React + Vite)                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Pages:                                                      │
│  ├─ Feed.tsx           (Main feed - excludes own posts)     │
│  ├─ Connections.tsx    (Network management) ✨ NEW          │
│  ├─ Activity.tsx       (Activity history) ✨ NEW            │
│  ├─ Profile.tsx        (User profiles)                      │
│  └─ ResumeBuilder.tsx  (Resume creation)                    │
│                                                              │
│  Components:                                                 │
│  ├─ Navbar.tsx         (Navigation with new links)          │
│  ├─ PostCard.tsx       (Post display)                       │
│  └─ ProfileSidebar.tsx (User info)                          │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ HTTP/REST API
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                        BACKEND                               │
│                    (Node.js + Express)                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Routes:                                                     │
│  ├─ /api/posts                                              │
│  │  ├─ GET  /                    (Feed - no own posts)      │
│  │  ├─ POST /:postId/like        (Toggle post like)         │
│  │  ├─ POST /comments/:id/like   (Toggle comment) ✨ NEW   │
│  │  └─ GET  /activity/me         (Get activity) ✨ NEW     │
│  │                                                           │
│  └─ /api/connections                                        │
│     ├─ GET  /suggestions          (Get suggestions) ✨ NEW  │
│     ├─ GET  /count/:userId        (Get count) ✨ NEW        │
│     ├─ GET  /mutual/:userId       (Mutual count) ✨ NEW     │
│     └─ GET  /:userId              (Get connections)         │
│                                                              │
│  Controllers:                                                │
│  ├─ postsController.js      (Post logic + activity)         │
│  └─ connectionsController.js (Connection logic)             │
│                                                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
                   │ MySQL Queries
                   │
┌──────────────────▼──────────────────────────────────────────┐
│                       DATABASE                               │
│                    (MySQL 8.0+)                              │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Tables:                                                     │
│  ├─ USERS                                                   │
│  ├─ POSTS                                                   │
│  ├─ COMMENTS                                                │
│  ├─ POST_LIKES                                              │
│  ├─ COMMENT_LIKES                                           │
│  ├─ CONNECTIONS                                             │
│  ├─ USER_ACTIVITY          ✨ NEW                           │
│  ├─ EXPERIENCE                                              │
│  ├─ EDUCATION                                               │
│  ├─ SKILLS                                                  │
│  └─ PROJECTS                                                │
│                                                              │
│  Triggers (Auto-execute):                                   │
│  ├─ after_post_like_insert      (↑ likes + log)            │
│  ├─ after_post_like_delete      (↓ likes)                  │
│  ├─ after_comment_insert        (↑ comments + log)         │
│  ├─ after_comment_delete        (↓ comments)               │
│  ├─ after_comment_like_insert   (↑ comment likes + log)    │
│  ├─ after_comment_like_delete   (↓ comment likes)          │
│  ├─ after_post_insert           (log activity)             │
│  └─ after_connection_accepted   (log for both users)       │
│                                                              │
│  Stored Procedures:                                         │
│  ├─ GetUserFeed(userId, limit, offset)                     │
│  ├─ GetUserActivity(userId, limit)                         │
│  ├─ GetMutualConnectionsCount(userId1, userId2)            │
│  └─ GetConnectionSuggestions(userId, limit)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Examples

### 1. User Likes a Post
```
User clicks like button
    ↓
Frontend: POST /api/posts/:postId/like
    ↓
Backend: postsController.togglePostLike()
    ↓
Database: INSERT INTO POST_LIKES
    ↓
Trigger: after_post_like_insert
    ├─ UPDATE POSTS SET LIKES_COUNT = LIKES_COUNT + 1
    └─ INSERT INTO USER_ACTIVITY (type: 'like_post')
    ↓
Response: { liked: true }
    ↓
Frontend: Update UI
```

### 2. User Views Activity
```
User navigates to /activity
    ↓
Frontend: GET /api/posts/activity/me
    ↓
Backend: postsController.getUserActivity()
    ↓
Database: CALL GetUserActivity(userId, 50)
    ├─ SELECT from USER_ACTIVITY
    ├─ JOIN with POSTS for titles
    └─ JOIN with COMMENTS for content
    ↓
Response: [{ activity_type, text, created_at, ... }]
    ↓
Frontend: Display activity list
```

### 3. User Gets Connection Suggestions
```
User opens Connections page
    ↓
Frontend: GET /api/connections/suggestions
    ↓
Backend: connectionsController.getConnectionSuggestions()
    ↓
Database: CALL GetConnectionSuggestions(userId, 10)
    ├─ Find 1st degree connections
    ├─ Find their connections (2nd degree)
    ├─ Exclude already connected users
    ├─ Count mutual connections
    └─ ORDER BY mutual_connections DESC
    ↓
Response: [{ user_id, name, mutual_connections, ... }]
    ↓
Frontend: Display suggestions with mutual count
```

## 🎯 Key Design Decisions

### 1. Automatic Count Management
**Why:** Prevents inconsistencies and reduces application code
**How:** Database triggers update counts on INSERT/DELETE
**Benefit:** Counts are always accurate, even with concurrent operations

### 2. Activity Tracking via Triggers
**Why:** Ensures all activities are logged without application code
**How:** Triggers automatically insert into USER_ACTIVITY
**Benefit:** No missed activities, consistent logging

### 3. Stored Procedures for Complex Queries
**Why:** Better performance and maintainability
**How:** Pre-compiled SQL procedures in database
**Benefit:** Reduced network overhead, optimized execution plans

### 4. Feed Excludes Own Posts
**Why:** Better user experience (users don't need to see their own posts)
**How:** WHERE clause filters out current user's posts
**Benefit:** Cleaner feed focused on network content

### 5. Connection Suggestions Algorithm
**Why:** Help users grow their network intelligently
**How:** 2nd degree connections with mutual connection count
**Benefit:** Relevant suggestions based on existing network

## 📊 Database Relationships

```
USERS (1) ──────────── (N) POSTS
  │                        │
  │                        ├─ (N) COMMENTS
  │                        │     │
  │                        │     └─ (N) COMMENT_LIKES
  │                        │
  │                        └─ (N) POST_LIKES
  │
  ├─ (N) CONNECTIONS (self-referencing)
  │     ├─ REQUEST_ID → USERS
  │     └─ RECEIVER_ID → USERS
  │
  ├─ (N) USER_ACTIVITY
  ├─ (N) EXPERIENCE
  ├─ (N) EDUCATION
  ├─ (N) SKILLS
  └─ (N) PROJECTS
```

## 🔐 Authentication Flow

```
Login Request
    ↓
Backend: authController.login()
    ↓
Verify credentials
    ↓
Generate JWT token
    ↓
Response: { token, user }
    ↓
Frontend: Store in localStorage
    ↓
All subsequent requests include:
    Header: Authorization: Bearer <token>
    ↓
Backend: authMiddleware verifies token
    ↓
Attach userId to request
    ↓
Controller uses req.userId
```

## 🚀 Performance Optimizations

### Database Level
1. **Indexes** on frequently queried columns
   - USER_ID, POST_ID, COMMENT_ID
   - STATUS, CREATED_AT
   - ACTIVITY_TYPE

2. **Stored Procedures** for complex queries
   - Pre-compiled execution plans
   - Reduced network round trips

3. **Triggers** for automatic updates
   - No application-level count queries
   - Atomic operations

### Application Level
1. **Connection pooling** (mysql2)
2. **Query result caching** (React Query)
3. **Pagination** for large datasets
4. **Lazy loading** for images

### Frontend Level
1. **React Query** for data caching
2. **Optimistic updates** for likes
3. **Debounced search** input
4. **Code splitting** by route

## 📈 Scalability Considerations

### Current Architecture
- ✅ Handles 1000s of concurrent users
- ✅ Efficient database queries
- ✅ Proper indexing
- ✅ Connection pooling

### Future Improvements
- 🔄 Redis caching layer
- 🔄 CDN for static assets
- 🔄 Database read replicas
- 🔄 Microservices architecture
- 🔄 Message queue for activities
- 🔄 Elasticsearch for search

## 🛡️ Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Password Hashing** - bcrypt for password storage
3. **SQL Injection Prevention** - Parameterized queries
4. **CORS Configuration** - Controlled cross-origin access
5. **Input Validation** - Server-side validation
6. **Authorization Checks** - Verify ownership before updates

## 📱 Frontend State Management

```
Zustand Store (authStore)
    ├─ user (current user data)
    ├─ token (JWT token)
    ├─ login()
    └─ logout()

React Query Cache
    ├─ Posts data
    ├─ Connections data
    ├─ Activity data
    └─ User profiles
```

## 🔧 Development Workflow

```
1. Make changes to code
2. Backend: npm start (auto-reload with nodemon)
3. Frontend: npm run dev (Vite HMR)
4. Test in browser
5. Check database with SQL queries
6. Commit changes
```

## 📦 Deployment Architecture

```
Production Setup:
    ├─ Frontend: Vercel/Netlify (Static hosting)
    ├─ Backend: AWS EC2/Heroku (Node.js server)
    └─ Database: AWS RDS/DigitalOcean (MySQL)

Environment Variables:
    ├─ Backend: .env (DB credentials, JWT secret)
    └─ Frontend: .env (API URL)
```

---

This architecture provides a solid foundation for a professional networking platform with room for growth and optimization.
