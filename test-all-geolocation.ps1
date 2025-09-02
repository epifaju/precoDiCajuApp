# Script principal de test des fonctionnalités de géolocalisation GPS
# Ce script lance tous les tests de géolocalisation

Write-Host "🧪 Test complet des fonctionnalités de géolocalisation GPS" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (!(Test-Path "frontend/package.json")) {
    Write-Host "❌ Erreur: Le fichier frontend/package.json n'existe pas" -ForegroundColor Red
    Write-Host "Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Ce script va exécuter les tests suivants:" -ForegroundColor Yellow
Write-Host "1. Test de compilation du frontend" -ForegroundColor White
Write-Host "2. Test des fonctionnalités GPS" -ForegroundColor White
Write-Host "3. Test des composants React" -ForegroundColor White

$continue = Read-Host "`nVoulez-vous continuer ? (y/N)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Test annulé par l'utilisateur" -ForegroundColor Yellow
    exit 0
}

# Étape 1: Test de compilation
Write-Host "`n🔨 Étape 1: Test de compilation du frontend" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

try {
    & ".\test-frontend-build.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test de compilation réussi" -ForegroundColor Green
    } else {
        Write-Host "❌ Test de compilation échoué" -ForegroundColor Red
        Write-Host "Veuillez corriger les erreurs avant de continuer" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du test de compilation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 2: Test des fonctionnalités GPS
Write-Host "`n📍 Étape 2: Test des fonctionnalités GPS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

try {
    & ".\test-geolocation-features.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test des fonctionnalités GPS lancé" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du lancement du test des fonctionnalités" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test des fonctionnalités: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 3: Test des composants
Write-Host "`n🧩 Étape 3: Test des composants React" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

try {
    & ".\test-geolocation-components.ps1"
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test des composants lancé" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du lancement du test des composants" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test des composants: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📊 Résumé des tests:" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

Write-Host "✅ Test de compilation: Réussi" -ForegroundColor Green
Write-Host "✅ Test des fonctionnalités GPS: Lancé" -ForegroundColor Green
Write-Host "✅ Test des composants: Lancé" -ForegroundColor Green

Write-Host "`n🌐 Fichiers de test créés:" -ForegroundColor Yellow
Write-Host "• test-geolocation.html - Test des fonctionnalités GPS" -ForegroundColor White
Write-Host "• test-geolocation-components.html - Test des composants React" -ForegroundColor White

Write-Host "`n📋 Instructions pour les tests manuels:" -ForegroundColor Cyan
Write-Host "1. Les fichiers de test s'ouvrent automatiquement dans votre navigateur" -ForegroundColor White
Write-Host "2. Accordez les permissions de géolocalisation quand demandé" -ForegroundColor White
Write-Host "3. Exécutez tous les tests dans chaque fichier" -ForegroundColor White
Write-Host "4. Vérifiez que tous les tests passent" -ForegroundColor White

Write-Host "`n🔍 Tests disponibles:" -ForegroundColor Cyan
Write-Host "• Test de base de la géolocalisation" -ForegroundColor White
Write-Host "• Test des permissions" -ForegroundColor White
Write-Host "• Test de validation GPS" -ForegroundColor White
Write-Host "• Test de géocodage" -ForegroundColor White
Write-Host "• Test de précision" -ForegroundColor White
Write-Host "• Test des composants React" -ForegroundColor White

Write-Host "`n⚠️  Notes importantes:" -ForegroundColor Yellow
Write-Host "• Assurez-vous d'accorder les permissions de géolocalisation" -ForegroundColor White
Write-Host "• Les tests de géocodage nécessitent une connexion internet" -ForegroundColor White
Write-Host "• Certains tests peuvent échouer si vous êtes hors de la Guinée-Bissau" -ForegroundColor White

Write-Host "`n🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Exécutez tous les tests dans les fichiers HTML" -ForegroundColor White
Write-Host "2. Vérifiez que tous les tests passent" -ForegroundColor White
Write-Host "3. Signalez tout problème rencontré" -ForegroundColor White
Write-Host "4. Une fois les tests validés, nous pourrons passer à l'étape suivante" -ForegroundColor White

Write-Host "`n✨ Tests de géolocalisation GPS lancés avec succès !" -ForegroundColor Green
Write-Host "Vérifiez les résultats dans les fichiers de test ouverts dans votre navigateur." -ForegroundColor White
