# Script pour mettre a jour les dates d'expiration
Write-Host "Mise a jour des dates d'expiration des exportateurs" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

try {
    # Recuperer tous les exportateurs
    Write-Host "Recuperation des exportateurs..." -ForegroundColor Magenta
    $exportateurs = Invoke-RestMethod -Uri "$baseUrl?size=100" -Method Get
    
    Write-Host "Trouve $($exportateurs.content.Count) exportateurs" -ForegroundColor Gray
    
    $successCount = 0
    $failCount = 0
    
    # Mettre a jour chaque exportateur
    foreach ($exportateur in $exportateurs.content) {
        Write-Host "Mise a jour: $($exportateur.nom)" -ForegroundColor Yellow
        
        # Nouvelle date d'expiration (1 an dans le futur)
        $newExpirationDate = "2026-01-15"
        
        # Donnees de mise a jour
        $updateData = @{
            dateExpiration = $newExpirationDate
        }
        
        try {
            # Mettre a jour l'exportateur
            $response = Invoke-RestMethod -Uri "$baseUrl/$($exportateur.id)" -Method Put -Body ($updateData | ConvertTo-Json) -ContentType "application/json"
            Write-Host "  Succes - Nouvelle date: $newExpirationDate" -ForegroundColor Green
            $successCount++
        } catch {
            Write-Host "  Erreur: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
        
        # Pause pour eviter de surcharger l'API
        Start-Sleep -Milliseconds 300
    }
    
    Write-Host "`nResume des mises a jour:" -ForegroundColor Cyan
    Write-Host "  Succes: $successCount" -ForegroundColor Green
    Write-Host "  Echecs: $failCount" -ForegroundColor Red
    
    # Verifier les resultats
    Write-Host "`nVerification des resultats..." -ForegroundColor Magenta
    $updatedExportateurs = Invoke-RestMethod -Uri "$baseUrl?size=5" -Method Get
    
    Write-Host "Etat actuel des exportateurs:" -ForegroundColor Yellow
    foreach ($exportateur in $updatedExportateurs.content) {
        $status = if ($exportateur.actif) { "Actif" } elseif ($exportateur.expire) { "Expire" } elseif ($exportateur.suspendu) { "Suspendu" } else { "Inconnu" }
        Write-Host "  $($exportateur.nom): $status (Expire: $($exportateur.dateExpiration))" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Erreur generale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nScript termine!" -ForegroundColor Green
