# Test QR Scanner Loader Fix
# Ce script teste la correction du probleme de loader infini

Write-Host "=== Test QR Scanner Loader Fix ===" -ForegroundColor Green
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
Write-Host "2. Verification des corrections apportees..." -ForegroundColor Yellow

# Verifier que les fichiers ont ete modifies
$files = @(
    "frontend/src/components/exporters/QRScanner.tsx",
    "frontend/src/i18n/locales/fr.json",
    "frontend/src/i18n/locales/en.json",
    "frontend/src/i18n/locales/pt.json"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fichier $file existe" -ForegroundColor Green
        
        # Verifier que le code contient les corrections
        $content = Get-Content $file -Raw
        if ($file -like "*QRScanner.tsx") {
            if ($content -match "setTimeout.*10000") {
                Write-Host "  - Timeout de securite detecte" -ForegroundColor Green
            }
            else {
                Write-Host "  - Timeout de securite manquant" -ForegroundColor Red
            }
            
            if ($content -match "clearTimeout.*timeoutId") {
                Write-Host "  - Nettoyage timeout detecte" -ForegroundColor Green
            }
            else {
                Write-Host "  - Nettoyage timeout manquant" -ForegroundColor Red
            }
            
            if ($content -match "setIsProcessing.*false") {
                Write-Host "  - Gestion setIsProcessing detectee" -ForegroundColor Green
            }
            else {
                Write-Host "  - Gestion setIsProcessing manquante" -ForegroundColor Red
            }
            
            if ($content -match "cancel.*Annuler") {
                Write-Host "  - Bouton annuler detecte" -ForegroundColor Green
            }
            else {
                Write-Host "  - Bouton annuler manquant" -ForegroundColor Red
            }
        }
        else {
            if ($content -match "camera_timeout") {
                Write-Host "  - Traduction timeout detectee" -ForegroundColor Green
            }
            else {
                Write-Host "  - Traduction timeout manquante" -ForegroundColor Red
            }
            
            if ($content -match "cancel.*Annuler|Cancel|Cancelar") {
                Write-Host "  - Traduction bouton annuler detectee" -ForegroundColor Green
            }
            else {
                Write-Host "  - Traduction bouton annuler manquante" -ForegroundColor Red
            }
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
Write-Host "  - Loader infini 'Traitement en cours...'" -ForegroundColor White
Write-Host "  - Pas de gestion d'erreur robuste" -ForegroundColor White
Write-Host "  - Pas de timeout de securite" -ForegroundColor White
Write-Host "  - Pas de bouton pour annuler" -ForegroundColor White
Write-Host ""
Write-Host "Solutions implementees:" -ForegroundColor Green
Write-Host "  - Timeout de securite de 10 secondes" -ForegroundColor White
Write-Host "  - Gestion robuste de setIsProcessing(false)" -ForegroundColor White
Write-Host "  - Nettoyage automatique des timeouts" -ForegroundColor White
Write-Host "  - Bouton 'Annuler' pour sortir du loader" -ForegroundColor White
Write-Host "  - Verification de videoRef.current" -ForegroundColor White
Write-Host "  - Messages d'erreur specifiques" -ForegroundColor White
Write-Host ""
Write-Host "Nouvelles traductions ajoutees:" -ForegroundColor Cyan
Write-Host "  - camera_timeout: Timeout d'acces a la camera" -ForegroundColor White
Write-Host "  - video_element_error: Erreur d'initialisation video" -ForegroundColor White
Write-Host "  - cancel: Annuler" -ForegroundColor White
Write-Host "  - cancelled: Operation annulee" -ForegroundColor White
Write-Host ""
Write-Host "Comment tester:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:3001/exporters" -ForegroundColor White
Write-Host "   2. Cliquez sur Scanner QR" -ForegroundColor White
Write-Host "   3. Si le loader reste bloque, cliquez sur 'Annuler'" -ForegroundColor White
Write-Host "   4. Le timeout de 10s devrait aussi arreter le loader automatiquement" -ForegroundColor White
Write-Host "   5. Verifiez les messages d'erreur specifiques" -ForegroundColor White

Write-Host ""
Write-Host "=== Test termine ===" -ForegroundColor Green
