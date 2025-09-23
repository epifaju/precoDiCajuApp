# Test de la correction backend
Write-Host "Test de la correction backend..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Headers @{"Content-Type"="application/json"} -Body '{"email":"test@example.com","password":"wrongpassword"}' -UseBasicParsing
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response Body:" -ForegroundColor Green
    Write-Host $response.Content -ForegroundColor White
    
} catch {
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
            Write-Host "=== Analyse de la correction ===" -ForegroundColor Cyan
            Write-Host "Message: $($errorData.message)" -ForegroundColor Yellow
            Write-Host "Type d'erreur: $($errorData.errorType)" -ForegroundColor Yellow
            
            if ($errorData.message -eq "Bad credentials") {
                Write-Host "✅ Correction réussie ! Le message est maintenant en anglais" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Le message n'est pas encore traduit: $($errorData.message)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Impossible de parser la réponse JSON" -ForegroundColor Red
        }
    }
}
