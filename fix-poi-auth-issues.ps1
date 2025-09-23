# Script de réparation des problèmes d'authentification POI
# Ce script résout les problèmes 401/503 identifiés dans les logs

Write-Host "🔧 Script de Réparation POI - Problèmes d'Authentification" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host ""

$API_BASE_URL = "http://localhost:8080"

function Write-Step {
    param([string]$Message)
    Write-Host "➤ $Message" -ForegroundColor Yellow
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# 1. Arrêter tous les services
Write-Step "Arrêt des services existants..."
try {
    # Arrêter le backend s'il tourne
    $javaProcesses = Get-Process java -ErrorAction SilentlyContinue
    if ($javaProcesses) {
        Stop-Process -Name java -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        Write-Success "Backend Java arrêté"
    }
    
    # Arrêter le frontend s'il tourne
    $nodeProcesses = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }
    if ($nodeProcesses) {
        Stop-Process -Name node -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Success "Frontend Node arrêté"
    }
}
catch {
    Write-Warning "Erreur lors de l'arrêt des services: $($_.Exception.Message)"
}

# 2. Nettoyer et redémarrer les conteneurs Docker
Write-Step "Redémarrage des conteneurs Docker..."
try {
    docker-compose down --remove-orphans
    Start-Sleep -Seconds 2
    
    # Vérifier que PostgreSQL démarre correctement
    docker-compose up -d postgres redis
    Write-Host "Attente du démarrage de PostgreSQL..." -ForegroundColor Gray
    
    # Attendre que PostgreSQL soit prêt
    $maxWaitTime = 60
    $waitTime = 0
    $dbReady = $false
    
    while ($waitTime -lt $maxWaitTime -and -not $dbReady) {
        try {
            $result = docker exec precadicajuapp-postgres-1 pg_isready -U precaju -d precaju 2>$null
            if ($LASTEXITCODE -eq 0) {
                $dbReady = $true
                Write-Success "PostgreSQL est prêt"
            }
            else {
                Start-Sleep -Seconds 2
                $waitTime += 2
                Write-Host "." -NoNewline -ForegroundColor Gray
            }
        }
        catch {
            Start-Sleep -Seconds 2
            $waitTime += 2
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
    }
    
    if (-not $dbReady) {
        Write-Error "PostgreSQL n'a pas démarré dans les temps"
        exit 1
    }
    
}
catch {
    Write-Error "Erreur Docker: $($_.Exception.Message)"
    exit 1
}

# 3. Recompiler et démarrer le backend
Write-Step "Recompilation et démarrage du backend..."
try {
    Push-Location backend
    
    # Clean et package
    .\mvnw clean package -DskipTests -q
    if ($LASTEXITCODE -ne 0) {
        Write-Error "Erreur de compilation Maven"
        Pop-Location
        exit 1
    }
    
    # Démarrer le backend en arrière-plan
    Start-Process -FilePath ".\mvnw.cmd" -ArgumentList "spring-boot:run" -WindowStyle Hidden
    
    Pop-Location
    Write-Success "Backend en cours de démarrage..."
    
}
catch {
    Write-Error "Erreur backend: $($_.Exception.Message)"
    Pop-Location
    exit 1
}

# 4. Attendre que le backend soit prêt
Write-Step "Attente du démarrage complet du backend..."
$maxWaitTime = 120
$waitTime = 0
$backendReady = $false

while ($waitTime -lt $maxWaitTime -and -not $backendReady) {
    try {
        $response = Invoke-RestMethod -Uri "$API_BASE_URL/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.status -eq "UP") {
            $backendReady = $true
            Write-Success "Backend est opérationnel"
        }
    }
    catch {
        Start-Sleep -Seconds 3
        $waitTime += 3
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if (-not $backendReady) {
    Write-Error "Backend n'a pas démarré correctement"
    Write-Host "Vérifiez les logs backend avec: cd backend && .\mvnw spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# 5. Tester les endpoints POI
Write-Step "Test des endpoints POI..."
$poiEndpoints = @(
    @{ Url = "$API_BASE_URL/api/poi/health"; Description = "POI Health Check" },
    @{ Url = "$API_BASE_URL/api/poi/stats"; Description = "POI Statistics" },
    @{ Url = "$API_BASE_URL/api/poi"; Description = "POI List" }
)

$workingEndpoints = 0
foreach ($endpoint in $poiEndpoints) {
    try {
        $response = Invoke-RestMethod -Uri $endpoint.Url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Success "$($endpoint.Description): OK"
        $workingEndpoints++
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 401) {
            Write-Error "$($endpoint.Description): ERREUR 401 - Authentification requise"
        }
        else {
            Write-Error "$($endpoint.Description): $($_.Exception.Message)"
        }
    }
}

if ($workingEndpoints -eq $poiEndpoints.Count) {
    Write-Success "Tous les endpoints POI fonctionnent correctement"
}
else {
    Write-Warning "$workingEndpoints/$($poiEndpoints.Count) endpoints fonctionnent"
}

# 6. Démarrer le frontend
Write-Step "Démarrage du frontend..."
try {
    Push-Location frontend
    
    # Installer les dépendances si nécessaire
    if (-not (Test-Path "node_modules")) {
        npm install
    }
    
    # Démarrer le frontend en arrière-plan
    Start-Process -FilePath "npm" -ArgumentList "run dev" -WindowStyle Hidden
    
    Pop-Location
    Write-Success "Frontend en cours de démarrage..."
    
    # Attendre que le frontend soit prêt
    Start-Sleep -Seconds 10
    
}
catch {
    Write-Error "Erreur frontend: $($_.Exception.Message)"
    Pop-Location
}

# 7. Résumé et instructions
Write-Host ""
Write-Host "🎯 Résumé de la Réparation" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

if ($workingEndpoints -eq $poiEndpoints.Count) {
    Write-Success "✅ Problèmes d'authentification POI corrigés"
    Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Green
    Write-Host "   Backend:  http://localhost:8080" -ForegroundColor Green
    Write-Host "   Page POI: http://localhost:3000/poi" -ForegroundColor Green
}
else {
    Write-Warning "⚠️  Problèmes persistants détectés"
    Write-Host ""
    Write-Host "Actions recommandées:" -ForegroundColor Yellow
    Write-Host "1. Vérifier les logs backend:" -ForegroundColor Gray
    Write-Host "   cd backend && .\mvnw spring-boot:run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. Vérifier la configuration Security:" -ForegroundColor Gray
    Write-Host "   backend/src/main/java/gw/precaju/config/SecurityConfig.java" -ForegroundColor Gray
    Write-Host ""
    Write-Host "3. Tester manuellement:" -ForegroundColor Gray
    Write-Host "   curl http://localhost:8080/api/poi/health" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Accéder à http://localhost:3000/poi" -ForegroundColor Gray
Write-Host "2. Vérifier que la synchronisation POI fonctionne" -ForegroundColor Gray
Write-Host "3. Contrôler la console navigateur pour les erreurs" -ForegroundColor Gray

Write-Host ""
Write-Host "🔧 Script terminé!" -ForegroundColor Cyan

