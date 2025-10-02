# Script simple pour mettre a jour les dates
Write-Host "Mise a jour des dates d'expiration" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

# Test de connexion
try {
    $response = Invoke-WebRequest -Uri "$baseUrl?size=3" -UseBasicParsing
    Write-Host "Connexion OK - Status: $($response.StatusCode)" -ForegroundColor Green
    
    $data = $response.Content | ConvertFrom-Json
    Write-Host "Nombre d'exportateurs trouves: $($data.content.Count)" -ForegroundColor Gray
    
    # Afficher les premiers exportateurs
    Write-Host "`nPremiers exportateurs:" -ForegroundColor Yellow
    foreach ($exportateur in $data.content) {
        $status = if ($exportateur.actif) { "Actif" } elseif ($exportateur.expire) { "Expire" } else { "Autre" }
        Write-Host "  $($exportateur.nom): $status (Date: $($exportateur.dateExpiration))" -ForegroundColor Gray
    }
    
} catch {
    Write-Host "Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPour mettre a jour les dates, executez le script SQL:" -ForegroundColor Cyan
Write-Host "UPDATE exportateurs SET date_expiration = '2026-01-15' WHERE date_expiration < CURRENT_DATE;" -ForegroundColor White



