# Test de validation du hash BCrypt

$hash = '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM.lE4fFJaExzANgGQf6'
$password = 'admin123'

Write-Host "=== VALIDATION DU HASH BCRYPT ===" -ForegroundColor Cyan
Write-Host "Hash dans la DB: $hash" -ForegroundColor Yellow
Write-Host "Mot de passe testé: $password" -ForegroundColor Yellow
Write-Host "Longueur du hash: $($hash.Length)" -ForegroundColor Gray

# Test avec un hash BCrypt vérifié pour "admin123"
$knownGoodHash = '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'
Write-Host "`nHash vérifié pour 'admin123': $knownGoodHash" -ForegroundColor Cyan

# Mettons à jour la base avec le hash vérifié
Write-Host "`n=== MISE À JOUR AVEC HASH VÉRIFIÉ ===" -ForegroundColor Cyan
try {
    docker exec precaju-postgres psql -U precaju -d precaju -c "UPDATE users SET password_hash = '$knownGoodHash' WHERE email = 'admin@precaju.gw';" -t
    Write-Host "✅ Hash mis à jour avec succès" -ForegroundColor Green
}
catch {
    Write-Host "❌ Erreur lors de la mise à jour: $($_.Exception.Message)" -ForegroundColor Red
}
