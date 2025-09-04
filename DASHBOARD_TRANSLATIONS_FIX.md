# Correction des Traductions du Dashboard

## Problème Identifié

Les erreurs suivantes étaient présentes dans la console du navigateur :

```
i18next::translator: missingKey pt translation dashboard.chartType Type de graphique
i18next::translator: missingKey pt translation dashboard.line Ligne
i18next::translator: missingKey pt translation dashboard.bar Barres
i18next::translator: missingKey pt translation dashboard.groupBy Grouper par
```

## Solution Appliquée

### 1. Ajout des Traductions Manquantes

Les clés de traduction suivantes ont été ajoutées dans `frontend/src/i18n/locales/pt.json` :

```json
"dashboard": {
  // ... autres traductions existantes ...
  "chartType": "Tipo de Gráfico",
  "line": "Linha",
  "bar": "Barras",
  "groupBy": "Agrupar por"
}
```

### 2. Correction des Clés Dupliquées

- Renommé la section `"dashboard"` dans `geolocation` en `"gpsDashboard"` pour éviter les conflits
- Supprimé les clés dupliquées `"validation"` et `"qualityScore"` dans la section `geolocation`

### 3. Localisation des Clés

Les clés sont utilisées dans `frontend/src/components/dashboard/Dashboard.tsx` :

- Ligne 283: `{t('dashboard.chartType', 'Type de graphique')}`
- Ligne 298: `{type === 'line' ? t('dashboard.line', 'Ligne') : t('dashboard.bar', 'Barres')}`
- Ligne 307: `{t('dashboard.groupBy', 'Grouper par')}`
- Ligne 346: `{t('dashboard.chartType', 'Type')}`
- Ligne 360: `{type === 'line' ? t('dashboard.line', 'Ligne') : t('dashboard.bar', 'Barres')}`
- Ligne 367: `{t('dashboard.groupBy', 'Grouper')}`

## Résultat

✅ Toutes les clés de traduction manquantes ont été ajoutées
✅ Les erreurs de clés dupliquées ont été corrigées
✅ Le fichier JSON est maintenant valide sans erreurs de linting
✅ Les traductions portugaises sont maintenant disponibles pour les contrôles de graphiques du dashboard

## Test

Un script de test `test-dashboard-translations.ps1` a été créé pour vérifier que les traductions fonctionnent correctement.

## Fichiers Modifiés

- `frontend/src/i18n/locales/pt.json` - Ajout des traductions manquantes et correction des duplications
