# Script pour démarrer le backend proprement
Write-Host "=== DÉMARRAGE PROPRE DU BACKEND ===" -ForegroundColor Green
Write-Host ""

# 1. Arrêter les processus Java existants (si possible)
Write-Host "1. Arrêt des processus Java existants..." -ForegroundColor Yellow
try {
    $javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
    if ($javaProcesses) {
        Write-Host "   Arrêt de $($javaProcesses.Count) processus Java..." -ForegroundColor Cyan
        foreach ($process in $javaProcesses) {
            try {
                $process.Kill()
                Write-Host "      ✅ PID $($process.Id) arrêté" -ForegroundColor Green
            } catch {
                Write-Host "      ⚠️  PID $($process.Id) ne peut pas être arrêté: $($_.Exception.Message)" -ForegroundColor Yellow
            }
        }
        Start-Sleep -Seconds 3
    } else {
        Write-Host "   ℹ️  Aucun processus Java en cours d'exécution" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# 2. Vérifier que le port 8080 est libre
Write-Host "2. Vérification du port 8080..." -ForegroundColor Yellow
try {
    $portCheck = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
    if ($portCheck) {
        Write-Host "   ⚠️  Le port 8080 est encore utilisé, attente..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    } else {
        Write-Host "   ✅ Port 8080 libre" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✅ Port 8080 libre" -ForegroundColor Green
}

Write-Host ""

# 3. Compiler le projet
Write-Host "3. Compilation du projet..." -ForegroundColor Yellow
try {
    Set-Location backend
    Write-Host "   Compilation avec Maven..." -ForegroundColor Cyan
    mvn clean compile -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Compilation réussie" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur de compilation" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors de la compilation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 4. Démarrer le backend
Write-Host "4. Démarrage du backend..." -ForegroundColor Yellow
try {
    Write-Host "   Démarrage avec Spring Boot..." -ForegroundColor Cyan
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "backend" -WindowStyle Hidden
    
    # Attendre que le backend démarre
    Write-Host "   Attente du démarrage..." -ForegroundColor Cyan
    $maxAttempts = 30
    $attempt = 0
    $started = $false
    
    while ($attempt -lt $maxAttempts -and -not $started) {
        $attempt++
        Start-Sleep -Seconds 2
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $started = $true
                Write-Host "   ✅ Backend démarré avec succès après $($attempt * 2) secondes" -ForegroundColor Green
            }
        } catch {
            Write-Host "   ⏳ Tentative $attempt/$maxAttempts..." -ForegroundColor Cyan
        }
    }
    
    if (-not $started) {
        Write-Host "   ❌ Le backend n'a pas démarré dans le délai imparti" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 5. Test rapide des endpoints
Write-Host "5. Test rapide des endpoints..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=20" -Method GET -ErrorAction SilentlyContinue
    Write-Host "   ❌ ERREUR: L'endpoint retourne $($response.StatusCode) au lieu de 401" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "   ✅ SUCCÈS: Endpoint /admin/users fonctionne correctement (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  ATTENTION: Statut inattendu: $statusCode" -ForegroundColor Yellow
    }
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users/stats" -Method GET -ErrorAction SilentlyContinue
    Write-Host "   ❌ ERREUR: L'endpoint retourne $($response.StatusCode) au lieu de 401" -ForegroundColor Red
} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 401) {
        Write-Host "   ✅ SUCCÈS: Endpoint /admin/users/stats fonctionne correctement (401 Unauthorized)" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  ATTENTION: Statut inattendu: $statusCode" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== RÉSUMÉ ===" -ForegroundColor Green
Write-Host "✅ Backend démarré avec succès" -ForegroundColor Green
Write-Host "✅ Corrections appliquées:" -ForegroundColor Green
Write-Host "   - Logs détaillés dans AdminController" -ForegroundColor Cyan
Write-Host "   - Logs détaillés dans UserService" -ForegroundColor Cyan
Write-Host "   - Gestion d'erreurs améliorée" -ForegroundColor Cyan
Write-Host "   - Validation des paramètres" -ForegroundColor Cyan
Write-Host "   - Gestionnaires d'exceptions spécifiques" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== PROCHAINES ÉTAPES ===" -ForegroundColor Yellow
Write-Host "1. Tester avec un utilisateur admin authentifié" -ForegroundColor Cyan
Write-Host "2. Vérifier les logs pour identifier les problèmes exacts" -ForegroundColor Cyan
Write-Host "3. Si les erreurs 500 persistent, vérifier l'authentification côté frontend" -ForegroundColor Cyan

Write-Host ""
Write-Host "=== FIN DU DÉMARRAGE ===" -ForegroundColor Green

# Retourner au répertoire racine
Set-Location ..
