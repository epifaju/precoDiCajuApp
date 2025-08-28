-- Insertion des régions de Guinée-Bissau
INSERT INTO regions (code, name_pt, name_fr, name_en) VALUES
('BF', 'Bafatá', 'Bafatá', 'Bafata'),
('BB', 'Biombo', 'Biombo', 'Biombo'),
('BL', 'Bolama', 'Bolama', 'Bolama'),
('CA', 'Cacheu', 'Cacheu', 'Cacheu'),
('GA', 'Gabú', 'Gabú', 'Gabu'),
('OI', 'Oio', 'Oio', 'Oio'),
('QU', 'Quinara', 'Quinará', 'Quinara'),
('TO', 'Tombali', 'Tombali', 'Tombali'),
('BS', 'Bissau', 'Bissau', 'Bissau');

-- Insertion des qualités de cajou
INSERT INTO quality_grades (code, name_pt, name_fr, name_en, description_pt, description_fr, description_en) VALUES
('W180', 'Branco 180', 'Blanc 180', 'White 180', 'Amêndoas brancas grandes (180 unidades por kg)', 'Amandes blanches grandes (180 unités par kg)', 'Large white cashews (180 pieces per kg)'),
('W210', 'Branco 210', 'Blanc 210', 'White 210', 'Amêndoas brancas médias (210 unidades por kg)', 'Amandes blanches moyennes (210 unités par kg)', 'Medium white cashews (210 pieces per kg)'),
('W240', 'Branco 240', 'Blanc 240', 'White 240', 'Amêndoas brancas pequenas (240 unidades por kg)', 'Amandes blanches petites (240 unités par kg)', 'Small white cashews (240 pieces per kg)'),
('W320', 'Branco 320', 'Blanc 320', 'White 320', 'Amêndoas brancas muito pequenas (320 unidades por kg)', 'Amandes blanches très petites (320 unités par kg)', 'Very small white cashews (320 pieces per kg)'),
('LP', 'Pedaços Grandes', 'Gros Morceaux', 'Large Pieces', 'Pedaços grandes de amêndoa', 'Gros morceaux d''amandes', 'Large cashew pieces'),
('SP', 'Pedaços Pequenos', 'Petits Morceaux', 'Small Pieces', 'Pedaços pequenos de amêndoa', 'Petits morceaux d''amandes', 'Small cashew pieces'),
('RAW', 'Castanha Crua', 'Noix Brute', 'Raw Cashew', 'Castanha não processada com casca', 'Noix de cajou non transformée avec coque', 'Unprocessed cashew nut with shell');

-- Insertion d'un utilisateur admin par défaut
INSERT INTO users (email, password_hash, full_name, role, reputation_score, email_verified, active) VALUES
('admin@precaju.gw', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf.', 'Administrador Sistema', 'admin', 100, true, true);
-- Mot de passe: admin123

-- Insertion de quelques utilisateurs de test
INSERT INTO users (email, password_hash, full_name, role, preferred_regions, email_verified, active) VALUES
('produtor@test.gw', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf.', 'João Produtor', 'contributor', '["BF", "GA"]', true, true),
('comerciante@test.gw', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf.', 'Maria Comerciante', 'contributor', '["BS", "CA"]', true, true),
('cooperativa@test.gw', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf.', 'Cooperativa Gabú', 'moderator', '["GA", "BF"]', true, true);
-- Mot de passe pour tous: test123
