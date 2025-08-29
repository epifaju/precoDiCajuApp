# Test script pour verifier que la page des prix fonctionne
Write-Host "=== Test de la page des prix ===" -ForegroundColor Green

# Test du frontend
Write-Host "`n1. Test du frontend (port 3000)..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($frontendResponse.StatusCode -eq 200) {
        Write-Host "✓ Frontend accessible sur http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend retourne le statut: $($frontendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erreur d'acces au frontend: $($_.Exception.Message)" -ForegroundColor Red
}

# Test du backend
Write-Host "`n2. Test du backend (port 8080)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -UseBasicParsing -TimeoutSec 10
    if ($backendResponse.StatusCode -eq 200) {
        Write-Host "✓ Backend accessible sur http://localhost:8080" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend retourne le statut: $($backendResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erreur d'acces au backend: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API des prix
Write-Host "`n3. Test de l'API des prix..." -ForegroundColor Yellow
try {
    $pricesResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/prices" -UseBasicParsing -TimeoutSec 10
    if ($pricesResponse.StatusCode -eq 200) {
        Write-Host "✓ API des prix accessible" -ForegroundColor Green
        $pricesData = $pricesResponse.Content | ConvertFrom-Json
        Write-Host "  - Total de prix: $($pricesData.totalElements)" -ForegroundColor Cyan
    } else {
        Write-Host "✗ API des prix retourne le statut: $($pricesResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erreur d'acces a l'API des prix: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test termine ===" -ForegroundColor Green
Write-Host "Ouvrez http://localhost:3000 dans votre navigateur et naviguez vers la page des prix" -ForegroundColor Cyan
Write-Host "L'erreur 'key prices.filters returned an object instead of string' devrait etre resolue" -ForegroundColor Cyan
