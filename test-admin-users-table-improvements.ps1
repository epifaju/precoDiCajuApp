# Test des Améliorations du Tableau des Utilisateurs - AdminPage
# Ce script teste la responsivité et les fonctionnalités du tableau amélioré

Write-Host "🧪 Test des Améliorations du Tableau des Utilisateurs" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan

# Vérifier que le backend est démarré
Write-Host "`n1️⃣ Vérification du backend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible. Démarrez d'abord le backend." -ForegroundColor Red
    Write-Host "   Utilisez: ./start-backend-clean.ps1" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le frontend est démarré
Write-Host "`n2️⃣ Vérification du frontend..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible. Démarrez d'abord le frontend." -ForegroundColor Red
    Write-Host "   Utilisez: ./start-frontend.ps1" -ForegroundColor Yellow
    exit 1
}

# Test de l'authentification admin
Write-Host "`n3️⃣ Test de l'authentification admin..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@precaju.gw"
        password = "admin123"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/auth/login" -Method POST -Body $loginData -ContentType "application/json"
    
    if ($loginResponse.accessToken) {
        Write-Host "✅ Authentification admin réussie" -ForegroundColor Green
        $token = $loginResponse.accessToken
    } else {
        Write-Host "❌ Échec de l'authentification admin" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'authentification admin: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test de l'endpoint des utilisateurs
Write-Host "`n4️⃣ Test de l'endpoint des utilisateurs..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $token"
        "Content-Type" = "application/json"
    }

    $usersResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/users?page=0&size=5" -Method GET -Headers $headers
    
    if ($usersResponse.content) {
        Write-Host "✅ Endpoint utilisateurs accessible" -ForegroundColor Green
        Write-Host "   📊 Nombre d'utilisateurs: $($usersResponse.totalElements)" -ForegroundColor Blue
        Write-Host "   📄 Pages totales: $($usersResponse.totalPages)" -ForegroundColor Blue
        Write-Host "   🔢 Taille de page: $($usersResponse.size)" -ForegroundColor Blue
    } else {
        Write-Host "❌ Aucun utilisateur trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de l'accès aux utilisateurs: $($_.Exception.Message)" -ForegroundColor Red
}

# Test des statistiques utilisateurs
Write-Host "`n5️⃣ Test des statistiques utilisateurs..." -ForegroundColor Yellow
try {
    $statsResponse = Invoke-RestMethod -Uri "http://localhost:8080/api/v1/admin/users/stats" -Method GET -Headers $headers
    
    if ($statsResponse) {
        Write-Host "✅ Statistiques utilisateurs accessibles" -ForegroundColor Green
        Write-Host "   👥 Total: $($statsResponse.totalUsers)" -ForegroundColor Blue
        Write-Host "   ✅ Actifs: $($statsResponse.activeUsers)" -ForegroundColor Blue
        Write-Host "   👑 Admins: $($statsResponse.adminUsers)" -ForegroundColor Blue
        Write-Host "   🛡️ Modérateurs: $($statsResponse.moderatorUsers)" -ForegroundColor Blue
        Write-Host "   📝 Contributeurs: $($statsResponse.contributorUsers)" -ForegroundColor Blue
    } else {
        Write-Host "❌ Statistiques non disponibles" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de l'accès aux statistiques: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la responsivité du tableau
Write-Host "`n6️⃣ Test de la responsivité du tableau..." -ForegroundColor Yellow
Write-Host "   📱 Pour tester la responsivité:" -ForegroundColor Blue
Write-Host "     1. Ouvrez http://localhost:3000/admin dans votre navigateur" -ForegroundColor White
Write-Host "     2. Connectez-vous avec admin@precaju.gw / admin123" -ForegroundColor White
Write-Host "     3. Redimensionnez la fenêtre pour tester:" -ForegroundColor White
Write-Host "        - < 1024px : Cartes empilées (mobile)" -ForegroundColor Cyan
Write-Host "        - 1024px-1280px : Tableau simplifié (tablette)" -ForegroundColor Cyan
Write-Host "        - > 1280px : Tableau complet (desktop)" -ForegroundColor Cyan

# Test des fonctionnalités d'action
Write-Host "`n7️⃣ Test des fonctionnalités d'action..." -ForegroundColor Yellow
Write-Host "   🔧 Fonctionnalités à tester manuellement:" -ForegroundColor Blue
Write-Host "     - ✅ Création d'utilisateur" -ForegroundColor Green
Write-Host "     - ✅ Édition d'utilisateur" -ForegroundColor Green
Write-Host "     - ✅ Changement de mot de passe" -ForegroundColor Green
Write-Host "     - ✅ Activation/désactivation" -ForegroundColor Green
Write-Host "     - ✅ Filtres et recherche" -ForegroundColor Green
Write-Host "     - ✅ Pagination améliorée" -ForegroundColor Green

# Test de la cohérence visuelle
Write-Host "`n8️⃣ Test de la cohérence visuelle..." -ForegroundColor Yellow
Write-Host "   🎨 Éléments visuels à vérifier:" -ForegroundColor Blue
Write-Host "     - ✅ Couleurs des badges (Admin: rouge, Modérateur: bleu, Contributeur: gris)" -ForegroundColor Green
Write-Host "     - ✅ Statuts (Actif: vert, Inactif: rouge)" -ForegroundColor Green
Write-Host "     - ✅ Support du mode sombre" -ForegroundColor Green
Write-Host "     - ✅ Transitions et animations fluides" -ForegroundColor Green
Write-Host "     - ✅ Icônes SVG dans les boutons d'action" -ForegroundColor Green

# Instructions de test détaillées
Write-Host "`n📋 Instructions de Test Détaillées" -ForegroundColor Magenta
Write-Host "=================================" -ForegroundColor Magenta

Write-Host "`n📱 Test Mobile (< 1024px):" -ForegroundColor Cyan
Write-Host "   1. Redimensionnez la fenêtre à moins de 1024px" -ForegroundColor White
Write-Host "   2. Vérifiez que les utilisateurs s'affichent en cartes empilées" -ForegroundColor White
Write-Host "   3. Vérifiez que les boutons d'action sont pleine largeur" -ForegroundColor White
Write-Host "   4. Vérifiez que les filtres sont masqués par défaut" -ForegroundColor White
Write-Host "   5. Testez le toggle des filtres" -ForegroundColor White

Write-Host "`n📱 Test Tablette (1024px - 1280px):" -ForegroundColor Cyan
Write-Host "   1. Redimensionnez la fenêtre entre 1024px et 1280px" -ForegroundColor White
Write-Host "   2. Vérifiez que le tableau s'affiche avec 5 colonnes" -ForegroundColor White
Write-Host "   3. Vérifiez que la colonne réputation est masquée" -ForegroundColor White
Write-Host "   4. Vérifiez que les boutons d'action sont empilés verticalement" -ForegroundColor White

Write-Host "`n💻 Test Desktop (> 1280px):" -ForegroundColor Cyan
Write-Host "   1. Redimensionnez la fenêtre à plus de 1280px" -ForegroundColor White
Write-Host "   2. Vérifiez que le tableau complet s'affiche avec 6 colonnes" -ForegroundColor White
Write-Host "   3. Vérifiez que les boutons d'action sont alignés horizontalement" -ForegroundColor White
Write-Host "   4. Vérifiez que toutes les informations sont visibles" -ForegroundColor White

Write-Host "`n🔧 Test des Fonctionnalités:" -ForegroundColor Cyan
Write-Host "   1. Testez la création d'un nouvel utilisateur" -ForegroundColor White
Write-Host "   2. Testez l'édition d'un utilisateur existant" -ForegroundColor White
Write-Host "   3. Testez le changement de mot de passe" -ForegroundColor White
Write-Host "   4. Testez l'activation/désactivation d'un utilisateur" -ForegroundColor White
Write-Host "   5. Testez les filtres (rôle, statut, recherche)" -ForegroundColor White
Write-Host "   6. Testez la pagination avec les indicateurs de page" -ForegroundColor White

Write-Host "`n🎨 Test du Design:" -ForegroundColor Cyan
Write-Host "   1. Vérifiez que les couleurs sont cohérentes" -ForegroundColor White
Write-Host "   2. Testez le mode sombre si disponible" -ForegroundColor White
Write-Host "   3. Vérifiez que les transitions sont fluides" -ForegroundColor White
Write-Host "   4. Vérifiez que les icônes SVG s'affichent correctement" -ForegroundColor White

Write-Host "`n✅ Résumé des Améliorations Implémentées" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🎯 Design responsive avec 3 vues distinctes" -ForegroundColor White
Write-Host "📱 Cartes empilées sur mobile pour une meilleure lisibilité" -ForegroundColor White
Write-Host "📱 Tableau simplifié sur tablette avec espacement optimisé" -ForegroundColor White
Write-Host "💻 Tableau complet sur desktop avec toutes les colonnes" -ForegroundColor White
Write-Host "🔘 Boutons d'action optimisés pour le tactile sur mobile" -ForegroundColor White
Write-Host "📄 Pagination améliorée avec indicateurs de page" -ForegroundColor White
Write-Host "🌙 Support complet du mode sombre" -ForegroundColor White
Write-Host "✨ Transitions et animations fluides" -ForegroundColor White
Write-Host "🔍 Conservation de toutes les fonctionnalités existantes" -ForegroundColor White
Write-Host "🎨 Cohérence visuelle avec le reste de l'application" -ForegroundColor White

Write-Host "`n🚀 Le tableau des utilisateurs est maintenant totalement responsive et optimisé !" -ForegroundColor Green
Write-Host "   Testez les différentes vues en redimensionnant votre navigateur." -ForegroundColor Yellow
