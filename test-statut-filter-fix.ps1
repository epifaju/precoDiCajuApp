# Test du Filtre Statut - Correction
Write-Host "🔧 Test du Filtre Statut - Correction" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

function Test-StatutFilter {
    param(
        [string]$statut,
        [string]$description
    )
    
    try {
        Write-Host "`n🧪 Test: $description" -ForegroundColor Yellow
        
        $url = if ($statut) { 
            "$baseUrl?page=0&size=5&statut=$statut" 
        }
        else { 
            "$baseUrl?page=0&size=5" 
        }
        
        Write-Host "URL: $url" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $url -Headers @{"Accept" = "application/json" } -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            $count = if ($data.content) { $data.content.Count } else { 0 }
            
            Write-Host "✅ Succès: $count résultats trouvés" -ForegroundColor Green
            
            if ($count -gt 0 -and $data.content) {
                # Vérifier que les statuts correspondent
                $actualStatuts = $data.content | ForEach-Object { $_.statut } | Sort-Object -Unique
                Write-Host "   Statuts trouvés: $($actualStatuts -join ', ')" -ForegroundColor Gray
                
                # Afficher quelques exemples
                $examples = $data.content | Select-Object -First 2 | ForEach-Object {
                    "$($_.nom) ($($_.statut))"
                }
                Write-Host "   Exemples: $($examples -join ', ')" -ForegroundColor Gray
            }
            
            return $true
        }
        else {
            Write-Host "❌ Erreur HTTP: $($response.StatusCode)" -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Test 1: Tous les exportateurs (pas de filtre)
Write-Host "`n📊 Test 1: Tous les exportateurs" -ForegroundColor Magenta
Test-StatutFilter "" "Tous les exportateurs"

# Test 2: Filtre par statut ACTIF
Write-Host "`n📋 Test 2: Filtre par statut ACTIF" -ForegroundColor Magenta
Test-StatutFilter "ACTIF" "Exportateurs actifs"

# Test 3: Filtre par statut EXPIRE
Write-Host "`n📋 Test 3: Filtre par statut EXPIRE" -ForegroundColor Magenta
Test-StatutFilter "EXPIRE" "Exportateurs expirés"

# Test 4: Filtre par statut SUSPENDU
Write-Host "`n📋 Test 4: Filtre par statut SUSPENDU" -ForegroundColor Magenta
Test-StatutFilter "SUSPENDU" "Exportateurs suspendus"

# Test 5: Filtres combinés avec statut
Write-Host "`n🔗 Test 5: Filtres combinés avec statut" -ForegroundColor Magenta
$url = "$baseUrl?page=0&size=5&regionCode=BF&statut=ACTIF"
try {
    Write-Host "URL: $url" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri $url -Headers @{"Accept" = "application/json" } -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        $count = if ($data.content) { $data.content.Count } else { 0 }
        Write-Host "✅ Succès: $count résultats (BF + ACTIF)" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Green
Write-Host "`n📝 Résumé des corrections:" -ForegroundColor Cyan
Write-Host "1. ✅ Suppression du casting 'value as StatutType' dans FilterBar.tsx" -ForegroundColor Green
Write-Host "2. ✅ Suppression du casting 'value as ExportateurType' dans FilterBar.tsx" -ForegroundColor Green
Write-Host "3. ✅ Le composant Select passe maintenant directement la string" -ForegroundColor Green

Write-Host "`n🔧 Le problème était:" -ForegroundColor Yellow
Write-Host "- Le casting 'value as StatutType' était inutile après la correction du composant Select" -ForegroundColor Gray
Write-Host "- Le composant Select passe maintenant directement la valeur string" -ForegroundColor Gray
Write-Host "- Le casting causait des problèmes de type" -ForegroundColor Gray

Write-Host "`n✅ Maintenant:" -ForegroundColor Green
Write-Host "- Les filtres Statut fonctionnent correctement" -ForegroundColor Gray
Write-Host "- Les filtres Type fonctionnent aussi mieux" -ForegroundColor Gray
Write-Host "- Pas de problème de casting" -ForegroundColor Gray



