-- Test Activity Tracking
USE professional_network;

-- Check if USER_ACTIVITY table exists
SHOW TABLES LIKE 'USER_ACTIVITY';

-- Check if GetUserActivity procedure exists
SHOW PROCEDURE STATUS WHERE Db = 'professional_network' AND Name = 'GetUserActivity';

-- Check if triggers exist
SHOW TRIGGERS WHERE `Trigger` LIKE '%activity%' OR `Trigger` LIKE '%post%' OR `Trigger` LIKE '%comment%';

-- Check current activity data
SELECT * FROM USER_ACTIVITY ORDER BY CREATED_AT DESC LIMIT 10;

-- Test the stored procedure for user 10
CALL GetUserActivity(10, 20);

-- Count activities by type for user 10
SELECT ACTIVITY_TYPE, COUNT(*) as count 
FROM USER_ACTIVITY 
WHERE USER_ID = 10 
GROUP BY ACTIVITY_TYPE;

-- Check if triggers are logging activities
-- Insert a test like and see if it creates an activity
-- (Don't run this if you don't want test data)
-- INSERT INTO POST_LIKES (POST_ID, USER_ID) VALUES (1, 10);
-- SELECT * FROM USER_ACTIVITY WHERE USER_ID = 10 ORDER BY CREATED_AT DESC LIMIT 1;
