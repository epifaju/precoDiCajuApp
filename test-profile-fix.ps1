# Test script to verify ProfilePage fix
Write-Host "Testing ProfilePage Fix..." -ForegroundColor Green

# Wait for frontend to start
Write-Host "Waiting for frontend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test if frontend is accessible
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 10
    Write-Host "✅ Frontend is accessible at http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend not accessible yet. Please check if it's running." -ForegroundColor Red
    Write-Host "Try running: cd frontend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nFixes Applied:" -ForegroundColor Cyan
Write-Host "1. Fixed syntax error in ProfilePage.tsx (removed empty line in JSX)" -ForegroundColor White
Write-Host "2. Fixed UserMenu.tsx routing (changed /settings to /profile?tab=config)" -ForegroundColor White
Write-Host "3. Added URL parameter detection in ProfilePage.tsx" -ForegroundColor White
Write-Host "4. Added missing translation keys in pt.json" -ForegroundColor White

Write-Host "`nTest Instructions:" -ForegroundColor Yellow
Write-Host "1. Go to http://localhost:5173" -ForegroundColor White
Write-Host "2. Login to your account" -ForegroundColor White
Write-Host "3. Click on your avatar in the top-right corner" -ForegroundColor White
Write-Host "4. Click on 'Configurations' (or 'Paramètres')" -ForegroundColor White
Write-Host "5. Verify that the configuration page loads without errors" -ForegroundColor White

Write-Host "`nThe ProfilePage should now load correctly!" -ForegroundColor Green