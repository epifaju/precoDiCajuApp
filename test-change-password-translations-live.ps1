# Test en temps réel des traductions du modal de changement de mot de passe
Write-Host "=== Test en Temps Réel des Traductions ===" -ForegroundColor Cyan
Write-Host ""

# Démarrer le frontend
Write-Host "1. Démarrage du frontend..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -WindowStyle Minimized

# Attendre que le frontend démarre
Write-Host "   Attente du démarrage du frontend..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# Ouvrir le navigateur
Write-Host "2. Ouverture du navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=== Instructions de Test Détaillées ===" -ForegroundColor Green
Write-Host ""
Write-Host "3. Connectez-vous à l'application avec un compte utilisateur" -ForegroundColor White
Write-Host "4. Allez dans votre profil (cliquez sur votre nom en haut à droite)" -ForegroundColor White
Write-Host ""
Write-Host "5. AVANT d'ouvrir le modal, changez la langue :" -ForegroundColor Yellow
Write-Host "   - Cliquez sur le menu hamburger (☰) en haut à gauche" -ForegroundColor Gray
Write-Host "   - Dans la section 'Idioma / Language', changez vers 'Français' ou 'English'" -ForegroundColor Gray
Write-Host "   - Vérifiez que le bouton 'Alterar palavra-passe' change de langue" -ForegroundColor Gray
Write-Host ""
Write-Host "6. MAINTENANT ouvrez le modal de changement de mot de passe :" -ForegroundColor Yellow
Write-Host "   - Cliquez sur le bouton de changement de mot de passe" -ForegroundColor Gray
Write-Host "   - Vérifiez que le titre du modal est dans la bonne langue" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Testez le changement de langue AVEC le modal ouvert :" -ForegroundColor Yellow
Write-Host "   - Changez la langue dans le menu" -ForegroundColor Gray
Write-Host "   - Vérifiez si le modal se met à jour automatiquement" -ForegroundColor Gray
Write-Host ""
Write-Host "=== Problèmes à Identifier ===" -ForegroundColor Red
Write-Host "A. Le bouton change-t-il de langue AVANT d'ouvrir le modal ?" -ForegroundColor Red
Write-Host "B. Le titre du modal s'affiche-t-il dans la bonne langue ?" -ForegroundColor Red
Write-Host "C. Le modal se met-il à jour lors du changement de langue ?" -ForegroundColor Red
Write-Host "D. Y a-t-il des erreurs dans la console du navigateur ?" -ForegroundColor Red
Write-Host ""
Write-Host "=== Solutions Possibles ===" -ForegroundColor Cyan
Write-Host "1. Si le bouton ne change pas : problème de re-rendu de ProfilePage" -ForegroundColor White
Write-Host "2. Si le modal ne change pas : problème de re-rendu de ChangePasswordForm" -ForegroundColor White
Write-Host "3. Si rien ne change : problème de configuration i18n" -ForegroundColor White
Write-Host "4. Si erreurs console : problème de clés de traduction manquantes" -ForegroundColor White
Write-Host ""
Write-Host "=== Vérifications Console ===" -ForegroundColor Yellow
Write-Host "- Ouvrez les outils de développement (F12)" -ForegroundColor White
Write-Host "- Allez dans l'onglet Console" -ForegroundColor White
Write-Host "- Changez la langue et regardez les logs" -ForegroundColor White
Write-Host "- Vérifiez s'il y a des erreurs de traduction" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "=== Vérification des Fichiers de Traduction ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier que les fichiers existent
$ptFile = "frontend/src/i18n/locales/pt.json"
$frFile = "frontend/src/i18n/locales/fr.json"
$enFile = "frontend/src/i18n/locales/en.json"

Write-Host "Vérification des fichiers de traduction..." -ForegroundColor Yellow
Write-Host "  PT: $(if (Test-Path $ptFile) { '✓ Existe' } else { '✗ Manquant' })" -ForegroundColor $(if (Test-Path $ptFile) { "Green" } else { "Red" })
Write-Host "  FR: $(if (Test-Path $frFile) { '✓ Existe' } else { '✗ Manquant' })" -ForegroundColor $(if (Test-Path $frFile) { "Green" } else { "Red" })
Write-Host "  EN: $(if (Test-Path $enFile) { '✓ Existe' } else { '✗ Manquant' })" -ForegroundColor $(if (Test-Path $enFile) { "Green" } else { "Red" })

Write-Host ""
Write-Host "=== Résumé du Test ===" -ForegroundColor Cyan
Write-Host "Ce test vous permettra d'identifier exactement où se situe le problème :" -ForegroundColor White
Write-Host "1. Au niveau de la page de profil (bouton)" -ForegroundColor Gray
Write-Host "2. Au niveau du modal (titre et contenu)" -ForegroundColor Gray
Write-Host "3. Au niveau de la configuration i18n" -ForegroundColor Gray
Write-Host "4. Au niveau des clés de traduction" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour terminer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
