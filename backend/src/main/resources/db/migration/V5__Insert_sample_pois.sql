-- Insertion de POIs d'exemple pour la Guinée-Bissau

-- POI à Bissau (acheteurs et entrepôts)
INSERT INTO pois (nom, type, latitude, longitude, telephone, adresse, horaires, created_by) VALUES
('Exportadora de Caju S.A.', 'ACHETEUR', 11.8637, -15.5981, '+245-955-1234', 'Av. Amilcar Cabral, Bissau', '8h00-17h00 Lun-Ven', 'system'),
('Entrepôt Central Bissau', 'ENTREPOT', 11.8520, -15.5932, '+245-955-2345', 'Zone Industrielle, Bissau', '24h/24', 'system'),
('Comercial Cajú Nacional', 'ACHETEUR', 11.8590, -15.5890, '+245-955-3456', 'Rua Eduardo Mondlane, Bissau', '7h30-18h30 Lun-Sam', 'system'),

-- POI à Bafatá (coopératives et acheteurs)
('Cooperativa de Bafatá', 'COOPERATIVE', 12.1666, -14.6500, '+245-946-1111', 'Centro de Bafatá', '8h00-16h00 Lun-Ven', 'system'),
('Comprador Regional Bafatá', 'ACHETEUR', 12.1650, -14.6480, '+245-946-2222', 'Mercado de Bafatá', '6h00-18h00', 'system'),

-- POI à Cacheu (coopératives)
('Cooperativa do Norte', 'COOPERATIVE', 12.2744, -16.1658, '+245-947-3333', 'Vila de Cacheu', '7h00-17h00 Lun-Ven', 'system'),
('União dos Produtores Cacheu', 'COOPERATIVE', 12.2800, -16.1600, '+245-947-4444', 'Zona Rural Cacheu', '8h00-15h00', 'system'),

-- POI à Gabú (acheteurs et coopératives)
('Comercial do Leste', 'ACHETEUR', 12.2833, -14.2167, '+245-948-5555', 'Centro de Gabú', '8h00-17h00 Lun-Ven', 'system'),
('Cooperativa Regional Gabú', 'COOPERATIVE', 12.2900, -14.2200, '+245-948-6666', 'Periferia de Gabú', '7h30-16h30', 'system'),

-- POI à Oio (coopératives)
('Cooperativa de Farim', 'COOPERATIVE', 12.4833, -15.2167, '+245-949-7777', 'Farim, Oio', '8h00-16h00 Lun-Ven', 'system'),

-- POI à Quinara (coopératives et acheteurs)
('Cooperativa de Fulacunda', 'COOPERATIVE', 11.2833, -15.1333, '+245-950-8888', 'Fulacunda, Quinara', '7h00-17h00', 'system'),
('Exportadora Sul', 'ACHETEUR', 11.2800, -15.1300, '+245-950-9999', 'Centro Fulacunda', '8h00-18h00', 'system'),

-- POI à Tombali (coopératives)
('Cooperativa de Catió', 'COOPERATIVE', 11.2833, -15.2500, '+245-951-1010', 'Catió, Tombali', '8h00-16h00 Lun-Ven', 'system'),
('União Produtores Tombali', 'COOPERATIVE', 11.2900, -15.2450, '+245-951-2020', 'Zona Rural Tombali', '7h30-15h30', 'system'),

-- POI à Bolama (entrepôt et acheteur)
('Entrepôt Arquipélago', 'ENTREPOT', 11.5833, -15.4833, '+245-952-3030', 'Porto de Bolama', '6h00-20h00', 'system'),
('Comprador Insular', 'ACHETEUR', 11.5800, -15.4800, '+245-952-4040', 'Centro Bolama', '8h00-17h00', 'system'),

-- POI à Biombo (coopératives)
('Cooperativa de Quinhamel', 'COOPERATIVE', 11.8833, -15.8333, '+245-953-5050', 'Quinhamel, Biombo', '8h00-16h00 Lun-Ven', 'system');


