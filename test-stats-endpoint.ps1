# Test script for the price statistics endpoint
# This script tests various scenarios to ensure the endpoint works correctly

Write-Host "Testing Price Statistics Endpoint" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

$baseUrl = "http://localhost:8080"
$endpoint = "/api/v1/prices/stats"

# Test 1: Default parameters (30 days)
Write-Host "`nTest 1: Default parameters (30 days)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method Get -ContentType "application/json"
    Write-Host "✅ Success: Default parameters" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)"
    Write-Host "Period days: $($response.periodDays)"
} catch {
    Write-Host "❌ Error: Default parameters" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

# Test 2: Custom days parameter
Write-Host "`nTest 2: Custom days parameter (7 days)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=7" -Method Get -ContentType "application/json"
    Write-Host "✅ Success: Custom days parameter" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)"
    Write-Host "Period days: $($response.periodDays)"
} catch {
    Write-Host "❌ Error: Custom days parameter" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

# Test 3: Invalid days parameter (negative)
Write-Host "`nTest 3: Invalid days parameter (negative)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=-5" -Method Get -ContentType "application/json"
    Write-Host "✅ Success: Invalid days parameter handled gracefully" -ForegroundColor Green
    Write-Host "Period days: $($response.periodDays)"
} catch {
    Write-Host "❌ Error: Invalid days parameter" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

# Test 4: Very large days parameter
Write-Host "`nTest 4: Very large days parameter (1000 days)" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=1000" -Method Get -ContentType "application/json"
    Write-Host "✅ Success: Large days parameter handled gracefully" -ForegroundColor Green
    Write-Host "Period days: $($response.periodDays)"
} catch {
    Write-Host "❌ Error: Large days parameter" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

# Test 5: With region filter
Write-Host "`nTest 5: With region filter" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=30&region=ABJ" -Method Get -ContentType "application/json"
    Write-Host "✅ Success: With region filter" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)"
    Write-Host "Region filter: ABJ"
} catch {
    Write-Host "❌ Error: With region filter" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

# Test 6: With quality filter
Write-Host "`nTest 6: With quality filter" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=30&quality=PREMIUM" -Method Get -ContentType "application/json"
    Write-Host "✅ Success: With quality filter" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)"
    Write-Host "Quality filter: PREMIUM"
} catch {
    Write-Host "❌ Error: With quality filter" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

# Test 7: Combined filters
Write-Host "`nTest 7: Combined filters" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl$endpoint?days=30&region=ABJ&quality=PREMIUM" -Method Get -ContentType "application/json"
    Write-Host "✅ Success: Combined filters" -ForegroundColor Green
    Write-Host "Total prices: $($response.totalPrices)"
    Write-Host "Region filter: ABJ"
    Write-Host "Quality filter: PREMIUM"
} catch {
    Write-Host "❌ Error: Combined filters" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Message: $($_.Exception.Message)"
}

Write-Host "`nTesting completed!" -ForegroundColor Green
Write-Host "Check the application logs for detailed information about any errors." -ForegroundColor Cyan
