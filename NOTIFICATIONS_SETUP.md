# 🔔 Configuration des Notifications Push

Ce document explique comment configurer et utiliser le système de notifications push pour l'application Preço di Caju.

## 📋 Prérequis

- Node.js 18+
- Spring Boot 3.2+
- PostgreSQL 15+
- Navigateur supportant les notifications push (Chrome, Firefox, Safari)

## 🔧 Configuration

### 1. Génération des clés VAPID

Les clés VAPID sont nécessaires pour l'authentification des notifications push.

```bash
# Installer web-push si pas déjà fait
npm install web-push

# Générer les clés VAPID
node scripts/generate-vapid-keys.js
```

### 2. Configuration Backend

Ajoutez les variables d'environnement suivantes à votre fichier `.env` :

```env
# VAPID Keys pour les notifications push
VAPID_PUBLIC_KEY=your-vapid-public-key-here
VAPID_PRIVATE_KEY=your-vapid-private-key-here
VAPID_SUBJECT=mailto:admin@precaju.gw
```

### 3. Configuration Frontend

Ajoutez la clé publique VAPID à votre fichier `.env.local` :

```env
VITE_VAPID_PUBLIC_KEY=your-vapid-public-key-here
```

### 4. Base de données

Les migrations SQL sont automatiquement appliquées au démarrage :

- `V10__Add_notification_tables.sql` : Crée les tables et triggers nécessaires
- Ajoute les colonnes `push_subscription` et `abonnement_notifications` à la table `users`

## 🚀 Démarrage

### 1. Backend

```bash
cd backend
./mvnw spring-boot:run
```

### 2. Frontend

```bash
cd frontend
npm run dev
```

## 📱 Utilisation

### 1. Abonnement aux notifications

1. Connectez-vous à l'application
2. Allez dans **Profil** > **Paramètres**
3. Dans la section **Notifications de prix**, cliquez sur **Activer les notifications**
4. Autorisez les notifications dans votre navigateur

### 2. Test des notifications

Pour tester le système :

1. **Via l'interface admin** (si vous êtes admin) :

   - Allez dans la page d'administration
   - Utilisez l'endpoint de test des notifications

2. **Via modification de prix** :
   - Modifiez un prix existant avec une variation > 10%
   - Le trigger PostgreSQL détectera automatiquement la variation
   - Les notifications seront envoyées aux utilisateurs abonnés

### 3. Désabonnement

- Allez dans **Profil** > **Paramètres**
- Cliquez sur **Désactiver les notifications**

## 🔍 Dépannage

### Problèmes courants

1. **"Notifications non supportées"**

   - Vérifiez que vous utilisez un navigateur moderne
   - Assurez-vous que HTTPS est activé (requis pour les notifications)

2. **"Permission refusée"**

   - Allez dans les paramètres du navigateur
   - Autorisez les notifications pour votre site
   - Actualisez la page

3. **"Erreur lors de l'abonnement"**

   - Vérifiez que les clés VAPID sont correctement configurées
   - Vérifiez les logs du backend pour plus de détails

4. **Notifications non reçues**
   - Vérifiez que le service worker est enregistré
   - Vérifiez que l'utilisateur est bien abonné
   - Vérifiez les logs du backend

### Logs utiles

**Backend :**

```bash
# Logs des notifications
tail -f logs/application.log | grep -i notification
```

**Frontend :**

```javascript
// Console du navigateur
console.log("Service Worker:", navigator.serviceWorker);
console.log("Push Manager:", window.PushManager);
```

## 📊 Monitoring

### Historique des notifications

L'historique des notifications est stocké dans la table `notifications_envoyees` :

```sql
-- Voir l'historique des notifications
SELECT
    ne.created_at,
    u.email,
    ne.message,
    ne.statut,
    ne.variation_pourcentage
FROM notifications_envoyees ne
JOIN users u ON ne.utilisateur_id = u.id
ORDER BY ne.created_at DESC
LIMIT 10;
```

### Statistiques

```sql
-- Statistiques des notifications
SELECT
    statut,
    COUNT(*) as count
FROM notifications_envoyees
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY statut;
```

## 🔒 Sécurité

- Les clés VAPID privées doivent rester secrètes
- Les notifications sont envoyées uniquement aux utilisateurs abonnés
- Le seuil de variation est configurable (défaut : 10%)
- Les permissions utilisateur sont vérifiées avant l'envoi

## 📚 API Endpoints

### Notifications

- `GET /api/v1/notifications/vapid-key` - Récupérer la clé publique VAPID
- `POST /api/v1/notifications/subscribe` - S'abonner aux notifications
- `POST /api/v1/notifications/unsubscribe` - Se désabonner
- `GET /api/v1/notifications/history` - Historique des notifications
- `GET /api/v1/notifications/config` - Configuration (admin)
- `PUT /api/v1/notifications/config` - Modifier la configuration (admin)

### Exemple d'abonnement

```javascript
const subscription = await navigator.serviceWorker.ready.then((registration) =>
  registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: vapidPublicKey,
  })
);

await fetch("/api/v1/notifications/subscribe", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
  body: JSON.stringify({
    pushSubscription: JSON.stringify(subscription),
    prixVariations: true,
  }),
});
```

## 🎯 Fonctionnalités

- ✅ Notifications en temps réel
- ✅ Seuil configurable (défaut : 10%)
- ✅ Messages formatés avec emoji
- ✅ Historique des notifications
- ✅ Interface utilisateur intuitive
- ✅ Gestion des erreurs
- ✅ Support multi-navigateurs
- ✅ Service Worker optimisé

## 📞 Support

Pour toute question ou problème :

1. Vérifiez ce document
2. Consultez les logs
3. Testez avec un navigateur moderne
4. Vérifiez la configuration VAPID







