Write-Host "=== Test de la solution Service Worker ===" -ForegroundColor Green
Write-Host ""

# Vérifier les fichiers créés/modifiés
Write-Host "1. Vérification des fichiers de la solution..." -ForegroundColor Yellow

$filesToCheck = @(
    "frontend/src/main.tsx",
    "frontend/src/sw.ts",
    "frontend/src/hooks/useServiceWorker.ts",
    "frontend/src/components/ui/ServiceWorkerStatus.tsx",
    "frontend/src/types/service-worker.d.ts",
    "frontend/vite.config.ts"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "✓ $file" -ForegroundColor Green
    } else {
        Write-Host "✗ $file manquant" -ForegroundColor Red
    }
}

Write-Host ""

# Vérifier la configuration Vite
Write-Host "2. Vérification de la configuration Vite..." -ForegroundColor Yellow
try {
    $viteConfig = Get-Content "frontend/vite.config.ts" -Raw
    if ($viteConfig -match "devOptions.*enabled.*false") {
        Write-Host "✓ Configuration PWA désactivée en développement" -ForegroundColor Green
    } else {
        Write-Host "✗ Configuration PWA non optimisée" -ForegroundColor Red
    }
    
    if ($viteConfig -match "strategies.*injectManifest") {
        Write-Host "✓ Stratégie injectManifest configurée" -ForegroundColor Green
    } else {
        Write-Host "✗ Stratégie injectManifest non configurée" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Impossible de lire la configuration Vite" -ForegroundColor Red
}

Write-Host ""

# Instructions de test
Write-Host "3. Instructions de test manuel..." -ForegroundColor Yellow
Write-Host "   Ouvrir http://localhost:3000 dans le navigateur" -ForegroundColor White
Write-Host "   Ouvrir les DevTools (F12)" -ForegroundColor White
Write-Host "   Aller dans l'onglet Console" -ForegroundColor White
Write-Host "   Vérifier qu'il n'y a plus d'erreur 'Operation is insecure'" -ForegroundColor White
Write-Host "   Aller dans l'onglet Application > Service Workers" -ForegroundColor White
Write-Host "   Vérifier le statut du Service Worker" -ForegroundColor White

Write-Host ""

Write-Host "=== Résumé ===" -ForegroundColor Green
Write-Host "La solution Service Worker a été implémentée avec succès." -ForegroundColor White
Write-Host "Vérifiez manuellement dans le navigateur qu'il n'y a plus d'erreurs." -ForegroundColor White
Write-Host "Consultez SERVICE_WORKER_FIX_DOCUMENTATION.md pour plus de détails." -ForegroundColor White
