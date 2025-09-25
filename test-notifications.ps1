# Script de test pour les notifications push
# test-notifications.ps1

Write-Host "🔔 Test du système de notifications push" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Variables
$backendUrl = "http://localhost:8080"
$frontendUrl = "http://localhost:3000"

# Fonction pour tester un endpoint
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [string]$Body = $null
    )
    
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
        }
        
        if ($Body) {
            $params.Body = $Body
            $params.ContentType = "application/json"
        }
        
        $response = Invoke-RestMethod @params
        return @{ Success = $true; Data = $response }
    }
    catch {
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

# Test 1: Vérifier que le backend est accessible
Write-Host "`n1. Test de connectivité backend..." -ForegroundColor Yellow
$healthTest = Test-Endpoint "$backendUrl/actuator/health"
if ($healthTest.Success) {
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} else {
    Write-Host "❌ Backend non accessible: $($healthTest.Error)" -ForegroundColor Red
    exit 1
}

# Test 2: Vérifier l'endpoint VAPID
Write-Host "`n2. Test de l'endpoint VAPID..." -ForegroundColor Yellow
$vapidTest = Test-Endpoint "$backendUrl/api/v1/notifications/vapid-key"
if ($vapidTest.Success) {
    Write-Host "✅ Endpoint VAPID accessible" -ForegroundColor Green
    Write-Host "   Clé publique: $($vapidTest.Data.publicKey.Substring(0, 20))..." -ForegroundColor Gray
} else {
    Write-Host "❌ Endpoint VAPID non accessible: $($vapidTest.Error)" -ForegroundColor Red
}

# Test 3: Vérifier la base de données
Write-Host "`n3. Test de la base de données..." -ForegroundColor Yellow
$dbTest = Test-Endpoint "$backendUrl/api/v1/regions"
if ($dbTest.Success) {
    Write-Host "✅ Base de données accessible" -ForegroundColor Green
    Write-Host "   Régions trouvées: $($dbTest.Data.Count)" -ForegroundColor Gray
} else {
    Write-Host "❌ Base de données non accessible: $($dbTest.Error)" -ForegroundColor Red
}

# Test 4: Vérifier le frontend
Write-Host "`n4. Test de connectivité frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $frontendUrl -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend retourne le code: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Vérifier les migrations
Write-Host "`n5. Test des migrations de base de données..." -ForegroundColor Yellow
$migrationTest = Test-Endpoint "$backendUrl/api/v1/notifications/config"
if ($migrationTest.Success) {
    Write-Host "✅ Tables de notifications créées" -ForegroundColor Green
    if ($migrationTest.Data) {
        Write-Host "   Seuil configuré: $($migrationTest.Data.seuilPourcentage)%" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Tables de notifications non trouvées: $($migrationTest.Error)" -ForegroundColor Red
    Write-Host "   Vérifiez que la migration V10 a été appliquée" -ForegroundColor Yellow
}

# Test 6: Test de modification de prix (simulation)
Write-Host "`n6. Test de simulation de variation de prix..." -ForegroundColor Yellow
Write-Host "   Pour tester les notifications, modifiez un prix avec une variation > 10%" -ForegroundColor Gray
Write-Host "   Exemple SQL:" -ForegroundColor Gray
Write-Host "   UPDATE prices SET price_fcfa = price_fcfa * 1.15 WHERE id = 'your-price-id';" -ForegroundColor Gray

# Résumé
Write-Host "`n📊 Résumé des tests" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan

$tests = @(
    @{ Name = "Backend"; Result = $healthTest.Success },
    @{ Name = "VAPID"; Result = $vapidTest.Success },
    @{ Name = "Base de données"; Result = $dbTest.Success },
    @{ Name = "Frontend"; Result = $response.StatusCode -eq 200 },
    @{ Name = "Migrations"; Result = $migrationTest.Success }
)

$passed = 0
$total = $tests.Count

foreach ($test in $tests) {
    $status = if ($test.Result) { "✅" } else { "❌" }
    $color = if ($test.Result) { "Green" } else { "Red" }
    Write-Host "$status $($test.Name)" -ForegroundColor $color
    if ($test.Result) { $passed++ }
}

Write-Host "`nRésultat: $passed/$total tests réussis" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

if ($passed -eq $total) {
    Write-Host "`n🎉 Tous les tests sont passés ! Le système de notifications est prêt." -ForegroundColor Green
    Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "1. Ouvrez $frontendUrl dans votre navigateur" -ForegroundColor White
    Write-Host "2. Connectez-vous à votre compte" -ForegroundColor White
    Write-Host "3. Allez dans Profil > Paramètres" -ForegroundColor White
    Write-Host "4. Activez les notifications de prix" -ForegroundColor White
    Write-Host "5. Testez en modifiant un prix avec une variation > 10%" -ForegroundColor White
} else {
    Write-Host "`n⚠️  Certains tests ont échoué. Vérifiez la configuration." -ForegroundColor Yellow
    Write-Host "`n🔧 Actions recommandées:" -ForegroundColor Cyan
    Write-Host "1. Vérifiez que le backend est démarré" -ForegroundColor White
    Write-Host "2. Vérifiez que la base de données est accessible" -ForegroundColor White
    Write-Host "3. Vérifiez que les migrations ont été appliquées" -ForegroundColor White
    Write-Host "4. Vérifiez la configuration VAPID" -ForegroundColor White
}

Write-Host "`n📚 Documentation complète: NOTIFICATIONS_SETUP.md" -ForegroundColor Cyan







