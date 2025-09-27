#!/usr/bin/env pwsh

Write-Host "=== Test de diagnostic pour l'endpoint exportateurs ===" -ForegroundColor Green

# Test 1: Vérifier si le backend répond
Write-Host "`n1. Test de connectivité backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Test endpoint simple
Write-Host "`n2. Test endpoint simple..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/exportateurs/test" -Method GET -TimeoutSec 5
    Write-Host "✅ Endpoint test accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Endpoint test non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test avec authentification
Write-Host "`n3. Test avec authentification..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJhZG1pbkBwcmVjYWp1Lmd3IiwiaWF0IjoxNzU5MDA1MDA2LCJleHAiOjE3NTkwMDU5MDZ9.jRiSfI3GL4Jbxtk37-LLTwZ4ILzeeMQvmcdnWm2IpHydODbyIwF9r1ejmQBCmjwI"
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/exportateurs?page=0&size=5&sortBy=nom&sortDir=asc" -Method GET -Headers $headers -TimeoutSec 10
    Write-Host "✅ Endpoint exportateurs accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length) characters" -ForegroundColor Gray
} catch {
    Write-Host "❌ Endpoint exportateurs erreur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Status Description: $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    }
}

Write-Host "`n=== Fin du diagnostic ===" -ForegroundColor Green
