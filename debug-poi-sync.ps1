# POI Synchronization Debug Script
# Ce script aide à diagnostiquer les problèmes de synchronisation POI

Write-Host "🔍 POI Synchronization Debug Tool" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Configuration
$API_BASE_URL = "http://localhost:8080"
$FRONTEND_URL = "http://localhost:3000"

function Test-ApiEndpoint {
    param(
        [string]$Url,
        [string]$Description,
        [int]$TimeoutSec = 10
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "URL: $Url" -ForegroundColor Gray
    
    try {
        $response = Invoke-RestMethod -Uri $Url -Method GET -TimeoutSec $TimeoutSec -ErrorAction Stop
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        
        if ($response -is [array]) {
            Write-Host "   Response: Array with $($response.Count) items" -ForegroundColor Green
        }
        elseif ($response -is [object]) {
            Write-Host "   Response: Object with keys: $($response.PSObject.Properties.Name -join ', ')" -ForegroundColor Green
        }
        else {
            Write-Host "   Response: $($response.GetType().Name)" -ForegroundColor Green
        }
        return $true
    }
    catch {
        Write-Host "❌ FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
        return $false
    }
    Write-Host ""
}

function Test-NetworkConnectivity {
    Write-Host "🌐 Testing Network Connectivity" -ForegroundColor Cyan
    Write-Host "===============================" -ForegroundColor Cyan
    Write-Host ""
    
    # Test internet connectivity
    Write-Host "Testing Internet Connection..." -ForegroundColor Yellow
    try {
        $null = Invoke-RestMethod -Uri "https://httpbin.org/get" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Internet connection: OK" -ForegroundColor Green
    }
    catch {
        Write-Host "❌ Internet connection: FAILED" -ForegroundColor Red
    }
    Write-Host ""
    
    # Test localhost connectivity
    Write-Host "Testing Localhost Connectivity..." -ForegroundColor Yellow
    try {
        $response = Test-NetConnection -ComputerName "localhost" -Port 8080 -InformationLevel Quiet
        if ($response) {
            Write-Host "✅ Port 8080: OPEN" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Port 8080: CLOSED" -ForegroundColor Red
        }
    }
    catch {
        Write-Host "❌ Port 8080: FAILED TO TEST" -ForegroundColor Red
    }
    Write-Host ""
}

function Test-BackendHealth {
    Write-Host "🏥 Testing Backend Health" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    
    $healthChecks = @(
        @{ Url = "$API_BASE_URL/actuator/health"; Description = "Spring Boot Actuator Health" },
        @{ Url = "$API_BASE_URL/api/v1/regions"; Description = "Regions API (v1)" },
        @{ Url = "$API_BASE_URL/api/poi/health"; Description = "POI Health Endpoint" }
    )
    
    $healthyEndpoints = 0
    foreach ($check in $healthChecks) {
        if (Test-ApiEndpoint -Url $check.Url -Description $check.Description) {
            $healthyEndpoints++
        }
    }
    
    Write-Host "Backend Health Summary: $healthyEndpoints/$($healthChecks.Count) endpoints healthy" -ForegroundColor $(if ($healthyEndpoints -eq $healthChecks.Count) { "Green" } else { "Red" })
    Write-Host ""
}

function Test-POIEndpoints {
    Write-Host "🗺️ Testing POI Endpoints" -ForegroundColor Cyan
    Write-Host "========================" -ForegroundColor Cyan
    Write-Host ""
    
    $poiEndpoints = @(
        @{ Url = "$API_BASE_URL/api/poi"; Description = "Get All POIs" },
        @{ Url = "$API_BASE_URL/api/poi/stats"; Description = "POI Statistics" },
        @{ Url = "$API_BASE_URL/api/poi/with-phone"; Description = "POIs with Phone Numbers" },
        @{ Url = "$API_BASE_URL/api/poi/health"; Description = "POI Service Health" }
    )
    
    $workingEndpoints = 0
    foreach ($endpoint in $poiEndpoints) {
        if (Test-ApiEndpoint -Url $endpoint.Url -Description $endpoint.Description) {
            $workingEndpoints++
        }
    }
    
    Write-Host "POI Endpoints Summary: $workingEndpoints/$($poiEndpoints.Count) endpoints working" -ForegroundColor $(if ($workingEndpoints -eq $poiEndpoints.Count) { "Green" } else { "Red" })
    Write-Host ""
}

function Test-CORSConfiguration {
    Write-Host "🔒 Testing CORS Configuration" -ForegroundColor Cyan
    Write-Host "=============================" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        # Test preflight request
        $headers = @{
            'Origin'                         = $FRONTEND_URL
            'Access-Control-Request-Method'  = 'GET'
            'Access-Control-Request-Headers' = 'Content-Type'
        }
        
        $response = Invoke-WebRequest -Uri "$API_BASE_URL/api/poi" -Method OPTIONS -Headers $headers -UseBasicParsing -ErrorAction Stop
        
        Write-Host "✅ CORS Preflight: SUCCESS" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Origin: $($response.Headers['Access-Control-Allow-Origin'])" -ForegroundColor Green
        Write-Host "   Access-Control-Allow-Methods: $($response.Headers['Access-Control-Allow-Methods'])" -ForegroundColor Green
        
    }
    catch {
        Write-Host "❌ CORS Preflight: FAILED" -ForegroundColor Red
        Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

function Show-EnvironmentInfo {
    Write-Host "📋 Environment Information" -ForegroundColor Cyan
    Write-Host "==========================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "Expected Configuration:" -ForegroundColor Yellow
    Write-Host "  Frontend: $FRONTEND_URL" -ForegroundColor Gray
    Write-Host "  Backend:  $API_BASE_URL" -ForegroundColor Gray
    Write-Host "  POI Endpoints: $API_BASE_URL/api/poi/*" -ForegroundColor Gray
    Write-Host "  Other APIs: $API_BASE_URL/api/v1/*" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "API URL Configuration Check:" -ForegroundColor Yellow
    
    # Check if .env file exists
    $envFile = "frontend\.env"
    if (Test-Path $envFile) {
        Write-Host "✅ Found .env file" -ForegroundColor Green
        $envContent = Get-Content $envFile
        $apiUrlLine = $envContent | Where-Object { $_ -like "VITE_API_URL=*" }
        if ($apiUrlLine) {
            Write-Host "   VITE_API_URL: $apiUrlLine" -ForegroundColor Green
        }
        else {
            Write-Host "❌ VITE_API_URL not found in .env" -ForegroundColor Red
        }
    }
    else {
        Write-Host "⚠️  No .env file found (will use default)" -ForegroundColor Yellow
        Write-Host "   Default: http://localhost:8080" -ForegroundColor Gray
    }
    Write-Host ""
}

function Show-TroubleshootingSteps {
    Write-Host "🔧 Troubleshooting Steps" -ForegroundColor Cyan
    Write-Host "=======================" -ForegroundColor Cyan
    Write-Host ""
    
    Write-Host "1. Start Backend Service:" -ForegroundColor Yellow
    Write-Host "   cd backend" -ForegroundColor Gray
    Write-Host "   ./mvnw spring-boot:run" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "2. Start Frontend Service:" -ForegroundColor Yellow
    Write-Host "   cd frontend" -ForegroundColor Gray
    Write-Host "   npm run dev" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "3. Check Database Connection:" -ForegroundColor Yellow
    Write-Host "   Ensure PostgreSQL is running on localhost:5433" -ForegroundColor Gray
    Write-Host "   Database: precaju" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. Verify POI Data:" -ForegroundColor Yellow
    Write-Host "   Check if POI migration has run: V13__Create_poi_table.sql" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "5. Check Browser Console:" -ForegroundColor Yellow
    Write-Host "   Open Developer Tools and check for JavaScript errors" -ForegroundColor Gray
    Write-Host "   Look for network request failures" -ForegroundColor Gray
    Write-Host ""
}

# Run all tests
Show-EnvironmentInfo
Test-NetworkConnectivity
Test-BackendHealth
Test-POIEndpoints
Test-CORSConfiguration
Show-TroubleshootingSteps

Write-Host "🎯 Debug Complete!" -ForegroundColor Cyan
Write-Host "If issues persist, check the browser console for more detailed error messages." -ForegroundColor Gray

