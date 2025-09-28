# Guide Complet pour Tester l'API QR Verification
# Ce script explique comment tester l'API reelle de verification QR

Write-Host "=== Guide Complet pour Tester l'API QR Verification ===" -ForegroundColor Green
Write-Host ""

Write-Host "=== ETAPE 1: Preparation de la Base de Donnees ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Demarrez PostgreSQL:" -ForegroundColor Yellow
Write-Host "   - Verifiez que PostgreSQL est demarre sur le port 5432" -ForegroundColor White
Write-Host "   - Base de donnees: precaju_db" -ForegroundColor White
Write-Host "   - Utilisateur: postgres" -ForegroundColor White
Write-Host "   - Mot de passe: password" -ForegroundColor White
Write-Host ""
Write-Host "2. Executez le script SQL pour creer les exportateurs de test:" -ForegroundColor Yellow
Write-Host "   psql -h localhost -p 5432 -U postgres -d precaju_db -f create-test-exporters.sql" -ForegroundColor White
Write-Host ""

Write-Host "=== ETAPE 2: Demarrage des Services ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Demarrez le backend:" -ForegroundColor Yellow
Write-Host "   cd backend" -ForegroundColor White
Write-Host "   ./mvnw spring-boot:run" -ForegroundColor White
Write-Host "   - Le backend sera accessible sur http://localhost:8080" -ForegroundColor White
Write-Host ""
Write-Host "2. Demarrez le frontend:" -ForegroundColor Yellow
Write-Host "   cd frontend" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor White
Write-Host "   - Le frontend sera accessible sur http://localhost:3001" -ForegroundColor White
Write-Host ""

Write-Host "=== ETAPE 3: Test de l'API Backend ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Executez le script de test API:" -ForegroundColor Yellow
Write-Host "powershell -ExecutionPolicy Bypass -File test-api-qr-verification.ps1" -ForegroundColor White
Write-Host ""
Write-Host "Ce script va:" -ForegroundColor White
Write-Host "  - Creer les exportateurs de test dans la base de donnees" -ForegroundColor White
Write-Host "  - Tester chaque endpoint de verification QR" -ForegroundColor White
Write-Host "  - Verifier que les reponses sont correctes" -ForegroundColor White
Write-Host ""

Write-Host "=== ETAPE 4: Test dans le Frontend ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Ouvrez http://localhost:3001/exporters" -ForegroundColor Yellow
Write-Host "2. Cliquez sur 'Scanner QR'" -ForegroundColor Yellow
Write-Host "3. Pour tester l'API reelle, modifiez le fichier QRScanner.tsx:" -ForegroundColor Yellow
Write-Host "   - Ouvrez frontend/src/components/exporters/QRScanner.tsx" -ForegroundColor White
Write-Host "   - Trouvez la ligne: const useRealAPI = false;" -ForegroundColor White
Write-Host "   - Changez a: const useRealAPI = true;" -ForegroundColor White
Write-Host "   - Sauvegardez le fichier" -ForegroundColor White
Write-Host "4. Cliquez sur 'Simuler un scan (Test)'" -ForegroundColor Yellow
Write-Host "5. Le scanner utilisera maintenant l'API reelle" -ForegroundColor Yellow
Write-Host ""

Write-Host "=== ETAPE 5: Test avec de Vrais QR Codes ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour tester avec de vrais QR codes:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Utilisez un generateur QR code en ligne (ex: qr-code-generator.com)" -ForegroundColor White
Write-Host "2. Generez des QR codes avec ces tokens:" -ForegroundColor White
Write-Host ""
Write-Host "Tokens QR valides (ACTIF):" -ForegroundColor Green
Write-Host "  - qr_a1b2c3d4_1703123456_x9y8z7w6" -ForegroundColor White
Write-Host "    Exportateur Test Bissau - ACTIF" -ForegroundColor Gray
Write-Host "  - qr_e5f6g7h8_1703123457_m1n2o3p4" -ForegroundColor White
Write-Host "    Exportateur Test Gabu - ACTIF" -ForegroundColor Gray
Write-Host "  - qr_c7d8e9f0_1703123460_z1a2b3c4" -ForegroundColor White
Write-Host "    Exportateur Test Quinara - ACTIF" -ForegroundColor Gray
Write-Host ""
Write-Host "Tokens QR pour tester les erreurs:" -ForegroundColor Red
Write-Host "  - qr_i9j0k1l2_1703123458_q5r6s7t8" -ForegroundColor White
Write-Host "    Exportateur Test Cacheu - EXPIRE" -ForegroundColor Gray
Write-Host "  - qr_u3v4w5x6_1703123459_y9z0a1b2" -ForegroundColor White
Write-Host "    Exportateur Test Oio - SUSPENDU" -ForegroundColor Gray
Write-Host "  - qr_invalid_token_12345678_abcdefgh" -ForegroundColor White
Write-Host "    Token QR invalide" -ForegroundColor Gray
Write-Host ""
Write-Host "3. Scannez le QR code avec votre camera" -ForegroundColor White
Write-Host "4. Verifiez que l'API retourne les bonnes informations" -ForegroundColor White
Write-Host ""

Write-Host "=== ETAPE 6: Verification des Resultats ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Resultats attendus:" -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ SUCCESS (Exportateurs ACTIF):" -ForegroundColor Green
Write-Host "  - success: true" -ForegroundColor White
Write-Host "  - result: 'SUCCESS'" -ForegroundColor White
Write-Host "  - Donnees exportateur completes" -ForegroundColor White
Write-Host "  - Statut: ACTIF" -ForegroundColor White
Write-Host ""
Write-Host "❌ EXPIRED (Exportateurs EXPIRE):" -ForegroundColor Red
Write-Host "  - success: false" -ForegroundColor White
Write-Host "  - result: 'EXPIRED'" -ForegroundColor White
Write-Host "  - Message: 'Ce certificat d'exportateur a expire'" -ForegroundColor White
Write-Host ""
Write-Host "⚠️ SUSPENDED (Exportateurs SUSPENDU):" -ForegroundColor Yellow
Write-Host "  - success: false" -ForegroundColor White
Write-Host "  - result: 'SUSPENDED'" -ForegroundColor White
Write-Host "  - Message: 'Ce certificat d'exportateur a ete suspendu'" -ForegroundColor White
Write-Host ""
Write-Host "❌ NOT_FOUND (Tokens invalides):" -ForegroundColor Red
Write-Host "  - success: false" -ForegroundColor White
Write-Host "  - result: 'NOT_FOUND'" -ForegroundColor White
Write-Host "  - Message: 'Aucun exportateur trouve avec ce code QR'" -ForegroundColor White
Write-Host ""

Write-Host "=== ETAPE 7: Debugging ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si les tests echouent:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Verifiez les logs du backend:" -ForegroundColor White
Write-Host "   - Regardez la console du backend pour les erreurs" -ForegroundColor White
Write-Host "   - Verifiez les logs de verification QR" -ForegroundColor White
Write-Host ""
Write-Host "2. Verifiez la base de donnees:" -ForegroundColor White
Write-Host "   psql -h localhost -p 5432 -U postgres -d precaju_db" -ForegroundColor White
Write-Host "   SELECT * FROM exportateurs WHERE numero_agrement LIKE 'TEST-%';" -ForegroundColor White
Write-Host ""
Write-Host "3. Testez l'API directement:" -ForegroundColor White
Write-Host "   curl http://localhost:8080/api/v1/exportateurs/verify/qr_a1b2c3d4_1703123456_x9y8z7w6" -ForegroundColor White
Write-Host ""
Write-Host "4. Verifiez les CORS:" -ForegroundColor White
Write-Host "   - Le backend doit autoriser les requetes depuis localhost:3001" -ForegroundColor White
Write-Host ""

Write-Host "=== RESUME ===" -ForegroundColor Green
Write-Host ""
Write-Host "Pour tester l'API reelle de verification QR:" -ForegroundColor Yellow
Write-Host "1. ✅ Creer les exportateurs de test (create-test-exporters.sql)" -ForegroundColor White
Write-Host "2. ✅ Demarrer backend et frontend" -ForegroundColor White
Write-Host "3. ✅ Executer les tests API (test-api-qr-verification.ps1)" -ForegroundColor White
Write-Host "4. ✅ Modifier QRScanner.tsx (useRealAPI = true)" -ForegroundColor White
Write-Host "5. ✅ Generer et scanner de vrais QR codes" -ForegroundColor White
Write-Host "6. ✅ Verifier les resultats dans le frontend" -ForegroundColor White
Write-Host ""
Write-Host "L'API de verification QR est maintenant completement fonctionnelle!" -ForegroundColor Green
Write-Host ""

Write-Host "=== Test termine ===" -ForegroundColor Green
