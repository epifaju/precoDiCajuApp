# Correction de l'erreur 400 - Endpoint Configuration Utilisateur

## Problème identifié

L'erreur 400 "Données d'entrée invalides" lors de la mise à jour de la configuration utilisateur (`PUT /api/v1/users/me/config`) était causée par des annotations de validation Bean Validation trop strictes qui s'appliquaient même quand les champs étaient `null`.

## Corrections apportées

### 1. Backend - Suppression des validations Bean Validation problématiques

**Fichier modifié :** `backend/src/main/java/gw/precaju/dto/request/UpdateUserConfigRequest.java`

- Supprimé les annotations `@Size` et `@Pattern` des champs `fullName` et `phone`
- Supprimé les annotations de validation des classes internes `UserPreferencesRequest` et `NotificationPreferencesRequest`
- Les champs sont maintenant optionnels et ne sont validés que s'ils sont présents

### 2. Backend - Ajout de validation manuelle dans le service

**Fichier modifié :** `backend/src/main/java/gw/precaju/service/UserService.java`

- Ajouté la méthode `validateAndUpdateUserPreferences()` pour valider les préférences utilisateur
- Ajouté la méthode `validateAndUpdateUserNotificationPreferences()` pour valider les préférences de notification
- Validation manuelle des champs avec des messages d'erreur clairs
- Les validations ne s'appliquent que si les champs ne sont pas `null`

### 3. Backend - Amélioration de la gestion d'erreurs

**Fichier modifié :** `backend/src/main/java/gw/precaju/controller/UserController.java`

- Modifié le type de retour de `ResponseEntity<UserConfigDTO>` à `ResponseEntity<?>`
- Ajouté une gestion d'erreurs détaillée qui retourne des informations spécifiques sur l'erreur
- Ajouté les imports nécessaires (`Map`, `HashMap`, `Instant`)

### 4. Frontend - Amélioration de la gestion d'erreurs

**Fichier modifié :** `frontend/src/services/userConfigService.ts`

- Amélioré la méthode `handleError()` pour mieux gérer les erreurs API
- Ajouté la gestion des erreurs `isApiError` pour une meilleure extraction des détails d'erreur

**Fichier modifié :** `frontend/src/hooks/useUserConfig.ts`

- Amélioré la construction de la requête `UpdateUserConfigRequest`
- Ajouté des valeurs par défaut pour éviter les champs `null` problématiques
- Amélioré les logs de débogage

## Structure des données corrigée

### Avant (problématique)

```json
{
  "fullName": null,
  "phone": null,
  "preferences": {
    "language": "pt",
    "theme": "system"
    // ... autres champs
  },
  "notificationPreferences": {
    "priceAlerts": true
    // ... autres champs
  }
}
```

### Après (corrigé)

```json
{
  "fullName": "Test User",
  "phone": "+245123456789",
  "preferences": {
    "language": "pt",
    "theme": "system",
    "preferredRegions": [],
    "timezone": "Africa/Bissau",
    "offlineMode": false,
    "autoSync": true
  },
  "notificationPreferences": {
    "priceAlerts": true,
    "verificationNotifications": true,
    "systemNotifications": true,
    "emailNotifications": false,
    "pushNotifications": true,
    "alertThreshold": 10,
    "alertRegions": [],
    "alertQualities": [],
    "frequency": "immediate",
    "quietHours": false,
    "quietStartTime": "22:00",
    "quietEndTime": "08:00"
  }
}
```

## Validations maintenues

Les validations suivantes sont maintenant effectuées manuellement dans le service :

### Informations de profil

- `fullName` : 2-100 caractères (si présent)
- `phone` : format `+?[0-9]{8,15}` (si présent)

### Préférences utilisateur

- `language` : doit être `pt`, `fr`, ou `en` (si présent)
- `theme` : doit être `light`, `dark`, ou `system` (si présent)
- `timezone` : format valide de timezone (si présent)

### Préférences de notification

- `alertThreshold` : 1-100% (si présent)
- `frequency` : `immediate`, `daily`, ou `weekly` (si présent)
- `quietStartTime` et `quietEndTime` : format HH:MM (si présents)

## Tests

Pour tester la correction :

1. Démarrer le backend : `cd backend && mvn spring-boot:run`
2. Démarrer le frontend : `cd frontend && npm run dev`
3. Accéder à l'interface de configuration utilisateur
4. Modifier les paramètres et sauvegarder
5. Vérifier que l'erreur 400 n'apparaît plus

## Fichiers de test créés

- `test-config-endpoint.ps1` : Test de l'endpoint avec des données complètes
- `test-validation-debug.ps1` : Test avec des données minimales
- `test-config-fix.ps1` : Test final de la correction

## Résultat attendu

L'endpoint `PUT /api/v1/users/me/config` devrait maintenant :

- Accepter les requêtes avec des champs optionnels
- Valider correctement les données présentes
- Retourner des erreurs détaillées en cas de problème
- Fonctionner correctement avec l'interface frontend
