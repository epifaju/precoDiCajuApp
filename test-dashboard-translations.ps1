# Test des Traductions du Module Dashboard
# Vérification que les corrections ont été appliquées

Write-Host "🧪 Test des Traductions - Module Dashboard" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les fichiers de traduction existent
$frFile = "frontend/src/i18n/locales/fr.json"
$enFile = "frontend/src/i18n/locales/en.json"
$ptFile = "frontend/src/i18n/locales/pt.json"

Write-Host "📁 Vérification des fichiers de traduction..." -ForegroundColor Yellow

if (Test-Path $frFile) {
    Write-Host "✅ $frFile - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ $frFile - Manquant" -ForegroundColor Red
    exit 1
}

if (Test-Path $enFile) {
    Write-Host "✅ $enFile - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ $enFile - Manquant" -ForegroundColor Red
    exit 1
}

if (Test-Path $ptFile) {
    Write-Host "✅ $ptFile - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ $ptFile - Manquant" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier la présence des clés dashboard dans chaque fichier
Write-Host "🔍 Vérification des clés de traduction..." -ForegroundColor Yellow

# Lire le contenu des fichiers
$frContent = Get-Content $frFile -Raw | ConvertFrom-Json
$enContent = Get-Content $enFile -Raw | ConvertFrom-Json
$ptContent = Get-Content $ptFile -Raw | ConvertFrom-Json

# Vérifier la navigation
Write-Host "📱 Navigation:" -ForegroundColor Blue
if ($frContent.nav.dashboard) {
    Write-Host "  ✅ FR: nav.dashboard = '$($frContent.nav.dashboard)'" -ForegroundColor Green
} else {
    Write-Host "  ❌ FR: nav.dashboard manquant" -ForegroundColor Red
}

if ($enContent.nav.dashboard) {
    Write-Host "  ✅ EN: nav.dashboard = '$($enContent.nav.dashboard)'" -ForegroundColor Green
} else {
    Write-Host "  ❌ EN: nav.dashboard manquant" -ForegroundColor Red
}

if ($ptContent.nav.dashboard) {
    Write-Host "  ✅ PT: nav.dashboard = '$($ptContent.nav.dashboard)'" -ForegroundColor Green
} else {
    Write-Host "  ❌ PT: nav.dashboard manquant" -ForegroundColor Red
}

Write-Host ""

# Vérifier la section dashboard
Write-Host "📊 Section Dashboard:" -ForegroundColor Blue

$dashboardKeys = @(
    "goodMorning", "goodAfternoon", "goodEvening", "welcome", "period", "days",
    "totalPrices", "averagePrice", "priceRange", "verifiedPrices", "inLast",
    "acrossAllRegions", "minMaxPrices", "verified", "priceTrends", "recentPriceMovements",
    "regionalDistribution", "pricesByRegion", "qualityComparison", "pricesByQuality",
    "recentActivity", "latestPriceUpdates", "by", "vs30Days", "noData", "noPricesYet",
    "date", "region", "quality", "price"
)

$frDashboardCount = 0
$enDashboardCount = 0
$ptDashboardCount = 0

foreach ($key in $dashboardKeys) {
    if ($frContent.dashboard.$key) { $frDashboardCount++ }
    if ($enContent.dashboard.$key) { $enDashboardCount++ }
    if ($ptContent.dashboard.$key) { $ptDashboardCount++ }
}

Write-Host "  🇫🇷 Français: $frDashboardCount/$($dashboardKeys.Count) clés présentes" -ForegroundColor $(if ($frDashboardCount -eq $dashboardKeys.Count) { "Green" } else { "Red" })
Write-Host "  🇬🇧 Anglais: $enDashboardCount/$($dashboardKeys.Count) clés présentes" -ForegroundColor $(if ($enDashboardCount -eq $dashboardKeys.Count) { "Green" } else { "Red" })
Write-Host "  🇵🇹 Portugais: $ptDashboardCount/$($dashboardKeys.Count) clés présentes" -ForegroundColor $(if ($ptDashboardCount -eq $dashboardKeys.Count) { "Green" } else { "Red" })

Write-Host ""

# Vérifier quelques clés spécifiques
Write-Host "🔑 Vérification de clés spécifiques:" -ForegroundColor Blue

$testKeys = @("goodMorning", "welcome", "totalPrices", "priceTrends")
foreach ($key in $testKeys) {
    $frValue = $frContent.dashboard.$key
    $enValue = $enContent.dashboard.$key
    $ptValue = $ptContent.dashboard.$key
    
    Write-Host "  $key:" -ForegroundColor Gray
    Write-Host "    FR: '$frValue'" -ForegroundColor $(if ($frValue) { "Green" } else { "Red" })
    Write-Host "    EN: '$enValue'" -ForegroundColor $(if ($enValue) { "Green" } else { "Red" })
    Write-Host "    PT: '$ptValue'" -ForegroundColor $(if ($ptValue) { "Green" } else { "Red" })
    Write-Host ""
}

# Résumé
Write-Host "📋 Résumé des Corrections:" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan

if ($frDashboardCount -eq $dashboardKeys.Count -and $enDashboardCount -eq $dashboardKeys.Count) {
    Write-Host "✅ SUCCÈS: Toutes les traductions du module Dashboard ont été ajoutées!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "  1. Redémarrez l'application frontend" -ForegroundColor White
    Write-Host "  2. Allez sur la page Dashboard" -ForegroundColor White
    Write-Host "  3. Changez la langue vers 'Français'" -ForegroundColor White
    Write-Host "  4. Vérifiez que tous les textes sont en français" -ForegroundColor White
    Write-Host ""
    Write-Host "🔒 Le portugais reste la langue par défaut (fallbackLng: 'pt')" -ForegroundColor Blue
} else {
    Write-Host "❌ PROBLÈME: Certaines traductions sont encore manquantes" -ForegroundColor Red
    Write-Host "  FR: $frDashboardCount/$($dashboardKeys.Count) clés" -ForegroundColor Red
    Write-Host "  EN: $enDashboardCount/$($dashboardKeys.Count) clés" -ForegroundColor Red
}

Write-Host ""
Write-Host "🧪 Test terminé!" -ForegroundColor Cyan
