-- Migration pour améliorer le support GPS
-- Ajoute des colonnes pour stocker des métadonnées GPS étendues

-- Ajouter des colonnes pour la précision GPS et la qualité
ALTER TABLE prices ADD COLUMN IF NOT EXISTS gps_accuracy DECIMAL(8,2);
ALTER TABLE prices ADD COLUMN IF NOT EXISTS gps_quality_score DECIMAL(5,2);
ALTER TABLE prices ADD COLUMN IF NOT EXISTS gps_validation_status VARCHAR(20) DEFAULT 'unknown';
ALTER TABLE prices ADD COLUMN IF NOT EXISTS gps_geocoded_address TEXT;
ALTER TABLE prices ADD COLUMN IF NOT EXISTS gps_geocoded_at TIMESTAMP WITH TIME ZONE;

-- Ajouter des contraintes pour les nouvelles colonnes
ALTER TABLE prices ADD CONSTRAINT chk_gps_accuracy CHECK (gps_accuracy IS NULL OR gps_accuracy >= 0);
ALTER TABLE prices ADD CONSTRAINT chk_gps_quality_score CHECK (gps_quality_score IS NULL OR (gps_quality_score >= 0 AND gps_quality_score <= 100));
ALTER TABLE prices ADD CONSTRAINT chk_gps_validation_status CHECK (gps_validation_status IN ('valid', 'invalid', 'warning', 'unknown'));

-- Créer des index pour améliorer les performances des requêtes GPS
CREATE INDEX IF NOT EXISTS idx_prices_gps_accuracy ON prices(gps_accuracy) WHERE gps_accuracy IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prices_gps_quality ON prices(gps_quality_score) WHERE gps_quality_score IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prices_gps_validation ON prices(gps_validation_status);
CREATE INDEX IF NOT EXISTS idx_prices_gps_geocoded ON prices(gps_geocoded_at) WHERE gps_geocoded_at IS NOT NULL;

-- Créer un index composite pour les requêtes GPS complexes
CREATE INDEX IF NOT EXISTS idx_prices_gps_composite ON prices(gps_lat, gps_lng, gps_accuracy, gps_quality_score) 
WHERE gps_lat IS NOT NULL AND gps_lng IS NOT NULL;

-- Ajouter des commentaires pour documenter les nouvelles colonnes
COMMENT ON COLUMN prices.gps_accuracy IS 'Précision GPS en mètres';
COMMENT ON COLUMN prices.gps_quality_score IS 'Score de qualité GPS (0-100)';
COMMENT ON COLUMN prices.gps_validation_status IS 'Statut de validation GPS (valid, invalid, warning, unknown)';
COMMENT ON COLUMN prices.gps_geocoded_address IS 'Adresse géocodée à partir des coordonnées GPS';
COMMENT ON COLUMN prices.gps_geocoded_at IS 'Timestamp du géocodage de l''adresse';

-- Créer une vue pour les statistiques GPS
CREATE OR REPLACE VIEW gps_statistics AS
SELECT 
    region_code,
    COUNT(*) as total_prices,
    COUNT(gps_lat) as prices_with_gps,
    ROUND(COUNT(gps_lat) * 100.0 / COUNT(*), 2) as gps_coverage_percentage,
    AVG(gps_accuracy) as avg_accuracy,
    MIN(gps_accuracy) as min_accuracy,
    MAX(gps_accuracy) as max_accuracy,
    AVG(gps_quality_score) as avg_quality_score,
    COUNT(CASE WHEN gps_validation_status = 'valid' THEN 1 END) as valid_gps_count,
    COUNT(CASE WHEN gps_validation_status = 'invalid' THEN 1 END) as invalid_gps_count,
    COUNT(CASE WHEN gps_validation_status = 'warning' THEN 1 END) as warning_gps_count
FROM prices 
WHERE active = true
GROUP BY region_code;

-- Créer une fonction pour calculer la distance entre deux points GPS
CREATE OR REPLACE FUNCTION calculate_distance_km(
    lat1 DECIMAL, lng1 DECIMAL, 
    lat2 DECIMAL, lng2 DECIMAL
) RETURNS DECIMAL AS $$
DECLARE
    earth_radius DECIMAL := 6371.0; -- Rayon de la Terre en km
    dlat DECIMAL;
    dlng DECIMAL;
    a DECIMAL;
    c DECIMAL;
BEGIN
    -- Convertir les degrés en radians
    dlat := radians(lat2 - lat1);
    dlng := radians(lng2 - lng1);
    
    -- Formule de Haversine
    a := sin(dlat/2) * sin(dlat/2) + 
         cos(radians(lat1)) * cos(radians(lat2)) * 
         sin(dlng/2) * sin(dlng/2);
    
    c := 2 * atan2(sqrt(a), sqrt(1-a));
    
    RETURN earth_radius * c;
END;
$$ LANGUAGE plpgsql;

-- Créer une fonction pour valider les coordonnées GPS de la Guinée-Bissau
CREATE OR REPLACE FUNCTION is_within_guinea_bissau(
    lat DECIMAL, lng DECIMAL
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN lat >= 10.5 AND lat <= 12.7 AND lng >= -16.8 AND lng <= -13.6;
END;
$$ LANGUAGE plpgsql;

-- Créer un trigger pour valider automatiquement les coordonnées GPS
CREATE OR REPLACE FUNCTION validate_gps_coordinates()
RETURNS TRIGGER AS $$
BEGIN
    -- Valider les limites de la Guinée-Bissau
    IF NEW.gps_lat IS NOT NULL AND NEW.gps_lng IS NOT NULL THEN
        IF NOT is_within_guinea_bissau(NEW.gps_lat, NEW.gps_lng) THEN
            RAISE EXCEPTION 'GPS coordinates are outside Guinea-Bissau boundaries';
        END IF;
        
        -- Marquer comme nécessitant une validation si pas encore validé
        IF NEW.gps_validation_status IS NULL OR NEW.gps_validation_status = 'unknown' THEN
            NEW.gps_validation_status := 'unknown';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_validate_gps ON prices;
CREATE TRIGGER trigger_validate_gps
    BEFORE INSERT OR UPDATE ON prices
    FOR EACH ROW
    EXECUTE FUNCTION validate_gps_coordinates();

-- Mettre à jour les prix existants avec des coordonnées GPS pour marquer leur statut
UPDATE prices 
SET gps_validation_status = CASE 
    WHEN gps_lat IS NULL OR gps_lng IS NULL THEN NULL
    WHEN is_within_guinea_bissau(gps_lat, gps_lng) THEN 'unknown'
    ELSE 'invalid'
END
WHERE gps_validation_status IS NULL;
