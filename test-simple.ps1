Write-Host "Test des traductions du module Dashboard" -ForegroundColor Green

# Vérifier les fichiers
$frFile = "frontend/src/i18n/locales/fr.json"
$enFile = "frontend/src/i18n/locales/en.json"

if (Test-Path $frFile) {
    Write-Host "✅ Fichier français trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier français manquant" -ForegroundColor Red
}

if (Test-Path $enFile) {
    Write-Host "✅ Fichier anglais trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier anglais manquant" -ForegroundColor Red
}

# Vérifier la clé dashboard
$frContent = Get-Content $frFile -Raw | ConvertFrom-Json
$enContent = Get-Content $enFile -Raw | ConvertFrom-Json

if ($frContent.nav.dashboard) {
    Write-Host "✅ nav.dashboard en français: $($frContent.nav.dashboard)" -ForegroundColor Green
} else {
    Write-Host "❌ nav.dashboard manquant en français" -ForegroundColor Red
}

if ($enContent.nav.dashboard) {
    Write-Host "✅ nav.dashboard en anglais: $($enContent.nav.dashboard)" -ForegroundColor Green
} else {
    Write-Host "❌ nav.dashboard manquant en anglais" -ForegroundColor Red
}

if ($frContent.dashboard.goodMorning) {
    Write-Host "✅ dashboard.goodMorning en français: $($frContent.dashboard.goodMorning)" -ForegroundColor Green
} else {
    Write-Host "❌ dashboard.goodMorning manquant en français" -ForegroundColor Red
}

Write-Host "Test terminé!" -ForegroundColor Green
