-- Script SQL pour corriger les dates d'expiration des exportateurs
-- Exécuter ce script dans votre base de données PostgreSQL

-- 1. Vérifier l'état actuel
SELECT 
    nom,
    statut,
    date_expiration,
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expiré'
    END as statut_calculé
FROM exportateurs 
ORDER BY nom
LIMIT 10;

-- 2. Mettre à jour toutes les dates d'expiration pour 2026
UPDATE exportateurs 
SET date_expiration = '2026-01-15' 
WHERE date_expiration < CURRENT_DATE;

-- 3. Vérifier les résultats après mise à jour
SELECT 
    nom,
    statut,
    date_expiration,
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expiré'
    END as statut_calculé
FROM exportateurs 
ORDER BY nom
LIMIT 10;

-- 4. Compter les exportateurs par statut calculé
SELECT 
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expiré'
    END as statut_calculé,
    COUNT(*) as nombre
FROM exportateurs 
GROUP BY 
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expiré'
    END;