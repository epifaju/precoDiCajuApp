# Script simplifie pour mettre a jour les dates d'expiration
Write-Host "Mise a jour des dates d'expiration des exportateurs" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

# Recuperer tous les exportateurs
try {
    Write-Host "Recuperation des exportateurs..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=100" -Headers @{"Accept"="application/json"} -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $exportateurs = $data.content
    
    Write-Host "Trouve $($exportateurs.Count) exportateurs" -ForegroundColor Gray
    
    # Mettre a jour chaque exportateur
    foreach ($exportateur in $exportateurs) {
        $newExpirationDate = "2026-01-15"
        
        Write-Host "Mise a jour: $($exportateur.nom)" -ForegroundColor Yellow
        
        $updateData = @{
            dateExpiration = $newExpirationDate
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
            "Accept" = "application/json"
        }
        
        try {
            $response = Invoke-WebRequest -Uri "$baseUrl/$($exportateur.id)" -Method PUT -Body $updateData -Headers $headers -UseBasicParsing
            Write-Host "  Succes" -ForegroundColor Green
        } catch {
            Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Start-Sleep -Milliseconds 200
    }
    
    # Verifier les resultats
    Write-Host "Verification des resultats..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=5" -Headers @{"Accept"="application/json"} -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Etat actuel des exportateurs:" -ForegroundColor Yellow
    foreach ($exportateur in $data.content) {
        Write-Host "  $($exportateur.nom): Actif=$($exportateur.actif), Expire=$($exportateur.expire), DateExpiration=$($exportateur.dateExpiration)" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Script termine!" -ForegroundColor Green



