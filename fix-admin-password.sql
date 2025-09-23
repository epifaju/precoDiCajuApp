-- Script pour corriger le mot de passe de l'administrateur
-- Mot de passe: admin123
-- Hash BCrypt généré avec force 10

UPDATE users 
SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf6'
WHERE email = 'admin@precaju.gw';

-- Vérification
SELECT email, 
       LENGTH(password_hash) as hash_length, 
       SUBSTRING(password_hash, 1, 30) || '...' as hash_preview,
       active,
       role
FROM users 
WHERE email = 'admin@precaju.gw';
