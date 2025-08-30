# Test script for date filtering API
Write-Host "Testing date filter API..." -ForegroundColor Green

# Test 1: Basic request without date filter
Write-Host "`nTest 1: Basic request without date filter" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Request with from date only
Write-Host "`nTest 2: Request with from date only" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5&from=2025-08-28" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# Test 3: Request with both from and to dates
Write-Host "`nTest 3: Request with both from and to dates" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5&from=2025-08-28&to=2025-08-30" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# Test 4: Request with invalid date format
Write-Host "`nTest 4: Request with invalid date format" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5&from=invalid-date" -Method GET -Headers @{"Accept"="application/json"}
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

Write-Host "`nTesting completed!" -ForegroundColor Green
