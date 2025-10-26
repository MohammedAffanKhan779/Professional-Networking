# ProConnect - Troubleshooting Guide

## 🔍 Connection Issues

### Issue: "Connection request sent" but not showing in Sent tab

**Possible Causes:**
1. Token not being sent correctly
2. User ID mismatch
3. Database query issue

**Debug Steps:**

1. **Check Browser Console**
```javascript
// Open browser console (F12) and check for:
// - Network errors
// - API response data
// - Console logs showing counts
```

2. **Check Backend Logs**
```bash
# Look for these logs in your backend console:
# - "Getting sent requests for user: X"
# - "Found sent requests: Y"
```

3. **Verify Token**
```javascript
// In browser console:
console.log(localStorage.getItem('token'));
console.log(localStorage.getItem('userId'));
```

4. **Test API Directly**
```bash
# Replace YOUR_TOKEN with your actual token
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/connections/pending/sent
```

5. **Check Database**
```sql
-- Run this in MySQL:
USE professional_network;

-- Replace 1 with your user ID
SELECT * FROM CONNECTIONS WHERE REQUEST_ID = 1 AND STATUS = 'pending';
```

### Issue: "Connection request already exists" error

**Cause:** You've already sent a request to this user or they've sent one to you.

**Solution:**
1. Check the Pending tab (if they sent to you)
2. Check the Sent tab (if you sent to them)
3. Check the Connections tab (if already connected)

**Fix in Database:**
```sql
-- Check existing connection
SELECT * FROM CONNECTIONS 
WHERE (REQUEST_ID = YOUR_ID AND RECEIVER_ID = OTHER_ID)
OR (REQUEST_ID = OTHER_ID AND RECEIVER_ID = YOUR_ID);

-- If stuck, delete and retry:
DELETE FROM CONNECTIONS 
WHERE (REQUEST_ID = YOUR_ID AND RECEIVER_ID = OTHER_ID)
OR (REQUEST_ID = OTHER_ID AND RECEIVER_ID = YOUR_ID);
```

### Issue: Sent requests not showing after sending

**Debug:**

1. **Check if request was created**
```sql
SELECT * FROM CONNECTIONS 
WHERE REQUEST_ID = YOUR_USER_ID 
ORDER BY REQUESTED_AT DESC 
LIMIT 5;
```

2. **Check frontend state**
```javascript
// In browser console after clicking Connect:
// You should see logs like:
// "Fetching connections data..."
// "Sent: X"
```

3. **Verify API response**
- Open Network tab in browser DevTools
- Click Connect button
- Check the response from `/api/connections/request`
- Should return `{ message: "Connection request sent", connectionId: X }`

## 🐛 Common Errors

### Error: "Access denied. No token provided"

**Cause:** Token not in localStorage or not being sent

**Fix:**
```javascript
// Check token exists
if (!localStorage.getItem('token')) {
  console.log('No token found - please login');
}

// Check token format
const token = localStorage.getItem('token');
console.log('Token:', token?.substring(0, 20) + '...');
```

### Error: "Invalid token format"

**Cause:** Token not in "Bearer <token>" format

**Fix:** The axios instance should automatically add "Bearer " prefix. Check `frontend/src/lib/axios.ts`

### Error: "Failed to load connections"

**Possible Causes:**
1. Backend not running
2. Database connection issue
3. CORS issue

**Debug:**
```bash
# 1. Check backend is running
curl http://localhost:5000/

# 2. Check database connection
# Look for errors in backend console

# 3. Check CORS
# In backend/server.js, verify:
# cors({ origin: 'http://localhost:8080', credentials: true })
```

## 🔧 Quick Fixes

### Reset Connections Data
```sql
-- Backup first!
CREATE TABLE CONNECTIONS_BACKUP AS SELECT * FROM CONNECTIONS;

-- Clear all connections
DELETE FROM CONNECTIONS;

-- Re-insert sample data
-- (Use sample-entries.sql)
```

### Fix Incorrect Counts
```sql
-- If connection counts seem wrong, run:
SELECT 
    u.USER_ID,
    u.F_NAME,
    u.L_NAME,
    (SELECT COUNT(*) FROM CONNECTIONS 
     WHERE (REQUEST_ID = u.USER_ID OR RECEIVER_ID = u.USER_ID) 
     AND STATUS = 'accepted') as connection_count
FROM USERS u;
```

### Clear Frontend Cache
```bash
# In frontend directory:
rm -rf node_modules/.vite
npm run dev
```

### Restart Everything
```bash
# Backend
cd backend
# Ctrl+C to stop
npm start

# Frontend
cd frontend
# Ctrl+C to stop
npm run dev
```

## 📊 Debugging Checklist

### Backend
- [ ] Server is running on port 5000
- [ ] No errors in console
- [ ] Database connection successful
- [ ] JWT_SECRET is set in .env
- [ ] Logs show "Getting sent requests for user: X"

### Frontend
- [ ] App is running on port 8080
- [ ] No errors in browser console
- [ ] Token exists in localStorage
- [ ] userId exists in localStorage
- [ ] Network tab shows successful API calls
- [ ] Console logs show correct counts

### Database
- [ ] CONNECTIONS table exists
- [ ] Sample data is loaded
- [ ] Queries return expected results
- [ ] No foreign key errors

## 🧪 Test Scenarios

### Test 1: Send Connection Request
1. Login as User A
2. Go to /connections
3. Click Suggestions tab
4. Click Connect on User B
5. **Expected:** Toast shows "Connection request sent"
6. **Expected:** User B appears in Sent tab
7. **Expected:** Suggestions count decreases by 1

### Test 2: Receive Connection Request
1. Login as User B
2. Go to /connections
3. Click Pending tab
4. **Expected:** User A's request appears
5. Click Accept
6. **Expected:** Toast shows "Connection request accepted"
7. **Expected:** User A appears in Connections tab

### Test 3: Cancel Sent Request
1. Login as User A
2. Go to /connections
3. Click Sent tab
4. Click "Cancel Request" on User B
5. **Expected:** Toast shows "Connection request cancelled"
6. **Expected:** User B disappears from Sent tab
7. **Expected:** User B reappears in Suggestions

## 🔍 SQL Debugging Queries

### Check User's Connections
```sql
-- Replace 1 with your user ID
CALL GetUserActivity(1, 20);
```

### Check Connection Status Between Two Users
```sql
-- Check if connection exists between user 1 and user 2
SELECT * FROM CONNECTIONS 
WHERE (REQUEST_ID = 1 AND RECEIVER_ID = 2)
OR (REQUEST_ID = 2 AND RECEIVER_ID = 1);
```

### Find Orphaned Connections
```sql
-- Connections with invalid user IDs
SELECT c.* FROM CONNECTIONS c
LEFT JOIN USERS u1 ON c.REQUEST_ID = u1.USER_ID
LEFT JOIN USERS u2 ON c.RECEIVER_ID = u2.USER_ID
WHERE u1.USER_ID IS NULL OR u2.USER_ID IS NULL;
```

### Check Recent Activity
```sql
SELECT * FROM USER_ACTIVITY 
WHERE ACTIVITY_TYPE = 'connection' 
ORDER BY CREATED_AT DESC 
LIMIT 10;
```

## 📝 Logging Tips

### Enable Detailed Logging

**Backend:**
```javascript
// In connectionsController.js, add:
console.log('Request body:', req.body);
console.log('User ID:', req.userId);
console.log('Query result:', requests);
```

**Frontend:**
```javascript
// In Connections.tsx, add:
console.log('Sent requests data:', sentRes.data);
console.log('Token:', localStorage.getItem('token')?.substring(0, 20));
```

## 🆘 Still Having Issues?

1. **Check all files are saved**
2. **Restart both backend and frontend**
3. **Clear browser cache and localStorage**
4. **Run migration script again**
5. **Check for typos in user IDs**
6. **Verify sample data is loaded**

### Get System Status
```bash
# Backend
curl http://localhost:5000/

# Check specific endpoint
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/connections/pending/sent

# Check database
mysql -u root -p professional_network -e "SELECT COUNT(*) FROM CONNECTIONS;"
```

### Reset Everything
```bash
# 1. Stop all servers
# 2. Reset database
mysql -u root -p professional_network < backend/sql-schema/schema.sql
mysql -u root -p professional_network < backend/sql-schema/sample-entries.sql

# 3. Clear frontend
cd frontend
rm -rf node_modules/.vite
npm run dev

# 4. Restart backend
cd backend
npm start

# 5. Clear browser data
# - Clear localStorage
# - Clear cookies
# - Hard refresh (Ctrl+Shift+R)

# 6. Login again
```

---

**Last Updated:** October 2025  
**Version:** 2.0.0
