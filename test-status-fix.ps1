# Script simple pour tester la correction des statuts
Write-Host "Test des statuts des exportateurs" -ForegroundColor Cyan

# Test avant correction
Write-Host "`nAVANT correction:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/exportateurs?size=3" -Headers @{"Accept" = "application/json" }
    $data = $response.Content | ConvertFrom-Json
    
    foreach ($exportateur in $data.content) {
        $status = if ($exportateur.actif) { "Actif" } elseif ($exportateur.expire) { "Expire" } elseif ($exportateur.suspendu) { "Suspendu" } else { "Inconnu" }
        Write-Host "  $($exportateur.nom): $status (DateExpiration: $($exportateur.dateExpiration))" -ForegroundColor Gray
    }
}
catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nPour corriger le probleme:" -ForegroundColor Cyan
Write-Host "1. Ouvrez votre base de donnees PostgreSQL" -ForegroundColor White
Write-Host "2. Executez le script fix-exportateur-dates.sql" -ForegroundColor White
Write-Host "3. Relancez ce script pour verifier" -ForegroundColor White

Write-Host "`nLe probleme:" -ForegroundColor Red
Write-Host "- Date actuelle: $(Get-Date -Format 'yyyy-MM-dd')" -ForegroundColor Gray
Write-Host "- Dates d'expiration: janvier-fevrier 2025" -ForegroundColor Gray
Write-Host "- Resultat: Toutes les certifications sont expirees" -ForegroundColor Gray

Write-Host "`nLa solution:" -ForegroundColor Green
Write-Host "- Mettre a jour les dates d'expiration pour 2026" -ForegroundColor Gray
Write-Host "- Les statuts seront alors correctement calcules" -ForegroundColor Gray
