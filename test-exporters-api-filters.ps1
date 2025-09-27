# Test API Exportateurs avec Filtres
# Ce script teste l'API des exportateurs avec différents filtres pour vérifier qu'il n'y a pas d'erreur cyclique

Write-Host "🔧 Test API Exportateurs - Filtres Avancés" -ForegroundColor Cyan
Write-Host "=" * 50

# Configuration
$baseUrl = "http://localhost:8080/api/v1"
$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

# Fonction pour tester une requête
function Test-ExportersRequest {
    param(
        [string]$Description,
        [string]$Url,
        [hashtable]$Params = @{}
    )
    
    Write-Host "`n🧪 $Description" -ForegroundColor Yellow
    
    try {
        $queryString = ""
        if ($Params.Count -gt 0) {
            $queryString = "?" + (($Params.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join "&")
        }
        
        $fullUrl = $Url + $queryString
        Write-Host "   URL: $fullUrl" -ForegroundColor Gray
        
        $response = Invoke-RestMethod -Uri $fullUrl -Method GET -Headers $headers -TimeoutSec 10
        
        if ($response -and $response.content) {
            Write-Host "   ✅ Succès: $($response.content.Count) exportateurs trouvés" -ForegroundColor Green
            Write-Host "   📊 Total: $($response.totalElements), Pages: $($response.totalPages)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Réponse vide ou invalide" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode
            Write-Host "   📊 Code de statut: $statusCode" -ForegroundColor Red
        }
        return $false
    }
}

# Vérifier si le backend est accessible
Write-Host "`n🔍 Vérification du backend..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible. Démarrez le backend d'abord." -ForegroundColor Red
    Write-Host "   Commande: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🚀 Début des tests API..." -ForegroundColor Cyan

# Test 1: Requête de base sans filtres
Test-ExportersRequest -Description "Test 1: Exportateurs sans filtres" -Url "$baseUrl/exportateurs" -Params @{
    page = 0
    size = 10
    sortBy = "nom"
    sortDir = "asc"
}

# Test 2: Filtre par région
Test-ExportersRequest -Description "Test 2: Filtre par région (Bafata)" -Url "$baseUrl/exportateurs" -Params @{
    page = 0
    size = 10
    sortBy = "nom"
    sortDir = "asc"
    regionCode = "BF"
}

# Test 3: Filtre par type
Test-ExportersRequest -Description "Test 3: Filtre par type (EXPORTATEUR)" -Url "$baseUrl/exportateurs" -Params @{
    page = 0
    size = 10
    sortBy = "nom"
    sortDir = "asc"
    type = "EXPORTATEUR"
}

# Test 4: Filtre par statut
Test-ExportersRequest -Description "Test 4: Filtre par statut (ACTIF)" -Url "$baseUrl/exportateurs" -Params @{
    page = 0
    size = 10
    sortBy = "nom"
    sortDir = "asc"
    statut = "ACTIF"
}

# Test 5: Filtre par nom (recherche)
Test-ExportersRequest -Description "Test 5: Filtre par nom (recherche)" -Url "$baseUrl/exportateurs" -Params @{
    page = 0
    size = 10
    sortBy = "nom"
    sortDir = "asc"
    nom = "test"
}

# Test 6: Filtres combinés
Test-ExportersRequest -Description "Test 6: Filtres combinés (région + type)" -Url "$baseUrl/exportateurs" -Params @{
    page = 0
    size = 10
    sortBy = "nom"
    sortDir = "asc"
    regionCode = "BF"
    type = "EXPORTATEUR"
}

# Test 7: Tri par date d'expiration
Test-ExportersRequest -Description "Test 7: Tri par date d'expiration" -Url "$baseUrl/exportateurs" -Params @{
    page = 0
    size = 10
    sortBy = "dateExpiration"
    sortDir = "desc"
}

# Test 8: Pagination
Test-ExportersRequest -Description "Test 8: Pagination (page 1)" -Url "$baseUrl/exportateurs" -Params @{
    page = 1
    size = 5
    sortBy = "nom"
    sortDir = "asc"
}

Write-Host "`n📊 Résumé des tests:" -ForegroundColor Cyan
Write-Host "✅ Tous les tests API ont été exécutés" -ForegroundColor Green
Write-Host "🔍 Vérifiez les résultats ci-dessus pour détecter d'éventuelles erreurs" -ForegroundColor Yellow
Write-Host "💡 Si tous les tests passent, l'erreur cyclique est corrigée côté backend" -ForegroundColor Green

Write-Host "`n🌐 Testez maintenant l'interface utilisateur:" -ForegroundColor Yellow
Write-Host "   Ouvrez http://localhost:3001/exporters dans votre navigateur" -ForegroundColor White
Write-Host "   Utilisez les filtres avancés et vérifiez la console du navigateur" -ForegroundColor White

Write-Host "`n✨ Tests terminés!" -ForegroundColor Green
