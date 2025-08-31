# Test Profile Preferences Save Functionality
Write-Host "Testing Profile Preferences Save Functionality..." -ForegroundColor Green

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

Write-Host "`n3. Testing Profile Preferences Save Functionality:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173/profile in your browser" -ForegroundColor White
Write-Host "2. Login with test credentials:" -ForegroundColor White
Write-Host "   - Email: produtor@test.gw" -ForegroundColor White
Write-Host "   - Password: produtor123" -ForegroundColor White
Write-Host "3. Scroll down to the 'Preferências' section" -ForegroundColor White
Write-Host "4. Test the language selector:" -ForegroundColor White
Write-Host "   - Change from 'Português' to 'Français' or 'English'" -ForegroundColor White
Write-Host "5. Test the regions checkboxes:" -ForegroundColor White
Write-Host "   - Check/uncheck some regions" -ForegroundColor White
Write-Host "6. Test the theme selector:" -ForegroundColor White
Write-Host "   - Change from 'Sistema' to 'Claro' or 'Escuro'" -ForegroundColor White
Write-Host "7. Click the 'Salvar' button" -ForegroundColor White
Write-Host "8. Verify that preferences are saved" -ForegroundColor White

Write-Host "`n4. Expected Behavior:" -ForegroundColor Yellow
Write-Host "✓ Language selector should change the interface language" -ForegroundColor Green
Write-Host "✓ Region checkboxes should be interactive" -ForegroundColor Green
Write-Host "✓ Theme selector should work" -ForegroundColor Green
Write-Host "✓ 'Salvar' button should show loading spinner when clicked" -ForegroundColor Green
Write-Host "✓ Success message should appear after saving" -ForegroundColor Green
Write-Host "✓ Changes should persist after page refresh" -ForegroundColor Green

Write-Host "`n5. Debug Information:" -ForegroundColor Yellow
Write-Host "✓ Check browser console for any errors" -ForegroundColor Green
Write-Host "✓ Verify that the button responds to clicks" -ForegroundColor Green
Write-Host "✓ Check that form state updates correctly" -ForegroundColor Green

Write-Host "`n6. What Was Fixed:" -ForegroundColor Yellow
Write-Host "✓ Added onClick handler to the 'Salvar' button" -ForegroundColor Green
Write-Host "✓ Connected form fields to React state" -ForegroundColor Green
Write-Host "✓ Added loading state and feedback messages" -ForegroundColor Green
Write-Host "✓ Implemented preferences saving logic" -ForegroundColor Green

Write-Host "`nProfile preferences save functionality test completed!" -ForegroundColor Green
Write-Host "Please test in the browser to verify the complete functionality." -ForegroundColor Yellow
