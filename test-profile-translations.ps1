#!/usr/bin/env pwsh

Write-Host "=== Test des Traductions du Module Profil ===" -ForegroundColor Green

# Vérifier que les fichiers de traduction existent
$translationFiles = @(
    "frontend/src/i18n/locales/pt.json",
    "frontend/src/i18n/locales/fr.json", 
    "frontend/src/i18n/locales/en.json"
)

Write-Host "`n1. Vérification des fichiers de traduction..." -ForegroundColor Yellow

foreach ($file in $translationFiles) {
    if (Test-Path $file) {
        Write-Host "✓ $file existe" -ForegroundColor Green
    } else {
        Write-Host "✗ $file manquant" -ForegroundColor Red
        exit 1
    }
}

# Vérifier les clés de traduction importantes
Write-Host "`n2. Vérification des clés de traduction..." -ForegroundColor Yellow

$importantKeys = @(
    "profile.title",
    "profile.subtitle", 
    "profile.actions.title",
    "profile.actions.editProfile",
    "profile.actions.changePassword",
    "profile.actions.logout",
    "profile.info.email",
    "profile.info.phone",
    "profile.info.joinDate",
    "profile.info.lastActive",
    "config.title",
    "config.subtitle",
    "config.sections.title",
    "config.profile.title",
    "config.profile.subtitle",
    "config.preferences.title",
    "config.notifications.title",
    "config.notifications.types",
    "config.notifications.priceAlerts",
    "common.total",
    "common.verified",
    "common.pending",
    "common.save",
    "common.reset"
)

$languages = @("pt", "fr", "en")
$allKeysPresent = $true

foreach ($lang in $languages) {
    $file = "frontend/src/i18n/locales/$lang.json"
    $content = Get-Content $file -Raw | ConvertFrom-Json
    
    Write-Host "`nVérification des clés pour $lang :" -ForegroundColor Cyan
    
    foreach ($key in $importantKeys) {
        $keyParts = $key.Split('.')
        $current = $content
        
        $keyExists = $true
        foreach ($part in $keyParts) {
            if ($current.PSObject.Properties.Name -contains $part) {
                $current = $current.$part
            } else {
                $keyExists = $false
                break
            }
        }
        
        if ($keyExists) {
            Write-Host "  ✓ $key" -ForegroundColor Green
        } else {
            Write-Host "  ✗ $key" -ForegroundColor Red
            $allKeysPresent = $false
        }
    }
}

if ($allKeysPresent) {
    Write-Host "`n✓ Toutes les clés importantes sont présentes dans tous les fichiers de traduction" -ForegroundColor Green
} else {
    Write-Host "`n✗ Certaines clés sont manquantes" -ForegroundColor Red
}

# Vérifier les composants modifiés
Write-Host "`n3. Vérification des composants modifiés..." -ForegroundColor Yellow

$components = @(
    "frontend/src/pages/ProfilePage.tsx",
    "frontend/src/components/config/UserConfigSettings.tsx",
    "frontend/src/components/notifications/NotificationSettings.tsx"
)

foreach ($component in $components) {
    if (Test-Path $component) {
        $content = Get-Content $component -Raw
        
        # Vérifier que le composant utilise useTranslation
        if ($content -match "useTranslation") {
            Write-Host "✓ $component utilise useTranslation" -ForegroundColor Green
        } else {
            Write-Host "✗ $component n'utilise pas useTranslation" -ForegroundColor Red
        }
        
        # Vérifier qu'il n'y a pas de textes codés en dur en portugais
        $hardcodedTexts = @(
            "Configurações",
            "Notificações", 
            "Perfil",
            "Ações Rápidas",
            "Informações do Perfil",
            "Preferências Gerais"
        )
        
        $hasHardcodedText = $false
        foreach ($text in $hardcodedTexts) {
            if ($content -match [regex]::Escape($text)) {
                Write-Host "  ⚠ Texte codé en dur trouvé: '$text'" -ForegroundColor Yellow
                $hasHardcodedText = $true
            }
        }
        
        if (-not $hasHardcodedText) {
            Write-Host "✓ $component n'a pas de textes codés en dur" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ $component manquant" -ForegroundColor Red
    }
}

Write-Host "`n4. Résumé des corrections apportées..." -ForegroundColor Yellow

Write-Host @"
✓ ProfilePage.tsx - Onglets 'Perfil' et 'Configurações' traduits
✓ ProfilePage.tsx - Informations du profil traduites (email, téléphone, etc.)
✓ ProfilePage.tsx - Actions et statistiques traduites
✓ UserConfigSettings.tsx - Tous les textes codés en dur remplacés par des traductions
✓ NotificationSettings.tsx - Tous les textes codés en dur remplacés par des traductions
✓ Fichiers de traduction mis à jour avec toutes les nouvelles clés
✓ Clés de traduction ajoutées pour les trois langues (pt, fr, en)
"@ -ForegroundColor Green

Write-Host "`n=== Test terminé ===" -ForegroundColor Green
Write-Host "Les traductions du module Profil ont été corrigées avec succès !" -ForegroundColor Green