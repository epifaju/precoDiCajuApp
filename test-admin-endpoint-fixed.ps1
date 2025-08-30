# Test de l'endpoint admin après corrections
Write-Host "=== TEST ENDPOINT ADMIN APRES CORRECTIONS ===" -ForegroundColor Green

# Attendre que le backend démarre
Write-Host "Attente du démarrage du backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test 1: Vérifier que le backend est en cours d'exécution
Write-Host "`n1. Vérification du statut du backend..." -ForegroundColor Cyan
$backendStatus = netstat -an | findstr :8080
if ($backendStatus) {
    Write-Host "✅ Backend en cours d'exécution sur le port 8080" -ForegroundColor Green
} else {
    Write-Host "❌ Backend non accessible sur le port 8080" -ForegroundColor Red
    exit 1
}

# Test 2: Test de l'endpoint admin/users sans authentification
Write-Host "`n2. Test de l'endpoint /api/v1/admin/users sans authentification..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=20" -Method GET -ErrorAction Stop
    Write-Host "❌ Erreur: L'endpoint devrait être protégé par authentification" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Endpoint correctement protégé (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Réponse inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 3: Test avec un token invalide
Write-Host "`n3. Test avec un token invalide..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer invalid_token"
        "Content-Type" = "application/json"
    }
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=20" -Method GET -Headers $headers -ErrorAction Stop
    Write-Host "❌ Erreur: L'endpoint devrait rejeter un token invalide" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Token invalide correctement rejeté (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Réponse inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

# Test 4: Vérifier les logs du backend
Write-Host "`n4. Vérification des logs du backend..." -ForegroundColor Cyan
Write-Host "Vérifiez les logs du backend pour voir les erreurs détaillées" -ForegroundColor Yellow

Write-Host "`n=== FIN DES TESTS ===" -ForegroundColor Green
Write-Host "Si vous obtenez toujours une erreur 500, vérifiez les logs du backend" -ForegroundColor Yellow
