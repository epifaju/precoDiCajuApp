# Correction des Traductions du Menu Utilisateur

## Problème Identifié

Les textes "Configurações" et "Meu perfil" dans le module de présentation de l'utilisateur connecté restaient toujours en portugais, peu importe la langue sélectionnée.

## Cause du Problème

1. **Clés de traduction manquantes** : Les clés `user.profile` et `user.settings` n'existaient que dans le fichier de traduction portugais (`pt.json`)
2. **Clés dupliquées** : La clé `profile` existait à la fois dans `nav` et `user`, causant des conflits
3. **Textes par défaut en français** : Le composant `UserMenu.tsx` utilisait des textes par défaut en français

## Solution Appliquée

### 1. Ajout des Traductions Manquantes

**Fichier anglais (`en.json`)** :

```json
"user": {
  "menu": "User menu",
  "settings": "Settings",
  "logout": "Logout",
  "welcome": "Welcome",
  "connected": "Connected",
  "lastLogin": "Last login",
  "never": "Never",
  "role": {
    "admin": "Administrator",
    "moderator": "Moderator",
    "contributor": "Contributor"
  }
}
```

**Fichier français (`fr.json`)** :

```json
"user": {
  "menu": "Menu utilisateur",
  "settings": "Paramètres",
  "logout": "Se déconnecter",
  "welcome": "Bienvenue",
  "connected": "Connecté",
  "lastLogin": "Dernière connexion",
  "never": "Jamais",
  "role": {
    "admin": "Administrateur",
    "moderator": "Modérateur",
    "contributor": "Contributeur"
  }
}
```

### 2. Correction des Clés Dupliquées

- Supprimé la clé `profile` de la section `user` pour éviter les conflits
- Utilisé `nav.profile` dans le composant `UserMenu.tsx` au lieu de `user.profile`

### 3. Modification du Composant UserMenu

**Avant** :

```tsx
{
  t("user.profile", "Mon profil");
}
{
  t("user.settings", "Paramètres");
}
```

**Après** :

```tsx
{
  t("nav.profile", "Mon profil");
}
{
  t("user.settings", "Paramètres");
}
```

## Traductions Finales

| Langue        | nav.profile | user.settings   |
| ------------- | ----------- | --------------- |
| **Portugais** | "Perfil"    | "Configurações" |
| **Anglais**   | "Profile"   | "Settings"      |
| **Français**  | "Profil"    | "Paramètres"    |

## Résultat

✅ Les textes du menu utilisateur changent maintenant selon la langue sélectionnée
✅ Plus de conflits de clés dupliquées
✅ Toutes les langues supportées ont leurs traductions complètes
✅ Le composant UserMenu utilise les bonnes clés de traduction

## Test

Un script de test `test-user-menu-translations.ps1` a été créé pour vérifier que les traductions fonctionnent correctement dans toutes les langues.

## Fichiers Modifiés

- `frontend/src/i18n/locales/en.json` - Ajout de la section `user`
- `frontend/src/i18n/locales/fr.json` - Ajout de la section `user`
- `frontend/src/components/layout/UserMenu.tsx` - Correction de la clé `user.profile` → `nav.profile`
