# Implémentation de la fonctionnalité "Changer le mot de passe"

## Vue d'ensemble

La fonctionnalité "Changer le mot de passe" a été implémentée dans la section "Acções Rápidas" de la page profil "Gérer les informations du compte". Cette fonctionnalité permet aux utilisateurs de modifier leur mot de passe de manière sécurisée.

## Fichiers modifiés

### 1. `frontend/src/pages/ProfilePage.tsx`

- **Ligne 15** : Ajout de `logout` dans la destructuration de `useAuthStore()`
- **Ligne 377** : Connexion du bouton "Alterar palavra-passe" à l'état `isChangePasswordFormOpen`
- **Ligne 382** : Connexion du bouton de déconnexion à la fonction `logout()`

### 2. `frontend/src/components/profile/ChangePasswordForm.tsx`

- **Ligne 4** : Correction de l'import du store d'authentification (chemin relatif)

## Composants implémentés

### ChangePasswordForm

Le composant `ChangePasswordForm` est un modal complet qui inclut :

- **Champs de saisie** :

  - Mot de passe actuel
  - Nouveau mot de passe
  - Confirmation du nouveau mot de passe

- **Fonctionnalités** :

  - Affichage/masquage des mots de passe
  - Validation en temps réel
  - Gestion des erreurs
  - États de chargement
  - Messages de succès/erreur

- **Validation** :
  - Mot de passe actuel requis
  - Nouveau mot de passe minimum 6 caractères
  - Confirmation du mot de passe
  - Nouveau mot de passe différent de l'actuel

## Traductions

Toutes les traductions sont déjà implémentées dans les trois langues :

### Portugais (PT)

- `profile.actions.changePassword` : "Alterar palavra-passe"
- `profile.password.title` : "Alterar Palavra-passe"
- `profile.password.current` : "Palavra-passe Atual"
- `profile.password.new` : "Nova Palavra-passe"
- `profile.password.confirm` : "Confirmar Nova Palavra-passe"

### Français (FR)

- `profile.actions.changePassword` : "Changer le mot de passe"
- `profile.password.title` : "Changer le Mot de Passe"
- `profile.password.current` : "Mot de Passe Actuel"
- `profile.password.new` : "Nouveau Mot de Passe"
- `profile.password.confirm` : "Confirmer le Nouveau Mot de Passe"

### Anglais (EN)

- `profile.actions.changePassword` : "Change password"
- `profile.password.title` : "Change Password"
- `profile.password.current` : "Current Password"
- `profile.password.new` : "New Password"
- `profile.password.confirm` : "Confirm New Password"

## API Backend

L'endpoint de changement de mot de passe est déjà implémenté dans le backend :

```
POST /api/v1/users/me/change-password
```

**Headers requis** :

- `Content-Type: application/json`
- `Authorization: Bearer {accessToken}`

**Body** :

```json
{
  "currentPassword": "mot_de_passe_actuel",
  "newPassword": "nouveau_mot_de_passe",
  "confirmPassword": "confirmation_nouveau_mot_de_passe"
}
```

## Fonctionnalités de sécurité

1. **Validation côté client** : Vérification des champs avant envoi
2. **Validation côté serveur** : Vérification de l'ancien mot de passe
3. **Tokens d'authentification** : Utilisation du token Bearer pour l'autorisation
4. **Gestion des erreurs** : Messages d'erreur appropriés sans révéler d'informations sensibles

## Interface utilisateur

### Section "Acções Rápidas"

- Bouton "Alterar palavra-passe" avec icône de cadenas
- Bouton "Editar perfil" pour la modification du profil
- Bouton "Sair da conta" pour la déconnexion

### Modal de changement de mot de passe

- Design responsive et moderne
- Support des thèmes clair/sombre
- Indicateurs de chargement
- Messages de feedback clairs

## Tests

Pour tester la fonctionnalité :

1. **Démarrer l'application** :

   ```bash
   # Frontend
   cd frontend && npm run dev

   # Backend
   cd backend && mvn spring-boot:run
   ```

2. **Scénario de test** :

   - Se connecter avec un compte existant
   - Aller sur la page Profil
   - Cliquer sur "Alterar palavra-passe" dans la section Acções Rápidas
   - Remplir le formulaire avec :
     - Mot de passe actuel
     - Nouveau mot de passe (minimum 6 caractères)
     - Confirmation du nouveau mot de passe
   - Valider le changement
   - Vérifier le message de succès

3. **Test des traductions** :
   - Changer la langue dans les préférences
   - Vérifier que tous les textes sont traduits

## Gestion des erreurs

Le composant gère les erreurs suivantes :

- **Erreurs de validation** : Champs manquants, mots de passe trop courts, etc.
- **Erreurs d'API** : Mot de passe actuel incorrect, problèmes de serveur
- **Erreurs réseau** : Problèmes de connexion
- **Erreurs de sécurité** : Tokens expirés, accès non autorisé

## Améliorations futures possibles

1. **Force du mot de passe** : Indicateur de complexité du nouveau mot de passe
2. **Historique des mots de passe** : Empêcher la réutilisation des mots de passe récents
3. **Authentification à deux facteurs** : Demander un code de vérification supplémentaire
4. **Notifications** : Envoyer un email de confirmation lors du changement
5. **Audit** : Journaliser les tentatives de changement de mot de passe

## Conclusion

La fonctionnalité "Changer le mot de passe" est maintenant entièrement implémentée et fonctionnelle. Elle respecte les bonnes pratiques de sécurité et offre une expérience utilisateur intuitive avec un support multilingue complet.
