# Test de correction de l'erreur cyclique - Exportateurs Agrées
# Ce script teste la correction de l'erreur "cyclic object value" dans les filtres avancés

Write-Host "🔧 Test de Correction - Erreur Cyclique Exportateurs" -ForegroundColor Cyan
Write-Host "=" * 60

# Vérifier si le backend est en cours d'exécution
Write-Host "`n🔍 Vérification du backend..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible. Démarrez le backend d'abord." -ForegroundColor Red
    Write-Host "   Commande: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le frontend est en cours d'exécution
Write-Host "`n🔍 Vérification du frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible. Démarrez le frontend d'abord." -ForegroundColor Red
    Write-Host "   Commande: cd frontend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🧪 Tests à effectuer manuellement:" -ForegroundColor Cyan
Write-Host "1. Ouvrir http://localhost:3001/exporters dans le navigateur" -ForegroundColor White
Write-Host "2. Ouvrir la console du navigateur (F12)" -ForegroundColor White
Write-Host "3. Utiliser les filtres avancés:" -ForegroundColor White
Write-Host "   - Cliquer sur 'Filtres avancés'" -ForegroundColor Gray
Write-Host "   - Sélectionner une région" -ForegroundColor Gray
Write-Host "   - Sélectionner un type (Exportateur/Acheteur local)" -ForegroundColor Gray
Write-Host "   - Sélectionner un statut (Actif/Expiré/Suspendu)" -ForegroundColor Gray
Write-Host "   - Taper un nom dans le champ de recherche" -ForegroundColor Gray
Write-Host "4. Vérifier qu'aucune erreur 'cyclic object value' n'apparaît" -ForegroundColor White
Write-Host "5. Tester la pagination avec des filtres actifs" -ForegroundColor White

Write-Host "`n📊 Résultats attendus:" -ForegroundColor Cyan
Write-Host "✅ Les filtres fonctionnent sans erreur" -ForegroundColor Green
Write-Host "✅ Aucune erreur 'cyclic object value' dans la console" -ForegroundColor Green
Write-Host "✅ La pagination fonctionne avec les filtres" -ForegroundColor Green
Write-Host "✅ Les résultats se mettent à jour correctement" -ForegroundColor Green

Write-Host "`n🔧 Corrections appliquées:" -ForegroundColor Cyan
Write-Host "• Ajout de la fonction safeSerializeFilters() dans useExporters.ts" -ForegroundColor White
Write-Host "• Utilisation de safeSerializeFilters(filters) dans la query key" -ForegroundColor White
Write-Host "• Prévention des références circulaires dans les objets de filtres" -ForegroundColor White

Write-Host "`n🌐 Ouvrir la page de test dans le navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:3001/exporters"

Write-Host "`n✨ Test terminé! Vérifiez manuellement les résultats." -ForegroundColor Green
