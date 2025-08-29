# Script pour démarrer le backend et tester les endpoints admin
Write-Host "🚀 Démarrage du Backend et Test des Endpoints Admin" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Vérifier si le backend est déjà en cours d'exécution
Write-Host "`n🔍 Vérification du statut du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend déjà en cours d'exécution sur le port 8080" -ForegroundColor Green
        $backendRunning = $true
    }
} catch {
    Write-Host "ℹ️ Backend non démarré, démarrage en cours..." -ForegroundColor Yellow
    $backendRunning = $false
}

# Démarrer le backend s'il n'est pas déjà en cours d'exécution
if (-not $backendRunning) {
    Write-Host "`n🚀 Démarrage du backend..." -ForegroundColor Yellow
    Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d $PWD\backend && mvn spring-boot:run" -WindowStyle Minimized
    
    # Attendre que le backend démarre
    Write-Host "⏳ Attente du démarrage du backend..." -ForegroundColor Yellow
    $maxAttempts = 30
    $attempt = 0
    
    do {
        Start-Sleep -Seconds 2
        $attempt++
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "✅ Backend démarré avec succès!" -ForegroundColor Green
                break
            }
        } catch {
            Write-Host "   Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
        }
    } while ($attempt -lt $maxAttempts)
    
    if ($attempt -ge $maxAttempts) {
        Write-Host "❌ Le backend n'a pas démarré dans le délai imparti" -ForegroundColor Red
        exit 1
    }
    
    # Attendre un peu plus pour que l'application soit complètement initialisée
    Write-Host "⏳ Attente de l'initialisation complète..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Tester les endpoints admin
Write-Host "`n🧪 Test des endpoints admin..." -ForegroundColor Yellow
& "$PWD\test-admin-endpoints.ps1"

Write-Host "`n🎉 Script terminé!" -ForegroundColor Green
Write-Host "Le backend est en cours d'exécution sur http://localhost:8080" -ForegroundColor Cyan
Write-Host "Vous pouvez maintenant tester l'interface d'administration dans le frontend" -ForegroundColor Cyan
