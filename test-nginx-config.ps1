#!/usr/bin/env pwsh

# Script pour tester la configuration Nginx
# Auteur: Assistant IA
# Date: $(Get-Date -Format "yyyy-MM-dd")

Write-Host "=== Test de Configuration Nginx ===" -ForegroundColor Green
Write-Host ""

# Fonction pour tester la configuration Nginx dans Docker
function Test-NginxConfig {
    Write-Host "1. Test de la syntaxe de la configuration Nginx..." -ForegroundColor Yellow
    
    try {
        # Test de la configuration avec un conteneur temporaire
        $testResult = docker run --rm -v "${PWD}/nginx/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Configuration Nginx valide!" -ForegroundColor Green
            Write-Host $testResult
            return $true
        }
        else {
            Write-Host "❌ Erreur dans la configuration Nginx:" -ForegroundColor Red
            Write-Host $testResult
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour vérifier les services Docker
function Test-DockerServices {
    Write-Host "2. Vérification des services Docker..." -ForegroundColor Yellow
    
    try {
        $services = docker-compose ps --services
        Write-Host "Services disponibles: $($services -join ', ')" -ForegroundColor Cyan
        
        $runningServices = docker-compose ps --filter "status=running" --services
        if ($runningServices) {
            Write-Host "Services en cours d'exécution: $($runningServices -join ', ')" -ForegroundColor Green
        }
        else {
            Write-Host "Aucun service en cours d'exécution" -ForegroundColor Yellow
        }
        
        return $true
    }
    catch {
        Write-Host "❌ Erreur lors de la vérification des services: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour recharger la configuration Nginx
function Reload-NginxConfig {
    Write-Host "3. Rechargement de la configuration Nginx..." -ForegroundColor Yellow
    
    try {
        # Trouver le conteneur Nginx
        $nginxContainer = docker ps --filter "name=precodicaju-nginx" --format "{{.Names}}"
        
        if ($nginxContainer) {
            Write-Host "Conteneur Nginx trouvé: $nginxContainer" -ForegroundColor Cyan
            
            # Test de la configuration dans le conteneur
            $testResult = docker exec $nginxContainer nginx -t 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Test de configuration réussi dans le conteneur" -ForegroundColor Green
                
                # Rechargement de la configuration
                docker exec $nginxContainer nginx -s reload
                
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "✅ Configuration Nginx rechargée avec succès!" -ForegroundColor Green
                    return $true
                }
                else {
                    Write-Host "❌ Erreur lors du rechargement" -ForegroundColor Red
                    return $false
                }
            }
            else {
                Write-Host "❌ Erreur dans la configuration:" -ForegroundColor Red
                Write-Host $testResult
                return $false
            }
        }
        else {
            Write-Host "❌ Conteneur Nginx non trouvé ou non démarré" -ForegroundColor Red
            Write-Host "Démarrez les services avec: docker-compose up -d" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur lors du rechargement: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour tester les endpoints
function Test-Endpoints {
    Write-Host "4. Test des endpoints..." -ForegroundColor Yellow
    
    $endpoints = @(
        @{ url = "http://localhost/health"; description = "Health check" },
        @{ url = "http://localhost/"; description = "Frontend" },
        @{ url = "http://localhost/api/"; description = "API Backend" }
    )
    
    foreach ($endpoint in $endpoints) {
        try {
            Write-Host "Testing $($endpoint.description): $($endpoint.url)" -ForegroundColor Cyan
            
            $response = Invoke-WebRequest -Uri $endpoint.url -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "  ✅ Status: $($response.StatusCode)" -ForegroundColor Green
            
            # Vérifier les headers de sécurité
            $headers = $response.Headers
            if ($headers["X-Frame-Options"]) {
                Write-Host "  ✅ X-Frame-Options: $($headers["X-Frame-Options"])" -ForegroundColor Green
            }
            if ($headers["X-Content-Type-Options"]) {
                Write-Host "  ✅ X-Content-Type-Options: $($headers["X-Content-Type-Options"])" -ForegroundColor Green
            }
            
        }
        catch {
            Write-Host "  ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
        Write-Host ""
    }
}

# Fonction principale
function Main {
    Write-Host "Démarrage des tests de configuration Nginx..." -ForegroundColor Cyan
    Write-Host ""
    
    # Test 1: Configuration Nginx
    $configValid = Test-NginxConfig
    Write-Host ""
    
    # Test 2: Services Docker
    Test-DockerServices
    Write-Host ""
    
    # Test 3: Rechargement (seulement si la config est valide)
    if ($configValid) {
        Reload-NginxConfig
        Write-Host ""
        
        # Test 4: Endpoints
        Test-Endpoints
    }
    else {
        Write-Host "⚠️  Correction de la configuration requise avant de continuer" -ForegroundColor Yellow
    }
    
    Write-Host "=== Fin des tests ===" -ForegroundColor Green
}

# Exécution du script principal
Main

Write-Host ""
Write-Host "📝 Commandes utiles pour Nginx:"
Write-Host "  - Tester la config: docker run --rm -v `"`${PWD}/nginx/nginx.conf:/etc/nginx/nginx.conf:ro`" nginx:alpine nginx -t"
Write-Host "  - Recharger: docker exec precodicaju-nginx nginx -s reload"
Write-Host "  - Voir logs: docker logs precodicaju-nginx"
Write-Host "  - Redémarrer: docker-compose restart nginx"






