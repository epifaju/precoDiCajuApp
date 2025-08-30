# Script de démarrage et test des traductions du module Dashboard
Write-Host "🚀 Démarrage de l'application avec les corrections de traduction" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les corrections ont été appliquées
Write-Host "🔍 Vérification des corrections..." -ForegroundColor Yellow

$frFile = "frontend/src/i18n/locales/fr.json"
$enFile = "frontend/src/i18n/locales/en.json"

if (Test-Path $frFile -and Test-Path $enFile) {
    Write-Host "✅ Fichiers de traduction trouvés" -ForegroundColor Green
    
    # Vérifier rapidement les clés dashboard
    try {
        $frContent = Get-Content $frFile -Raw | ConvertFrom-Json
        $enContent = Get-Content $enFile -Raw | ConvertFrom-Json
        
        if ($frContent.nav.dashboard -and $frContent.dashboard.goodMorning) {
            Write-Host "✅ Traductions françaises du dashboard ajoutées" -ForegroundColor Green
        } else {
            Write-Host "❌ Traductions françaises du dashboard incomplètes" -ForegroundColor Red
            exit 1
        }
        
        if ($enContent.nav.dashboard -and $enContent.dashboard.goodMorning) {
            Write-Host "✅ Traductions anglaises du dashboard ajoutées" -ForegroundColor Green
        } else {
            Write-Host "❌ Traductions anglaises du dashboard incomplètes" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "❌ Erreur lors de la vérification des traductions: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "❌ Fichiers de traduction manquants" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Corrections appliquées avec succès!" -ForegroundColor Green
Write-Host ""

# Instructions pour tester
Write-Host "📋 Instructions de test:" -ForegroundColor Yellow
Write-Host "1. L'application va démarrer" -ForegroundColor White
Write-Host "2. Allez sur la page Dashboard (/dashboard)" -ForegroundColor White
Write-Host "3. Changez la langue vers 'Français' (FR)" -ForegroundColor White
Write-Host "4. Vérifiez que tous les textes sont en français:" -ForegroundColor White
Write-Host "   - Navigation: 'Tableau de bord' au lieu de 'Painel'" -ForegroundColor White
Write-Host "   - Salutations: 'Bonjour', 'Bon après-midi', 'Bonsoir'" -ForegroundColor White
Write-Host "   - Cartes: 'Total des Prix', 'Prix Moyen', etc." -ForegroundColor White
Write-Host "   - Graphiques: 'Tendances des Prix', 'Distribution Régionale'" -ForegroundColor White
Write-Host ""

Write-Host "🔒 Le portugais reste la langue par défaut" -ForegroundColor Blue
Write-Host ""

# Démarrer l'application frontend
Write-Host "🚀 Démarrage du frontend..." -ForegroundColor Green
Write-Host "Ouvrez http://localhost:5173 dans votre navigateur" -ForegroundColor Cyan
Write-Host ""

try {
    Set-Location frontend
    npm run dev
} catch {
    Write-Host "❌ Erreur lors du démarrage: $_" -ForegroundColor Red
    Write-Host "Essayez de démarrer manuellement avec: cd frontend && npm run dev" -ForegroundColor Yellow
}
