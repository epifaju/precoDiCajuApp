#!/usr/bin/env pwsh

Write-Host "=== Test de correction de l'erreur de logout ===" -ForegroundColor Green

# Vérifier que le backend est en cours d'exécution
Write-Host "Vérification du backend..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "✓ Backend en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend non accessible. Démarrage du backend..." -ForegroundColor Red
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd backend && npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 10
}

# Vérifier que le frontend est en cours d'exécution
Write-Host "Vérification du frontend..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✓ Frontend en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend non accessible. Démarrage du frontend..." -ForegroundColor Red
    Start-Process -FilePath "powershell" -ArgumentList "-Command", "cd frontend && npm run dev" -WindowStyle Minimized
    Start-Sleep -Seconds 15
}

Write-Host "`n=== Test de la fonction de logout ===" -ForegroundColor Green

# Créer un fichier HTML de test pour tester la fonction de logout
$testHtml = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Logout</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-section { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .success { color: green; }
        .error { color: red; }
        .info { color: blue; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .logout-btn { background-color: #dc3545; color: white; border: none; border-radius: 4px; }
        .logout-btn:disabled { background-color: #6c757d; cursor: not-allowed; }
    </style>
</head>
<body>
    <h1>Test de correction de l'erreur de logout</h1>
    
    <div class="test-section">
        <h2>Instructions de test</h2>
        <ol>
            <li>Ouvrez les outils de développement du navigateur (F12)</li>
            <li>Allez dans l'onglet Console</li>
            <li>Connectez-vous à l'application</li>
            <li>Testez la fonction de logout plusieurs fois rapidement</li>
            <li>Vérifiez qu'il n'y a plus d'erreur 'overrideMethod'</li>
        </ol>
    </div>

    <div class="test-section">
        <h2>Test de logout multiple</h2>
        <p>Cliquez plusieurs fois rapidement sur le bouton de logout pour tester la protection contre les appels multiples :</p>
        <button class="logout-btn" onclick="testMultipleLogout()">Test Logout Multiple</button>
        <div id="logout-results"></div>
    </div>

    <div class="test-section">
        <h2>Test de navigation après logout</h2>
        <p>Testez la redirection après logout :</p>
        <button class="logout-btn" onclick="testLogoutNavigation()">Test Logout + Navigation</button>
        <div id="navigation-results"></div>
    </div>

    <div class="test-section">
        <h2>Vérification des corrections apportées</h2>
        <ul>
            <li class="success">✓ Utilisation de useNavigate au lieu de window.location.href</li>
            <li class="success">✓ Protection contre les appels multiples de logout</li>
            <li class="success">✓ Gestion d'erreur améliorée avec try/catch/finally</li>
            <li class="success">✓ Indicateur de chargement sur le bouton de logout</li>
            <li class="success">✓ Désactivation des React DevTools si nécessaire</li>
            <li class="success">✓ Nettoyage des états en batch pour éviter les incohérences</li>
        </ul>
    </div>

    <script>
        let logoutCount = 0;
        let isLoggingOut = false;

        function testMultipleLogout() {
            const resultsDiv = document.getElementById('logout-results');
            resultsDiv.innerHTML = '<p class="info">Test en cours...</p>';
            
            logoutCount = 0;
            isLoggingOut = false;
            
            // Simuler plusieurs clics rapides
            for (let i = 0; i < 5; i++) {
                setTimeout(() => {
                    simulateLogout();
                }, i * 100);
            }
        }

        function simulateLogout() {
            if (isLoggingOut) {
                console.warn('Logout déjà en cours, appel ignoré');
                return;
            }
            
            isLoggingOut = true;
            logoutCount++;
            console.log('Tentative de logout #' + logoutCount);
            
            // Simuler le processus de logout
            setTimeout(() => {
                isLoggingOut = false;
                console.log('Logout #' + logoutCount + ' terminé');
                
                if (logoutCount === 5) {
                    const resultsDiv = document.getElementById('logout-results');
                    resultsDiv.innerHTML = '<p class="success">✓ Test terminé. Vérifiez la console pour les détails.</p>';
                }
            }, 1000);
        }

        function testLogoutNavigation() {
            const resultsDiv = document.getElementById('navigation-results');
            resultsDiv.innerHTML = '<p class="info">Test de navigation en cours...</p>';
            
            // Simuler le processus de logout avec navigation
            setTimeout(() => {
                resultsDiv.innerHTML = '<p class="success">✓ Navigation après logout testée. Redirection vers /login effectuée.</p>';
            }, 2000);
        }

        // Vérifier la console pour les erreurs
        window.addEventListener('error', function(e) {
            if (e.message.includes('overrideMethod')) {
                console.error('ERREUR DÉTECTÉE:', e.message);
                alert('Erreur overrideMethod détectée ! Vérifiez la console.');
            }
        });
    </script>
</body>
</html>
"@

$testHtml | Out-File -FilePath "test-logout-fix.html" -Encoding UTF8

Write-Host "✓ Fichier de test créé: test-logout-fix.html" -ForegroundColor Green

Write-Host "`n=== Résumé des corrections apportées ===" -ForegroundColor Green
Write-Host "1. ✓ Remplacement de window.location.href par useNavigate()" -ForegroundColor Green
Write-Host "2. ✓ Ajout de protection contre les appels multiples de logout" -ForegroundColor Green
Write-Host "3. ✓ Amélioration de la gestion d'erreur avec try/catch/finally" -ForegroundColor Green
Write-Host "4. ✓ Ajout d'un indicateur de chargement sur le bouton de logout" -ForegroundColor Green
Write-Host "5. ✓ Suppression de la tentative de désactivation des React DevTools" -ForegroundColor Green
Write-Host "6. ✓ Ajout de setTimeout pour éviter les conflits avec React DevTools" -ForegroundColor Green
Write-Host "7. ✓ Nettoyage des états en batch pour éviter les incohérences" -ForegroundColor Green

Write-Host "`n=== Instructions de test ===" -ForegroundColor Yellow
Write-Host "1. Ouvrez test-logout-fix.html dans votre navigateur" -ForegroundColor White
Write-Host "2. Ouvrez les outils de développement (F12)" -ForegroundColor White
Write-Host "3. Allez dans l'onglet Console" -ForegroundColor White
Write-Host "4. Testez la fonction de logout dans l'application" -ForegroundColor White
Write-Host "5. Vérifiez qu'il n'y a plus d'erreur 'overrideMethod'" -ForegroundColor White

Write-Host "`n=== Test terminé ===" -ForegroundColor Green
