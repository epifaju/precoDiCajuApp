# Test CORS Configuration After Fix
Write-Host "🧪 TESTING CORS CONFIGURATION AFTER FIX" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

$BACKEND_URL = "http://localhost:8080"
$FRONTEND_PORTS = @(3000, 3001, 3002, 3003, 5173, 4173)

Write-Host ""
Write-Host "🔍 Testing CORS from different frontend ports..." -ForegroundColor Cyan

foreach ($port in $FRONTEND_PORTS) {
    $origin = "http://localhost:$port"
    Write-Host ""
    Write-Host "Testing from $origin..." -ForegroundColor Yellow
    
    try {
        $headers = @{
            "Origin" = $origin
            "Access-Control-Request-Method" = "GET"
            "Access-Control-Request-Headers" = "Content-Type,Authorization"
        }
        
        # Test preflight request
        Write-Host "  Testing preflight request..." -ForegroundColor Gray
        $preflightResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method OPTIONS -Headers $headers -TimeoutSec 10
        
        if ($preflightResponse.StatusCode -eq 200) {
            Write-Host "  ✅ CORS preflight OK for $origin" -ForegroundColor Green
            
            # Check CORS headers
            $corsHeaders = $preflightResponse.Headers
            if ($corsHeaders["Access-Control-Allow-Origin"]) {
                Write-Host "    Access-Control-Allow-Origin: $($corsHeaders['Access-Control-Allow-Origin'])" -ForegroundColor Gray
            }
            if ($corsHeaders["Access-Control-Allow-Methods"]) {
                Write-Host "    Access-Control-Allow-Methods: $($corsHeaders['Access-Control-Allow-Methods'])" -ForegroundColor Gray
            }
            if ($corsHeaders["Access-Control-Allow-Headers"]) {
                Write-Host "    Access-Control-Allow-Headers: $($corsHeaders['Access-Control-Allow-Headers'])" -ForegroundColor Gray
            }
            if ($corsHeaders["Access-Control-Max-Age"]) {
                Write-Host "    Access-Control-Max-Age: $($corsHeaders['Access-Control-Max-Age'])" -ForegroundColor Gray
            }
        }
        
        # Test actual request
        Write-Host "  Testing actual API request..." -ForegroundColor Gray
        $actualResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method GET -Headers @{"Origin" = $origin} -TimeoutSec 10
        if ($actualResponse.StatusCode -eq 200) {
            Write-Host "  ✅ API request OK for $origin" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "  ❌ CORS test failed for $origin : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔍 Testing backend health..." -ForegroundColor Cyan
try {
    $healthResponse = Invoke-WebRequest -Uri "$BACKEND_URL/actuator/health" -Method GET -TimeoutSec 5
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ Backend is running and healthy" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend is not responding: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Make sure the backend is running on port 8080" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Testing specific endpoints..." -ForegroundColor Cyan

# Test regions endpoint
try {
    $regionsResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method GET -TimeoutSec 5
    if ($regionsResponse.StatusCode -eq 200) {
        Write-Host "✅ Regions endpoint is working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Regions endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test auth endpoint
try {
    $authResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/auth/login" -Method OPTIONS -TimeoutSec 5
    if ($authResponse.StatusCode -eq 200) {
        Write-Host "✅ Auth endpoint CORS preflight is working" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Auth endpoint CORS preflight failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 CORS Test Complete!" -ForegroundColor Green
Write-Host "If you still see CORS errors, check:" -ForegroundColor Yellow
Write-Host "1. Backend is running on port 8080" -ForegroundColor Yellow
Write-Host "2. Frontend is using the correct API URL" -ForegroundColor Yellow
Write-Host "3. Browser cache is cleared" -ForegroundColor Yellow
