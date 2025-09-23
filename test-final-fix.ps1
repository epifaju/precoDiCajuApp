# Test final de la correction
Write-Host "Test final de la correction..." -ForegroundColor Yellow

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
            Write-Host "=== Résultat Final ===" -ForegroundColor Cyan
            Write-Host "Message: $($errorData.message)" -ForegroundColor Yellow
            Write-Host "Type d'erreur: $($errorData.errorType)" -ForegroundColor Yellow
            
            if ($errorData.message -eq "Bad credentials") {
                Write-Host "✅ SUCCÈS ! Le message est maintenant traduit en anglais" -ForegroundColor Green
                Write-Host "✅ Le frontend pourra maintenant traduire ce message en français" -ForegroundColor Green
            } elseif ($errorData.message -eq "Les identifications sont erronées") {
                Write-Host "❌ Le message est encore en français dans le backend" -ForegroundColor Red
                Write-Host "❌ La correction backend n'a pas pris effet" -ForegroundColor Red
            } else {
                Write-Host "⚠️  Message inattendu: $($errorData.message)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "Impossible de parser la réponse JSON" -ForegroundColor Red
        }
    }
}
