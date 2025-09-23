-- Mise à jour du mot de passe administrateur avec un hash BCrypt correct
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf6' WHERE email = 'admin@precaju.gw';

-- Vérification
SELECT email, 'Hash mis à jour avec succès' as status FROM users WHERE email = 'admin@precaju.gw';
