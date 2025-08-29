# 🛡️ Fonctionnalité d'Administration des Utilisateurs

## 📋 Vue d'ensemble

La fonctionnalité d'administration des utilisateurs permet aux administrateurs de la plateforme Preço di Caju de gérer complètement tous les utilisateurs du système. Cette fonctionnalité est accessible uniquement aux utilisateurs ayant le rôle `ADMIN`.

## 🔐 Sécurité et Permissions

### Rôles et Accès

- **ADMIN** : Accès complet à toutes les fonctionnalités d'administration
- **MODERATOR** : Accès limité (lecture seule des utilisateurs)
- **CONTRIBUTOR** : Aucun accès à l'administration

### Protection des Endpoints

Tous les endpoints d'administration sont protégés par l'annotation `@PreAuthorize("hasRole('ADMIN')")` et nécessitent un token JWT valide.

## 🏗️ Architecture Backend

### Contrôleur Principal

- **Fichier** : `AdminController.java`
- **Package** : `gw.precaju.controller`
- **Base URL** : `/api/v1/admin/users`

### Endpoints Disponibles

#### 1. Récupération des Utilisateurs

```http
GET /api/v1/admin/users
```

**Paramètres de requête :**

- `page` : Numéro de page (défaut: 0)
- `size` : Taille de page (défaut: 20, max: 100)
- `sortBy` : Champ de tri (défaut: createdAt)
- `sortDir` : Direction du tri (asc/desc, défaut: desc)
- `role` : Filtre par rôle (ADMIN, MODERATOR, CONTRIBUTOR)
- `active` : Filtre par statut actif (true/false)
- `emailVerified` : Filtre par vérification email (true/false)
- `search` : Recherche textuelle (email ou nom)

**Réponse :**

```json
{
  "content": [
    {
      "id": "uuid",
      "email": "user@example.com",
      "fullName": "Nom Utilisateur",
      "phone": "+245123456789",
      "role": "CONTRIBUTOR",
      "reputationScore": 50,
      "preferredRegions": ["BF", "GA"],
      "emailVerified": true,
      "active": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "lastLoginAt": "2024-01-15T10:30:00.000Z"
    }
  ],
  "number": 0,
  "size": 20,
  "totalElements": 150,
  "totalPages": 8
}
```

#### 2. Récupération d'un Utilisateur

```http
GET /api/v1/admin/users/{id}
```

#### 3. Création d'un Utilisateur

```http
POST /api/v1/admin/users
```

**Corps de la requête :**

```json
{
  "email": "nouveau@example.com",
  "password": "motdepasse123",
  "fullName": "Nouvel Utilisateur",
  "phone": "+245123456789",
  "role": "CONTRIBUTOR",
  "emailVerified": false,
  "active": true
}
```

#### 4. Modification d'un Utilisateur

```http
PUT /api/v1/admin/users/{id}
```

**Corps de la requête :**

```json
{
  "fullName": "Nom Modifié",
  "phone": "+245987654321",
  "role": "MODERATOR",
  "reputationScore": 75,
  "emailVerified": true,
  "active": true
}
```

#### 5. Désactivation d'un Utilisateur

```http
DELETE /api/v1/admin/users/{id}
```

#### 6. Réactivation d'un Utilisateur

```http
POST /api/v1/admin/users/{id}/activate
```

#### 7. Changement de Mot de Passe

```http
POST /api/v1/admin/users/{id}/change-password
```

**Corps de la requête :**

```json
{
  "newPassword": "nouveaumotdepasse123"
}
```

#### 8. Statistiques des Utilisateurs

```http
GET /api/v1/admin/users/stats
```

**Réponse :**

```json
{
  "totalUsers": 150,
  "activeUsers": 142,
  "adminUsers": 3,
  "moderatorUsers": 12,
  "contributorUsers": 135
}
```

## 🎨 Interface Frontend

### Page d'Administration

- **Route** : `/admin`
- **Fichier** : `AdminPage.tsx`
- **Accès** : Uniquement pour les utilisateurs ADMIN

### Fonctionnalités de l'Interface

#### 1. Tableau de Bord des Statistiques

- Nombre total d'utilisateurs
- Utilisateurs actifs
- Répartition par rôle (Admin, Modérateur, Contributeur)

#### 2. Filtres et Recherche

- Recherche textuelle (email, nom)
- Filtre par rôle
- Filtre par statut (actif/inactif)
- Filtre par vérification email

#### 3. Gestion des Utilisateurs

- **Création** : Modal avec formulaire complet
- **Modification** : Modal d'édition des informations
- **Changement de mot de passe** : Modal sécurisé
- **Activation/Désactivation** : Boutons d'action rapide

#### 4. Tableau des Utilisateurs

- Informations complètes (nom, email, rôle, statut, réputation)
- Actions contextuelles pour chaque utilisateur
- Pagination avec navigation
- Tri par colonnes

#### 5. Modals Interactifs

- **Création** : Formulaire de création avec validation
- **Édition** : Formulaire de modification pré-rempli
- **Mot de passe** : Changement sécurisé du mot de passe

## 🔧 Composants Techniques

### DTOs et Modèles

- `CreateUserRequest` : Création d'utilisateur
- `AdminUpdateUserRequest` : Modification d'utilisateur
- `UserDTO` : Représentation des données utilisateur
- `UserStatsDTO` : Statistiques des utilisateurs

### Services et Repositories

- `UserService` : Logique métier étendue
- `UserRepository` : Requêtes optimisées avec filtres
- `AdminController` : Gestion des endpoints d'administration

### Sécurité

- Validation des rôles avec Spring Security
- Protection CSRF
- Validation des données d'entrée
- Gestion des erreurs sécurisée

## 📱 Responsive Design

L'interface d'administration est entièrement responsive et s'adapte à tous les écrans :

- **Desktop** : Navigation complète avec tous les filtres
- **Tablet** : Interface adaptée avec filtres empilés
- **Mobile** : Navigation mobile avec menu hamburger

## 🌐 Internationalisation

Support complet des langues :

- **Français** : Interface principale
- **Portuguais** : Support local
- **Anglais** : Support international

## 🧪 Tests et Validation

### Script de Test

- **Fichier** : `test-admin-features.ps1`
- **Fonctionnalités testées** :
  - Connexion admin
  - CRUD complet des utilisateurs
  - Filtres et pagination
  - Gestion des mots de passe
  - Activation/désactivation

### Validation des Données

- Validation des emails
- Validation des mots de passe (longueur, complexité)
- Validation des numéros de téléphone
- Validation des rôles et permissions

## 🚀 Déploiement et Configuration

### Prérequis

1. Base de données avec schéma utilisateurs
2. Utilisateur admin existant
3. Configuration Spring Security
4. Frontend avec composants UI

### Configuration

```yaml
# application.yml
spring:
  security:
    admin:
      enabled: true
      max-page-size: 100
      default-page-size: 20
```

### Variables d'Environnement

```bash
ADMIN_FEATURE_ENABLED=true
ADMIN_MAX_PAGE_SIZE=100
ADMIN_DEFAULT_PAGE_SIZE=20
```

## 📊 Métriques et Monitoring

### Logs d'Administration

- Création d'utilisateurs
- Modifications de rôles
- Changements de statut
- Tentatives d'accès non autorisées

### Métriques de Performance

- Temps de réponse des endpoints
- Nombre de requêtes par minute
- Utilisation de la mémoire
- Performance des requêtes de base de données

## 🔒 Bonnes Pratiques de Sécurité

### 1. Validation des Entrées

- Sanitisation des données
- Validation des formats
- Protection contre l'injection SQL

### 2. Gestion des Sessions

- Tokens JWT sécurisés
- Expiration automatique
- Rotation des clés

### 3. Audit et Traçabilité

- Logs de toutes les actions
- Horodatage des modifications
- Identification des utilisateurs

### 4. Limitation des Accès

- Vérification des rôles
- Validation des permissions
- Protection contre l'élévation de privilèges

## 🐛 Dépannage

### Problèmes Courants

#### 1. Accès Refusé

- Vérifier le rôle de l'utilisateur
- Vérifier la validité du token JWT
- Vérifier les permissions Spring Security

#### 2. Erreurs de Validation

- Vérifier le format des données
- Vérifier les contraintes de base de données
- Vérifier les annotations de validation

#### 3. Problèmes de Performance

- Vérifier les index de base de données
- Vérifier la pagination
- Vérifier les requêtes N+1

### Solutions Recommandées

#### 1. Logs Détaillés

```java
@Slf4j
public class AdminController {
    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        log.info("Récupération des utilisateurs avec filtres: {}", filters);
        // ... implementation
    }
}
```

#### 2. Gestion d'Erreurs

```java
@ExceptionHandler(AdminAccessDeniedException.class)
public ResponseEntity<ErrorResponse> handleAdminAccessDenied(AdminAccessDeniedException ex) {
    log.error("Accès refusé à l'administration: {}", ex.getMessage());
    return ResponseEntity.status(HttpStatus.FORBIDDEN)
        .body(new ErrorResponse("Accès refusé", ex.getMessage()));
}
```

## 🔮 Évolutions Futures

### Fonctionnalités Planifiées

1. **Gestion des Groupes** : Création et gestion de groupes d'utilisateurs
2. **Audit Avancé** : Historique détaillé des modifications
3. **Notifications** : Alertes automatiques pour les actions importantes
4. **Import/Export** : Import en masse d'utilisateurs
5. **Workflows** : Processus d'approbation pour les changements critiques

### Améliorations Techniques

1. **Cache Redis** : Mise en cache des statistiques
2. **API GraphQL** : Interface de requête plus flexible
3. **Webhooks** : Notifications en temps réel
4. **Analytics** : Tableaux de bord avancés

## 📚 Ressources et Références

### Documentation Technique

- [Spring Security Documentation](https://docs.spring.io/spring-security/reference/)
- [Spring Data JPA](https://docs.spring.io/spring-data/jpa/docs/current/reference/html/)
- [React Admin Documentation](https://marmelab.com/react-admin/)

### Standards de Sécurité

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework)
- [ISO 27001](https://www.iso.org/isoiec-27001-information-security.html)

---

## 🎯 Conclusion

La fonctionnalité d'administration des utilisateurs fournit une interface complète et sécurisée pour la gestion des utilisateurs de la plateforme Preço di Caju. Elle respecte les meilleures pratiques de sécurité et offre une expérience utilisateur intuitive pour les administrateurs.

Cette fonctionnalité est essentielle pour :

- **Maintenir la sécurité** de la plateforme
- **Gérer les utilisateurs** de manière efficace
- **Surveiller l'activité** et les statistiques
- **Assurer la conformité** aux politiques de sécurité

Pour toute question ou support, consultez la documentation technique ou contactez l'équipe de développement.
