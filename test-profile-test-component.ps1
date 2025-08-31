# Test Profile Test Component
Write-Host "Testing Profile Test Component..." -ForegroundColor Green

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

Write-Host "`n3. Testing Profile Test Component:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile in your browser" -ForegroundColor White
Write-Host "2. Login with test credentials:" -ForegroundColor White
Write-Host "   - Email: produtor@test.gw" -ForegroundColor White
Write-Host "   - Password: produtor123" -ForegroundColor White
Write-Host "3. Click 'Editar perfil' button" -ForegroundColor White
Write-Host "4. Verify the test form opens" -ForegroundColor White
Write-Host "5. Click 'Test Button' - should show message" -ForegroundColor White
Write-Host "6. Click 'Salvar' button - should show processing message" -ForegroundColor White
Write-Host "7. Check browser console for click events" -ForegroundColor White

Write-Host "`n4. Expected Behavior:" -ForegroundColor Yellow
Write-Host "✓ Test Button should work and show message" -ForegroundColor Green
Write-Host "✓ Salvar button should work and show processing" -ForegroundColor Green
Write-Host "✓ Console should show click events" -ForegroundColor Green
Write-Host "✓ No JavaScript errors should occur" -ForegroundColor Green

Write-Host "`n5. If Test Component Works:" -ForegroundColor Yellow
Write-Host "✓ The issue is in the original form logic" -ForegroundColor Green
Write-Host "✓ We can gradually add back the real functionality" -ForegroundColor Green

Write-Host "`n6. If Test Component Doesn't Work:" -ForegroundColor Yellow
Write-Host "✓ There's a deeper issue with the modal or event handling" -ForegroundColor Green
Write-Host "✓ We need to check the modal implementation" -ForegroundColor Green

Write-Host "`nProfile test component test completed!" -ForegroundColor Green
Write-Host "Please test in the browser and report results." -ForegroundColor Yellow
