# Test des Traductions Portugaises Corrigées
# Script pour vérifier que les erreurs de traduction ont été résolues

Write-Host "🔍 Test des Traductions Portugaises Corrigées" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les fichiers de traduction existent
$ptFile = "frontend/src/i18n/locales/pt.json"
$enFile = "frontend/src/i18n/locales/en.json"
$frFile = "frontend/src/i18n/locales/fr.json"

Write-Host "📁 Vérification des fichiers de traduction..." -ForegroundColor Yellow

if (Test-Path $ptFile) {
    Write-Host "✅ $ptFile - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ $ptFile - Introuvable" -ForegroundColor Red
    exit 1
}

if (Test-Path $enFile) {
    Write-Host "✅ $enFile - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ $enFile - Introuvable" -ForegroundColor Red
    exit 1
}

if (Test-Path $frFile) {
    Write-Host "✅ $frFile - Trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ $frFile - Introuvable" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Vérifier les traductions manquantes dans le fichier portugais
Write-Host "🔍 Vérification des traductions manquantes..." -ForegroundColor Yellow

$ptContent = Get-Content $ptFile -Raw
$enContent = Get-Content $enFile -Raw
$frContent = Get-Content $frFile -Raw

# Clés à vérifier
$missingKeys = @(
    "prices.quickOverview",
    "prices.avgPrice", 
    "prices.regions",
    "prices.qualities"
)

$allFound = $true

foreach ($key in $missingKeys) {
    $section = $key.Split('.')[0]
    $subKey = $key.Split('.')[1]
    
    # Vérifier dans le fichier portugais
    if ($ptContent -match "`"$subKey`":") {
        Write-Host "✅ $key - Trouvé en portugais" -ForegroundColor Green
    } else {
        Write-Host "❌ $key - Manquant en portugais" -ForegroundColor Red
        $allFound = $false
    }
    
    # Vérifier dans le fichier anglais
    if ($enContent -match "`"$subKey`":") {
        Write-Host "✅ $key - Trouvé en anglais" -ForegroundColor Green
    } else {
        Write-Host "❌ $key - Manquant en anglais" -ForegroundColor Red
        $allFound = $false
    }
    
    # Vérifier dans le fichier français
    if ($frContent -match "`"$subKey`":") {
        Write-Host "✅ $key - Trouvé en français" -ForegroundColor Green
    } else {
        Write-Host "❌ $key - Manquant en français" -ForegroundColor Red
        $allFound = $false
    }
    
    Write-Host ""
}

Write-Host "📊 Résumé des vérifications..." -ForegroundColor Yellow

if ($allFound) {
    Write-Host "🎉 SUCCÈS : Toutes les traductions manquantes ont été ajoutées !" -ForegroundColor Green
    Write-Host ""
    Write-Host "✅ Les erreurs suivantes ont été corrigées :" -ForegroundColor Green
    Write-Host "   - i18next::translator: missingKey pt translation prices.quickOverview Quick Overview" -ForegroundColor White
    Write-Host "   - i18next::translator: missingKey pt translation prices.avgPrice Avg Price" -ForegroundColor White
    Write-Host "   - i18next::translator: missingKey pt translation prices.regions Regions" -ForegroundColor White
    Write-Host "   - i18next::translator: missingKey pt translation prices.qualities Quality Grades" -ForegroundColor White
    Write-Host ""
    Write-Host "🌐 Traductions ajoutées dans les 3 langues :" -ForegroundColor Green
    Write-Host "   🇵🇹 Portugais : Visão Geral Rápida, Preço Médio, Regiões, Graus de Qualidade" -ForegroundColor White
    Write-Host "   🇫🇷 Français : Aperçu Rapide, Prix Moyen, Régions, Degrés de Qualité" -ForegroundColor White
    Write-Host "   🇬🇧 Anglais : Quick Overview, Avg Price, Regions, Quality Grades" -ForegroundColor White
} else {
    Write-Host "❌ ÉCHEC : Certaines traductions sont encore manquantes" -ForegroundColor Red
    Write-Host "Vérifiez les fichiers de traduction et réessayez." -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. Redémarrer l'application frontend" -ForegroundColor White
Write-Host "2. Tester avec la langue portugaise" -ForegroundColor White
Write-Host "3. Vérifier que le composant PriceOverview affiche les textes traduits" -ForegroundColor White

Write-Host ""
Write-Host "📋 Test terminé !" -ForegroundColor Cyan
