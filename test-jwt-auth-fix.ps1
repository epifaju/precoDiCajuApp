#!/usr/bin/env pwsh
# Test script pour valider les corrections d'authentification JWT

Write-Host "🔧 Test des corrections d'authentification JWT" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan

# Configuration
$baseUrl = "http://localhost:8080/api/v1"
$testEmail = "admin@precaju.gw"
$testPassword = "admin123"

# Fonction pour faire des requêtes HTTP
function Invoke-ApiRequest {
    param(
        [string]$Method = "GET",
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method $Method -Headers $Headers -Body $Body -ContentType "application/json" -ErrorAction Stop
        return @{ Success = $true; Data = $response }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorMessage = $_.Exception.Message
        return @{ Success = $false; StatusCode = $statusCode; Error = $errorMessage }
    }
}

# Test 1: Vérifier que les endpoints publics fonctionnent sans authentification
Write-Host "`n📋 Test 1: Endpoints publics (sans authentification)" -ForegroundColor Yellow
Write-Host "---------------------------------------------------" -ForegroundColor Yellow

$endpoints = @(
    "/regions",
    "/qualities", 
    "/exportateurs"
)

foreach ($endpoint in $endpoints) {
    Write-Host "Testing $endpoint..." -NoNewline
    $result = Invoke-ApiRequest -Url "$baseUrl$endpoint"
    
    if ($result.Success) {
        Write-Host " ✅ SUCCESS" -ForegroundColor Green
        $data = $result.Data
        if ($data -is [array]) {
            Write-Host "  → Found $($data.Count) items" -ForegroundColor Gray
        }
        elseif ($data -is [object]) {
            Write-Host "  → Response received" -ForegroundColor Gray
        }
    }
    else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "  → Status: $($result.StatusCode)" -ForegroundColor Red
        Write-Host "  → Error: $($result.Error)" -ForegroundColor Red
    }
}

# Test 2: Login et récupération du token
Write-Host "`n🔐 Test 2: Authentification et récupération du token JWT" -ForegroundColor Yellow
Write-Host "--------------------------------------------------------" -ForegroundColor Yellow

$loginBody = @{
    email    = $testEmail
    password = $testPassword
} | ConvertTo-Json

Write-Host "Attempting login for $testEmail..." -NoNewline
$loginResult = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/auth/login" -Body $loginBody

if ($loginResult.Success) {
    Write-Host " ✅ LOGIN SUCCESS" -ForegroundColor Green
    $authData = $loginResult.Data
    $accessToken = $authData.access_token
    $refreshToken = $authData.refresh_token
    $expiresIn = $authData.expires_in
    
    Write-Host "  → Access Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Gray
    Write-Host "  → Expires in: $($expiresIn/1000) seconds" -ForegroundColor Gray
    
    # Test 3: Vérifier le statut du token
    Write-Host "`n🔍 Test 3: Vérification du statut du token JWT" -ForegroundColor Yellow
    Write-Host "-----------------------------------------------" -ForegroundColor Yellow
    
    $authHeaders = @{ "Authorization" = "Bearer $accessToken" }
    Write-Host "Checking token status..." -NoNewline
    $tokenStatusResult = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/auth/token-status" -Headers $authHeaders
    
    if ($tokenStatusResult.Success) {
        Write-Host " ✅ SUCCESS" -ForegroundColor Green
        $statusData = $tokenStatusResult.Data
        Write-Host "  → Valid: $($statusData.valid)" -ForegroundColor Gray
        Write-Host "  → Username: $($statusData.username)" -ForegroundColor Gray
        Write-Host "  → Time until expiration: $($statusData.timeUntilExpirationMinutes) minutes" -ForegroundColor Gray
        Write-Host "  → Expiring soon: $($statusData.expiringSoon)" -ForegroundColor Gray
    }
    else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "  → Error: $($tokenStatusResult.Error)" -ForegroundColor Red
    }
    
    # Test 4: Accès aux endpoints protégés avec token
    Write-Host "`n🔒 Test 4: Endpoints protégés avec authentification" -ForegroundColor Yellow
    Write-Host "---------------------------------------------------" -ForegroundColor Yellow
    
    $protectedEndpoints = @(
        "/users/me",
        "/exportateurs/statistics"
    )
    
    foreach ($endpoint in $protectedEndpoints) {
        Write-Host "Testing protected $endpoint..." -NoNewline
        $result = Invoke-ApiRequest -Method "GET" -Url "$baseUrl$endpoint" -Headers $authHeaders
        
        if ($result.Success) {
            Write-Host " ✅ SUCCESS" -ForegroundColor Green
        }
        else {
            Write-Host " ❌ FAILED" -ForegroundColor Red
            Write-Host "  → Status: $($result.StatusCode)" -ForegroundColor Red
            Write-Host "  → Error: $($result.Error)" -ForegroundColor Red
        }
    }
    
    # Test 5: Refresh token
    Write-Host "`n🔄 Test 5: Refresh du token JWT" -ForegroundColor Yellow
    Write-Host "-------------------------------" -ForegroundColor Yellow
    
    $refreshBody = @{
        refresh_token = $refreshToken
    } | ConvertTo-Json
    
    Write-Host "Refreshing token..." -NoNewline
    $refreshResult = Invoke-ApiRequest -Method "POST" -Url "$baseUrl/auth/refresh" -Body $refreshBody
    
    if ($refreshResult.Success) {
        Write-Host " ✅ SUCCESS" -ForegroundColor Green
        $newAuthData = $refreshResult.Data
        $newAccessToken = $newAuthData.access_token
        Write-Host "  → New Access Token: $($newAccessToken.Substring(0, 20))..." -ForegroundColor Gray
    }
    else {
        Write-Host " ❌ FAILED" -ForegroundColor Red
        Write-Host "  → Error: $($refreshResult.Error)" -ForegroundColor Red
    }
    
}
else {
    Write-Host " ❌ LOGIN FAILED" -ForegroundColor Red
    Write-Host "  → Status: $($loginResult.StatusCode)" -ForegroundColor Red
    Write-Host "  → Error: $($loginResult.Error)" -ForegroundColor Red
    Write-Host "`n⚠️  Cannot proceed with authenticated tests" -ForegroundColor Yellow
}

# Test 6: Test avec token expiré/invalide
Write-Host "`n🚫 Test 6: Gestion des tokens invalides" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Yellow

$invalidToken = "invalid.jwt.token"
$invalidHeaders = @{ "Authorization" = "Bearer $invalidToken" }

Write-Host "Testing with invalid token..." -NoNewline
$invalidResult = Invoke-ApiRequest -Method "GET" -Url "$baseUrl/users/me" -Headers $invalidHeaders

if ($invalidResult.Success) {
    Write-Host " ❌ UNEXPECTED SUCCESS" -ForegroundColor Red
}
else {
    Write-Host " ✅ CORRECTLY REJECTED" -ForegroundColor Green
    Write-Host "  → Status: $($invalidResult.StatusCode)" -ForegroundColor Gray
}

# Test 7: Test CORS
Write-Host "`n🌐 Test 7: Test CORS (OPTIONS request)" -ForegroundColor Yellow
Write-Host "---------------------------------------" -ForegroundColor Yellow

try {
    $corsResult = Invoke-RestMethod -Uri "$baseUrl/exportateurs" -Method "OPTIONS" -Headers @{ "Origin" = "http://localhost:3000" } -ErrorAction Stop
    Write-Host "CORS preflight request: ✅ SUCCESS" -ForegroundColor Green
}
catch {
    Write-Host "CORS preflight request: ❌ FAILED" -ForegroundColor Red
    Write-Host "  → Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Résumé des tests
Write-Host "`n📊 Résumé des corrections appliquées:" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "✅ Configuration de sécurité uniformisée" -ForegroundColor Green
Write-Host "✅ Endpoints /exportateurs rendus publics (GET)" -ForegroundColor Green
Write-Host "✅ Annotations @PreAuthorize supprimées au niveau de la classe" -ForegroundColor Green
Write-Host "✅ Gestion JWT améliorée avec logs détaillés" -ForegroundColor Green
Write-Host "✅ Endpoint /auth/token-status ajouté" -ForegroundColor Green
Write-Host "✅ Méthodes utilitaires pour l'expiration des tokens" -ForegroundColor Green
Write-Host "✅ Gestion des erreurs JWT améliorée" -ForegroundColor Green

Write-Host "`n🎯 Prochaines étapes recommandées:" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host "• Tester l'application frontend avec les nouveaux endpoints" -ForegroundColor Yellow
Write-Host "• Implémenter le refresh automatique des tokens côté frontend" -ForegroundColor Yellow
Write-Host "• Configurer les alertes d'expiration de token" -ForegroundColor Yellow
Write-Host "• Ajouter des tests unitaires pour la sécurité" -ForegroundColor Yellow

Write-Host "`n✨ Tests terminés!" -ForegroundColor Green
