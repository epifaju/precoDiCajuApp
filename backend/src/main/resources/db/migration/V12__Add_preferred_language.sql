-- Add preferred_language column to users table
ALTER TABLE users ADD COLUMN preferred_language VARCHAR(5) DEFAULT 'pt' CHECK (preferred_language IN ('pt', 'fr', 'en'));

-- Update existing users to have Portuguese as default language
UPDATE users SET preferred_language = 'pt' WHERE preferred_language IS NULL;

-- Make the column NOT NULL after setting default values
ALTER TABLE users ALTER COLUMN preferred_language SET NOT NULL;
