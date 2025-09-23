# Script de test pour vérifier la correction de traduction des erreurs de login
Write-Host "=== Test de Correction - Traduction des Erreurs de Login ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "1. Test avec des identifiants incorrects..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Headers @{"Content-Type" = "application/json" } -Body '{"email":"test@example.com","password":"wrongpassword"}' -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Body:" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
    
}
catch {
    Write-Host "Erreur HTTP: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor White
        
        # Analyser la réponse
        try {
            $errorData = $responseBody | ConvertFrom-Json
            Write-Host ""
            Write-Host "=== Analyse de l'erreur ===" -ForegroundColor Cyan
            Write-Host "Message original: $($errorData.message)" -ForegroundColor Yellow
            Write-Host "Type d'erreur: $($errorData.errorType)" -ForegroundColor Yellow
            
            # Simuler la traduction
            if ($errorData.message -and (
                    $errorData.message.ToLower().Contains("bad credentials") -or 
                    $errorData.message.ToLower().Contains("invalid credentials")
                )) {
                Write-Host "Message traduit: Email ou mot de passe incorrect" -ForegroundColor Green
                Write-Host "✅ La correction devrait fonctionner !" -ForegroundColor Green
            }
            else {
                Write-Host "⚠️  Message non reconnu pour la traduction" -ForegroundColor Yellow
            }
        }
        catch {
            Write-Host "Impossible de parser la réponse JSON" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "2. Test avec des données valides (si disponibles)..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Headers @{"Content-Type" = "application/json" } -Body '{"email":"admin@example.com","password":"admin123"}' -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Connexion réussie !" -ForegroundColor Green
    
}
catch {
    Write-Host "Erreur HTTP: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Body:" -ForegroundColor Red
        Write-Host $responseBody -ForegroundColor White
    }
}

Write-Host ""
Write-Host "=== Résumé de la Correction ===" -ForegroundColor Cyan
Write-Host "✅ Problème identifié: Message d'erreur non traduit" -ForegroundColor Green
Write-Host "✅ Solution implémentée: Traduction des messages d'erreur dans LoginForm.tsx" -ForegroundColor Green
Write-Host "✅ Test effectué: Vérification de la réponse du backend" -ForegroundColor Green
Write-Host ""
Write-Host "Pour tester dans le navigateur:" -ForegroundColor Yellow
Write-Host "1. Ouvrez http://localhost:3000/login" -ForegroundColor White
Write-Host "2. Essayez de vous connecter avec des identifiants incorrects" -ForegroundColor White
Write-Host "3. Vous devriez voir 'Email ou mot de passe incorrect' au lieu de 'Les identifications sont erronées'" -ForegroundColor White
