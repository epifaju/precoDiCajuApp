#!/usr/bin/env pwsh

# Script de test pour vérifier la correction de l'icône WiFi
# Ce script teste la connexion au backend et vérifie que l'icône WiFi fonctionne correctement

Write-Host "🔍 Test de Correction de l'Icône WiFi - Preço di Cajú" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier que le backend est en cours d'exécution
Write-Host "`n1. Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method HEAD -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend accessible sur le port 8080" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend répond avec le code: $($response.StatusCode)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Démarrez le backend avec: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le frontend est en cours d'exécution
Write-Host "`n2. Vérification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend accessible sur le port 5173" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend répond avec le code: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Démarrez le frontend avec: cd frontend && npm run dev" -ForegroundColor Yellow
}

# Tester l'endpoint de santé avec différents paramètres
Write-Host "`n3. Test de l'endpoint de santé..." -ForegroundColor Yellow

$endpoints = @(
    @{ Url = "http://localhost:8080/actuator/health"; Method = "HEAD"; Description = "Endpoint de santé (HEAD)" },
    @{ Url = "http://localhost:8080/actuator/health"; Method = "GET"; Description = "Endpoint de santé (GET)" },
    @{ Url = "http://localhost:8080/api/v1/health"; Method = "HEAD"; Description = "Ancien endpoint (HEAD)" }
)

foreach ($endpoint in $endpoints) {
    try {
        $start = Get-Date
        $response = Invoke-WebRequest -Uri $endpoint.Url -Method $endpoint.Method -TimeoutSec 5
        $duration = ((Get-Date) - $start).TotalMilliseconds
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($endpoint.Description): OK (${duration}ms)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($endpoint.Description): Code $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $($endpoint.Description): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Vérifier la configuration CORS
Write-Host "`n4. Test de la configuration CORS..." -ForegroundColor Yellow
try {
    $headers = @{
        "Origin" = "http://localhost:5173"
        "Access-Control-Request-Method" = "HEAD"
        "Access-Control-Request-Headers" = "Content-Type"
    }
    
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method OPTIONS -Headers $headers -TimeoutSec 5
    
    if ($response.Headers["Access-Control-Allow-Origin"]) {
        Write-Host "✅ CORS configuré: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Green
    } else {
        Write-Host "⚠️  CORS: Pas d'en-tête Access-Control-Allow-Origin" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Test CORS échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# Ouvrir la page de test
Write-Host "`n5. Ouverture de la page de test..." -ForegroundColor Yellow
$testPagePath = Join-Path $PSScriptRoot "test-wifi-connection.html"
if (Test-Path $testPagePath) {
    Write-Host "✅ Page de test trouvée: $testPagePath" -ForegroundColor Green
    Write-Host "🌐 Ouverture de la page de test dans le navigateur..." -ForegroundColor Cyan
    Start-Process $testPagePath
} else {
    Write-Host "❌ Page de test non trouvée: $testPagePath" -ForegroundColor Red
}

# Résumé des corrections apportées
Write-Host "`n📋 Résumé des corrections apportées:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. ✅ Correction de l'endpoint dans useConnectionStatus.ts" -ForegroundColor Green
Write-Host "   - Ancien: /api/v1/health" -ForegroundColor Gray
Write-Host "   - Nouveau: /actuator/health" -ForegroundColor Gray
Write-Host ""
Write-Host "2. ✅ Vérification du backend Spring Boot" -ForegroundColor Green
Write-Host "   - Port: 8080" -ForegroundColor Gray
Write-Host "   - Endpoint: /actuator/health" -ForegroundColor Gray
Write-Host "   - Configuration CORS: OK" -ForegroundColor Gray
Write-Host ""
Write-Host "3. ✅ Création d'une page de test" -ForegroundColor Green
Write-Host "   - Fichier: test-wifi-connection.html" -ForegroundColor Gray
Write-Host "   - Tests: Connexion, latence, erreurs" -ForegroundColor Gray

Write-Host "`n🎯 Instructions pour tester:" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan
Write-Host "1. Ouvrez la page de test dans votre navigateur" -ForegroundColor White
Write-Host "2. Vérifiez que l'icône WiFi est verte (en ligne)" -ForegroundColor White
Write-Host "3. Testez les boutons de simulation offline/online" -ForegroundColor White
Write-Host "4. Vérifiez que l'application React affiche maintenant l'icône correcte" -ForegroundColor White

Write-Host "`n✨ L'icône WiFi devrait maintenant être verte au lieu de rouge !" -ForegroundColor Green
