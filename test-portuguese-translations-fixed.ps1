# Test des corrections des traductions portugaises
Write-Host "=== Test des Corrections des Traductions Portugaises ===" -ForegroundColor Green

# Démarrer le frontend
Write-Host "`n1. Démarrage du frontend..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -WindowStyle Minimized

# Attendre que le frontend démarre
Write-Host "2. Attente du démarrage du frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Ouvrir le navigateur sur la page de profil
Write-Host "3. Ouverture de la page de profil..." -ForegroundColor Yellow
Start-Process "http://localhost:3000/profile"

Write-Host "`n=== Instructions de Test ===" -ForegroundColor Cyan
Write-Host "1. Vérifiez que la page de profil se charge sans erreurs de console" -ForegroundColor White
Write-Host "2. Changez la langue en portugais (pt) dans les paramètres" -ForegroundColor White
Write-Host "3. Vérifiez que les textes suivants s'affichent correctement :" -ForegroundColor White
Write-Host "   - 'Editar perfil' au lieu de 'profile.actions.editProfile'" -ForegroundColor White
Write-Host "   - Footer sans erreurs de traduction" -ForegroundColor White
Write-Host "4. Vérifiez la console du navigateur pour les erreurs de traduction" -ForegroundColor White

Write-Host "`n=== Clés de Traduction Corrigées ===" -ForegroundColor Green
Write-Host "✓ footer.legal: 'Legal & Contacto'" -ForegroundColor Green
Write-Host "✓ footer.terms: 'Termos de Serviço'" -ForegroundColor Green
Write-Host "✓ footer.status: 'Online'" -ForegroundColor Green
Write-Host "✓ profile.actions.editProfile: 'Editar perfil'" -ForegroundColor Green

Write-Host "`nAppuyez sur une touche pour arrêter le frontend..." -ForegroundColor Red
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Arrêter le frontend
Write-Host "`nArrêt du frontend..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" } | Stop-Process -Force

Write-Host "Test terminé!" -ForegroundColor Green
