#!/usr/bin/env pwsh

Write-Host "=== Test de correction des listes déroulantes - Preços de Caju ===" -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "Erreur: Ce script doit être exécuté depuis la racine du projet" -ForegroundColor Red
    exit 1
}

# Vérifier que les fichiers modifiés existent
$filterPanelFile = "frontend/src/components/prices/FilterPanel.tsx"
if (-not (Test-Path $filterPanelFile)) {
    Write-Host "Erreur: Fichier FilterPanel.tsx non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Fichier FilterPanel.tsx trouvé" -ForegroundColor Green

# Vérifier les modifications dans FilterPanel.tsx
Write-Host "`n=== Vérification des modifications ===" -ForegroundColor Yellow

$content = Get-Content $filterPanelFile -Raw

# Vérifier que les onChange ont été corrigés
$regionFixed = $content.Contains("onChange={(value) => onFilterChange('regionCode', value)}")
$qualityFixed = $content.Contains("onChange={(value) => onFilterChange('qualityGrade', value)}")
$verifiedFixed = $content.Contains("onChange={(value) => onFilterChange('verified', value)}")
$sortByFixed = $content.Contains("onChange={(value) => onFilterChange('sortBy', value as any)}")
$sortDirFixed = $content.Contains("onChange={(value) => onFilterChange('sortDir', value as any)}")

if ($regionFixed) { Write-Host "✓ Région corrigée" -ForegroundColor Green } else { Write-Host "✗ Région non corrigée" -ForegroundColor Red }
if ($qualityFixed) { Write-Host "✓ Qualité corrigée" -ForegroundColor Green } else { Write-Host "✗ Qualité non corrigée" -ForegroundColor Red }
if ($verifiedFixed) { Write-Host "✓ Vérifié corrigé" -ForegroundColor Green } else { Write-Host "✗ Vérifié non corrigé" -ForegroundColor Red }
if ($sortByFixed) { Write-Host "✓ Tri par corrigé" -ForegroundColor Green } else { Write-Host "✗ Tri par non corrigé" -ForegroundColor Red }
if ($sortDirFixed) { Write-Host "✓ Direction tri corrigée" -ForegroundColor Green } else { Write-Host "✗ Direction tri non corrigée" -ForegroundColor Red }

$allFixed = $regionFixed -and $qualityFixed -and $verifiedFixed -and $sortByFixed -and $sortDirFixed

if ($allFixed) {
    Write-Host "`n✓ Toutes les modifications ont été appliquées correctement" -ForegroundColor Green
} else {
    Write-Host "`n✗ Certaines modifications sont manquantes" -ForegroundColor Red
    exit 1
}

# Vérifier qu'il n'y a plus d'anciens patterns
Write-Host "`n=== Vérification qu'il n'y a plus d'anciens patterns ===" -ForegroundColor Yellow

if ($content.Contains("e.target.value")) {
    Write-Host "✗ Ancien pattern trouvé: e.target.value" -ForegroundColor Red
    $allFixed = $false
} else {
    Write-Host "✓ Ancien pattern supprimé: e.target.value" -ForegroundColor Green
}

if ($allFixed) {
    Write-Host "`n✓ Correction complète - tous les anciens patterns ont été supprimés" -ForegroundColor Green
} else {
    Write-Host "`n✗ Il reste des anciens patterns à corriger" -ForegroundColor Red
    exit 1
}

Write-Host "`n=== Résumé de la correction ===" -ForegroundColor Cyan
Write-Host "Problème identifié: Les composants Select dans FilterPanel.tsx utilisaient" -ForegroundColor White
Write-Host "onChange={(e) => onFilterChange('field', e.target.value)}" -ForegroundColor White
Write-Host "mais le composant Select passe directement la valeur, pas l'événement." -ForegroundColor White
Write-Host "`nSolution appliquée: Changement vers" -ForegroundColor White
Write-Host "onChange={(value) => onFilterChange('field', value)}" -ForegroundColor White
Write-Host "`nFichiers modifiés:" -ForegroundColor White
Write-Host "- frontend/src/components/prices/FilterPanel.tsx" -ForegroundColor White

Write-Host "`n=== Test manuel recommandé ===" -ForegroundColor Yellow
Write-Host "1. Démarrez l'application avec: cd frontend && npm run dev" -ForegroundColor White
Write-Host "2. Ouvrez http://localhost:3000" -ForegroundColor White
Write-Host "3. Naviguez vers l'écran 'Preços de Caju'" -ForegroundColor White
Write-Host "4. Testez les listes déroulantes (Région, Qualité, Vérifié, Tri)" -ForegroundColor White
Write-Host "5. Vérifiez que les sélections mettent à jour les filtres" -ForegroundColor White

Write-Host "`n✓ Correction terminée avec succès!" -ForegroundColor Green