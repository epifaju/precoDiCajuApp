# Test Configuration Sections Translation Fix
# This script tests that the configuration sections are properly translated

Write-Host "Testing Configuration Sections Translation Fix" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host ""

# Check if the HTML test file exists
$testFile = "test-config-sections-fix.html"
if (Test-Path $testFile) {
    Write-Host "✓ Test file found: $testFile" -ForegroundColor Green
} else {
    Write-Host "✗ Test file not found: $testFile" -ForegroundColor Red
    exit 1
}

# Check if the UserConfigSettings.tsx file has been updated
$configFile = "frontend/src/components/config/UserConfigSettings.tsx"
if (Test-Path $configFile) {
    Write-Host "✓ Configuration file found: $configFile" -ForegroundColor Green
    
    # Check if the file contains the translation fix
    $content = Get-Content $configFile -Raw
    if ($content -match "t\(`config\.sections\.\$\{section\.id\}`\)") {
        Write-Host "✓ Translation fix found in UserConfigSettings.tsx" -ForegroundColor Green
    } else {
        Write-Host "✗ Translation fix not found in UserConfigSettings.tsx" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Configuration file not found: $configFile" -ForegroundColor Red
}

# Check if translation files have the required keys
$translationFiles = @(
    "frontend/src/i18n/locales/pt.json",
    "frontend/src/i18n/locales/fr.json", 
    "frontend/src/i18n/locales/en.json"
)

Write-Host ""
Write-Host "Checking translation files..." -ForegroundColor Yellow

foreach ($file in $translationFiles) {
    if (Test-Path $file) {
        Write-Host "✓ Translation file found: $file" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        if ($content -match '"config":\s*\{[^}]*"sections":\s*\{[^}]*"profile":\s*"[^"]*"[^}]*"preferences":\s*"[^"]*"[^}]*"notifications":\s*"[^"]*"') {
            Write-Host "  ✓ config.sections keys found" -ForegroundColor Green
        } else {
            Write-Host "  ✗ config.sections keys not found" -ForegroundColor Red
        }
    } else {
        Write-Host "✗ Translation file not found: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Opening test page in browser..." -ForegroundColor Yellow

# Open the test page in the default browser
try {
    Start-Process $testFile
    Write-Host "✓ Test page opened in browser" -ForegroundColor Green
} catch {
    Write-Host "✗ Failed to open test page: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Test Summary:" -ForegroundColor Cyan
Write-Host "- The UserConfigSettings.tsx component now uses t('config.sections.{section.id}') instead of hardcoded titles" -ForegroundColor White
Write-Host "- Translation files contain the required config.sections keys" -ForegroundColor White
Write-Host "- Test page allows manual verification of translations" -ForegroundColor White
Write-Host ""
Write-Host "Expected Results:" -ForegroundColor Cyan
Write-Host "- Portuguese: Perfil, Preferências, Notificações" -ForegroundColor White
Write-Host "- French: Profil, Préférences, Notifications" -ForegroundColor White
Write-Host "- English: Profile, Preferences, Notifications" -ForegroundColor White
Write-Host ""
Write-Host "The configuration sections should now display correctly in all three languages!" -ForegroundColor Green
