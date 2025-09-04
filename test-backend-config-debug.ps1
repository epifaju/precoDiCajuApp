# Test script to debug backend configuration endpoint
Write-Host "Testing Backend Configuration Endpoint Debug" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Wait for backend to start
Write-Host "Waiting for backend to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Test backend health
$backendUrl = "http://localhost:8080"
try {
    Write-Host "Checking backend health..." -ForegroundColor Yellow
    $healthResponse = Invoke-WebRequest -Uri "$backendUrl/actuator/health" -Method GET -TimeoutSec 5 -UseBasicParsing
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "Backend is running" -ForegroundColor Green
    } else {
        Write-Host "Backend health check failed: $($healthResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "Backend is not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Please make sure the backend is running with: cd backend && mvn spring-boot:run" -ForegroundColor Yellow
    exit 1
}

# Test configuration endpoint with sample data
Write-Host "`nTesting configuration endpoint with sample data..." -ForegroundColor Yellow

$sampleConfig = @{
    fullName = "Test User"
    phone = "+245123456789"
    preferences = @{
        language = "fr"
        theme = "system"
        preferredRegions = @()
        timezone = "Africa/Bissau"
        offlineMode = $false
        autoSync = $true
    }
    notificationPreferences = @{
        priceAlerts = $true
        verificationNotifications = $true
        systemNotifications = $true
        emailNotifications = $false
        pushNotifications = $true
        alertThreshold = 10
        alertRegions = @()
        alertQualities = @()
        frequency = "immediate"
        quietHours = $false
        quietStartTime = "22:00"
        quietEndTime = "08:00"
    }
} | ConvertTo-Json -Depth 3

Write-Host "Sample configuration being sent:" -ForegroundColor Cyan
Write-Host $sampleConfig -ForegroundColor White

try {
    $configResponse = Invoke-WebRequest -Uri "$backendUrl/api/v1/users/me/config" -Method PUT -Body $sampleConfig -ContentType "application/json" -TimeoutSec 10 -UseBasicParsing
    Write-Host "Configuration update successful: $($configResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "Configuration update failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error response body: $errorBody" -ForegroundColor Red
    }
}

Write-Host "`nTest completed!" -ForegroundColor Green
Write-Host "`nTo test the frontend:" -ForegroundColor Cyan
Write-Host "1. Open http://localhost:3002 in your browser" -ForegroundColor White
Write-Host "2. Navigate to Profile page" -ForegroundColor White
Write-Host "3. Go to Preferences section" -ForegroundColor White
Write-Host "4. Change the language and click 'Salvar'" -ForegroundColor White
Write-Host "5. Check browser console for detailed logs" -ForegroundColor White
