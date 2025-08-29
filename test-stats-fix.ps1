Write-Host "Testing statistics endpoint..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/prices/statistics" -Method GET -UseBasicParsing
    Write-Host "Response Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Content: $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "Request failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "Test completed!" -ForegroundColor Green
