# Script pour tester la creation d'exportateurs avec des dates futures
Write-Host "Test de creation d'exportateurs avec dates futures" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

# Donnees de test pour un nouvel exportateur
$newExportateur = @{
    nom = "Test Exportateur Actif"
    numeroAgrement = "TEST-001-2025"
    type = "EXPORTATEUR"
    regionCode = "BF"
    telephone = "+245123456789"
    email = "test@example.com"
    dateCertification = "2025-01-01"
    dateExpiration = "2026-01-01"
    statut = "ACTIF"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
    "Accept" = "application/json"
}

try {
    Write-Host "Creation d'un nouvel exportateur avec date d'expiration future..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri $baseUrl -Method POST -Body $newExportateur -Headers $headers -UseBasicParsing
    
    if ($response.StatusCode -eq 201) {
        Write-Host "Exportateur cree avec succes!" -ForegroundColor Green
        $createdData = $response.Content | ConvertFrom-Json
        Write-Host "ID: $($createdData.id)" -ForegroundColor Gray
        Write-Host "Nom: $($createdData.nom)" -ForegroundColor Gray
        Write-Host "DateExpiration: $($createdData.dateExpiration)" -ForegroundColor Gray
        Write-Host "Actif: $($createdData.actif)" -ForegroundColor Gray
        Write-Host "Expire: $($createdData.expire)" -ForegroundColor Gray
    } else {
        Write-Host "Erreur HTTP: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nVerification des exportateurs existants..." -ForegroundColor Magenta
try {
    $response = Invoke-WebRequest -Uri "$baseUrl?size=5" -Headers @{"Accept"="application/json"} -UseBasicParsing
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Etat des exportateurs:" -ForegroundColor Yellow
    foreach ($exportateur in $data.content) {
        $status = if ($exportateur.actif) { "Actif" } elseif ($exportateur.expire) { "Expire" } elseif ($exportateur.suspendu) { "Suspendu" } else { "Inconnu" }
        Write-Host "  $($exportateur.nom): $status (Expire: $($exportateur.dateExpiration))" -ForegroundColor Gray
    }
} catch {
    Write-Host "Erreur lors de la verification: $($_.Exception.Message)" -ForegroundColor Red
}
