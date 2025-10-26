# Test Activity Feature

## Prerequisites

Make sure you've run the migration script:
```bash
mysql -u root -p professional_network < backend/sql-schema/migration-add-triggers.sql
```

## Step 1: Verify Database Setup

Run this SQL script to check if everything is set up:
```bash
mysql -u root -p professional_network < backend/sql-schema/test-activity.sql
```

**Expected Output:**
- USER_ACTIVITY table exists
- GetUserActivity procedure exists
- 8 triggers exist (including activity-related ones)

## Step 2: Check Existing Activity Data

```sql
USE professional_network;

-- Check if you have any activity data
SELECT COUNT(*) FROM USER_ACTIVITY;

-- Check activity for user 10
SELECT * FROM USER_ACTIVITY WHERE USER_ID = 10 ORDER BY CREATED_AT DESC;
```

**If no data:** The triggers only log NEW activities after migration. You need to perform some actions.

## Step 3: Generate Activity Data

### Option A: Manually insert test data
```sql
-- Log some test activities for user 10
INSERT INTO USER_ACTIVITY (USER_ID, ACTIVITY_TYPE, REFERENCE_ID, ACTIVITY_TEXT)
VALUES 
(10, 'post', 1, 'Test post activity'),
(10, 'like_post', 1, 'Liked a post'),
(10, 'comment', 1, 'Test comment'),
(10, 'connection', 1, 'Connected with a user');
```

### Option B: Perform real actions (Better!)

1. **Create a post** (logged by trigger)
2. **Like a post** (logged by trigger)
3. **Comment on a post** (logged by trigger)
4. **Accept a connection** (logged by trigger)

## Step 4: Test the API

### Test with curl:
```bash
# Get your token from browser localStorage
# Then run:
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5000/api/posts/activity/me
```

**Expected Response:**
```json
[
  {
    "ACTIVITY_ID": 1,
    "ACTIVITY_TYPE": "post",
    "ACTIVITY_TEXT": "Test post activity",
    "CREATED_AT": "2025-10-23T12:00:00.000Z",
    "reference_title": "Post Title",
    "post_id": 1
  },
  ...
]
```

## Step 5: Test the Frontend

1. **Restart backend** (to load new logging code)
2. **Refresh frontend** (Ctrl+Shift+R)
3. **Go to** `http://localhost:8080/activity`
4. **Check browser console** for logs:
   ```
   Fetching activity...
   Activity data: [...]
   ```
5. **Check backend console** for logs:
   ```
   Getting activity for user: 10 limit: 50
   Found activities: X
   ```

## Troubleshooting

### Issue: "No activity yet" message

**Possible causes:**
1. No activity data in database
2. Stored procedure not found
3. User ID mismatch

**Debug:**
```sql
-- Check if procedure exists
SHOW PROCEDURE STATUS WHERE Name = 'GetUserActivity';

-- Test procedure directly
CALL GetUserActivity(10, 20);

-- Check raw data
SELECT * FROM USER_ACTIVITY WHERE USER_ID = 10;
```

### Issue: API returns empty array

**Check backend console:**
- Should see: "Getting activity for user: 10"
- Should see: "Found activities: X"

**If X is 0:**
```sql
-- Verify user 10 has activities
SELECT COUNT(*) FROM USER_ACTIVITY WHERE USER_ID = 10;
```

### Issue: Stored procedure error

**Error:** "PROCEDURE GetUserActivity does not exist"

**Fix:**
```bash
# Re-run migration
mysql -u root -p professional_network < backend/sql-schema/migration-add-triggers.sql
```

## Generate Test Activity

To quickly generate activity for testing:

```sql
USE professional_network;

-- User 10 likes some posts
INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (1, 10);
INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (2, 10);

-- User 10 comments on posts
INSERT INTO COMMENTS (POST_ID, USER_ID, CONTENT) 
VALUES (1, 10, 'Great post!');

-- Check if activities were logged
SELECT * FROM USER_ACTIVITY WHERE USER_ID = 10 ORDER BY CREATED_AT DESC;
```

**Note:** The triggers will automatically create activity entries!

## Verify Triggers Are Working

```sql
-- Before
SELECT COUNT(*) FROM USER_ACTIVITY WHERE USER_ID = 10;

-- Perform action
INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (3, 10);

-- After (should be +1)
SELECT COUNT(*) FROM USER_ACTIVITY WHERE USER_ID = 10;

-- Check the new activity
SELECT * FROM USER_ACTIVITY WHERE USER_ID = 10 ORDER BY CREATED_AT DESC LIMIT 1;
```

## Expected Behavior

When you visit `/activity`, you should see:
- All your posts
- All your comments
- All posts you liked
- All comments you liked
- All connections you made

Each activity should show:
- Icon (based on type)
- Badge with activity type
- Time ago (e.g., "2 hours ago")
- Activity description
- Content preview (if applicable)
- Clickable to navigate to the post

## Quick Test Checklist

- [ ] Migration script ran successfully
- [ ] USER_ACTIVITY table exists
- [ ] GetUserActivity procedure exists
- [ ] Triggers exist and are active
- [ ] Backend starts without errors
- [ ] Frontend loads without errors
- [ ] `/activity` page loads
- [ ] Browser console shows "Fetching activity..."
- [ ] Backend console shows "Getting activity for user: X"
- [ ] Activities display on the page (or "No activity yet" if none)
- [ ] Can click on activities to navigate to posts
- [ ] New actions create new activity entries

---

**If everything is set up correctly but no activities show:**
You need to perform some actions (like, comment, post) to generate activity data. The triggers only log NEW activities after they're installed.
