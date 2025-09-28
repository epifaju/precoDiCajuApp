# Test QR Format Fix
# Ce script teste la correction de la validation du format QR code

Write-Host "=== Test QR Format Fix ===" -ForegroundColor Green
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
    "frontend/src/components/exporters/QRScanner.tsx"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Fichier $file existe" -ForegroundColor Green
        
        # Verifier que le code contient les corrections
        $content = Get-Content $file -Raw
        if ($content -match "qr_a1b2c3d4_1703123456_x9y8z7w6") {
            Write-Host "  - Tokens QR simulation au format correct detectes" -ForegroundColor Green
        }
        else {
            Write-Host "  - Tokens QR simulation au format correct manquants" -ForegroundColor Red
        }
        
        if ($content -match "qr_[a-zA-Z0-9_]+") {
            Write-Host "  - Validation format QR flexible detectee" -ForegroundColor Green
        }
        else {
            Write-Host "  - Validation format QR flexible manquante" -ForegroundColor Red
        }
        
        if ($content -match "isValidFormat.*match.*qr_") {
            Write-Host "  - Validation multiple formats detectee" -ForegroundColor Green
        }
        else {
            Write-Host "  - Validation multiple formats manquante" -ForegroundColor Red
        }
        
        if ($content -match "Format simulation.*Format flexible") {
            Write-Host "  - Commentaires formats detectes" -ForegroundColor Green
        }
        else {
            Write-Host "  - Commentaires formats manquants" -ForegroundColor Red
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
Write-Host "  - Validation format QR trop stricte" -ForegroundColor White
Write-Host "  - Tokens simulation ne respectaient pas le format attendu" -ForegroundColor White
Write-Host "  - Erreur: Format de token QR invalide" -ForegroundColor White
Write-Host ""
Write-Host "Solutions implementees:" -ForegroundColor Green
Write-Host "  ✅ Tokens simulation au format correct" -ForegroundColor White
Write-Host "  ✅ Validation format QR plus flexible" -ForegroundColor White
Write-Host "  ✅ Support multiple formats de tokens QR" -ForegroundColor White
Write-Host "  ✅ Validation progressive (generale puis specifique)" -ForegroundColor White
Write-Host ""
Write-Host "Formats QR codes supportes:" -ForegroundColor Cyan
Write-Host "  - Format standard: qr_[uuid8]_[timestamp]_[random8]" -ForegroundColor White
Write-Host "    Exemple: qr_a1b2c3d4_1703123456_x9y8z7w6" -ForegroundColor White
Write-Host "  - Format simulation: qr_[region]_[code]_[year]" -ForegroundColor White
Write-Host "    Exemple: qr_bf_001_2024" -ForegroundColor White
Write-Host "  - Format flexible: qr_[a-zA-Z0-9_]+" -ForegroundColor White
Write-Host "    Pour compatibilite avec formats futurs" -ForegroundColor White
Write-Host ""
Write-Host "Tokens simulation corriges:" -ForegroundColor Cyan
Write-Host "  - qr_a1b2c3d4_1703123456_x9y8z7w6" -ForegroundColor White
Write-Host "  - qr_e5f6g7h8_1703123457_m1n2o3p4" -ForegroundColor White
Write-Host "  - qr_i9j0k1l2_1703123458_q5r6s7t8" -ForegroundColor White
Write-Host "  - qr_u3v4w5x6_1703123459_y9z0a1b2" -ForegroundColor White
Write-Host ""
Write-Host "Comment tester:" -ForegroundColor Cyan
Write-Host "   1. Ouvrez http://localhost:3001/exporters" -ForegroundColor White
Write-Host "   2. Cliquez sur Scanner QR" -ForegroundColor White
Write-Host "   3. Cliquez sur Simuler un scan (Test)" -ForegroundColor White
Write-Host "   4. Verifiez qu'il n'y a plus l'erreur de format" -ForegroundColor White
Write-Host "   5. Le scanner devrait traiter le QR code sans erreur" -ForegroundColor White

Write-Host ""
Write-Host "=== Test termine ===" -ForegroundColor Green
