# Script simple pour executer la mise a jour SQL
Write-Host "Mise a jour des dates d'expiration - PostgreSQL" -ForegroundColor Cyan

# Configuration - MODIFIEZ CES VALEURS SELON VOTRE ENVIRONNEMENT
$config = @{
    Host = "localhost"
    Port = "5432"
    Database = "precaju"  # Nom de votre base de donnees
    Username = "postgres"  # Votre nom d'utilisateur
    Password = "password"  # Votre mot de passe
}

Write-Host "`nConfiguration actuelle:" -ForegroundColor Yellow
Write-Host "  Host: $($config.Host)" -ForegroundColor Gray
Write-Host "  Port: $($config.Port)" -ForegroundColor Gray
Write-Host "  Database: $($config.Database)" -ForegroundColor Gray
Write-Host "  Username: $($config.Username)" -ForegroundColor Gray

# Demander confirmation
$confirm = Read-Host "`nVoulez-vous continuer avec cette configuration? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "Script annule." -ForegroundColor Yellow
    exit 0
}

# Script SQL
$sqlCommand = @"
UPDATE exportateurs 
SET date_expiration = '2026-01-15' 
WHERE date_expiration < CURRENT_DATE;
"@

Write-Host "`nExecution de la commande SQL..." -ForegroundColor Magenta
Write-Host "Commande: $sqlCommand" -ForegroundColor Gray

try {
    # Definir le mot de passe
    $env:PGPASSWORD = $config.Password
    
    # Executer la commande
    $result = & psql -h $config.Host -p $config.Port -U $config.Username -d $config.Database -c $sqlCommand
    
    Write-Host "`nResultat:" -ForegroundColor Cyan
    Write-Host $result -ForegroundColor White
    
    Write-Host "`n✅ Mise a jour terminee!" -ForegroundColor Green
    
    # Verifier les resultats
    Write-Host "`nVerification des resultats..." -ForegroundColor Magenta
    $checkResult = & psql -h $config.Host -p $config.Port -U $config.Username -d $config.Database -c "SELECT COUNT(*) as total, COUNT(CASE WHEN date_expiration >= CURRENT_DATE THEN 1 END) as valides FROM exportateurs;"
    
    Write-Host "Verification:" -ForegroundColor Cyan
    Write-Host $checkResult -ForegroundColor White
    
} catch {
    Write-Host "`n❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nSolutions possibles:" -ForegroundColor Yellow
    Write-Host "  1. Verifiez que PostgreSQL est demarre" -ForegroundColor Gray
    Write-Host "  2. Verifiez les parametres de connexion" -ForegroundColor Gray
    Write-Host "  3. Executez le script SQL manuellement dans pgAdmin" -ForegroundColor Gray
} finally {
    # Nettoyer
    Remove-Item Env:PGPASSWORD -ErrorAction SilentlyContinue
}

Write-Host "`nScript termine!" -ForegroundColor Green



