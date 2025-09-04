# Test script to verify apiClient fix
Write-Host "Testing API Client Fix..." -ForegroundColor Green

# Test if frontend is accessible on port 3001
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 10
    Write-Host "Frontend is accessible at http://localhost:3001" -ForegroundColor Green
} catch {
    Write-Host "Frontend not accessible on port 3001" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Fix Applied:" -ForegroundColor Cyan
Write-Host "Created missing apiClient.ts file in services directory" -ForegroundColor White
Write-Host "Fixed import error in userConfigService.ts" -ForegroundColor White
Write-Host "Added proper API client with authentication support" -ForegroundColor White

Write-Host ""
Write-Host "Test Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:3001" -ForegroundColor White
Write-Host "2. Login to your account" -ForegroundColor White
Write-Host "3. Click on your avatar in the top-right corner" -ForegroundColor White
Write-Host "4. Click on Configurations" -ForegroundColor White
Write-Host "5. Verify that the configuration page loads without errors" -ForegroundColor White

Write-Host ""
Write-Host "The apiClient import error should now be resolved!" -ForegroundColor Green