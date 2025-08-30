# English Translations Test Script
Write-Host "=== English Translations Test ===" -ForegroundColor Green
Write-Host ""

# Check if frontend is running
Write-Host "1. Checking frontend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✓ Frontend accessible at http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend not accessible. Starting..." -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm run dev"
    Start-Sleep 10
}

Write-Host ""
Write-Host "2. Test instructions:" -ForegroundColor Yellow
Write-Host "   - Open http://localhost:3000 in browser" -ForegroundColor White
Write-Host "   - Go to prices page" -ForegroundColor White
Write-Host "   - Change language from Portuguese to English" -ForegroundColor White
Write-Host "   - Verify no more 'Objects are not valid as a React child' error" -ForegroundColor White
Write-Host ""

Write-Host "3. Fixes applied:" -ForegroundColor Yellow
Write-Host "   ✓ Fixed 'prices.filters' key (string instead of object)" -ForegroundColor Green
Write-Host "   ✓ Added missing 'prices.clearFilters' key" -ForegroundColor Green
Write-Host "   ✓ Added all missing translation keys" -ForegroundColor Green
Write-Host "   ✓ Restructured filter keys in 'filterOptions'" -ForegroundColor Green
Write-Host ""

Write-Host "4. Files modified:" -ForegroundColor Yellow
Write-Host "   - frontend/src/i18n/locales/en.json" -ForegroundColor White
Write-Host ""

Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
