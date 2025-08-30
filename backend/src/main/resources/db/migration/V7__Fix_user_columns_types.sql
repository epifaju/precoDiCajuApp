-- Corriger les types de colonnes pour éviter les erreurs de fonction LOWER() sur bytea
-- S'assurer que email et full_name sont bien de type VARCHAR/TEXT

-- Vérifier et corriger le type de la colonne email
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'email' 
        AND data_type = 'bytea'
    ) THEN
        ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255) USING email::VARCHAR;
    END IF;
END $$;

-- Vérifier et corriger le type de la colonne full_name
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'full_name' 
        AND data_type = 'bytea'
    ) THEN
        ALTER TABLE users ALTER COLUMN full_name TYPE VARCHAR(100) USING full_name::VARCHAR;
    END IF;
END $$;

-- S'assurer que les colonnes ont les bonnes contraintes
ALTER TABLE users ALTER COLUMN email SET DATA TYPE VARCHAR(255);
ALTER TABLE users ALTER COLUMN full_name SET DATA TYPE VARCHAR(100);

-- Recréer les index si nécessaire
DROP INDEX IF EXISTS idx_users_email;
CREATE INDEX idx_users_email ON users(email);

-- Ajouter un index sur full_name pour améliorer les performances de recherche
CREATE INDEX IF NOT EXISTS idx_users_full_name ON users(full_name);

