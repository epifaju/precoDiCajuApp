# Test du Module d'Administration des Utilisateurs
# Ce script teste les fonctionnalités principales du module d'administration

Write-Host "=== TEST DU MODULE D'ADMINISTRATION DES UTILISATEURS ===" -ForegroundColor Green
Write-Host ""

# Configuration
$API_BASE_URL = "http://localhost:8080"
$ADMIN_EMAIL = "admin@precaju.com"
$ADMIN_PASSWORD = "admin123"

# Fonction pour afficher les résultats des tests
function Show-TestResult {
    param(
        [string]$TestName,
        [bool]$Success,
        [string]$Message = ""
    )
    
    if ($Success) {
        Write-Host "✓ $TestName" -ForegroundColor Green
    } else {
        Write-Host "✗ $TestName" -ForegroundColor Red
        if ($Message) {
            Write-Host "  Erreur: $Message" -ForegroundColor Red
        }
    }
}

# Test 1: Vérification de la connectivité de l'API
Write-Host "1. Test de connectivité de l'API..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$API_BASE_URL/actuator/health" -Method GET -TimeoutSec 10
    if ($response.status -eq "UP") {
        Show-TestResult "Connectivité API" $true
    } else {
        Show-TestResult "Connectivité API" $false "Statut: $($response.status)"
    }
} catch {
    Show-TestResult "Connectivité API" $false "Impossible de se connecter: $($_.Exception.Message)"
}

Write-Host ""

# Test 2: Test de connexion administrateur
Write-Host "2. Test de connexion administrateur..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = $ADMIN_EMAIL
        password = $ADMIN_PASSWORD
        rememberMe = $false
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/auth/login" -Method POST -Body $loginBody -ContentType "application/json" -TimeoutSec 10
    
    if ($response.access_token) {
        $global:ADMIN_TOKEN = $response.access_token
        $global:ADMIN_USER = $response.user
        Show-TestResult "Connexion administrateur" $true
        Write-Host "  Utilisateur: $($response.user.email) - Rôle: $($response.user.role)" -ForegroundColor Gray
    } else {
        Show-TestResult "Connexion administrateur" $false "Pas de token d'accès"
    }
} catch {
    Show-TestResult "Connexion administrateur" $false "Erreur de connexion: $($_.Exception.Message)"
}

Write-Host ""

# Test 3: Vérification des permissions administrateur
Write-Host "3. Test des permissions administrateur..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/stats" -Method GET -Headers $headers -TimeoutSec 10
        
        if ($response.totalUsers -ge 0) {
            Show-TestResult "Permissions administrateur" $true
            Write-Host "  Statistiques récupérées: $($response.totalUsers) utilisateurs totaux" -ForegroundColor Gray
        } else {
            Show-TestResult "Permissions administrateur" $false "Statistiques invalides"
        }
    } catch {
        Show-TestResult "Permissions administrateur" $false "Erreur d'accès: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Permissions administrateur" $false "Pas de token d'authentification"
}

Write-Host ""

# Test 4: Test de récupération des utilisateurs
Write-Host "4. Test de récupération des utilisateurs..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users?page=0&size=10" -Method GET -Headers $headers -TimeoutSec 10
        
        if ($response.content -and $response.content.Count -ge 0) {
            Show-TestResult "Récupération des utilisateurs" $true
            Write-Host "  Utilisateurs récupérés: $($response.content.Count) sur $($response.totalElements)" -ForegroundColor Gray
        } else {
            Show-TestResult "Récupération des utilisateurs" $false "Aucun utilisateur récupéré"
        }
    } catch {
        Show-TestResult "Récupération des utilisateurs" $false "Erreur de récupération: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Récupération des utilisateurs" $false "Pas de token d'authentification"
}

Write-Host ""

# Test 5: Test des filtres de recherche
Write-Host "5. Test des filtres de recherche..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        # Test avec filtre par rôle
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users?role=CONTRIBUTOR&page=0&size=5" -Method GET -Headers $headers -TimeoutSec 10
        
        if ($response.content) {
            Show-TestResult "Filtres de recherche" $true
            Write-Host "  Filtre par rôle CONTRIBUTOR: $($response.content.Count) utilisateurs trouvés" -ForegroundColor Gray
        } else {
            Show-TestResult "Filtres de recherche" $false "Aucun résultat avec le filtre"
        }
    } catch {
        Show-TestResult "Filtres de recherche" $false "Erreur de filtrage: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Filtres de recherche" $false "Pas de token d'authentification"
}

Write-Host ""

# Test 6: Test de création d'utilisateur (si autorisé)
Write-Host "6. Test de création d'utilisateur..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $testUserBody = @{
            email = "test.user.$(Get-Date -Format 'yyyyMMddHHmmss')@precaju.com"
            password = "test123456"
            fullName = "Utilisateur Test"
            phone = "+245123456789"
            role = "CONTRIBUTOR"
            emailVerified = $true
            active = $true
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users" -Method POST -Body $testUserBody -Headers $headers -TimeoutSec 10
        
        if ($response.id) {
            Show-TestResult "Création d'utilisateur" $true
            Write-Host "  Utilisateur créé: $($response.email) - ID: $($response.id)" -ForegroundColor Gray
            
            # Nettoyer: supprimer l'utilisateur de test
            try {
                Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($response.id)" -Method DELETE -Headers $headers -TimeoutSec 10
                Write-Host "  Utilisateur de test supprimé" -ForegroundColor Gray
            } catch {
                Write-Host "  Attention: Impossible de supprimer l'utilisateur de test" -ForegroundColor Yellow
            }
        } else {
            Show-TestResult "Création d'utilisateur" $false "Pas d'ID retourné"
        }
    } catch {
        Show-TestResult "Création d'utilisateur" $false "Erreur de création: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Création d'utilisateur" $false "Pas de token d'authentification"
}

Write-Host ""

# Test 7: Test de modification d'utilisateur
Write-Host "7. Test de modification d'utilisateur..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN -and $global:ADMIN_USER) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $updateBody = @{
            fullName = "Administrateur Modifié"
            phone = "+245987654321"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($global:ADMIN_USER.id)" -Method PUT -Body $updateBody -Headers $headers -TimeoutSec 10
        
        if ($response.fullName -eq "Administrateur Modifié") {
            Show-TestResult "Modification d'utilisateur" $true
            Write-Host "  Utilisateur modifié: $($response.fullName)" -ForegroundColor Gray
            
            # Restaurer le nom original
            $restoreBody = @{
                fullName = $global:ADMIN_USER.fullName
                phone = $global:ADMIN_USER.phone
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($global:ADMIN_USER.id)" -Method PUT -Body $restoreBody -Headers $headers -TimeoutSec 10
            Write-Host "  Nom original restauré" -ForegroundColor Gray
        } else {
            Show-TestResult "Modification d'utilisateur" $false "Modification non appliquée"
        }
    } catch {
        Show-TestResult "Modification d'utilisateur" $false "Erreur de modification: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Modification d'utilisateur" $false "Pas de token ou d'utilisateur"
}

Write-Host ""

# Test 8: Test de changement de mot de passe
Write-Host "8. Test de changement de mot de passe..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN -and $global:ADMIN_USER) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        $passwordBody = @{
            newPassword = "newadmin123"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($global:ADMIN_USER.id)/change-password" -Method POST -Body $passwordBody -Headers $headers -TimeoutSec 10
        
        if ($response -eq $null) {
            Show-TestResult "Changement de mot de passe" $true
            Write-Host "  Mot de passe changé avec succès" -ForegroundColor Gray
            
            # Restaurer l'ancien mot de passe
            $restorePasswordBody = @{
                newPassword = $ADMIN_PASSWORD
            } | ConvertTo-Json
            
            Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($global:ADMIN_USER.id)/change-password" -Method POST -Body $restorePasswordBody -Headers $headers -TimeoutSec 10
            Write-Host "  Mot de passe original restauré" -ForegroundColor Gray
        } else {
            Show-TestResult "Changement de mot de passe" $false "Réponse inattendue"
        }
    } catch {
        Show-TestResult "Changement de mot de passe" $false "Erreur de changement: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Changement de mot de passe" $false "Pas de token ou d'utilisateur"
}

Write-Host ""

# Test 9: Test de désactivation/réactivation d'utilisateur
Write-Host "9. Test de gestion du statut utilisateur..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global:ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        # Créer un utilisateur de test pour la désactivation
        $testUserBody = @{
            email = "test.status.$(Get-Date -Format 'yyyyMMddHHmmss')@precaju.com"
            password = "test123456"
            fullName = "Utilisateur Status Test"
            role = "CONTRIBUTOR"
            emailVerified = $true
            active = $true
        } | ConvertTo-Json

        $createResponse = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users" -Method POST -Body $testUserBody -Headers $headers -TimeoutSec 10
        
        if ($createResponse.id) {
            # Désactiver l'utilisateur
            $deactivateResponse = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($createResponse.id)" -Method DELETE -Headers $headers -TimeoutSec 10
            
            # Vérifier que l'utilisateur est désactivé
            $userResponse = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($createResponse.id)" -Method GET -Headers $headers -TimeoutSec 10
            
            if ($userResponse.active -eq $false) {
                Show-TestResult "Gestion du statut utilisateur" $true
                Write-Host "  Utilisateur désactivé avec succès" -ForegroundColor Gray
                
                # Réactiver l'utilisateur
                $activateResponse = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($createResponse.id)/activate" -Method POST -Headers $headers -TimeoutSec 10
                
                if ($activateResponse.active -eq $true) {
                    Write-Host "  Utilisateur réactivé avec succès" -ForegroundColor Gray
                } else {
                    Write-Host "  Attention: Réactivation échouée" -ForegroundColor Yellow
                }
                
                # Nettoyer
                Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users/$($createResponse.id)" -Method DELETE -Headers $headers -TimeoutSec 10
                Write-Host "  Utilisateur de test supprimé" -ForegroundColor Gray
            } else {
                Show-TestResult "Gestion du statut utilisateur" $false "Désactivation non appliquée"
            }
        } else {
            Show-TestResult "Gestion du statut utilisateur" $false "Impossible de créer l'utilisateur de test"
        }
    } catch {
        Show-TestResult "Gestion du statut utilisateur" $false "Erreur de gestion du statut: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Gestion du statut utilisateur" $false "Pas de token d'authentification"
}

Write-Host ""

# Test 10: Test de pagination
Write-Host "10. Test de pagination..." -ForegroundColor Yellow
if ($global:ADMIN_TOKEN) {
    try {
        $headers = @{
            "Authorization" = "Bearer $global_ADMIN_TOKEN"
            "Content-Type" = "application/json"
        }
        
        # Test de la première page
        $page1Response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users?page=0&size=5" -Method GET -Headers $headers -TimeoutSec 10
        
        # Test de la deuxième page
        $page2Response = Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/admin/users?page=1&size=5" -Method GET -Headers $headers -TimeoutSec 10
        
        if ($page1Response.content -and $page2Response.content) {
            Show-TestResult "Pagination" $true
            Write-Host "  Page 1: $($page1Response.content.Count) utilisateurs" -ForegroundColor Gray
            Write-Host "  Page 2: $($page2Response.content.Count) utilisateurs" -ForegroundColor Gray
            Write-Host "  Total: $($page1Response.totalElements) utilisateurs, $($page1Response.totalPages) pages" -ForegroundColor Gray
        } else {
            Show-TestResult "Pagination" $false "Pagination non fonctionnelle"
        }
    } catch {
        Show-TestResult "Pagination" $false "Erreur de pagination: $($_.Exception.Message)"
    }
} else {
    Show-TestResult "Pagination" $false "Pas de token d'authentification"
}

Write-Host ""
Write-Host "=== RÉSUMÉ DES TESTS ===" -ForegroundColor Green
Write-Host "Tests effectués: 10" -ForegroundColor White
Write-Host ""

# Nettoyage
if ($global:ADMIN_TOKEN) {
    Write-Host "Déconnexion de l'administrateur..." -ForegroundColor Gray
    try {
        $logoutBody = @{
            refreshToken = $global:ADMIN_TOKEN
        } | ConvertTo-Json
        
        Invoke-RestMethod -Uri "$API_BASE_URL/api/v1/auth/logout" -Method POST -Body $logoutBody -ContentType "application/json" -TimeoutSec 10
        Write-Host "Déconnexion réussie" -ForegroundColor Green
    } catch {
        Write-Host "Erreur lors de la déconnexion: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Test du module d'administration terminé." -ForegroundColor Green
