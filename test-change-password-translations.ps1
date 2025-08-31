# Test des traductions du modal de changement de mot de passe
# Ce script teste si le modal "Alterar Palavra-passe" s'affiche correctement dans toutes les langues

Write-Host "=== Test des Traductions du Modal de Changement de Mot de Passe ===" -ForegroundColor Cyan
Write-Host ""

# Démarrer le frontend
Write-Host "1. Démarrage du frontend..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -WindowStyle Minimized

# Attendre que le frontend démarre
Write-Host "   Attente du démarrage du frontend..." -ForegroundColor Gray
Start-Sleep -Seconds 10

# Ouvrir le navigateur
Write-Host "2. Ouverture du navigateur..." -ForegroundColor Yellow
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "=== Instructions de Test ===" -ForegroundColor Green
Write-Host ""
Write-Host "3. Connectez-vous à l'application avec un compte utilisateur" -ForegroundColor White
Write-Host "4. Allez dans votre profil (cliquez sur votre nom en haut à droite)" -ForegroundColor White
Write-Host "5. Dans la section 'Acções Rápidas', cliquez sur le bouton de changement de mot de passe" -ForegroundColor White
Write-Host ""
Write-Host "6. Testez les traductions en changeant la langue :" -ForegroundColor White
Write-Host "   - Portugais (pt) : Le bouton devrait afficher 'Alterar palavra-passe'" -ForegroundColor Gray
Write-Host "   - Français (fr) : Le bouton devrait afficher 'Changer le mot de passe'" -ForegroundColor Gray
Write-Host "   - Anglais (en) : Le bouton devrait afficher 'Change password'" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Vérifiez que le titre du modal change aussi selon la langue :" -ForegroundColor White
Write-Host "   - Portugais : 'Alterar Palavra-passe'" -ForegroundColor Gray
Write-Host "   - Français : 'Changer le Mot de Passe'" -ForegroundColor Gray
Write-Host "   - Anglais : 'Change Password'" -ForegroundColor Gray
Write-Host ""
Write-Host "8. Vérifiez que tous les champs et messages d'erreur sont traduits" -ForegroundColor White
Write-Host ""
Write-Host "=== Problèmes à Identifier ===" -ForegroundColor Red
Write-Host "- Le bouton reste-t-il en portugais même après changement de langue ?" -ForegroundColor Red
Write-Host "- Le titre du modal change-t-il correctement ?" -ForegroundColor Red
Write-Host "- Les messages d'erreur sont-ils traduits ?" -ForegroundColor Red
Write-Host "- Y a-t-il des clés de traduction manquantes ?" -ForegroundColor Red
Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "=== Vérification des Fichiers de Traduction ===" -ForegroundColor Cyan
Write-Host ""

# Vérifier les clés de traduction manquantes
Write-Host "Vérification des clés de traduction pour le changement de mot de passe..." -ForegroundColor Yellow

$ptKeys = Get-Content "frontend/src/i18n/locales/pt.json" | ConvertFrom-Json
$frKeys = Get-Content "frontend/src/i18n/locales/fr.json" | ConvertFrom-Json
$enKeys = Get-Content "frontend/src/i18n/locales/en.json" | ConvertFrom-Json

Write-Host "Clés portugaises trouvées :" -ForegroundColor Green
Write-Host "  profile.actions.changePassword: $($ptKeys.profile.actions.changePassword)" -ForegroundColor Gray
Write-Host "  profile.password.title: $($ptKeys.profile.password.title)" -ForegroundColor Gray
Write-Host "  profile.password.change: $($ptKeys.profile.password.change)" -ForegroundColor Gray

Write-Host ""
Write-Host "Clés françaises trouvées :" -ForegroundColor Green
Write-Host "  profile.actions.changePassword: $($frKeys.profile.actions.changePassword)" -ForegroundColor Gray
Write-Host "  profile.password.title: $($frKeys.profile.password.title)" -ForegroundColor Gray
Write-Host "  profile.password.change: $($frKeys.profile.password.change)" -ForegroundColor Gray

Write-Host ""
Write-Host "Clés anglaises trouvées :" -ForegroundColor Green
Write-Host "  profile.actions.changePassword: $($enKeys.profile.actions.changePassword)" -ForegroundColor Gray
Write-Host "  profile.password.title: $($enKeys.profile.password.title)" -ForegroundColor Gray
Write-Host "  profile.password.change: $($enKeys.profile.password.change)" -ForegroundColor Gray

Write-Host ""
Write-Host "=== Résumé ===" -ForegroundColor Cyan
Write-Host "Si les traductions ne fonctionnent pas, vérifiez :" -ForegroundColor Yellow
Write-Host "1. Que la langue est correctement changée dans l'interface" -ForegroundColor White
Write-Host "2. Que les clés de traduction existent dans tous les fichiers" -ForegroundColor White
Write-Host "3. Que le composant ChangePasswordForm utilise bien useTranslation()" -ForegroundColor White
Write-Host "4. Que les clés de traduction correspondent exactement" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour terminer..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
