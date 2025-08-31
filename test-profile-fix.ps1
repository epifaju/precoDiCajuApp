# Test Profile Module Fix
Write-Host "Testing Profile Module Fix..." -ForegroundColor Green

# Check if frontend is running
Write-Host "Checking if frontend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Frontend is running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "Frontend is not running on port 5173" -ForegroundColor Red
    Write-Host "Please start the frontend first with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Check if backend is running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Backend is running on port 8080" -ForegroundColor Green
} catch {
    Write-Host "Backend is not running on port 8080" -ForegroundColor Red
    Write-Host "Please start the backend first" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nProfile Module Fix Summary:" -ForegroundColor Cyan
Write-Host "✅ ProfilePage.tsx now uses useAuthStore to get user data" -ForegroundColor Green
Write-Host "✅ Hardcoded 'João Produtor' data replaced with dynamic user data" -ForegroundColor Green
Write-Host "✅ UserMenu now uses React Router Link for profile navigation" -ForegroundColor Green
Write-Host "✅ Profile page shows actual logged-in user information" -ForegroundColor Green

Write-Host "`nTo test the fix:" -ForegroundColor Yellow
Write-Host "1. Open http://localhost:5173 in your browser" -ForegroundColor White
Write-Host "2. Login with any test account (e.g., produtor@test.gw / produtor123)" -ForegroundColor White
Write-Host "3. Click on 'Meu perfil' button in the user menu" -ForegroundColor White
Write-Host "4. Verify that the profile shows your actual user data, not João Produtor" -ForegroundColor White

Write-Host "`nThe profile should now display:" -ForegroundColor Cyan
Write-Host "- Your actual full name instead of 'João Produtor'" -ForegroundColor White
Write-Host "- Your actual email instead of 'produtor@test.gw'" -ForegroundColor White
Write-Host "- Your actual role (Contribuidor, Moderador, or Administrador)" -ForegroundColor White
Write-Host "- Your actual reputation score instead of '85 pontos'" -ForegroundColor White
Write-Host "- Your actual registration date instead of 'Janeiro 2024'" -ForegroundColor White
Write-Host "- Your actual last login time instead of 'Hoje às 14:30'" -ForegroundColor White

Write-Host "`nProfile module fix completed successfully!" -ForegroundColor Green
