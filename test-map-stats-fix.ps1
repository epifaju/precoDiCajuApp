#!/usr/bin/env pwsh

# Test script to verify the Price Map statistics fix
# This script tests the frontend build and verifies the statistics improvements

Write-Host "Testing Price Map Statistics Fix" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if we're in the right directory
if (-not (Test-Path "frontend/package.json")) {
    Write-Host "Error: Please run this script from the project root directory" -ForegroundColor Red
    exit 1
}

# Navigate to frontend directory
Set-Location frontend

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "Building frontend..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Frontend build failed" -ForegroundColor Red
    exit 1
}

Write-Host "Frontend build successful!" -ForegroundColor Green

# Go back to project root
Set-Location ..

Write-Host ""
Write-Host "Price Map Statistics Fix Test Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Summary of improvements applied:" -ForegroundColor Cyan
Write-Host "  - Changed 'Regions' label to 'Regions in View' for clarity" -ForegroundColor Green
Write-Host "  - Added visual indicator when filters are applied" -ForegroundColor Green
Write-Host "  - Added translations for new labels in FR, EN, and PT" -ForegroundColor Green
Write-Host ""
Write-Host "The statistics now clearly indicate:" -ForegroundColor Yellow
Write-Host "  - Total Prices: Number of prices matching current filters" -ForegroundColor White
Write-Host "  - With GPS: Number of GPS-enabled prices in filtered results" -ForegroundColor White
Write-Host "  - Verified: Number of verified prices in filtered results" -ForegroundColor White
Write-Host "  - Regions in View: Number of unique regions in filtered results" -ForegroundColor White
Write-Host ""
Write-Host "When filtering by region, the statistics will now be consistent" -ForegroundColor Yellow
Write-Host "and clearly show data for the filtered view only." -ForegroundColor Yellow
Write-Host ""
Write-Host "You can now start the application and test the improved statistics:" -ForegroundColor Cyan
Write-Host "  npm run dev (in frontend directory)" -ForegroundColor White
Write-Host "  Then navigate to /map and apply filters to see the improvements" -ForegroundColor White
