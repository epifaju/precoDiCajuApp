# Script simple pour mettre a jour les dates d'expiration
Write-Host "Mise a jour des dates d'expiration" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

# Recuperer tous les exportateurs
try {
    Write-Host "Recuperation des exportateurs..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=100" -Headers @{"Accept"="application/json"} -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $exportateurs = $data.content
    
    Write-Host "Trouve $($exportateurs.Count) exportateurs" -ForegroundColor Gray
    
    # Mettre a jour chaque exportateur
    $successCount = 0
    $failCount = 0
    
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
            $successCount++
        } catch {
            Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
        
        Start-Sleep -Milliseconds 200
    }
    
    Write-Host "Resume des mises a jour:" -ForegroundColor Cyan
    Write-Host "  Succes: $successCount" -ForegroundColor Green
    Write-Host "  Echecs: $failCount" -ForegroundColor Red
    
    # Verifier les resultats
    Write-Host "Verification des resultats..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=5" -Headers @{"Accept"="application/json"} -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Etat actuel des exportateurs:" -ForegroundColor Yellow
    foreach ($exportateur in $data.content) {
        $status = if ($exportateur.actif) { "Actif" } elseif ($exportateur.expire) { "Expire" } elseif ($exportateur.suspendu) { "Suspendu" } else { "Inconnu" }
        Write-Host "  $($exportateur.nom): $status (Expire: $($exportateur.dateExpiration))" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Erreur lors de la recuperation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Script termine!" -ForegroundColor Green
