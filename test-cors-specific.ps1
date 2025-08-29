# Script de test CORS spécifique pour diagnostiquer le problème
Write-Host "=== Test CORS Spécifique ===" -ForegroundColor Green

# 1. Vérifier que le backend est accessible
Write-Host "`n1. Vérification de l'accessibilité du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/actuator/health" -Method GET -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Le problème CORS peut être dû au fait que le backend n'est pas démarré." -ForegroundColor Cyan
    exit 1
}

# 2. Test CORS depuis différents ports
Write-Host "`n2. Test CORS depuis différents ports..." -ForegroundColor Yellow
$testPorts = @(3000, 3001, 3002, 3003, 5173)
$corsWorking = $false

foreach ($port in $testPorts) {
    $origin = "http://localhost:$port"
    Write-Host "`n   Test depuis $origin..." -ForegroundColor Cyan
    
    try {
        # Test 1: Preflight request OPTIONS
        Write-Host "     Test 1: Preflight OPTIONS..." -ForegroundColor Gray
        $preflightHeaders = @{
            "Origin" = $origin
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "Content-Type"
        }
        
        $preflightResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method OPTIONS -Headers $preflightHeaders -TimeoutSec 5 -ErrorAction Stop
        
        if ($preflightResponse.StatusCode -eq 200) {
            Write-Host "       ✅ Preflight OK" -ForegroundColor Green
            
            # Vérifier les headers CORS
            $corsHeaders = $preflightResponse.Headers
            Write-Host "       Headers CORS reçus:" -ForegroundColor Gray
            
            if ($corsHeaders["Access-Control-Allow-Origin"]) {
                Write-Host "         Access-Control-Allow-Origin: $($corsHeaders['Access-Control-Allow-Origin'])" -ForegroundColor White
            } else {
                Write-Host "         ❌ Access-Control-Allow-Origin manquant" -ForegroundColor Red
            }
            
            if ($corsHeaders["Access-Control-Allow-Methods"]) {
                Write-Host "         Access-Control-Allow-Methods: $($corsHeaders['Access-Control-Allow-Methods'])" -ForegroundColor White
            } else {
                Write-Host "         ❌ Access-Control-Allow-Methods manquant" -ForegroundColor Red
            }
            
            if ($corsHeaders["Access-Control-Allow-Headers"]) {
                Write-Host "         Access-Control-Allow-Headers: $($corsHeaders['Access-Control-Allow-Headers'])" -ForegroundColor White
            } else {
                Write-Host "         ❌ Access-Control-Allow-Headers manquant" -ForegroundColor Red
            }
            
            if ($corsHeaders["Access-Control-Allow-Credentials"]) {
                Write-Host "         Access-Control-Allow-Credentials: $($corsHeaders['Access-Control-Allow-Credentials'])" -ForegroundColor White
            } else {
                Write-Host "         ❌ Access-Control-Allow-Credentials manquant" -ForegroundColor Red
            }
            
            $corsWorking = $true
        } else {
            Write-Host "       ❌ Preflight échoué: $($preflightResponse.StatusCode)" -ForegroundColor Red
        }
        
        # Test 2: Requête réelle POST
        Write-Host "     Test 2: Requête POST réelle..." -ForegroundColor Gray
        $loginData = @{
            email = "admin@precaju.gw"
            password = "admin123"
            rememberMe = $false
        } | ConvertTo-Json
        
        $postHeaders = @{
            "Origin" = $origin
            "Content-Type" = "application/json"
        }
        
        $postResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $loginData -Headers $postHeaders -TimeoutSec 5 -ErrorAction Stop
        
        if ($postResponse.StatusCode -eq 200) {
            Write-Host "       ✅ POST OK" -ForegroundColor Green
            
            # Vérifier les headers CORS de la réponse
            $responseHeaders = $postResponse.Headers
            if ($responseHeaders["Access-Control-Allow-Origin"]) {
                Write-Host "         Access-Control-Allow-Origin: $($responseHeaders['Access-Control-Allow-Origin'])" -ForegroundColor White
            }
        } else {
            Write-Host "       ❌ POST échoué: $($postResponse.StatusCode)" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "       ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            Write-Host "         Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
            Write-Host "         Contenu: $($_.Exception.Response.Content)" -ForegroundColor Red
        }
    }
}

# 3. Test spécifique du navigateur
Write-Host "`n3. Test de simulation navigateur..." -ForegroundColor Yellow
Write-Host "   Test avec User-Agent et headers complets..." -ForegroundColor Cyan

try {
    $browserHeaders = @{
        "Origin" = "http://localhost:3000"
        "User-Agent" = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        "Accept" = "application/json, text/plain, */*"
        "Accept-Language" = "fr-FR,fr;q=0.9,en;q=0.8"
        "Accept-Encoding" = "gzip, deflate, br"
        "Connection" = "keep-alive"
        "Sec-Fetch-Dest" = "empty"
        "Sec-Fetch-Mode" = "cors"
        "Sec-Fetch-Site" = "same-site"
    }
    
    $browserResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/auth/login" -Method OPTIONS -Headers $browserHeaders -TimeoutSec 5 -ErrorAction Stop
    
    if ($browserResponse.StatusCode -eq 200) {
        Write-Host "   ✅ Test navigateur OK" -ForegroundColor Green
        
        # Afficher tous les headers
        Write-Host "   Headers complets reçus:" -ForegroundColor Gray
        $browserResponse.Headers.GetEnumerator() | ForEach-Object {
            Write-Host "     $($_.Key): $($_.Value)" -ForegroundColor White
        }
    } else {
        Write-Host "   ❌ Test navigateur échoué: $($browserResponse.StatusCode)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "   ❌ Erreur test navigateur: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Résumé et recommandations
Write-Host "`n=== RÉSUMÉ CORS ===" -ForegroundColor Green

if ($corsWorking) {
    Write-Host "✅ Configuration CORS fonctionne correctement" -ForegroundColor Green
    Write-Host "Le problème peut être:" -ForegroundColor Yellow
    Write-Host "1. Configuration frontend incorrecte" -ForegroundColor Cyan
    Write-Host "2. Problème de cache navigateur" -ForegroundColor Cyan
    Write-Host "3. Problème de proxy ou firewall" -ForegroundColor Cyan
} else {
    Write-Host "❌ Problème CORS détecté!" -ForegroundColor Red
    Write-Host "Causes possibles:" -ForegroundColor Yellow
    Write-Host "1. Configuration CORS backend incorrecte" -ForegroundColor Cyan
    Write-Host "2. Problème de profil Spring Boot" -ForegroundColor Cyan
    Write-Host "3. Filtres de sécurité bloquant les requêtes CORS" -ForegroundColor Cyan
}

Write-Host "`n🔧 Solutions recommandées:" -ForegroundColor Yellow
Write-Host "1. Vérifier que le backend utilise le bon profil (docker)" -ForegroundColor Cyan
Write-Host "2. Redémarrer le backend après modification de la config CORS" -ForegroundColor Cyan
Write-Host "3. Vider le cache du navigateur" -ForegroundColor Cyan
Write-Host "4. Vérifier les logs du backend pour les erreurs CORS" -ForegroundColor Cyan

Write-Host "`n📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   - Voir les logs: docker logs precaju-backend" -ForegroundColor White
Write-Host "   - Redémarrer: docker-compose restart backend" -ForegroundColor White
Write-Host "   - Vérifier la config: docker exec precaju-backend cat /app/application.yml" -ForegroundColor White

Write-Host "`n=== TEST CORS TERMINÉ ===" -ForegroundColor Green
