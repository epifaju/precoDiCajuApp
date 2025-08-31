# Test Profile Edit Functionality
Write-Host "Testing Profile Edit Functionality..." -ForegroundColor Green

# Check if backend is running
Write-Host "`n1. Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/regions" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is not running. Please start the backend first." -ForegroundColor Red
    Write-Host "Run: ./start-backend-clean.ps1" -ForegroundColor Yellow
    exit 1
}

# Check if frontend is running
Write-Host "`n2. Checking frontend status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    Write-Host "✓ Frontend is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend is not running. Please start the frontend first." -ForegroundColor Red
    Write-Host "Run: ./start-frontend.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n3. Testing profile endpoints..." -ForegroundColor Yellow

# Test profile update endpoint (requires authentication)
Write-Host "`nTesting profile update endpoint..." -ForegroundColor Cyan
Write-Host "Note: This endpoint requires authentication" -ForegroundColor Gray

# Test with invalid data (should fail)
Write-Host "`nTesting with invalid data..." -ForegroundColor Cyan
try {
    $invalidData = @{
        fullName = "A"  # Too short
        phone = "invalid"  # Invalid phone format
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me" -Method PUT -Body $invalidData -ContentType "application/json" -TimeoutSec 10
    Write-Host "✗ Should have failed with invalid data" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 400) {
        Write-Host "Correctly rejected invalid data (400 Bad Request)" -ForegroundColor Green
    } else {
        Write-Host "Unexpected error: $statusCode" -ForegroundColor Red
    }
}

Write-Host "`n4. Manual Testing Instructions:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile in your browser" -ForegroundColor White
Write-Host "2. Login with test credentials:" -ForegroundColor White
Write-Host "   - Email: comerciante@test.gw" -ForegroundColor White
Write-Host "   - Password: comerciante123" -ForegroundColor White
Write-Host "3. Click 'Editar perfil' button" -ForegroundColor White
Write-Host "4. Verify the edit form opens" -ForegroundColor White
Write-Host "5. Try editing your profile information" -ForegroundColor White
Write-Host "6. Save changes and verify they are updated" -ForegroundColor White

Write-Host "`n5. Expected Behavior:" -ForegroundColor Yellow
Write-Host "✓ Clicking 'Editar perfil' should open a modal form" -ForegroundColor Green
Write-Host "✓ Form should contain: Full Name, Phone, Preferred Regions" -ForegroundColor Green
Write-Host "✓ Form should validate input (name length, phone format)" -ForegroundColor Green
Write-Host "✓ Saving should update the profile and close the modal" -ForegroundColor Green
Write-Host "✓ Changes should be reflected immediately on the profile page" -ForegroundColor Green

Write-Host "`nProfile edit functionality test completed!" -ForegroundColor Green
Write-Host "Please perform manual testing in the browser to verify the complete functionality." -ForegroundColor Yellow
