# Start Frontend Development Server
Write-Host "Starting Frontend Development Server..." -ForegroundColor Green

# Change to frontend directory
Set-Location frontend

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start development server
Write-Host "Starting development server on http://localhost:5173" -ForegroundColor Green
npm run dev
