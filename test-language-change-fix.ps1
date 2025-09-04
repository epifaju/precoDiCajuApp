# Test script for language change fix
Write-Host "Opening Language Change Fix Test Page..." -ForegroundColor Green

$testPagePath = ".\test-language-change-fix.html"
$fullPath = Resolve-Path $testPagePath

if (Test-Path $fullPath) {
    Write-Host "Opening test page: $fullPath" -ForegroundColor Yellow
    Start-Process $fullPath
    Write-Host "Test page opened in your default browser." -ForegroundColor Green
    Write-Host "`nInstructions:" -ForegroundColor Cyan
    Write-Host "1. Click 'Test Language Change' button" -ForegroundColor White
    Write-Host "2. Check the results in the log area" -ForegroundColor White
    Write-Host "3. Verify no 'cyclic object value' errors appear" -ForegroundColor White
} else {
    Write-Host "Test page not found: $fullPath" -ForegroundColor Red
}
