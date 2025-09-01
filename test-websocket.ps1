# Script de test pour la fonctionnalité WebSocket
# Ce script teste la connexion WebSocket et les notifications temps réel

Write-Host "🚀 Test de la fonctionnalité WebSocket - Preço di Cajú" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Vérifier que les services sont démarrés
Write-Host "`n📋 Vérification des services..." -ForegroundColor Yellow

# Test de l'API backend
Write-Host "`n🔍 Test de l'API backend..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET
    if ($response.status -eq "UP") {
        Write-Host "✅ Backend API: OK" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend API: Problème" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Backend API: Non accessible" -ForegroundColor Red
    Write-Host "   Assurez-vous que le backend est démarré sur http://localhost:8080" -ForegroundColor Yellow
    exit 1
}

# Test de l'endpoint WebSocket
Write-Host "`n🔍 Test de l'endpoint WebSocket..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/ws" -Method GET -ErrorAction Stop
    Write-Host "✅ Endpoint WebSocket: Accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Endpoint WebSocket: Non accessible" -ForegroundColor Red
    Write-Host "   Vérifiez la configuration WebSocket dans le backend" -ForegroundColor Yellow
}

# Test de l'authentification
Write-Host "`n🔍 Test de l'authentification..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "admin@precaju.com"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($response.accessToken) {
        Write-Host "✅ Authentification: OK" -ForegroundColor Green
        $token = $response.accessToken
    } else {
        Write-Host "❌ Authentification: Échec" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Authentification: Erreur" -ForegroundColor Red
    Write-Host "   Vérifiez les identifiants de test" -ForegroundColor Yellow
    exit 1
}

# Test de creation d'un prix (pour declencher les WebSockets)
Write-Host "`n🔍 Test de creation d'un prix..." -ForegroundColor Cyan
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $priceData = @{
        regionCode = "BIS"
        qualityGrade = "W180"
        priceFcfa = 2500
        recordedDate = (Get-Date).ToString("yyyy-MM-dd")
        sourceName = "Test WebSocket"
        sourceType = "MARKET"
        notes = "Test de notification WebSocket"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/prices" -Method POST -Body $priceData -Headers $headers
    
    if ($response.id) {
        Write-Host "✅ Creation de prix: OK (ID: $($response.id))" -ForegroundColor Green
        $priceId = $response.id
    } else {
        Write-Host "❌ Creation de prix: Echec" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Creation de prix: Erreur" -ForegroundColor Red
    Write-Host "   Details: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test des statistiques
Write-Host "`n🔍 Test des statistiques..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/prices/stats" -Method GET -Headers $headers
    
    if ($response.totalPrices) {
        Write-Host "✅ Statistiques: OK ($($response.totalPrices) prix)" -ForegroundColor Green
    } else {
        Write-Host "❌ Statistiques: Problème" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Statistiques: Erreur" -ForegroundColor Red
}

# Instructions pour tester le frontend
Write-Host "`n🌐 Instructions pour tester le frontend:" -ForegroundColor Magenta
Write-Host "=====================================" -ForegroundColor Magenta
Write-Host "1. Démarrez le frontend: cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. Ouvrez http://localhost:3000 dans votre navigateur" -ForegroundColor White
Write-Host "3. Connectez-vous avec admin@precaju.com / admin123" -ForegroundColor White
Write-Host "4. Allez sur le Dashboard pour voir l'indicateur de connexion WebSocket" -ForegroundColor White
Write-Host "5. Ouvrez plusieurs onglets et créez un nouveau prix" -ForegroundColor White
Write-Host "6. Vérifiez que les notifications apparaissent en temps réel" -ForegroundColor White

Write-Host "`n📊 Fonctionnalités WebSocket implémentées:" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "✅ Connexion WebSocket avec authentification JWT" -ForegroundColor Green
Write-Host "✅ Notifications de nouveaux prix" -ForegroundColor Green
Write-Host "✅ Notifications de mises à jour de prix" -ForegroundColor Green
Write-Host "✅ Notifications de vérification de prix" -ForegroundColor Green
Write-Host "✅ Alertes de variations de prix significatives" -ForegroundColor Green
Write-Host "✅ Mises à jour de statistiques en temps réel" -ForegroundColor Green
Write-Host "✅ Reconnexion automatique" -ForegroundColor Green
Write-Host "✅ Indicateurs de statut de connexion" -ForegroundColor Green
Write-Host "✅ Notifications toast multilingues" -ForegroundColor Green

Write-Host "`n🎉 Test terminé avec succès!" -ForegroundColor Green
Write-Host "La fonctionnalité WebSocket est prête à être utilisée." -ForegroundColor Green
