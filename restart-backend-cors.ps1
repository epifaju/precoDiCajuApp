# Restart Backend with New CORS Configuration
Write-Host "🔄 RESTARTING BACKEND WITH NEW CORS CONFIG" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host ""
Write-Host "🛑 Stopping existing backend processes..." -ForegroundColor Yellow

# Stop any existing Java processes on port 8080
try {
    $processes = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
    if ($processes) {
        foreach ($pid in $processes) {
            try {
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                Write-Host "  Stopped process PID: $pid" -ForegroundColor Gray
            } catch {
                Write-Host "  Could not stop process PID: $pid" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "  No processes found on port 8080" -ForegroundColor Gray
    }
} catch {
    Write-Host "  No processes found on port 8080" -ForegroundColor Gray
}

Write-Host ""
Write-Host "⏳ Waiting for port to be free..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🚀 Starting backend with new CORS configuration..." -ForegroundColor Yellow

# Change to backend directory
Set-Location "backend"

# Clean and rebuild
Write-Host "  Cleaning and rebuilding..." -ForegroundColor Gray
try {
    mvn clean compile -q
    Write-Host "  ✅ Build successful" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Build failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Start the application
Write-Host "  Starting Spring Boot application..." -ForegroundColor Gray
try {
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory "backend" -WindowStyle Hidden
    Write-Host "  ✅ Backend started successfully" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to start backend: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⏳ Waiting for backend to start up..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "🔍 Testing backend health..." -ForegroundColor Cyan

$maxAttempts = 10
$attempt = 0

while ($attempt -lt $maxAttempts) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Backend is running and healthy!" -ForegroundColor Green
            break
        }
    } catch {
        $attempt++
        Write-Host "  Attempt $attempt/$maxAttempts - Backend not ready yet..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "❌ Backend failed to start within expected time" -ForegroundColor Red
    Write-Host "💡 Check the logs for any errors" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "🎯 Backend is ready! Now test CORS with:" -ForegroundColor Green
    Write-Host "   .\test-cors-fix.ps1" -ForegroundColor Cyan
}

# Return to root directory
Set-Location ".."
