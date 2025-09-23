-- Diagnostic final pour comprendre le problème d'authentification

-- 1. Vérifier la structure de la table users
\d users;

-- 2. Vérifier tous les utilisateurs et leurs hashes
SELECT 
    email,
    CASE 
        WHEN email = 'admin@precaju.gw' THEN 'admin123'
        WHEN email = 'test@example.com' THEN 'password123'
        ELSE 'test123'
    END as expected_password,
    LENGTH(password_hash) as hash_length,
    LEFT(password_hash, 7) as hash_start,
    RIGHT(password_hash, 10) as hash_end,
    active,
    email_verified,
    role
FROM users 
ORDER BY email;

-- 3. Vérifier les contraintes et les triggers
SELECT conname, contype, confdeltype, confupdtype 
FROM pg_constraint 
WHERE conrelid = 'users'::regclass;
