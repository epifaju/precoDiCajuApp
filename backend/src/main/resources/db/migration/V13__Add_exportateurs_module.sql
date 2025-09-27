-- Migration pour le module Exportateurs Agréés
-- Ajout des tables et types pour la gestion des exportateurs certifiés

-- Types pour les exportateurs
CREATE TYPE exportateur_type AS ENUM ('EXPORTATEUR', 'ACHETEUR_LOCAL');
CREATE TYPE statut_type AS ENUM ('ACTIF', 'EXPIRE', 'SUSPENDU');

-- Table principale des exportateurs
CREATE TABLE exportateurs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nom VARCHAR(255) NOT NULL,
    numero_agrement VARCHAR(100) UNIQUE NOT NULL,
    type exportateur_type NOT NULL,
    region_code VARCHAR(10) NOT NULL REFERENCES regions(code),
    telephone VARCHAR(20),
    email VARCHAR(255),
    qr_code_token VARCHAR(255) UNIQUE NOT NULL,
    date_certification DATE NOT NULL,
    date_expiration DATE NOT NULL,
    statut statut_type DEFAULT 'ACTIF',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    CONSTRAINT chk_exportateur_dates CHECK (date_expiration > date_certification)
);

-- Table des logs de vérification
CREATE TABLE verification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exportateur_id UUID REFERENCES exportateurs(id),
    user_session VARCHAR(255),
    verification_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    result VARCHAR(50) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_exportateurs_region ON exportateurs(region_code);
CREATE INDEX idx_exportateurs_type ON exportateurs(type);
CREATE INDEX idx_exportateurs_statut ON exportateurs(statut);
CREATE INDEX idx_exportateurs_qr_token ON exportateurs(qr_code_token);
CREATE INDEX idx_exportateurs_nom ON exportateurs(nom);
CREATE INDEX idx_exportateurs_numero_agrement ON exportateurs(numero_agrement);
CREATE INDEX idx_exportateurs_date_expiration ON exportateurs(date_expiration);

CREATE INDEX idx_verification_logs_exportateur ON verification_logs(exportateur_id);
CREATE INDEX idx_verification_logs_time ON verification_logs(verification_time);
CREATE INDEX idx_verification_logs_result ON verification_logs(result);

-- Trigger pour la mise à jour automatique des timestamps
CREATE TRIGGER update_exportateurs_updated_at 
    BEFORE UPDATE ON exportateurs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Données de test pour les exportateurs
INSERT INTO exportateurs (
    nom, 
    numero_agrement, 
    type, 
    region_code, 
    telephone, 
    email, 
    qr_code_token, 
    date_certification, 
    date_expiration, 
    statut
) VALUES
-- Exportateurs de Bafatá
('Cajou Export Bafatá', 'EXP-BF-001-2024', 'EXPORTATEUR', 'BF', '+245955123456', 'contact@cajoubf.gw', 'qr_bf_001_2024', '2024-01-15', '2025-01-15', 'ACTIF'),
('Produits Agricoles Gabú', 'EXP-BF-002-2024', 'EXPORTATEUR', 'BF', '+245955234567', 'info@prodagabu.gw', 'qr_bf_002_2024', '2024-02-01', '2025-02-01', 'ACTIF'),

-- Exportateurs de Biombo
('Biombo Trading Company', 'EXP-BB-001-2024', 'EXPORTATEUR', 'BB', '+245955345678', 'trading@biombo.gw', 'qr_bb_001_2024', '2024-01-20', '2025-01-20', 'ACTIF'),
('Cajou Premium Biombo', 'EXP-BB-002-2024', 'EXPORTATEUR', 'BB', '+245955456789', 'premium@biombo.gw', 'qr_bb_002_2024', '2024-02-10', '2025-02-10', 'ACTIF'),

-- Exportateurs de Bissau
('Cajou International Bissau', 'EXP-BS-001-2024', 'EXPORTATEUR', 'BS', '+245955567890', 'international@cajoubs.gw', 'qr_bs_001_2024', '2024-01-10', '2025-01-10', 'ACTIF'),
('Export Services Guinée', 'EXP-BS-002-2024', 'EXPORTATEUR', 'BS', '+245955678901', 'services@exportgw.gw', 'qr_bs_002_2024', '2024-02-05', '2025-02-05', 'ACTIF'),
('Cajou Premium Bissau', 'EXP-BS-003-2024', 'EXPORTATEUR', 'BS', '+245955789012', 'premium@cajoubs.gw', 'qr_bs_003_2024', '2024-01-25', '2025-01-25', 'ACTIF'),

-- Exportateurs de Bolama-Bijagos
('Bijagos Export Company', 'EXP-BL-001-2024', 'EXPORTATEUR', 'BL', '+245955890123', 'export@bijagos.gw', 'qr_bl_001_2024', '2024-01-30', '2025-01-30', 'ACTIF'),

-- Exportateurs de Cacheu
('Cacheu Cajou Export', 'EXP-CA-001-2024', 'EXPORTATEUR', 'CA', '+245955901234', 'export@cacheu.gw', 'qr_ca_001_2024', '2024-02-01', '2025-02-01', 'ACTIF'),
('Produits Agricoles Cacheu', 'EXP-CA-002-2024', 'EXPORTATEUR', 'CA', '+245955012345', 'agricoles@cacheu.gw', 'qr_ca_002_2024', '2024-02-15', '2025-02-15', 'ACTIF'),

-- Exportateurs de Gabú
('Gabú Trading Corporation', 'EXP-GA-001-2024', 'EXPORTATEUR', 'GA', '+245955123450', 'trading@gabu.gw', 'qr_ga_001_2024', '2024-01-12', '2025-01-12', 'ACTIF'),
('Cajou Excellence Gabú', 'EXP-GA-002-2024', 'EXPORTATEUR', 'GA', '+245955234561', 'excellence@gabu.gw', 'qr_ga_002_2024', '2024-02-08', '2025-02-08', 'ACTIF'),

-- Exportateurs d'Oio
('Oio Export Services', 'EXP-OI-001-2024', 'EXPORTATEUR', 'OI', '+245955345672', 'services@oio.gw', 'qr_oi_001_2024', '2024-01-18', '2025-01-18', 'ACTIF'),
('Produits Agricoles Oio', 'EXP-OI-002-2024', 'EXPORTATEUR', 'OI', '+245955456783', 'agricoles@oio.gw', 'qr_oi_002_2024', '2024-02-12', '2025-02-12', 'ACTIF'),

-- Exportateurs de Quinara
('Quinara Cajou Export', 'EXP-QU-001-2024', 'EXPORTATEUR', 'QU', '+245955567894', 'export@quinara.gw', 'qr_qu_001_2024', '2024-01-22', '2025-01-22', 'ACTIF'),

-- Exportateurs de Tombali
('Tombali Trading Company', 'EXP-TO-001-2024', 'EXPORTATEUR', 'TO', '+245955678905', 'trading@tombali.gw', 'qr_to_001_2024', '2024-02-03', '2025-02-03', 'ACTIF'),
('Cajou Premium Tombali', 'EXP-TO-002-2024', 'EXPORTATEUR', 'TO', '+245955789016', 'premium@tombali.gw', 'qr_to_002_2024', '2024-01-28', '2025-01-28', 'ACTIF'),

-- Acheteurs locaux
('Acheteur Local Bafatá', 'ACH-BF-001-2024', 'ACHETEUR_LOCAL', 'BF', '+245955890127', 'local@bafata.gw', 'qr_ach_bf_001_2024', '2024-01-15', '2025-01-15', 'ACTIF'),
('Acheteur Local Gabú', 'ACH-GA-001-2024', 'ACHETEUR_LOCAL', 'GA', '+245955901238', 'local@gabu.gw', 'qr_ach_ga_001_2024', '2024-02-01', '2025-02-01', 'ACTIF'),
('Acheteur Local Bissau', 'ACH-BS-001-2024', 'ACHETEUR_LOCAL', 'BS', '+245955012349', 'local@bissau.gw', 'qr_ach_bs_001_2024', '2024-01-20', '2025-01-20', 'ACTIF'),
('Acheteur Local Cacheu', 'ACH-CA-001-2024', 'ACHETEUR_LOCAL', 'CA', '+245955123450', 'local@cacheu.gw', 'qr_ach_ca_001_2024', '2024-02-10', '2025-02-10', 'ACTIF'),

-- Quelques exportateurs avec statuts différents
('Exportateur Suspendu', 'EXP-SUSP-001-2024', 'EXPORTATEUR', 'BS', '+245955234561', 'suspendu@test.gw', 'qr_susp_001_2024', '2023-12-01', '2024-12-01', 'SUSPENDU'),
('Exportateur Expiré', 'EXP-EXP-001-2024', 'EXPORTATEUR', 'BF', '+245955345672', 'expire@test.gw', 'qr_exp_001_2024', '2023-06-01', '2024-06-01', 'EXPIRE');
