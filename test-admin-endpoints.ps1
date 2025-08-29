# Script de test des endpoints admin
# Teste les endpoints /api/v1/admin/users et /api/v1/admin/users/stats

$BACKEND_URL = "http://localhost:8080"
$ADMIN_EMAIL = "admin@precaju.gw"
$ADMIN_PASSWORD = "admin123"

Write-Host "🔍 Test des Endpoints Admin" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

# Test 1: Login admin
Write-Host "`n🔐 Test 1: Login Admin" -ForegroundColor Yellow
$loginBody = @{
    email = $ADMIN_EMAIL
    password = $ADMIN_PASSWORD
    rememberMe = $false
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $authResponse = $response.Content | ConvertFrom-Json
        $accessToken = $authResponse.accessToken
        Write-Host "✅ Login admin réussi" -ForegroundColor Green
        Write-Host "   Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Login admin échoué: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Endpoint /api/v1/admin/users (liste des utilisateurs)
Write-Host "`n👥 Test 2: Liste des Utilisateurs" -ForegroundColor Yellow
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $accessToken"
}

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/admin/users?page=0&size=10" -Method GET -Headers $authHeaders -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $users = $response.Content | ConvertFrom-Json
        Write-Host "✅ Liste des utilisateurs récupérée" -ForegroundColor Green
        Write-Host "   Total utilisateurs: $($users.totalElements)" -ForegroundColor Gray
        Write-Host "   Page actuelle: $($users.number + 1)/$($users.totalPages)" -ForegroundColor Gray
        Write-Host "   Taille de page: $($users.size)" -ForegroundColor Gray
        Write-Host "   Utilisateurs dans cette page: $($users.content.Count)" -ForegroundColor Gray
        
        if ($users.content.Count -gt 0) {
            Write-Host "   Premier utilisateur: $($users.content[0].email) (Role: $($users.content[0].role))" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Liste des utilisateurs échouée: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Détails de l'erreur: $errorContent" -ForegroundColor Red
    }
}

# Test 3: Endpoint /api/v1/admin/users/stats (statistiques)
Write-Host "`n📊 Test 3: Statistiques des Utilisateurs" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/admin/users/stats" -Method GET -Headers $authHeaders -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $stats = $response.Content | ConvertFrom-Json
        Write-Host "✅ Statistiques des utilisateurs récupérées" -ForegroundColor Green
        Write-Host "   Total utilisateurs: $($stats.totalUsers)" -ForegroundColor Gray
        Write-Host "   Utilisateurs actifs: $($stats.activeUsers)" -ForegroundColor Gray
        Write-Host "   Admins: $($stats.adminUsers)" -ForegroundColor Gray
        Write-Host "   Modérateurs: $($stats.moderatorUsers)" -ForegroundColor Gray
        Write-Host "   Contributeurs: $($stats.contributorUsers)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Statistiques des utilisateurs échouées: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Détails de l'erreur: $errorContent" -ForegroundColor Red
    }
}

# Test 4: Test avec filtres
Write-Host "`n🔍 Test 4: Filtres et Pagination" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/admin/users?page=0&size=5&role=CONTRIBUTOR&active=true" -Method GET -Headers $authHeaders -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $users = $response.Content | ConvertFrom-Json
        Write-Host "✅ Filtres et pagination fonctionnent" -ForegroundColor Green
        Write-Host "   Filtre role=CONTRIBUTOR, active=true" -ForegroundColor Gray
        Write-Host "   Résultats: $($users.content.Count) utilisateurs" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Test des filtres échoué: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Tests des endpoints admin terminés" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
