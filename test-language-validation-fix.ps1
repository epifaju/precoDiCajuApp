# Test script for language validation fix
Write-Host "Testing Language Validation Fix" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Check if frontend is running
$frontendUrl = "http://localhost:3002"
$response = $null

try {
    Write-Host "Checking if frontend is running..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 5 -UseBasicParsing
    Write-Host "Frontend is running on $frontendUrl" -ForegroundColor Green
} catch {
    Write-Host "Frontend is not running. Please start it with: cd frontend && npm run dev" -ForegroundColor Red
    exit 1
}

# Test profile page access
Write-Host "`nTesting profile page access..." -ForegroundColor Yellow
try {
    $profileUrl = "$frontendUrl/profile"
    $profileResponse = Invoke-WebRequest -Uri $profileUrl -Method GET -TimeoutSec 10 -UseBasicParsing
    
    if ($profileResponse.StatusCode -eq 200) {
        Write-Host "Profile page is accessible" -ForegroundColor Green
    } else {
        Write-Host "Profile page returned status: $($profileResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Error accessing profile page: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
Write-Host "`nTo test the language validation fix:" -ForegroundColor Cyan
Write-Host "1. Open $frontendUrl in your browser" -ForegroundColor White
Write-Host "2. Navigate to Profile page" -ForegroundColor White
Write-Host "3. Go to Preferences section" -ForegroundColor White
Write-Host "4. Change the language to French (Français) or English" -ForegroundColor White
Write-Host "5. Click 'Salvar' button" -ForegroundColor White
Write-Host "6. Verify no validation error appears" -ForegroundColor White
Write-Host "7. Verify the language change is saved successfully" -ForegroundColor White
