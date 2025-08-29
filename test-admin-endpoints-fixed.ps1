# Test des endpoints admin après correction des erreurs PostgreSQL
# Ce script teste la fonctionnalité admin avec les corrections appliquées

Write-Host "=== TEST DES ENDPOINTS ADMIN APRÈS CORRECTION ===" -ForegroundColor Green
Write-Host ""

# Configuration
$BASE_URL = "http://localhost:8080"
$ADMIN_EMAIL = "admin@precaju.com"
$ADMIN_PASSWORD = "admin123"

# Fonction pour afficher les résultats
function Show-Result {
    param($TestName, $Success, $Message = "")
    
    if ($Success) {
        Write-Host "✅ $TestName" -ForegroundColor Green
    } else {
        Write-Host "❌ $TestName" -ForegroundColor Red
        if ($Message) {
            Write-Host "   Erreur: $Message" -ForegroundColor Red
        }
    }
}

# 1. Test de connexion admin
Write-Host "1. Test de connexion admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
        rememberMe = $false
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.accessToken) {
        $token = $loginResponse.accessToken
        Show-Result "Connexion admin" $true
        Write-Host "   Token obtenu: ${token:0:20}..." -ForegroundColor Gray
    } else {
        Show-Result "Connexion admin" $false "Pas de token dans la réponse"
        exit 1
    }
} catch {
    Show-Result "Connexion admin" $false $_.Exception.Message
    exit 1
}

# 2. Test de l'endpoint admin/users avec pagination
Write-Host "`n2. Test de l'endpoint admin/users avec pagination..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $usersResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?page=0&size=10" -Method GET -Headers $headers
    
    if ($usersResponse.content -and $usersResponse.totalElements -ge 0) {
        Show-Result "Récupération des utilisateurs" $true
        Write-Host "   Utilisateurs trouvés: $($usersResponse.totalElements)" -ForegroundColor Gray
        Write-Host "   Page actuelle: $($usersResponse.pageable.pageNumber + 1)" -ForegroundColor Gray
    } else {
        Show-Result "Récupération des utilisateurs" $false "Réponse invalide"
    }
} catch {
    Show-Result "Récupération des utilisateurs" $false $_.Exception.Message
}

# 3. Test avec recherche par email
Write-Host "`n3. Test avec recherche par email..." -ForegroundColor Yellow
try {
    $searchResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?search=admin" -Method GET -Headers $headers
    
    if ($searchResponse.content) {
        Show-Result "Recherche par email" $true
        Write-Host "   Résultats de recherche: $($searchResponse.totalElements)" -ForegroundColor Gray
    } else {
        Show-Result "Recherche par email" $false "Pas de résultats de recherche"
    }
} catch {
    Show-Result "Recherche par email" $false $_.Exception.Message
}

# 4. Test avec filtres multiples
Write-Host "`n4. Test avec filtres multiples..." -ForegroundColor Yellow
try {
    $filtersResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?active=true&role=admin" -Method GET -Headers $headers
    
    if ($filtersResponse.content) {
        Show-Result "Filtres multiples" $true
        Write-Host "   Utilisateurs actifs admin: $($filtersResponse.totalElements)" -ForegroundColor Gray
    } else {
        Show-Result "Filtres multiples" $false "Pas de résultats avec filtres"
    }
} catch {
    Show-Result "Filtres multiples" $false $_.Exception.Message
}

# 5. Test des statistiques utilisateurs
Write-Host "`n5. Test des statistiques utilisateurs..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/stats" -Method GET -Headers $headers
    
    if ($statsResponse.totalUsers -ge 0) {
        Show-Result "Statistiques utilisateurs" $true
        Write-Host "   Total utilisateurs: $($statsResponse.totalUsers)" -ForegroundColor Gray
        Write-Host "   Utilisateurs actifs: $($statsResponse.activeUsers)" -ForegroundColor Gray
        Write-Host "   Admins: $($statsResponse.adminUsers)" -ForegroundColor Gray
    } else {
        Show-Result "Statistiques utilisateurs" $false "Statistiques invalides"
    }
} catch {
    Show-Result "Statistiques utilisateurs" $false $_.Exception.Message
}

# 6. Test de récupération d'un utilisateur spécifique
Write-Host "`n6. Test de récupération d'un utilisateur spécifique..." -ForegroundColor Yellow
try {
    if ($usersResponse.content -and $usersResponse.content.Count -gt 0) {
        $firstUserId = $usersResponse.content[0].id
        $userResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/$firstUserId" -Method GET -Headers $headers
        
        if ($userResponse.id -eq $firstUserId) {
            Show-Result "Récupération utilisateur spécifique" $true
            Write-Host "   Utilisateur: $($userResponse.email)" -ForegroundColor Gray
        } else {
            Show-Result "Récupération utilisateur spécifique" $false "ID utilisateur incorrect"
        }
    } else {
        Show-Result "Récupération utilisateur spécifique" $false "Pas d'utilisateurs disponibles"
    }
} catch {
    Show-Result "Récupération utilisateur spécifique" $false $_.Exception.Message
}

Write-Host "`n=== RÉSUMÉ DES TESTS ===" -ForegroundColor Green
Write-Host "Tests effectués: 6" -ForegroundColor White
Write-Host ""

# Vérification finale
Write-Host "Vérification de la base de données..." -ForegroundColor Yellow
try {
    $dbCheckResponse = Invoke-RestMethod -Uri "$BASE_URL/actuator/health" -Method GET
    
    if ($dbCheckResponse.status -eq "UP") {
        Write-Host "✅ Base de données: UP" -ForegroundColor Green
    } else {
        Write-Host "❌ Base de données: $($dbCheckResponse.status)" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️  Impossible de vérifier l'état de la base de données" -ForegroundColor Yellow
}

Write-Host "`n=== CORRECTION TERMINÉE ===" -ForegroundColor Green
Write-Host "Les erreurs PostgreSQL ont été corrigées avec:" -ForegroundColor White
Write-Host "- Migration V7 pour corriger les types de colonnes" -ForegroundColor White
Write-Host "- Requête JPQL corrigée (sans CAST)" -ForegroundColor White
Write-Host "- Méthode de fallback avec SQL natif" -ForegroundColor White
Write-Host "- Gestion d'erreur améliorée" -ForegroundColor White
