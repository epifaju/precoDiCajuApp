# Complete startup script for Preço di Cajú with POI feature
# This script starts the backend, runs migrations, and provides testing instructions

Write-Host "🚀 Starting Preço di Cajú with Interactive Map of Buyers (POI) Feature" -ForegroundColor Green
Write-Host "=====================================================================" -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "backend/pom.xml")) {
    Write-Host "❌ Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Function to check if a port is in use
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

# Check if PostgreSQL is running
Write-Host "`n📊 Checking PostgreSQL status..." -ForegroundColor Yellow
if (Test-Port 5433) {
    Write-Host "✅ PostgreSQL is running on port 5433" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL not detected on port 5433" -ForegroundColor Yellow
    Write-Host "   Starting PostgreSQL with Docker..." -ForegroundColor Cyan
    
    # Start PostgreSQL with Docker Compose
    try {
        docker-compose up -d postgres redis
        Start-Sleep -Seconds 10
        Write-Host "✅ PostgreSQL and Redis started successfully" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to start PostgreSQL with Docker" -ForegroundColor Red
        Write-Host "   Please ensure Docker is installed and running" -ForegroundColor Yellow
        exit 1
    }
}

# Check if Redis is running
Write-Host "`n📦 Checking Redis status..." -ForegroundColor Yellow
if (Test-Port 6379) {
    Write-Host "✅ Redis is running on port 6379" -ForegroundColor Green
} else {
    Write-Host "⚠️  Redis not detected on port 6379" -ForegroundColor Yellow
    Write-Host "   Please ensure Redis is started with Docker Compose" -ForegroundColor Cyan
}

# Start Backend
Write-Host "`n🔧 Starting Spring Boot Backend..." -ForegroundColor Yellow
Set-Location backend

# Check if backend is already running
if (Test-Port 8080) {
    Write-Host "⚠️  Backend already running on port 8080" -ForegroundColor Yellow
    Write-Host "   Stopping existing backend..." -ForegroundColor Cyan
    
    # Try to stop existing backend
    try {
        $backendProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*precaju*" }
        if ($backendProcess) {
            $backendProcess.Kill()
            Start-Sleep -Seconds 3
        }
    } catch {
        Write-Host "   Could not stop existing backend process" -ForegroundColor Yellow
    }
}

# Build and start backend
Write-Host "   Building backend with Maven..." -ForegroundColor Cyan
try {
    mvn clean compile -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend compiled successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend compilation failed" -ForegroundColor Red
        Set-Location ..
        exit 1
    }
} catch {
    Write-Host "❌ Maven build failed: $($_.Exception.Message)" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Write-Host "   Starting Spring Boot application..." -ForegroundColor Cyan
Write-Host "   (This will run the database migration V13__Create_poi_table.sql)" -ForegroundColor Cyan

# Start backend in background
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WindowStyle Minimized -PassThru | Out-Null

# Wait for backend to start
Write-Host "   Waiting for backend to start..." -ForegroundColor Cyan
$timeout = 60
$elapsed = 0
do {
    Start-Sleep -Seconds 2
    $elapsed += 2
    if (Test-Port 8080) {
        Write-Host "✅ Backend started successfully on port 8080" -ForegroundColor Green
        break
    }
    Write-Host "   Still waiting... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
} while ($elapsed -lt $timeout)

if ($elapsed -ge $timeout) {
    Write-Host "❌ Backend failed to start within $timeout seconds" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Test POI endpoints
Write-Host "`n🧪 Testing POI endpoints..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/poi/stats" -Method GET -TimeoutSec 10
    Write-Host "✅ POI endpoints working! Found $($response.totalCount) POIs in database" -ForegroundColor Green
    Write-Host "   - Buyers: $($response.acheteurCount)" -ForegroundColor Cyan
    Write-Host "   - Cooperatives: $($response.cooperativeCount)" -ForegroundColor Cyan
    Write-Host "   - Warehouses: $($response.entrepotCount)" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  POI endpoints test failed: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   The backend might still be starting up..." -ForegroundColor Yellow
}

# Start Frontend
Write-Host "`n🎨 Starting React Frontend..." -ForegroundColor Yellow
Set-Location frontend

# Check if frontend is already running
if (Test-Port 3000) {
    Write-Host "⚠️  Frontend already running on port 3000" -ForegroundColor Yellow
    Write-Host "   Please close the existing frontend and restart this script" -ForegroundColor Cyan
    Set-Location ..
    exit 1
}

Write-Host "   Installing dependencies (if needed)..." -ForegroundColor Cyan
try {
    npm install --silent
    Write-Host "✅ Dependencies installed" -ForegroundColor Green
} catch {
    Write-Host "⚠️  npm install failed, but continuing..." -ForegroundColor Yellow
}

Write-Host "   Starting Vite development server..." -ForegroundColor Cyan
Write-Host "   (This will start the React app with POI map feature)" -ForegroundColor Cyan

# Start frontend in background
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Minimized -PassThru | Out-Null

# Wait for frontend to start
Write-Host "   Waiting for frontend to start..." -ForegroundColor Cyan
$timeout = 30
$elapsed = 0
do {
    Start-Sleep -Seconds 2
    $elapsed += 2
    if (Test-Port 3000) {
        Write-Host "✅ Frontend started successfully on port 3000" -ForegroundColor Green
        break
    }
    Write-Host "   Still waiting... ($elapsed/$timeout seconds)" -ForegroundColor Yellow
} while ($elapsed -lt $timeout)

if ($elapsed -ge $timeout) {
    Write-Host "❌ Frontend failed to start within $timeout seconds" -ForegroundColor Red
    Set-Location ..
    exit 1
}

Set-Location ..

# Success message
Write-Host "`n🎉 Preço di Cajú with POI Feature Started Successfully!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

Write-Host "`n📱 Application URLs:" -ForegroundColor Yellow
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Backend API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   POI Map: http://localhost:3000/poi" -ForegroundColor Cyan

Write-Host "`n🗺️  POI Map Features:" -ForegroundColor Yellow
Write-Host "   ✅ Interactive map with Leaflet.js" -ForegroundColor Green
Write-Host "   ✅ POI markers (buyers, cooperatives, warehouses)" -ForegroundColor Green
Write-Host "   ✅ Direct phone calls via tel: links" -ForegroundColor Green
Write-Host "   ✅ Offline mode with IndexedDB storage" -ForegroundColor Green
Write-Host "   ✅ Filter by type, search, geographic bounds" -ForegroundColor Green
Write-Host "   ✅ Real-time sync when online" -ForegroundColor Green
Write-Host "   ✅ Multi-language support (PT, FR, EN)" -ForegroundColor Green

Write-Host "`n🧪 Testing Commands:" -ForegroundColor Yellow
Write-Host "   Test POI endpoints: .\test-poi-endpoints.ps1" -ForegroundColor Cyan
Write-Host "   Check backend logs: Get-Content backend\target\logs\application.log -Tail 20" -ForegroundColor Cyan

Write-Host "`n📊 Sample Data:" -ForegroundColor Yellow
Write-Host "   The database includes 10 sample POIs:" -ForegroundColor Cyan
Write-Host "   - 3 Acheteurs agréés (Buyers)" -ForegroundColor Cyan
Write-Host "   - 4 Coopératives (Cooperatives)" -ForegroundColor Cyan
Write-Host "   - 3 Entrepôts d'exportation (Warehouses)" -ForegroundColor Cyan

Write-Host "`n🔧 Admin Features:" -ForegroundColor Yellow
Write-Host "   - Admin users can create, update, and delete POIs" -ForegroundColor Cyan
Write-Host "   - Access admin panel at http://localhost:3000/admin" -ForegroundColor Cyan

Write-Host "`n💡 Tips:" -ForegroundColor Yellow
Write-Host "   - The map works offline after first load" -ForegroundColor Cyan
Write-Host "   - POI data syncs automatically when online" -ForegroundColor Cyan
Write-Host "   - Use filters to find specific types of POIs" -ForegroundColor Cyan
Write-Host "   - Click markers for detailed POI information" -ForegroundColor Cyan

Write-Host "`n🚀 Ready to use! Navigate to http://localhost:3000/poi to explore the Interactive Map!" -ForegroundColor Green
