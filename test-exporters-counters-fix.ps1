# Test des compteurs exportateurs corrigés
Write-Host "🔍 Test des Compteurs Exportateurs Corrigés" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Fonction pour faire des requêtes API
function Invoke-ApiRequest {
    param(
        [string]$Uri,
        [string]$Method = "GET"
    )
    
    try {
        $response = Invoke-RestMethod -Uri $Uri -Method $Method -ContentType "application/json"
        return $response
    }
    catch {
        Write-Host "❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# Test 1: Récupérer les exportateurs
Write-Host "`n📊 Test 1: Récupération des exportateurs..." -ForegroundColor Yellow
$exportersResponse = Invoke-ApiRequest -Uri "http://localhost:8080/api/v1/exportateurs?page=0&size=100"

if ($exportersResponse) {
    Write-Host "✅ Exportateurs récupérés avec succès" -ForegroundColor Green
    Write-Host "   Total d'éléments: $($exportersResponse.totalElements)" -ForegroundColor White
    Write-Host "   Nombre de pages: $($exportersResponse.totalPages)" -ForegroundColor White
    Write-Host "   Exportateurs sur cette page: $($exportersResponse.content.Count)" -ForegroundColor White
    
    # Calculer les statistiques depuis les données des exportateurs
    $exportersStats = @{
        Total = $exportersResponse.totalElements
        Active = ($exportersResponse.content | Where-Object { $_.statut -eq "ACTIF" }).Count
        Expired = ($exportersResponse.content | Where-Object { $_.statut -eq "EXPIRE" }).Count
        Suspended = ($exportersResponse.content | Where-Object { $_.statut -eq "SUSPENDU" }).Count
    }
    
    Write-Host "   Statistiques calculées depuis les exportateurs:" -ForegroundColor White
    Write-Host "     - Total: $($exportersStats.Total)" -ForegroundColor White
    Write-Host "     - Actifs: $($exportersStats.Active)" -ForegroundColor White
    Write-Host "     - Expirés: $($exportersStats.Expired)" -ForegroundColor White
    Write-Host "     - Suspendus: $($exportersStats.Suspended)" -ForegroundColor White
} else {
    Write-Host "❌ Impossible de récupérer les exportateurs" -ForegroundColor Red
    exit 1
}

# Test 2: Récupérer les statistiques
Write-Host "`n📈 Test 2: Récupération des statistiques..." -ForegroundColor Yellow
$statisticsResponse = Invoke-ApiRequest -Uri "http://localhost:8080/api/v1/exportateurs/statistics"

if ($statisticsResponse) {
    Write-Host "✅ Statistiques récupérées avec succès" -ForegroundColor Green
    Write-Host "   Nombre de groupes de statistiques: $($statisticsResponse.Count)" -ForegroundColor White
    
    # Calculer les statistiques depuis l'API statistics
    $apiStats = @{
        Total = 0
        Active = 0
        Expired = 0
        Suspended = 0
    }
    
    foreach ($stat in $statisticsResponse) {
        $count = $stat[2]
        $status = $stat[1]
        $region = $stat[0]
        
        $apiStats.Total += $count
        
        switch ($status) {
            "ACTIF" { $apiStats.Active += $count }
            "EXPIRE" { $apiStats.Expired += $count }
            "SUSPENDU" { $apiStats.Suspended += $count }
        }
        
        Write-Host "     $region - $status : $count" -ForegroundColor Gray
    }
    
    Write-Host "   Statistiques calculées depuis l'API:" -ForegroundColor White
    Write-Host "     - Total: $($apiStats.Total)" -ForegroundColor White
    Write-Host "     - Actifs: $($apiStats.Active)" -ForegroundColor White
    Write-Host "     - Expirés: $($apiStats.Expired)" -ForegroundColor White
    Write-Host "     - Suspendus: $($apiStats.Suspended)" -ForegroundColor White
} else {
    Write-Host "❌ Impossible de récupérer les statistiques" -ForegroundColor Red
    exit 1
}

# Test 3: Comparaison des compteurs
Write-Host "`n⚖️ Test 3: Comparaison des compteurs..." -ForegroundColor Yellow

$comparisons = @(
    @{ Name = "Total"; Exporters = $exportersStats.Total; API = $apiStats.Total },
    @{ Name = "Actifs"; Exporters = $exportersStats.Active; API = $apiStats.Active },
    @{ Name = "Expirés"; Exporters = $exportersStats.Expired; API = $apiStats.Expired },
    @{ Name = "Suspendus"; Exporters = $exportersStats.Suspended; API = $apiStats.Suspended }
)

$allMatch = $true

foreach ($comp in $comparisons) {
    if ($comp.Exporters -eq $comp.API) {
        Write-Host "✅ $($comp.Name): $($comp.Exporters) (cohérent)" -ForegroundColor Green
    } else {
        Write-Host "❌ $($comp.Name): Exportateurs=$($comp.Exporters), API=$($comp.API) (incohérent)" -ForegroundColor Red
        $allMatch = $false
    }
}

# Test 4: Vérification du problème original
Write-Host "`n🔍 Test 4: Vérification du problème original..." -ForegroundColor Yellow

$pageSize = $exportersResponse.content.Count
$isPageBasedCount = ($exportersStats.Active -le $pageSize) -and 
                   ($exportersStats.Expired -le $pageSize) -and 
                   ($exportersStats.Suspended -le $pageSize)

if ($isPageBasedCount -and $apiStats.Total -gt $pageSize) {
    Write-Host "🚨 PROBLÈME DÉTECTÉ: Les compteurs semblent basés sur la page courante au lieu du total" -ForegroundColor Red
    Write-Host "   Taille de la page: $pageSize" -ForegroundColor Red
    Write-Host "   Total réel: $($apiStats.Total)" -ForegroundColor Red
} else {
    Write-Host "✅ Les compteurs semblent utiliser les bonnes données" -ForegroundColor Green
}

# Résumé final
Write-Host "`n📋 Résumé Final:" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

if ($allMatch) {
    Write-Host "🎉 Tous les compteurs sont cohérents entre les deux APIs !" -ForegroundColor Green
} else {
    Write-Host "⚠️ Il y a des incohérences dans les compteurs" -ForegroundColor Yellow
}

Write-Host "`n📊 Valeurs attendues dans l'interface:" -ForegroundColor Cyan
Write-Host "   - Total Exportateurs: $($apiStats.Total)" -ForegroundColor White
Write-Host "   - Actifs: $($apiStats.Active)" -ForegroundColor White
Write-Host "   - Expirés: $($apiStats.Expired)" -ForegroundColor White
Write-Host "   - Suspendus: $($apiStats.Suspended)" -ForegroundColor White

Write-Host "`n✅ Test terminé !" -ForegroundColor Green



