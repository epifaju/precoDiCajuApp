# Script simple pour tester le statut de l'application
Write-Host "=== TEST DU STATUT DE L'APPLICATION ===" -ForegroundColor Green
Write-Host ""

# 1. Vérifier les processus Java
Write-Host "1. Vérification des processus Java..." -ForegroundColor Yellow
$javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
if ($javaProcesses) {
    Write-Host "   ✅ $($javaProcesses.Count) processus Java en cours d'exécution" -ForegroundColor Green
    $javaProcesses | ForEach-Object { Write-Host "      - PID: $($_.Id), CPU: $($_.CPU)" -ForegroundColor Cyan }
} else {
    Write-Host "   ❌ Aucun processus Java en cours d'exécution" -ForegroundColor Red
}

Write-Host ""

# 2. Vérifier le port 8080
Write-Host "2. Vérification du port 8080..." -ForegroundColor Yellow
try {
    $portCheck = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
    if ($portCheck) {
        Write-Host "   ✅ Port 8080 est utilisé" -ForegroundColor Green
        $portCheck | ForEach-Object { Write-Host "      - État: $($_.State), PID: $($_.OwningProcess)" -ForegroundColor Cyan }
    } else {
        Write-Host "   ❌ Port 8080 n'est pas utilisé" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Impossible de vérifier le port: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 3. Test de l'endpoint de santé
Write-Host "3. Test de l'endpoint de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ✅ Application accessible - Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "      Réponse: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "   ❌ Application non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Test des endpoints d'administration
Write-Host "4. Test des endpoints d'administration..." -ForegroundColor Yellow

# Test /admin/users
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=20" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ❌ /admin/users accessible sans authentification (devrait retourner 401)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "   ✅ /admin/users retourne bien 401 (Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  /admin/users retourne $statusCode" -ForegroundColor Yellow
    }
}

# Test /admin/users/stats
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users/stats" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "   ❌ /admin/users/stats accessible sans authentification (devrait retourner 401)" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "   ✅ /admin/users/stats retourne bien 401 (Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  /admin/users/stats retourne $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== FIN DU TEST ===" -ForegroundColor Green
