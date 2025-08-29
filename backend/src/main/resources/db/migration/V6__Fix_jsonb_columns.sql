-- Corriger le type des colonnes jsonb en TEXT pour éviter les conflits de types
ALTER TABLE users 
ALTER COLUMN preferred_regions TYPE TEXT USING preferred_regions::TEXT;

ALTER TABLE users 
ALTER COLUMN notification_preferences TYPE TEXT USING notification_preferences::TEXT;
