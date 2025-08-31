# Vérification des clés de traduction pour le modal de changement de mot de passe
Write-Host "=== Vérification des Clés de Traduction ===" -ForegroundColor Cyan
Write-Host ""

# Charger les fichiers de traduction
$ptTranslations = Get-Content "frontend/src/i18n/locales/pt.json" | ConvertFrom-Json
$frTranslations = Get-Content "frontend/src/i18n/locales/fr.json" | ConvertFrom-Json
$enTranslations = Get-Content "frontend/src/i18n/locales/en.json" | ConvertFrom-Json

# Clés nécessaires pour le modal de changement de mot de passe
$requiredKeys = @(
    "profile.actions.changePassword",
    "profile.password.title",
    "profile.password.current",
    "profile.password.currentPlaceholder",
    "profile.password.new",
    "profile.password.newPlaceholder",
    "profile.password.confirm",
    "profile.password.confirmPlaceholder",
    "profile.password.requirements",
    "profile.password.change",
    "profile.password.success",
    "profile.password.errors.currentRequired",
    "profile.password.errors.newRequired",
    "profile.password.errors.tooShort",
    "profile.password.errors.mismatch",
    "profile.password.errors.samePassword",
    "profile.password.errors.general",
    "profile.password.errors.network",
    "common.cancel",
    "common.saving"
)

Write-Host "Vérification des clés de traduction..." -ForegroundColor Yellow
Write-Host ""

$allKeysPresent = $true

foreach ($key in $requiredKeys) {
    $keyParts = $key.Split('.')
    $ptValue = $ptTranslations
    $frValue = $frTranslations
    $enValue = $enTranslations
    
    # Naviguer dans l'objet JSON
    foreach ($part in $keyParts) {
        $ptValue = $ptValue.$part
        $frValue = $frValue.$part
        $enValue = $enValue.$part
    }
    
    $ptStatus = if ($ptValue) { "✓" } else { "✗" }
    $frStatus = if ($frValue) { "✓" } else { "✗" }
    $enStatus = if ($enValue) { "✓" } else { "✗" }
    
    $overallStatus = if ($ptValue -and $frValue -and $enValue) { "✓" } else { "✗" }
    
    if ($overallStatus -eq "✗") {
        $allKeysPresent = $false
    }
    
    Write-Host "$overallStatus $key" -ForegroundColor $(if ($overallStatus -eq "✓") { "Green" } else { "Red" })
    Write-Host "  PT: $ptStatus $($ptValue || 'MANQUANT')" -ForegroundColor $(if ($ptValue) { "Gray" } else { "Red" })
    Write-Host "  FR: $frStatus $($frValue || 'MANQUANT')" -ForegroundColor $(if ($frValue) { "Gray" } else { "Red" })
    Write-Host "  EN: $enStatus $($enValue || 'MANQUANT')" -ForegroundColor $(if ($enValue) { "Gray" } else { "Red" })
    Write-Host ""
}

Write-Host "=== Résumé ===" -ForegroundColor Cyan
if ($allKeysPresent) {
    Write-Host "✓ Toutes les clés de traduction sont présentes !" -ForegroundColor Green
} else {
    Write-Host "✗ Certaines clés de traduction sont manquantes !" -ForegroundColor Red
    Write-Host ""
    Write-Host "Actions recommandées :" -ForegroundColor Yellow
    Write-Host "1. Vérifiez que toutes les clés manquantes sont ajoutées" -ForegroundColor White
    Write-Host "2. Assurez-vous que les valeurs sont correctement traduites" -ForegroundColor White
    Write-Host "3. Testez le changement de langue dans l'interface" -ForegroundColor White
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
