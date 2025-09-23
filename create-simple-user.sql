-- Créer un utilisateur simple pour diagnostic
-- D'abord, supprimer s'il existe
DELETE FROM users WHERE email = 'debug@test.com';

-- Insérer avec un hash très simple pour test
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    role, 
    email_verified, 
    active,
    preferred_language
) VALUES (
    'debug@test.com',
    'plaintext123',  -- Mot de passe en clair pour test
    'Debug User',
    'contributor',
    true,
    true,
    'pt'
);

-- Vérifier l'insertion
SELECT email, password_hash, 'plaintext123' as expected_password FROM users WHERE email = 'debug@test.com';
