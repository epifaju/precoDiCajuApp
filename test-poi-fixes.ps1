# Test rapide des corrections POI

Write-Host "🧪 Test des Corrections POI" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan
Write-Host ""

$API_BASE_URL = "http://localhost:8080"

function Test-Endpoint {
    param([string]$Url, [string]$Description)
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        return $true
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "❌ FAILED - Status: $statusCode" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
        return $false
    }
    Write-Host ""
}

Write-Host "1. Tests Backend Health:" -ForegroundColor Cyan
$health1 = Test-Endpoint "$API_BASE_URL/actuator/health" "Spring Boot Actuator"

Write-Host ""
Write-Host "2. Tests POI Endpoints:" -ForegroundColor Cyan
$poi1 = Test-Endpoint "$API_BASE_URL/api/poi/health" "POI Health Check"
$poi2 = Test-Endpoint "$API_BASE_URL/api/poi/stats" "POI Statistics"
$poi3 = Test-Endpoint "$API_BASE_URL/api/poi" "POI List"

Write-Host ""
Write-Host "3. Tests Other Endpoints:" -ForegroundColor Cyan
$other1 = Test-Endpoint "$API_BASE_URL/api/v1/regions" "Regions API"
$other2 = Test-Endpoint "$API_BASE_URL/api/v1/qualities" "Qualities API"

Write-Host ""
Write-Host "📊 Résultats:" -ForegroundColor Cyan
Write-Host "=============" -ForegroundColor Cyan

$total = 6
$success = @($health1, $poi1, $poi2, $poi3, $other1, $other2) | Where-Object { $_ -eq $true } | Measure-Object | Select-Object -ExpandProperty Count

Write-Host "✅ Tests réussis: $success/$total" -ForegroundColor $(if ($success -eq $total) { "Green" } else { "Yellow" })

if ($success -eq $total) {
    Write-Host ""
    Write-Host "🎉 Toutes les corrections fonctionnent!" -ForegroundColor Green
    Write-Host "Vous pouvez maintenant tester l'application:" -ForegroundColor Gray
    Write-Host "- Frontend: http://localhost:3000" -ForegroundColor Gray
    Write-Host "- Page POI: http://localhost:3000/poi" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "⚠️  Certains tests ont échoué." -ForegroundColor Yellow
    Write-Host "Exécutez le script de réparation:" -ForegroundColor Gray
    Write-Host ".\fix-poi-auth-issues.ps1" -ForegroundColor Gray
}

