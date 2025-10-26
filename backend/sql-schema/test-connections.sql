-- Test Connections Data
-- Run this to check your connections data

USE professional_network;

-- Check all connections
SELECT 
    c.CONNECTION_ID,
    c.STATUS,
    c.REQUESTED_AT,
    c.ACCEPTED_AT,
    requester.F_NAME as requester_name,
    requester.USER_ID as requester_id,
    receiver.F_NAME as receiver_name,
    receiver.USER_ID as receiver_id
FROM CONNECTIONS c
JOIN USERS requester ON c.REQUEST_ID = requester.USER_ID
JOIN USERS receiver ON c.RECEIVER_ID = receiver.USER_ID
ORDER BY c.REQUESTED_AT DESC;

-- Check pending requests for user 1
SELECT 
    c.CONNECTION_ID,
    c.REQUESTED_AT,
    u.USER_ID,
    u.F_NAME,
    u.L_NAME,
    u.HEADLINE
FROM CONNECTIONS c
JOIN USERS u ON c.REQUEST_ID = u.USER_ID
WHERE c.RECEIVER_ID = 1 AND c.STATUS = 'pending';

-- Check sent requests from user 1
SELECT 
    c.CONNECTION_ID,
    c.REQUESTED_AT,
    u.USER_ID,
    u.F_NAME,
    u.L_NAME,
    u.HEADLINE
FROM CONNECTIONS c
JOIN USERS u ON c.RECEIVER_ID = u.USER_ID
WHERE c.REQUEST_ID = 1 AND c.STATUS = 'pending';

-- Check accepted connections for user 1
SELECT 
    u.USER_ID,
    u.F_NAME,
    u.L_NAME,
    u.HEADLINE,
    c.ACCEPTED_AT
FROM CONNECTIONS c
JOIN USERS u ON (c.RECEIVER_ID = u.USER_ID OR c.REQUEST_ID = u.USER_ID)
WHERE (c.REQUEST_ID = 1 OR c.RECEIVER_ID = 1)
AND c.STATUS = 'accepted'
AND u.USER_ID != 1;

-- Count connections by status
SELECT STATUS, COUNT(*) as count
FROM CONNECTIONS
GROUP BY STATUS;
