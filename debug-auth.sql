-- Debug des utilisateurs et de leurs hash
SELECT 
    email, 
    password_hash,
    LENGTH(password_hash) as hash_length,
    active, 
    email_verified,
    role,
    created_at 
FROM users 
ORDER BY email;

-- Mettre à jour avec des hash simples connus
-- Hash pour "password" : $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi

UPDATE users SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

-- Vérifier
SELECT email, 'password' as new_password, active, email_verified FROM users;
