-- Migration pour ajouter les coordonnées GPS aux régions
-- Ajoute les colonnes center_latitude et center_longitude à la table regions

-- Ajouter les colonnes GPS pour les centres des régions
ALTER TABLE regions ADD COLUMN IF NOT EXISTS center_latitude DECIMAL(10,8);
ALTER TABLE regions ADD COLUMN IF NOT EXISTS center_longitude DECIMAL(11,8);

-- Ajouter des contraintes pour valider les coordonnées GPS
ALTER TABLE regions ADD CONSTRAINT chk_center_latitude CHECK (center_latitude IS NULL OR (center_latitude >= 10.5 AND center_latitude <= 12.7));
ALTER TABLE regions ADD CONSTRAINT chk_center_longitude CHECK (center_longitude IS NULL OR (center_longitude >= -16.8 AND center_longitude <= -13.6));

-- Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN regions.center_latitude IS 'Latitude du centre de la région en Guinée-Bissau';
COMMENT ON COLUMN regions.center_longitude IS 'Longitude du centre de la région en Guinée-Bissau';

-- Insérer les coordonnées GPS approximatives des centres des régions de Guinée-Bissau
-- Ces coordonnées sont basées sur les centres géographiques approximatifs de chaque région

UPDATE regions SET center_latitude = 12.1667, center_longitude = -14.6667 WHERE code = 'BF'; -- Bafatá
UPDATE regions SET center_latitude = 11.8500, center_longitude = -15.6000 WHERE code = 'BB'; -- Biombo
UPDATE regions SET center_latitude = 11.5833, center_longitude = -15.4667 WHERE code = 'BS'; -- Bissau
UPDATE regions SET center_latitude = 11.5833, center_longitude = -15.4667 WHERE code = 'BL'; -- Bolama
UPDATE regions SET center_latitude = 12.2667, center_longitude = -16.1667 WHERE code = 'CA'; -- Cacheu
UPDATE regions SET center_latitude = 12.2833, center_longitude = -14.2167 WHERE code = 'GA'; -- Gabú
UPDATE regions SET center_latitude = 12.2667, center_longitude = -15.3167 WHERE code = 'OI'; -- Oio
UPDATE regions SET center_latitude = 11.8333, center_longitude = -15.1667 WHERE code = 'QU'; -- Quinara
UPDATE regions SET center_latitude = 11.3000, center_longitude = -15.0167 WHERE code = 'TO'; -- Tombali

-- Créer un index pour améliorer les performances des requêtes GPS sur les régions
CREATE INDEX IF NOT EXISTS idx_regions_gps_center ON regions(center_latitude, center_longitude) 
WHERE center_latitude IS NOT NULL AND center_longitude IS NOT NULL;

-- Note: Les fonctions et vues GPS avancées seront ajoutées dans une migration ultérieure
-- une fois que les colonnes de base sont créées et testées
