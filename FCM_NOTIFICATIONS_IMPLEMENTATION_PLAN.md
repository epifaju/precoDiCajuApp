# 🔔 Plan d'Implémentation - Firebase Cloud Messaging + Notifications Prix

## 🎯 Objectif

Implémenter un système de notifications push avec Firebase Cloud Messaging (FCM) pour alerter les utilisateurs lorsque les prix du cajou varient de plus de 10% dans leurs régions/qualités préférées.

## 📋 Analyse de l'Architecture Actuelle

### ✅ **Infrastructure Existante**

- **WebSocket** : Système temps réel déjà implémenté (STOMP + SockJS)
- **Authentification** : JWT avec rôles utilisateurs
- **Base de données** : PostgreSQL avec entités User, Price, Region, QualityGrade
- **PWA** : Service Worker configuré avec Vite PWA
- **Frontend** : React avec Zustand pour le state management

### 🔍 **Points d'Intégration Identifiés**

1. **User Entity** : Déjà contient `notificationPreferences` (JSON)
2. **WebSocket Service** : Peut être étendu pour FCM
3. **Price Service** : Logique de calcul des variations à ajouter
4. **PWA Manifest** : Déjà configuré pour les notifications

## 🏗️ Architecture de la Solution

### **Composants à Implémenter**

```
┌─────────────────────────────────────────────────────────────┐
│                    FCM NOTIFICATION SYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│  Frontend (React PWA)          │  Backend (Spring Boot)     │
│  ┌─────────────────────────┐   │  ┌─────────────────────┐   │
│  │ FCM Service             │   │  │ FCM Service         │   │
│  │ - Token Management      │   │  │ - Send Notifications│   │
│  │ - Permission Handling   │   │  │ - Price Monitoring  │   │
│  │ - Background Sync       │   │  │ - User Preferences  │   │
│  └─────────────────────────┘   │  └─────────────────────┘   │
│  ┌─────────────────────────┐   │  ┌─────────────────────┐   │
│  │ Notification UI         │   │  │ Price Alert Service │   │
│  │ - Toast Notifications   │   │  │ - Variation Calc    │   │
│  │ - Settings Panel        │   │  │ - Threshold Check   │   │
│  │ - History View          │   │  │ - Batch Processing  │   │
│  └─────────────────────────┘   │  └─────────────────────┘   │
│  ┌─────────────────────────┐   │  ┌─────────────────────┐   │
│  │ Service Worker          │   │  │ Notification Entity │   │
│  │ - FCM Integration       │   │  │ - User FCM Tokens   │   │
│  │ - Background Messages   │   │  │ - Alert History     │   │
│  │ - Offline Queue         │   │  │ - Preferences       │   │
│  └─────────────────────────┘   │  └─────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Plan de Développement Détaillé

### **Phase 1 : Configuration Firebase (Backend)**

#### **1.1 Configuration Firebase Admin SDK**

- [ ] Ajouter Firebase Admin SDK au `pom.xml`
- [ ] Créer `FirebaseConfig.java` avec initialisation
- [ ] Configurer les variables d'environnement Firebase
- [ ] Créer `FirebaseService.java` pour l'envoi de notifications

#### **1.2 Entités Base de Données**

- [ ] Créer `UserFCMToken` entity pour stocker les tokens FCM
- [ ] Créer `PriceAlert` entity pour l'historique des alertes
- [ ] Créer `NotificationPreference` entity pour les préférences
- [ ] Migrations Flyway pour les nouvelles tables

#### **1.3 Services Backend**

- [ ] `FCMService.java` - Envoi de notifications FCM
- [ ] `PriceAlertService.java` - Calcul des variations de prix
- [ ] `NotificationPreferenceService.java` - Gestion des préférences
- [ ] `UserFCMTokenService.java` - Gestion des tokens utilisateur

### **Phase 2 : API Endpoints (Backend)**

#### **2.1 Contrôleurs REST**

- [ ] `FCMController.java` - Gestion des tokens FCM
- [ ] `NotificationController.java` - Préférences et historique
- [ ] `PriceAlertController.java` - Configuration des alertes

#### **2.2 Endpoints API**

```
POST /api/v1/fcm/register-token     - Enregistrer token FCM
DELETE /api/v1/fcm/remove-token     - Supprimer token FCM
GET /api/v1/notifications/preferences - Récupérer préférences
PUT /api/v1/notifications/preferences - Mettre à jour préférences
GET /api/v1/notifications/history   - Historique des notifications
POST /api/v1/price-alerts/configure - Configurer les alertes
```

### **Phase 3 : Logique Métier (Backend)**

#### **3.1 Détection des Variations de Prix**

- [ ] Algorithme de calcul des variations (moyenne mobile, seuils)
- [ ] Service de monitoring en temps réel
- [ ] Job scheduler pour les vérifications périodiques
- [ ] Gestion des seuils configurables par utilisateur

#### **3.2 Système de Notifications**

- [ ] Templates de notifications multilingues
- [ ] Logique de groupement des notifications
- [ ] Gestion des préférences utilisateur
- [ ] Rate limiting pour éviter le spam

### **Phase 4 : Frontend - Configuration Firebase**

#### **4.1 Installation et Configuration**

- [ ] Installer Firebase SDK (`firebase`, `@firebase/messaging`)
- [ ] Configurer `firebase-config.js`
- [ ] Créer `FirebaseService.ts` pour la gestion FCM
- [ ] Configurer le Service Worker pour FCM

#### **4.2 Gestion des Permissions**

- [ ] Demander les permissions de notification
- [ ] Gérer les différents états (granted, denied, default)
- [ ] Interface de réactivation des permissions
- [ ] Fallback pour navigateurs non supportés

### **Phase 5 : Frontend - Interface Utilisateur**

#### **5.1 Composants de Notification**

- [ ] `NotificationToast.tsx` - Toast notifications
- [ ] `NotificationSettings.tsx` - Panel de configuration
- [ ] `NotificationHistory.tsx` - Historique des notifications
- [ ] `PriceAlertConfig.tsx` - Configuration des alertes

#### **5.2 Intégration dans l'App**

- [ ] Ajouter les notifications dans le menu utilisateur
- [ ] Intégrer dans la page de profil
- [ ] Badge de notification dans la navigation
- [ ] Page dédiée aux notifications

### **Phase 6 : Service Worker et PWA**

#### **6.1 Service Worker FCM**

- [ ] Intégrer FCM dans le Service Worker existant
- [ ] Gestion des messages en arrière-plan
- [ ] Queue de notifications offline
- [ ] Synchronisation au retour en ligne

#### **6.2 PWA Enhancements**

- [ ] Mise à jour du manifest pour les notifications
- [ ] Icônes de notification personnalisées
- [ ] Actions de notification (voir, ignorer)
- [ ] Gestion des clics sur les notifications

### **Phase 7 : Tests et Optimisation**

#### **7.1 Tests**

- [ ] Tests unitaires pour les services backend
- [ ] Tests d'intégration pour les API
- [ ] Tests E2E pour le flux complet
- [ ] Tests de performance pour les notifications

#### **7.2 Optimisation**

- [ ] Optimisation des requêtes de base de données
- [ ] Cache des préférences utilisateur
- [ ] Batch processing des notifications
- [ ] Monitoring et métriques

## 🔧 Détails Techniques par Phase

### **Phase 1 - Configuration Firebase (Backend)**

#### **Dépendances Maven**

```xml
<dependency>
    <groupId>com.google.firebase</groupId>
    <artifactId>firebase-admin</artifactId>
    <version>9.2.0</version>
</dependency>
```

#### **Configuration Firebase**

```java
@Configuration
public class FirebaseConfig {
    @PostConstruct
    public void initialize() {
        // Initialisation Firebase Admin SDK
    }
}
```

#### **Entités Base de Données**

```java
@Entity
@Table(name = "user_fcm_tokens")
public class UserFCMToken {
    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "fcm_token", nullable = false)
    private String fcmToken;

    @Column(name = "device_type")
    private String deviceType; // web, android, ios

    @Column(name = "active")
    private Boolean active = true;

    @CreatedDate
    private Instant createdAt;
}
```

### **Phase 2 - API Endpoints**

#### **FCM Controller**

```java
@RestController
@RequestMapping("/api/v1/fcm")
public class FCMController {

    @PostMapping("/register-token")
    public ResponseEntity<?> registerToken(@RequestBody FCMTokenRequest request) {
        // Enregistrer le token FCM de l'utilisateur
    }

    @DeleteMapping("/remove-token")
    public ResponseEntity<?> removeToken(@RequestBody FCMTokenRequest request) {
        // Supprimer le token FCM
    }
}
```

### **Phase 3 - Logique Métier**

#### **Price Alert Service**

```java
@Service
public class PriceAlertService {

    public void checkPriceVariations(Price newPrice) {
        // Calculer la variation par rapport au prix précédent
        // Vérifier si la variation dépasse le seuil (10%)
        // Envoyer des notifications aux utilisateurs concernés
    }

    private double calculatePriceVariation(Price current, Price previous) {
        return ((current.getPriceFcfa().doubleValue() - previous.getPriceFcfa().doubleValue())
                / previous.getPriceFcfa().doubleValue()) * 100;
    }
}
```

### **Phase 4 - Frontend Firebase**

#### **Dépendances NPM**

```json
{
  "firebase": "^10.7.1",
  "@firebase/messaging": "^0.10.1"
}
```

#### **Firebase Service**

```typescript
class FirebaseService {
  private messaging: Messaging;

  async initialize() {
    // Initialiser Firebase
    // Configurer FCM
    // Demander les permissions
  }

  async getToken(): Promise<string> {
    // Récupérer le token FCM
  }

  async requestPermission(): Promise<NotificationPermission> {
    // Demander les permissions de notification
  }
}
```

### **Phase 5 - Interface Utilisateur**

#### **Notification Settings Component**

```typescript
const NotificationSettings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3>Alertes de Prix</h3>
        <Switch checked={priceAlertsEnabled} onChange={setPriceAlertsEnabled} />
      </div>

      <div>
        <h3>Seuil de Variation</h3>
        <Slider
          value={variationThreshold}
          onChange={setVariationThreshold}
          min={5}
          max={50}
          step={5}
        />
        <span>{variationThreshold}%</span>
      </div>

      <div>
        <h3>Régions Préférées</h3>
        <MultiSelect
          options={regions}
          value={selectedRegions}
          onChange={setSelectedRegions}
        />
      </div>
    </div>
  );
};
```

### **Phase 6 - Service Worker**

#### **FCM Integration dans SW**

```typescript
// Dans sw.ts
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const messaging = getMessaging();

onBackgroundMessage(messaging, (payload) => {
  const notificationTitle =
    payload.notification?.title || "Nouvelle alerte prix";
  const notificationOptions = {
    body: payload.notification?.body,
    icon: "/icon-192.png",
    badge: "/badge-72.png",
    data: payload.data,
    actions: [
      { action: "view", title: "Voir" },
      { action: "dismiss", title: "Ignorer" },
    ],
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
```

## 🎯 Critères de Succès

### **Fonctionnalités Principales**

- ✅ Notifications push pour variations > 10%
- ✅ Préférences utilisateur configurables
- ✅ Historique des notifications
- ✅ Support multilingue (PT/FR/EN)
- ✅ Fonctionnement offline/online

### **Performance**

- ✅ Temps de réponse < 200ms pour l'envoi
- ✅ Taux de livraison > 95%
- ✅ Gestion de 1000+ utilisateurs simultanés
- ✅ Pas d'impact sur les performances existantes

### **Sécurité**

- ✅ Validation des tokens FCM
- ✅ Authentification requise pour toutes les API
- ✅ Rate limiting sur les notifications
- ✅ Chiffrement des données sensibles

## 📅 Timeline Estimé

- **Phase 1-2** : 3-4 jours (Configuration Firebase + API)
- **Phase 3** : 4-5 jours (Logique métier + calculs)
- **Phase 4-5** : 5-6 jours (Frontend + UI)
- **Phase 6** : 2-3 jours (Service Worker + PWA)
- **Phase 7** : 2-3 jours (Tests + Optimisation)

**Total estimé : 16-21 jours de développement**

## 🚀 Prochaines Étapes

1. **Validation du plan** avec l'utilisateur
2. **Configuration de l'environnement Firebase**
3. **Début de l'implémentation Phase 1**
4. **Tests itératifs à chaque phase**
5. **Déploiement progressif**

---

Ce plan détaille une approche structurée et progressive pour implémenter un système de notifications FCM robuste et performant, en s'appuyant sur l'infrastructure existante de votre application.
