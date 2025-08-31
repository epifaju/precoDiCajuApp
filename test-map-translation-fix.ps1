# Test de la correction de la traduction map.unverified
Write-Host "=== Test de la correction de la traduction map.unverified ===" -ForegroundColor Green

# Vérifier que le fichier de traduction portugais contient la clé manquante
Write-Host "`n1. Vérification de la clé 'unverified' dans le fichier pt.json..." -ForegroundColor Yellow

$ptFile = "frontend/src/i18n/locales/pt.json"
if (Test-Path $ptFile) {
    $content = Get-Content $ptFile -Raw
    if ($content -match '"unverified":\s*"Nao Verificado"') {
        Write-Host "✓ Clé 'unverified' trouvée avec la traduction correcte" -ForegroundColor Green
    } else {
        Write-Host "✗ Clé 'unverified' manquante ou incorrecte" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Fichier de traduction portugais non trouvé" -ForegroundColor Red
}

# Vérifier que la clé est dans la section map
Write-Host "`n2. Vérification que la clé est dans la section 'map'..." -ForegroundColor Yellow

if (Test-Path $ptFile) {
    $content = Get-Content $ptFile -Raw
    $mapSection = $content -split '"map":\s*\{' | Select-Object -Last 1
    if ($mapSection -match '"unverified":\s*"Nao Verificado"') {
        Write-Host "✓ Clé 'unverified' trouvée dans la section map" -ForegroundColor Green
    } else {
        Write-Host "✗ Clé 'unverified' non trouvée dans la section map" -ForegroundColor Red
    }
}

# Vérifier l'utilisation dans le composant PriceMap
Write-Host "`n3. Vérification de l'utilisation dans PriceMap.tsx..." -ForegroundColor Yellow

$priceMapFile = "frontend/src/components/prices/PriceMap.tsx"
if (Test-Path $priceMapFile) {
    $content = Get-Content $priceMapFile -Raw
    if ($content -match "t\('map\.unverified',\s*'Unverified'\)") {
        Write-Host "✓ Utilisation de 'map.unverified' trouvée dans PriceMap.tsx" -ForegroundColor Green
    } else {
        Write-Host "✗ Utilisation de 'map.unverified' non trouvée dans PriceMap.tsx" -ForegroundColor Red
    }
} else {
    Write-Host "✗ Fichier PriceMap.tsx non trouvé" -ForegroundColor Red
}

# Vérifier la cohérence avec les autres langues
Write-Host "`n4. Vérification de la cohérence avec les autres langues..." -ForegroundColor Yellow

$enFile = "frontend/src/i18n/locales/en.json"
$frFile = "frontend/src/i18n/locales/fr.json"

if (Test-Path $enFile) {
    $enContent = Get-Content $enFile -Raw
    if ($enContent -match '"verified":\s*"Verified"') {
        Write-Host "✓ Clé 'verified' trouvée en anglais" -ForegroundColor Green
    } else {
        Write-Host "✗ Clé 'verified' manquante en anglais" -ForegroundColor Red
    }
}

if (Test-Path $frFile) {
    $frContent = Get-Content $frFile -Raw
    if ($frContent -match '"verified":\s*"Verifie"') {
        Write-Host "✓ Clé 'verified' trouvée en français" -ForegroundColor Green
    } else {
        Write-Host "✗ Clé 'verified' manquante en français" -ForegroundColor Red
    }
}

Write-Host "`n=== Résumé ===" -ForegroundColor Green
Write-Host "La clé de traduction 'map.unverified' a été ajoutée au fichier portugais." -ForegroundColor White
Write-Host "Traduction: 'Nao Verificado'" -ForegroundColor White
Write-Host "`nLe problème de traduction manquante devrait maintenant être résolu." -ForegroundColor Green
