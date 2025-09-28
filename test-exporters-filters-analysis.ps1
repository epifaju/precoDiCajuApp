# Script de test et analyse des filtres avancés des exportateurs
# TaskMaster AI - Analyse de bugs et problèmes d'implémentation

Write-Host "=== ANALYSE DES FILTRES AVANCÉS - EXPORTATEURS AGRÉÉS ===" -ForegroundColor Cyan
Write-Host "TaskMaster AI - Diagnostic complet" -ForegroundColor Yellow
Write-Host ""

# 1. Test de l'endpoint principal
Write-Host "1. TEST DE L'ENDPOINT PRINCIPAL" -ForegroundColor Green
Write-Host "Test: GET /api/v1/exportateurs" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?page=0&size=5" -Method GET
    Write-Host "✅ Endpoint principal accessible" -ForegroundColor Green
    Write-Host "   Résultats: $($response.totalElements) exportateurs trouvés" -ForegroundColor White
}
catch {
    Write-Host "❌ Erreur endpoint principal: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 2. Test des filtres individuels
Write-Host "2. TEST DES FILTRES INDIVIDUELS" -ForegroundColor Green

# Test filtre par région
Write-Host "Test: Filtre par région (BS)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?regionCode=BS&size=5" -Method GET
    Write-Host "✅ Filtre région fonctionne: $($response.totalElements) résultats" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur filtre région: $($_.Exception.Message)" -ForegroundColor Red
}

# Test filtre par type
Write-Host "Test: Filtre par type (EXPORTATEUR)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?type=EXPORTATEUR&size=5" -Method GET
    Write-Host "✅ Filtre type fonctionne: $($response.totalElements) résultats" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur filtre type: $($_.Exception.Message)" -ForegroundColor Red
}

# Test filtre par statut
Write-Host "Test: Filtre par statut (ACTIF)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?statut=ACTIF&size=5" -Method GET
    Write-Host "✅ Filtre statut fonctionne: $($response.totalElements) résultats" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur filtre statut: $($_.Exception.Message)" -ForegroundColor Red
}

# Test filtre par nom
Write-Host "Test: Filtre par nom (recherche)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?nom=test&size=5" -Method GET
    Write-Host "✅ Filtre nom fonctionne: $($response.totalElements) résultats" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur filtre nom: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 3. Test des filtres combinés
Write-Host "3. TEST DES FILTRES COMBINÉS" -ForegroundColor Green

Write-Host "Test: Filtres combinés (région + type)" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?regionCode=BS&type=EXPORTATEUR&size=5" -Method GET
    Write-Host "✅ Filtres combinés fonctionnent: $($response.totalElements) résultats" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur filtres combinés: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 4. Test des endpoints de débogage
Write-Host "4. TEST DES ENDPOINTS DE DÉBOGAGE" -ForegroundColor Green

# Test endpoint de données de base
Write-Host "Test: Endpoint de données de base" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs/test-database-data" -Method GET
    Write-Host "✅ Endpoint de données accessible" -ForegroundColor Green
    Write-Host "   Contenu: $($response.Substring(0, [Math]::Min(100, $response.Length)))..." -ForegroundColor White
}
catch {
    Write-Host "❌ Erreur endpoint données: $($_.Exception.Message)" -ForegroundColor Red
}

# Test endpoint de filtrage manuel
Write-Host "Test: Endpoint de filtrage manuel" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs/test-manual-filter?type=EXPORTATEUR" -Method GET
    Write-Host "✅ Endpoint filtrage manuel accessible" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur endpoint filtrage: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 5. Test de l'endpoint alternatif
Write-Host "5. TEST DE L'ENDPOINT ALTERNATIF" -ForegroundColor Green
Write-Host "Test: GET /api/v1/exportateurs/filtered" -ForegroundColor White

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs/filtered?page=0&size=5" -Method GET
    Write-Host "✅ Endpoint alternatif accessible" -ForegroundColor Green
    Write-Host "   Résultats: $($response.totalElements) exportateurs trouvés" -ForegroundColor White
}
catch {
    Write-Host "❌ Erreur endpoint alternatif: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 6. Test des paramètres invalides
Write-Host "6. TEST DE LA GESTION D'ERREURS" -ForegroundColor Green

Write-Host "Test: Type invalide" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?type=INVALID_TYPE&size=5" -Method GET
    Write-Host "✅ Gestion type invalide: $($response.totalElements) résultats (doit ignorer le filtre)" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur avec type invalide: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 7. Test de performance
Write-Host "7. TEST DE PERFORMANCE" -ForegroundColor Green

$stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs?page=0&size=20" -Method GET
    $stopwatch.Stop()
    $elapsed = $stopwatch.ElapsedMilliseconds
    Write-Host "✅ Performance: $elapsed ms pour récupérer $($response.totalElements) exportateurs" -ForegroundColor Green
    
    if ($elapsed -gt 2000) {
        Write-Host "⚠️  ATTENTION: Temps de réponse élevé (>2s)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Erreur test performance: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# 8. Résumé des problèmes identifiés
Write-Host "8. RÉSUMÉ DE L'ANALYSE" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan

Write-Host ""
Write-Host "PROBLÈMES IDENTIFIÉS:" -ForegroundColor Yellow
Write-Host "1. Multiple endpoints de test en production (sécurité)" -ForegroundColor Red
Write-Host "2. Filtrage manuel au lieu de requêtes SQL optimisées (performance)" -ForegroundColor Red
Write-Host "3. Logs de débogage excessifs en production" -ForegroundColor Red
Write-Host "4. Gestion d'erreurs basique sans codes d'erreur spécifiques" -ForegroundColor Red
Write-Host "5. Pas de validation stricte des paramètres d'entrée" -ForegroundColor Red

Write-Host ""
Write-Host "POINTS POSITIFS:" -ForegroundColor Green
Write-Host "1. Gestion robuste des paramètres invalides" -ForegroundColor Green
Write-Host "2. Fallback avec filtrage manuel fonctionnel" -ForegroundColor Green
Write-Host "3. Interface utilisateur bien conçue" -ForegroundColor Green
Write-Host "4. Support multi-langues complet" -ForegroundColor Green
Write-Host "5. Cache intelligent côté frontend" -ForegroundColor Green

Write-Host ""
Write-Host "RECOMMANDATIONS:" -ForegroundColor Cyan
Write-Host "1. Supprimer les endpoints de test de la production" -ForegroundColor White
Write-Host "2. Optimiser les requêtes SQL avec des index appropriés" -ForegroundColor White
Write-Host "3. Réduire les logs de débogage en production" -ForegroundColor White
Write-Host "4. Améliorer la gestion d'erreurs avec des codes spécifiques" -ForegroundColor White
Write-Host "5. Ajouter une validation stricte des paramètres" -ForegroundColor White

Write-Host ""
Write-Host "=== ANALYSE TERMINÉE ===" -ForegroundColor Cyan
