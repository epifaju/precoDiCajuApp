# Test Script for Preço di Caju Application
# This script tests the complete application functionality

Write-Host "🧪 TESTING PREÇO DI CAJU APPLICATION" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Configuration
$BACKEND_URL = "http://localhost:8080"
$FRONTEND_URL = "http://localhost:3000"

Write-Host ""
Write-Host "📋 TEST SUMMARY:" -ForegroundColor Yellow
Write-Host "Backend URL: $BACKEND_URL" -ForegroundColor White
Write-Host "Frontend URL: $FRONTEND_URL" -ForegroundColor White
Write-Host ""

# Test 1: Backend Health Check
Write-Host "🔍 Test 1: Backend Health Check" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is running and responding" -ForegroundColor Green
        $regions = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($regions.Count) regions in database" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend is not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please ensure Docker containers are running:" -ForegroundColor Yellow
    Write-Host "   docker-compose up -d" -ForegroundColor White
}

Write-Host ""

# Test 2: Frontend Accessibility
Write-Host "🔍 Test 2: Frontend Accessibility" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend is not accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Please ensure frontend is running:" -ForegroundColor Yellow
    Write-Host "   cd frontend && npm run dev" -ForegroundColor White
}

Write-Host ""

# Test 3: Quality Grades API
Write-Host "🔍 Test 3: Quality Grades API" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/quality-grades" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $qualities = $response.Content | ConvertFrom-Json
        Write-Host "✅ Quality grades API working" -ForegroundColor Green
        Write-Host "   Found $($qualities.Count) quality grades" -ForegroundColor Gray
        
        # Display quality grades
        foreach ($quality in $qualities) {
            Write-Host "   - $($quality.code): $($quality.namePt)" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Quality grades API failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: User Registration (Test Account)
Write-Host "🔍 Test 4: User Registration Test" -ForegroundColor Cyan
$testUser = @{
    email = "test.$(Get-Date -Format 'yyyyMMddHHmmss')@example.com"
    password = "TestPassword123!"
    fullName = "Test User $(Get-Date -Format 'HHmm')"
    phone = "+245123456789"
} | ConvertTo-Json

$headers = @{
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/auth/register" -Method POST -Body $testUser -Headers $headers -TimeoutSec 15
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ User registration working" -ForegroundColor Green
        $authResponse = $response.Content | ConvertFrom-Json
        Write-Host "   User ID: $($authResponse.user.id)" -ForegroundColor Gray
        Write-Host "   Access Token: $($authResponse.accessToken.Substring(0,20))..." -ForegroundColor Gray
        
        # Store for further tests
        $global:AccessToken = $authResponse.accessToken
        $global:TestUserId = $authResponse.user.id
    }
} catch {
    Write-Host "❌ User registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "   Error details: $errorContent" -ForegroundColor Red
    }
}

Write-Host ""

# Test 5: Price Statistics (if authenticated)
if ($global:AccessToken) {
    Write-Host "🔍 Test 5: Price Statistics API" -ForegroundColor Cyan
    $authHeaders = @{
        "Content-Type" = "application/json"
        "Authorization" = "Bearer $global:AccessToken"
    }
    
    try {
        $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/prices/stats?days=30" -Method GET -Headers $authHeaders -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            $stats = $response.Content | ConvertFrom-Json
            Write-Host "✅ Price statistics API working" -ForegroundColor Green
            Write-Host "   Total prices: $($stats.totalPrices)" -ForegroundColor Gray
            Write-Host "   Average price: $($stats.averagePrice) FCFA" -ForegroundColor Gray
            Write-Host "   Min price: $($stats.minPrice) FCFA" -ForegroundColor Gray
            Write-Host "   Max price: $($stats.maxPrice) FCFA" -ForegroundColor Gray
        }
    } catch {
        Write-Host "❌ Price statistics failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 6: Price Submission Test (if authenticated)
if ($global:AccessToken) {
    Write-Host "🔍 Test 6: Price Submission Test" -ForegroundColor Cyan
    
    # First get a region and quality
    try {
        $regionsResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method GET -TimeoutSec 10
        $regions = $regionsResponse.Content | ConvertFrom-Json
        
        $qualitiesResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/quality-grades" -Method GET -TimeoutSec 10
        $qualities = $qualitiesResponse.Content | ConvertFrom-Json
        
        if ($regions.Count -gt 0 -and $qualities.Count -gt 0) {
            $testPrice = @{
                regionCode = $regions[0].code
                qualityGrade = $qualities[0].code
                priceFcfa = 2500
                recordedDate = (Get-Date).ToString("yyyy-MM-dd")
                sourceName = "Test Market"
                sourceType = "market"
                notes = "Test price submission from PowerShell script"
            } | ConvertTo-Json
            
            $authHeaders = @{
                "Content-Type" = "application/json"
                "Authorization" = "Bearer $global:AccessToken"
            }
            
            $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/prices" -Method POST -Body $testPrice -Headers $authHeaders -TimeoutSec 15
            if ($response.StatusCode -eq 201) {
                $createdPrice = $response.Content | ConvertFrom-Json
                Write-Host "✅ Price submission working" -ForegroundColor Green
                Write-Host "   Price ID: $($createdPrice.id)" -ForegroundColor Gray
                Write-Host "   Price: $($createdPrice.priceFcfa) FCFA" -ForegroundColor Gray
                Write-Host "   Region: $($createdPrice.regionName)" -ForegroundColor Gray
            }
        }
    } catch {
        Write-Host "❌ Price submission failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Final Summary
Write-Host "🎯 TEST SUMMARY" -ForegroundColor Yellow
Write-Host "===============" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ READY TO TEST IN BROWSER:" -ForegroundColor Green
Write-Host "   Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host "   Login: /login" -ForegroundColor White
Write-Host "   Register: /register" -ForegroundColor White
Write-Host "   Dashboard: /dashboard" -ForegroundColor White
Write-Host "   Submit Price: /submit" -ForegroundColor White
Write-Host "   Price List: /prices" -ForegroundColor White
Write-Host ""
Write-Host "📋 FEATURES TO TEST:" -ForegroundColor Cyan
Write-Host "   🔐 User Registration & Login" -ForegroundColor White
Write-Host "   📊 Interactive Dashboard with Charts" -ForegroundColor White
Write-Host "   📝 Price Submission Form with GPS" -ForegroundColor White
Write-Host "   📋 Price List with Filters & Pagination" -ForegroundColor White
Write-Host "   🌙 Dark/Light Mode Toggle" -ForegroundColor White
Write-Host "   🌍 Multi-language (PT/FR/EN)" -ForegroundColor White
Write-Host "   📱 Mobile Responsive Design" -ForegroundColor White
Write-Host ""
Write-Host "🔥 ADVANCED FEATURES:" -ForegroundColor Magenta
Write-Host "   📈 Real-time Statistics" -ForegroundColor White
Write-Host "   📊 Chart.js Integration (Line/Bar/Doughnut)" -ForegroundColor White
Write-Host "   🗺️ GPS Geolocation" -ForegroundColor White
Write-Host "   📸 Photo Upload with Drag & Drop" -ForegroundColor White
Write-Host "   ✅ Form Validation with Zod" -ForegroundColor White
Write-Host "   ⚡ React Query for Caching" -ForegroundColor White
Write-Host ""
Write-Host "💡 DEMO ACCOUNTS (if test registration failed):" -ForegroundColor Yellow
Write-Host "   Email: admin@precaju.gw | Password: admin123" -ForegroundColor White
Write-Host "   Email: user@precaju.gw | Password: user123" -ForegroundColor White

Write-Host ""
Write-Host "🚀 Application testing complete! Open $FRONTEND_URL in your browser." -ForegroundColor Green







