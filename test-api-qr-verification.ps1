# Test API QR Verification avec Exportateurs Reels
# Ce script cree des exportateurs de test et teste l'API reelle

Write-Host "=== Test API QR Verification avec Exportateurs Reels ===" -ForegroundColor Green
Write-Host ""

# Verifier que le backend est en cours d'execution
Write-Host "1. Verification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/exportateurs" -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend accessible sur http://localhost:8080" -ForegroundColor Green
    }
    else {
        Write-Host "Backend non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
        Write-Host "Demarrez le backend avec: cd backend && ./mvnw spring-boot:run" -ForegroundColor Cyan
        exit 1
    }
}
catch {
    Write-Host "Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Demarrez le backend avec: cd backend && ./mvnw spring-boot:run" -ForegroundColor Cyan
    exit 1
}

Write-Host ""
Write-Host "2. Creation des exportateurs de test..." -ForegroundColor Yellow

# Executer le script SQL pour creer les exportateurs de test
try {
    # Verifier si PostgreSQL est accessible
    $env:PGPASSWORD = "password"
    $psqlCmd = "psql -h localhost -p 5432 -U postgres -d precaju_db -f create-test-exporters.sql"
    
    Write-Host "Execution du script SQL..." -ForegroundColor Cyan
    Invoke-Expression $psqlCmd
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Exportateurs de test crees avec succes" -ForegroundColor Green
    }
    else {
        Write-Host "Erreur lors de la creation des exportateurs" -ForegroundColor Red
        Write-Host "Verifiez que PostgreSQL est demarre et accessible" -ForegroundColor Yellow
        exit 1
    }
}
catch {
    Write-Host "Erreur lors de l'execution du script SQL: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Verifiez que PostgreSQL est demarre et accessible" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "3. Test de l'API de verification QR..." -ForegroundColor Yellow

# Tokens QR de test
$testTokens = @(
    @{
        token       = "qr_a1b2c3d4_1703123456_x9y8z7w6"
        expected    = "SUCCESS"
        description = "Exportateur Test Bissau - ACTIF"
    },
    @{
        token       = "qr_e5f6g7h8_1703123457_m1n2o3p4"
        expected    = "SUCCESS"
        description = "Exportateur Test Gabu - ACTIF"
    },
    @{
        token       = "qr_i9j0k1l2_1703123458_q5r6s7t8"
        expected    = "EXPIRED"
        description = "Exportateur Test Cacheu - EXPIRE"
    },
    @{
        token       = "qr_u3v4w5x6_1703123459_y9z0a1b2"
        expected    = "SUSPENDED"
        description = "Exportateur Test Oio - SUSPENDU"
    },
    @{
        token       = "qr_c7d8e9f0_1703123460_z1a2b3c4"
        expected    = "SUCCESS"
        description = "Exportateur Test Quinara - ACTIF"
    },
    @{
        token       = "qr_invalid_token_12345678_abcdefgh"
        expected    = "NOT_FOUND"
        description = "Token QR invalide (test erreur)"
    }
)

$successCount = 0
$totalTests = $testTokens.Count

foreach ($test in $testTokens) {
    Write-Host ""
    Write-Host "Test: $($test.description)" -ForegroundColor Cyan
    Write-Host "Token: $($test.token)" -ForegroundColor Gray
    
    try {
        $url = "http://localhost:8080/api/v1/exportateurs/verify/$($test.token)"
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
            Write-Host "Result: $($result.result)" -ForegroundColor Green
            Write-Host "Success: $($result.success)" -ForegroundColor Green
            Write-Host "Message: $($result.message)" -ForegroundColor Green
            
            if ($result.result -eq $test.expected) {
                Write-Host "✅ Test reussi - Resultat attendu" -ForegroundColor Green
                $successCount++
            }
            else {
                Write-Host "❌ Test echoue - Resultat inattendu (attendu: $($test.expected))" -ForegroundColor Red
            }
        }
        elseif ($response.StatusCode -eq 404) {
            $result = $response.Content | ConvertFrom-Json
            Write-Host "Status: $($response.StatusCode)" -ForegroundColor Yellow
            Write-Host "Result: $($result.result)" -ForegroundColor Yellow
            Write-Host "Success: $($result.success)" -ForegroundColor Yellow
            Write-Host "Message: $($result.message)" -ForegroundColor Yellow
            
            if ($result.result -eq $test.expected) {
                Write-Host "✅ Test reussi - Resultat attendu (404)" -ForegroundColor Green
                $successCount++
            }
            else {
                Write-Host "❌ Test echoue - Resultat inattendu (attendu: $($test.expected))" -ForegroundColor Red
            }
        }
        else {
            Write-Host "Status: $($response.StatusCode)" -ForegroundColor Red
            Write-Host "❌ Test echoue - Status code inattendu" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== Resume des tests ===" -ForegroundColor Green
Write-Host "Tests reussis: $successCount / $totalTests" -ForegroundColor $(if ($successCount -eq $totalTests) { "Green" } else { "Yellow" })

if ($successCount -eq $totalTests) {
    Write-Host "✅ Tous les tests sont passes!" -ForegroundColor Green
}
else {
    Write-Host "⚠️ Certains tests ont echoue" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Comment tester dans le frontend ===" -ForegroundColor Cyan
Write-Host "1. Ouvrez http://localhost:3001/exporters" -ForegroundColor White
Write-Host "2. Cliquez sur Scanner QR" -ForegroundColor White
Write-Host "3. Utilisez un generateur QR code avec ces tokens:" -ForegroundColor White
Write-Host ""
Write-Host "Tokens QR valides pour test:" -ForegroundColor Yellow
Write-Host "  - qr_a1b2c3d4_1703123456_x9y8z7w6 (Exportateur Test Bissau - ACTIF)" -ForegroundColor White
Write-Host "  - qr_e5f6g7h8_1703123457_m1n2o3p4 (Exportateur Test Gabu - ACTIF)" -ForegroundColor White
Write-Host "  - qr_c7d8e9f0_1703123460_z1a2b3c4 (Exportateur Test Quinara - ACTIF)" -ForegroundColor White
Write-Host ""
Write-Host "Tokens QR pour tester les erreurs:" -ForegroundColor Yellow
Write-Host "  - qr_i9j0k1l2_1703123458_q5r6s7t8 (Exportateur Test Cacheu - EXPIRE)" -ForegroundColor White
Write-Host "  - qr_u3v4w5x6_1703123459_y9z0a1b2 (Exportateur Test Oio - SUSPENDU)" -ForegroundColor White
Write-Host "  - qr_invalid_token_12345678_abcdefgh (Token invalide)" -ForegroundColor White
Write-Host ""
Write-Host "4. Scannez le QR code et verifiez le resultat" -ForegroundColor White
Write-Host "5. L'API devrait retourner les bonnes informations d'exportateur" -ForegroundColor White

Write-Host ""
Write-Host "=== Test termine ===" -ForegroundColor Green
