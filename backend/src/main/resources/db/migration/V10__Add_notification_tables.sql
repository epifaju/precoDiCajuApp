-- Migration pour ajouter les tables de notifications
-- V10__Add_notification_tables.sql

-- Table de configuration des notifications
CREATE TABLE notification_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seuil_pourcentage DECIMAL(5,2) DEFAULT 10.0 CHECK (seuil_pourcentage > 0),
    actif BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour l'historique des notifications envoyées
CREATE TABLE notifications_envoyees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    utilisateur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    prix_id UUID NOT NULL REFERENCES prices(id) ON DELETE CASCADE,
    ancien_prix DECIMAL(10,2) NOT NULL,
    nouveau_prix DECIMAL(10,2) NOT NULL,
    variation_pourcentage DECIMAL(5,2) NOT NULL,
    message TEXT NOT NULL,
    statut VARCHAR(20) DEFAULT 'envoyee' CHECK (statut IN ('envoyee', 'echec', 'en_attente')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ajouter les colonnes manquantes à la table users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS push_subscription TEXT,
ADD COLUMN IF NOT EXISTS abonnement_notifications BOOLEAN DEFAULT FALSE;

-- Mettre à jour la colonne notification_preferences pour inclure les nouvelles options
-- On va la recréer en JSONB pour une meilleure gestion
ALTER TABLE users 
ALTER COLUMN notification_preferences TYPE JSONB USING 
    CASE 
        WHEN notification_preferences IS NULL OR notification_preferences = '' THEN '{}'::JSONB
        ELSE notification_preferences::JSONB
    END;

-- Index pour les performances
CREATE INDEX idx_notification_config_actif ON notification_config(actif);
CREATE INDEX idx_notifications_envoyees_utilisateur ON notifications_envoyees(utilisateur_id);
CREATE INDEX idx_notifications_envoyees_prix ON notifications_envoyees(prix_id);
CREATE INDEX idx_notifications_envoyees_created_at ON notifications_envoyees(created_at DESC);
CREATE INDEX idx_users_push_subscription ON users(push_subscription) WHERE push_subscription IS NOT NULL;
CREATE INDEX idx_users_abonnement_notifications ON users(abonnement_notifications);

-- Trigger pour update automatique des timestamps
CREATE TRIGGER update_notification_config_updated_at 
    BEFORE UPDATE ON notification_config 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insérer la configuration par défaut
INSERT INTO notification_config (seuil_pourcentage, actif) VALUES (10.0, TRUE);

-- Fonction pour notifier les variations de prix
CREATE OR REPLACE FUNCTION notify_price_change()
RETURNS TRIGGER AS $$
DECLARE
    variation_pct DECIMAL;
    seuil DECIMAL;
    config_record RECORD;
    message_text TEXT;
    direction_emoji TEXT;
BEGIN
    -- Récupérer la configuration active
    SELECT seuil_pourcentage INTO seuil 
    FROM notification_config 
    WHERE actif = TRUE 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    -- Valeur par défaut si pas de config
    IF seuil IS NULL THEN
        seuil := 10.0;
    END IF;
    
    -- Calculer la variation si prix différent
    IF NEW.price_fcfa <> OLD.price_fcfa AND OLD.price_fcfa > 0 THEN
        variation_pct := ABS((NEW.price_fcfa - OLD.price_fcfa) / OLD.price_fcfa * 100);
        
        -- Déclencher seulement si variation >= seuil
        IF variation_pct >= seuil THEN
            -- Déterminer la direction
            IF NEW.price_fcfa > OLD.price_fcfa THEN
                direction_emoji := '📈 Hausse';
            ELSE
                direction_emoji := '📉 Baisse';
            END IF;
            
            -- Construire le message
            message_text := direction_emoji || ' du cajou : ' || 
                          NEW.price_fcfa || ' FCFA (' || 
                          ROUND(variation_pct, 1) || '%) à ' || 
                          (SELECT name_pt FROM regions WHERE code = NEW.region_code);
            
            -- Notifier via pg_notify pour déclencher l'envoi des notifications
            PERFORM pg_notify(
                'prix_cajou_variation',
                json_build_object(
                    'id', NEW.id,
                    'region_code', NEW.region_code,
                    'quality_grade', NEW.quality_grade,
                    'ancien_prix', OLD.price_fcfa,
                    'nouveau_prix', NEW.price_fcfa,
                    'variation_pct', variation_pct,
                    'message', message_text,
                    'timestamp', extract(epoch from now())
                )::text
            );
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger sur la table prices
DROP TRIGGER IF EXISTS prix_cajou_variation_trigger ON prices;
CREATE TRIGGER prix_cajou_variation_trigger
    AFTER UPDATE ON prices
    FOR EACH ROW
    EXECUTE FUNCTION notify_price_change();

-- Commentaires pour la documentation
COMMENT ON TABLE notification_config IS 'Configuration des seuils de notification pour les variations de prix';
COMMENT ON TABLE notifications_envoyees IS 'Historique des notifications envoyées aux utilisateurs';
COMMENT ON COLUMN users.push_subscription IS 'Abonnement Web Push de l''utilisateur (format JSON)';
COMMENT ON COLUMN users.abonnement_notifications IS 'Indique si l''utilisateur souhaite recevoir des notifications';
COMMENT ON FUNCTION notify_price_change() IS 'Trigger qui détecte les variations de prix et déclenche les notifications';












