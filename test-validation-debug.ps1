# Test script to debug validation issues
Write-Host "Testing validation with minimal data..."

# Test with minimal data first
$minimalData = @{
    preferences = @{
        language = "pt"
        theme = "system"
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
        frequency = "immediate"
        quietHours = $false
        quietStartTime = "22:00"
        quietEndTime = "08:00"
    }
} | ConvertTo-Json -Depth 3

Write-Host "Minimal test data:"
Write-Host $minimalData

# Headers
$headers = @{
    'Content-Type' = 'application/json'
    'Authorization' = 'Bearer test-token'
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/users/me/config" -Method PUT -Headers $headers -Body $minimalData -Verbose
    Write-Host "Success! Status: $($response.StatusCode)"
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "Error occurred:"
    Write-Host "Status: $($_.Exception.Response.StatusCode)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
