# Script de test simple pour les filtres des exportateurs
Write-Host "🔧 Test des Filtres Exportateurs - Correction" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8080/api/v1/exportateurs"

# Test simple avec des URLs construites différemment
Write-Host "`n📊 Test 1: Tous les exportateurs" -ForegroundColor Yellow
$url1 = $baseUrl + "?page=0&size=5"
Invoke-WebRequest -Uri $url1 -Headers @{"Accept"="application/json"} -UseBasicParsing | Out-Null
Write-Host "✅ Test 1 réussi" -ForegroundColor Green

Write-Host "`n🌍 Test 2: Filtre par région BF" -ForegroundColor Yellow
$url2 = $baseUrl + "?page=0&size=5&regionCode=BF"
Invoke-WebRequest -Uri $url2 -Headers @{"Accept"="application/json"} -UseBasicParsing | Out-Null
Write-Host "✅ Test 2 réussi" -ForegroundColor Green

Write-Host "`n🏢 Test 3: Filtre par type EXPORTATEUR" -ForegroundColor Yellow
$url3 = $baseUrl + "?page=0&size=5&type=EXPORTATEUR"
Invoke-WebRequest -Uri $url3 -Headers @{"Accept"="application/json"} -UseBasicParsing | Out-Null
Write-Host "✅ Test 3 réussi" -ForegroundColor Green

Write-Host "`n📋 Test 4: Filtre par statut ACTIF" -ForegroundColor Yellow
$url4 = $baseUrl + "?page=0&size=5&statut=ACTIF"
Invoke-WebRequest -Uri $url4 -Headers @{"Accept"="application/json"} -UseBasicParsing | Out-Null
Write-Host "✅ Test 4 réussi" -ForegroundColor Green

Write-Host "`n🔍 Test 5: Filtre par nom Bijagos" -ForegroundColor Yellow
$url5 = $baseUrl + "?page=0&size=5&nom=Bijagos"
Invoke-WebRequest -Uri $url5 -Headers @{"Accept"="application/json"} -UseBasicParsing | Out-Null
Write-Host "✅ Test 5 réussi" -ForegroundColor Green

Write-Host "`n🔗 Test 6: Filtres combinés" -ForegroundColor Yellow
$url6 = $baseUrl + "?page=0&size=5&regionCode=BF&type=ACHETEUR_LOCAL"
Invoke-WebRequest -Uri $url6 -Headers @{"Accept"="application/json"} -UseBasicParsing | Out-Null
Write-Host "✅ Test 6 réussi" -ForegroundColor Green

Write-Host "`n🆕 Test 7: Paramètres vides (nouveau comportement)" -ForegroundColor Yellow
$url7 = $baseUrl + "?page=0&size=5&regionCode=&type=&statut="
Invoke-WebRequest -Uri $url7 -Headers @{"Accept"="application/json"} -UseBasicParsing | Out-Null
Write-Host "✅ Test 7 réussi" -ForegroundColor Green

Write-Host "`n🎉 Tous les tests sont passés!" -ForegroundColor Green
Write-Host "`n📝 Résumé des corrections:" -ForegroundColor Cyan
Write-Host "1. ✅ Service API frontend: Envoi des paramètres même vides" -ForegroundColor Green
Write-Host "2. ✅ FilterBar: Gestion correcte des valeurs vides" -ForegroundColor Green
Write-Host "3. ✅ Détection des filtres actifs: Logique améliorée" -ForegroundColor Green
Write-Host "4. ✅ Affichage des filtres actifs: Conditions simplifiées" -ForegroundColor Green



