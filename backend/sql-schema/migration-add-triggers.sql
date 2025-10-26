-- Migration Script: Add Triggers, Procedures, and User Activity Table
-- Run this on existing databases to add new features

USE professional_network;

-- Add User Activity Table
CREATE TABLE IF NOT EXISTS USER_ACTIVITY (
    ACTIVITY_ID INT AUTO_INCREMENT PRIMARY KEY,
    USER_ID INT NOT NULL,
    ACTIVITY_TYPE ENUM('post', 'comment', 'like_post', 'like_comment', 'connection') NOT NULL,
    REFERENCE_ID INT NOT NULL,
    ACTIVITY_TEXT TEXT,
    CREATED_AT TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (USER_ID) REFERENCES USERS(USER_ID) ON DELETE CASCADE,
    INDEX idx_user (USER_ID),
    INDEX idx_type (ACTIVITY_TYPE),
    INDEX idx_created (CREATED_AT)
);

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS after_post_like_insert;
DROP TRIGGER IF EXISTS after_post_like_delete;
DROP TRIGGER IF EXISTS after_comment_insert;
DROP TRIGGER IF EXISTS after_comment_delete;
DROP TRIGGER IF EXISTS after_comment_like_insert;
DROP TRIGGER IF EXISTS after_comment_like_delete;
DROP TRIGGER IF EXISTS after_post_insert;
DROP TRIGGER IF EXISTS after_connection_accepted;

-- Drop existing procedures if they exist
DROP PROCEDURE IF EXISTS GetUserFeed;
DROP PROCEDURE IF EXISTS GetUserActivity;
DROP PROCEDURE IF EXISTS GetMutualConnectionsCount;
DROP PROCEDURE IF EXISTS GetConnectionSuggestions;

-- Create Triggers
DELIMITER //

CREATE TRIGGER after_post_like_insert
AFTER INSERT ON POST_LIKES
FOR EACH ROW
BEGIN
    UPDATE POSTS 
    SET LIKES_COUNT = LIKES_COUNT + 1 
    WHERE POST_ID = NEW.POST_ID;
    
    INSERT INTO USER_ACTIVITY (USER_ID, ACTIVITY_TYPE, REFERENCE_ID, ACTIVITY_TEXT)
    VALUES (NEW.USER_ID, 'like_post', NEW.POST_ID, 'Liked a post');
END//

CREATE TRIGGER after_post_like_delete
AFTER DELETE ON POST_LIKES
FOR EACH ROW
BEGIN
    UPDATE POSTS 
    SET LIKES_COUNT = GREATEST(LIKES_COUNT - 1, 0)
    WHERE POST_ID = OLD.POST_ID;
END//

CREATE TRIGGER after_comment_insert
AFTER INSERT ON COMMENTS
FOR EACH ROW
BEGIN
    UPDATE POSTS 
    SET COMMENTS_COUNT = COMMENTS_COUNT + 1 
    WHERE POST_ID = NEW.POST_ID;
    
    INSERT INTO USER_ACTIVITY (USER_ID, ACTIVITY_TYPE, REFERENCE_ID, ACTIVITY_TEXT)
    VALUES (NEW.USER_ID, 'comment', NEW.COMMENT_ID, SUBSTRING(NEW.CONTENT, 1, 100));
END//

CREATE TRIGGER after_comment_delete
AFTER DELETE ON COMMENTS
FOR EACH ROW
BEGIN
    UPDATE POSTS 
    SET COMMENTS_COUNT = GREATEST(COMMENTS_COUNT - 1, 0)
    WHERE POST_ID = OLD.POST_ID;
END//

CREATE TRIGGER after_comment_like_insert
AFTER INSERT ON COMMENT_LIKES
FOR EACH ROW
BEGIN
    UPDATE COMMENTS 
    SET LIKES_COUNT = LIKES_COUNT + 1 
    WHERE COMMENT_ID = NEW.COMMENT_ID;
    
    INSERT INTO USER_ACTIVITY (USER_ID, ACTIVITY_TYPE, REFERENCE_ID, ACTIVITY_TEXT)
    VALUES (NEW.USER_ID, 'like_comment', NEW.COMMENT_ID, 'Liked a comment');
END//

CREATE TRIGGER after_comment_like_delete
AFTER DELETE ON COMMENT_LIKES
FOR EACH ROW
BEGIN
    UPDATE COMMENTS 
    SET LIKES_COUNT = GREATEST(LIKES_COUNT - 1, 0)
    WHERE COMMENT_ID = OLD.COMMENT_ID;
END//

CREATE TRIGGER after_post_insert
AFTER INSERT ON POSTS
FOR EACH ROW
BEGIN
    INSERT INTO USER_ACTIVITY (USER_ID, ACTIVITY_TYPE, REFERENCE_ID, ACTIVITY_TEXT)
    VALUES (NEW.USER_ID, 'post', NEW.POST_ID, COALESCE(NEW.TITLE, SUBSTRING(NEW.CONTENT, 1, 100)));
END//

CREATE TRIGGER after_connection_accepted
AFTER UPDATE ON CONNECTIONS
FOR EACH ROW
BEGIN
    IF NEW.STATUS = 'accepted' AND OLD.STATUS = 'pending' THEN
        INSERT INTO USER_ACTIVITY (USER_ID, ACTIVITY_TYPE, REFERENCE_ID, ACTIVITY_TEXT)
        VALUES (NEW.REQUEST_ID, 'connection', NEW.CONNECTION_ID, 'Connected with a user');
        
        INSERT INTO USER_ACTIVITY (USER_ID, ACTIVITY_TYPE, REFERENCE_ID, ACTIVITY_TEXT)
        VALUES (NEW.RECEIVER_ID, 'connection', NEW.CONNECTION_ID, 'Connected with a user');
    END IF;
END//

DELIMITER ;

-- Create Stored Procedures
DELIMITER //

CREATE PROCEDURE GetUserFeed(IN p_user_id INT, IN p_limit INT, IN p_offset INT)
BEGIN
    SELECT p.*, u.F_NAME, u.L_NAME, u.PROFILE_PIC_URL, u.HEADLINE,
           p.CREATED_AT as createdAt,
           EXISTS(
               SELECT 1 FROM POST_LIKES pl 
               WHERE pl.POST_ID = p.POST_ID AND pl.USER_ID = p_user_id
           ) as isLiked
    FROM POSTS p
    JOIN USERS u ON p.USER_ID = u.USER_ID
    WHERE u.STATUS = 'active'
    AND p.USER_ID != p_user_id
    AND (
        p.USER_ID IN (
            SELECT CASE 
                WHEN REQUEST_ID = p_user_id THEN RECEIVER_ID
                WHEN RECEIVER_ID = p_user_id THEN REQUEST_ID
            END as connected_user_id
            FROM CONNECTIONS
            WHERE (REQUEST_ID = p_user_id OR RECEIVER_ID = p_user_id)
            AND STATUS = 'accepted'
        )
        OR p.USER_ID = p_user_id
    )
    ORDER BY p.CREATED_AT DESC
    LIMIT p_limit OFFSET p_offset;
END//

CREATE PROCEDURE GetUserActivity(IN p_user_id INT, IN p_limit INT)
BEGIN
    SELECT 
        ua.ACTIVITY_ID,
        ua.ACTIVITY_TYPE,
        ua.ACTIVITY_TEXT,
        ua.CREATED_AT,
        CASE ua.ACTIVITY_TYPE
            WHEN 'post' THEN (SELECT TITLE FROM POSTS WHERE POST_ID = ua.REFERENCE_ID)
            WHEN 'comment' THEN (SELECT CONTENT FROM COMMENTS WHERE COMMENT_ID = ua.REFERENCE_ID)
            ELSE NULL
        END as reference_title,
        CASE ua.ACTIVITY_TYPE
            WHEN 'post' THEN (SELECT POST_ID FROM POSTS WHERE POST_ID = ua.REFERENCE_ID)
            WHEN 'comment' THEN (SELECT POST_ID FROM COMMENTS WHERE COMMENT_ID = ua.REFERENCE_ID)
            WHEN 'like_post' THEN ua.REFERENCE_ID
            WHEN 'like_comment' THEN (SELECT POST_ID FROM COMMENTS WHERE COMMENT_ID = ua.REFERENCE_ID)
            ELSE NULL
        END as post_id
    FROM USER_ACTIVITY ua
    WHERE ua.USER_ID = p_user_id
    ORDER BY ua.CREATED_AT DESC
    LIMIT p_limit;
END//

CREATE PROCEDURE GetMutualConnectionsCount(IN p_user_id1 INT, IN p_user_id2 INT)
BEGIN
    SELECT COUNT(*) as mutual_count
    FROM (
        SELECT CASE 
            WHEN REQUEST_ID = p_user_id1 THEN RECEIVER_ID
            WHEN RECEIVER_ID = p_user_id1 THEN REQUEST_ID
        END as connection_id
        FROM CONNECTIONS
        WHERE (REQUEST_ID = p_user_id1 OR RECEIVER_ID = p_user_id1)
        AND STATUS = 'accepted'
    ) as user1_connections
    INNER JOIN (
        SELECT CASE 
            WHEN REQUEST_ID = p_user_id2 THEN RECEIVER_ID
            WHEN RECEIVER_ID = p_user_id2 THEN REQUEST_ID
        END as connection_id
        FROM CONNECTIONS
        WHERE (REQUEST_ID = p_user_id2 OR RECEIVER_ID = p_user_id2)
        AND STATUS = 'accepted'
    ) as user2_connections
    ON user1_connections.connection_id = user2_connections.connection_id;
END//

CREATE PROCEDURE GetConnectionSuggestions(IN p_user_id INT, IN p_limit INT)
BEGIN
    SELECT DISTINCT u.USER_ID, u.F_NAME, u.L_NAME, u.HEADLINE, 
           u.PROFILE_PIC_URL, u.CITY, u.COUNTRY,
           COUNT(DISTINCT c2.CONNECTION_ID) as mutual_connections
    FROM USERS u
    JOIN CONNECTIONS c2 ON (c2.REQUEST_ID = u.USER_ID OR c2.RECEIVER_ID = u.USER_ID)
    WHERE u.USER_ID != p_user_id
    AND u.STATUS = 'active'
    AND u.USER_ID NOT IN (
        SELECT CASE 
            WHEN REQUEST_ID = p_user_id THEN RECEIVER_ID
            WHEN RECEIVER_ID = p_user_id THEN REQUEST_ID
        END
        FROM CONNECTIONS
        WHERE (REQUEST_ID = p_user_id OR RECEIVER_ID = p_user_id)
    )
    AND (c2.REQUEST_ID IN (
        SELECT CASE 
            WHEN REQUEST_ID = p_user_id THEN RECEIVER_ID
            WHEN RECEIVER_ID = p_user_id THEN REQUEST_ID
        END
        FROM CONNECTIONS
        WHERE (REQUEST_ID = p_user_id OR RECEIVER_ID = p_user_id)
        AND STATUS = 'accepted'
    ) OR c2.RECEIVER_ID IN (
        SELECT CASE 
            WHEN REQUEST_ID = p_user_id THEN RECEIVER_ID
            WHEN RECEIVER_ID = p_user_id THEN REQUEST_ID
        END
        FROM CONNECTIONS
        WHERE (REQUEST_ID = p_user_id OR RECEIVER_ID = p_user_id)
        AND STATUS = 'accepted'
    ))
    GROUP BY u.USER_ID
    ORDER BY mutual_connections DESC
    LIMIT p_limit;
END//

DELIMITER ;

-- Fix existing counts (optional - run if counts are incorrect)
UPDATE POSTS p SET LIKES_COUNT = (
    SELECT COUNT(*) FROM POST_LIKES pl WHERE pl.POST_ID = p.POST_ID
);

UPDATE POSTS p SET COMMENTS_COUNT = (
    SELECT COUNT(*) FROM COMMENTS c WHERE c.POST_ID = p.POST_ID
);

UPDATE COMMENTS c SET LIKES_COUNT = (
    SELECT COUNT(*) FROM COMMENT_LIKES cl WHERE cl.COMMENT_ID = c.COMMENT_ID
);

SELECT 'Migration completed successfully!' as status;
