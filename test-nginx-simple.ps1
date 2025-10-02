#!/usr/bin/env pwsh

# Script de test Nginx simplifié
Write-Host "=== Test Configuration Nginx ===" -ForegroundColor Green
Write-Host ""

# Test du fichier frontend/nginx.conf
if (Test-Path "frontend/nginx.conf") {
    Write-Host "Test de frontend/nginx.conf..." -ForegroundColor Yellow
    try {
        $result = docker run --rm -v "${PWD}/frontend/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ frontend/nginx.conf est valide!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur dans frontend/nginx.conf:" -ForegroundColor Red
            Write-Host $result
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ frontend/nginx.conf non trouvé" -ForegroundColor Yellow
}

Write-Host ""

# Test du fichier nginx.conf principal
if (Test-Path "nginx.conf") {
    Write-Host "Test de nginx.conf..." -ForegroundColor Yellow
    try {
        $result = docker run --rm -v "${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ nginx.conf est valide!" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur dans nginx.conf:" -ForegroundColor Red
            Write-Host $result
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ nginx.conf non trouvé" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Commandes utiles ===" -ForegroundColor Cyan
Write-Host "Tester une config:     docker run --rm -v `"path/to/nginx.conf:/etc/nginx/nginx.conf:ro`" nginx:alpine nginx -t"
Write-Host "Recharger Nginx:       docker exec [container-name] nginx -s reload"
Write-Host "Voir les logs:         docker logs [container-name]"
Write-Host "Redemarrer:            docker-compose restart nginx"









