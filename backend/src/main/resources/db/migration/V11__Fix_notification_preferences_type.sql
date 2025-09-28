-- Corriger définitivement le type de la colonne notification_preferences
-- Cette migration force la conversion de JSONB vers TEXT

-- Vérifier et corriger le type de la colonne notification_preferences
DO $$
BEGIN
    -- Vérifier si la colonne existe et est de type jsonb
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'notification_preferences' 
        AND data_type = 'jsonb'
    ) THEN
        -- Convertir les données JSONB en TEXT en préservant le contenu
        ALTER TABLE users 
        ALTER COLUMN notification_preferences TYPE TEXT 
        USING notification_preferences::TEXT;
        
        RAISE NOTICE 'Colonne notification_preferences convertie de JSONB vers TEXT';
    ELSE
        RAISE NOTICE 'Colonne notification_preferences déjà de type TEXT ou n''existe pas';
    END IF;
END $$;

-- Vérifier et corriger le type de la colonne preferred_regions aussi
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'preferred_regions' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE users 
        ALTER COLUMN preferred_regions TYPE TEXT 
        USING preferred_regions::TEXT;
        
        RAISE NOTICE 'Colonne preferred_regions convertie de JSONB vers TEXT';
    ELSE
        RAISE NOTICE 'Colonne preferred_regions déjà de type TEXT ou n''existe pas';
    END IF;
END $$;

-- Vérifier et corriger le type de la colonne push_subscription aussi
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'push_subscription' 
        AND data_type = 'jsonb'
    ) THEN
        ALTER TABLE users 
        ALTER COLUMN push_subscription TYPE TEXT 
        USING push_subscription::TEXT;
        
        RAISE NOTICE 'Colonne push_subscription convertie de JSONB vers TEXT';
    ELSE
        RAISE NOTICE 'Colonne push_subscription déjà de type TEXT ou n''existe pas';
    END IF;
END $$;









