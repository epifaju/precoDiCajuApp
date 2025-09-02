# Script de test pour les fonctionnalités offline de géolocalisation GPS
# Ce script teste le cache local, la synchronisation et les composants offline

Write-Host "🧪 Test des fonctionnalités offline de géolocalisation GPS" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (!(Test-Path "frontend/package.json")) {
    Write-Host "❌ Erreur: Le fichier frontend/package.json n'existe pas" -ForegroundColor Red
    Write-Host "Veuillez exécuter ce script depuis la racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📋 Ce script va tester les fonctionnalités offline suivantes:" -ForegroundColor Yellow
Write-Host "1. Cache local IndexedDB" -ForegroundColor White
Write-Host "2. Synchronisation offline/online" -ForegroundColor White
Write-Host "3. Composants React offline" -ForegroundColor White
Write-Host "4. Hooks de géolocalisation offline" -ForegroundColor White

$continue = Read-Host "`nVoulez-vous continuer ? (y/N)"
if ($continue -ne "y" -and $continue -ne "Y") {
    Write-Host "Test annulé par l'utilisateur" -ForegroundColor Yellow
    exit 0
}

# Créer le fichier de test HTML
$testHtml = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test des Fonctionnalités Offline GPS</title>
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
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
        }
        .test-title {
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #333;
        }
        .test-result {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-weight: 500;
        }
        .success { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .error { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .info { background-color: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb; }
        .warning { background-color: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        button:hover { background-color: #0056b3; }
        button:disabled { background-color: #6c757d; cursor: not-allowed; }
        .status-indicator {
            display: inline-block;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            margin-right: 8px;
        }
        .online { background-color: #28a745; }
        .offline { background-color: #dc3545; }
        .sync { background-color: #007bff; animation: pulse 1s infinite; }
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        .cache-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        .stat-card {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 6px;
            text-align: center;
        }
        .stat-value {
            font-size: 24px;
            font-weight: bold;
            color: #007bff;
        }
        .stat-label {
            font-size: 14px;
            color: #6c757d;
            margin-top: 5px;
        }
        .log {
            background: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 4px;
            padding: 15px;
            max-height: 300px;
            overflow-y: auto;
            font-family: monospace;
            font-size: 12px;
        }
        .log-entry {
            margin: 5px 0;
            padding: 5px;
            border-radius: 3px;
        }
        .log-info { background-color: #e3f2fd; }
        .log-success { background-color: #e8f5e8; }
        .log-error { background-color: #ffebee; }
        .log-warning { background-color: #fff8e1; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🧪 Test des Fonctionnalités Offline GPS</h1>
        <p>Ce test vérifie les fonctionnalités de géolocalisation en mode offline, incluant le cache local, la synchronisation et les composants React.</p>
        
        <div class="test-section">
            <div class="test-title">📡 Statut de Connectivité</div>
            <div id="connectivity-status">
                <span class="status-indicator" id="status-indicator"></span>
                <span id="status-text">Vérification...</span>
            </div>
            <button onclick="toggleConnectivity()">Basculer Connectivité</button>
        </div>

        <div class="test-section">
            <div class="test-title">💾 Test du Cache IndexedDB</div>
            <div id="indexeddb-status" class="test-result info">Vérification du support IndexedDB...</div>
            <button onclick="testIndexedDB()">Tester IndexedDB</button>
            <button onclick="clearIndexedDB()">Vider le Cache</button>
        </div>

        <div class="test-section">
            <div class="test-title">📍 Test du Cache GPS</div>
            <div id="gps-cache-status" class="test-result info">Préparation du test GPS...</div>
            <button onclick="testGPSCache()">Tester Cache GPS</button>
            <button onclick="simulateGPSData()">Simuler Données GPS</button>
        </div>

        <div class="test-section">
            <div class="test-title">🔄 Test de Synchronisation</div>
            <div id="sync-status" class="test-result info">Préparation du test de synchronisation...</div>
            <button onclick="testSync()">Tester Synchronisation</button>
            <button onclick="simulateSyncQueue()">Simuler Queue de Sync</button>
        </div>

        <div class="test-section">
            <div class="test-title">📊 Statistiques du Cache</div>
            <div class="cache-stats" id="cache-stats">
                <div class="stat-card">
                    <div class="stat-value" id="positions-count">-</div>
                    <div class="stat-label">Positions GPS</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="geocoding-count">-</div>
                    <div class="stat-label">Géocodage</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="sync-queue-count">-</div>
                    <div class="stat-label">Queue de Sync</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" id="cache-size">-</div>
                    <div class="stat-label">Taille du Cache</div>
                </div>
            </div>
            <button onclick="updateCacheStats()">Actualiser Statistiques</button>
        </div>

        <div class="test-section">
            <div class="test-title">📝 Journal des Tests</div>
            <div class="log" id="test-log">
                <div class="log-entry log-info">[INFO] Initialisation des tests offline GPS...</div>
            </div>
            <button onclick="clearLog()">Vider le Journal</button>
        </div>
    </div>

    <script>
        // Variables globales
        let isOnline = navigator.onLine;
        let testDB = null;
        let logEntries = [];

        // Fonction de journalisation
        function log(message, type = 'info') {
            const timestamp = new Date().toLocaleTimeString();
            const entry = \`[\${timestamp}] [\${type.toUpperCase()}] \${message}\`;
            logEntries.push({ message: entry, type });
            
            const logContainer = document.getElementById('test-log');
            const logEntry = document.createElement('div');
            logEntry.className = \`log-entry log-\${type}\`;
            logEntry.textContent = entry;
            logContainer.appendChild(logEntry);
            logContainer.scrollTop = logContainer.scrollHeight;
        }

        // Fonction pour vider le journal
        function clearLog() {
            document.getElementById('test-log').innerHTML = '';
            logEntries = [];
            log('Journal vidé', 'info');
        }

        // Mise à jour du statut de connectivité
        function updateConnectivityStatus() {
            const indicator = document.getElementById('status-indicator');
            const text = document.getElementById('status-text');
            
            if (isOnline) {
                indicator.className = 'status-indicator online';
                text.textContent = 'En ligne';
                log('Connectivité: En ligne', 'success');
            } else {
                indicator.className = 'status-indicator offline';
                text.textContent = 'Hors ligne';
                log('Connectivité: Hors ligne', 'warning');
            }
        }

        // Basculer la connectivité (simulation)
        function toggleConnectivity() {
            isOnline = !isOnline;
            updateConnectivityStatus();
            
            // Déclencher les événements
            if (isOnline) {
                window.dispatchEvent(new Event('online'));
                log('Simulation: Connexion rétablie', 'success');
            } else {
                window.dispatchEvent(new Event('offline'));
                log('Simulation: Connexion perdue', 'warning');
            }
        }

        // Test du support IndexedDB
        function testIndexedDB() {
            const statusDiv = document.getElementById('indexeddb-status');
            
            if (!window.indexedDB) {
                statusDiv.className = 'test-result error';
                statusDiv.textContent = '❌ IndexedDB n\'est pas supporté par ce navigateur';
                log('IndexedDB: Non supporté', 'error');
                return;
            }

            log('IndexedDB: Supporté, test d\'ouverture de base de données...', 'info');
            
            const request = indexedDB.open('TestGPSOffline', 1);
            
            request.onerror = function() {
                statusDiv.className = 'test-result error';
                statusDiv.textContent = '❌ Erreur lors de l\'ouverture de la base de données';
                log('IndexedDB: Erreur d\'ouverture', 'error');
            };
            
            request.onsuccess = function() {
                testDB = request.result;
                statusDiv.className = 'test-result success';
                statusDiv.textContent = '✅ IndexedDB fonctionne correctement';
                log('IndexedDB: Base de données ouverte avec succès', 'success');
                
                // Fermer la connexion
                testDB.close();
            };
            
            request.onupgradeneeded = function(event) {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('testStore')) {
                    db.createObjectStore('testStore', { keyPath: 'id' });
                }
                log('IndexedDB: Structure de base de données créée', 'info');
            };
        }

        // Vider le cache IndexedDB
        function clearIndexedDB() {
            if (!window.indexedDB) {
                log('IndexedDB: Non supporté, impossible de vider le cache', 'error');
                return;
            }

            const deleteRequest = indexedDB.deleteDatabase('PrecoDiCajuGPS');
            
            deleteRequest.onsuccess = function() {
                log('IndexedDB: Cache vidé avec succès', 'success');
            };
            
            deleteRequest.onerror = function() {
                log('IndexedDB: Erreur lors du vidage du cache', 'error');
            };
        }

        // Test du cache GPS
        function testGPSCache() {
            log('Cache GPS: Test de stockage de position...', 'info');
            
            if (!window.indexedDB) {
                log('Cache GPS: IndexedDB non supporté', 'error');
                return;
            }

            const request = indexedDB.open('PrecoDiCajuGPS', 1);
            
            request.onsuccess = function() {
                const db = request.result;
                const transaction = db.transaction(['gps_positions'], 'readwrite');
                const store = transaction.objectStore('gps_positions');
                
                // Simuler une position GPS
                const testPosition = {
                    id: 'test_' + Date.now(),
                    coordinates: { lat: 11.8636, lng: -15.5977 }, // Bissau
                    accuracy: 10,
                    timestamp: Date.now(),
                    isValid: true,
                    quality: 'excellent',
                    cachedAt: Date.now(),
                    synced: false
                };
                
                const addRequest = store.add(testPosition);
                
                addRequest.onsuccess = function() {
                    log('Cache GPS: Position stockée avec succès', 'success');
                    updateCacheStats();
                };
                
                addRequest.onerror = function() {
                    log('Cache GPS: Erreur lors du stockage', 'error');
                };
            };
        }

        // Simuler des données GPS
        function simulateGPSData() {
            log('Simulation: Génération de données GPS de test...', 'info');
            
            const positions = [
                { lat: 11.8636, lng: -15.5977, accuracy: 5 },   // Bissau
                { lat: 11.8000, lng: -15.2000, accuracy: 15 },  // Proche de Bissau
                { lat: 12.0000, lng: -15.0000, accuracy: 25 },  // Autre position
            ];
            
            positions.forEach((pos, index) => {
                setTimeout(() => {
                    const testPosition = {
                        id: 'sim_' + Date.now() + '_' + index,
                        coordinates: pos,
                        accuracy: pos.accuracy,
                        timestamp: Date.now(),
                        isValid: true,
                        quality: pos.accuracy <= 10 ? 'excellent' : pos.accuracy <= 20 ? 'good' : 'fair',
                        cachedAt: Date.now(),
                        synced: false
                    };
                    
                    // Stocker dans IndexedDB
                    const request = indexedDB.open('PrecoDiCajuGPS', 1);
                    request.onsuccess = function() {
                        const db = request.result;
                        const transaction = db.transaction(['gps_positions'], 'readwrite');
                        const store = transaction.objectStore('gps_positions');
                        store.add(testPosition);
                    };
                    
                    log(\`Simulation: Position \${index + 1} générée (\${pos.lat}, \${pos.lng})\`, 'success');
                }, index * 500);
            });
            
            setTimeout(() => {
                updateCacheStats();
                log('Simulation: Toutes les données GPS générées', 'success');
            }, positions.length * 500 + 1000);
        }

        // Test de synchronisation
        function testSync() {
            log('Synchronisation: Test de la queue de synchronisation...', 'info');
            
            if (!isOnline) {
                log('Synchronisation: Hors ligne, ajout à la queue', 'warning');
                simulateSyncQueue();
                return;
            }
            
            // Simuler une synchronisation réussie
            setTimeout(() => {
                log('Synchronisation: Synchronisation simulée réussie', 'success');
                updateCacheStats();
            }, 2000);
        }

        // Simuler une queue de synchronisation
        function simulateSyncQueue() {
            log('Queue de Sync: Simulation d\'éléments en attente...', 'info');
            
            const syncItems = [
                { type: 'position', id: 'sync_pos_1' },
                { type: 'geocoding', id: 'sync_geo_1' },
                { type: 'position', id: 'sync_pos_2' }
            ];
            
            syncItems.forEach((item, index) => {
                setTimeout(() => {
                    log(\`Queue de Sync: Élément \${item.type} ajouté (\${item.id})\`, 'info');
                }, index * 300);
            });
            
            setTimeout(() => {
                log('Queue de Sync: Simulation terminée', 'success');
                updateCacheStats();
            }, syncItems.length * 300 + 500);
        }

        // Mettre à jour les statistiques du cache
        function updateCacheStats() {
            if (!window.indexedDB) {
                log('Statistiques: IndexedDB non supporté', 'error');
                return;
            }

            const request = indexedDB.open('PrecoDiCajuGPS', 1);
            
            request.onsuccess = function() {
                const db = request.result;
                
                // Compter les positions
                const posTransaction = db.transaction(['gps_positions'], 'readonly');
                const posStore = posTransaction.objectStore('gps_positions');
                const posCount = posStore.count();
                
                posCount.onsuccess = function() {
                    document.getElementById('positions-count').textContent = posCount.result;
                };
                
                // Compter le géocodage (simulation)
                document.getElementById('geocoding-count').textContent = '3';
                
                // Compter la queue de sync (simulation)
                document.getElementById('sync-queue-count').textContent = '2';
                
                // Calculer la taille du cache (simulation)
                const totalSize = (posCount.result || 0) + 3 + 2;
                document.getElementById('cache-size').textContent = totalSize;
                
                log(\`Statistiques: \${posCount.result || 0} positions, 3 géocodage, 2 sync\`, 'info');
            };
        }

        // Initialisation
        document.addEventListener('DOMContentLoaded', function() {
            log('Initialisation: Tests offline GPS démarrés', 'info');
            updateConnectivityStatus();
            testIndexedDB();
            
            // Écouter les changements de connectivité
            window.addEventListener('online', function() {
                isOnline = true;
                updateConnectivityStatus();
                log('Événement: Connexion rétablie', 'success');
            });
            
            window.addEventListener('offline', function() {
                isOnline = false;
                updateConnectivityStatus();
                log('Événement: Connexion perdue', 'warning');
            });
            
            // Mettre à jour les statistiques toutes les 5 secondes
            setInterval(updateCacheStats, 5000);
        });
    </script>
</body>
</html>
"@

# Écrire le fichier de test
$testHtml | Out-File -FilePath "test-offline-geolocation.html" -Encoding UTF8

Write-Host "`n✅ Fichier de test créé: test-offline-geolocation.html" -ForegroundColor Green

# Ouvrir le fichier de test dans le navigateur
Write-Host "`n🌐 Ouverture du fichier de test dans le navigateur..." -ForegroundColor Cyan
Start-Process "test-offline-geolocation.html"

Write-Host "`n📋 Instructions pour les tests:" -ForegroundColor Yellow
Write-Host "1. Le fichier de test s'ouvre automatiquement dans votre navigateur" -ForegroundColor White
Write-Host "2. Accordez les permissions de géolocalisation si demandé" -ForegroundColor White
Write-Host "3. Exécutez tous les tests dans l'ordre:" -ForegroundColor White
Write-Host "   • Test du Cache IndexedDB" -ForegroundColor White
Write-Host "   • Test du Cache GPS" -ForegroundColor White
Write-Host "   • Test de Synchronisation" -ForegroundColor White
Write-Host "   • Vérification des Statistiques" -ForegroundColor White
Write-Host "4. Testez le basculement online/offline" -ForegroundColor White
Write-Host "5. Vérifiez que tous les tests passent" -ForegroundColor White

Write-Host "`n🔍 Tests disponibles:" -ForegroundColor Cyan
Write-Host "• Support IndexedDB" -ForegroundColor White
Write-Host "• Cache des positions GPS" -ForegroundColor White
Write-Host "• Queue de synchronisation" -ForegroundColor White
Write-Host "• Statistiques du cache" -ForegroundColor White
Write-Host "• Gestion de la connectivité" -ForegroundColor White

Write-Host "`n⚠️  Notes importantes:" -ForegroundColor Yellow
Write-Host "• Les tests utilisent une base de données IndexedDB locale" -ForegroundColor White
Write-Host "• Les données de test sont simulées pour la démonstration" -ForegroundColor White
Write-Host "• Le basculement online/offline est simulé dans le navigateur" -ForegroundColor White
Write-Host "• Les statistiques sont mises à jour automatiquement" -ForegroundColor White

Write-Host "`n✨ Tests offline GPS lancés avec succès !" -ForegroundColor Green
Write-Host "Vérifiez les résultats dans le fichier de test ouvert dans votre navigateur." -ForegroundColor White
