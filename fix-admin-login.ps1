#!/usr/bin/env pwsh

# Script pour corriger le problème de connexion administrateur

Write-Host "=== CORRECTION DU PROBLEME DE CONNEXION ADMIN ===" -ForegroundColor Cyan

# Configuration
$BACKEND_URL = "http://localhost:8080"

# Hash BCrypt correct pour "admin123" (généré avec bcrypt force 10)
$CORRECT_HASH = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf6'

Write-Host "[INFO] Correction du hash de mot de passe dans la base de données..." -ForegroundColor Blue

# Commande SQL pour corriger le hash
$sqlCommand = "UPDATE users SET password_hash = '$CORRECT_HASH' WHERE email = 'admin@precaju.gw';"

try {
    # Exécuter la commande SQL
    docker exec precaju-postgres psql -U precaju -d precaju -c $sqlCommand
    Write-Host "[OK] Hash de mot de passe corrigé" -ForegroundColor Green
}
catch {
    Write-Host "[ERROR] Erreur lors de la correction: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre un peu pour que la base de données se synchronise
Start-Sleep -Seconds 2

Write-Host "[INFO] Test de connexion avec admin@precaju.gw..." -ForegroundColor Blue

# Test de connexion
try {
    $body = @{
        email      = "admin@precaju.gw"
        password   = "admin123"
        rememberMe = $false
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$BACKEND_URL/api/v1/auth/login" -Method POST -Body $body -ContentType "application/json"
    
    Write-Host "[OK] CONNEXION REUSSIE!" -ForegroundColor Green
    Write-Host "Utilisateur: $($response.user.email)" -ForegroundColor Green
    Write-Host "Rôle: $($response.user.role)" -ForegroundColor Green
    Write-Host "Token d'accès généré avec succès" -ForegroundColor Green
    
}
catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse) {
        $statusCode = $errorResponse.StatusCode.value__
        Write-Host "[ERROR] Échec de la connexion - Code: $statusCode" -ForegroundColor Red
        
        $reader = [System.IO.StreamReader]::new($errorResponse.GetResponseStream())
        $errorContent = $reader.ReadToEnd()
        $reader.Close()
        
        try {
            $errorJson = $errorContent | ConvertFrom-Json
            Write-Host "Détails de l'erreur: $($errorJson.message)" -ForegroundColor Red
        }
        catch {
            Write-Host "Contenu de l'erreur: $errorContent" -ForegroundColor Red
        }
    }
    else {
        Write-Host "[ERROR] Erreur de réseau: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=== VERIFICATION COMPLETE ===" -ForegroundColor Cyan
