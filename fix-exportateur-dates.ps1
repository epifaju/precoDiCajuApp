# Script pour mettre à jour les dates d'expiration des exportateurs
Write-Host "🔧 Mise à jour des dates d'expiration des exportateurs" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

# Fonction pour mettre à jour un exportateur
function Update-Exportateur {
    param(
        [string]$id,
        [string]$nom,
        [string]$newExpirationDate
    )
    
    try {
        Write-Host "`n🔄 Mise à jour: $nom" -ForegroundColor Yellow
        Write-Host "   Nouvelle date d'expiration: $newExpirationDate" -ForegroundColor Gray
        
        $updateData = @{
            dateExpiration = $newExpirationDate
        } | ConvertTo-Json
        
        $headers = @{
            "Content-Type" = "application/json"
            "Accept"       = "application/json"
        }
        
        $response = Invoke-WebRequest -Uri "$baseUrl/$id" -Method PUT -Body $updateData -Headers $headers -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Mis à jour avec succès" -ForegroundColor Green
            return $true
        }
        else {
            Write-Host "   ❌ Erreur HTTP: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Récupérer tous les exportateurs
try {
    Write-Host "`n📋 Récupération des exportateurs..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=100" -Headers @{"Accept" = "application/json" } -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    $exportateurs = $data.content
    
    Write-Host "   Trouvé $($exportateurs.Count) exportateurs" -ForegroundColor Gray
    
    # Mettre à jour chaque exportateur avec une nouvelle date d'expiration
    $successCount = 0
    $failCount = 0
    
    foreach ($exportateur in $exportateurs) {
        # Générer une nouvelle date d'expiration (1 an dans le futur)
        $currentDate = Get-Date
        $newExpirationDate = $currentDate.AddYears(1).ToString("yyyy-MM-dd")
        
        $success = Update-Exportateur -id $exportateur.id -nom $exportateur.nom -newExpirationDate $newExpirationDate
        
        if ($success) {
            $successCount++
        }
        else {
            $failCount++
        }
        
        # Pause pour éviter de surcharger l'API
        Start-Sleep -Milliseconds 100
    }
    
    Write-Host "`n📊 Résumé des mises à jour:" -ForegroundColor Cyan
    Write-Host "   ✅ Succès: $successCount" -ForegroundColor Green
    Write-Host "   ❌ Échecs: $failCount" -ForegroundColor Red
    
    # Vérifier les résultats
    Write-Host "`n🔍 Vérification des résultats..." -ForegroundColor Magenta
    $response = Invoke-WebRequest -Uri "$baseUrl?size=5" -Headers @{"Accept" = "application/json" } -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "`n📋 État actuel des exportateurs:" -ForegroundColor Yellow
    foreach ($exportateur in $data.content) {
        $status = if ($exportateur.actif) { "✅ Actif" } elseif ($exportateur.expire) { "⚠️ Expiré" } elseif ($exportateur.suspendu) { "🚫 Suspendu" } else { "❓ Inconnu" }
        Write-Host "   $($exportateur.nom): $status (Expire: $($exportateur.dateExpiration))" -ForegroundColor Gray
    }
    
}
catch {
    Write-Host "❌ Erreur lors de la récupération des exportateurs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Script terminé!" -ForegroundColor Green
Write-Host "`n📝 Explication du problème:" -ForegroundColor Cyan
Write-Host "- Les dates d'expiration étaient en janvier-février 2025" -ForegroundColor Gray
Write-Host "- Nous sommes maintenant en septembre 2025" -ForegroundColor Gray
Write-Host "- Toutes les certifications étaient donc expirées" -ForegroundColor Gray
Write-Host "- Solution: Mise à jour des dates pour 2026" -ForegroundColor Gray
