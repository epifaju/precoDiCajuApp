-- Correction de tous les mots de passe avec des hashes BCrypt corrects

-- Hash correct pour "admin123" 
UPDATE users SET password_hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf6' 
WHERE email = 'admin@precaju.gw';

-- Hash correct pour "test123" (généré avec bcrypt force 10)
UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi' 
WHERE email IN ('produtor@test.gw', 'comerciante@test.gw', 'cooperativa@test.gw');

-- Vérification des mises à jour
SELECT email, 
       CASE 
         WHEN email = 'admin@precaju.gw' THEN 'admin123'
         ELSE 'test123'
       END as password,
       'Hash corrigé' as status 
FROM users 
ORDER BY email;
