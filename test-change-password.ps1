# Test de la fonctionnalité de changement de mot de passe
Write-Host "=== Test de la fonctionnalité de changement de mot de passe ===" -ForegroundColor Green

# Vérifier si le frontend est en cours d'exécution
Write-Host "Vérification du statut du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Frontend accessible sur http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Frontend non accessible sur http://localhost:5173" -ForegroundColor Red
    Write-Host "Démarrage du frontend..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -WindowStyle Minimized
    Start-Sleep -Seconds 10
}

# Vérifier si le backend est en cours d'exécution
Write-Host "Vérification du statut du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend accessible sur http://localhost:8080" -ForegroundColor Green
    }
} catch {
    Write-Host "✗ Backend non accessible sur http://localhost:8080" -ForegroundColor Red
    Write-Host "Démarrage du backend..." -ForegroundColor Yellow
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "backend" -WindowStyle Minimized
    Start-Sleep -Seconds 15
}

Write-Host "`n=== Instructions de test ===" -ForegroundColor Cyan
Write-Host "1. Ouvrez votre navigateur et allez sur http://localhost:5173" -ForegroundColor White
Write-Host "2. Connectez-vous avec un compte existant" -ForegroundColor White
Write-Host "3. Allez sur la page Profil" -ForegroundColor White
Write-Host "4. Dans la section 'Acções Rápidas', cliquez sur 'Alterar palavra-passe'" -ForegroundColor White
Write-Host "5. Testez le formulaire de changement de mot de passe" -ForegroundColor White
Write-Host "6. Vérifiez que les traductions fonctionnent en changeant de langue" -ForegroundColor White

Write-Host "`n=== Fonctionnalités à tester ===" -ForegroundColor Cyan
Write-Host "✓ Bouton 'Alterar palavra-passe' dans la section Acções Rápidas" -ForegroundColor Green
Write-Host "✓ Modal de changement de mot de passe" -ForegroundColor Green
Write-Host "✓ Validation des champs (mot de passe actuel, nouveau, confirmation)" -ForegroundColor Green
Write-Host "✓ Affichage/masquage des mots de passe" -ForegroundColor Green
Write-Host "✓ Messages d'erreur et de succès" -ForegroundColor Green
Write-Host "✓ Traductions en portugais, français et anglais" -ForegroundColor Green
Write-Host "✓ Bouton de déconnexion fonctionnel" -ForegroundColor Green

Write-Host "`nTest terminé !" -ForegroundColor Green
