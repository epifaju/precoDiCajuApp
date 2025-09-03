# Script pour corriger la base de données et redémarrer l'application

Write-Host "Arret des processus Java..." -ForegroundColor Yellow
Get-Process -Name "java" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep 3

Write-Host "Execution de la migration de base de donnees..." -ForegroundColor Yellow
cd backend

# Exécuter la migration Flyway
mvn flyway:migrate

Write-Host "Redemarrage de l'application..." -ForegroundColor Yellow
mvn spring-boot:run
