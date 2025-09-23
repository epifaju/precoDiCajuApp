#!/usr/bin/env pwsh

# Script de débogage pour identifier le problème de connexion avec erreur 400

Write-Host "=== DIAGNOSTIC DE CONNEXION AVEC ERREUR 400 ===" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "http://localhost:8080"
$TEST_EMAIL = "admin@precaju.gw"
$TEST_PASSWORD = "admin123"

# Couleurs pour les messages
function Write-Success { param($Message) Write-Host "[OK] $Message" -ForegroundColor Green }
function Write-Error { param($Message) Write-Host "[ERROR] $Message" -ForegroundColor Red }
function Write-Info { param($Message) Write-Host "[INFO] $Message" -ForegroundColor Blue }
function Write-Warning { param($Message) Write-Host "[WARNING] $Message" -ForegroundColor Yellow }

# 1. Vérifier si le backend est en cours d'exécution
Write-Info "Vérification du statut du backend..."
try {
    $healthResponse = Invoke-RestMethod -Uri "$BACKEND_URL/actuator/health" -Method GET -TimeoutSec 5
    Write-Success "Backend disponible: $($healthResponse.status)"
} catch {
    Write-Error "Backend non accessible: $($_.Exception.Message)"
    Write-Warning "Démarrez le backend avec: ./start-backend-clean.ps1"
    exit 1
}

# 2. Test basique de l'endpoint d'authentification
Write-Info "Test de l'endpoint d'authentification..."
try {
    $testResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/auth/login" -Method POST -ContentType "application/json" -Body '{}' -ErrorAction SilentlyContinue
    Write-Info "Code de réponse pour requête vide: $($testResponse.StatusCode)"
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = $errorResponse.StatusCode.value__
        Write-Info "Code de réponse pour requête vide: $statusCode"
        
        # Lire le contenu de l'erreur
        $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Info "Erreur de validation détectée:"
            Write-Host ($errorJson | ConvertTo-Json -Depth 3) -ForegroundColor Yellow
        } catch {
            Write-Info "Contenu de l'erreur: $errorContent"
        }
    }
}

# 3. Test avec données invalides pour voir la validation
Write-Info "Test avec email invalide..."
try {
    $invalidEmailBody = @{
        email = "invalid-email"
        password = "123"
        rememberMe = $false
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $invalidEmailBody -ErrorAction SilentlyContinue
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = $errorResponse.StatusCode.value__
        Write-Info "Code de réponse pour email invalide: $statusCode"
        
        $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Info "Détails de validation:"
            Write-Host ($errorJson | ConvertTo-Json -Depth 3) -ForegroundColor Yellow
        } catch {
            Write-Info "Contenu de l'erreur: $errorContent"
        }
    }
}

# 4. Test avec les bonnes données de format mais mauvaises informations
Write-Info "Test avec format correct mais mauvaises informations d'identification..."
try {
    $wrongCredentialsBody = @{
        email = "wrong@email.com"
        password = "wrongpassword"
        rememberMe = $false
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $wrongCredentialsBody -ErrorAction SilentlyContinue
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = $errorResponse.StatusCode.value__
        Write-Info "Code de réponse pour mauvaises informations: $statusCode"
        
        $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Info "Détails de l'erreur d'authentification:"
            Write-Host ($errorJson | ConvertTo-Json -Depth 3) -ForegroundColor Yellow
        } catch {
            Write-Info "Contenu de l'erreur: $errorContent"
        }
    }
}

# 5. Test avec les bonnes informations d'identification
Write-Info "Test avec les bonnes informations d'identification..."
try {
    $validCredentialsBody = @{
        email = $TEST_EMAIL
        password = $TEST_PASSWORD
        rememberMe = $false
    } | ConvertTo-Json

    Write-Info "Corps de la requête: $validCredentialsBody"

    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $validCredentialsBody
    Write-Success "Connexion réussie!"
    Write-Info "Utilisateur: $($response.user.email)"
    Write-Info "Rôle: $($response.user.role)"
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = $errorResponse.StatusCode.value__
        Write-Error "Échec de la connexion - Code: $statusCode"
        
        $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Error "Détails de l'erreur:"
            Write-Host ($errorJson | ConvertTo-Json -Depth 3) -ForegroundColor Red
            
            # Analyse de l'erreur 400
            if ($statusCode -eq 400) {
                Write-Warning "ERREUR 400 DÉTECTÉE - Causes possibles:"
                if ($errorJson.errorCode -eq "VALIDATION_ERROR") {
                    Write-Warning "1. Erreur de validation des champs"
                    Write-Warning "2. Format JSON incorrect"
                    Write-Warning "3. Champs obligatoires manquants"
                } elseif ($errorJson.errorCode -eq "JSON_PARSE_ERROR") {
                    Write-Warning "1. JSON mal formé"
                    Write-Warning "2. Content-Type incorrect"
                } else {
                    Write-Warning "1. Données d'entrée invalides"
                    Write-Warning "2. Contraintes de validation non respectées"
                }
            }
        } catch {
            Write-Error "Contenu de l'erreur: $errorContent"
        }
    } else {
        Write-Error "Erreur de réseau: $($_.Exception.Message)"
    }
}

# 6. Test du frontend
Write-Info "Test de l'URL du frontend..."
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -ErrorAction SilentlyContinue
    Write-Success "Frontend accessible"
} catch {
    Write-Warning "Frontend non accessible sur http://localhost:5173"
    Write-Info "Vérifiez si le frontend est démarré"
}

# 7. Vérification des logs du backend
Write-Info "Pour voir les logs du backend en temps réel, exécutez:"
Write-Host "docker-compose logs -f backend" -ForegroundColor Cyan

Write-Host "`n=== FIN DU DIAGNOSTIC ===" -ForegroundColor Cyan
