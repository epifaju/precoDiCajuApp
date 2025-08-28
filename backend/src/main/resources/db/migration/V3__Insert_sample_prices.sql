-- Insertion de prix d'exemple pour les tests et démonstration
-- Ces données simulent des prix réels du marché du cajou en Guinée-Bissau

-- Prix récents (derniers 30 jours) pour différentes régions et qualités
INSERT INTO prices (region_code, quality_grade, price_fcfa, recorded_date, source_name, source_type, created_by, verified, notes) VALUES

-- Région Bafatá (BF) - Zone de forte production
('BF', 'W180', 2500.00, CURRENT_DATE - INTERVAL '1 day', 'Marché Central Bafatá', 'market', (SELECT id FROM users WHERE email = 'admin@precaju.gw'), true, 'Prix stable, bonne qualité'),
('BF', 'W210', 2200.00, CURRENT_DATE - INTERVAL '1 day', 'Marché Central Bafatá', 'market', (SELECT id FROM users WHERE email = 'admin@precaju.gw'), true, 'Demande forte'),
('BF', 'RAW', 800.00, CURRENT_DATE - INTERVAL '2 days', 'Cooperativa Bafatá', 'cooperative', (SELECT id FROM users WHERE email = 'cooperativa@test.gw'), true, 'Prix producteur direct'),

-- Région Gabú (GA) - Importante zone de production
('GA', 'W180', 2450.00, CURRENT_DATE - INTERVAL '1 day', 'Marché Gabú', 'market', (SELECT id FROM users WHERE email = 'produtor@test.gw'), false, 'Légère baisse par rapport à la semaine dernière'),
('GA', 'W210', 2150.00, CURRENT_DATE - INTERVAL '2 days', 'Marché Gabú', 'market', (SELECT id FROM users WHERE email = 'produtor@test.gw'), false, 'Prix compétitif'),
('GA', 'W240', 1900.00, CURRENT_DATE - INTERVAL '3 days', 'Cooperativa Gabú', 'cooperative', (SELECT id FROM users WHERE email = 'cooperativa@test.gw'), true, 'Bonne qualité locale'),
('GA', 'RAW', 750.00, CURRENT_DATE - INTERVAL '1 day', 'Zone rurale Gabú', 'producer', (SELECT id FROM users WHERE email = 'produtor@test.gw'), false, 'Prix direct producteur'),

-- Région Bissau (BS) - Capital, prix de référence
('BS', 'W180', 2600.00, CURRENT_DATE, 'Marché Bandim', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), true, 'Prix premium à la capitale'),
('BS', 'W210', 2300.00, CURRENT_DATE, 'Marché Bandim', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), true, 'Forte demande d''exportation'),
('BS', 'W240', 2000.00, CURRENT_DATE - INTERVAL '1 day', 'Marché Pijiguiti', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), false, 'Marché secondaire'),
('BS', 'LP', 1500.00, CURRENT_DATE - INTERVAL '2 days', 'Marché Bandim', 'market', (SELECT id FROM users WHERE email = 'admin@precaju.gw'), true, 'Pedaços pour marché local'),

-- Région Cacheu (CA)
('CA', 'W210', 2100.00, CURRENT_DATE - INTERVAL '2 days', 'Marché Cacheu', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), false, 'Prix fluctuant'),
('CA', 'RAW', 720.00, CURRENT_DATE - INTERVAL '3 days', 'Zone productive Cacheu', 'producer', (SELECT id FROM users WHERE email = 'produtor@test.gw'), false, 'Récolte en cours'),

-- Région Quinara (QU)
('QU', 'W180', 2400.00, CURRENT_DATE - INTERVAL '3 days', 'Marché Fulacunda', 'market', (SELECT id FROM users WHERE email = 'produtor@test.gw'), false, 'Zone émergente'),
('QU', 'RAW', 780.00, CURRENT_DATE - INTERVAL '1 day', 'Cooperativa Quinara', 'cooperative', (SELECT id FROM users WHERE email = 'cooperativa@test.gw'), true, 'Prix coopérative'),

-- Région Tombali (TO)
('TO', 'W210', 2050.00, CURRENT_DATE - INTERVAL '4 days', 'Marché Catió', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), false, 'Marché local'),
('TO', 'RAW', 700.00, CURRENT_DATE - INTERVAL '2 days', 'Zone rurale Tombali', 'producer', (SELECT id FROM users WHERE email = 'produtor@test.gw'), false, 'Prix variable'),

-- Région Oio (OI)
('OI', 'W240', 1850.00, CURRENT_DATE - INTERVAL '5 days', 'Marché Farim', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), false, 'Petit marché local'),
('OI', 'RAW', 680.00, CURRENT_DATE - INTERVAL '3 days', 'Producteurs Oio', 'producer', (SELECT id FROM users WHERE email = 'produtor@test.gw'), false, 'Zone moins développée'),

-- Région Biombo (BB)
('BB', 'W320', 1650.00, CURRENT_DATE - INTERVAL '6 days', 'Marché Quinhamel', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), false, 'Petite production'),
('BB', 'SP', 1200.00, CURRENT_DATE - INTERVAL '4 days', 'Marché Quinhamel', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), false, 'Pedaços locaux'),

-- Données historiques (semaine dernière)
('BF', 'W180', 2520.00, CURRENT_DATE - INTERVAL '7 days', 'Marché Central Bafatá', 'market', (SELECT id FROM users WHERE email = 'admin@precaju.gw'), true, 'Prix semaine précédente'),
('GA', 'W180', 2480.00, CURRENT_DATE - INTERVAL '8 days', 'Marché Gabú', 'market', (SELECT id FROM users WHERE email = 'produtor@test.gw'), true, 'Tendance légèrement baissière'),
('BS', 'W180', 2580.00, CURRENT_DATE - INTERVAL '7 days', 'Marché Bandim', 'market', (SELECT id FROM users WHERE email = 'comerciante@test.gw'), true, 'Prix capital stable');

-- Données avec géolocalisation (quelques exemples)  
INSERT INTO prices (region_code, quality_grade, price_fcfa, recorded_date, source_name, source_type, gps_lat, gps_lng, created_by, verified, notes) VALUES
('BF', 'W180', 2500.00, CURRENT_DATE, 'Marché GPS Bafatá', 'market', 12.166667, -14.666667, (SELECT id FROM users WHERE email = 'admin@precaju.gw'), true, 'Position GPS vérifiée'),
('GA', 'W210', 2150.00, CURRENT_DATE - INTERVAL '1 day', 'Cooperativa GPS Gabú', 'cooperative', 12.283333, -14.233333, (SELECT id FROM users WHERE email = 'cooperativa@test.gw'), true, 'Localisation précise'),
('BS', 'W180', 2600.00, CURRENT_DATE, 'Marché Bandim GPS', 'market', 11.863333, -15.583333, (SELECT id FROM users WHERE email = 'comerciante@test.gw'), true, 'Centre-ville Bissau');

-- Mise à jour des statistiques de réputation basées sur les contributions
UPDATE users SET reputation_score = reputation_score + 10 WHERE email = 'admin@precaju.gw';
UPDATE users SET reputation_score = reputation_score + 5 WHERE email = 'produtor@test.gw';
UPDATE users SET reputation_score = reputation_score + 8 WHERE email = 'comerciante@test.gw';
UPDATE users SET reputation_score = reputation_score + 7 WHERE email = 'cooperativa@test.gw';
