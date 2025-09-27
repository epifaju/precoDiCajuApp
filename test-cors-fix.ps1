#!/usr/bin/env pwsh

Write-Host "🔧 Test des corrections CORS et timeout API" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Vérifier que le backend est démarré
Write-Host "`n1. Vérification du backend (port 8080)..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 10
    Write-Host "✅ Backend accessible: $($backendResponse.status)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Veuillez démarrer le backend avant de continuer" -ForegroundColor Yellow
    exit 1
}

# Test des endpoints problématiques
Write-Host "`n2. Test des endpoints exportateurs..." -ForegroundColor Yellow

$endpoints = @(
    @{ Name = "Exportateurs"; Url = "http://localhost:8080/api/v1/exportateurs" },
    @{ Name = "Régions"; Url = "http://localhost:8080/api/v1/regions" },
    @{ Name = "Qualités"; Url = "http://localhost:8080/api/v1/qualities" }
)

foreach ($endpoint in $endpoints) {
    try {
        Write-Host "   Test de $($endpoint.Name)..." -NoNewline
        $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -TimeoutSec 15
        Write-Host " ✅ Succès" -ForegroundColor Green
        
        # Afficher quelques informations sur la réponse
        if ($response -is [array]) {
            Write-Host "      Nombre d'éléments: $($response.Count)" -ForegroundColor Gray
        }
        elseif ($response.content -is [array]) {
            Write-Host "      Nombre d'éléments: $($response.content.Count)" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host " ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        
        # Analyser le type d'erreur
        if ($_.Exception.Message -like "*CORS*") {
            Write-Host "      → Problème CORS détecté" -ForegroundColor Red
        }
        elseif ($_.Exception.Message -like "*timeout*") {
            Write-Host "      → Timeout détecté" -ForegroundColor Red
        }
        elseif ($_.Exception.Message -like "*404*") {
            Write-Host "      → Endpoint non trouvé" -ForegroundColor Red
        }
    }
}

# Test des headers CORS
Write-Host "`n3. Test des headers CORS..." -ForegroundColor Yellow

try {
    $corsTest = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/exportateurs" -Method OPTIONS -Headers @{
        "Origin"                         = "http://localhost:3001"
        "Access-Control-Request-Method"  = "GET"
        "Access-Control-Request-Headers" = "Content-Type"
    } -TimeoutSec 10

    Write-Host "✅ Requête preflight OPTIONS réussie" -ForegroundColor Green
    Write-Host "   Status: $($corsTest.StatusCode)" -ForegroundColor Gray
    
    # Vérifier les headers CORS
    $corsHeaders = @(
        "Access-Control-Allow-Origin",
        "Access-Control-Allow-Methods", 
        "Access-Control-Allow-Headers",
        "Access-Control-Max-Age"
    )
    
    foreach ($header in $corsHeaders) {
        if ($corsTest.Headers[$header]) {
            Write-Host "   $header : $($corsTest.Headers[$header])" -ForegroundColor Gray
        }
        else {
            Write-Host "   ⚠️  Header $header manquant" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "❌ Test CORS échoué: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de performance (timeout)
Write-Host "`n4. Test de performance..." -ForegroundColor Yellow

try {
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs" -Method GET -TimeoutSec 20
    $stopwatch.Stop()
    
    $responseTime = $stopwatch.ElapsedMilliseconds
    Write-Host "✅ Temps de réponse: ${responseTime}ms" -ForegroundColor Green
    
    if ($responseTime -lt 5000) {
        Write-Host "   → Excellent (moins de 5s)" -ForegroundColor Green
    }
    elseif ($responseTime -lt 10000) {
        Write-Host "   → Bon (moins de 10s)" -ForegroundColor Yellow
    }
    else {
        Write-Host "   → Lent (plus de 10s)" -ForegroundColor Red
    }
}
catch {
    Write-Host "❌ Test de performance échoué: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Résumé des tests:" -ForegroundColor Cyan
Write-Host "- Backend accessible: ✅" -ForegroundColor Green
Write-Host "- Endpoints exportateurs: Testés" -ForegroundColor Yellow  
Write-Host "- Configuration CORS: Vérifiée" -ForegroundColor Yellow
Write-Host "- Performance: Mesurée" -ForegroundColor Yellow

Write-Host "`n💡 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Démarrer le frontend: npm run dev (port 3001)" -ForegroundColor White
Write-Host "2. Tester l'application dans le navigateur" -ForegroundColor White
Write-Host "3. Vérifier la console pour les erreurs CORS" -ForegroundColor White

Write-Host "`n✅ Test terminé!" -ForegroundColor Green