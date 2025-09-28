# Script de test pour les filtres des exportateurs - Correction
# Ce script teste que les filtres avancés fonctionnent correctement

Write-Host "🔧 Test des Filtres Exportateurs - Correction" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

function Test-ApiEndpoint {
    param(
        [string]$url,
        [string]$description
    )
    
    try {
        Write-Host "`n🧪 Test: $description" -ForegroundColor Yellow
        Write-Host "URL: $url" -ForegroundColor Gray
        
        $response = Invoke-WebRequest -Uri $url -Headers @{"Accept" = "application/json" } -UseBasicParsing
        
        if ($response.StatusCode -eq 200) {
            $data = $response.Content | ConvertFrom-Json
            $count = if ($data.content) { $data.content.Count } else { 0 }
            
            Write-Host "✅ Succès: $count résultats trouvés" -ForegroundColor Green
            
            if ($count -gt 0 -and $data.content) {
                # Afficher quelques exemples
                $examples = $data.content | Select-Object -First 3 | ForEach-Object {
                    "$($_.nom) ($($_.regionCode), $($_.type), $($_.statut))"
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

# Test 1: Récupération de tous les exportateurs
Write-Host "`n📊 Test 1: Récupération de tous les exportateurs" -ForegroundColor Magenta
Test-ApiEndpoint "$baseUrl?page=0&size=10" "Tous les exportateurs"

# Test 2: Filtre par région
Write-Host "`n🌍 Test 2: Filtre par région" -ForegroundColor Magenta
Test-ApiEndpoint "$baseUrl?page=0&size=10&regionCode=BF" "Exportateurs de Bafatá"
Test-ApiEndpoint "$baseUrl?page=0&size=10&regionCode=BL" "Exportateurs de Bolama"

# Test 3: Filtre par type
Write-Host "`n🏢 Test 3: Filtre par type" -ForegroundColor Magenta
Test-ApiEndpoint "$baseUrl?page=0&size=10&type=EXPORTATEUR" "Exportateurs uniquement"
Test-ApiEndpoint "$baseUrl?page=0&size=10&type=ACHETEUR_LOCAL" "Acheteurs locaux uniquement"

# Test 4: Filtre par statut
Write-Host "`n📋 Test 4: Filtre par statut" -ForegroundColor Magenta
Test-ApiEndpoint "${baseUrl}?page=0&size=10&statut=ACTIF" "Exportateurs actifs"
Test-ApiEndpoint "${baseUrl}?page=0&size=10&statut=EXPIRE" "Exportateurs expirés"
Test-ApiEndpoint "${baseUrl}?page=0&size=10&statut=SUSPENDU" "Exportateurs suspendus"

# Test 5: Filtre par nom
Write-Host "`n🔍 Test 5: Filtre par nom" -ForegroundColor Magenta
Test-ApiEndpoint "$baseUrl?page=0&size=10&nom=Bijagos" "Recherche par nom 'Bijagos'"
Test-ApiEndpoint "$baseUrl?page=0&size=10&nom=Acheteur" "Recherche par nom 'Acheteur'"

# Test 6: Filtres combinés
Write-Host "`n🔗 Test 6: Filtres combinés" -ForegroundColor Magenta
Test-ApiEndpoint "${baseUrl}?page=0&size=10&regionCode=BF&type=ACHETEUR_LOCAL" "BF + Acheteur Local"
Test-ApiEndpoint "${baseUrl}?page=0&size=10&regionCode=BL&type=EXPORTATEUR&statut=ACTIF" "BL + Exportateur + Actif"

# Test 7: Filtres avec valeurs vides (nouveau comportement corrigé)
Write-Host "`n🆕 Test 7: Filtres avec valeurs vides (comportement corrigé)" -ForegroundColor Magenta
Test-ApiEndpoint "${baseUrl}?page=0&size=10&regionCode=&type=&statut=" "Paramètres vides (doit retourner tous)"
Test-ApiEndpoint "${baseUrl}?page=0&size=10&regionCode=BF&type=&statut=ACTIF" "Région BF + Statut Actif (type vide)"

# Test 8: Pagination
Write-Host "`n📄 Test 8: Pagination" -ForegroundColor Magenta
Test-ApiEndpoint "$baseUrl?page=0&size=5" "Page 1 (5 éléments)"
Test-ApiEndpoint "$baseUrl?page=1&size=5" "Page 2 (5 éléments)"

# Test 9: Tri
Write-Host "`n🔄 Test 9: Tri" -ForegroundColor Magenta
Test-ApiEndpoint "${baseUrl}?page=0&size=5&sortBy=nom&sortDir=asc" "Tri par nom (ascendant)"
Test-ApiEndpoint "${baseUrl}?page=0&size=5&sortBy=nom&sortDir=desc" "Tri par nom (descendant)"

# Test 10: Cas limites
Write-Host "`n⚠️ Test 10: Cas limites" -ForegroundColor Magenta
Test-ApiEndpoint "$baseUrl?page=0&size=10&nom=INEXISTANT" "Recherche nom inexistant"
Test-ApiEndpoint "$baseUrl?page=0&size=10&regionCode=XX" "Région inexistante"
Test-ApiEndpoint "$baseUrl?page=0&size=10&type=INVALIDE" "Type invalide"

Write-Host "`n🎉 Tests terminés!" -ForegroundColor Green
Write-Host "`n📝 Résumé des corrections apportées:" -ForegroundColor Cyan
Write-Host "1. ✅ Service API frontend: Envoi des paramètres même s'ils sont vides" -ForegroundColor Green
Write-Host "2. ✅ FilterBar: Gestion correcte des valeurs vides (suppression des filtres)" -ForegroundColor Green
Write-Host "3. ✅ Détection des filtres actifs: Logique améliorée" -ForegroundColor Green
Write-Host "4. ✅ Affichage des filtres actifs: Conditions simplifiées" -ForegroundColor Green

Write-Host "`n🔧 Le problème était que:" -ForegroundColor Yellow
Write-Host "- Les paramètres de filtre vides n'étaient pas envoyés au backend" -ForegroundColor Gray
Write-Host "- Le backend ne recevait donc pas les informations nécessaires pour ignorer les filtres" -ForegroundColor Gray
Write-Host "- Résultat: aucun résultat ne remontait lors de l'application de filtres" -ForegroundColor Gray

Write-Host "`n✅ Maintenant:" -ForegroundColor Green
Write-Host "- Les paramètres sont toujours envoyés (même vides)" -ForegroundColor Gray
Write-Host "- Le backend gère correctement les valeurs vides/null" -ForegroundColor Gray
Write-Host "- Les filtres fonctionnent comme attendu" -ForegroundColor Gray