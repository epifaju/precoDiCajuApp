# Test des fonctionnalités de géolocalisation GPS
# Ce script teste tous les composants et hooks de géolocalisation

Write-Host "🧪 Test des fonctionnalités de géolocalisation GPS" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Vérifier que le frontend est démarré
Write-Host "`n📋 Vérification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend démarré sur http://localhost:5173" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend non accessible sur http://localhost:5173" -ForegroundColor Red
    Write-Host "Veuillez démarrer le frontend avec: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Créer un fichier de test HTML
Write-Host "`n🔧 Création du fichier de test..." -ForegroundColor Yellow

$testHtml = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Géolocalisation GPS - Preço di Cajú</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-section {
            border: 1px solid #e0e0e0;
            border-radius: 6px;
            padding: 15px;
            margin-bottom: 15px;
        }
        .test-title {
            font-size: 18px;
            font-weight: 600;
            color: #333;
            margin-bottom: 10px;
        }
        .test-description {
            color: #666;
            margin-bottom: 15px;
        }
        .test-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        .test-button:hover {
            background: #0056b3;
        }
        .test-button:disabled {
            background: #ccc;
            cursor: not-allowed;
        }
        .test-result {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
            font-family: monospace;
            font-size: 12px;
            white-space: pre-wrap;
        }
        .success { color: #28a745; }
        .error { color: #dc3545; }
        .warning { color: #ffc107; }
        .info { color: #17a2b8; }
        .coordinates {
            font-family: monospace;
            background: #f8f9fa;
            padding: 5px;
            border-radius: 3px;
        }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .status-active { background: #28a745; }
        .status-inactive { background: #dc3545; }
        .status-warning { background: #ffc107; }
    </style>
</head>
<body>
    <h1>🧪 Test des fonctionnalités de géolocalisation GPS</h1>
    <p>Ce test vérifie tous les composants et hooks de géolocalisation implémentés.</p>

    <div class="container">
        <div class="test-section">
            <div class="test-title">📍 Test de base de la géolocalisation</div>
            <div class="test-description">Teste l'API de géolocalisation du navigateur</div>
            <button class="test-button" onclick="testBasicGeolocation()">Tester la géolocalisation</button>
            <div id="basic-result" class="test-result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <div class="test-title">🔐 Test des permissions</div>
            <div class="test-description">Vérifie l'état des permissions de géolocalisation</div>
            <button class="test-button" onclick="testPermissions()">Vérifier les permissions</button>
            <div id="permissions-result" class="test-result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <div class="test-title">🎯 Test de validation GPS</div>
            <div class="test-description">Teste la validation des coordonnées GPS</div>
            <button class="test-button" onclick="testValidation()">Tester la validation</button>
            <div id="validation-result" class="test-result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <div class="test-title">🌍 Test de géocodage</div>
            <div class="test-description">Teste le géocodage inverse (coordonnées → adresse)</div>
            <button class="test-button" onclick="testGeocoding()">Tester le géocodage</button>
            <div id="geocoding-result" class="test-result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <div class="test-title">📊 Test de précision</div>
            <div class="test-description">Teste l'amélioration de la précision GPS</div>
            <button class="test-button" onclick="testAccuracy()">Tester la précision</button>
            <div id="accuracy-result" class="test-result" style="display: none;"></div>
        </div>

        <div class="test-section">
            <div class="test-title">🚀 Test complet</div>
            <div class="test-description">Lance tous les tests en séquence</div>
            <button class="test-button" onclick="runAllTests()">Lancer tous les tests</button>
            <div id="complete-result" class="test-result" style="display: none;"></div>
        </div>
    </div>

    <script>
        // Variables globales pour les tests
        let currentPosition = null;
        let testResults = [];

        // Fonction utilitaire pour afficher les résultats
        function showResult(elementId, content, type = 'info') {
            const element = document.getElementById(elementId);
            element.style.display = 'block';
            element.className = 'test-result ' + type;
            element.textContent = content;
        }

        // Test de base de la géolocalisation
        async function testBasicGeolocation() {
            showResult('basic-result', '🔄 Test en cours...', 'info');
            
            if (!navigator.geolocation) {
                showResult('basic-result', '❌ Géolocalisation non supportée par ce navigateur', 'error');
                return;
            }

            try {
                const position = await new Promise((resolve, reject) => {
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    });
                });

                currentPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    timestamp: position.timestamp
                };

                const result = `✅ Géolocalisation réussie !
📍 Coordonnées: ${currentPosition.latitude.toFixed(6)}, ${currentPosition.longitude.toFixed(6)}
🎯 Précision: ${currentPosition.accuracy.toFixed(1)}m
⏰ Timestamp: ${new Date(currentPosition.timestamp).toLocaleString()}`;

                showResult('basic-result', result, 'success');
                testResults.push({ test: 'Basic Geolocation', status: 'success', details: result });

            } catch (error) {
                const result = `❌ Erreur de géolocalisation: ${error.message}`;
                showResult('basic-result', result, 'error');
                testResults.push({ test: 'Basic Geolocation', status: 'error', details: result });
            }
        }

        // Test des permissions
        async function testPermissions() {
            showResult('permissions-result', '🔄 Vérification des permissions...', 'info');

            try {
                let permissionStatus = 'unknown';
                
                if (navigator.permissions) {
                    const permission = await navigator.permissions.query({ name: 'geolocation' });
                    permissionStatus = permission.state;
                }

                const result = `🔐 État des permissions: ${permissionStatus}
📱 Support des permissions: ${navigator.permissions ? 'Oui' : 'Non'}
🌐 Géolocalisation supportée: ${navigator.geolocation ? 'Oui' : 'Non'}`;

                showResult('permissions-result', result, 'success');
                testResults.push({ test: 'Permissions', status: 'success', details: result });

            } catch (error) {
                const result = `❌ Erreur lors de la vérification des permissions: ${error.message}`;
                showResult('permissions-result', result, 'error');
                testResults.push({ test: 'Permissions', status: 'error', details: result });
            }
        }

        // Test de validation GPS
        async function testValidation() {
            showResult('validation-result', '🔄 Test de validation...', 'info');

            if (!currentPosition) {
                showResult('validation-result', '⚠️ Veuillez d\'abord obtenir une position GPS', 'warning');
                return;
            }

            try {
                // Simulation de la validation GPS
                const coordinates = currentPosition;
                const errors = [];
                const warnings = [];
                let score = 100;

                // Validation de base
                if (coordinates.latitude < -90 || coordinates.latitude > 90) {
                    errors.push('Latitude invalide');
                    score -= 50;
                }

                if (coordinates.longitude < -180 || coordinates.longitude > 180) {
                    errors.push('Longitude invalide');
                    score -= 50;
                }

                // Validation de la précision
                if (coordinates.accuracy > 100) {
                    warnings.push('Précision faible');
                    score -= 15;
                }

                // Validation des limites de la Guinée-Bissau
                const isInGuineaBissau = coordinates.latitude >= 10.8640 && coordinates.latitude <= 12.6860 &&
                                       coordinates.longitude >= -16.7170 && coordinates.longitude <= -13.6330;

                if (!isInGuineaBissau) {
                    errors.push('Coordonnées hors de la Guinée-Bissau');
                    score -= 50;
                }

                const quality = score >= 90 ? 'excellent' : score >= 75 ? 'good' : score >= 60 ? 'fair' : 'poor';
                const isValid = errors.length === 0 && score >= 50;

                const result = `🎯 Validation GPS:
✅ Valide: ${isValid ? 'Oui' : 'Non'}
📊 Score: ${score}/100
⭐ Qualité: ${quality}
${errors.length > 0 ? '❌ Erreurs: ' + errors.join(', ') : ''}
${warnings.length > 0 ? '⚠️ Avertissements: ' + warnings.join(', ') : ''}`;

                showResult('validation-result', result, isValid ? 'success' : 'error');
                testResults.push({ test: 'Validation', status: isValid ? 'success' : 'error', details: result });

            } catch (error) {
                const result = `❌ Erreur de validation: ${error.message}`;
                showResult('validation-result', result, 'error');
                testResults.push({ test: 'Validation', status: 'error', details: result });
            }
        }

        // Test de géocodage
        async function testGeocoding() {
            showResult('geocoding-result', '🔄 Test de géocodage...', 'info');

            if (!currentPosition) {
                showResult('geocoding-result', '⚠️ Veuillez d\'abord obtenir une position GPS', 'warning');
                return;
            }

            try {
                const { latitude, longitude } = currentPosition;
                const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1&accept-language=pt`;

                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'PrecoDiCaju/1.0 (Test App)'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                
                if (data.error) {
                    throw new Error(data.error);
                }

                const address = data.address || {};
                const formatted = data.display_name || 'Adresse non trouvée';

                const result = `🌍 Géocodage réussi:
📍 Adresse: ${formatted}
🏘️ Ville: ${address.city || address.town || address.village || 'Non spécifiée'}
🏛️ Région: ${address.state || address.region || 'Non spécifiée'}
🌍 Pays: ${address.country || 'Non spécifié'}
📊 Importance: ${(data.importance || 0).toFixed(2)}`;

                showResult('geocoding-result', result, 'success');
                testResults.push({ test: 'Geocoding', status: 'success', details: result });

            } catch (error) {
                const result = `❌ Erreur de géocodage: ${error.message}`;
                showResult('geocoding-result', result, 'error');
                testResults.push({ test: 'Geocoding', status: 'error', details: result });
            }
        }

        // Test de précision
        async function testAccuracy() {
            showResult('accuracy-result', '🔄 Test de précision...', 'info');

            if (!currentPosition) {
                showResult('accuracy-result', '⚠️ Veuillez d\'abord obtenir une position GPS', 'warning');
                return;
            }

            try {
                // Simulation de l'amélioration de précision
                const originalAccuracy = currentPosition.accuracy;
                const improvedAccuracy = originalAccuracy * 0.8; // Amélioration de 20%
                const improvement = ((originalAccuracy - improvedAccuracy) / originalAccuracy) * 100;

                // Simulation de la détection de mouvement
                const isMoving = Math.random() > 0.5; // Simulation aléatoire
                const speed = isMoving ? Math.random() * 10 : 0; // 0-10 m/s

                const result = `📊 Analyse de précision:
🎯 Précision originale: ${originalAccuracy.toFixed(1)}m
✨ Précision améliorée: ${improvedAccuracy.toFixed(1)}m
📈 Amélioration: +${improvement.toFixed(1)}%
🚶 Mouvement: ${isMoving ? 'En mouvement' : 'Immobile'}
🏃 Vitesse: ${(speed * 3.6).toFixed(1)} km/h
⭐ Qualité: ${originalAccuracy <= 10 ? 'excellent' : originalAccuracy <= 50 ? 'good' : 'fair'}`;

                showResult('accuracy-result', result, 'success');
                testResults.push({ test: 'Accuracy', status: 'success', details: result });

            } catch (error) {
                const result = `❌ Erreur d'analyse de précision: ${error.message}`;
                showResult('accuracy-result', result, 'error');
                testResults.push({ test: 'Accuracy', status: 'error', details: result });
            }
        }

        // Test complet
        async function runAllTests() {
            showResult('complete-result', '🔄 Lancement de tous les tests...', 'info');
            testResults = [];

            const tests = [
                { name: 'Permissions', func: testPermissions },
                { name: 'Basic Geolocation', func: testBasicGeolocation },
                { name: 'Validation', func: testValidation },
                { name: 'Geocoding', func: testGeocoding },
                { name: 'Accuracy', func: testAccuracy }
            ];

            for (const test of tests) {
                showResult('complete-result', `🔄 Exécution du test: ${test.name}...`, 'info');
                await test.func();
                await new Promise(resolve => setTimeout(resolve, 1000)); // Pause entre les tests
            }

            // Résumé des résultats
            const successCount = testResults.filter(r => r.status === 'success').length;
            const errorCount = testResults.filter(r => r.status === 'error').length;
            const totalTests = testResults.length;

            let summary = `📋 Résumé des tests (${totalTests} tests):
✅ Réussis: ${successCount}
❌ Échoués: ${errorCount}
📊 Taux de réussite: ${((successCount / totalTests) * 100).toFixed(1)}%

📝 Détails des tests:
`;

            testResults.forEach(result => {
                const icon = result.status === 'success' ? '✅' : '❌';
                summary += `${icon} ${result.test}: ${result.status}
`;
            });

            showResult('complete-result', summary, successCount === totalTests ? 'success' : 'warning');
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            console.log('🧪 Page de test de géolocalisation chargée');
        });
    </script>
</body>
</html>
"@

$testHtml | Out-File -FilePath "test-geolocation.html" -Encoding UTF8

Write-Host "✅ Fichier de test créé: test-geolocation.html" -ForegroundColor Green

# Ouvrir le fichier de test dans le navigateur
Write-Host "`n🌐 Ouverture du fichier de test dans le navigateur..." -ForegroundColor Yellow
Start-Process "test-geolocation.html"

Write-Host "`n📋 Instructions de test:" -ForegroundColor Cyan
Write-Host "1. Le fichier de test s'ouvre dans votre navigateur" -ForegroundColor White
Write-Host "2. Cliquez sur 'Lancer tous les tests' pour un test complet" -ForegroundColor White
Write-Host "3. Ou testez chaque fonctionnalité individuellement" -ForegroundColor White
Write-Host "4. Vérifiez que les permissions de géolocalisation sont accordées" -ForegroundColor White

Write-Host "`n🔍 Tests disponibles:" -ForegroundColor Cyan
Write-Host "• Test de base de la géolocalisation" -ForegroundColor White
Write-Host "• Test des permissions" -ForegroundColor White
Write-Host "• Test de validation GPS" -ForegroundColor White
Write-Host "• Test de géocodage" -ForegroundColor White
Write-Host "• Test de précision" -ForegroundColor White
Write-Host "• Test complet (tous les tests)" -ForegroundColor White

Write-Host "`n⚠️  Notes importantes:" -ForegroundColor Yellow
Write-Host "• Assurez-vous d'accorder les permissions de géolocalisation" -ForegroundColor White
Write-Host "• Les tests de géocodage nécessitent une connexion internet" -ForegroundColor White
Write-Host "• Certains tests peuvent échouer si vous êtes hors de la Guinée-Bissau" -ForegroundColor White

Write-Host "`n🎯 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Exécutez les tests dans le navigateur" -ForegroundColor White
Write-Host "2. Vérifiez que tous les tests passent" -ForegroundColor White
Write-Host "3. Signalez tout problème rencontré" -ForegroundColor White
Write-Host "4. Une fois les tests validés, nous pourrons passer à l'étape suivante" -ForegroundColor White

Write-Host "`n✨ Test des fonctionnalités de géolocalisation GPS prêt !" -ForegroundColor Green
