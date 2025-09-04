# Simple test for configuration endpoint
Write-Host "Testing Configuration Endpoint..." -ForegroundColor Green

# Test backend endpoint
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/users/me/config" -Method GET -Headers @{"Authorization"="Bearer test-token"} -ErrorAction Stop
    Write-Host "Backend configuration endpoint is working (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Backend configuration endpoint error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test frontend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -ErrorAction Stop
    Write-Host "Frontend is accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Frontend error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed. The main fix was adding missing translation keys to pt.json" -ForegroundColor Cyan
Write-Host "The error 'errors.pageNotFound' and 'errors.pageNotFoundDesc' should now display properly" -ForegroundColor Cyan
