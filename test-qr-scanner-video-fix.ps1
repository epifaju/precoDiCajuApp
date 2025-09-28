# Test QR Scanner Video Fix
# Ce script teste la correction de l'erreur d'initialisation video

Write-Host "=== Test QR Scanner Video Fix ===" -ForegroundColor Green
Write-Host ""

# Verifier que le frontend est en cours d'execution
Write-Host "1. Verification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend accessible sur http://localhost:3001" -ForegroundColor Green
    }
    else {
        Write-Host "Frontend non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
        Write-Host "Essayons le port 5173..." -ForegroundColor Yellow
        
        $response5173 = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
        if ($response5173.StatusCode -eq 200) {
            Write-Host "Frontend accessible sur http://localhost:5173" -ForegroundColor Green
        }
        else {
            Write-Host "Frontend non accessible sur les deux ports" -ForegroundColor Red
            exit 1
        }
    }
}
catch {
    Write-Host "Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Demarrez le frontend avec: cd frontend && npm run dev" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "2. Verification des corrections apportees..." -ForegroundColor Yellow

# Verifier que les fichiers ont ete modifies
$files = @(
    "frontend/src/components/exporters/QRScanner.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fichier $file existe" -ForegroundColor Green
        
        # Verifier que le code contient les corrections
        $content = Get-Content $file -Raw
        if ($content -match "waitForVideoElement") {
            Write-Host "  - Fonction waitForVideoElement detectee" -ForegroundColor Green
        }
        else {
            Write-Host "  - Fonction waitForVideoElement manquante" -ForegroundColor Red
        }
        
        if ($content -match "maxAttempts.*10") {
            Write-Host "  - MaxAttempts de 10 detecte" -ForegroundColor Green
        }
        else {
            Write-Host "  - MaxAttempts manquant" -ForegroundColor Red
        }
        
        if ($content -match "setTimeout.*checkVideo.*100") {
            Write-Host "  - Retry avec timeout 100ms detecte" -ForegroundColor Green
        }
        else {
            Write-Host "  - Retry avec timeout manquant" -ForegroundColor Red
        }
        
        if ($content -match "videoRef.*autoPlay.*playsInline") {
            Write-Host "  - Element video avec attributs detecte" -ForegroundColor Green
        }
        else {
            Write-Host "  - Element video avec attributs manquant" -ForegroundColor Red
        }
        
        if ($content -match "hidden.*isScanning") {
            Write-Host "  - Logique de visibilite video detectee" -ForegroundColor Green
        }
        else {
            Write-Host "  - Logique de visibilite video manquante" -ForegroundColor Red
        }
    }
    else {
        Write-Host "Fichier $file manquant" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Resume de la correction ===" -ForegroundColor Green
Write-Host ""
Write-Host "Probleme identifie:" -ForegroundColor Red
Write-Host "  - Erreur 'Erro de inicializacao do video'" -ForegroundColor White
Write-Host "  - videoRef.current etait null lors de l'assignation du stream" -ForegroundColor White
Write-Host "  - Element video pas encore monte dans le DOM" -ForegroundColor White
Write-Host ""
Write-Host "Solutions implementees:" -ForegroundColor Green
Write-Host "  - Fonction waitForVideoElement avec retry automatique" -ForegroundColor White
Write-Host "  - MaxAttempts de 10 avec timeout de 100ms entre chaque tentative" -ForegroundColor White
Write-Host "  - Element video toujours present dans le DOM (cache avec 'hidden')" -ForegroundColor White
Write-Host "  - Gestion d'erreur robuste avec messages specifiques" -ForegroundColor White
Write-Host "  - Nettoyage automatique des timeouts" -ForegroundColor White
Write-Host ""
Write-Host "Avantages de la nouvelle approche:" -ForegroundColor Cyan
Write-Host "  - Element video toujours disponible dans le DOM" -ForegroundColor White
Write-Host "  - Retry automatique si element pas encore monte" -ForegroundColor White
Write-Host "  - Timeout de securite pour eviter les blocages" -ForegroundColor White
Write-Host "  - Messages d'erreur informatifs" -ForegroundColor White
Write-Host ""
Write-Host "Comment tester:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:3001/exporters" -ForegroundColor White
Write-Host "   2. Cliquez sur Scanner QR" -ForegroundColor White
Write-Host "   3. Verifiez qu'il n'y a plus l'erreur d'initialisation video" -ForegroundColor White
Write-Host "   4. Le scanner devrait se lancer correctement" -ForegroundColor White
Write-Host "   5. Testez avec differentes configurations de camera" -ForegroundColor White

Write-Host ""
Write-Host "=== Test termine ===" -ForegroundColor Green
