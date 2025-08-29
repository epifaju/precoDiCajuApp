# Test script to verify the submit price form error is fixed
Write-Host "Testing Submit Price Form Fix..." -ForegroundColor Green

# Check if frontend is running
$frontendPort = 3002
$frontendStatus = netstat -an | findstr ":$frontendPort.*LISTENING"

if ($frontendStatus) {
    Write-Host "✓ Frontend is running on port $frontendPort" -ForegroundColor Green
    
    # Test the translation keys
    Write-Host "`nTesting translation keys..." -ForegroundColor Yellow
    
    # Check French translations
    $frFile = "frontend\src\i18n\locales\fr.json"
    if (Test-Path $frFile) {
        $frContent = Get-Content $frFile -Raw | ConvertFrom-Json
        if ($frContent.forms.submitPrice -and $frContent.forms.submitPriceTitle -and $frContent.forms.submitPriceDescription) {
            Write-Host "✓ French translations are properly configured" -ForegroundColor Green
        } else {
            Write-Host "✗ French translations are missing required keys" -ForegroundColor Red
        }
    }
    
    # Check English translations
    $enFile = "frontend\src\i18n\locales\en.json"
    if (Test-Path $enFile) {
        $enContent = Get-Content $enFile -Raw | ConvertFrom-Json
        if ($enContent.forms.submitPrice -and $enContent.forms.submitPriceTitle -and $enContent.forms.submitPriceDescription) {
            Write-Host "✓ English translations are properly configured" -ForegroundColor Green
        } else {
            Write-Host "✗ English translations are missing required keys" -ForegroundColor Red
        }
    }
    
    # Check Portuguese translations
    $ptFile = "frontend\src\i18n\locales\pt.json"
    if (Test-Path $ptFile) {
        $ptContent = Get-Content $ptFile -Raw | ConvertFrom-Json
        if ($ptContent.forms.submitPrice -and $ptContent.forms.submitPriceTitle -and $ptContent.forms.submitPriceDescription) {
            Write-Host "✓ Portuguese translations are properly configured" -ForegroundColor Green
        } else {
            Write-Host "✗ Portuguese translations are missing required keys" -ForegroundColor Red
        }
    }
    
    # Check the component file
    $componentFile = "frontend\src\components\forms\PriceSubmissionForm.tsx"
    if (Test-Path $componentFile) {
        $componentContent = Get-Content $componentFile -Raw
        if ($componentContent -match "forms\.submitPriceTitle" -and $componentContent -match "forms\.submitPriceDescription") {
            Write-Host "✓ Component is using correct translation keys" -ForegroundColor Green
        } else {
            Write-Host "✗ Component is not using correct translation keys" -ForegroundColor Red
        }
    }
    
    Write-Host "`nTest completed!" -ForegroundColor Green
    Write-Host "You can now test the submit price form at: http://localhost:$frontendPort/submit-price" -ForegroundColor Cyan
    Write-Host "The error 'Objects are not valid as a React child' should be resolved." -ForegroundColor Cyan
    
} else {
    Write-Host "✗ Frontend is not running on port $frontendPort" -ForegroundColor Red
    Write-Host "Please start the frontend with: cd frontend; npm run dev" -ForegroundColor Yellow
}
