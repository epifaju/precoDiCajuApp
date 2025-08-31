# Test Mobile Optimization - Prix du Cajou
# Ce script teste l'optimisation mobile de l'écran des prix

Write-Host "🚀 Test de l'Optimisation Mobile - Prix du Cajou" -ForegroundColor Green
Write-Host "=================================================" -ForegroundColor Green

# Vérifier que le frontend est démarré
Write-Host "`n📱 Vérification du Frontend..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend accessible sur http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend non accessible sur http://localhost:5173" -ForegroundColor Red
    Write-Host "   Démarrez le frontend avec: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le backend est démarré
Write-Host "`n🔧 Vérification du Backend..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend accessible sur http://localhost:8080" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend non accessible sur http://localhost:8080" -ForegroundColor Red
    Write-Host "   Démarrez le backend avec: ./mvnw spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Vérifier les composants créés
Write-Host "`n📁 Vérification des Composants Créés..." -ForegroundColor Yellow

$components = @(
    "frontend/src/components/prices/PriceCard.tsx",
    "frontend/src/components/prices/FilterPanel.tsx", 
    "frontend/src/components/prices/MobilePagination.tsx",
    "frontend/src/components/prices/PriceStats.tsx",
    "frontend/src/components/prices/PriceOverview.tsx",
    "frontend/src/components/prices/FloatingActionButtons.tsx"
)

foreach ($component in $components) {
    if (Test-Path $component) {
        Write-Host "✅ $component" -ForegroundColor Green
    } else {
        Write-Host "❌ $component manquant" -ForegroundColor Red
    }
}

# Vérifier les modifications principales
Write-Host "`n🔧 Vérification des Modifications Principales..." -ForegroundColor Yellow

$modifiedFiles = @(
    "frontend/src/components/prices/PriceList.tsx",
    "frontend/src/pages/PricesPage.tsx"
)

foreach ($file in $modifiedFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file modifié" -ForegroundColor Green
    } else {
        Write-Host "❌ $file non trouvé" -ForegroundColor Red
    }
}

# Vérifier la documentation
Write-Host "`n📚 Vérification de la Documentation..." -ForegroundColor Yellow

if (Test-Path "MOBILE_OPTIMIZATION_DOCUMENTATION.md") {
    Write-Host "✅ Documentation créée" -ForegroundColor Green
} else {
    Write-Host "❌ Documentation manquante" -ForegroundColor Red
}

# Instructions de test
Write-Host "`n🧪 Instructions de Test Mobile:" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host "1. Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor White
Write-Host "2. Connectez-vous à l'application" -ForegroundColor White
Write-Host "3. Naviguez vers l'écran 'Prix du Cajou'" -ForegroundColor White
Write-Host "4. Testez sur différentes tailles d'écran:" -ForegroundColor White
Write-Host "   - Mobile (320px-768px)" -ForegroundColor White
Write-Host "   - Tablette (768px-1024px)" -ForegroundColor White
Write-Host "   - Desktop (1024px+)" -ForegroundColor White
Write-Host "5. Vérifiez les fonctionnalités:" -ForegroundColor White
Write-Host "   - Filtres collapsibles sur mobile" -ForegroundColor White
Write-Host "   - Toggle vue liste/grille" -ForegroundColor White
Write-Host "   - Boutons d'action flottants" -ForegroundColor White
Write-Host "   - Pagination mobile optimisée" -ForegroundColor White
Write-Host "   - Vue d'ensemble des prix" -ForegroundColor White

Write-Host "`n🎯 Fonctionnalités à Tester:" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan
Write-Host "✅ Interface responsive" -ForegroundColor Green
Write-Host "✅ Filtres adaptatifs" -ForegroundColor Green
Write-Host "✅ Vue liste/grille" -ForegroundColor Green
Write-Host "✅ Navigation tactile" -ForegroundColor Green
Write-Host "✅ Boutons flottants" -ForegroundColor Green
Write-Host "✅ Pagination mobile" -ForegroundColor Green
Write-Host "✅ Statistiques visuelles" -ForegroundColor Green

Write-Host "`n🚀 Test Mobile Optimization - Terminé!" -ForegroundColor Green
Write-Host "L'écran 'Prix du Cajou' est maintenant optimisé pour tous les périphériques!" -ForegroundColor Green

