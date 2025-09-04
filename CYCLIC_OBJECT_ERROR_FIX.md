# Correction de l'erreur "cyclic object value" dans le module profil

## Problème identifié

L'erreur `Uncaught TypeError: cyclic object value` se produisait dans le module profil de l'utilisateur lors du changement de langue et du clic sur le bouton "Salvar". Cette erreur était causée par :

1. **Sérialisation JSON d'objets contenant des fonctions React** : Dans `UserConfigSettings.tsx`, les options du Select pour le thème incluaient des icônes React (fonctions) qui ne peuvent pas être sérialisées avec `JSON.stringify()`.

2. **Comparaison d'objets avec JSON.stringify()** : Dans `useUserConfig.ts`, la fonction `updateFormData` utilisait `JSON.stringify()` pour comparer les objets `formData`, ce qui échouait à cause des références circulaires.

## Solution implémentée

### 1. Remplacement de JSON.stringify() par une comparaison profonde personnalisée

**Fichier modifié :** `frontend/src/hooks/useUserConfig.ts`

- Ajout d'une fonction `deepEqual` qui ignore les propriétés non-sérialisables (fonctions, propriétés privées)
- Remplacement de la comparaison `JSON.stringify()` par `deepEqual()` dans `updateFormData`

```typescript
const deepEqual = useCallback((obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  if (typeof obj1 !== typeof obj2) return false;

  if (typeof obj1 === "object") {
    const keys1 = Object.keys(obj1).filter(
      (key) =>
        typeof obj1[key] !== "function" &&
        !key.startsWith("_") &&
        obj1[key] !== undefined
    );
    const keys2 = Object.keys(obj2).filter(
      (key) =>
        typeof obj2[key] !== "function" &&
        !key.startsWith("_") &&
        obj2[key] !== undefined
    );

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  return obj1 === obj2;
}, []);
```

### 2. Suppression des icônes des options du Select

**Fichier modifié :** `frontend/src/components/config/UserConfigSettings.tsx`

- Suppression de l'ajout d'icônes dans les options du Select pour le thème
- Les icônes sont maintenant gérées séparément et ne sont pas incluses dans `formData`

```typescript
// Avant (problématique)
options={THEME_OPTIONS.map(option => ({
  ...option,
  icon: getThemeIcon(option.value)  // Fonction React non-sérialisable
}))}

// Après (corrigé)
options={THEME_OPTIONS}
```

## Tests effectués

1. **Test d'accessibilité** : Vérification que le frontend et la page profil sont accessibles
2. **Test de sérialisation** : Vérification que `JSON.stringify()` fonctionne sans erreur
3. **Test de comparaison** : Vérification que la fonction `deepEqual` détecte correctement les changements

## Résultat

✅ L'erreur "cyclic object value" est maintenant résolue
✅ Le changement de langue dans le module profil fonctionne correctement
✅ Le bouton "Salvar" fonctionne sans erreur
✅ La détection des changements dans le formulaire fonctionne correctement

## Fichiers de test créés

- `test-profile-cyclic-fix.ps1` : Script de test d'accessibilité
- `test-language-change-fix.html` : Page de test interactive
- `test-language-change-fix.ps1` : Script pour ouvrir la page de test

## Impact

Cette correction améliore la stabilité du module profil et permet aux utilisateurs de changer de langue sans rencontrer d'erreurs JavaScript. La solution est robuste et évite les problèmes de sérialisation d'objets contenant des fonctions React.
