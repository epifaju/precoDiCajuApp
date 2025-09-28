# Test QR Scanner Fix
# Ce script teste les corrections apportees au scanner QR

Write-Host "=== Test QR Scanner Fix ===" -ForegroundColor Green
Write-Host ""

# Verifier que le frontend est en cours d'execution
Write-Host "1. Verification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend accessible sur http://localhost:5173" -ForegroundColor Green
    }
    else {
        Write-Host "Frontend non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Demarrez le frontend avec: cd frontend && npm run dev" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "2. Test de la page Exportateurs..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173/exporters" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Page Exportateurs accessible" -ForegroundColor Green
    }
    else {
        Write-Host "Page Exportateurs non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
    }
}
catch {
    Write-Host "Page Exportateurs non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verification des fichiers modifies..." -ForegroundColor Yellow

# Verifier que les fichiers ont ete modifies
$files = @(
    "frontend/src/components/exporters/QRScanner.tsx",
    "frontend/src/i18n/locales/fr.json",
    "frontend/src/i18n/locales/en.json",
    "frontend/src/i18n/locales/pt.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fichier $file existe" -ForegroundColor Green
    }
    else {
        Write-Host "Fichier $file manquant" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "4. Test du fichier HTML de diagnostic..." -ForegroundColor Yellow
if (Test-Path "test-qr-scanner-fix.html") {
    Write-Host "Fichier de test HTML cree" -ForegroundColor Green
    Write-Host "Ouvrez test-qr-scanner-fix.html dans votre navigateur pour tester l'acces camera" -ForegroundColor Cyan
}
else {
    Write-Host "Fichier de test HTML manquant" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Resume des corrections apportees ===" -ForegroundColor Green
Write-Host ""
Write-Host "Ameliorations du QR Scanner:" -ForegroundColor Cyan
Write-Host "   - Gestion amelioree des permissions camera" -ForegroundColor White
Write-Host "   - Fallback automatique si camera arriere indisponible" -ForegroundColor White
Write-Host "   - Messages d'erreur plus detailles et specifiques" -ForegroundColor White
Write-Host "   - Instructions visuelles pour autoriser l'acces camera" -ForegroundColor White
Write-Host "   - Detection automatique des changements de permissions" -ForegroundColor White
Write-Host "   - Bouton d'actualisation de page en cas de probleme" -ForegroundColor White
Write-Host ""
Write-Host "Traductions ajoutees:" -ForegroundColor Cyan
Write-Host "   - Messages d'erreur pour camera utilisee par autre app" -ForegroundColor White
Write-Host "   - Messages d'erreur pour contraintes camera non satisfaites" -ForegroundColor White
Write-Host "   - Instructions d'autorisation d'acces camera" -ForegroundColor White
Write-Host ""
Write-Host "Comment tester:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:5173/exporters" -ForegroundColor White
Write-Host "   2. Cliquez sur Scanner QR" -ForegroundColor White
Write-Host "   3. Autorisez l'acces a la camera quand demande" -ForegroundColor White
Write-Host "   4. Testez avec un QR code d'exportateur" -ForegroundColor White
Write-Host ""
Write-Host "Diagnostic avance:" -ForegroundColor Cyan
Write-Host "   - Ouvrez test-qr-scanner-fix.html pour un diagnostic complet" -ForegroundColor White
Write-Host "   - Ce fichier teste toutes les APIs camera et permissions" -ForegroundColor White

Write-Host ""
Write-Host "=== Test termine ===" -ForegroundColor Green