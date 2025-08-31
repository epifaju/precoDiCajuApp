# Test des améliorations de la section Description du tableau de bord
# Ce script teste la responsivité et l'affichage de la section Description

Write-Host "=== Test des améliorations de la section Description du tableau de bord ===" -ForegroundColor Green
Write-Host ""

# Vérifier si le backend est en cours d'exécution
Write-Host "1. Vérification du statut du backend..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Backend non accessible. Démarrage..." -ForegroundColor Red
    Start-Process -FilePath "powershell" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "start-backend-clean.ps1" -WindowStyle Minimized
    Start-Sleep -Seconds 10
}

# Vérifier si le frontend est en cours d'exécution
Write-Host "2. Vérification du statut du frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "   ✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Frontend non accessible. Démarrage..." -ForegroundColor Red
    Start-Process -FilePath "powershell" -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "start-frontend-dev.ps1" -WindowStyle Minimized
    Start-Sleep -Seconds 15
}

Write-Host ""
Write-Host "3. Test de la page du tableau de bord..." -ForegroundColor Yellow

# Créer un fichier HTML de test pour vérifier la responsivité
$testHtml = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Section Description - Tableau de Bord</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .mobile-view { width: 375px; height: 667px; }
        .tablet-view { width: 768px; height: 1024px; }
        .desktop-view { width: 1200px; height: 800px; }
        .responsive-test { border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
    </style>
</head>
<body class="bg-gray-100 p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-3xl font-bold text-gray-900 mb-8 text-center">
            Test de la Section Description - Responsivité
        </h1>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Mobile View -->
            <div class="responsive-test mobile-view">
                <div class="bg-white p-4 h-full">
                    <h2 class="text-lg font-semibold text-gray-700 mb-4 text-center">Mobile (375px)</h2>
                    
                    <!-- Section Description - Mobile Layout -->
                    <div class="mb-8">
                        <div class="text-center space-y-4">
                            <div class="space-y-2">
                                <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                    Bon après-midi, Administrador! 👋
                                </h1>
                                <p class="text-base sm:text-lg text-gray-600 leading-relaxed max-w-md mx-auto">
                                    Voici ce qui se passe avec les prix du cajou aujourd'hui
                                </p>
                            </div>
                            
                            <!-- Period Selector - Mobile -->
                            <div class="flex flex-col items-center space-y-3">
                                <span class="text-sm font-medium text-gray-700">
                                    Période:
                                </span>
                                <div class="flex items-center justify-center space-x-2">
                                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium min-w-[60px] h-9 transition-all duration-200 hover:scale-105">
                                        7d
                                    </button>
                                    <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium min-w-[60px] h-9 transition-all duration-200 hover:scale-105">
                                        30d
                                    </button>
                                    <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium min-w-[60px] h-9 transition-all duration-200 hover:scale-105">
                                        90d
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tablet View -->
            <div class="responsive-test tablet-view">
                <div class="bg-white p-6 h-full">
                    <h2 class="text-lg font-semibold text-gray-700 mb-4 text-center">Tablet (768px)</h2>
                    
                    <!-- Section Description - Tablet Layout -->
                    <div class="mb-8">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 max-w-2xl">
                                <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                    Bon après-midi, Administrador! 👋
                                </h1>
                                <p class="text-lg lg:text-xl text-gray-600 mt-2 leading-relaxed">
                                    Voici ce qui se passe avec les prix du cajou aujourd'hui
                                </p>
                            </div>
                            
                            <!-- Period Selector - Desktop -->
                            <div class="flex flex-col items-end space-y-3 ml-8">
                                <span class="text-sm font-medium text-gray-700">
                                    Période:
                                </span>
                                <div class="flex items-center space-x-2">
                                    <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium min-w-[70px] h-10 transition-all duration-200 hover:scale-105">
                                        7d
                                    </button>
                                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium min-w-[70px] h-10 transition-all duration-200 hover:scale-105">
                                        30d
                                    </button>
                                    <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium min-w-[70px] h-10 transition-all duration-200 hover:scale-105">
                                        90d
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Desktop View -->
            <div class="responsive-test desktop-view">
                <div class="bg-white p-8 h-full">
                    <h2 class="text-lg font-semibold text-gray-700 mb-4 text-center">Desktop (1200px)</h2>
                    
                    <!-- Section Description - Desktop Layout -->
                    <div class="mb-8">
                        <div class="flex items-start justify-between">
                            <div class="flex-1 max-w-2xl">
                                <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
                                    Bon après-midi, Administrador! 👋
                                </h1>
                                <p class="text-lg lg:text-xl text-gray-600 mt-2 leading-relaxed">
                                    Voici ce qui se passe avec les prix du cajou aujourd'hui
                                </p>
                            </div>
                            
                            <!-- Period Selector - Desktop -->
                            <div class="flex flex-col items-end space-y-3 ml-8">
                                <span class="text-sm font-medium text-gray-700">
                                    Période:
                                </span>
                                <div class="flex items-center space-x-2">
                                    <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium min-w-[70px] h-10 transition-all duration-200 hover:scale-105">
                                        7d
                                    </button>
                                    <button class="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium min-w-[70px] h-10 transition-all duration-200 hover:scale-105">
                                        30d
                                    </button>
                                    <button class="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium min-w-[70px] h-10 transition-all duration-200 hover:scale-105">
                                        90d
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Instructions de test :</h3>
            <ul class="space-y-2 text-gray-700">
                <li>• <strong>Mobile (375px)</strong> : Vérifier que le texte et les boutons sont centrés verticalement</li>
                <li>• <strong>Tablet (768px)</strong> : Confirmer la transition vers le layout horizontal</li>
                <li>• <strong>Desktop (1200px)</strong> : Valider l'alignement horizontal et l'espacement</li>
                <li>• <strong>Responsivité</strong> : Redimensionner la fenêtre pour tester les breakpoints</li>
            </ul>
        </div>

        <div class="mt-6 text-center">
            <a href="http://localhost:3000/dashboard" target="_blank" 
               class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Ouvrir le vrai tableau de bord
            </a>
        </div>
    </div>
</body>
</html>
"@

# Sauvegarder le fichier HTML de test
$testHtml | Out-File -FilePath "test-dashboard-description.html" -Encoding UTF8

Write-Host "   ✅ Fichier de test créé : test-dashboard-description.html" -ForegroundColor Green

# Ouvrir le fichier de test dans le navigateur
Write-Host "4. Ouverture du fichier de test..." -ForegroundColor Yellow
Start-Process "test-dashboard-description.html"

Write-Host ""
Write-Host "=== Test terminé ===" -ForegroundColor Green
Write-Host ""
Write-Host "Le fichier de test a été ouvert dans votre navigateur." -ForegroundColor Cyan
Write-Host "Vous pouvez maintenant :" -ForegroundColor Cyan
Write-Host "1. Vérifier la responsivité sur les 3 vues (Mobile, Tablet, Desktop)" -ForegroundColor White
Write-Host "2. Tester le redimensionnement de la fenêtre" -ForegroundColor White
Write-Host "3. Comparer avec le vrai tableau de bord : http://localhost:3000/dashboard" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
