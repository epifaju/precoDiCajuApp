# Script pour démarrer le frontend
Write-Host "=== Démarrage du Frontend ===" -ForegroundColor Green
Write-Host ""

# Vérifier si le frontend est déjà démarré
Write-Host "1. Vérification du serveur frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Frontend déjà accessible sur http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend non accessible. Démarrage..." -ForegroundColor Red
    
    # Changer de répertoire et démarrer le serveur
    Set-Location frontend
    Write-Host "Démarrage de npm run dev..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
    
    Write-Host "Attente du démarrage du serveur..." -ForegroundColor Yellow
    Start-Sleep 15
    
    # Vérifier à nouveau
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✓ Frontend maintenant accessible sur http://localhost:3000" -ForegroundColor Green
    } catch {
        Write-Host "✗ Frontend toujours non accessible. Vérifiez les logs." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "2. Instructions de test des traductions :" -ForegroundColor Yellow
Write-Host "   - Ouvrir http://localhost:3000 dans le navigateur" -ForegroundColor White
Write-Host "   - Aller sur la page des prix" -ForegroundColor White
Write-Host "   - Tester le changement de langue :" -ForegroundColor White
Write-Host "     * Portugais → Français" -ForegroundColor White
Write-Host "     * Portugais → Anglais" -ForegroundColor White
Write-Host "   - Vérifier qu'il n'y a plus d'erreur 'Objects are not valid as a React child'" -ForegroundColor White
Write-Host ""

Write-Host "3. Corrections appliquées :" -ForegroundColor Yellow
Write-Host "   ✓ Français : Structure des traductions corrigée" -ForegroundColor Green
Write-Host "   ✓ Anglais : Structure des traductions corrigée" -ForegroundColor Green
Write-Host "   ✓ Cohérence structurelle entre tous les fichiers" -ForegroundColor Green
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
