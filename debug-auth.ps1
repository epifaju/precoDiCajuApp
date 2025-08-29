# Script de diagnostic pour les problèmes d'authentification
Write-Host "=== Diagnostic des Problèmes d'Authentification ===" -ForegroundColor Green

$API_BASE = "http://localhost:8080"

# 1. Vérifier que le backend est accessible
Write-Host "`n1. Vérification de l'accessibilité du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$API_BASE/actuator/health" -Method GET -UseBasicParsing -ErrorAction Stop
    Write-Host "✅ Backend accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test de connexion admin
Write-Host "`n2. Test de connexion admin..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@precaju.gw"
    password = "admin123"
    rememberMe = $false
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    
    if ($loginResponse.StatusCode -eq 200) {
        $loginResult = $loginResponse.Content | ConvertFrom-Json
        $accessToken = $loginResult.access_token
        $user = $loginResult.user
        
        Write-Host "✅ Connexion réussie!" -ForegroundColor Green
        Write-Host "   Utilisateur: $($user.email)" -ForegroundColor Cyan
        Write-Host "   Rôle: $($user.role)" -ForegroundColor Cyan
        Write-Host "   Token: $($accessToken.Substring(0, 20))..." -ForegroundColor Cyan
        
        # 3. Test des endpoints admin avec le token
        Write-Host "`n3. Test des endpoints admin avec authentification..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $accessToken"
            "Content-Type" = "application/json"
        }
        
        # Test endpoint utilisateurs
        try {
            $usersResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/admin/users?page=0&size=20" -Method GET -Headers $headers -ErrorAction Stop
            
            if ($usersResponse.StatusCode -eq 200) {
                $usersResult = $usersResponse.Content | ConvertFrom-Json
                Write-Host "✅ Endpoint utilisateurs: OK" -ForegroundColor Green
                Write-Host "   Total: $($usersResult.totalElements)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur endpoint utilisateurs: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                try {
                    $errorContent = $_.Exception.Response.Content | ConvertFrom-Json
                    Write-Host "   Message: $($errorContent.message)" -ForegroundColor Red
                } catch {
                    Write-Host "   Contenu d'erreur: $($_.Exception.Response.Content)" -ForegroundColor Red
                }
            }
        }
        
        # Test endpoint statistiques
        try {
            $statsResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/admin/users/stats" -Method GET -Headers $headers -ErrorAction Stop
            
            if ($statsResponse.StatusCode -eq 200) {
                $statsResult = $statsResponse.Content | ConvertFrom-Json
                Write-Host "✅ Endpoint statistiques: OK" -ForegroundColor Green
                Write-Host "   Total utilisateurs: $($statsResult.totalUsers)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur endpoint statistiques: $($_.Exception.Message)" -ForegroundColor Red
            if ($_.Exception.Response) {
                Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                try {
                    $errorContent = $_.Exception.Response.Content | ConvertFrom-Json
                    Write-Host "   Message: $($errorContent.message)" -ForegroundColor Red
                } catch {
                    Write-Host "   Contenu d'erreur: $($_.Exception.Response.Content)" -ForegroundColor Red
                }
            }
        }
        
        # 4. Test sans token (doit échouer)
        Write-Host "`n4. Test sans authentification (doit échouer)..." -ForegroundColor Yellow
        
        try {
            $noAuthResponse = Invoke-WebRequest -Uri "$API_BASE/api/v1/admin/users?page=0&size=20" -Method GET -ContentType "application/json" -ErrorAction Stop
            Write-Host "❌ Erreur: L'endpoint devrait être protégé!" -ForegroundColor Red
        } catch {
            if ($_.Exception.Response.StatusCode -eq 401) {
                Write-Host "✅ Correct: Endpoint protégé (401 Unauthorized)" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Réponse inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
            }
        }
        
    } else {
        Write-Host "❌ Échec de la connexion: $($loginResponse.StatusCode)" -ForegroundColor Red
        try {
            $errorData = $loginResponse.Content | ConvertFrom-Json
            Write-Host "   Message: $($errorData.message)" -ForegroundColor Red
        } catch {
            Write-Host "   Contenu: $($loginResponse.Content)" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "❌ Erreur lors de la connexion: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Vérification des logs du backend
Write-Host "`n5. Vérification des logs du backend..." -ForegroundColor Yellow
Write-Host "   Vérifiez les logs du backend pour voir les erreurs détaillées" -ForegroundColor Cyan
Write-Host "   Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - docker logs <container_id>" -ForegroundColor White
Write-Host "   - tail -f backend/logs/application.log" -ForegroundColor White

Write-Host "`n=== Diagnostic terminé ===" -ForegroundColor Green
Write-Host "`nRecommandations:" -ForegroundColor Yellow
Write-Host "1. Vérifiez que l'utilisateur est connecté dans le frontend" -ForegroundColor Cyan
Write-Host "2. Vérifiez que le token JWT est valide et non expiré" -ForegroundColor Cyan
Write-Host "3. Vérifiez les logs du backend pour les erreurs détaillées" -ForegroundColor Cyan
Write-Host "4. Vérifiez que l'utilisateur a bien le rôle ADMIN" -ForegroundColor Cyan
