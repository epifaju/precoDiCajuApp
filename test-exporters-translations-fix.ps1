# Test de correction des traductions - Exportateurs Agrées
# Ce script teste que les traductions manquantes ont été ajoutées

Write-Host "🔧 Test de Correction - Traductions Exportateurs" -ForegroundColor Cyan
Write-Host "=" * 60

Write-Host "`n🔍 Vérification des services..." -ForegroundColor Yellow

# Vérifier si le backend est en cours d'exécution
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible. Démarrez le backend d'abord." -ForegroundColor Red
    Write-Host "   Commande: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le frontend est en cours d'exécution
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible. Démarrez le frontend d'abord." -ForegroundColor Red
    Write-Host "   Commande: cd frontend && npm run dev" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n🔧 Corrections Appliquées:" -ForegroundColor Cyan
Write-Host "• Ajout de la clé 'exporters.active_filters' dans pt.json" -ForegroundColor White
Write-Host "• Ajout de toutes les traductions exportateurs dans fr.json" -ForegroundColor White
Write-Host "• Ajout de toutes les traductions exportateurs dans en.json" -ForegroundColor White
Write-Host "• Correction des clés dupliquées dans les fichiers JSON" -ForegroundColor White

Write-Host "`n🧪 Tests à effectuer:" -ForegroundColor Cyan
Write-Host "1. Ouvrir http://localhost:3001/exporters dans le navigateur" -ForegroundColor White
Write-Host "2. Ouvrir la console du navigateur (F12)" -ForegroundColor White
Write-Host "3. Tester les scénarios suivants:" -ForegroundColor White
Write-Host "   a) Cliquer sur 'Filtres avancés'" -ForegroundColor Gray
Write-Host "   b) Vérifier qu'aucune erreur de traduction n'apparaît" -ForegroundColor Gray
Write-Host "   c) Tester le changement de langue (PT/FR/EN)" -ForegroundColor Gray
Write-Host "   d) Vérifier que 'Filtres actifs' s'affiche correctement" -ForegroundColor Gray
Write-Host "   e) Utiliser les filtres et vérifier les traductions" -ForegroundColor Gray

Write-Host "`n🔍 Vérifications spécifiques:" -ForegroundColor Yellow
Write-Host "• Aucune erreur 'missingKey' dans la console" -ForegroundColor White
Write-Host "• Aucune erreur 'cyclic object value' dans la console" -ForegroundColor White
Write-Host "• Les filtres fonctionnent correctement" -ForegroundColor White
Write-Host "• Les traductions s'affichent dans toutes les langues" -ForegroundColor White
Write-Host "• L'interface est complètement traduite" -ForegroundColor White

Write-Host "`n📊 Traductions ajoutées:" -ForegroundColor Cyan
Write-Host "• Portuguese (pt.json):" -ForegroundColor White
Write-Host "  - exporters.active_filters: 'Filtros ativos'" -ForegroundColor Gray
Write-Host "• French (fr.json):" -ForegroundColor White
Write-Host "  - Section complète 'exporters' avec toutes les clés" -ForegroundColor Gray
Write-Host "  - Section 'qr_scanner' avec toutes les clés" -ForegroundColor Gray
Write-Host "  - Section 'common' avec les clés manquantes" -ForegroundColor Gray
Write-Host "• English (en.json):" -ForegroundColor White
Write-Host "  - Section complète 'exporters' avec toutes les clés" -ForegroundColor Gray
Write-Host "  - Section 'qr_scanner' avec toutes les clés" -ForegroundColor Gray
Write-Host "  - Section 'common' avec les clés manquantes" -ForegroundColor Gray

Write-Host "`n🌐 Ouverture de la page de test..." -ForegroundColor Yellow
Start-Process "http://localhost:3001/exporters"

Write-Host "`n✨ Test terminé! Vérifiez manuellement les résultats." -ForegroundColor Green
Write-Host "💡 Changez la langue dans l'interface pour tester toutes les traductions" -ForegroundColor Yellow
