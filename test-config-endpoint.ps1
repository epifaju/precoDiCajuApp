# Test script for configuration endpoint
Write-Host "Testing configuration endpoint..."

# Test data
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
    'Authorization' = 'Bearer test-token'
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/users/me/config" -Method PUT -Headers $headers -Body $testData -Verbose
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error occurred:"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    Write-Host "Response: $($_.Exception.Response.Content)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
