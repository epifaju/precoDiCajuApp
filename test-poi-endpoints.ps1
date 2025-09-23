# Test script for POI endpoints
# This script tests the Interactive Map of Buyers feature

Write-Host "Testing POI (Points of Interest) Endpoints..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Base URL
$baseUrl = "http://localhost:8080"

# Test 1: Get all POIs
Write-Host "`n1. Testing GET /api/poi (All POIs)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/poi" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) POIs" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "   Sample POI: $($response[0].nom) ($($response[0].type))" -ForegroundColor Cyan
        Write-Host "   Location: $($response[0].latitude), $($response[0].longitude)" -ForegroundColor Cyan
        if ($response[0].telephone) {
            Write-Host "   Phone: $($response[0].telephone)" -ForegroundColor Cyan
        }
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Get POI statistics
Write-Host "`n2. Testing GET /api/poi/stats (Statistics)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/poi/stats" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! POI Statistics:" -ForegroundColor Green
    Write-Host "   Total: $($response.totalCount)" -ForegroundColor Cyan
    Write-Host "   Buyers: $($response.acheteurCount)" -ForegroundColor Cyan
    Write-Host "   Cooperatives: $($response.cooperativeCount)" -ForegroundColor Cyan
    Write-Host "   Warehouses: $($response.entrepotCount)" -ForegroundColor Cyan
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Get POIs with phone numbers
Write-Host "`n3. Testing GET /api/poi/with-phone (POIs with phone)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/poi/with-phone" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) POIs with phone numbers" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "   Sample with phone: $($response[0].nom) - $($response[0].telephone)" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Filter POIs by type (buyers)
Write-Host "`n4. Testing GET /api/poi?type=acheteur (Buyers only)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/poi?type=acheteur" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) buyers" -ForegroundColor Green
    
    foreach ($poi in $response) {
        Write-Host "   - $($poi.nom): $($poi.telephone)" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Search POIs by name
Write-Host "`n5. Testing GET /api/poi?search=Bissau (Search by name)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/poi?search=Bissau" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) POIs matching 'Bissau'" -ForegroundColor Green
    
    foreach ($poi in $response) {
        Write-Host "   - $($poi.nom) ($($poi.type))" -ForegroundColor Cyan
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Get POIs within Guinea-Bissau bounds
Write-Host "`n6. Testing GET /api/poi (Within Guinea-Bissau bounds)..." -ForegroundColor Yellow
$bounds = "minLat=10.7&maxLat=12.7&minLng=-16.8&maxLng=-13.6"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/poi?$bounds" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) POIs within Guinea-Bissau bounds" -ForegroundColor Green
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Get POIs near Bissau (capital)
Write-Host "`n7. Testing GET /api/poi (Near Bissau capital)..." -ForegroundColor Yellow
$nearBissau = "lat=11.8636&lng=-15.5977&radius=50000"
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/poi?$nearBissau" -Method GET -ContentType "application/json"
    Write-Host "✅ Success! Found $($response.Count) POIs within 50km of Bissau" -ForegroundColor Green
    
    if ($response.Count -gt 0) {
        Write-Host "   Nearest POIs to Bissau:" -ForegroundColor Cyan
        foreach ($poi in $response[0..2]) {
            Write-Host "   - $($poi.nom) at $($poi.latitude), $($poi.longitude)" -ForegroundColor Cyan
        }
    }
}
catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n===============================================" -ForegroundColor Green
Write-Host "POI Endpoint Testing Complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Start your backend server (Spring Boot)" -ForegroundColor White
Write-Host "2. Start your frontend server (React)" -ForegroundColor White
Write-Host "3. Navigate to http://localhost:3000/poi to see the Interactive Map" -ForegroundColor White
Write-Host "4. Test the map features: filtering, searching, offline mode" -ForegroundColor White
