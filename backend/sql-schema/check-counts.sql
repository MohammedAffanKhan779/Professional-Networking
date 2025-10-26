-- Check Post Counts
USE professional_network;

-- Check posts with their actual counts
SELECT 
    p.POST_ID,
    p.TITLE,
    p.LIKES_COUNT as stored_likes,
    (SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID) as actual_likes,
    p.COMMENTS_COUNT as stored_comments,
    (SELECT COUNT(*) FROM COMMENTS c WHERE c.POST_ID = p.POST_ID) as actual_comments
FROM POSTS p
ORDER BY p.POST_ID;

-- Check if counts match
SELECT 
    'Posts with wrong like count' as issue,
    COUNT(*) as count
FROM POSTS p
WHERE p.LIKES_COUNT != (SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID)
UNION ALL
SELECT 
    'Posts with wrong comment count' as issue,
    COUNT(*) as count
FROM POSTS p
WHERE p.COMMENTS_COUNT != (SELECT COUNT(*) FROM COMMENTS c WHERE c.POST_ID = p.POST_ID);

-- Fix counts if needed
-- UPDATE POSTS p SET LIKES_COUNT = (SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID);
-- UPDATE POSTS p SET COMMENTS_COUNT = (SELECT COUNT(*) FROM COMMENTS c WHERE c.POST_ID = p.POST_ID);
