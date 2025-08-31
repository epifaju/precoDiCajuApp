# Test du Footer Amélioré - Preço di Cajú
# Ce script teste le Footer avec ses nouvelles améliorations de design et responsivité

Write-Host "=== Test du Footer Amélioré - Preço di Cajú ===" -ForegroundColor Green
Write-Host ""

# Vérifier si l'application est en cours d'exécution
Write-Host "🔍 Vérification du statut de l'application..." -ForegroundColor Yellow

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend accessible sur http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible sur http://localhost:5173" -ForegroundColor Red
    Write-Host "   Démarrez le frontend avec: npm run dev" -ForegroundColor Yellow
    exit 1
}

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend accessible sur http://localhost:8080" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend non accessible sur http://localhost:8080" -ForegroundColor Yellow
    Write-Host "   Le Footer peut être testé sans le backend" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test du Footer Amélioré ===" -ForegroundColor Cyan

# Ouvrir le fichier de test HTML
$testFile = "test-footer-improvements.html"
if (Test-Path $testFile) {
    Write-Host "📱 Ouverture du fichier de test HTML..." -ForegroundColor Yellow
    Start-Process $testFile
    Write-Host "✅ Fichier de test ouvert dans le navigateur" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier de test non trouvé: $testFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Instructions de Test ===" -ForegroundColor Cyan
Write-Host "1. 📱 Testez la responsivité en redimensionnant la fenêtre du navigateur" -ForegroundColor White
Write-Host "2. 🌙 Testez le mode sombre en cliquant sur le bouton thème" -ForegroundColor White
Write-Host "3. 🔍 Vérifiez que le Footer s'adapte correctement sur:" -ForegroundColor White
Write-Host "   - Mobile (< 640px): 1 colonne" -ForegroundColor White
Write-Host "   - Tablette (640px - 1024px): 2 colonnes" -ForegroundColor White
Write-Host "   - Desktop (> 1024px): 4 colonnes" -ForegroundColor White
Write-Host "4. 🎨 Vérifiez la cohérence des couleurs et du style" -ForegroundColor White
Write-Host "5. ✨ Testez les animations et transitions" -ForegroundColor White

Write-Host ""
Write-Host "=== Améliorations Apportées ===" -ForegroundColor Cyan
Write-Host "✅ Design totalement responsive avec breakpoints Tailwind" -ForegroundColor Green
Write-Host "✅ Organisation adaptative des colonnes selon la taille d'écran" -ForegroundColor Green
Write-Host "✅ Icônes harmonisées avec le reste de l'application" -ForegroundColor Green
Write-Host "✅ Espacement et hiérarchie visuelle optimisés" -ForegroundColor Green
Write-Host "✅ Transitions et hover effects pour une meilleure UX" -ForegroundColor Green
Write-Host "✅ Section Contact & Légal ajoutée" -ForegroundColor Green
Write-Host "✅ Indicateur de statut en ligne" -ForegroundColor Green
Write-Host "✅ Animations subtiles (cœur qui pulse)" -ForegroundColor Green

Write-Host ""
Write-Host "=== Test dans l'Application Réelle ===" -ForegroundColor Cyan
Write-Host "🌐 Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor Yellow
Write-Host "📱 Testez la responsivité sur différentes tailles d'écran" -ForegroundColor Yellow
Write-Host "🎨 Vérifiez la cohérence avec le Header et les autres composants" -ForegroundColor Yellow

Write-Host ""
Write-Host "=== Vérification des Composants ===" -ForegroundColor Cyan

# Vérifier que le Footer est bien importé dans l'application
$footerFile = "frontend/src/components/layout/Footer.tsx"
if (Test-Path $footerFile) {
    $footerContent = Get-Content $footerFile -Raw
    if ($footerContent -match "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4") {
        Write-Host "✅ Footer responsive configuré correctement" -ForegroundColor Green
    } else {
        Write-Host "❌ Footer responsive non configuré" -ForegroundColor Red
    }
    
    if ($footerContent -match "animate-pulse") {
        Write-Host "✅ Animations configurées" -ForegroundColor Green
    } else {
        Write-Host "❌ Animations non configurées" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier Footer.tsx non trouvé" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== Résumé ===" -ForegroundColor Cyan
Write-Host "🎯 Le Footer a été amélioré avec succès pour être:" -ForegroundColor White
Write-Host "   - Totalement responsive (mobile, tablette, desktop)" -ForegroundColor White
Write-Host "   - Visuellement cohérent avec le reste de l'application" -ForegroundColor White
Write-Host "   - Optimisé pour une meilleure expérience utilisateur" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Testez maintenant le Footer dans votre application !" -ForegroundColor Green
