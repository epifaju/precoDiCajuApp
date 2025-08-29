# Test de connexion à la base de données
Write-Host "=== Test de connexion à la base de données ===" -ForegroundColor Green

# Vérifier si PostgreSQL est en cours d'exécution
Write-Host "1. Vérification de PostgreSQL..." -ForegroundColor Yellow
try {
    $pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
    if ($pgProcess) {
        Write-Host "✓ PostgreSQL est en cours d'exécution (PID: $($pgProcess.Id))" -ForegroundColor Green
    } else {
        Write-Host "✗ PostgreSQL n'est pas en cours d'exécution" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Erreur lors de la vérification de PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
}

# Vérifier la connexion au serveur
Write-Host "`n2. Test de connexion au serveur..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET
    Write-Host "✓ Serveur backend accessible" -ForegroundColor Green
    Write-Host "Status: $($response.status)" -ForegroundColor Cyan
} catch {
    Write-Host "✗ Serveur backend inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'endpoint de santé de la base de données
Write-Host "`n3. Test de la santé de la base de données..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET
    if ($response.components.db) {
        Write-Host "✓ Base de données accessible" -ForegroundColor Green
        Write-Host "Status DB: $($response.components.db.status)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠ Informations de base de données non disponibles" -ForegroundColor Yellow
    }
} catch {
    Write-Host "✗ Impossible de vérifier la santé de la base de données: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test terminé ===" -ForegroundColor Green
