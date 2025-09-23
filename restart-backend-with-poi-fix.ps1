# Restart Backend with POI Security Fix
Write-Host "🔄 Restarting Backend with POI Security Configuration..." -ForegroundColor Yellow

# Stop any existing backend processes
Write-Host "Stopping existing backend processes..." -ForegroundColor Blue
Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "java" } | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment for processes to stop
Start-Sleep -Seconds 3

# Start the backend
Write-Host "Starting backend with updated security configuration..." -ForegroundColor Green
cd backend
Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WindowStyle Hidden

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Test POI endpoints
Write-Host "Testing POI endpoints..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/poi/stats" -Method GET -TimeoutSec 10
    Write-Host "✅ POI endpoints are working!" -ForegroundColor Green
    Write-Host "POI Stats: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor White
} catch {
    Write-Host "❌ POI endpoints still not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Backend restart complete!" -ForegroundColor Green
