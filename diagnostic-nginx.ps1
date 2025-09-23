#!/usr/bin/env pwsh

# Script de diagnostic et correction pour Nginx
# Détection et correction automatique des erreurs de configuration

Write-Host "=== Diagnostic et Test Configuration Nginx ===" -ForegroundColor Green
Write-Host ""

# Fonction pour analyser les erreurs dans les logs
function Analyze-NginxErrors {
    param(
        [string]$ConfigFile
    )
    
    Write-Host "Analyse du fichier de configuration: $ConfigFile" -ForegroundColor Yellow
    
    if (-not (Test-Path $ConfigFile)) {
        Write-Host "❌ Fichier non trouvé: $ConfigFile" -ForegroundColor Red
        return $false
    }
    
    $content = Get-Content $ConfigFile
    $lineNumber = 0
    $errors = @()
    
    foreach ($line in $content) {
        $lineNumber++
        
        # Vérifier les directives add_header Cache-Control sans guillemets
        if ($line -match 'add_header\s+Cache-Control\s+[^"]*must-revalidate[^"]*[^;]*$') {
            $errors += "Ligne $lineNumber : Cache-Control 'must-revalidate' doit être entre guillemets"
        }
        
        # Vérifier gzip_proxied avec must-revalidate (invalide)
        if ($line -match 'gzip_proxied.*must-revalidate') {
            $errors += "Ligne $lineNumber : 'must-revalidate' n'est pas valide pour gzip_proxied"
        }
        
        # Vérifier les valeurs sans guillemets dans add_header
        if ($line -match 'add_header\s+\w+\s+[^"]+\s*;' -and $line -notmatch 'add_header\s+\w+\s+"[^"]*"\s*;') {
            if ($line -notmatch 'add_header\s+(Content-Length|Expires)\s+') {
                $errors += "Ligne $lineNumber : Valeur add_header devrait être entre guillemets"
            }
        }
    }
    
    if ($errors.Count -eq 0) {
        Write-Host "✅ Aucune erreur détectée dans $ConfigFile" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Erreurs détectées:" -ForegroundColor Red
        foreach ($error in $errors) {
            Write-Host "  $error" -ForegroundColor Red
        }
        return $false
    }
}

# Fonction pour tester la syntaxe Nginx
function Test-NginxSyntax {
    param(
        [string]$ConfigFile
    )
    
    Write-Host "Test de syntaxe pour: $ConfigFile" -ForegroundColor Yellow
    
    try {
        # Créer un conteneur temporaire pour tester la configuration
        $testCommand = "docker run --rm -v `"${PWD}/${ConfigFile}:/etc/nginx/nginx.conf:ro`" nginx:alpine nginx -t"
        $result = Invoke-Expression $testCommand 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Syntaxe valide!" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Erreur de syntaxe:" -ForegroundColor Red
            Write-Host $result -ForegroundColor Red
            return $false
        }
    }
    catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Fonction pour corriger automatiquement les erreurs courantes
function Fix-CommonNginxErrors {
    param(
        [string]$ConfigFile
    )
    
    Write-Host "Correction automatique des erreurs dans: $ConfigFile" -ForegroundColor Yellow
    
    if (-not (Test-Path $ConfigFile)) {
        Write-Host "❌ Fichier non trouvé: $ConfigFile" -ForegroundColor Red
        return $false
    }
    
    # Créer une sauvegarde
    $backupFile = "$ConfigFile.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item $ConfigFile $backupFile
    Write-Host "📋 Sauvegarde créée: $backupFile" -ForegroundColor Cyan
    
    $content = Get-Content $ConfigFile
    $fixed = $false
    
    for ($i = 0; $i -lt $content.Length; $i++) {
        $line = $content[$i]
        
        # Corriger gzip_proxied avec must-revalidate
        if ($line -match 'gzip_proxied.*must-revalidate') {
            $content[$i] = $line -replace 'gzip_proxied.*must-revalidate.*', 'gzip_proxied any;'
            Write-Host "✅ Ligne $($i+1) corrigée: gzip_proxied" -ForegroundColor Green
            $fixed = $true
        }
        
        # Corriger add_header Cache-Control sans guillemets
        if ($line -match 'add_header\s+Cache-Control\s+([^"]+);') {
            $value = $matches[1].Trim()
            $content[$i] = $line -replace "add_header\s+Cache-Control\s+$([regex]::Escape($value));", "add_header Cache-Control `"$value`";"
            Write-Host "✅ Ligne $($i+1) corrigée: Cache-Control guillemets ajoutés" -ForegroundColor Green
            $fixed = $true
        }
    }
    
    if ($fixed) {
        Set-Content $ConfigFile $content
        Write-Host "✅ Corrections appliquées à $ConfigFile" -ForegroundColor Green
        return $true
    } else {
        Write-Host "ℹ️  Aucune correction nécessaire" -ForegroundColor Cyan
        return $true
    }
}

# Fonction pour afficher les bonnes pratiques
function Show-BestPractices {
    Write-Host "📚 Bonnes pratiques pour éviter les erreurs Nginx:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Toujours mettre les valeurs complexes entre guillemets:" -ForegroundColor White
    Write-Host "   ✅ add_header Cache-Control `"no-cache, no-store, must-revalidate`";" -ForegroundColor Green
    Write-Host "   ❌ add_header Cache-Control no-cache, no-store, must-revalidate;" -ForegroundColor Red
    Write-Host ""
    Write-Host "2. Utiliser les bonnes directives pour gzip_proxied:" -ForegroundColor White
    Write-Host "   ✅ gzip_proxied any;" -ForegroundColor Green
    Write-Host "   ✅ gzip_proxied expired no-cache no-store private auth;" -ForegroundColor Green
    Write-Host "   ❌ gzip_proxied must-revalidate;" -ForegroundColor Red
    Write-Host ""
    Write-Host "3. Tester la configuration avant de déployer:" -ForegroundColor White
    Write-Host "   nginx -t" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "4. Recharger sans redémarrer:" -ForegroundColor White
    Write-Host "   nginx -s reload" -ForegroundColor Yellow
    Write-Host ""
}

# Fonction principale
function Main {
    Write-Host "Démarrage du diagnostic Nginx..." -ForegroundColor Cyan
    Write-Host ""
    
    $configFiles = @(
        "frontend/nginx.conf",
        "nginx.conf"
    )
    
    $allValid = $true
    
    foreach ($configFile in $configFiles) {
        if (Test-Path $configFile) {
            Write-Host "=== Analyse de $configFile ===" -ForegroundColor Blue
            
            # Analyse statique
            $analysisResult = Analyze-NginxErrors -ConfigFile $configFile
            
            if (-not $analysisResult) {
                Write-Host "Tentative de correction automatique..." -ForegroundColor Yellow
                Fix-CommonNginxErrors -ConfigFile $configFile
                
                # Re-analyser après correction
                $analysisResult = Analyze-NginxErrors -ConfigFile $configFile
            }
            
            # Test de syntaxe
            $syntaxResult = Test-NginxSyntax -ConfigFile $configFile
            
            if (-not ($analysisResult -and $syntaxResult)) {
                $allValid = $false
            }
            
            Write-Host ""
        } else {
            Write-Host "⚠️  Fichier non trouvé: $configFile" -ForegroundColor Yellow
        }
    }
    
    if ($allValid) {
        Write-Host "🎉 Tous les fichiers de configuration sont valides!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Certains fichiers nécessitent une attention manuelle" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Show-BestPractices
}

# Exécution
Main

Write-Host ""
Write-Host "=== Commandes utiles ===" -ForegroundColor Green
Write-Host "Test de config:     docker run --rm -v `"`${PWD}/nginx.conf:/etc/nginx/nginx.conf:ro`" nginx:alpine nginx -t"
Write-Host "Reload dans Docker: docker exec <container-name> nginx -s reload"
Write-Host "Logs d'erreur:      docker logs [container-name]"
Write-Host "Redemarrer service: docker-compose restart nginx"
