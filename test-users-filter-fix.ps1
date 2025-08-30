#!/usr/bin/env pwsh

Write-Host "=== Test des utilisateurs avec filtres - Après correction ===" -ForegroundColor Green

# Configuration
$baseUrl = "http://localhost:8080/api/v1"
$adminEmail = "admin@precaju.gw"
$adminPassword = "Admin123!"

Write-Host "1. Connexion administrateur..." -ForegroundColor Yellow

# Connexion admin
$loginPayload = @{
    email = $adminEmail
    password = $adminPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginPayload -ContentType "application/json"
    $token = $loginResponse.accessToken
    Write-Host "✓ Connexion admin réussie" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec de la connexion admin: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Headers avec JWT
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n2. Test des filtres utilisateurs..." -ForegroundColor Yellow

# Test 1: Récupération simple des utilisateurs
Write-Host "Test 1: Récupération de base..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/users" -Method Get -Headers $headers
    Write-Host "✓ Récupération réussie - Total: $($response.totalElements) utilisateurs" -ForegroundColor Green
    Write-Host "  Page: $($response.number + 1)/$($response.totalPages), Taille: $($response.size)" -ForegroundColor Gray
} catch {
    Write-Host "✗ Échec récupération de base: $($_.Exception.Message)" -ForegroundColor Red
    $details = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($details) {
        Write-Host "  Détails: $($details.error)" -ForegroundColor Red
    }
}

# Test 2: Tri par date de création
Write-Host "`nTest 2: Tri par createdAt..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/users?sortBy=createdAt&sortDir=desc" -Method Get -Headers $headers
    Write-Host "✓ Tri par createdAt réussi - Total: $($response.totalElements) utilisateurs" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec tri par createdAt: $($_.Exception.Message)" -ForegroundColor Red
    $details = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
    if ($details) {
        Write-Host "  Détails: $($details.error)" -ForegroundColor Red
    }
}

# Test 3: Filtre par rôle
Write-Host "`nTest 3: Filtre par rôle admin..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/users?role=ADMIN" -Method Get -Headers $headers
    Write-Host "✓ Filtre par rôle admin réussi - Total: $($response.totalElements) utilisateurs" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec filtre par rôle: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Filtre par statut actif
Write-Host "`nTest 4: Filtre utilisateurs actifs..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/users?active=true" -Method Get -Headers $headers
    Write-Host "✓ Filtre utilisateurs actifs réussi - Total: $($response.totalElements) utilisateurs" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec filtre utilisateurs actifs: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Recherche par email
Write-Host "`nTest 5: Recherche par email 'admin'..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/users?search=admin" -Method Get -Headers $headers
    Write-Host "✓ Recherche par email réussie - Total: $($response.totalElements) utilisateurs" -ForegroundColor Green
    if ($response.content.Count -gt 0) {
        Write-Host "  Premier résultat: $($response.content[0].email)" -ForegroundColor Gray
    }
} catch {
    Write-Host "✗ Échec recherche par email: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Filtres combinés
Write-Host "`nTest 6: Filtres combinés (actif + admin + tri)..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/users?active=true&role=ADMIN&sortBy=createdAt&sortDir=desc" -Method Get -Headers $headers
    Write-Host "✓ Filtres combinés réussis - Total: $($response.totalElements) utilisateurs" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec filtres combinés: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 7: Pagination avec tri
Write-Host "`nTest 7: Pagination avec tri..." -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/admin/users?page=0&size=2&sortBy=createdAt&sortDir=desc" -Method Get -Headers $headers
    Write-Host "✓ Pagination avec tri réussie - Page 1, $($response.content.Count) utilisateurs affichés" -ForegroundColor Green
} catch {
    Write-Host "✗ Échec pagination avec tri: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=== Test terminé ===" -ForegroundColor Green
Write-Host "Si tous les tests sont verts, le problème de tri SQL est corrigé !" -ForegroundColor Yellow
