-- Script de mise a jour des dates d'expiration des exportateurs
-- Executez ce script dans pgAdmin, DBeaver, ou tout client PostgreSQL

-- 1. Verifier l'etat actuel AVANT la mise a jour
SELECT 
    'AVANT MISE A JOUR' as etape,
    COUNT(*) as total_exportateurs,
    COUNT(CASE WHEN date_expiration < CURRENT_DATE THEN 1 END) as expires,
    COUNT(CASE WHEN date_expiration >= CURRENT_DATE THEN 1 END) as valides
FROM exportateurs;

-- 2. Afficher quelques exemples AVANT
SELECT 
    'EXEMPLES AVANT' as etape,
    nom,
    statut,
    date_expiration,
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expire'
    END as statut_calcule
FROM exportateurs 
ORDER BY nom
LIMIT 5;

-- 3. MISE A JOUR - Changer toutes les dates d'expiration pour 2026
UPDATE exportateurs 
SET date_expiration = '2026-01-15' 
WHERE date_expiration < CURRENT_DATE;

-- 4. Verifier l'etat APRES la mise a jour
SELECT 
    'APRES MISE A JOUR' as etape,
    COUNT(*) as total_exportateurs,
    COUNT(CASE WHEN date_expiration < CURRENT_DATE THEN 1 END) as expires,
    COUNT(CASE WHEN date_expiration >= CURRENT_DATE THEN 1 END) as valides
FROM exportateurs;

-- 5. Afficher quelques exemples APRES
SELECT 
    'EXEMPLES APRES' as etape,
    nom,
    statut,
    date_expiration,
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expire'
    END as statut_calcule
FROM exportateurs 
ORDER BY nom
LIMIT 5;

-- 6. Verification finale - Compter par statut calcule
SELECT 
    'VERIFICATION FINALE' as etape,
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expire'
    END as statut_calcule,
    COUNT(*) as nombre
FROM exportateurs 
GROUP BY 
    CASE 
        WHEN date_expiration > CURRENT_DATE THEN 'Valide'
        ELSE 'Expire'
    END
ORDER BY statut_calcule;



