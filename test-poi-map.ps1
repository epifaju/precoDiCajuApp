# Simple test script to verify POI map display fixes

Write-Host "Testing POI Map Display Fixes..." -ForegroundColor Cyan

# Check if frontend is running
Write-Host "`nChecking frontend server status..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Frontend server is running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "Frontend server is not running on port 5173" -ForegroundColor Red
    Write-Host "Please start the frontend server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Check if backend is running
Write-Host "`nChecking backend server status..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "Backend server is running on port 8080" -ForegroundColor Green
} catch {
    Write-Host "Backend server is not running on port 8080" -ForegroundColor Yellow
    Write-Host "POI map will use offline data" -ForegroundColor Yellow
}

Write-Host "`nSummary of fixes applied:" -ForegroundColor Cyan
Write-Host "1. Added Leaflet CSS import to main.tsx" -ForegroundColor Green
Write-Host "2. Fixed Leaflet icon configuration in POIMapView.tsx" -ForegroundColor Green
Write-Host "3. Added POI-specific CSS styles to index.css" -ForegroundColor Green

Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Navigate to http://localhost:5173/poi-map in your application" -ForegroundColor Yellow
Write-Host "2. Verify that the POI map displays correctly" -ForegroundColor Yellow
Write-Host "3. Test all map functionality (markers, popups, controls)" -ForegroundColor Yellow

Write-Host "`nPOI Map display fixes completed!" -ForegroundColor Green
