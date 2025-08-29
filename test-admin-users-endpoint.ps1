# Script pour tester l'endpoint admin/users
Write-Host "=== Test de l'endpoint admin/users ===" -ForegroundColor Green

# Attendre que le backend démarre
Write-Host "Attente du démarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier si le backend est en cours d'exécution
$backendRunning = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendRunning = $true
            Write-Host "✅ Backend démarré et accessible" -ForegroundColor Green
            break
        }
    } catch {
        Write-Host "⏳ Attente du backend... ($($i + 1)/30)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $backendRunning) {
    Write-Host "❌ Le backend n'a pas démarré dans le délai imparti" -ForegroundColor Red
    exit 1
}

# Tester l'endpoint admin/users (sans authentification pour voir l'erreur 401/403)
Write-Host "`n=== Test de l'endpoint admin/users (sans authentification) ===" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=20" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "❌ Erreur: L'endpoint a répondu avec le statut $($response.StatusCode) au lieu d'une erreur d'authentification" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401 -or $statusCode -eq 403) {
        Write-Host "✅ Endpoint accessible: Erreur d'authentification attendue (Status: $statusCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur inattendue: Status $statusCode" -ForegroundColor Red
        Write-Host "Message d'erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== Test terminé ===" -ForegroundColor Green
