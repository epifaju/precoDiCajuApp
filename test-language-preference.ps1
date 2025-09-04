# Test script for language preference functionality
Write-Host "Testing Language Preference Functionality" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green

# Test 1: Check if migration was applied
Write-Host "`n1. Testing database migration..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me" -Method GET -Headers @{
        "Authorization" = "Bearer $($env:TEST_TOKEN)"
        "Content-Type" = "application/json"
    }
    
    if ($response.preferredLanguage) {
        Write-Host "✓ Migration applied successfully. User has preferredLanguage: $($response.preferredLanguage)" -ForegroundColor Green
    } else {
        Write-Host "✗ Migration not applied or user doesn't have preferredLanguage field" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error testing migration: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test language update via API
Write-Host "`n2. Testing language update via API..." -ForegroundColor Yellow
try {
    $updateData = @{
        preferredLanguage = "fr"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me" -Method PUT -Body $updateData -Headers @{
        "Authorization" = "Bearer $($env:TEST_TOKEN)"
        "Content-Type" = "application/json"
    }
    
    if ($response.preferredLanguage -eq "fr") {
        Write-Host "✓ Language update successful. User preferredLanguage is now: $($response.preferredLanguage)" -ForegroundColor Green
    } else {
        Write-Host "✗ Language update failed. Expected 'fr', got: $($response.preferredLanguage)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error updating language: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test language update via config API
Write-Host "`n3. Testing language update via config API..." -ForegroundColor Yellow
try {
    $configData = @{
        preferences = @{
            language = "en"
        }
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me/config" -Method PUT -Body $configData -Headers @{
        "Authorization" = "Bearer $($env:TEST_TOKEN)"
        "Content-Type" = "application/json"
    }
    
    if ($response.preferences.language -eq "en") {
        Write-Host "✓ Config language update successful. User language is now: $($response.preferences.language)" -ForegroundColor Green
    } else {
        Write-Host "✗ Config language update failed. Expected 'en', got: $($response.preferences.language)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error updating config language: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Verify both endpoints are synchronized
Write-Host "`n4. Verifying synchronization between endpoints..." -ForegroundColor Yellow
try {
    # Get user data
    $userResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me" -Method GET -Headers @{
        "Authorization" = "Bearer $($env:TEST_TOKEN)"
        "Content-Type" = "application/json"
    }
    
    # Get config data
    $configResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me/config" -Method GET -Headers @{
        "Authorization" = "Bearer $($env:TEST_TOKEN)"
        "Content-Type" = "application/json"
    }
    
    if ($userResponse.preferredLanguage -eq $configResponse.preferences.language) {
        Write-Host "✓ Synchronization successful. Both endpoints show language: $($userResponse.preferredLanguage)" -ForegroundColor Green
    } else {
        Write-Host "✗ Synchronization failed. User: $($userResponse.preferredLanguage), Config: $($configResponse.preferences.language)" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ Error verifying synchronization: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test language validation
Write-Host "`n5. Testing language validation..." -ForegroundColor Yellow
try {
    $invalidData = @{
        preferredLanguage = "invalid"
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/users/me" -Method PUT -Body $invalidData -Headers @{
            "Authorization" = "Bearer $($env:TEST_TOKEN)"
            "Content-Type" = "application/json"
        }
        Write-Host "✗ Validation failed. Invalid language was accepted" -ForegroundColor Red
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "✓ Validation successful. Invalid language was rejected" -ForegroundColor Green
        } else {
            Write-Host "✗ Unexpected error during validation: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "✗ Error testing validation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest completed!" -ForegroundColor Green
Write-Host "Note: Make sure to set TEST_TOKEN environment variable with a valid JWT token" -ForegroundColor Cyan
