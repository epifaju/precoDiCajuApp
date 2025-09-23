-- Table des Points d'Intérêt (POI) pour l'industrie de l'anacarde
CREATE TABLE pois (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('ACHETEUR', 'COOPERATIVE', 'ENTREPOT')),
    latitude DECIMAL(10,8) NOT NULL CHECK (latitude BETWEEN 10.5 AND 12.8),
    longitude DECIMAL(11,8) NOT NULL CHECK (longitude BETWEEN -17.0 AND -13.5),
    telephone VARCHAR(50),
    adresse VARCHAR(500),
    horaires VARCHAR(500),
    active BOOLEAN DEFAULT TRUE,
    created_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les requêtes géographiques
CREATE INDEX idx_pois_location ON pois(latitude, longitude) WHERE active = true;
CREATE INDEX idx_pois_type ON pois(type) WHERE active = true;
CREATE INDEX idx_pois_name ON pois(nom) WHERE active = true;
CREATE INDEX idx_pois_active ON pois(active);

-- Trigger pour mise à jour automatique du timestamp
CREATE TRIGGER update_pois_updated_at 
    BEFORE UPDATE ON pois 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();


