# Script de test pour les fonctionnalités GPS backend
# Teste les services de validation, géocodage et analyse GPS

Write-Host "=== Test des Fonctionnalités GPS Backend ===" -ForegroundColor Green

# Configuration
$BASE_URL = "http://localhost:8080/api"
$GPS_ENDPOINT = "$BASE_URL/gps"

# Fonction pour tester un endpoint
function Test-GpsEndpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [hashtable]$Body = $null,
        [hashtable]$QueryParams = $null
    )
    
    Write-Host "`n--- Test: $Name ---" -ForegroundColor Yellow
    
    try {
        $fullUrl = $Url
        if ($QueryParams) {
            $queryString = ($QueryParams.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&"
            $fullUrl = "$Url?$queryString"
        }
        
        Write-Host "URL: $fullUrl" -ForegroundColor Cyan
        Write-Host "Method: $Method" -ForegroundColor Cyan
        
        $headers = @{
            "Content-Type" = "application/json"
            "Accept" = "application/json"
        }
        
        if ($Method -eq "GET") {
            $response = Invoke-RestMethod -Uri $fullUrl -Method $Method -Headers $headers
        } else {
            $jsonBody = if ($Body) { $Body | ConvertTo-Json -Depth 10 } else { $null }
            $response = Invoke-RestMethod -Uri $fullUrl -Method $Method -Headers $headers -Body $jsonBody
        }
        
        Write-Host "✅ Succès" -ForegroundColor Green
        Write-Host "Réponse: $($response | ConvertTo-Json -Depth 5)" -ForegroundColor White
        
        return $response
    }
    catch {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $errorResponse = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorResponse)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Détails: $errorBody" -ForegroundColor Red
        }
        return $null
    }
}

# Test 1: Validation GPS - Coordonnées valides (Bissau)
Write-Host "`n=== Test 1: Validation GPS - Coordonnées valides ===" -ForegroundColor Magenta
$validCoords = Test-GpsEndpoint -Name "Validation GPS Bissau" -Method "POST" -Url "$GPS_ENDPOINT/validate" -QueryParams @{
    latitude = "11.8636"
    longitude = "-15.5977"
    accuracy = "15.5"
    regionCode = "BIS"
}

# Test 2: Validation GPS - Coordonnées invalides (hors Guinée-Bissau)
Write-Host "`n=== Test 2: Validation GPS - Coordonnées invalides ===" -ForegroundColor Magenta
$invalidCoords = Test-GpsEndpoint -Name "Validation GPS Paris" -Method "POST" -Url "$GPS_ENDPOINT/validate" -QueryParams @{
    latitude = "48.8566"
    longitude = "2.3522"
    accuracy = "10.0"
    regionCode = "BIS"
}

# Test 3: Géocodage inverse - Bissau
Write-Host "`n=== Test 3: Géocodage inverse - Bissau ===" -ForegroundColor Magenta
$geocoding = Test-GpsEndpoint -Name "Géocodage Bissau" -Method "GET" -Url "$GPS_ENDPOINT/geocode" -QueryParams @{
    latitude = "11.8636"
    longitude = "-15.5977"
}

# Test 4: Géocodage inverse - Coordonnées invalides
Write-Host "`n=== Test 4: Géocodage inverse - Coordonnées invalides ===" -ForegroundColor Magenta
$geocodingInvalid = Test-GpsEndpoint -Name "Géocodage coordonnées invalides" -Method "GET" -Url "$GPS_ENDPOINT/geocode" -QueryParams @{
    latitude = "999.9999"
    longitude = "999.9999"
}

# Test 5: Recherche de prix proches
Write-Host "`n=== Test 5: Recherche de prix proches ===" -ForegroundColor Magenta
$nearbyPrices = Test-GpsEndpoint -Name "Prix proches Bissau" -Method "GET" -Url "$GPS_ENDPOINT/nearby-prices" -QueryParams @{
    latitude = "11.8636"
    longitude = "-15.5977"
    radiusKm = "10"
    maxResults = "10"
}

# Test 6: Analyse GPS d'une région
Write-Host "`n=== Test 6: Analyse GPS région ===" -ForegroundColor Magenta
$regionAnalysis = Test-GpsEndpoint -Name "Analyse GPS région BIS" -Method "GET" -Url "$GPS_ENDPOINT/analyze-region" -QueryParams @{
    regionCode = "BIS"
    fromDate = "2024-01-01"
    toDate = "2024-12-31"
}

# Test 7: Statistiques de densité GPS
Write-Host "`n=== Test 7: Statistiques de densité GPS ===" -ForegroundColor Magenta
$densityStats = Test-GpsEndpoint -Name "Statistiques densité GPS" -Method "GET" -Url "$GPS_ENDPOINT/density-stats" -QueryParams @{
    regionCode = "BIS"
    fromDate = "2024-01-01"
    toDate = "2024-12-31"
}

# Test 8: Calcul de distance
Write-Host "`n=== Test 8: Calcul de distance ===" -ForegroundColor Magenta
$distance = Test-GpsEndpoint -Name "Calcul distance" -Method "GET" -Url "$GPS_ENDPOINT/distance" -QueryParams @{
    lat1 = "11.8636"
    lng1 = "-15.5977"
    lat2 = "11.9000"
    lng2 = "-15.6000"
}

# Test 9: Statistiques du cache de géocodage
Write-Host "`n=== Test 9: Statistiques cache géocodage ===" -ForegroundColor Magenta
$cacheStats = Test-GpsEndpoint -Name "Statistiques cache" -Method "GET" -Url "$GPS_ENDPOINT/geocoding-cache/stats"

# Test 10: Validation GPS d'un prix
Write-Host "`n=== Test 10: Validation GPS prix ===" -ForegroundColor Magenta
$priceValidation = Test-GpsEndpoint -Name "Validation GPS prix" -Method "POST" -Url "$GPS_ENDPOINT/validate-price" -Body @{
    regionCode = "BIS"
    qualityGrade = "A"
    priceFcfa = 1500.00
    recordedDate = "2024-01-15"
    sourceName = "Marché Central"
    sourceType = "market"
    gpsLat = 11.8636
    gpsLng = -15.5977
    notes = "Test de validation GPS"
}

# Test 11: Nettoyage du cache de géocodage
Write-Host "`n=== Test 11: Nettoyage cache géocodage ===" -ForegroundColor Magenta
$clearCache = Test-GpsEndpoint -Name "Nettoyage cache" -Method "POST" -Url "$GPS_ENDPOINT/geocoding-cache/clear"

# Résumé des tests
Write-Host "`n=== Résumé des Tests ===" -ForegroundColor Green

$tests = @(
    @{ Name = "Validation GPS Bissau"; Result = $validCoords },
    @{ Name = "Validation GPS Paris"; Result = $invalidCoords },
    @{ Name = "Géocodage Bissau"; Result = $geocoding },
    @{ Name = "Géocodage invalide"; Result = $geocodingInvalid },
    @{ Name = "Prix proches"; Result = $nearbyPrices },
    @{ Name = "Analyse région"; Result = $regionAnalysis },
    @{ Name = "Statistiques densité"; Result = $densityStats },
    @{ Name = "Calcul distance"; Result = $distance },
    @{ Name = "Statistiques cache"; Result = $cacheStats },
    @{ Name = "Validation prix"; Result = $priceValidation },
    @{ Name = "Nettoyage cache"; Result = $clearCache }
)

$successCount = 0
$totalCount = $tests.Count

foreach ($test in $tests) {
    $status = if ($test.Result) { "✅ Succès" } else { "❌ Échec" }
    Write-Host "$($test.Name): $status" -ForegroundColor $(if ($test.Result) { "Green" } else { "Red" })
    if ($test.Result) { $successCount++ }
}

Write-Host "`nRésultat global: $successCount/$totalCount tests réussis" -ForegroundColor $(if ($successCount -eq $totalCount) { "Green" } else { "Yellow" })

# Test de performance
Write-Host "`n=== Test de Performance ===" -ForegroundColor Magenta

$startTime = Get-Date
$performanceTests = 10

for ($i = 1; $i -le $performanceTests; $i++) {
    $perfTest = Test-GpsEndpoint -Name "Test performance $i" -Method "POST" -Url "$GPS_ENDPOINT/validate" -QueryParams @{
        latitude = "11.8636"
        longitude = "-15.5977"
        accuracy = "15.5"
    }
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalMilliseconds
$avgDuration = $duration / $performanceTests

Write-Host "Tests de performance: $performanceTests requêtes" -ForegroundColor Cyan
Write-Host "Durée totale: $([math]::Round($duration, 2)) ms" -ForegroundColor Cyan
Write-Host "Durée moyenne: $([math]::Round($avgDuration, 2)) ms par requête" -ForegroundColor Cyan

# Test de charge
Write-Host "`n=== Test de Charge ===" -ForegroundColor Magenta

$loadTests = 50
$startTime = Get-Date

$jobs = @()
for ($i = 1; $i -le $loadTests; $i++) {
    $job = Start-Job -ScriptBlock {
        param($url, $i)
        try {
            $response = Invoke-RestMethod -Uri $url -Method "POST" -Headers @{ "Content-Type" = "application/json" }
            return @{ Success = $true; Index = $i }
        }
        catch {
            return @{ Success = $false; Index = $i; Error = $_.Exception.Message }
        }
    } -ArgumentList "$GPS_ENDPOINT/validate?latitude=11.8636&longitude=-15.5977&accuracy=15.5", $i
    
    $jobs += $job
}

# Attendre la fin de tous les jobs
$results = $jobs | Wait-Job | Receive-Job
$jobs | Remove-Job

$endTime = Get-Date
$loadDuration = ($endTime - $startTime).TotalMilliseconds
$successfulLoadTests = ($results | Where-Object { $_.Success }).Count

Write-Host "Tests de charge: $loadTests requêtes simultanées" -ForegroundColor Cyan
Write-Host "Durée totale: $([math]::Round($loadDuration, 2)) ms" -ForegroundColor Cyan
Write-Host "Requêtes réussies: $successfulLoadTests/$loadTests" -ForegroundColor Cyan
Write-Host "Débit: $([math]::Round($loadTests / ($loadDuration / 1000), 2)) requêtes/seconde" -ForegroundColor Cyan

Write-Host "`n=== Tests GPS Backend Terminés ===" -ForegroundColor Green

