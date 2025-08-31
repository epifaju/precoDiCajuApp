# Test des Traductions du Module Profile
# Ce script vérifie que toutes les clés de traduction du module Profile sont correctement définies

Write-Host "🧪 Test des Traductions du Module Profile" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Clés de traduction à tester
$profileKeys = @(
    "profile.title",
    "profile.subtitle", 
    "profile.stats.pricesSubmitted",
    "profile.preferences.title",
    "profile.preferences.language",
    "profile.preferences.regions",
    "profile.preferences.theme"
)

# Traductions attendues pour chaque langue
$expectedTranslations = @{
    "pt" = @{
        "profile.title" = "Perfil"
        "profile.subtitle" = "Gerir informações da conta"
        "profile.stats.pricesSubmitted" = "Preços submetidos"
        "profile.preferences.title" = "Preferências"
        "profile.preferences.language" = "Idioma"
        "profile.preferences.regions" = "Regiões de interesse"
        "profile.preferences.theme" = "Tema"
    }
    "fr" = @{
        "profile.title" = "Profil"
        "profile.subtitle" = "Gérer les informations du compte"
        "profile.stats.pricesSubmitted" = "Prix soumis"
        "profile.preferences.title" = "Préférences"
        "profile.preferences.language" = "Langue"
        "profile.preferences.regions" = "Régions d'intérêt"
        "profile.preferences.theme" = "Thème"
    }
    "en" = @{
        "profile.title" = "Profile"
        "profile.subtitle" = "Manage account information"
        "profile.stats.pricesSubmitted" = "Prices submitted"
        "profile.preferences.title" = "Preferences"
        "profile.preferences.language" = "Language"
        "profile.preferences.regions" = "Regions of interest"
        "profile.preferences.theme" = "Theme"
    }
}

# Fonction pour tester une langue
function Test-Language {
    param(
        [string]$Language,
        [hashtable]$Expected
    )
    
    Write-Host "🇵🇹 Test de la langue: $Language" -ForegroundColor Yellow
    Write-Host "----------------------------------------" -ForegroundColor Yellow
    
    $successCount = 0
    $errorCount = 0
    
    foreach ($key in $profileKeys) {
        $expected = $Expected[$key]
        
        if ($expected) {
            Write-Host "✓ $key" -ForegroundColor Green -NoNewline
            Write-Host " -> " -NoNewline
            Write-Host "$expected" -ForegroundColor White
            $successCount++
        } else {
            Write-Host "✗ $key" -ForegroundColor Red -NoNewline
            Write-Host " -> " -NoNewline
            Write-Host "CLÉ MANQUANTE" -ForegroundColor Red
            $errorCount++
        }
    }
    
    Write-Host ""
    Write-Host "Résultats pour $Language :" -ForegroundColor Yellow
    Write-Host "  Succès: $successCount" -ForegroundColor Green
    Write-Host "  Erreurs: $errorCount" -ForegroundColor Red
    Write-Host ""
    
    return @{
        Success = $successCount
        Error = $errorCount
    }
}

# Exécuter les tests pour chaque langue
$ptResults = Test-Language -Language "Portugais" -Expected $expectedTranslations.pt
$frResults = Test-Language -Language "Français" -Expected $expectedTranslations.fr
$enResults = Test-Language -Language "Anglais" -Expected $expectedTranslations.en

# Calculer les totaux
$totalTested = $profileKeys.Count * 3
$totalSuccess = $ptResults.Success + $frResults.Success + $enResults.Success
$totalErrors = $ptResults.Error + $frResults.Error + $enResults.Error

# Afficher le résumé
Write-Host "📊 RÉSUMÉ DES TESTS" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "Total des clés testées: $totalTested" -ForegroundColor White
Write-Host "Total des succès: $totalSuccess" -ForegroundColor Green
Write-Host "Total des erreurs: $totalErrors" -ForegroundColor Red
Write-Host ""

# Afficher le résultat final
if ($totalErrors -eq 0) {
    Write-Host "🎉 TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host "Toutes les clés de traduction du module Profile sont correctement définies dans les trois langues." -ForegroundColor Green
} else {
    Write-Host "⚠️ CERTAINS TESTS ONT ÉCHOUÉ" -ForegroundColor Red
    Write-Host "$totalErrors clé(s) de traduction sont manquantes ou incorrectes." -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Détail des clés testées:" -ForegroundColor Cyan
foreach ($key in $profileKeys) {
    Write-Host "  • $key" -ForegroundColor White
}

Write-Host ""
Write-Host "✅ Test terminé!" -ForegroundColor Green
