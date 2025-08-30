# Test script for final date filtering solution
Write-Host "Testing final date filter solution..." -ForegroundColor Green

# Test 1: Basic request without any filters
Write-Host "`nTest 1: Basic request without any filters" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5" -Method GET -Headers @{"Accept"="application/json"} -TimeoutSec 10
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
    
    # Try to parse JSON response
    try {
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host "JSON parsed successfully" -ForegroundColor Green
        Write-Host "Total elements: $($jsonResponse.totalElements)" -ForegroundColor Green
        Write-Host "Total pages: $($jsonResponse.totalPages)" -ForegroundColor Green
        if ($jsonResponse.content -and $jsonResponse.content.Count -gt 0) {
            Write-Host "First price: $($jsonResponse.content[0].id)" -ForegroundColor Green
            Write-Host "Recorded date: $($jsonResponse.content[0].recordedDate)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Failed to parse JSON response" -ForegroundColor Red
        Write-Host "Response content: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# Test 2: Request with from date only (this was causing the error)
Write-Host "`nTest 2: Request with from date only (previously failing)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5&from=2025-08-28" -Method GET -Headers @{"Accept"="application/json"} -TimeoutSec 10
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
    
    # Try to parse JSON response
    try {
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host "JSON parsed successfully" -ForegroundColor Green
        Write-Host "Total elements: $($jsonResponse.totalElements)" -ForegroundColor Green
        Write-Host "Total pages: $($jsonResponse.totalPages)" -ForegroundColor Green
        if ($jsonResponse.content -and $jsonResponse.content.Count -gt 0) {
            Write-Host "First price: $($jsonResponse.content[0].id)" -ForegroundColor Green
            Write-Host "Recorded date: $($jsonResponse.content[0].recordedDate)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Failed to parse JSON response" -ForegroundColor Red
        Write-Host "Response content: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# Test 3: Request with both from and to dates
Write-Host "`nTest 3: Request with both from and to dates" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5&from=2025-08-28&to=2025-08-30" -Method GET -Headers @{"Accept"="application/json"} -TimeoutSec 10
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
    
    # Try to parse JSON response
    try {
        $jsonResponse = $response.Content | ConvertFrom-Json
        Write-Host "JSON parsed successfully" -ForegroundColor Green
        Write-Host "Total elements: $($jsonResponse.totalElements)" -ForegroundColor Green
        Write-Host "Total pages: $($jsonResponse.totalPages)" -ForegroundColor Green
        if ($jsonResponse.content -and $jsonResponse.content.Count -gt 0) {
            Write-Host "First price: $($jsonResponse.content[0].id)" -ForegroundColor Green
            Write-Host "Recorded date: $($jsonResponse.content[0].recordedDate)" -ForegroundColor Green
        }
    } catch {
        Write-Host "Failed to parse JSON response" -ForegroundColor Red
        Write-Host "Response content: $($response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)))" -ForegroundColor Red
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

# Test 4: Request with quality filter and date
Write-Host "`nTest 4: Request with quality filter and date" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/prices?page=0&size=5&quality=RAW&from=2025-08-28" -Method GET -Headers @{"Accept"="application/json"} -TimeoutSec 10
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response length: $($response.Content.Length)" -ForegroundColor Green
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Response Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        Write-Host "Response Content: $($_.Exception.Response.Content)" -ForegroundColor Red
    }
}

Write-Host "`nTesting completed!" -ForegroundColor Green
