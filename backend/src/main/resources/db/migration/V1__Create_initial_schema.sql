-- Régions de Guinée-Bissau
CREATE TABLE regions (
    code VARCHAR(10) PRIMARY KEY,
    name_pt VARCHAR(100) NOT NULL,
    name_fr VARCHAR(100),
    name_en VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Qualités de cajou
CREATE TABLE quality_grades (
    code VARCHAR(20) PRIMARY KEY,
    name_pt VARCHAR(50) NOT NULL,
    name_fr VARCHAR(50),
    name_en VARCHAR(50),
    description_pt TEXT,
    description_fr TEXT,
    description_en TEXT,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'contributor' CHECK (role IN ('admin', 'moderator', 'contributor')),
    reputation_score INTEGER DEFAULT 0,
    preferred_regions JSONB DEFAULT '[]',
    notification_preferences JSONB DEFAULT '{}',
    email_verified BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prix
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    region_code VARCHAR(10) NOT NULL REFERENCES regions(code),
    quality_grade VARCHAR(20) NOT NULL REFERENCES quality_grades(code),
    price_fcfa DECIMAL(10,2) NOT NULL CHECK (price_fcfa > 0),
    unit VARCHAR(10) DEFAULT 'kg',
    recorded_date DATE NOT NULL,
    source_name VARCHAR(100),
    source_type VARCHAR(50) CHECK (source_type IN ('market', 'cooperative', 'producer', 'trader', 'other')),
    gps_lat DECIMAL(10,8),
    gps_lng DECIMAL(11,8),
    photo_url VARCHAR(500),
    notes TEXT,
    created_by UUID REFERENCES users(id),
    verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sessions de refresh tokens
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(255) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour performance
CREATE INDEX idx_prices_region_date ON prices(region_code, recorded_date DESC);
CREATE INDEX idx_prices_quality_date ON prices(quality_grade, recorded_date DESC);
CREATE INDEX idx_prices_created_at ON prices(created_at DESC);
CREATE INDEX idx_prices_created_by ON prices(created_by);
CREATE INDEX idx_prices_verified ON prices(verified);
CREATE INDEX idx_prices_gps ON prices(gps_lat, gps_lng) WHERE gps_lat IS NOT NULL AND gps_lng IS NOT NULL;

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(active);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- Trigger pour update automatique des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_quality_grades_updated_at BEFORE UPDATE ON quality_grades FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_prices_updated_at BEFORE UPDATE ON prices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

