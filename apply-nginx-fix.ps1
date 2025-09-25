#!/usr/bin/env pwsh

# Script pour appliquer la correction Nginx "must-revalidate"
Write-Host "=== Application de la Correction Nginx ===" -ForegroundColor Green
Write-Host ""

# Fonction pour créer une sauvegarde
function Backup-Config {
    param([string]$ConfigFile)
    
    if (Test-Path $ConfigFile) {
        $backupFile = "$ConfigFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
        Copy-Item $ConfigFile $backupFile
        Write-Host "✅ Sauvegarde créée: $backupFile" -ForegroundColor Green
        return $true
    }
    return $false
}

# Fonction pour appliquer la correction
function Apply-Fix {
    Write-Host "1. Création des sauvegardes..." -ForegroundColor Yellow
    
    # Sauvegarder les configurations existantes
    $frontendBackup = Backup-Config "frontend/nginx.conf"
    $mainBackup = Backup-Config "nginx.conf"
    
    Write-Host ""
    Write-Host "2. Application de la configuration corrigée..." -ForegroundColor Yellow
    
    # Copier la configuration de test validée vers la configuration finale
    if (Test-Path "frontend/nginx-test.conf") {
        Copy-Item "frontend/nginx-test.conf" "frontend/nginx.conf"
        Write-Host "✅ Configuration frontend mise à jour" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Fichier nginx-test.conf non trouvé" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "3. Test des configurations..." -ForegroundColor Yellow
    
    # Test de la configuration frontend
    try {
        $frontendResult = docker run --rm -v "${PWD}/frontend/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Configuration frontend valide" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur dans la configuration frontend:" -ForegroundColor Red
            Write-Host $frontendResult
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test frontend: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    # Test de la configuration principale
    try {
        $mainResult = docker run --rm -v "${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro" nginx:alpine nginx -t 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Configuration principale valide" -ForegroundColor Green
        } else {
            Write-Host "❌ Erreur dans la configuration principale:" -ForegroundColor Red
            Write-Host $mainResult
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test principal: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $true
}

# Fonction pour redémarrer les services
function Restart-Services {
    Write-Host "4. Redémarrage des services..." -ForegroundColor Yellow
    
    try {
        # Vérifier si les services sont en cours d'exécution
        $runningServices = docker-compose ps --services --filter "status=running"
        
        if ($runningServices -contains "frontend") {
            Write-Host "Redémarrage du service frontend..." -ForegroundColor Cyan
            docker-compose restart frontend
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Service frontend redémarré" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Erreur lors du redémarrage frontend" -ForegroundColor Yellow
            }
        } else {
            Write-Host "ℹ️ Service frontend non démarré" -ForegroundColor Cyan
        }
        
        if ($runningServices -contains "nginx") {
            Write-Host "Redémarrage du service nginx..." -ForegroundColor Cyan
            docker-compose restart nginx
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Service nginx redémarré" -ForegroundColor Green
            } else {
                Write-Host "⚠️ Erreur lors du redémarrage nginx" -ForegroundColor Yellow
            }
        } else {
            Write-Host "ℹ️ Service nginx non démarré" -ForegroundColor Cyan
        }
        
        return $true
    }
    catch {
        Write-Host "❌ Erreur lors du redémarrage: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour afficher le résumé
function Show-Summary {
    Write-Host ""
    Write-Host "=== RÉSUMÉ DE LA CORRECTION ===" -ForegroundColor Green
    Write-Host ""
    Write-Host "🔧 Problème résolu :" -ForegroundColor Cyan
    Write-Host "   - Ligne 11: gzip_proxied 'must-revalidate' → 'any'" -ForegroundColor White
    Write-Host "   - Headers Cache-Control avec guillemets ajoutés" -ForegroundColor White
    Write-Host "   - Configuration CORS et sécurité optimisée" -ForegroundColor White
    Write-Host ""
    Write-Host "📁 Fichiers mis à jour :" -ForegroundColor Cyan
    Write-Host "   - frontend/nginx.conf (configuration corrigée)" -ForegroundColor White
    Write-Host "   - nginx.conf (reverse proxy optimisé)" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Prochaines étapes :" -ForegroundColor Cyan
    Write-Host "   1. Vérifier les logs: docker logs precaju-frontend" -ForegroundColor White
    Write-Host "   2. Tester l'application: http://localhost:3002" -ForegroundColor White
    Write-Host "   3. Monitorer les erreurs avec les scripts fournis" -ForegroundColor White
    Write-Host ""
    Write-Host "📚 Documentation créée :" -ForegroundColor Cyan
    Write-Host "   - SOLUTION_NGINX_MUST_REVALIDATE.md" -ForegroundColor White
    Write-Host "   - NGINX_TROUBLESHOOTING_GUIDE.md" -ForegroundColor White
    Write-Host "   - Scripts de test et diagnostic" -ForegroundColor White
}

# Exécution principale
function Main {
    Write-Host "Démarrage de l'application de la correction..." -ForegroundColor Cyan
    Write-Host ""
    
    $success = Apply-Fix
    
    if ($success) {
        Write-Host ""
        $restartSuccess = Restart-Services
        
        Write-Host ""
        Write-Host "🎉 CORRECTION APPLIQUÉE AVEC SUCCÈS!" -ForegroundColor Green
        
        Show-Summary
        
        if ($restartSuccess) {
            Write-Host ""
            Write-Host "✅ Services redémarrés - L'application devrait maintenant fonctionner" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠️ Redémarrez manuellement les services si nécessaire:" -ForegroundColor Yellow
            Write-Host "   docker-compose restart frontend" -ForegroundColor Cyan
            Write-Host "   docker-compose restart nginx" -ForegroundColor Cyan
        }
    } else {
        Write-Host ""
        Write-Host "❌ ÉCHEC DE L'APPLICATION DE LA CORRECTION" -ForegroundColor Red
        Write-Host "Vérifiez les erreurs ci-dessus et consultez la documentation." -ForegroundColor Yellow
    }
}

# Exécution
Main




