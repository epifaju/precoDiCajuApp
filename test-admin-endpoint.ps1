# Script de test pour l'endpoint admin
Write-Host "=== Test de l'endpoint admin ===" -ForegroundColor Green

# 1. Connexion pour obtenir le token JWT
Write-Host "1. Connexion en cours..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@precaju.gw"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    
    $token = $loginResponse.refresh_token
    Write-Host "✓ Connexion réussie" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Cyan
} catch {
    Write-Host "✗ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Test de l'endpoint admin avec le token
Write-Host "`n2. Test de l'endpoint admin..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }
    
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=20" -Method GET -Headers $headers
    
    Write-Host "✓ Endpoint admin fonctionne" -ForegroundColor Green
    Write-Host "Nombre d'utilisateurs: $($adminResponse.totalElements)" -ForegroundColor Cyan
    Write-Host "Page actuelle: $($adminResponse.page)" -ForegroundColor Cyan
    Write-Host "Taille de page: $($adminResponse.size)" -ForegroundColor Cyan
    
} catch {
    Write-Host "✗ Erreur endpoint admin: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "Code de statut: $statusCode" -ForegroundColor Red
        
        # Lire le corps de la réponse d'erreur
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "Corps de l'erreur: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "Impossible de lire le corps de l'erreur" -ForegroundColor Red
        }
    }
}

Write-Host "`n=== Test terminé ===" -ForegroundColor Green
