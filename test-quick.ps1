# Quick Test Script for Preço di Caju Application
Write-Host "🧪 QUICK APPLICATION TEST" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green

# Configuration
$BACKEND_URL = "http://localhost:8080"
$FRONTEND_URL = "http://localhost:3002"  # Vite started on 3002

Write-Host ""
Write-Host "🔍 Testing Backend API..." -ForegroundColor Cyan

# Test Backend Health
try {
    $response = Invoke-WebRequest -Uri "$BACKEND_URL/api/v1/regions" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend API is working!" -ForegroundColor Green
        $regions = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($regions.Count) regions" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Backend not ready yet: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Wait a moment for Spring Boot to start completely..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Testing Frontend..." -ForegroundColor Cyan

# Test Frontend
try {
    $response = Invoke-WebRequest -Uri $FRONTEND_URL -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Frontend is accessible!" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Frontend not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 APPLICATION READY FOR TESTING!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Open in your browser:" -ForegroundColor Yellow
Write-Host "   Frontend: $FRONTEND_URL" -ForegroundColor White
Write-Host ""
Write-Host "📋 Pages to test:" -ForegroundColor Cyan
Write-Host "   🔐 Login: $FRONTEND_URL/login" -ForegroundColor White
Write-Host "   📝 Register: $FRONTEND_URL/register" -ForegroundColor White  
Write-Host "   📊 Dashboard: $FRONTEND_URL/dashboard" -ForegroundColor White
Write-Host "   📝 Submit Price: $FRONTEND_URL/submit" -ForegroundColor White
Write-Host "   📋 Price List: $FRONTEND_URL/prices" -ForegroundColor White
Write-Host ""
Write-Host "💡 Try these features:" -ForegroundColor Magenta
Write-Host "   ✅ User registration with form validation" -ForegroundColor White
Write-Host "   🔐 Login with JWT authentication" -ForegroundColor White
Write-Host "   📊 Interactive dashboard with real-time charts" -ForegroundColor White
Write-Host "   📝 Price submission with GPS and photo upload" -ForegroundColor White
Write-Host "   🔍 Price list with advanced filters" -ForegroundColor White
Write-Host "   🌙 Dark/Light mode toggle" -ForegroundColor White
Write-Host "   🌍 Language switching (PT/FR/EN)" -ForegroundColor White
Write-Host ""
Write-Host "🎯 Demo accounts (if you prefer not to register):" -ForegroundColor Yellow
Write-Host "   Email: admin@precaju.gw | Password: admin123" -ForegroundColor White

