# Script pour mettre à jour les dates d'expiration via l'API
Write-Host "Mise à jour des dates d'expiration des exportateurs" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

# Fonction pour mettre à jour un exportateur
function Update-ExportateurDate {
    param(
        [string]$id,
        [string]$nom,
        [string]$newExpirationDate
    )
    
    try {
        Write-Host "Mise à jour: $nom" -ForegroundColor Yellow
        Write-Host "  Nouvelle date: $newExpirationDate" -ForegroundColor Gray
        
        $updateData = @{
            dateExpiration = $newExpirationDate
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
            "Accept"       = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$baseUrl/$id" -Method PUT -Body $updateData -Headers $headers -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "  ✅ Succès" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "  ❌ Erreur HTTP: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "  ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Récupérer tous les exportateurs
try {
    Write-Host "Récupération des exportateurs..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=100" -Headers @{"Accept" = "application/json" } -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $exportateurs = $data.content
    
    Write-Host "Trouvé $($exportateurs.Count) exportateurs" -ForegroundColor Gray
    
    # Mettre à jour chaque exportateur
    $successCount = 0
    $failCount = 0
    
    foreach ($exportateur in $exportateurs) {
        # Générer une nouvelle date d'expiration (1 an dans le futur)
        $currentDate = Get-Date
        $newExpirationDate = $currentDate.AddYears(1).ToString("yyyy-MM-dd")
        
        $success = Update-ExportateurDate -id $exportateur.id -nom $exportateur.nom -newExpirationDate $newExpirationDate
        
        if ($success) {
            $successCount++
        }
        else {
            $failCount++
        }
        
        # Pause pour éviter de surcharger l'API
        Start-Sleep -Milliseconds 200
    }
    
    Write-Host "`nRésumé des mises à jour:" -ForegroundColor Cyan
    Write-Host "  ✅ Succès: $successCount" -ForegroundColor Green
    Write-Host "  ❌ Échecs: $failCount" -ForegroundColor Red
    
    # Vérifier les résultats
    Write-Host "`nVérification des résultats..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=5" -Headers @{"Accept" = "application/json" } -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "État actuel des exportateurs:" -ForegroundColor Yellow
    foreach ($exportateur in $data.content) {
        $status = if ($exportateur.actif) { "✅ Actif" } elseif ($exportateur.expire) { "⚠️ Expiré" } elseif ($exportateur.suspendu) { "🚫 Suspendu" } else { "❓ Inconnu" }
        Write-Host "  $($exportateur.nom): $status (Expire: $($exportateur.dateExpiration))" -ForegroundColor Gray
    }
    
}
catch {
    Write-Host "❌ Erreur lors de la récupération: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Script terminé!" -ForegroundColor Green



