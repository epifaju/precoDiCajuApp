# Guide de Correction - Statuts Expirés

## 🚨 Problème Confirmé

Tous les exportateurs affichent le badge "Expiré" avec l'icône de triangle d'attention :

```html
<span
  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800"
>
  <svg>...</svg>Expiré
</span>
```

## 🔍 Cause Identifiée

- **Date actuelle** : 28 septembre 2025
- **Dates d'expiration** : janvier-février 2025
- **Résultat** : Toutes les certifications sont expirées depuis 7-8 mois

## ✅ Solution Immédiate

### Étape 1 : Exécuter le script SQL

Ouvrez votre base de données PostgreSQL et exécutez le script `fix-exportateur-dates.sql` :

```sql
-- Mettre à jour toutes les dates d'expiration pour 2026
UPDATE exportateurs
SET date_expiration = '2026-01-15'
WHERE date_expiration < CURRENT_DATE;
```

### Étape 2 : Vérifier la correction

Relancez le script de test :

```powershell
.\test-status-fix.ps1
```

### Étape 3 : Vérifier dans l'interface

Après la correction, les exportateurs devraient afficher :

- ✅ Badge vert "Actif" au lieu du badge orange "Expiré"
- ✅ Pas d'icône de triangle d'attention
- ✅ Statut correct dans l'interface

## 📊 Résultats Attendus

### Avant Correction

```json
{
  "nom": "Acheteur Local Bafatá",
  "statut": "ACTIF",
  "dateExpiration": "2025-01-15",
  "actif": false, // ❌ Incorrect
  "expire": true, // ❌ Incorrect
  "suspendu": false
}
```

### Après Correction

```json
{
  "nom": "Acheteur Local Bafatá",
  "statut": "ACTIF",
  "dateExpiration": "2026-01-15",
  "actif": true, // ✅ Correct
  "expire": false, // ✅ Correct
  "suspendu": false
}
```

## 🎯 Interface Utilisateur

### Avant

```html
<!-- Badge orange "Expiré" avec icône warning -->
<span class="bg-orange-100 text-orange-800"> <svg>...</svg>Expiré </span>
```

### Après

```html
<!-- Badge vert "Actif" sans icône warning -->
<span class="bg-green-100 text-green-800"> Actif </span>
```

## 🔧 Alternative Rapide (Pour les tests)

Si vous ne pouvez pas accéder à la base de données, vous pouvez temporairement modifier la logique dans `Exportateur.java` :

```java
// Modification temporaire pour les tests uniquement
public boolean isActif() {
    return StatutType.ACTIF.equals(this.statut);
    // Ignorer la date d'expiration pour les tests
}
```

⚠️ **Attention** : Cette modification ne doit être utilisée que pour les tests, pas en production.

## 📝 Résumé

1. **Problème** : Dates d'expiration dans le passé (janvier-février 2025)
2. **Solution** : Mettre à jour les dates pour 2026
3. **Résultat** : Badges "Actif" au lieu de "Expiré"
4. **Code** : Aucune modification nécessaire, la logique est correcte

**Le problème sera résolu dès que vous exécuterez le script SQL de mise à jour des dates d'expiration.** 🎯



