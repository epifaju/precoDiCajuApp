# Test de correction v3 - Erreur Cyclique Exportateurs
# Cette version teste une approche encore plus robuste avec une liste blanche de propriétés

Write-Host "🔧 Test de Correction v3 - Erreur Cyclique Exportateurs" -ForegroundColor Cyan
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

Write-Host "`n🔧 Corrections Appliquées (v3):" -ForegroundColor Cyan
Write-Host "• Liste blanche de propriétés autorisées" -ForegroundColor White
Write-Host "• Création d'un objet complètement nouveau" -ForegroundColor White
Write-Host "• Gestion d'erreur avec try/catch" -ForegroundColor White
Write-Host "• Conversion explicite en string de toutes les valeurs" -ForegroundColor White
Write-Host "• Tri des clés pour un hachage déterministe" -ForegroundColor White

Write-Host "`n🧪 Tests à effectuer:" -ForegroundColor Cyan
Write-Host "1. Ouvrir http://localhost:3001/exporters dans le navigateur" -ForegroundColor White
Write-Host "2. Ouvrir la console du navigateur (F12)" -ForegroundColor White
Write-Host "3. Tester les scénarios suivants:" -ForegroundColor White
Write-Host "   a) Cliquer sur 'Filtres avancés'" -ForegroundColor Gray
Write-Host "   b) Sélectionner une région" -ForegroundColor Gray
Write-Host "   c) Sélectionner un type (Exportateur/Acheteur local)" -ForegroundColor Gray
Write-Host "   d) Sélectionner un statut (Actif/Expiré/Suspendu)" -ForegroundColor Gray
Write-Host "   e) Taper un nom dans le champ de recherche" -ForegroundColor Gray
Write-Host "   f) Combiner plusieurs filtres" -ForegroundColor Gray
Write-Host "   g) Effacer les filtres et les réappliquer" -ForegroundColor Gray
Write-Host "   h) Naviguer entre les pages avec des filtres actifs" -ForegroundColor Gray

Write-Host "`n🔍 Vérifications spécifiques:" -ForegroundColor Yellow
Write-Host "• Aucune erreur 'cyclic object value' dans la console" -ForegroundColor White
Write-Host "• Aucune erreur 'Uncaught TypeError' dans la console" -ForegroundColor White
Write-Host "• Les filtres se mettent à jour correctement" -ForegroundColor White
Write-Host "• Les résultats de recherche changent selon les filtres" -ForegroundColor White
Write-Host "• La pagination fonctionne avec les filtres" -ForegroundColor White

Write-Host "`n📊 Code de la fonction corrigée:" -ForegroundColor Cyan
Write-Host "const safeSerializeFilters = (filters: ExportateurFilters | undefined): string => {" -ForegroundColor Gray
Write-Host "  if (!filters) return '';" -ForegroundColor Gray
Write-Host "  try {" -ForegroundColor Gray
Write-Host "    const cleanFilters: Record<string, string> = {};" -ForegroundColor Gray
Write-Host "    const allowedKeys = ['regionCode', 'type', 'statut', 'nom'];" -ForegroundColor Gray
Write-Host "    for (const key of allowedKeys) {" -ForegroundColor Gray
Write-Host "      const value = filters[key];" -ForegroundColor Gray
Write-Host "      if (value !== undefined && value !== null && value !== '') {" -ForegroundColor Gray
Write-Host "        cleanFilters[key] = String(value);" -ForegroundColor Gray
Write-Host "      }" -ForegroundColor Gray
Write-Host "    }" -ForegroundColor Gray
Write-Host "    const sortedKeys = Object.keys(cleanFilters).sort();" -ForegroundColor Gray
Write-Host "    return sortedKeys.map(key => \`\${key}:\${cleanFilters[key]}\`).join('|');" -ForegroundColor Gray
Write-Host "  } catch (error) {" -ForegroundColor Gray
Write-Host "    console.warn('Error serializing filters:', error);" -ForegroundColor Gray
Write-Host "    return '';" -ForegroundColor Gray
Write-Host "  }" -ForegroundColor Gray
Write-Host "};" -ForegroundColor Gray

Write-Host "`n🌐 Ouverture de la page de test..." -ForegroundColor Yellow
Start-Process "http://localhost:3001/exporters"

Write-Host "`n✨ Test terminé! Vérifiez manuellement les résultats." -ForegroundColor Green
Write-Host "💡 Si l'erreur persiste, nous devrons examiner plus en détail l'objet filters" -ForegroundColor Yellow
