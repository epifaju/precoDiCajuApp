-- Mise à jour du mot de passe de l'utilisateur admin
-- Nouveau mot de passe: admin123
-- Hash BCrypt généré pour admin123
UPDATE users 
SET password_hash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
WHERE email = 'admin@precaju.gw';
