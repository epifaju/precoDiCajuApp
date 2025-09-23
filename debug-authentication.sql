-- Script pour déboguer l'authentification
SELECT 
    email,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 10) || '...' || RIGHT(password_hash, 10) as hash_preview,
    active,
    email_verified,
    role,
    CASE 
        WHEN active AND email_verified THEN 'CAN_LOGIN' 
        ELSE 'CANNOT_LOGIN' 
    END as login_status
FROM users 
WHERE email = 'admin@precaju.gw';
