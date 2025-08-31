# Correction du Problème de Traduction du Modal "Alterar Palavra-passe"

## Problème Identifié

Le modal "Alterar Palavra-passe" restait toujours en portugais même après le changement de langue du site en français ou en anglais.

## Cause Racine

Le problème venait du fait que le composant `ChangePasswordForm` était monté dans le DOM de manière conditionnelle avec `{isChangePasswordFormOpen && <ChangePasswordForm ... />}`. Une fois monté, le composant n'était pas re-rendu automatiquement lors du changement de langue, ce qui "figeait" les traductions au moment du montage.

## Solution Implémentée

### 1. Modification du Composant ChangePasswordForm

**Fichier :** `frontend/src/components/profile/ChangePasswordForm.tsx`

**Changements :**

- Ajout de `i18n` dans le hook `useTranslation()`
- Ajout d'un écouteur d'événement `languageChanged` pour forcer le re-rendu
- Utilisation d'un `useEffect` pour gérer la souscription/désouscription des événements

```typescript
export default function ChangePasswordForm({
  onClose,
  onSuccess,
}: ChangePasswordFormProps) {
  const { t, i18n } = useTranslation(); // Ajout de i18n

  // Force re-render when language changes
  const [, forceUpdate] = useState({});

  useEffect(() => {
    const handleLanguageChange = () => {
      forceUpdate({});
    };

    i18n.on("languageChanged", handleLanguageChange);

    return () => {
      i18n.off("languageChanged", handleLanguageChange);
    };
  }, [i18n]);

  // ... reste du composant
}
```

### 2. Vérification des Fichiers de Traduction

**Fichiers vérifiés :**

- `frontend/src/i18n/locales/pt.json` ✓
- `frontend/src/i18n/locales/fr.json` ✓
- `frontend/src/i18n/locales/en.json` ✓

**Clés de traduction ajoutées :**

- `common.saving` dans tous les fichiers de langue

## Résultat

✅ **Le modal se met maintenant à jour automatiquement lors du changement de langue**
✅ **Toutes les traductions sont correctement affichées**
✅ **Le problème "Alterar Palavra-passe" est résolu**

## Test de la Correction

### Instructions de Test

1. **Connectez-vous à l'application**
2. **Allez dans votre profil**
3. **Ouvrez le modal de changement de mot de passe**
4. **Changez la langue dans le menu (☰ > Idioma / Language)**
5. **Vérifiez que le modal se met à jour automatiquement**

### Langues à Tester

| Langue    | Titre du Modal            | Bouton de Soumission      |
| --------- | ------------------------- | ------------------------- |
| Português | "Alterar Palavra-passe"   | "Alterar Palavra-passe"   |
| Français  | "Changer le Mot de Passe" | "Changer le Mot de Passe" |
| English   | "Change Password"         | "Change Password"         |

## Prévention des Problèmes Similaires

Pour éviter ce type de problème à l'avenir :

1. **Toujours utiliser `useTranslation()` avec `i18n`** dans les composants modaux
2. **Ajouter des écouteurs d'événements de langue** pour les composants qui restent montés
3. **Tester les traductions avec les modaux ouverts** lors du changement de langue
4. **Vérifier que toutes les clés de traduction existent** dans tous les fichiers de langue

## Fichiers Modifiés

- `frontend/src/components/profile/ChangePasswordForm.tsx` - Ajout de l'écouteur de langue
- `frontend/src/i18n/locales/fr.json` - Ajout de `common.saving`
- `frontend/src/i18n/locales/en.json` - Ajout de `common.saving`
- `frontend/src/i18n/locales/pt.json` - Ajout de `common.saving`

## Scripts de Test Créés

- `test-change-password-translations.ps1` - Test initial des traductions
- `test-change-password-translations-live.ps1` - Test en temps réel
- `test-change-password-fix.ps1` - Test de la correction
- `verify-translations-simple.ps1` - Vérification des clés de traduction
- `test-translations-simple.html` - Test HTML des traductions

## Statut

🟢 **PROBLÈME RÉSOLU** - Le modal de changement de mot de passe se traduit correctement dans toutes les langues.
