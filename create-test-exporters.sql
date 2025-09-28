-- Script SQL pour créer des exportateurs de test avec de vrais tokens QR
-- Ce script permet de tester l'API réelle de vérification QR

-- Vérifier que la table exportateurs existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'exportateurs') THEN
        RAISE EXCEPTION 'Table exportateurs n''existe pas. Veuillez d''abord créer la migration pour cette table.';
    END IF;
END $$;

-- Insérer des régions si elles n'existent pas
INSERT INTO regions (code, name_pt, name_fr, name_en) VALUES 
('BF', 'Bissau', 'Bissau', 'Bissau'),
('GA', 'Gabú', 'Gabú', 'Gabu'),
('CA', 'Cacheu', 'Cacheu', 'Cacheu'),
('OI', 'Oio', 'Oio', 'Oio'),
('QU', 'Quinara', 'Quinara', 'Quinara'),
('TO', 'Tombali', 'Tombali', 'Tombali'),
('BA', 'Bafatá', 'Bafatá', 'Bafata'),
('BL', 'Bolama', 'Bolama', 'Bolama')
ON CONFLICT (code) DO NOTHING;

-- Supprimer les exportateurs de test existants (pour éviter les doublons)
DELETE FROM exportateurs WHERE numero_agrement LIKE 'TEST-%';

-- Insérer des exportateurs de test avec de vrais tokens QR
INSERT INTO exportateurs (
    id,
    nom,
    numero_agrement,
    type,
    region_code,
    telephone,
    email,
    qr_code_token,
    date_certification,
    date_expiration,
    statut,
    created_at,
    updated_at
) VALUES 
-- Exportateur Test 1 - ACTIF
(
    gen_random_uuid(),
    'Exportateur Test Bissau',
    'TEST-BF-001-2024',
    'EXPORTATEUR',
    'BF',
    '+245 123 456 789',
    'test.bissau@exportateur.gw',
    'qr_a1b2c3d4_1703123456_x9y8z7w6',
    '2024-01-01',
    '2025-01-01',
    'ACTIF',
    NOW(),
    NOW()
),

-- Exportateur Test 2 - ACTIF
(
    gen_random_uuid(),
    'Exportateur Test Gabú',
    'TEST-GA-002-2024',
    'ACHETEUR_LOCAL',
    'GA',
    '+245 987 654 321',
    'test.gabu@exportateur.gw',
    'qr_e5f6g7h8_1703123457_m1n2o3p4',
    '2024-02-01',
    '2025-02-01',
    'ACTIF',
    NOW(),
    NOW()
),

-- Exportateur Test 3 - EXPIRE
(
    gen_random_uuid(),
    'Exportateur Test Cacheu',
    'TEST-CA-003-2023',
    'EXPORTATEUR',
    'CA',
    '+245 555 123 456',
    'test.cacheu@exportateur.gw',
    'qr_i9j0k1l2_1703123458_q5r6s7t8',
    '2023-01-01',
    '2023-12-31',
    'EXPIRE',
    NOW(),
    NOW()
),

-- Exportateur Test 4 - SUSPENDU
(
    gen_random_uuid(),
    'Exportateur Test Oio',
    'TEST-OI-004-2024',
    'EXPORTATEUR',
    'OI',
    '+245 777 888 999',
    'test.oio@exportateur.gw',
    'qr_u3v4w5x6_1703123459_y9z0a1b2',
    '2024-03-01',
    '2025-03-01',
    'SUSPENDU',
    NOW(),
    NOW()
),

-- Exportateur Test 5 - ACTIF (pour plus de variété)
(
    gen_random_uuid(),
    'Exportateur Test Quinara',
    'TEST-QU-005-2024',
    'ACHETEUR_LOCAL',
    'QU',
    '+245 111 222 333',
    'test.quinara@exportateur.gw',
    'qr_c7d8e9f0_1703123460_z1a2b3c4',
    '2024-04-01',
    '2025-04-01',
    'ACTIF',
    NOW(),
    NOW()
);

-- Afficher les exportateurs créés
SELECT 
    nom,
    numero_agrement,
    type,
    region_code,
    qr_code_token,
    statut,
    date_certification,
    date_expiration
FROM exportateurs 
WHERE numero_agrement LIKE 'TEST-%'
ORDER BY numero_agrement;

-- Afficher les tokens QR pour les tests
SELECT 
    numero_agrement,
    qr_code_token,
    CASE 
        WHEN statut = 'ACTIF' AND date_expiration > CURRENT_DATE THEN '✅ VALIDE'
        WHEN statut = 'EXPIRE' OR date_expiration <= CURRENT_DATE THEN '❌ EXPIRÉ'
        WHEN statut = 'SUSPENDU' THEN '⚠️ SUSPENDU'
        ELSE '❓ INCONNU'
    END as statut_verification
FROM exportateurs 
WHERE numero_agrement LIKE 'TEST-%'
ORDER BY numero_agrement;
