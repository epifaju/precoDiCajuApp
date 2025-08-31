# Test du Module Profile avec Traductions
# Ce script teste le module Profile pour vérifier que les traductions fonctionnent correctement

Write-Host "🧪 Test du Module Profile avec Traductions" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si l'application est en cours d'exécution
Write-Host "🔍 Vérification du statut de l'application..." -ForegroundColor Yellow

try {
    # Test de la page Profile
    Write-Host "📱 Test de la page Profile..." -ForegroundColor Yellow
    
    # URL de test (ajustez selon votre configuration)
    $profileUrl = "http://localhost:3000/profile"
    
    Write-Host "  URL de test: $profileUrl" -ForegroundColor White
    
    # Test de connectivité
    try {
        $response = Invoke-WebRequest -Uri $profileUrl -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "  ✓ Page accessible (HTTP $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Page non accessible: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  ℹ️  Assurez-vous que l'application frontend est démarrée sur le port 3000" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "  ✗ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Vérification des fichiers de traduction..." -ForegroundColor Yellow

# Vérifier l'existence des fichiers de traduction
$translationFiles = @(
    "frontend/src/i18n/locales/pt.json",
    "frontend/src/i18n/locales/fr.json", 
    "frontend/src/i18n/locales/en.json"
)

foreach ($file in $translationFiles) {
    if (Test-Path $file) {
        $lang = if ($file -match "pt\.json") { "🇵🇹 Portugais" } elseif ($file -match "fr\.json") { "🇫🇷 Français" } else { "🇬🇧 Anglais" }
        Write-Host "  ✓ $lang: $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Fichier manquant: $file" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔍 Vérification des clés de traduction Profile..." -ForegroundColor Yellow

# Clés à vérifier
$profileKeys = @(
    "profile.title",
    "profile.subtitle",
    "profile.stats.pricesSubmitted", 
    "profile.preferences.title",
    "profile.preferences.language",
    "profile.preferences.regions",
    "profile.preferences.theme"
)

# Vérifier chaque fichier de traduction
foreach ($file in $translationFiles) {
    if (Test-Path $file) {
        $lang = if ($file -match "pt\.json") { "🇵🇹 Portugais" } elseif ($file -match "fr\.json") { "🇫🇷 Français" } else { "🇬🇧 Anglais" }
        Write-Host "  $lang:" -ForegroundColor Yellow
        
        try {
            $content = Get-Content $file -Raw | ConvertFrom-Json -ErrorAction Stop
            
            foreach ($key in $profileKeys) {
                $keyParts = $key.Split('.')
                $current = $content
                $found = $true
                
                foreach ($part in $keyParts) {
                    if ($current.PSObject.Properties.Name -contains $part) {
                        $current = $current.$part
                    } else {
                        $found = $false
                        break
                    }
                }
                
                if ($found) {
                    Write-Host "    ✓ $key -> $current" -ForegroundColor Green
                } else {
                    Write-Host "    ✗ $key -> MANQUANTE" -ForegroundColor Red
                }
            }
        } catch {
            Write-Host "    ✗ Erreur lors de la lecture du fichier: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        Write-Host ""
    }
}

Write-Host "📊 Vérification du composant ProfilePage..." -ForegroundColor Yellow

# Vérifier le composant ProfilePage
$profilePageFile = "frontend/src/pages/ProfilePage.tsx"
if (Test-Path $profilePageFile) {
    Write-Host "  ✓ Composant ProfilePage trouvé: $profilePageFile" -ForegroundColor Green
    
    try {
        $content = Get-Content $profilePageFile -Raw
        
        # Vérifier l'utilisation des clés de traduction
        foreach ($key in $profileKeys) {
            if ($content -match [regex]::Escape("t('$key')")) {
                Write-Host "    ✓ Utilisation de $key détectée" -ForegroundColor Green
            } else {
                Write-Host "    ⚠️  Utilisation de $key non détectée" -ForegroundColor Yellow
            }
        }
        
        # Vérifier l'import de useTranslation
        if ($content -match "useTranslation") {
            Write-Host "    ✓ Hook useTranslation importé" -ForegroundColor Green
        } else {
            Write-Host "    ✗ Hook useTranslation non importé" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "    ✗ Erreur lors de la lecture du composant: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "  ✗ Composant ProfilePage non trouvé: $profilePageFile" -ForegroundColor Red
}

Write-Host ""
Write-Host "🚀 Instructions pour tester manuellement:" -ForegroundColor Cyan
Write-Host "1. Démarrez l'application frontend: npm start" -ForegroundColor White
Write-Host "2. Naviguez vers la page Profile: /profile" -ForegroundColor White
Write-Host "3. Changez la langue dans l'interface" -ForegroundColor White
Write-Host "4. Vérifiez que tous les textes sont traduits" -ForegroundColor White

Write-Host ""
Write-Host "✅ Test terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Résumé des actions effectuées:" -ForegroundColor Cyan
Write-Host "• Ajout de la section profile manquante dans le fichier pt.json" -ForegroundColor White
Write-Host "• Vérification de la cohérence des traductions dans les 3 langues" -ForegroundColor White
Write-Host "• Création de scripts de test pour valider les traductions" -ForegroundColor White
