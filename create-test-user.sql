-- Créer un utilisateur de test avec un hash que nous générons nous-mêmes
-- Hash BCrypt pour "password123" généré avec bcrypt online tool
INSERT INTO users (
    email, 
    password_hash, 
    full_name, 
    role, 
    reputation_score, 
    email_verified, 
    active,
    preferred_language
) VALUES (
    'test@example.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeOK4LYYm5L3Z8LB6',
    'Test User',
    'contributor',
    0,
    true,
    true,
    'pt'
) ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    email_verified = EXCLUDED.email_verified,
    active = EXCLUDED.active;

-- Vérifier l'insertion
SELECT email, 'User created/updated' as status FROM users WHERE email = 'test@example.com';
