# Test Simple Profile Edit Functionality
Write-Host "Testing Simple Profile Edit Functionality..." -ForegroundColor Green

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

Write-Host "`n3. Manual Testing Instructions:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile in your browser" -ForegroundColor White
Write-Host "2. Login with test credentials:" -ForegroundColor White
Write-Host "   - Email: produtor@test.gw" -ForegroundColor White
Write-Host "   - Password: produtor123" -ForegroundColor White
Write-Host "3. Click 'Editar perfil' button" -ForegroundColor White
Write-Host "4. Verify the edit form opens" -ForegroundColor White
Write-Host "5. Try editing your profile information" -ForegroundColor White
Write-Host "6. Click 'Salvar' button and verify it works" -ForegroundColor White
Write-Host "7. Check browser console for any errors" -ForegroundColor White

Write-Host "`n4. Expected Behavior:" -ForegroundColor Yellow
Write-Host "✓ Clicking 'Editar perfil' should open a modal form" -ForegroundColor Green
Write-Host "✓ Form should contain: Full Name, Phone, Preferred Regions" -ForegroundColor Green
Write-Host "✓ Form should validate input (name length, phone format)" -ForegroundColor Green
Write-Host "✓ 'Salvar' button should be enabled when form is valid" -ForegroundColor Green
Write-Host "✓ Clicking 'Salvar' should update the profile and close the modal" -ForegroundColor Green
Write-Host "✓ Changes should be reflected immediately on the profile page" -ForegroundColor Green

Write-Host "`n5. Debug Information:" -ForegroundColor Yellow
Write-Host "✓ Check browser console for debug info" -ForegroundColor Green
Write-Host "✓ Check Network tab for API calls to /api/v1/users/me" -ForegroundColor Green
Write-Host "✓ Verify PUT request is sent with correct data" -ForegroundColor Green

Write-Host "`nProfile edit functionality test completed!" -ForegroundColor Green
Write-Host "Please perform manual testing in the browser to verify the complete functionality." -ForegroundColor Yellow
