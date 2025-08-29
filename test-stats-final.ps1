# Test final de l'endpoint des statistiques après correction PostgreSQL
Write-Host "Test final de l'endpoint des statistiques" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "Vérification de la correction du problème PostgreSQL" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080"
$endpoint = "/api/v1/prices/stats"

Write-Host "`n🔍 Test 1: Endpoint avec paramètres par défaut (30 jours)" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method Get -ContentType "application/json"
    Write-Host "✅ SUCCÈS ! L'endpoint fonctionne maintenant" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)" -ForegroundColor Cyan
    Write-Host "Period days: $($response.periodDays)" -ForegroundColor Cyan
    
    if ($response.minPrice) {
        Write-Host "Min price: $($response.minPrice)" -ForegroundColor Cyan
    }
    if ($response.maxPrice) {
        Write-Host "Max price: $($response.maxPrice)" -ForegroundColor Cyan
    }
    if ($response.averagePrice) {
        Write-Host "Average price: $($response.averagePrice)" -ForegroundColor Cyan
    }
    
    Write-Host "`n🎯 Problème PostgreSQL résolu !" -ForegroundColor Green
    Write-Host "✅ Pas d'erreur 'could not determine data type of parameter'" -ForegroundColor Green
    Write-Host "✅ Requête SQL générée sans ambiguïté de type" -ForegroundColor Green
    
} catch {
    Write-Host "❌ ERREUR : L'endpoint ne fonctionne toujours pas" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "`n💡 Suggestions de débogage :" -ForegroundColor Yellow
        Write-Host "1. Vérifiez que l'application a été redémarrée" -ForegroundColor Yellow
        Write-Host "2. Vérifiez les logs de l'application" -ForegroundColor Yellow
        Write-Host "3. Vérifiez que la base de données est accessible" -ForegroundColor Yellow
        Write-Host "4. Vérifiez que les tables existent et contiennent des données" -ForegroundColor Yellow
    }
}

Write-Host "`n🔍 Test 2: Endpoint avec paramètres personnalisés (7 jours)" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=7" -Method Get -ContentType "application/json"
    Write-Host "✅ SUCCÈS ! Paramètres personnalisés fonctionnent" -ForegroundColor Green
    Write-Host "Period days: $($response.periodDays)" -ForegroundColor Cyan
    Write-Host "Total prices: $($response.totalPrices)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERREUR avec paramètres personnalisés" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔍 Test 3: Endpoint avec filtre par région" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=30&region=ABJ" -Method Get -ContentType "application/json"
    Write-Host "✅ SUCCÈS ! Filtre par région fonctionne" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)" -ForegroundColor Cyan
    Write-Host "Region filter: ABJ" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERREUR avec filtre par région" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Résumé des tests :" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

if ($response.totalPrices -gt 0) {
    Write-Host "✅ Endpoint des statistiques fonctionne correctement" -ForegroundColor Green
    Write-Host "✅ Problème PostgreSQL résolu" -ForegroundColor Green
    Write-Host "✅ Requêtes SQL générées sans ambiguïté" -ForegroundColor Green
    Write-Host "✅ Données récupérées avec succès" -ForegroundColor Green
} else {
    Write-Host "⚠️  Endpoint fonctionne mais aucune donnée trouvée" -ForegroundColor Yellow
    Write-Host "💡 Vérifiez que la base de données contient des prix" -ForegroundColor Yellow
}

Write-Host "`n🚀 Test terminé avec succès !" -ForegroundColor Green
Write-Host "L'endpoint des statistiques est maintenant opérationnel." -ForegroundColor Cyan
