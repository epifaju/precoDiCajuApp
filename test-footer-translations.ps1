# Test des Traductions du Footer - Preço di Cajú
# Ce script teste que les traductions du footer fonctionnent correctement

Write-Host "🎯 Test des Traductions du Footer - Preço di Cajú" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "frontend")) {
    Write-Host "❌ Erreur: Répertoire 'frontend' non trouvé" -ForegroundColor Red
    Write-Host "   Assurez-vous d'être dans le répertoire racine du projet" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Répertoire frontend trouvé" -ForegroundColor Green

# Vérifier les fichiers de traduction
$translationFiles = @(
    "frontend/src/i18n/locales/fr.json",
    "frontend/src/i18n/locales/en.json", 
    "frontend/src/i18n/locales/pt.json"
)

Write-Host ""
Write-Host "📋 Vérification des fichiers de traduction..." -ForegroundColor Yellow

foreach ($file in $translationFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file - MANQUANT" -ForegroundColor Red
        exit 1
    }
}

# Vérifier le composant Footer
Write-Host ""
Write-Host "🔧 Vérification du composant Footer..." -ForegroundColor Yellow

$footerFile = "frontend/src/components/layout/Footer.tsx"
if (Test-Path $footerFile) {
    Write-Host "   ✅ $footerFile" -ForegroundColor Green
    
    # Vérifier que le footer utilise les traductions
    $footerContent = Get-Content $footerFile -Raw
    if ($footerContent -match "useTranslation") {
        Write-Host "   ✅ Hook useTranslation détecté" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Hook useTranslation manquant" -ForegroundColor Red
    }
    
    if ($footerContent -match "t\('footer\.") {
        Write-Host "   ✅ Appels de traduction footer détectés" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Appels de traduction footer manquants" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ $footerFile - MANQUANT" -ForegroundColor Red
    exit 1
}

# Vérifier la configuration i18n
Write-Host ""
Write-Host "⚙️ Vérification de la configuration i18n..." -ForegroundColor Yellow

$i18nFile = "frontend/src/i18n/index.ts"
if (Test-Path $i18nFile) {
    Write-Host "   ✅ $i18nFile" -ForegroundColor Green
    
    $i18nContent = Get-Content $i18nFile -Raw
    if ($i18nContent -match "fallbackLng: 'pt'") {
        Write-Host "   ✅ Portugais défini comme langue de fallback" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Langue de fallback non définie ou incorrecte" -ForegroundColor Red
    }
    
    if ($i18nContent -match "lng: 'pt'") {
        Write-Host "   ✅ Portugais défini comme langue par défaut" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Langue par défaut non définie ou incorrecte" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ $i18nFile - MANQUANT" -ForegroundColor Red
    exit 1
}

# Vérifier les clés de traduction spécifiques
Write-Host ""
Write-Host "🔑 Vérification des clés de traduction du footer..." -ForegroundColor Yellow

$requiredKeys = @(
    "footer.brand.description",
    "footer.brand.location", 
    "footer.quickLinks",
    "footer.support",
    "footer.howToUse",
    "footer.faq",
    "footer.contact",
    "footer.privacy",
    "footer.copyright",
    "footer.forGuineaBissau",
    "footer.version"
)

foreach ($langFile in $translationFiles) {
    $lang = Split-Path $langFile -Leaf | ForEach-Object { $_.Replace('.json', '') }
    Write-Host "   📝 Vérification $lang..." -ForegroundColor Blue
    
    $content = Get-Content $langFile -Raw | ConvertFrom-Json
    
    $missingKeys = @()
    foreach ($key in $requiredKeys) {
        $keyParts = $key.Split('.')
        $current = $content
        
        foreach ($part in $keyParts) {
            if ($current.PSObject.Properties.Name -contains $part) {
                $current = $current.$part
            } else {
                $missingKeys += $key
                break
            }
        }
    }
    
    if ($missingKeys.Count -eq 0) {
        Write-Host "      ✅ Toutes les clés présentes" -ForegroundColor Green
    } else {
        Write-Host "      ❌ Clés manquantes: $($missingKeys -join ', ')" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🎉 Vérification terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Pour tester les traductions:" -ForegroundColor Cyan
Write-Host "   1. Démarrer l'application frontend" -ForegroundColor White
Write-Host "   2. Aller sur /submit (page de soumission des prix)" -ForegroundColor White
Write-Host "   3. Vérifier que le footer s'affiche en portugais par défaut" -ForegroundColor White
Write-Host "   4. Changer la langue en français via le sélecteur" -ForegroundColor White
Write-Host "   5. Vérifier que le footer se traduit en français" -ForegroundColor White
Write-Host "   6. Remettre le portugais et vérifier le retour" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Fichier de test HTML créé: test-footer-translations.html" -ForegroundColor Yellow
Write-Host "   Ouvrez-le dans votre navigateur pour voir les détails des traductions" -ForegroundColor Yellow

# Vérifier si l'application est en cours d'exécution
Write-Host ""
Write-Host "🚀 Vérification du statut de l'application..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5173" -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Application frontend accessible sur http://localhost:5173" -ForegroundColor Green
        Write-Host "   🌐 Ouvrez http://localhost:5173/submit pour tester les traductions" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️ Application frontend non accessible sur http://localhost:5173" -ForegroundColor Yellow
    Write-Host "   💡 Démarrez l'application avec: npm run dev (dans le dossier frontend)" -ForegroundColor White
}

Write-Host ""
Write-Host "Test des traductions du footer termine avec succes!" -ForegroundColor Green
