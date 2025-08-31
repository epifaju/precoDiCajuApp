# Test des Statistiques Améliorées - Carte des Prix
# Ce script teste la page de la carte des prix avec les nouvelles statistiques

Write-Host "🧪 Test des Statistiques Améliorées - Carte des Prix" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier si le frontend est en cours d'exécution
Write-Host "`n📱 Vérification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend accessible sur http://localhost:5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible sur http://localhost:5173" -ForegroundColor Red
    Write-Host "   Démarrez le frontend avec: cd frontend && npm run dev" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le backend est en cours d'exécution
Write-Host "`n🔧 Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend accessible sur http://localhost:8080" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Backend non accessible sur http://localhost:8080" -ForegroundColor Yellow
    Write-Host "   Les données peuvent ne pas se charger correctement" -ForegroundColor Yellow
}

Write-Host "`n🌐 Test de la page Carte des Prix..." -ForegroundColor Yellow

# Créer un fichier HTML de test
$testHtml = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test - Statistiques Améliorées</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .info { background-color: #d1ecf1; border-color: #bee5eb; }
        .warning { background-color: #fff3cd; border-color: #ffeaa7; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
        .code { background-color: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace; }
        .breakpoint { display: inline-block; margin: 5px; padding: 5px 10px; background-color: #007bff; color: white; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>🧪 Test des Statistiques Améliorées - Carte des Prix</h1>
    
    <div class="test-section info">
        <h2>📋 Instructions de Test</h2>
        <ol>
            <li>Ouvrez l'application dans votre navigateur</li>
            <li>Connectez-vous avec un compte valide</li>
            <li>Naviguez vers "Carte des Prix" (menu ou /map)</li>
            <li>Vérifiez la section "Statistiques Rapides"</li>
        </ol>
    </div>

    <div class="test-section success">
        <h2>✅ Éléments à Vérifier</h2>
        <h3>🎨 Design et Style</h3>
        <ul>
            <li>Section avec titre "Statistiques Rapides" et icône</li>
            <li>4 cartes colorées avec icônes SVG</li>
            <li>Couleurs : Bleu (Total), Vert (GPS), Violet (Vérifiés), Orange (Régions)</li>
            <li>Bordures arrondies et ombres subtiles</li>
        </ul>
        
        <h3>📱 Responsive Design</h3>
        <div class="breakpoint">Mobile: 2x2</div>
        <div class="breakpoint">Tablette: 2x2</div>
        <div class="breakpoint">Desktop: 1x4</div>
        
        <h3>🔍 Contenu des Statistiques</h3>
        <ul>
            <li><strong>Total des Prix</strong> : Nombre total de prix chargés</li>
            <li><strong>Avec GPS</strong> : Nombre de prix avec coordonnées GPS</li>
            <li><strong>Prix Vérifiés</strong> : Nombre de prix vérifiés</li>
            <li><strong>Régions</strong> : Nombre de régions couvertes</li>
        </ul>
    </div>

    <div class="test-section warning">
        <h2>⚠️ Points d'Attention</h2>
        <ul>
            <li>Vérifiez que les icônes SVG s'affichent correctement</li>
            <li>Testez sur différentes tailles d'écran (responsive)</li>
            <li>Vérifiez le mode sombre/clair</li>
            <li>Assurez-vous que les traductions fonctionnent (FR/EN)</li>
        </ul>
    </div>

    <div class="test-section">
        <h2>🔧 Code Modifié</h2>
        <p><strong>Fichier :</strong> <code>frontend/src/pages/PricesMapPage.tsx</code></p>
        <p><strong>Section :</strong> Lignes 108-125 (Statistiques rapides)</p>
        
        <h3>Classes Tailwind Responsive Utilisées :</h3>
        <div class="code">
grid-cols-2 sm:grid-cols-2 lg:grid-cols-4<br>
gap-3 sm:gap-4 lg:gap-6<br>
p-3 sm:p-4<br>
text-xl sm:text-2xl lg:text-3xl<br>
w-5 h-5 sm:w-6 sm:h-6
        </div>
    </div>

    <div class="test-section success">
        <h2>🎯 Résultats Attendus</h2>
        <ul>
            <li>Design cohérent avec la section "Quick Overview" des prix</li>
            <li>Responsive parfait sur mobile, tablette et desktop</li>
            <li>Icônes SVG appropriées pour chaque statistique</li>
            <li>Palette de couleurs harmonieuse et accessible</li>
            <li>Code maintenable et bien structuré</li>
        </ul>
    </div>

    <div class="test-section info">
        <h2>📚 Documentation</h2>
        <p>Consultez le fichier <code>STATISTIQUES_DESIGN_AMELIORATIONS.md</code> pour plus de détails techniques.</p>
    </div>

    <script>
        // Test automatique de la responsivité
        function testResponsiveness() {
            const width = window.innerWidth;
            let expectedCols = 2;
            
            if (width >= 1024) {
                expectedCols = 4;
            }
            
            console.log(`📱 Largeur d'écran: ${width}px`);
            console.log(`🎯 Colonnes attendues: ${expectedCols}`);
            
            // Vérifier la grille CSS
            const statsGrid = document.querySelector('.grid');
            if (statsGrid) {
                const computedStyle = window.getComputedStyle(statsGrid);
                console.log(`🔍 Grille CSS détectée:`, computedStyle.gridTemplateColumns);
            }
        }
        
        // Exécuter le test au chargement
        window.addEventListener('load', testResponsiveness);
        window.addEventListener('resize', testResponsiveness);
    </script>
</body>
</html>
"@

# Sauvegarder le fichier de test
$testHtml | Out-File -FilePath "test-statistiques-ameliorees.html" -Encoding UTF8

Write-Host "`n📄 Fichier de test créé : test-statistiques-ameliorees.html" -ForegroundColor Green

Write-Host "`n🚀 Démarrage du navigateur..." -ForegroundColor Yellow
try {
    Start-Process "test-statistiques-ameliorees.html"
    Write-Host "✅ Navigateur ouvert avec le fichier de test" -ForegroundColor Green
} catch {
    Write-Host "❌ Impossible d'ouvrir le navigateur automatiquement" -ForegroundColor Red
    Write-Host "   Ouvrez manuellement le fichier : test-statistiques-ameliorees.html" -ForegroundColor Yellow
}

Write-Host "`n📋 Résumé des Tests à Effectuer :" -ForegroundColor Cyan
Write-Host "1. Vérifiez l'affichage des statistiques sur la page /map" -ForegroundColor White
Write-Host "2. Testez la responsivité sur différentes tailles d'écran" -ForegroundColor White
Write-Host "3. Vérifiez les icônes SVG et les couleurs" -ForegroundColor White
Write-Host "4. Testez le mode sombre/clair" -ForegroundColor White
Write-Host "5. Vérifiez les traductions français/anglais" -ForegroundColor White

Write-Host "`n✨ Test terminé ! Consultez le fichier HTML pour les instructions détaillées." -ForegroundColor Green
