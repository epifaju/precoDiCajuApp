# Script de test des traductions françaises
Write-Host "=== Test des Traductions Françaises ===" -ForegroundColor Green
Write-Host ""

# Vérifier que le frontend est démarré
Write-Host "1. Vérification du serveur frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Frontend accessible sur http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend non accessible. Démarrage..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    Start-Sleep 10
}

Write-Host ""
Write-Host "2. Instructions de test :" -ForegroundColor Yellow
Write-Host "   - Ouvrir http://localhost:3000 dans le navigateur" -ForegroundColor White
Write-Host "   - Aller sur la page des prix" -ForegroundColor White
Write-Host "   - Changer la langue de Portugais à Français" -ForegroundColor White
Write-Host "   - Vérifier qu'il n'y a plus d'erreur 'Objects are not valid as a React child'" -ForegroundColor White
Write-Host ""

Write-Host "3. Corrections apportées :" -ForegroundColor Yellow
Write-Host "   ✓ Clé 'prices.filters' corrigée (string au lieu d'objet)" -ForegroundColor Green
Write-Host "   ✓ Clé 'prices.clearFilters' ajoutée" -ForegroundColor Green
Write-Host "   ✓ Toutes les clés manquantes ajoutées" -ForegroundColor Green
Write-Host "   ✓ Structure des filtres restructurée" -ForegroundColor Green
Write-Host ""

Write-Host "4. Fichiers modifiés :" -ForegroundColor Yellow
Write-Host "   - frontend/src/i18n/locales/fr.json" -ForegroundColor White
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
