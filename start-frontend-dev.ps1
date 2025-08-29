# Script de démarrage du frontend en mode développement
Write-Host "=== Démarrage du Frontend en Mode Développement ===" -ForegroundColor Green

# 1. Vérifier que le backend est accessible
Write-Host "`n1. Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend non accessible: $($response.StatusCode)" -ForegroundColor Red
        Write-Host "Démarrez d'abord le backend avec: .\start-complete.ps1" -ForegroundColor Cyan
        exit 1
    }
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Démarrez d'abord le backend avec: .\start-complete.ps1" -ForegroundColor Cyan
    exit 1
}

# 2. Vérifier que Node.js est installé
Write-Host "`n2. Vérification de Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    $npmVersion = npm --version 2>$null
    
    if ($nodeVersion -and $npmVersion) {
        Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
        Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Node.js ou npm non trouvé" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Node.js non installé" -ForegroundColor Red
    exit 1
}

# 3. Aller dans le dossier frontend
Write-Host "`n3. Navigation vers le dossier frontend..." -ForegroundColor Yellow
if (Test-Path "frontend") {
    Set-Location "frontend"
    Write-Host "✅ Dossier frontend trouvé" -ForegroundColor Green
} else {
    Write-Host "❌ Dossier frontend non trouvé" -ForegroundColor Red
    exit 1
}

# 4. Vérifier les dépendances
Write-Host "`n4. Vérification des dépendances..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Dépendances déjà installées" -ForegroundColor Green
} else {
    Write-Host "⏳ Installation des dépendances..." -ForegroundColor Yellow
    try {
        npm install
        Write-Host "✅ Dépendances installées" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de l'installation des dépendances" -ForegroundColor Red
        exit 1
    }
}

# 5. Démarrer le serveur de développement
Write-Host "`n5. Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host "Le frontend sera accessible sur: http://localhost:5173" -ForegroundColor Cyan
Write-Host "Appuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow

try {
    npm run dev
} catch {
    Write-Host "❌ Erreur lors du démarrage du serveur de développement" -ForegroundColor Red
    Write-Host "Vérifiez que le script 'dev' est défini dans package.json" -ForegroundColor Cyan
}
