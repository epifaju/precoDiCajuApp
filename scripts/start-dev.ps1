# Script PowerShell pour démarrer l'environnement de développement complet
# Usage: .\scripts\start-dev.ps1

param()

Write-Host "🚀 Démarrage de l'environnement de développement Preço di Cajú" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Vérifier que Docker est installé et en cours d'exécution
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker est installé: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

try {
    docker info | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier que docker-compose est disponible
try {
    $composeVersion = docker-compose --version
    Write-Host "✅ Docker Compose est disponible: $composeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ docker-compose n'est pas installé." -ForegroundColor Red
    exit 1
}

# Nettoyer les anciens containers si nécessaire
Write-Host "🧹 Nettoyage des anciens containers..." -ForegroundColor Yellow
docker-compose down --remove-orphans

# Construire et démarrer les services
Write-Host "🔨 Construction et démarrage des services..." -ForegroundColor Yellow
docker-compose up --build -d

# Attendre que tous les services soient prêts
Write-Host "⏳ Attente que tous les services soient prêts..." -ForegroundColor Yellow

# Attendre PostgreSQL
Write-Host "  Attente de PostgreSQL..." -ForegroundColor Cyan
do {
    Start-Sleep -Seconds 2
    $pgReady = docker-compose exec postgres pg_isready -U precaju -d precaju
} while ($LASTEXITCODE -ne 0)
Write-Host "✅ PostgreSQL est prêt" -ForegroundColor Green

# Attendre Redis
Write-Host "  Attente de Redis..." -ForegroundColor Cyan
do {
    Start-Sleep -Seconds 2
    $redisReady = docker-compose exec redis redis-cli ping
} while ($LASTEXITCODE -ne 0)
Write-Host "✅ Redis est prêt" -ForegroundColor Green

# Attendre le backend
Write-Host "  Attente du backend Spring Boot..." -ForegroundColor Cyan
do {
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -TimeoutSec 5
        $backendReady = $response.StatusCode -eq 200
    } catch {
        $backendReady = $false
    }
} while (-not $backendReady)
Write-Host "✅ Backend est prêt" -ForegroundColor Green

# Attendre le frontend
Write-Host "  Attente du frontend React..." -ForegroundColor Cyan
do {
    Start-Sleep -Seconds 5
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -TimeoutSec 5
        $frontendReady = $response.StatusCode -eq 200
    } catch {
        $frontendReady = $false
    }
} while (-not $frontendReady)
Write-Host "✅ Frontend est prêt" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Environnement de développement prêt!" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green
Write-Host "📱 Frontend (React PWA):     http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API:              http://localhost:8080" -ForegroundColor Cyan
Write-Host "🗄️  Base de données:          localhost:5432" -ForegroundColor Cyan
Write-Host "🔴 Redis:                    localhost:6379" -ForegroundColor Cyan
Write-Host "📊 Health Check Backend:     http://localhost:8080/actuator/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Pour voir les logs:" -ForegroundColor Yellow
Write-Host "   docker-compose logs -f"
Write-Host ""
Write-Host "🛑 Pour arrêter:" -ForegroundColor Yellow
Write-Host "   docker-compose down"
Write-Host ""
Write-Host "🔧 Pour redémarrer un service:" -ForegroundColor Yellow
Write-Host "   docker-compose restart <service-name>"
Write-Host ""

# Optionnel: ouvrir automatiquement le navigateur
try {
    Start-Process "http://localhost:3000"
    Write-Host "🌐 Navigateur ouvert automatiquement" -ForegroundColor Green
} catch {
    Write-Host "🌐 Veuillez ouvrir manuellement: http://localhost:3000" -ForegroundColor Yellow
}

Write-Host "✨ Bon développement!" -ForegroundColor Green






