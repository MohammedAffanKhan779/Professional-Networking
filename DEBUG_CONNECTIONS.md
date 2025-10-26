# Debug Connections Issue

## Current Situation

You're logged in as **User 10** and have these connections in the database:

```
Sent by you (REQUEST_ID = 10):
- Connection 7: To User 1 (pending)
- Connection 8: To User 2 (pending)
- Connection 9: To User 3 (pending)
- Connection 10: To User 5 (pending)

Received by you (RECEIVER_ID = 10):
- Connection 6: From User 8 (pending)
```

## Expected Behavior

When you go to `/connections`:

1. **Connections Tab**: Should show 0 (no accepted connections)
2. **Pending Tab**: Should show 1 request from User 8
3. **Sent Tab**: Should show 4 requests to Users 1, 2, 3, 5
4. **Suggestions Tab**: Should show other users

## Debug Steps

### Step 1: Check Authentication

1. **Restart your backend server** (to load new debug endpoint)
2. **Go to** `http://localhost:8080/debug-auth`
3. **Check the output**:
   - `authenticatedUserId` should be `10`
   - `sentRequests` should show 4 items
   - `receivedRequests` should show 1 item

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to `/connections`
3. Look for these logs:
   ```
   Fetching connections data...
   Connections: 0
   Pending: 1
   Sent: 4
   Suggestions: X
   ```

### Step 3: Check Backend Console

Look for these logs:
```
Getting sent requests for user: 10
Found sent requests: 4
```

## Common Issues

### Issue 1: Token is for wrong user

**Symptom:** `authenticatedUserId` on debug page is not 10

**Fix:**
```javascript
// In browser console:
localStorage.clear();
// Then login again as user 10
```

### Issue 2: userId in localStorage doesn't match token

**Symptom:** localStorage shows userId: 10, but token is for different user

**Fix:**
```javascript
// In browser console:
localStorage.removeItem('token');
localStorage.removeItem('userId');
// Then login again
```

### Issue 3: Backend not receiving token

**Symptom:** Debug page shows authentication error

**Check:**
1. Token exists: `localStorage.getItem('token')`
2. Token format: Should start with `eyJ...`
3. Backend is running on port 5000

## Manual SQL Test

Run this in MySQL to verify data:

```sql
-- Check what user 10 sent
SELECT 
    c.CONNECTION_ID,
    c.RECEIVER_ID,
    u.F_NAME,
    u.L_NAME,
    c.STATUS
FROM CONNECTIONS c
JOIN USERS u ON c.RECEIVER_ID = u.USER_ID
WHERE c.REQUEST_ID = 10;

-- Check what user 10 received
SELECT 
    c.CONNECTION_ID,
    c.REQUEST_ID,
    u.F_NAME,
    u.L_NAME,
    c.STATUS
FROM CONNECTIONS c
JOIN USERS u ON c.REQUEST_ID = u.USER_ID
WHERE c.RECEIVER_ID = 10;
```

## Quick Fix

If nothing works, try this:

```bash
# 1. Stop backend (Ctrl+C)
# 2. Restart backend
cd backend
npm start

# 3. In browser:
# - Open DevTools (F12)
# - Go to Application tab
# - Clear all localStorage
# - Close browser completely
# - Open browser again
# - Login as user 10
# - Go to /debug-auth first
# - Then go to /connections
```

## Test API Directly

```bash
# Get your token from browser console:
# localStorage.getItem('token')

# Test sent requests endpoint:
curl -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  http://localhost:5000/api/connections/pending/sent

# Should return array with 4 items for user 10
```

## Expected API Response

For user 10, `/api/connections/pending/sent` should return:

```json
[
  {
    "CONNECTION_ID": 10,
    "REQUESTED_AT": "2025-10-23T12:05:31.000Z",
    "STATUS": "pending",
    "USER_ID": 5,
    "F_NAME": "Neha",
    "L_NAME": "Reddy",
    "HEADLINE": "Security Analyst | Ethical Hacker",
    "PROFILE_PIC_URL": null,
    "CITY": "Hyderabad",
    "COUNTRY": "India"
  },
  // ... 3 more items
]
```

## Next Steps

1. **Visit `/debug-auth`** to see what user ID the backend thinks you are
2. **Check browser console** for any errors
3. **Check backend console** for the logs
4. **If authenticatedUserId is wrong**, clear localStorage and login again
5. **If authenticatedUserId is correct but no data**, check the SQL queries manually

---

**The most likely issue:** Your token is for a different user than user 10. The debug page will confirm this.
