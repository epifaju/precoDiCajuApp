# Test script to verify configuration fix
Write-Host "Testing configuration endpoint fix..."

# Wait for services to start
Write-Host "Waiting for services to start..."
Start-Sleep 10

# Test with a valid token (you'll need to replace this with a real token)
$token = "your-valid-token-here"

# Test data that should work
$testData = @{
    fullName = "Test User"
    phone = "+245123456789"
    preferences = @{
        language = "pt"
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

Write-Host "Test data:"
Write-Host $testData

# Headers
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = "Bearer $token"
}

Write-Host "`nTesting PUT /api/v1/users/me/config..."

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/users/me/config" -Method PUT -Headers $headers -Body $testData -Verbose
    Write-Host "SUCCESS! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "ERROR occurred:"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}

Write-Host "`nTest completed. Check the results above."