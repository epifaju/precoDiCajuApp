# Test Profile Edit Functionality
Write-Host "Testing Profile Edit Functionality..." -ForegroundColor Green

# Start backend if not running
Write-Host "Checking if backend is running..." -ForegroundColor Yellow
$backendProcess = Get-Process -Name "java" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "java" }

if (-not $backendProcess) {
    Write-Host "Backend not running. Starting backend..." -ForegroundColor Yellow
    Start-Process -FilePath "docker-compose" -ArgumentList "up", "-d" -WorkingDirectory "." -NoNewWindow
    Start-Sleep -Seconds 10
} else {
    Write-Host "Backend is already running." -ForegroundColor Green
}

# Start frontend if not running
Write-Host "Checking if frontend is running..." -ForegroundColor Yellow
$frontendProcess = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.ProcessName -eq "node" }

if (-not $frontendProcess) {
    Write-Host "Frontend not running. Starting frontend..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -NoNewWindow
    Start-Sleep -Seconds 15
} else {
    Write-Host "Frontend is already running." -ForegroundColor Green
}

Write-Host "`nProfile Edit Test Instructions:" -ForegroundColor Cyan
Write-Host "1. Open your browser and go to: http://localhost:5173" -ForegroundColor White
Write-Host "2. Login with test account: produtor@test.gw / produtor123" -ForegroundColor White
Write-Host "3. Navigate to 'Meu Perfil' (Profile)" -ForegroundColor White
Write-Host "4. Click 'Editar perfil' (Edit Profile)" -ForegroundColor White
Write-Host "5. Try to modify and save the profile" -ForegroundColor White
Write-Host "6. Check browser console for any errors" -ForegroundColor White
Write-Host "7. Check network tab for API calls" -ForegroundColor White

Write-Host "`nBackend API Endpoint to test:" -ForegroundColor Cyan
Write-Host "PUT http://localhost:8080/api/v1/users/me" -ForegroundColor White

Write-Host "`nPress any key to open the application in your browser..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Start-Process "http://localhost:5173"

Write-Host "`nTest completed. Check the browser for any issues." -ForegroundColor Green
