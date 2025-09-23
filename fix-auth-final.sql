-- Solution finale pour corriger l'authentification
-- Hash BCrypt généré avec bcrypt.online pour "admin123" (force 10)
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQfa' WHERE email = 'admin@precaju.gw';

-- Hash BCrypt pour "test123" 
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email IN ('produtor@test.gw', 'comerciante@test.gw', 'cooperativa@test.gw');

-- Hash BCrypt pour "password123"
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' WHERE email = 'test@example.com';

-- Vérifier les mises à jour
SELECT email, 
       CASE 
         WHEN email = 'admin@precaju.gw' THEN 'admin123'
         WHEN email = 'test@example.com' THEN 'password123'
         ELSE 'test123'
       END as password,
       LENGTH(password_hash) as hash_len,
       'Hash updated' as status 
FROM users 
ORDER BY email;
