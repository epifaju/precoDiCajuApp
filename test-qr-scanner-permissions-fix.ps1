# Test QR Scanner Fix - Correction erreur permissions
# Ce script teste la correction de l'erreur navigator.permissions.addEventListener

Write-Host "=== Test QR Scanner Fix - Correction erreur permissions ===" -ForegroundColor Green
Write-Host ""

# Verifier que le frontend est en cours d'execution
Write-Host "1. Verification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend accessible sur http://localhost:3001" -ForegroundColor Green
    }
    else {
        Write-Host "Frontend non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
        Write-Host "Essayons le port 5173..." -ForegroundColor Yellow
        
        $response5173 = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -UseBasicParsing
        if ($response5173.StatusCode -eq 200) {
            Write-Host "Frontend accessible sur http://localhost:5173" -ForegroundColor Green
        }
        else {
            Write-Host "Frontend non accessible sur les deux ports" -ForegroundColor Red
            exit 1
        }
    }
}
catch {
    Write-Host "Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Demarrez le frontend avec: cd frontend && npm run dev" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "2. Test de la page Exportateurs..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/exporters" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Page Exportateurs accessible sur port 3001" -ForegroundColor Green
    }
    else {
        $response5173 = Invoke-WebRequest -Uri "http://localhost:5173/exporters" -TimeoutSec 5 -UseBasicParsing
        if ($response5173.StatusCode -eq 200) {
            Write-Host "Page Exportateurs accessible sur port 5173" -ForegroundColor Green
        }
        else {
            Write-Host "Page Exportateurs non accessible" -ForegroundColor Red
        }
    }
}
catch {
    Write-Host "Page Exportateurs non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "3. Verification des corrections apportees..." -ForegroundColor Yellow

# Verifier que les fichiers ont ete modifies
$files = @(
    "frontend/src/components/exporters/QRScanner.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fichier $file existe" -ForegroundColor Green
        
        # Verifier que le code contient les corrections
        $content = Get-Content $file -Raw
        if ($content -match "permissionCheckInterval") {
            Write-Host "  - Correction polling permissions detectee" -ForegroundColor Green
        }
        else {
            Write-Host "  - Correction polling permissions manquante" -ForegroundColor Red
        }
        
        if ($content -match "addEventListener.*permissions") {
            Write-Host "  - Code addEventListener detecte (potentiel probleme)" -ForegroundColor Yellow
        }
        else {
            Write-Host "  - Code addEventListener supprime" -ForegroundColor Green
        }
    }
    else {
        Write-Host "Fichier $file manquant" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Resume de la correction ===" -ForegroundColor Green
Write-Host ""
Write-Host "Probleme identifie:" -ForegroundColor Red
Write-Host "  - navigator.permissions.addEventListener n'est pas une fonction" -ForegroundColor White
Write-Host "  - Cette API n'est pas supportee dans tous les navigateurs" -ForegroundColor White
Write-Host ""
Write-Host "Solution implementee:" -ForegroundColor Green
Write-Host "  - Remplacement par un polling toutes les 2 secondes" -ForegroundColor White
Write-Host "  - Verification periodique des permissions camera" -ForegroundColor White
Write-Host "  - Gestion d'erreur robuste avec try/catch" -ForegroundColor White
Write-Host "  - Nettoyage automatique des intervals" -ForegroundColor White
Write-Host ""
Write-Host "Avantages de la nouvelle approche:" -ForegroundColor Cyan
Write-Host "  - Compatible avec tous les navigateurs" -ForegroundColor White
Write-Host "  - Pas de dependance sur des APIs experimentales" -ForegroundColor White
Write-Host "  - Detection fiable des changements de permissions" -ForegroundColor White
Write-Host "  - Performance acceptable (verification toutes les 2s)" -ForegroundColor White
Write-Host ""
Write-Host "Comment tester:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:3001/exporters ou http://localhost:5173/exporters" -ForegroundColor White
Write-Host "   2. Cliquez sur Scanner QR" -ForegroundColor White
Write-Host "   3. Verifiez qu'il n'y a plus d'erreur dans la console" -ForegroundColor White
Write-Host "   4. Testez l'autorisation/refus de permissions" -ForegroundColor White

Write-Host ""
Write-Host "=== Test termine ===" -ForegroundColor Green
