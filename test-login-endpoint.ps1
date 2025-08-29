# Test script pour diagnostiquer l'endpoint de login
Write-Host "=== Test de l'endpoint /api/v1/auth/login ===" -ForegroundColor Green

# Test 1: Requête avec données valides
Write-Host "`n1. Test avec données valides:" -ForegroundColor Yellow
$validBody = @{
    email = "test@example.com"
    password = "password123"
    rememberMe = $false
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $validBody -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Succès: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__): $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Corps de la réponse: $responseBody" -ForegroundColor Red
    }
}

# Test 2: Requête avec email manquant
Write-Host "`n2. Test avec email manquant:" -ForegroundColor Yellow
$invalidBody1 = @{
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $invalidBody1 -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Succès: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__): $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Corps de la réponse: $responseBody" -ForegroundColor Red
    }
}

# Test 3: Requête avec mot de passe manquant
Write-Host "`n3. Test avec mot de passe manquant:" -ForegroundColor Yellow
$invalidBody2 = @{
    email = "test@example.com"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $invalidBody2 -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Succès: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__): $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Corps de la réponse: $responseBody" -ForegroundColor Red
    }
}

# Test 4: Requête avec email invalide
Write-Host "`n4. Test avec email invalide:" -ForegroundColor Yellow
$invalidBody3 = @{
    email = "invalid-email"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $invalidBody3 -ContentType "application/json" -ErrorAction Stop
    Write-Host "✅ Succès: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur HTTP $($_.Exception.Response.StatusCode.value__): $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Corps de la réponse: $responseBody" -ForegroundColor Red
    }
}

# Test 5: Test CORS preflight
Write-Host "`n5. Test CORS preflight (OPTIONS):" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method OPTIONS -ErrorAction Stop
    Write-Host "✅ Succès CORS preflight" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur CORS preflight: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Fin des tests ===" -ForegroundColor Green
