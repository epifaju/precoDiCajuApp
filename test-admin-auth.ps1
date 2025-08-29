# Test d'authentification et des endpoints d'administration
# Ce script teste le processus complet d'authentification et d'accès aux endpoints admin

Write-Host "=== Test d'Authentification et Endpoints Admin ===" -ForegroundColor Green

$API_BASE = "http://localhost:8080"

# 1. Test de connexion avec un utilisateur admin
Write-Host "`n1. Test de connexion admin..." -ForegroundColor Yellow

$loginData = @{
    email = "admin@precaju.gw"
    password = "admin123"
    rememberMe = $false
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.StatusCode -eq 200) {
        $loginResult = $loginResponse.Content | ConvertFrom-Json
        $accessToken = $loginResult.access_token
        $user = $loginResult.user
        
        Write-Host "✅ Connexion réussie!" -ForegroundColor Green
        Write-Host "   Utilisateur: $($user.email)" -ForegroundColor Cyan
        Write-Host "   Rôle: $($user.role)" -ForegroundColor Cyan
        Write-Host "   Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Cyan
        
        # 2. Test de l'endpoint des utilisateurs admin
        Write-Host "`n2. Test endpoint utilisateurs admin..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $accessToken"
            "Content-Type" = "application/json"
        }
        
        try {
            $usersResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/admin/users?page=0&size=20" -Method GET -Headers $headers
            
            if ($usersResponse.StatusCode -eq 200) {
                $usersResult = $usersResponse.Content | ConvertFrom-Json
                Write-Host "✅ Endpoint utilisateurs fonctionne!" -ForegroundColor Green
                Write-Host "   Total utilisateurs: $($usersResult.totalElements)" -ForegroundColor Cyan
                Write-Host "   Utilisateurs dans la page: $($usersResult.content.Count)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur endpoint utilisateurs: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # 3. Test de l'endpoint des statistiques admin
        Write-Host "`n3. Test endpoint statistiques admin..." -ForegroundColor Yellow
        
        try {
            $statsResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/admin/users/stats" -Method GET -Headers $headers
            
            if ($statsResponse.StatusCode -eq 200) {
                $statsResult = $statsResponse.Content | ConvertFrom-Json
                Write-Host "✅ Endpoint statistiques fonctionne!" -ForegroundColor Green
                Write-Host "   Total utilisateurs: $($statsResult.totalUsers)" -ForegroundColor Cyan
                Write-Host "   Utilisateurs actifs: $($statsResult.activeUsers)" -ForegroundColor Cyan
                Write-Host "   Admins: $($statsResult.adminUsers)" -ForegroundColor Cyan
                Write-Host "   Modérateurs: $($statsResult.moderatorUsers)" -ForegroundColor Cyan
                Write-Host "   Contributeurs: $($statsResult.contributorUsers)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur endpoint statistiques: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # 4. Test de l'endpoint utilisateur actuel
        Write-Host "`n4. Test endpoint utilisateur actuel..." -ForegroundColor Yellow
        
        try {
            $meResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/users/me" -Method GET -Headers $headers
            
            if ($meResponse.StatusCode -eq 200) {
                $meResult = $meResponse.Content | ConvertFrom-Json
                Write-Host "✅ Endpoint utilisateur actuel fonctionne!" -ForegroundColor Green
                Write-Host "   Email: $($meResult.email)" -ForegroundColor Cyan
                Write-Host "   Rôle: $($meResult.role)" -ForegroundColor Cyan
                Write-Host "   Actif: $($meResult.active)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur endpoint utilisateur actuel: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Échec de la connexion: $($loginResponse.StatusCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors de la connexion: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Test sans authentification (doit échouer)
Write-Host "`n5. Test sans authentification (doit échouer)..." -ForegroundColor Yellow

try {
    $noAuthResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/admin/users?page=0&size=20" -Method GET -ContentType "application/json"
    Write-Host "❌ Erreur: L'endpoint devrait être protégé!" -ForegroundColor Red
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Correct: Endpoint protégé (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Réponse inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Test terminé ===" -ForegroundColor Green
