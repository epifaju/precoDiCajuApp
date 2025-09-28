#!/usr/bin/env pwsh

Write-Host "🚀 Démarrage de l'application avec corrections CORS" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Fonction pour vérifier si un port est utilisé
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Vérifier les ports
Write-Host "`n1. Vérification des ports..." -ForegroundColor Yellow

if (Test-Port 8080) {
    Write-Host "✅ Port 8080 (Backend) - déjà utilisé" -ForegroundColor Green
    $backendRunning = $true
} else {
    Write-Host "⚠️  Port 8080 (Backend) - libre" -ForegroundColor Yellow
    $backendRunning = $false
}

if (Test-Port 3001) {
    Write-Host "⚠️  Port 3001 (Frontend) - déjà utilisé" -ForegroundColor Yellow
    Write-Host "   Arrêt du processus sur le port 3001..." -ForegroundColor Gray
    
    try {
        $process = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | 
                   ForEach-Object { Get-Process -Id $_.OwningProcess -ErrorAction SilentlyContinue } |
                   Select-Object -First 1
        
        if ($process) {
            Stop-Process -Id $process.Id -Force
            Start-Sleep -Seconds 2
            Write-Host "   ✅ Processus arrêté" -ForegroundColor Green
        }
    } catch {
        Write-Host "   ⚠️  Impossible d'arrêter le processus" -ForegroundColor Yellow
    }
}

# Démarrer le backend si nécessaire
if (-not $backendRunning) {
    Write-Host "`n2. Démarrage du backend..." -ForegroundColor Yellow
    
    $backendPath = "backend"
    if (Test-Path $backendPath) {
        Set-Location $backendPath
        
        # Vérifier si Maven est disponible
        try {
            $mvnVersion = mvn -version 2>$null
            Write-Host "✅ Maven disponible" -ForegroundColor Green
            
            Write-Host "   Compilation du backend..." -ForegroundColor Gray
            mvn clean compile -q
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Compilation réussie" -ForegroundColor Green
                
                Write-Host "   Démarrage du serveur Spring Boot..." -ForegroundColor Gray
                Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WindowStyle Minimized
                
                # Attendre que le backend soit prêt
                Write-Host "   Attente du démarrage du backend..." -ForegroundColor Gray
                $maxWait = 60 # 60 secondes
                $waited = 0
                
                do {
                    Start-Sleep -Seconds 2
                    $waited += 2
                    
                    if (Test-Port 8080) {
                        Write-Host "   ✅ Backend démarré (port 8080)" -ForegroundColor Green
                        break
                    }
                    
                    Write-Host "   ... ($waited/${maxWait}s)" -NoNewline
                    Write-Host "`r" -NoNewline
                } while ($waited -lt $maxWait)
                
                if ($waited -ge $maxWait) {
                    Write-Host "   ❌ Timeout - Backend non démarré" -ForegroundColor Red
                    exit 1
                }
            } else {
                Write-Host "   ❌ Erreur de compilation" -ForegroundColor Red
                exit 1
            }
        } catch {
            Write-Host "❌ Maven non disponible - veuillez installer Maven" -ForegroundColor Red
            exit 1
        }
        
        Set-Location ..
    } else {
        Write-Host "❌ Dossier backend non trouvé" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "`n2. Backend déjà en cours d'exécution" -ForegroundColor Green
}

# Démarrer le frontend
Write-Host "`n3. Démarrage du frontend..." -ForegroundColor Yellow

$frontendPath = "frontend"
if (Test-Path $frontendPath) {
    Set-Location $frontendPath
    
    # Vérifier si npm est disponible
    try {
        $npmVersion = npm --version 2>$null
        Write-Host "✅ npm disponible (version: $npmVersion)" -ForegroundColor Green
        
        # Installer les dépendances si nécessaire
        if (-not (Test-Path "node_modules")) {
            Write-Host "   Installation des dépendances..." -ForegroundColor Gray
            npm install
        }
        
        Write-Host "   Démarrage du serveur de développement..." -ForegroundColor Gray
        Write-Host "   Frontend accessible sur: http://localhost:3001" -ForegroundColor Cyan
        
        # Démarrer le serveur de développement
        npm run dev
        
    } catch {
        Write-Host "❌ npm non disponible - veuillez installer Node.js" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
    
    Set-Location ..
} else {
    Write-Host "❌ Dossier frontend non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Application démarrée avec succès!" -ForegroundColor Green
Write-Host "`n📋 Informations:" -ForegroundColor Cyan
Write-Host "- Backend: http://localhost:8080" -ForegroundColor White
Write-Host "- Frontend: http://localhost:3001" -ForegroundColor White
Write-Host "- API Health: http://localhost:8080/actuator/health" -ForegroundColor White

Write-Host "`n🔧 Corrections appliquées:" -ForegroundColor Cyan
Write-Host "- Configuration CORS améliorée" -ForegroundColor White
Write-Host "- Timeouts augmentés (15s)" -ForegroundColor White
Write-Host "- Gestion d'erreurs optimisée" -ForegroundColor White
Write-Host "- Retry logic implémentée" -ForegroundColor White

Write-Host "`n💡 Pour tester les corrections:" -ForegroundColor Cyan
Write-Host "1. Ouvrez http://localhost:3001 dans votre navigateur" -ForegroundColor White
Write-Host "2. Ouvrez les outils de développement (F12)" -ForegroundColor White
Write-Host "3. Vérifiez l'onglet Console pour les erreurs" -ForegroundColor White
Write-Host "4. Testez les fonctionnalités d'exportateurs" -ForegroundColor White

Write-Host "`n✅ Prêt à utiliser!" -ForegroundColor Green

