# Script pour executer le script SQL de mise a jour des dates
Write-Host "Mise a jour des dates d'expiration via PostgreSQL" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration de la base de donnees
$DB_HOST = "localhost"
$DB_PORT = "5432"
$DB_NAME = "precaju"  # Ajustez selon votre configuration
$DB_USER = "postgres"  # Ajustez selon votre configuration
$DB_PASSWORD = "password"  # Ajustez selon votre configuration

Write-Host "Configuration de la base de donnees:" -ForegroundColor Yellow
Write-Host "  Host: $DB_HOST" -ForegroundColor Gray
Write-Host "  Port: $DB_PORT" -ForegroundColor Gray
Write-Host "  Database: $DB_NAME" -ForegroundColor Gray
Write-Host "  User: $DB_USER" -ForegroundColor Gray

# Verifier si psql est disponible
try {
    $psqlVersion = & psql --version 2>$null
    Write-Host "`npsql trouve: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "`npsql non trouve. Veuillez installer PostgreSQL ou ajouter psql au PATH." -ForegroundColor Red
    Write-Host "Alternative: Executez le script SQL directement dans pgAdmin ou un autre client PostgreSQL." -ForegroundColor Yellow
    exit 1
}

# Creer le script SQL temporaire
$sqlScript = @"
-- Script de mise a jour des dates d'expiration
-- Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')

-- 1. Verifier l'etat actuel
SELECT 
    'AVANT MISE A JOUR' as etape,
    COUNT(*) as total_exportateurs,
    COUNT(CASE WHEN date_expiration < CURRENT_DATE THEN 1 END) as expires,
    COUNT(CASE WHEN date_expiration >= CURRENT_DATE THEN 1 END) as valides
FROM exportateurs;

-- 2. Mettre a jour les dates d'expiration
UPDATE exportateurs 
SET date_expiration = '2026-01-15' 
WHERE date_expiration < CURRENT_DATE;

-- 3. Verifier les resultats
SELECT 
    'APRES MISE A JOUR' as etape,
    COUNT(*) as total_exportateurs,
    COUNT(CASE WHEN date_expiration < CURRENT_DATE THEN 1 END) as expires,
    COUNT(CASE WHEN date_expiration >= CURRENT_DATE THEN 1 END) as valides
FROM exportateurs;

-- 4. Afficher quelques exemples
SELECT 
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
"@

# Ecrire le script dans un fichier temporaire
$tempScript = "temp_update_dates.sql"
$sqlScript | Out-File -FilePath $tempScript -Encoding UTF8

Write-Host "`nScript SQL cree: $tempScript" -ForegroundColor Green

# Executer le script
Write-Host "`nExecution du script SQL..." -ForegroundColor Magenta

try {
    # Definir la variable d'environnement pour le mot de passe
    $env:PGPASSWORD = $DB_PASSWORD
    
    # Executer le script
    $result = & psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $tempScript
    
    Write-Host "`nResultat de l'execution:" -ForegroundColor Cyan
    Write-Host $result -ForegroundColor White
    
    Write-Host "`n✅ Script execute avec succes!" -ForegroundColor Green
    
} catch {
    Write-Host "`n❌ Erreur lors de l'execution: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nVerifiez:" -ForegroundColor Yellow
    Write-Host "  - Que PostgreSQL est demarre" -ForegroundColor Gray
    Write-Host "  - Que les parametres de connexion sont corrects" -ForegroundColor Gray
    Write-Host "  - Que l'utilisateur a les droits de modification" -ForegroundColor Gray
} finally {
    # Nettoyer
    if (Test-Path $tempScript) {
        Remove-Item $tempScript
        Write-Host "`nFichier temporaire supprime: $tempScript" -ForegroundColor Gray
    }
    
    # Supprimer la variable d'environnement
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`nScript termine!" -ForegroundColor Green
