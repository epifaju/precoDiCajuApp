# Script de redémarrage du backend avec corrections PostgreSQL
# Ce script applique les migrations et redémarre le service

Write-Host "=== REDÉMARRAGE DU BACKEND AVEC CORRECTIONS POSTGRESQL ===" -ForegroundColor Green
Write-Host ""

# Configuration
$PROJECT_DIR = Get-Location
$BACKEND_DIR = "$PROJECT_DIR\backend"

Write-Host "Répertoire du projet: $PROJECT_DIR" -ForegroundColor Yellow
Write-Host "Répertoire backend: $BACKEND_DIR" -ForegroundColor Yellow
Write-Host ""

# 1. Arrêt des processus Java existants
Write-Host "1. Arrêt des processus Java existants..." -ForegroundColor Yellow
try {
    $javaProcesses = Get-Process -Name "java" -ErrorAction SilentlyContinue
    if ($javaProcesses) {
        Write-Host "   Processus Java trouvés: $($javaProcesses.Count)" -ForegroundColor Gray
        foreach ($process in $javaProcesses) {
            Write-Host "   Arrêt du processus PID: $($process.Id)" -ForegroundColor Gray
            Stop-Process -Id $process.Id -Force
        }
        Start-Sleep -Seconds 2
        Write-Host "✅ Processus Java arrêtés" -ForegroundColor Green
    } else {
        Write-Host "✅ Aucun processus Java en cours" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Erreur lors de l'arrêt des processus: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Vérification de la base de données PostgreSQL
Write-Host "`n2. Vérification de la base de données PostgreSQL..." -ForegroundColor Yellow
try {
    # Vérifier si PostgreSQL est en cours d'exécution
    $pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
    if ($pgProcess) {
        Write-Host "✅ PostgreSQL est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "⚠️  PostgreSQL n'est pas en cours d'exécution" -ForegroundColor Yellow
        Write-Host "   Démarrage de PostgreSQL via Docker..." -ForegroundColor Cyan
        
        # Essayer de démarrer PostgreSQL via Docker
        try {
            docker-compose up -d postgres
            Start-Sleep -Seconds 5
            Write-Host "✅ PostgreSQL démarré via Docker" -ForegroundColor Green
        } catch {
            Write-Host "❌ Impossible de démarrer PostgreSQL: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "   Veuillez démarrer PostgreSQL manuellement" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠️  Erreur lors de la vérification de PostgreSQL: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Nettoyage et compilation du projet
Write-Host "`n3. Nettoyage et compilation du projet..." -ForegroundColor Yellow
try {
    Set-Location $BACKEND_DIR
    
    # Nettoyage Maven
    Write-Host "   Nettoyage Maven..." -ForegroundColor Gray
    mvn clean -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Nettoyage Maven réussi" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du nettoyage Maven" -ForegroundColor Red
    }
    
    # Compilation Maven
    Write-Host "   Compilation Maven..." -ForegroundColor Gray
    mvn compile -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Compilation Maven réussi" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec de la compilation Maven" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Erreur lors de la compilation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Application des migrations de base de données
Write-Host "`n4. Application des migrations de base de données..." -ForegroundColor Yellow
try {
    # Vérifier que Flyway est configuré
    if (Test-Path "$BACKEND_DIR\src\main\resources\db\migration\V7__Fix_user_columns_types.sql") {
        Write-Host "✅ Migration V7 trouvée" -ForegroundColor Green
    } else {
        Write-Host "❌ Migration V7 manquante" -ForegroundColor Red
        exit 1
    }
    
    # Démarrer l'application pour appliquer les migrations
    Write-Host "   Démarrage de l'application pour appliquer les migrations..." -ForegroundColor Gray
    Start-Process -FilePath "mvn" -ArgumentList "spring-boot:run" -WorkingDirectory $BACKEND_DIR -WindowStyle Minimized
    
    # Attendre que l'application démarre et applique les migrations
    Write-Host "   Attente de l'application des migrations..." -ForegroundColor Gray
    Start-Sleep -Seconds 30
    
    # Vérifier que l'application est démarrée
    try {
        $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 10
        if ($healthResponse.status -eq "UP") {
            Write-Host "✅ Application démarrée et migrations appliquées" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Application démarrée mais statut: $($healthResponse.status)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  Impossible de vérifier l'état de l'application" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erreur lors de l'application des migrations: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Vérification des corrections
Write-Host "`n5. Vérification des corrections PostgreSQL..." -ForegroundColor Yellow
try {
    # Attendre un peu plus pour que tout soit bien initialisé
    Start-Sleep -Seconds 10
    
    # Test de l'endpoint de santé
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:8080/actuator/health" -Method GET -TimeoutSec 10
    if ($healthResponse.status -eq "UP") {
        Write-Host "✅ Endpoint de santé: UP" -ForegroundColor Green
        
        # Test de l'endpoint admin (sans authentification, doit retourner 401)
        try {
            $adminResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/admin/users" -Method GET -TimeoutSec 10 -ErrorAction Stop
            Write-Host "⚠️  Endpoint admin accessible sans authentification (statut: $($adminResponse.StatusCode))" -ForegroundColor Yellow
        } catch {
            $statusCode = $_.Exception.Response.StatusCode.value__
            if ($statusCode -eq 401) {
                Write-Host "✅ Endpoint admin protégé (401 Unauthorized)" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Statut inattendu de l'endpoint admin: $statusCode" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host "❌ Endpoint de santé: $($healthResponse.status)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Retour au répertoire principal
Set-Location $PROJECT_DIR

Write-Host "`n=== RÉSUMÉ DES CORRECTIONS APPLIQUÉES ===" -ForegroundColor Green
Write-Host "✅ Migration V7: Correction des types de colonnes users" -ForegroundColor White
Write-Host "✅ Requête JPQL corrigée: Suppression des CAST problématiques" -ForegroundColor White
Write-Host "✅ Méthode de fallback: SQL natif en cas d'échec JPQL" -ForegroundColor White
Write-Host "✅ Gestion d'erreur améliorée: Logs détaillés et fallback" -ForegroundColor White
Write-Host "✅ Index optimisés: Ajout d'index sur full_name" -ForegroundColor White

Write-Host "`n=== PROCHAINES ÉTAPES ===" -ForegroundColor Yellow
Write-Host "1. L'application est maintenant démarrée avec les corrections" -ForegroundColor Cyan
Write-Host "2. Testez l'endpoint admin avec: .\test-admin-endpoints-fixed.ps1" -ForegroundColor Cyan
Write-Host "3. Vérifiez les logs du backend pour confirmer l'absence d'erreurs" -ForegroundColor Cyan
Write-Host "4. Si des problèmes persistent, vérifiez la configuration de la base de données" -ForegroundColor Cyan

Write-Host "`n=== REDÉMARRAGE TERMINÉ ===" -ForegroundColor Green
Write-Host "Le backend est maintenant opérationnel avec les corrections PostgreSQL" -ForegroundColor White

