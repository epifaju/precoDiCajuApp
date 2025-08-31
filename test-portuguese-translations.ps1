# Test des Traductions Portugaises - Mapa de Preços
Write-Host "🧪 Test des Traductions Portugaises - Mapa de Preços" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "frontend/src/i18n/locales/pt.json")) {
    Write-Host "❌ Erreur: Fichier de traduction portugais non trouvé!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier de traduction portugais trouvé" -ForegroundColor Green

# Lire le fichier de traduction
try {
    $ptContent = Get-Content "frontend/src/i18n/locales/pt.json" -Raw | ConvertFrom-Json
    Write-Host "✅ Fichier JSON valide" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur JSON: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Clés requises pour la section map
$requiredKeys = @("pageTitle", "pageDescription", "listView", "submitPrice", "allRegions", "allQualities", "allPrices", "verifiedOnly", "unverifiedOnly", "filters", "region", "quality", "verified", "selectRegion", "selectQuality", "selectVerified", "dateFrom", "dateTo", "clearFilters", "quickStats", "totalPrices", "pricesWithGps", "verifiedPrices", "regionsCovered", "legend", "markerColors", "unverifiedPrices", "markerSizes", "largeMarkers", "mediumMarkers", "interactions", "clickMarker", "zoomMap", "dragMap", "tips", "useFilters", "addGps", "verifyPrices")

Write-Host "🔍 Vérification des clés de traduction..." -ForegroundColor Yellow
Write-Host ""

$missingKeys = @()
$presentKeys = @()

foreach ($key in $requiredKeys) {
    if ($ptContent.map.$key) {
        $presentKeys += $key
        Write-Host "  ✅ $key`: $($ptContent.map.$key)" -ForegroundColor Green
    } else {
        $missingKeys += $key
        Write-Host "  ❌ $key`: MANQUANTE" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Résumé: $($presentKeys.Count)/$($requiredKeys.Count) clés présentes" -ForegroundColor Cyan

if ($missingKeys.Count -eq 0) {
    Write-Host "🎉 SUCCÈS! Toutes les clés sont présentes!" -ForegroundColor Green
    Write-Host "🌍 La page devrait maintenant afficher en portugais" -ForegroundColor Cyan
} else {
    Write-Host "❌ PROBLÈME: $($missingKeys.Count) clés manquantes" -ForegroundColor Red
}

Write-Host "🧪 Test terminé!" -ForegroundColor Cyan
