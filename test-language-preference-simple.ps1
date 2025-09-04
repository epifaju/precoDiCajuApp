# Test simple pour la fonctionnalité de langue préférée
Write-Host "Test de la fonctionnalité de langue préférée" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Vérifier si l'application backend est en cours d'exécution
Write-Host "`n1. Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Backend est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "✗ Backend répond mais avec un code d'erreur: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Backend n'est pas accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Veuillez démarrer le backend avec: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Test de l'endpoint utilisateur (nécessite une authentification)
Write-Host "`n2. Test de l'endpoint utilisateur..." -ForegroundColor Yellow
Write-Host "Note: Ce test nécessite une authentification valide" -ForegroundColor Cyan

# Vérifier si le frontend est accessible
Write-Host "`n3. Vérification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✓ Frontend est accessible" -ForegroundColor Green
    } else {
        Write-Host "✗ Frontend répond mais avec un code d'erreur: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Frontend n'est pas accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Veuillez démarrer le frontend avec: cd frontend && npm start" -ForegroundColor Yellow
}

Write-Host "`n4. Instructions pour tester la fonctionnalité:" -ForegroundColor Yellow
Write-Host "1. Ouvrez http://localhost:3000 dans votre navigateur" -ForegroundColor White
Write-Host "2. Connectez-vous à votre compte" -ForegroundColor White
Write-Host "3. Allez dans Profil > Configuration" -ForegroundColor White
Write-Host "4. Changez la langue (pt/fr/en)" -ForegroundColor White
Write-Host "5. Sauvegardez les préférences" -ForegroundColor White
Write-Host "6. Déconnectez-vous et reconnectez-vous" -ForegroundColor White
Write-Host "7. Vérifiez que la langue est conservée" -ForegroundColor White

Write-Host "`n✓ Test terminé!" -ForegroundColor Green
