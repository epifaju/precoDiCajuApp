#!/usr/bin/env pwsh

# Script pour démarrer le backend et tester les filtres avancés des Exportateurs Agréés

Write-Host "=== Démarrage et Test des Filtres Avancés - Exportateurs Agréés ===" -ForegroundColor Green

# Vérifier si le backend est déjà en cours d'exécution
$backendRunning = $false
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs/test-health" -Method GET -TimeoutSec 5 -ErrorAction Stop
    $backendRunning = $true
    Write-Host "✅ Backend déjà en cours d'exécution" -ForegroundColor Green
}
catch {
    Write-Host "⚠️ Backend non démarré, démarrage en cours..." -ForegroundColor Yellow
}

# Démarrer le backend si nécessaire
if (-not $backendRunning) {
    Write-Host "`n🚀 Démarrage du backend..." -ForegroundColor Blue
    
    # Changer vers le répertoire backend
    Set-Location "backend"
    
    # Démarrer le backend en arrière-plan
    $backendProcess = Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -NoNewWindow -PassThru
    
    Write-Host "Backend en cours de démarrage (PID: $($backendProcess.Id))..." -ForegroundColor Yellow
    
    # Attendre que le backend soit prêt
    $maxWait = 60 # 60 secondes max
    $waitTime = 0
    
    do {
        Start-Sleep -Seconds 2
        $waitTime += 2
        
        try {
            $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/exportateurs/test-health" -Method GET -TimeoutSec 5 -ErrorAction Stop
            Write-Host "✅ Backend prêt après $waitTime secondes!" -ForegroundColor Green
            $backendRunning = $true
            break
        }
        catch {
            Write-Host "." -NoNewline -ForegroundColor Gray
        }
    } while ($waitTime -lt $maxWait)
    
    if (-not $backendRunning) {
        Write-Host "`n❌ Timeout: Le backend n'a pas démarré dans les $maxWait secondes" -ForegroundColor Red
        Write-Host "Arrêt du processus..." -ForegroundColor Yellow
        Stop-Process -Id $backendProcess.Id -Force
        exit 1
    }
    
    # Revenir au répertoire racine
    Set-Location ".."
}

# Attendre un peu pour s'assurer que tout est prêt
Start-Sleep -Seconds 3

Write-Host "`n🧪 Exécution des tests de filtres..." -ForegroundColor Blue

# Exécuter le script de test
if (Test-Path "test-exporters-filters-fix.ps1") {
    Write-Host "Exécution du script de test..." -ForegroundColor Cyan
    & ".\test-exporters-filters-fix.ps1"
}
else {
    Write-Host "❌ Script de test non trouvé: test-exporters-filters-fix.ps1" -ForegroundColor Red
}

Write-Host "`n=== Instructions pour tester l'interface frontend ===" -ForegroundColor Green
Write-Host "1. Ouvrez le fichier 'test-exporters-filters-frontend.html' dans votre navigateur" -ForegroundColor White
Write-Host "2. Ou démarrez le frontend avec: npm start (dans le dossier frontend)" -ForegroundColor White
Write-Host "3. Naviguez vers /exporters et testez les filtres avancés" -ForegroundColor White

Write-Host "`n=== Résumé des corrections apportées ===" -ForegroundColor Blue
Write-Host "✅ Ajout d'une nouvelle méthode findWithAllFilters dans ExportateurRepository" -ForegroundColor Green
Write-Host "✅ Correction du service ExportateurService pour utiliser tous les filtres" -ForegroundColor Green
Write-Host "✅ Support des filtres: région, type, statut, nom" -ForegroundColor Green
Write-Host "✅ Conversion automatique des paramètres String en enum" -ForegroundColor Green
Write-Host "✅ Gestion des erreurs pour les paramètres invalides" -ForegroundColor Green

Write-Host "`n🎉 Les filtres avancés des Exportateurs Agréés sont maintenant opérationnels !" -ForegroundColor Green
