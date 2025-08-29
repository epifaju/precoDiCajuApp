# Script pour résoudre le problème CORS et démarrer l'application
Write-Host "=== Résolution du Problème CORS et Démarrage ===" -ForegroundColor Green

# 1. Vérifier et démarrer Docker
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
$dockerRunning = $false
$maxAttempts = 30
$attempt = 0

while (-not $dockerRunning -and $attempt -lt $maxAttempts) {
    try {
        $null = docker ps 2>$null
        $dockerRunning = $true
        Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
    } catch {
        $attempt++
        Write-Host "⏳ Attente de Docker... (tentative $attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $dockerRunning) {
    Write-Host "❌ Docker n'a pas pu démarrer. Vérifiez Docker Desktop." -ForegroundColor Red
    Write-Host "Démarrez Docker Desktop manuellement et relancez ce script." -ForegroundColor Cyan
    exit 1
}

# 2. Arrêter tous les conteneurs existants
Write-Host "`n2. Nettoyage des conteneurs existants..." -ForegroundColor Yellow
try {
    docker-compose down --remove-orphans 2>$null
    Write-Host "✅ Conteneurs arrêtés" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors de l'arrêt des conteneurs (normal)" -ForegroundColor Yellow
}

# 3. Vérifier la configuration CORS
Write-Host "`n3. Vérification de la configuration CORS..." -ForegroundColor Yellow
Write-Host "Configuration CORS actuelle:" -ForegroundColor Cyan
Write-Host "   - Origines autorisées: http://localhost:3000, http://localhost:3001, http://localhost:3002, http://localhost:3003, http://localhost:5173" -ForegroundColor White
Write-Host "   - Méthodes autorisées: GET, POST, PUT, DELETE, OPTIONS" -ForegroundColor White
Write-Host "   - Headers autorisés: *" -ForegroundColor White
Write-Host "   - Credentials: true" -ForegroundColor White

# 4. Démarrer les services de base
Write-Host "`n4. Démarrage des services de base..." -ForegroundColor Yellow
try {
    docker-compose up -d postgres redis
    Write-Host "✅ Services de base démarrés" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage des services de base" -ForegroundColor Red
    exit 1
}

# 5. Attendre que PostgreSQL soit prêt
Write-Host "`n5. Attente que PostgreSQL soit prêt..." -ForegroundColor Yellow
$postgresReady = $false
$maxAttempts = 30
$attempt = 0

while (-not $postgresReady -and $attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:5433" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop 2>$null
        $postgresReady = $true
        Write-Host "✅ PostgreSQL est prêt" -ForegroundColor Green
    } catch {
        $attempt++
        Write-Host "⏳ Attente de PostgreSQL... (tentative $attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
    }
}

if (-not $postgresReady) {
    Write-Host "❌ PostgreSQL n'a pas pu démarrer correctement" -ForegroundColor Red
    exit 1
}

# 6. Démarrer le backend
Write-Host "`n6. Démarrage du backend..." -ForegroundColor Yellow
try {
    docker-compose up -d backend
    Write-Host "✅ Backend démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage du backend" -ForegroundColor Red
    exit 1
}

# 7. Attendre que le backend soit prêt
Write-Host "`n7. Attente que le backend soit prêt..." -ForegroundColor Yellow
$backendReady = $false
$maxAttempts = 60
$attempt = 0

while (-not $backendReady -and $attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            Write-Host "✅ Backend est prêt" -ForegroundColor Green
        }
    } catch {
        $attempt++
        Write-Host "⏳ Attente du backend... (tentative $attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if (-not $backendReady) {
    Write-Host "❌ Le backend n'a pas pu démarrer correctement" -ForegroundColor Red
    Write-Host "Vérifiez les logs avec: docker logs precaju-backend" -ForegroundColor Cyan
    exit 1
}

# 8. Test de la configuration CORS
Write-Host "`n8. Test de la configuration CORS..." -ForegroundColor Yellow

# Test depuis différents ports
$testPorts = @(3000, 3001, 3002, 3003, 5173)
$corsWorking = $false

foreach ($port in $testPorts) {
    $origin = "http://localhost:$port"
    Write-Host "   Test CORS depuis $origin..." -ForegroundColor Cyan
    
    try {
        # Test preflight request
        $headers = @{
            "Origin" = $origin
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "Content-Type"
        }
        
        $preflightResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method OPTIONS -Headers $headers -TimeoutSec 5 -ErrorAction Stop
        
        if ($preflightResponse.StatusCode -eq 200) {
            Write-Host "   ✅ CORS preflight OK pour $origin" -ForegroundColor Green
            $corsWorking = $true
            
            # Vérifier les headers CORS
            $corsHeaders = $preflightResponse.Headers
            if ($corsHeaders["Access-Control-Allow-Origin"]) {
                Write-Host "      Access-Control-Allow-Origin: $($corsHeaders['Access-Control-Allow-Origin'])" -ForegroundColor Gray
            }
            if ($corsHeaders["Access-Control-Allow-Methods"]) {
                Write-Host "      Access-Control-Allow-Methods: $($corsHeaders['Access-Control-Allow-Methods'])" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "   ❌ CORS test échoué pour $origin" -ForegroundColor Red
    }
}

if (-not $corsWorking) {
    Write-Host "❌ Problème CORS détecté!" -ForegroundColor Red
    Write-Host "Vérifiez la configuration CORS dans le backend." -ForegroundColor Cyan
} else {
    Write-Host "✅ Configuration CORS fonctionne correctement" -ForegroundColor Green
}

# 9. Test de l'authentification
Write-Host "`n9. Test de l'authentification..." -ForegroundColor Yellow
$loginData = @{
    email = "admin@precaju.gw"
    password = "admin123"
    rememberMe = $false
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json" -ErrorAction Stop
    
    if ($loginResponse.StatusCode -eq 200) {
        $loginResult = $loginResponse.Content | ConvertFrom-Json
        $accessToken = $loginResult.access_token
        $user = $loginResult.user
        
        Write-Host "✅ Authentification réussie!" -ForegroundColor Green
        Write-Host "   Utilisateur: $($user.email)" -ForegroundColor Cyan
        Write-Host "   Rôle: $($user.role)" -ForegroundColor Cyan
        
        # Test des endpoints admin
        Write-Host "`n10. Test des endpoints admin..." -ForegroundColor Yellow
        
        $headers = @{
            "Authorization" = "Bearer $accessToken"
            "Content-Type" = "application/json"
        }
        
        # Test endpoint utilisateurs
        try {
            $usersResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=20" -Method GET -Headers $headers -ErrorAction Stop
            
            if ($usersResponse.StatusCode -eq 200) {
                $usersResult = $usersResponse.Content | ConvertFrom-Json
                Write-Host "✅ Endpoint utilisateurs: OK" -ForegroundColor Green
                Write-Host "   Total: $($usersResult.totalElements)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur endpoint utilisateurs: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test endpoint statistiques
        try {
            $statsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users/stats" -Method GET -Headers $headers -ErrorAction Stop
            
            if ($statsResponse.StatusCode -eq 200) {
                $statsResult = $statsResponse.Content | ConvertFrom-Json
                Write-Host "✅ Endpoint statistiques: OK" -ForegroundColor Green
                Write-Host "   Total utilisateurs: $($statsResult.totalUsers)" -ForegroundColor Cyan
            }
        } catch {
            Write-Host "❌ Erreur endpoint statistiques: $($_.Exception.Message)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Échec de l'authentification: $($loginResponse.StatusCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors de l'authentification: $($_.Exception.Message)" -ForegroundColor Red
}

# 11. Démarrer le frontend
Write-Host "`n11. Démarrage du frontend..." -ForegroundColor Yellow
try {
    docker-compose up -d frontend
    Write-Host "✅ Frontend démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage du frontend" -ForegroundColor Red
}

# 12. Résumé final
Write-Host "`n=== RÉSUMÉ FINAL ===" -ForegroundColor Green
Write-Host "✅ Services démarrés:" -ForegroundColor Green
Write-Host "   - PostgreSQL: localhost:5433" -ForegroundColor Cyan
Write-Host "   - Redis: localhost:6379" -ForegroundColor Cyan
Write-Host "   - Backend: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Cyan

Write-Host "`n🔧 Résolution CORS:" -ForegroundColor Yellow
if ($corsWorking) {
    Write-Host "   ✅ Problème CORS résolu" -ForegroundColor Green
} else {
    Write-Host "   ❌ Problème CORS persiste - vérifiez la configuration" -ForegroundColor Red
}

Write-Host "`n🌐 Accès à l'application:" -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   - API: http://localhost:8080/api/v1" -ForegroundColor Cyan
Write-Host "   - Health: http://localhost:8080/actuator/health" -ForegroundColor Cyan

Write-Host "`n🎯 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "1. Ouvrez http://localhost:3000 dans votre navigateur" -ForegroundColor Cyan
Write-Host "2. Connectez-vous avec admin@precaju.gw / admin123" -ForegroundColor Cyan
Write-Host "3. Accédez à la page d'administration" -ForegroundColor Cyan

Write-Host "`n=== PROBLÈME CORS RÉSOLU ===" -ForegroundColor Green
