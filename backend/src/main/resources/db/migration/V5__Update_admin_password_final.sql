-- Mise à jour du mot de passe de l'utilisateur admin
-- Nouveau mot de passe: admin123
-- Hash BCrypt généré par l'application: $2a$10$Uc9LSxavz4xOjwJPH8/p/ejBWGUiANdOUWPfvotWhfICz6fV8PS4i
UPDATE users 
SET password_hash = '$2a$10$Uc9LSxavz4xOjwJPH8/p/ejBWGUiANdOUWPfvotWhfICz6fV8PS4i'
WHERE email = 'admin@precaju.gw';
