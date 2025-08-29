# Script pour vérifier les logs du backend et identifier l'erreur 500
Write-Host "=== Vérification des Logs du Backend ===" -ForegroundColor Green

# 1. Vérifier si Docker est en cours d'exécution
Write-Host "`n1. Vérification des conteneurs Docker..." -ForegroundColor Yellow
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($containers) {
        Write-Host "Conteneurs en cours d'exécution:" -ForegroundColor Cyan
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "Aucun conteneur Docker en cours d'exécution" -ForegroundColor Red
    }
} catch {
    Write-Host "Docker n'est pas accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Vérifier les logs du conteneur backend
Write-Host "`n2. Vérification des logs du conteneur backend..." -ForegroundColor Yellow
try {
    $backendContainer = docker ps --filter "name=backend" --format "{{.Names}}" 2>$null
    if ($backendContainer) {
        Write-Host "Conteneur backend trouvé: $backendContainer" -ForegroundColor Green
        Write-Host "Derniers logs du backend:" -ForegroundColor Cyan
        
        # Récupérer les 50 dernières lignes des logs
        $logs = docker logs --tail 50 $backendContainer 2>$null
        if ($logs) {
            # Filtrer les logs d'erreur
            $errorLogs = $logs | Select-String -Pattern "ERROR|Exception|Error|error" -Context 2
            if ($errorLogs) {
                Write-Host "Logs d'erreur trouvés:" -ForegroundColor Red
                $errorLogs | ForEach-Object { Write-Host $_ -ForegroundColor Red }
            } else {
                Write-Host "Aucun log d'erreur récent trouvé" -ForegroundColor Green
            }
            
            # Afficher les derniers logs généraux
            Write-Host "`nDerniers logs généraux:" -ForegroundColor Cyan
            $logs | Select-Object -Last 20 | ForEach-Object { Write-Host $_ -ForegroundColor White }
        }
    } else {
        Write-Host "Aucun conteneur backend trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de la vérification des logs: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test spécifique de l'endpoint qui pose problème
Write-Host "`n3. Test spécifique de l'endpoint /admin/users..." -ForegroundColor Yellow

# D'abord se connecter
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
        
        Write-Host "✅ Connexion réussie, test de l'endpoint problématique..." -ForegroundColor Green
        
        $headers = @{
            "Authorization" = "Bearer $accessToken"
            "Content-Type" = "application/json"
        }
        
        # Test avec différents paramètres
        $testUrls = @(
            "/api/v1/admin/users?page=0&size=20",
            "/api/v1/admin/users?page=0&size=10",
            "/api/v1/admin/users",
            "/api/v1/admin/users?page=0"
        )
        
        foreach ($url in $testUrls) {
            Write-Host "`nTest de: $url" -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8080$url" -Method GET -Headers $headers -ErrorAction Stop
                Write-Host "✅ Succès: $($response.StatusCode)" -ForegroundColor Green
            } catch {
                Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
                if ($_.Exception.Response) {
                    Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
                    try {
                        $errorContent = $_.Exception.Response.Content
                        if ($errorContent) {
                            Write-Host "   Contenu d'erreur: $errorContent" -ForegroundColor Red
                        }
                    } catch {
                        Write-Host "   Impossible de lire le contenu d'erreur" -ForegroundColor Red
                    }
                }
            }
        }
        
    } else {
        Write-Host "❌ Échec de la connexion: $($loginResponse.StatusCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Vérification de la base de données
Write-Host "`n4. Vérification de la base de données..." -ForegroundColor Yellow
try {
    $dbResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -UseBasicParsing -ErrorAction Stop
    if ($dbResponse.StatusCode -eq 200) {
        $healthData = $dbResponse.Content | ConvertFrom-Json
        Write-Host "État de la base de données:" -ForegroundColor Cyan
        if ($healthData.components.db) {
            Write-Host "   Status: $($healthData.components.db.status)" -ForegroundColor Green
        }
        if ($healthData.components.diskSpace) {
            Write-Host "   Espace disque: $($healthData.components.diskSpace.status)" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "❌ Impossible de vérifier l'état de la base de données: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Vérification terminée ===" -ForegroundColor Green
Write-Host "`nSi l'erreur persiste, vérifiez:" -ForegroundColor Yellow
Write-Host "1. Les logs détaillés du backend" -ForegroundColor Cyan
Write-Host "2. L'état de la base de données PostgreSQL" -ForegroundColor Cyan
Write-Host "3. Les permissions de l'utilisateur admin" -ForegroundColor Cyan
Write-Host "4. La configuration JPA/Hibernate" -ForegroundColor Cyan
