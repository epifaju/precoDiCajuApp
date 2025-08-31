# Test Working Profile Edit Functionality
Write-Host "Testing Working Profile Edit Functionality..." -ForegroundColor Green

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

Write-Host "`n3. Testing Working Profile Edit Functionality:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile in your browser" -ForegroundColor White
Write-Host "2. Login with test credentials:" -ForegroundColor White
Write-Host "   - Email: produtor@test.gw" -ForegroundColor White
Write-Host "   - Password: produtor123" -ForegroundColor White
Write-Host "3. Click 'Editar perfil' button" -ForegroundColor White
Write-Host "4. Verify the edit form opens with your current data" -ForegroundColor White
Write-Host "5. Modify your profile information:" -ForegroundColor White
Write-Host "   - Change your full name" -ForegroundColor White
Write-Host "   - Add or modify phone number" -ForegroundColor White
Write-Host "   - Select/deselect preferred regions" -ForegroundColor White
Write-Host "6. Click 'Salvar' button" -ForegroundColor White
Write-Host "7. Verify the profile is updated successfully" -ForegroundColor White
Write-Host "8. Check that changes are reflected on the profile page" -ForegroundColor White

Write-Host "`n4. Expected Behavior:" -ForegroundColor Yellow
Write-Host "✓ Form should open with current user data" -ForegroundColor Green
Write-Host "✓ 'Salvar' button should be enabled when name is valid" -ForegroundColor Green
Write-Host "✓ Clicking 'Salvar' should send PUT request to /api/v1/users/me" -ForegroundColor Green
Write-Host "✓ Success message should appear" -ForegroundColor Green
Write-Host "✓ Modal should close after 1.5 seconds" -ForegroundColor Green
Write-Host "✓ Profile page should show updated information" -ForegroundColor Green

Write-Host "`n5. Debug Information:" -ForegroundColor Yellow
Write-Host "✓ Check browser console for detailed logs" -ForegroundColor Green
Write-Host "✓ Check Network tab for API calls" -ForegroundColor Green
Write-Host "✓ Verify PUT request payload and response" -ForegroundColor Green
Write-Host "✓ Check for any JavaScript errors" -ForegroundColor Green

Write-Host "`n6. If Everything Works:" -ForegroundColor Yellow
Write-Host "✓ The profile edit functionality is now working!" -ForegroundColor Green
Write-Host "✓ Users can update their profile information" -ForegroundColor Green
Write-Host "✓ The 'Salvar' button functions correctly" -ForegroundColor Green

Write-Host "`nProfile edit functionality test completed!" -ForegroundColor Green
Write-Host "Please test in the browser and verify the complete functionality." -ForegroundColor Yellow
