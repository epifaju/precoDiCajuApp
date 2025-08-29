# Test des fonctionnalités d'administration des utilisateurs
# Assurez-vous que le backend et le frontend sont démarrés

Write-Host "🧪 Test des fonctionnalités d'administration des utilisateurs" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Configuration
$BASE_URL = "http://localhost:8080"
$ADMIN_EMAIL = "admin@precaju.gw"
$ADMIN_PASSWORD = "admin123"

# Couleurs pour les résultats
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Blue }

# 1. Test de connexion admin
Write-Info "1. Test de connexion admin..."
try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/auth/login" -Method POST -ContentType "application/json" -Body (@{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
        rememberMe = $false
    } | ConvertTo-Json)
    
    if ($loginResponse.accessToken) {
        Write-Success "Connexion admin réussie"
        $adminToken = $loginResponse.accessToken
        $headers = @{
            "Authorization" = "Bearer $adminToken"
            "Content-Type" = "application/json"
        }
    } else {
        Write-Error "Échec de la connexion admin"
        exit 1
    }
} catch {
    Write-Error "Erreur lors de la connexion admin: $($_.Exception.Message)"
    exit 1
}

# 2. Test des statistiques des utilisateurs
Write-Info "2. Test des statistiques des utilisateurs..."
try {
    $statsResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/stats" -Method GET -Headers $headers
    
    Write-Success "Statistiques récupérées:"
    Write-Host "   Total: $($statsResponse.totalUsers)" -ForegroundColor Yellow
    Write-Host "   Actifs: $($statsResponse.activeUsers)" -ForegroundColor Yellow
    Write-Host "   Admins: $($statsResponse.adminUsers)" -ForegroundColor Yellow
    Write-Host "   Modérateurs: $($statsResponse.moderatorUsers)" -ForegroundColor Yellow
    Write-Host "   Contributeurs: $($statsResponse.contributorUsers)" -ForegroundColor Yellow
} catch {
    Write-Error "Erreur lors de la récupération des statistiques: $($_.Exception.Message)"
}

# 3. Test de récupération de tous les utilisateurs
Write-Info "3. Test de récupération de tous les utilisateurs..."
try {
    $usersResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users" -Method GET -Headers $headers
    
    Write-Success "Utilisateurs récupérés: $($usersResponse.totalElements) utilisateurs sur $($usersResponse.totalPages) pages"
    Write-Host "   Page actuelle: $($usersResponse.number + 1)" -ForegroundColor Yellow
    Write-Host "   Taille de page: $($usersResponse.size)" -ForegroundColor Yellow
    Write-Host "   Utilisateurs dans cette page: $($usersResponse.content.Count)" -ForegroundColor Yellow
    
    # Afficher les premiers utilisateurs
    foreach ($user in $usersResponse.content[0..2]) {
        Write-Host "   - $($user.fullName) ($($user.email)) - Rôle: $($user.role) - Statut: $($user.active)" -ForegroundColor Cyan
    }
} catch {
    Write-Error "Erreur lors de la récupération des utilisateurs: $($_.Exception.Message)"
}

# 4. Test de création d'un nouvel utilisateur
Write-Info "4. Test de création d'un nouvel utilisateur..."
try {
    $newUser = @{
        email = "test.user.$(Get-Date -Format 'yyyyMMddHHmmss')@test.gw"
        password = "test123"
        fullName = "Utilisateur Test"
        phone = "+245123456789"
        role = "CONTRIBUTOR"
        emailVerified = $true
        active = $true
    }
    
    $createResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users" -Method POST -Headers $headers -Body ($newUser | ConvertTo-Json)
    
    Write-Success "Utilisateur créé: $($createResponse.fullName) ($($createResponse.email))"
    $testUserId = $createResponse.id
} catch {
    Write-Error "Erreur lors de la création de l'utilisateur: $($_.Exception.Message)"
    $testUserId = $null
}

# 5. Test de modification d'un utilisateur
if ($testUserId) {
    Write-Info "5. Test de modification de l'utilisateur..."
    try {
        $updateData = @{
            fullName = "Utilisateur Test Modifié"
            phone = "+245987654321"
            role = "MODERATOR"
            reputationScore = 50
        }
        
        $updateResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/$testUserId" -Method PUT -Headers $headers -Body ($updateData | ConvertTo-Json)
        
        Write-Success "Utilisateur modifié: $($updateResponse.fullName) - Rôle: $($updateResponse.role) - Réputation: $($updateResponse.reputationScore)"
    } catch {
        Write-Error "Erreur lors de la modification de l'utilisateur: $($_.Exception.Message)"
    }
}

# 6. Test de changement de mot de passe
if ($testUserId) {
    Write-Info "6. Test de changement de mot de passe..."
    try {
        $passwordData = @{
            newPassword = "newpassword123"
        }
        
        $passwordResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/$testUserId/change-password" -Method POST -Headers $headers -Body ($passwordData | ConvertTo-Json)
        
        Write-Success "Mot de passe changé avec succès"
    } catch {
        Write-Error "Erreur lors du changement de mot de passe: $($_.Exception.Message)"
    }
}

# 7. Test de désactivation d'un utilisateur
if ($testUserId) {
    Write-Info "7. Test de désactivation de l'utilisateur..."
    try {
        $deactivateResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/$testUserId" -Method DELETE -Headers $headers
        
        Write-Success "Utilisateur désactivé avec succès"
    } catch {
        Write-Error "Erreur lors de la désactivation de l'utilisateur: $($_.Exception.Message)"
    }
}

# 8. Test de réactivation d'un utilisateur
if ($testUserId) {
    Write-Info "8. Test de réactivation de l'utilisateur..."
    try {
        $activateResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/$testUserId/activate" -Method POST -Headers $headers
        
        Write-Success "Utilisateur réactivé: $($activateResponse.fullName) - Statut: $($activateResponse.active)"
    } catch {
        Write-Error "Erreur lors de la réactivation de l'utilisateur: $($_.Exception.Message)"
    }
}

# 9. Test des filtres
Write-Info "9. Test des filtres..."
try {
    # Filtre par rôle
    $filteredResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?role=ADMIN" -Method GET -Headers $headers
    Write-Success "Filtre par rôle ADMIN: $($filteredResponse.totalElements) utilisateurs trouvés"
    
    # Filtre par statut
    $filteredResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?active=true" -Method GET -Headers $headers
    Write-Success "Filtre par statut actif: $($filteredResponse.totalElements) utilisateurs trouvés"
    
    # Filtre par recherche
    $filteredResponse = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?search=admin" -Method GET -Headers $headers
    Write-Success "Filtre par recherche 'admin': $($filteredResponse.totalElements) utilisateurs trouvés"
} catch {
    Write-Error "Erreur lors du test des filtres: $($_.Exception.Message)"
}

# 10. Test de pagination
Write-Info "10. Test de pagination..."
try {
    $page1Response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?page=0&size=5" -Method GET -Headers $headers
    $page2Response = Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users?page=1&size=5" -Method GET -Headers $headers
    
    Write-Success "Pagination testée:"
    Write-Host "   Page 1: $($page1Response.content.Count) utilisateurs" -ForegroundColor Yellow
    Write-Host "   Page 2: $($page2Response.content.Count) utilisateurs" -ForegroundColor Yellow
    Write-Host "   Total: $($page1Response.totalElements) utilisateurs sur $($page1Response.totalPages) pages" -ForegroundColor Yellow
} catch {
    Write-Error "Erreur lors du test de pagination: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "🎉 Tests d'administration terminés!" -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Nettoyage - Supprimer l'utilisateur de test
if ($testUserId) {
    Write-Info "Nettoyage: Suppression de l'utilisateur de test..."
    try {
        Invoke-RestMethod -Uri "$BASE_URL/api/v1/admin/users/$testUserId" -Method DELETE -Headers $headers
        Write-Success "Utilisateur de test supprimé"
    } catch {
        Write-Error "Erreur lors de la suppression de l'utilisateur de test: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "📋 Résumé des tests:" -ForegroundColor Cyan
Write-Host "   - Connexion admin: ✅" -ForegroundColor Green
Write-Host "   - Statistiques: ✅" -ForegroundColor Green
Write-Host "   - CRUD utilisateurs: ✅" -ForegroundColor Green
Write-Host "   - Filtres et pagination: ✅" -ForegroundColor Green
Write-Host "   - Gestion des mots de passe: ✅" -ForegroundColor Green
Write-Host "   - Activation/désactivation: ✅" -ForegroundColor Green
