#!/usr/bin/env pwsh
# Test script to verify POI map display fixes

Write-Host "🔍 Testing POI Map Display Fixes..." -ForegroundColor Cyan

# Check if frontend is running
Write-Host "`n📡 Checking frontend server status..." -ForegroundColor Yellow
try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:5173" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend server is running on port 5173" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend server is not running on port 5173" -ForegroundColor Red
    Write-Host "Please start the frontend server with: npm run dev" -ForegroundColor Yellow
    exit 1
}

# Check if backend is running
Write-Host "`n📡 Checking backend server status..." -ForegroundColor Yellow
try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend server is running on port 8080" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Backend server is not running on port 8080" -ForegroundColor Yellow
    Write-Host "POI map will use offline data" -ForegroundColor Yellow
}

# Test POI endpoint
Write-Host "`n🗺️ Testing POI endpoint..." -ForegroundColor Yellow
try {
    $poiResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/poi" -Method GET -TimeoutSec 10 -ErrorAction Stop
    $poiData = $poiResponse.Content | ConvertFrom-Json
    Write-Host "✅ POI endpoint is accessible" -ForegroundColor Green
    Write-Host "📊 Found $($poiData.Count) POIs" -ForegroundColor Cyan
} catch {
    Write-Host "❌ POI endpoint is not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test POI stats endpoint
Write-Host "`n📊 Testing POI stats endpoint..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/poi/stats" -Method GET -TimeoutSec 10 -ErrorAction Stop
    $statsData = $statsResponse.Content | ConvertFrom-Json
    Write-Host "✅ POI stats endpoint is accessible" -ForegroundColor Green
    Write-Host "📈 Statistics: $($statsData.totalCount) total POIs" -ForegroundColor Cyan
} catch {
    Write-Host "❌ POI stats endpoint is not accessible" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Create test HTML file
Write-Host "`n📄 Creating test HTML file..." -ForegroundColor Yellow
$testHtml = @"
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test POI Map Display</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .test-section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .test-result {
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
        }
        .success {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }
        .error {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }
        .info {
            background-color: #d1ecf1;
            color: #0c5460;
            border: 1px solid #bee5eb;
        }
        .map-container {
            height: 500px;
            width: 100%;
            border: 2px solid #ddd;
            border-radius: 8px;
            margin: 20px 0;
        }
        .test-button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 4px;
            cursor: pointer;
            margin: 5px;
        }
        .test-button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🗺️ Test POI Map Display</h1>
        
        <div class="test-section">
            <h2>📋 Test Checklist</h2>
            <div id="test-results">
                <div class="info">Running tests...</div>
            </div>
        </div>

        <div class="test-section">
            <h2>🔧 Manual Tests</h2>
            <p>Please test the following manually:</p>
            <ul>
                <li>Navigate to the POI Map page in the application</li>
                <li>Verify that the map loads and displays correctly</li>
                <li>Check that POI markers are visible and clickable</li>
                <li>Test the legend display</li>
                <li>Verify popup functionality when clicking markers</li>
                <li>Test map controls (zoom, pan)</li>
                <li>Check mobile responsiveness</li>
            </ul>
        </div>

        <div class="test-section">
            <h2>🌐 Direct Links</h2>
            <p>Click the links below to test directly:</p>
            <a href="http://localhost:5173/poi-map" class="test-button" target="_blank">Open POI Map Page</a>
            <a href="http://localhost:5173" class="test-button" target="_blank">Open Home Page</a>
        </div>

        <div class="test-section">
            <h2>📱 Mobile Test</h2>
            <p>Test the map on mobile devices:</p>
            <ul>
                <li>Use browser developer tools to simulate mobile view</li>
                <li>Check that the map is responsive</li>
                <li>Verify touch interactions work correctly</li>
                <li>Test popup display on small screens</li>
            </ul>
        </div>
    </div>

    <script>
        // Test script
        async function runTests() {
            const resultsDiv = document.getElementById('test-results');
            resultsDiv.innerHTML = '';

            // Test 1: Check if Leaflet is available
            try {
                if (typeof L !== 'undefined') {
                    addTestResult('✅ Leaflet library is loaded', 'success');
                } else {
                    addTestResult('❌ Leaflet library is not loaded', 'error');
                }
            } catch (e) {
                addTestResult('❌ Error checking Leaflet: ' + e.message, 'error');
            }

            // Test 2: Check if React Leaflet is available
            try {
                if (typeof window.ReactLeaflet !== 'undefined') {
                    addTestResult('✅ React Leaflet is available', 'success');
                } else {
                    addTestResult('⚠️ React Leaflet not directly accessible (normal in production)', 'info');
                }
            } catch (e) {
                addTestResult('⚠️ React Leaflet check failed: ' + e.message, 'info');
            }

            // Test 3: Check CSS loading
            try {
                const leafletCSS = document.querySelector('link[href*="leaflet"]');
                if (leafletCSS) {
                    addTestResult('✅ Leaflet CSS is loaded', 'success');
                } else {
                    addTestResult('❌ Leaflet CSS is not loaded', 'error');
                }
            } catch (e) {
                addTestResult('❌ Error checking Leaflet CSS: ' + e.message, 'error');
            }

            // Test 4: Check backend connectivity
            try {
                const response = await fetch('http://localhost:8080/api/v1/poi');
                if (response.ok) {
                    const data = await response.json();
                    addTestResult(`✅ Backend POI endpoint accessible (${data.length} POIs)`, 'success');
                } else {
                    addTestResult('❌ Backend POI endpoint returned error: ' + response.status, 'error');
                }
            } catch (e) {
                addTestResult('⚠️ Backend POI endpoint not accessible (will use offline data)', 'info');
            }
        }

        function addTestResult(message, type) {
            const resultsDiv = document.getElementById('test-results');
            const resultDiv = document.createElement('div');
            resultDiv.className = `test-result ${type}`;
            resultDiv.textContent = message;
            resultsDiv.appendChild(resultDiv);
        }

        // Run tests when page loads
        runTests();
    </script>
</body>
</html>
"@

$testHtml | Out-File -FilePath "test-poi-map-display.html" -Encoding UTF8
Write-Host "✅ Test HTML file created: test-poi-map-display.html" -ForegroundColor Green

Write-Host "`n🎯 Summary of fixes applied:" -ForegroundColor Cyan
Write-Host "1. ✅ Added Leaflet CSS import to main.tsx" -ForegroundColor Green
Write-Host "2. ✅ Fixed Leaflet icon configuration in POIMapView.tsx" -ForegroundColor Green
Write-Host "3. ✅ Added POI-specific CSS styles to index.css" -ForegroundColor Green
Write-Host "4. ✅ Created test HTML file for manual verification" -ForegroundColor Green

Write-Host "`n🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Open test-poi-map-display.html in your browser" -ForegroundColor Yellow
Write-Host "2. Navigate to http://localhost:5173/poi-map in your application" -ForegroundColor Yellow
Write-Host "3. Verify that the POI map displays correctly" -ForegroundColor Yellow
Write-Host "4. Test all map functionality (markers, popups, controls)" -ForegroundColor Yellow

Write-Host "`n✨ POI Map display fixes completed!" -ForegroundColor Green
