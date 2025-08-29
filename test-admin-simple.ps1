# Script de test simple des endpoints admin
Write-Host "Test Simple des Endpoints Admin" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Test 1: Verifier que les fichiers corriges existent
Write-Host "`nVerification des fichiers corriges..." -ForegroundColor Yellow

$filesToCheck = @(
    "frontend\src\pages\AdminPage.tsx",
    "frontend\src\hooks\useApi.ts", 
    "backend\src\main\java\gw\precaju\controller\AdminController.java",
    "backend\src\main\java\gw\precaju\service\UserService.java"
)

foreach ($file in $filesToCheck) {
    if (Test-Path $file) {
        Write-Host "OK $file" -ForegroundColor Green
    } else {
        Write-Host "ERREUR $file - MANQUANT" -ForegroundColor Red
    }
}

# Test 2: Verifier les corrections dans AdminPage.tsx
Write-Host "`nVerification des corrections dans AdminPage.tsx..." -ForegroundColor Yellow

$adminPageContent = Get-Content "frontend\src\pages\AdminPage.tsx" -Raw

if ($adminPageContent -match "/api/v1/admin/users") {
    Write-Host "OK URLs corrigees vers /api/v1/admin/users" -ForegroundColor Green
} else {
    Write-Host "ERREUR URLs non corrigees" -ForegroundColor Red
}

if ($adminPageContent -match "/api/v1/admin/users/stats") {
    Write-Host "OK URLs corrigees vers /api/v1/admin/users/stats" -ForegroundColor Green
} else {
    Write-Host "ERREUR URLs non corrigees" -ForegroundColor Red
}

if ($adminPageContent -match "errorMessage = error.data?.message") {
    Write-Host "OK Gestion d'erreur amelioree" -ForegroundColor Green
} else {
    Write-Host "ERREUR Gestion d'erreur non amelioree" -ForegroundColor Red
}

# Test 3: Verifier les corrections dans useApi.ts
Write-Host "`nVerification des corrections dans useApi.ts..." -ForegroundColor Yellow

$useApiContent = Get-Content "frontend\src\hooks\useApi.ts" -Raw

if ($useApiContent -match "console.error.*API Error Response") {
    Write-Host "OK Logs d'erreur detailles ajoutes" -ForegroundColor Green
} else {
    Write-Host "ERREUR Logs d'erreur non ajoutes" -ForegroundColor Red
}

# Test 4: Verifier les corrections dans AdminController.java
Write-Host "`nVerification des corrections dans AdminController.java..." -ForegroundColor Yellow

$adminControllerContent = Get-Content "backend\src\main\java\gw\precaju\controller\AdminController.java" -Raw

if ($adminControllerContent -match "isValidSortField") {
    Write-Host "OK Validation des champs de tri ajoutee" -ForegroundColor Green
} else {
    Write-Host "ERREUR Validation des champs de tri non ajoutee" -ForegroundColor Red
}

if ($adminControllerContent -match "logger.warn.*Invalid sort field") {
    Write-Host "OK Logs de warning pour champs de tri invalides" -ForegroundColor Green
} else {
    Write-Host "ERREUR Logs de warning non ajoutes" -ForegroundColor Red
}

# Test 5: Verifier les corrections dans UserService.java
Write-Host "`nVerification des corrections dans UserService.java..." -ForegroundColor Yellow

$userServiceContent = Get-Content "backend\src\main\java\gw\precaju\service\UserService.java" -Raw

if ($userServiceContent -match "isValidRole") {
    Write-Host "OK Validation des roles ajoutee" -ForegroundColor Green
} else {
    Write-Host "ERREUR Validation des roles non ajoutee" -ForegroundColor Red
}

# Test 6: Verifier la compilation du backend
Write-Host "`nVerification de la compilation du backend..." -ForegroundColor Yellow

try {
    $compileResult = mvn compile -q
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK Backend compile sans erreur" -ForegroundColor Green
    } else {
        Write-Host "ERREUR Erreurs de compilation dans le backend" -ForegroundColor Red
    }
} catch {
    Write-Host "ERREUR Impossible de compiler le backend: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nResume des Tests" -ForegroundColor Cyan
Write-Host "==================" -ForegroundColor Cyan
Write-Host "OK Fichiers corriges: $(($filesToCheck | Where-Object { Test-Path $_ }).Count)/$($filesToCheck.Count)" -ForegroundColor Green
Write-Host "OK URLs corrigees: $(if ($adminPageContent -match "/api/v1/admin/users" -and $adminPageContent -match "/api/v1/admin/users/stats") { "Oui" } else { "Non" })" -ForegroundColor Green
Write-Host "OK Gestion d'erreur amelioree: $(if ($adminPageContent -match "errorMessage = error.data?.message") { "Oui" } else { "Non" })" -ForegroundColor Green
Write-Host "OK Validation backend ajoutee: $(if ($adminControllerContent -match "isValidSortField" -and $userServiceContent -match "isValidRole") { "Oui" } else { "Non" })" -ForegroundColor Green

Write-Host "`nProchaines Etapes" -ForegroundColor Cyan
Write-Host "===================" -ForegroundColor Cyan
Write-Host "1. Demarrer le backend: mvn spring-boot:run" -ForegroundColor Yellow
Write-Host "2. Tester les endpoints: .\test-admin-endpoints.ps1" -ForegroundColor Yellow
Write-Host "3. Verifier le frontend dans le navigateur" -ForegroundColor Yellow
