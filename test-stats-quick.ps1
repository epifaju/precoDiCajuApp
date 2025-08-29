# Test rapide de l'endpoint des statistiques après correction
Write-Host "Test rapide de l'endpoint des statistiques" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green

$baseUrl = "http://localhost:8080"
$endpoint = "/api/v1/prices/stats"

Write-Host "`nTest de l'endpoint avec paramètres par défaut..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method Get -ContentType "application/json"
    Write-Host "✅ SUCCÈS ! L'endpoint fonctionne maintenant" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)" -ForegroundColor Cyan
    Write-Host "Period days: $($response.periodDays)" -ForegroundColor Cyan
    Write-Host "Min price: $($response.minPrice)" -ForegroundColor Cyan
    Write-Host "Max price: $($response.maxPrice)" -ForegroundColor Cyan
    Write-Host "Average price: $($response.averagePrice)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ ERREUR : L'endpoint ne fonctionne toujours pas" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "`n💡 Suggestion : Vérifiez que l'application a été redémarrée" -ForegroundColor Yellow
        Write-Host "💡 Suggestion : Vérifiez les logs de l'application" -ForegroundColor Yellow
    }
}

Write-Host "`nTest terminé !" -ForegroundColor Green
