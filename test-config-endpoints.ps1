# Script pour tester les endpoints de configuration

Write-Host "Test des endpoints de configuration..." -ForegroundColor Yellow

# Test de base - health check
Write-Host "`n1. Test du health check..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -UseBasicParsing
    Write-Host "Health check OK: $($healthResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Health check echoue: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test des endpoints publics
Write-Host "`n2. Test des endpoints publics..." -ForegroundColor Cyan
try {
    $regionsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/regions" -UseBasicParsing
    Write-Host "Endpoint regions OK: $($regionsResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Endpoint regions echoue: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $qualitiesResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/qualities" -UseBasicParsing
    Write-Host "Endpoint qualities OK: $($qualitiesResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Endpoint qualities echoue: $($_.Exception.Message)" -ForegroundColor Red
}

# Test des endpoints de configuration (sans authentification - devrait retourner 401)
Write-Host "`n3. Test des endpoints de configuration (sans auth)..." -ForegroundColor Cyan
try {
    $configResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/users/me/config" -UseBasicParsing
    Write-Host "Endpoint config accessible sans auth: $($configResponse.StatusCode)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "Endpoint config protege (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "Endpoint config erreur inattendue: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nURLs de configuration disponibles:" -ForegroundColor Magenta
Write-Host "   GET  /api/v1/users/me/config" -ForegroundColor White
Write-Host "   PUT  /api/v1/users/me/config" -ForegroundColor White
Write-Host "   GET  /api/v1/users/me/preferences" -ForegroundColor White
Write-Host "   PUT  /api/v1/users/me/preferences" -ForegroundColor White
Write-Host "   GET  /api/v1/users/me/notification-preferences" -ForegroundColor White
Write-Host "   PUT  /api/v1/users/me/notification-preferences" -ForegroundColor White

Write-Host "`nPour acceder a ces endpoints, vous devez etre connecte avec un token JWT valide." -ForegroundColor Yellow
