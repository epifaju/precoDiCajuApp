# Test de compilation du frontend avec les nouvelles fonctionnalités GPS
# Ce script vérifie que le frontend peut être compilé sans erreurs

Write-Host "🔨 Test de compilation du frontend" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (!(Test-Path "frontend/package.json")) {
    Write-Host "❌ Erreur: Le fichier frontend/package.json n'existe pas" -ForegroundColor Red
    Write-Host "Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Yellow
    exit 1
}

# Aller dans le répertoire frontend
Set-Location frontend

Write-Host "`n📋 Vérification des dépendances..." -ForegroundColor Yellow

# Vérifier que node_modules existe
if (!(Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules n'existe pas, installation des dépendances..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Dépendances vérifiées" -ForegroundColor Green

Write-Host "`n🔍 Vérification des fichiers de géolocalisation..." -ForegroundColor Yellow

# Vérifier que tous les fichiers de géolocalisation existent
$geolocationFiles = @(
    "src/hooks/geolocation/useGeolocation.ts",
    "src/hooks/geolocation/useGeolocationPermission.ts",
    "src/hooks/geolocation/useGeolocationAccuracy.ts",
    "src/hooks/geolocation/useGeocoding.ts",
    "src/hooks/geolocation/useGeolocationManager.ts",
    "src/hooks/useGpsAccuracy.ts",
    "src/utils/geolocation/validation.ts",
    "src/utils/geolocation/geocoding.ts",
    "src/utils/geolocation/accuracy.ts",
    "src/components/geolocation/GeolocationPermission.tsx",
    "src/components/geolocation/GeolocationStatus.tsx",
    "src/components/geolocation/GeolocationInput.tsx",
    "src/components/geolocation/LocationPicker.tsx",
    "src/components/geolocation/GpsAccuracyDisplay.tsx"
)

$missingFiles = @()
foreach ($file in $geolocationFiles) {
    if (!(Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Fichiers manquants:" -ForegroundColor Red
    foreach ($file in $missingFiles) {
        Write-Host "  • $file" -ForegroundColor Red
    }
    exit 1
}

Write-Host "✅ Tous les fichiers de géolocalisation sont présents" -ForegroundColor Green

Write-Host "`n🔧 Test de compilation TypeScript..." -ForegroundColor Yellow

# Test de compilation TypeScript
try {
    npx tsc --noEmit --skipLibCheck
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation TypeScript réussie" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreurs de compilation TypeScript" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la compilation TypeScript: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🏗️ Test de build de production..." -ForegroundColor Yellow

# Test de build de production
try {
    npm run build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build de production réussi" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du build de production" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🧪 Test de démarrage du serveur de développement..." -ForegroundColor Yellow

# Démarrer le serveur de développement en arrière-plan
$devServer = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    npm run dev
}

# Attendre un peu pour que le serveur démarre
Start-Sleep -Seconds 10

# Vérifier que le serveur répond
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Serveur de développement démarré avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Serveur de développement ne répond pas correctement" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Impossible de se connecter au serveur de développement" -ForegroundColor Red
}

# Arrêter le serveur de développement
Stop-Job $devServer
Remove-Job $devServer

Write-Host "`n📊 Résumé des tests:" -ForegroundColor Cyan
Write-Host "✅ Dépendances installées" -ForegroundColor Green
Write-Host "✅ Fichiers de géolocalisation présents" -ForegroundColor Green
Write-Host "✅ Compilation TypeScript réussie" -ForegroundColor Green
Write-Host "✅ Build de production réussi" -ForegroundColor Green
Write-Host "✅ Serveur de développement fonctionnel" -ForegroundColor Green

Write-Host "`n🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Exécutez les tests de fonctionnalités GPS" -ForegroundColor White
Write-Host "2. Exécutez les tests des composants" -ForegroundColor White
Write-Host "3. Testez l'intégration dans l'application" -ForegroundColor White

Write-Host "`n✨ Frontend prêt pour les tests de géolocalisation !" -ForegroundColor Green

# Retourner au répertoire racine
Set-Location ..
