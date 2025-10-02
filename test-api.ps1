# Script de test pour l'API Precaju Phase 2

Write-Host "=== TEST API PRECAJU - PHASE 2 ===" -ForegroundColor Green

# Test 1: Régions
Write-Host "`n1. Test des Régions de Guinée-Bissau:" -ForegroundColor Yellow
try {
    $regions = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/regions" -UseBasicParsing
    $regionsData = $regions.Content | ConvertFrom-Json
    Write-Host "✅ SUCCÈS - ${regionsData.Count} régions trouvées:" -ForegroundColor Green
    $regionsData | ForEach-Object { Write-Host "   - $($_.code): $($_.namePt)" }
} catch {
    Write-Host "❌ ERREUR - Régions: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Qualités
Write-Host "`n2. Test des Qualités de Cajou:" -ForegroundColor Yellow
try {
    $qualities = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/qualities" -UseBasicParsing
    $qualitiesData = $qualities.Content | ConvertFrom-Json
    Write-Host "✅ SUCCÈS - ${qualitiesData.Count} qualités trouvées:" -ForegroundColor Green
    $qualitiesData | ForEach-Object { Write-Host "   - $($_.code): $($_.namePt)" }
} catch {
    Write-Host "❌ ERREUR - Qualités: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Enregistrement utilisateur
Write-Host "`n3. Test d'Enregistrement Utilisateur:" -ForegroundColor Yellow
try {
    $registerBody = @{
        email = "testapi@example.com"
        password = "password123"
        fullName = "Test API User"
    } | ConvertTo-Json

    $register = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/register" -Method POST -ContentType "application/json" -Body $registerBody -UseBasicParsing
    $registerData = $register.Content | ConvertFrom-Json
    Write-Host "✅ SUCCÈS - Utilisateur créé:" -ForegroundColor Green
    Write-Host "   - Email: $($registerData.user.email)"
    Write-Host "   - Nom: $($registerData.user.fullName)"
    Write-Host "   - Token généré: $($registerData.access_token.Length) caractères"
    
    # Sauvegarder le token pour les tests suivants
    $global:accessToken = $registerData.access_token
    
} catch {
    Write-Host "❌ ERREUR - Enregistrement: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Login
Write-Host "`n4. Test de Connexion:" -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "testapi@example.com"
        password = "password123"
    } | ConvertTo-Json

    $login = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody -UseBasicParsing
    $loginData = $login.Content | ConvertFrom-Json
    Write-Host "✅ SUCCÈS - Connexion réussie:" -ForegroundColor Green
    Write-Host "   - Token: $($loginData.access_token.Length) caractères"
    Write-Host "   - Utilisateur: $($loginData.user.fullName)"
    
    $global:accessToken = $loginData.access_token
    
} catch {
    Write-Host "❌ ERREUR - Connexion: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Création de prix (authentifié)
Write-Host "`n5. Test de Création de Prix (authentifié):" -ForegroundColor Yellow
if ($global:accessToken) {
    try {
        $priceBody = @{
            regionCode = "BF"
            qualityGrade = "W180"
            priceFcfa = 2500.00
            recordedDate = (Get-Date).ToString("yyyy-MM-dd")
            sourceName = "Test Market API"
            sourceType = "market"
            notes = "Test price via API"
        } | ConvertTo-Json

        $headers = @{
            "Authorization" = "Bearer $global:accessToken"
            "Content-Type" = "application/json"
        }

        $price = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices" -Method POST -Headers $headers -Body $priceBody -UseBasicParsing
        $priceData = $price.Content | ConvertFrom-Json
        Write-Host "✅ SUCCÈS - Prix créé:" -ForegroundColor Green
        Write-Host "   - ID: $($priceData.id)"
        Write-Host "   - Région: $($priceData.regionName)"
        Write-Host "   - Qualité: $($priceData.qualityName)"
        Write-Host "   - Prix: $($priceData.priceFcfa) FCFA"
        
    } catch {
        Write-Host "❌ ERREUR - Création prix: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  SAUTÉ - Pas de token d'authentification" -ForegroundColor Yellow
}

# Test 6: Liste des prix
Write-Host "`n6. Test de Liste des Prix:" -ForegroundColor Yellow
try {
    $pricesList = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?size=3" -UseBasicParsing
    $pricesData = $pricesList.Content | ConvertFrom-Json
    Write-Host "✅ SUCCÈS - ${pricesData.totalElements} prix trouvés:" -ForegroundColor Green
    if ($pricesData.content) {
        $pricesData.content | ForEach-Object { 
            Write-Host "   - $($_.regionName): $($_.priceFcfa) FCFA ($($_.qualityName))" 
        }
    }
} catch {
    Write-Host "❌ ERREUR - Liste prix: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Statistiques
Write-Host "`n7. Test des Statistiques:" -ForegroundColor Yellow
try {
    $stats = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices/stats" -UseBasicParsing
    $statsData = $stats.Content | ConvertFrom-Json
    Write-Host "✅ SUCCÈS - Statistiques générées:" -ForegroundColor Green
    Write-Host "   - Total prix: $($statsData.totalPrices)"
    Write-Host "   - Prix moyen: $($statsData.averagePrice) FCFA"
    Write-Host "   - Prix vérifés: $($statsData.verifiedPrices)"
} catch {
    Write-Host "❌ ERREUR - Statistiques: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== FIN DES TESTS ===" -ForegroundColor Green


















