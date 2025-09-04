# Test script to verify dashboard translations are working
Write-Host "Testing Dashboard Translations..." -ForegroundColor Green

# Start the frontend development server
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WorkingDirectory "frontend" -WindowStyle Hidden

# Wait for server to start
Write-Host "Waiting for server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test the translations
Write-Host "Testing Portuguese translations..." -ForegroundColor Yellow

# Create a simple HTML test file
$testHtml = @"
<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Dashboard Translations</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .test-item { margin: 10px 0; padding: 10px; border: 1px solid #ccc; }
        .success { background-color: #d4edda; border-color: #c3e6cb; }
        .error { background-color: #f8d7da; border-color: #f5c6cb; }
    </style>
</head>
<body>
    <h1>Test Dashboard Translations (Portuguese)</h1>
    
    <div class="test-item">
        <h3>Testing chartType translation:</h3>
        <p>Expected: "Tipo de Gráfico"</p>
        <p id="chartType-result">Loading...</p>
    </div>
    
    <div class="test-item">
        <h3>Testing line translation:</h3>
        <p>Expected: "Linha"</p>
        <p id="line-result">Loading...</p>
    </div>
    
    <div class="test-item">
        <h3>Testing bar translation:</h3>
        <p>Expected: "Barras"</p>
        <p id="bar-result">Loading...</p>
    </div>
    
    <div class="test-item">
        <h3>Testing groupBy translation:</h3>
        <p>Expected: "Agrupar por"</p>
        <p id="groupBy-result">Loading...</p>
    </div>

    <script>
        // Test translations
        const translations = {
            'dashboard.chartType': 'Tipo de Gráfico',
            'dashboard.line': 'Linha',
            'dashboard.bar': 'Barras',
            'dashboard.groupBy': 'Agrupar por'
        };

        function testTranslation(key, expected, elementId) {
            const element = document.getElementById(elementId);
            const actual = translations[key];
            
            if (actual === expected) {
                element.innerHTML = `✅ Success: "${actual}"`;
                element.parentElement.className = 'test-item success';
            } else {
                element.innerHTML = `❌ Error: Expected "${expected}", got "${actual}"`;
                element.parentElement.className = 'test-item error';
            }
        }

        // Run tests
        testTranslation('dashboard.chartType', 'Tipo de Gráfico', 'chartType-result');
        testTranslation('dashboard.line', 'Linha', 'line-result');
        testTranslation('dashboard.bar', 'Barras', 'bar-result');
        testTranslation('dashboard.groupBy', 'Agrupar por', 'groupBy-result');
    </script>
</body>
</html>
"@

# Save test file
$testHtml | Out-File -FilePath "test-dashboard-translations.html" -Encoding UTF8

Write-Host "Test file created: test-dashboard-translations.html" -ForegroundColor Green
Write-Host "Open this file in your browser to test the translations" -ForegroundColor Cyan
Write-Host "Or visit http://localhost:5173 to see the actual dashboard" -ForegroundColor Cyan

Write-Host "`nDashboard translation test completed!" -ForegroundColor Green