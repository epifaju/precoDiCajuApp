# Test CORS Configuration
Write-Host "🧪 TESTING CORS CONFIGURATION" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

$BACKEND_URL = "http://localhost:8080"
$FRONTEND_PORTS = @(3000, 3001, 3002, 3003)

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
        }
        
        # Test preflight request
        $preflightResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method OPTIONS -Headers $headers -TimeoutSec 5
        
        if ($preflightResponse.StatusCode -eq 200) {
            Write-Host "✅ CORS preflight OK for $origin" -ForegroundColor Green
            
            # Check CORS headers
            $corsHeaders = $preflightResponse.Headers
            if ($corsHeaders["Access-Control-Allow-Origin"]) {
                Write-Host "   Access-Control-Allow-Origin: $($corsHeaders['Access-Control-Allow-Origin'])" -ForegroundColor Gray
            }
            if ($corsHeaders["Access-Control-Allow-Methods"]) {
                Write-Host "   Access-Control-Allow-Methods: $($corsHeaders['Access-Control-Allow-Methods'])" -ForegroundColor Gray
            }
        }
        
        # Test actual request
        $actualResponse = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method GET -Headers @{"Origin" = $origin} -TimeoutSec 5
        if ($actualResponse.StatusCode -eq 200) {
            Write-Host "✅ API request OK for $origin" -ForegroundColor Green
        }
        
    } catch {
        Write-Host "❌ CORS test failed for $origin : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔍 Testing backend health..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend is responding correctly" -ForegroundColor Green
        $regions = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($regions.Count) regions in database" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "💡 If CORS is still failing:" -ForegroundColor Yellow
Write-Host "   1. Make sure backend is fully restarted" -ForegroundColor White
Write-Host "   2. Check browser dev tools for specific CORS errors" -ForegroundColor White
Write-Host "   3. Try refreshing the frontend page" -ForegroundColor White
Write-Host "   4. Check that frontend is running on one of the allowed ports" -ForegroundColor White




