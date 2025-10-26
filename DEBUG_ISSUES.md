# Debug Current Issues

## Issue 1: Can't See All People

### Test the endpoint directly:

```bash
# This should return all users
curl http://localhost:5000/api/users/all

# If it returns "User not found", the route is being matched by /:userId
```

### Possible causes:

1. **Backend not restarted** - Old code still running
2. **Route order issue** - /:userId matching before /all
3. **Caching** - Browser or server caching old routes

### Fix Steps:

1. **Stop backend completely** (Ctrl+C)
2. **Verify it's stopped** (check port 5000 is free)
3. **Start backend again**
   ```bash
   cd backend
   npm start
   ```
4. **Check console logs** - Should see:
   ```
   Server running on port 5000
   ```
5. **Test endpoint**:
   ```bash
   curl http://localhost:5000/api/users/all
   ```
6. **Should return JSON array of users**

### If still not working:

Check if the route is even registered:

```javascript
// In backend/server.js, add this before app.listen():
console.log('Registered routes:');
app._router.stack.forEach(r => {
  if (r.route) console.log(r.route.path);
});
```

---

## Issue 2: Like Count Not As Expected

### Check database counts:

```bash
mysql -u root -p professional_network < backend/sql-schema/check-counts.sql
```

This will show:
- Stored counts vs actual counts
- Which posts have wrong counts

### Common scenarios:

#### Scenario A: Counts are negative
**Cause:** Triggers fired multiple times or manual updates conflicted

**Fix:**
```sql
-- Reset all counts to actual values
UPDATE POSTS p SET LIKES_COUNT = (
    SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID
);
UPDATE POSTS p SET COMMENTS_COUNT = (
    SELECT COUNT(*) FROM COMMENTS c WHERE c.POST_ID = p.POST_ID
);
```

#### Scenario B: Counts don't update when liking
**Cause:** Triggers not installed or not working

**Check triggers:**
```sql
SHOW TRIGGERS WHERE `Trigger` LIKE '%like%';
```

**Should see:**
- after_post_like_insert
- after_post_like_delete
- after_comment_like_insert
- after_comment_like_delete

**If missing, re-run migration:**
```bash
mysql -u root -p professional_network < backend/sql-schema/migration-add-triggers.sql
```

#### Scenario C: Counts double-increment
**Cause:** Both triggers AND controller updating counts

**Check:** Make sure postsController.js doesn't have manual UPDATE statements for counts

---

## Quick Debug Checklist

### Backend:
- [ ] Backend is running on port 5000
- [ ] No errors in console
- [ ] `curl http://localhost:5000/api/users/all` returns users
- [ ] Console shows "Getting all users..." when endpoint is hit
- [ ] Console shows "Found users: X"

### Database:
- [ ] Triggers exist (run `SHOW TRIGGERS;`)
- [ ] Counts match reality (run check-counts.sql)
- [ ] USER_ACTIVITY table exists
- [ ] Sample data is loaded

### Frontend:
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Clear cache
- [ ] Check browser console for errors
- [ ] Check Network tab for API responses

---

## Test Like Functionality Step by Step

### 1. Check current state:
```sql
SELECT POST_ID, LIKES_COUNT FROM POSTS WHERE POST_ID = 1;
SELECT COUNT(*) FROM POST_LIKES WHERE POST_ID = 1;
```

### 2. Like the post via UI
- Click the like button
- Check browser console for errors
- Check backend console for logs

### 3. Check database immediately:
```sql
SELECT POST_ID, LIKES_COUNT FROM POSTS WHERE POST_ID = 1;
SELECT COUNT(*) FROM POST_LIKES WHERE POST_ID = 1;
```

### 4. Expected results:
- LIKES_COUNT should match COUNT(*)
- If you liked it, COUNT should be +1
- If you unliked it, COUNT should be -1

### 5. If counts don't match:
```sql
-- Check if trigger exists
SHOW TRIGGERS WHERE `Table` = 'POST_LIKES';

-- Check trigger definition
SHOW CREATE TRIGGER after_post_like_insert;

-- If trigger is missing, re-run migration
```

---

## Test People Page Step by Step

### 1. Open browser DevTools (F12)

### 2. Go to `/people`

### 3. Check Console tab:
Should see:
```
Fetching users...
```

### 4. Check Network tab:
- Look for request to `/api/users/all`
- Check the response
- If 404 or "User not found", route is wrong

### 5. If request fails:
```bash
# Test directly
curl http://localhost:5000/api/users/all

# Should return JSON array, not "User not found"
```

### 6. If returns "User not found":
- Backend is treating "all" as a userId
- Route order is wrong OR backend not restarted
- **Solution:** Restart backend completely

---

## Nuclear Option: Complete Reset

If nothing works:

### 1. Stop everything
```bash
# Stop backend (Ctrl+C)
# Close browser completely
```

### 2. Reset database counts
```sql
USE professional_network;

-- Fix all counts
UPDATE POSTS p SET LIKES_COUNT = (SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID);
UPDATE POSTS p SET COMMENTS_COUNT = (SELECT COUNT(*) FROM COMMENTS c WHERE c.POST_ID = p.POST_ID);
UPDATE COMMENTS c SET LIKES_COUNT = (SELECT COUNT(*) FROM COMMENT_LIKES cl WHERE cl.COMMENT_ID = c.COMMENT_ID);

-- Verify triggers exist
SHOW TRIGGERS;

-- If no triggers, re-run migration
SOURCE backend/sql-schema/migration-add-triggers.sql;
```

### 3. Restart backend
```bash
cd backend
npm start
```

### 4. Test API directly
```bash
curl http://localhost:5000/api/users/all
curl http://localhost:5000/api/posts
```

### 5. Clear browser completely
- Clear all cache
- Clear localStorage
- Close and reopen browser

### 6. Login and test
- Login fresh
- Go to /people
- Try liking a post

---

## Expected Behavior

### People Page:
1. Shows list of all users
2. Search bar filters results
3. Connection status shows for each user
4. Connect button works

### Like Functionality:
1. Click like → count +1, heart fills
2. Click unlike → count -1, heart empties
3. Refresh page → like status persists
4. Database count matches UI count

---

## Get Help

If still not working, provide:

1. **Backend console output** when accessing /people
2. **Browser console errors**
3. **Network tab response** for /api/users/all
4. **Database counts** from check-counts.sql
5. **Trigger list** from SHOW TRIGGERS

This will help identify the exact issue!
