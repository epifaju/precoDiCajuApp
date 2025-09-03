# PRD - Notifications des variations de prix (Supabase)

## 🎯 Objectif
Ajouter une fonctionnalité de **notifications push en temps réel** pour informer les utilisateurs lorsque le prix de la noix de cajou change significativement, en utilisant **Supabase** au lieu de Firebase.

---

## 📌 Contexte
L'application **Preço di Caju** est déjà développée et fonctionne avec :
- Frontend React.js
- Base de données Supabase PostgreSQL
- Tables existantes : `prix_cajou` et `utilisateurs`

**Objectif** : Remplacer les notifications Firebase non utilisées par un système Supabase temps réel.

---

## 🛠 Stack technique
- **Backend** : Supabase (PostgreSQL + Realtime + Edge Functions)
- **Notifications** : Web Push API + Service Worker
- **Base de données** : PostgreSQL avec triggers
- **Frontend** : React.js existant + intégration notifications

---

## 🏗 Architecture technique

### 1. Flux de données
```
Modification prix → Trigger PostgreSQL → Realtime Channel → Edge Function → Web Push → Frontend
```

### 2. Composants à implémenter
- **Trigger PostgreSQL** : Détection des variations
- **Edge Function** : Logique métier + envoi notifications  
- **Service Worker** : Gestion Web Push côté client
- **Interface React** : Gestion des abonnements

---

## 🔄 Fonctionnalités détaillées

### 1. Détection des variations de prix
**Critères de déclenchement** :
- Variation absolue > seuil configurable (défaut : 10%)
- Calcul : `ABS((nouveau_prix - ancien_prix) / ancien_prix * 100)`
- Uniquement sur les mises à jour de `prix_kg`

### 2. Gestion des seuils
**Table de configuration** à créer :
```sql
CREATE TABLE notification_config (
  id SERIAL PRIMARY KEY,
  seuil_pourcentage DECIMAL DEFAULT 10.0,
  actif BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 3. Abonnements utilisateurs
**Extension de la table `utilisateurs`** :
```sql
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS push_subscription JSONB;
ALTER TABLE utilisateurs ADD COLUMN IF NOT EXISTS notification_preferences JSONB DEFAULT '{"prix_variations": true, "seuil_perso": null}';
```

### 4. Historique des notifications
**Nouvelle table** :
```sql
CREATE TABLE notifications_envoyees (
  id SERIAL PRIMARY KEY,
  utilisateur_id INTEGER REFERENCES utilisateurs(id),
  prix_id INTEGER REFERENCES prix_cajou(id),
  ancien_prix DECIMAL,
  nouveau_prix DECIMAL,
  variation_pourcentage DECIMAL,
  message TEXT,
  statut VARCHAR(20) DEFAULT 'envoyee',
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 📊 Modèle de données complet

### Tables existantes
```sql
-- prix_cajou (existante)
| id | pays | marche | prix_kg | devise | date | updated_at |

-- utilisateurs (existante + extensions)
| id | nom | email | role | abonnement_notifications | push_subscription | notification_preferences |
```

### Nouvelles tables
```sql
-- notification_config
| id | seuil_pourcentage | actif | created_at |

-- notifications_envoyees  
| id | utilisateur_id | prix_id | ancien_prix | nouveau_prix | variation_pourcentage | message | statut | created_at |
```

---

## 💻 Implémentation technique

### 1. Trigger PostgreSQL amélioré
```sql
CREATE OR REPLACE FUNCTION notify_price_change()
RETURNS TRIGGER AS $$
DECLARE
  variation_pct DECIMAL;
  seuil DECIMAL;
  config_record RECORD;
BEGIN
  -- Récupérer la configuration active
  SELECT seuil_pourcentage INTO seuil 
  FROM notification_config 
  WHERE actif = TRUE 
  ORDER BY id DESC 
  LIMIT 1;
  
  -- Valeur par défaut si pas de config
  IF seuil IS NULL THEN
    seuil := 10.0;
  END IF;
  
  -- Calculer la variation si prix différent
  IF NEW.prix_kg <> OLD.prix_kg AND OLD.prix_kg > 0 THEN
    variation_pct := ABS((NEW.prix_kg - OLD.prix_kg) / OLD.prix_kg * 100);
    
    -- Déclencher seulement si variation > seuil
    IF variation_pct >= seuil THEN
      PERFORM pg_notify(
        'prix_cajou_variation',
        json_build_object(
          'id', NEW.id,
          'marche', NEW.marche,
          'pays', NEW.pays,
          'ancien_prix', OLD.prix_kg,
          'nouveau_prix', NEW.prix_kg,
          'variation_pct', variation_pct,
          'devise', NEW.devise,
          'timestamp', extract(epoch from now())
        )::text
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prix_cajou_variation_trigger
AFTER UPDATE ON prix_cajou
FOR EACH ROW
EXECUTE FUNCTION notify_price_change();
```

### 2. Edge Function complète
```typescript
// supabase/functions/send-price-notifications/index.ts
import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

interface PriceVariation {
  id: number;
  marche: string;
  pays: string;
  ancien_prix: number;
  nouveau_prix: number;
  variation_pct: number;
  devise: string;
  timestamp: number;
}

serve(async (req) => {
  try {
    const priceData: PriceVariation = await req.json();
    
    // Récupérer les utilisateurs abonnés
    const { data: subscribers } = await supabase
      .from('utilisateurs')
      .select('id, nom, push_subscription, notification_preferences')
      .eq('abonnement_notifications', true)
      .not('push_subscription', 'is', null);

    if (!subscribers || subscribers.length === 0) {
      return new Response(JSON.stringify({ message: 'Aucun abonné trouvé' }));
    }

    // Préparer le message
    const direction = priceData.nouveau_prix > priceData.ancien_prix ? '📈 Hausse' : '📉 Baisse';
    const message = `${direction} du cajou : ${priceData.nouveau_prix} ${priceData.devise} (${priceData.variation_pct.toFixed(1)}%) à ${priceData.marche}, ${priceData.pays}`;

    // Envoyer les notifications
    const notifications = await Promise.allSettled(
      subscribers.map(async (user) => {
        // Vérifier les préférences utilisateur
        const prefs = user.notification_preferences || {};
        if (!prefs.prix_variations) return null;

        // Envoyer la notification Web Push
        const pushResponse = await sendWebPushNotification(
          user.push_subscription,
          {
            title: 'Preço di Caju - Variation de prix',
            body: message,
            icon: '/icon-192x192.png',
            badge: '/badge-72x72.png',
            tag: `prix-${priceData.id}`,
            data: {
              url: `/marche/${priceData.marche}`,
              priceId: priceData.id
            }
          }
        );

        // Enregistrer dans l'historique
        await supabase.from('notifications_envoyees').insert({
          utilisateur_id: user.id,
          prix_id: priceData.id,
          ancien_prix: priceData.ancien_prix,
          nouveau_prix: priceData.nouveau_prix,
          variation_pourcentage: priceData.variation_pct,
          message: message,
          statut: pushResponse.success ? 'envoyee' : 'echec'
        });

        return pushResponse;
      })
    );

    const successCount = notifications.filter(n => n.status === 'fulfilled').length;
    
    return new Response(JSON.stringify({
      success: true,
      message: `Notifications envoyées à ${successCount}/${subscribers.length} utilisateurs`,
      variation: priceData
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error('Erreur envoi notifications:', error);
    return new Response(JSON.stringify({ 
      error: 'Erreur lors de l\'envoi des notifications',
      details: error.message 
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});

async function sendWebPushNotification(subscription: any, payload: any) {
  // TODO: Implémenter l'envoi Web Push avec vapid keys
  // Utiliser web-push library ou équivalent Deno
  return { success: true };
}
```

### 3. Service Worker (Frontend)
```javascript
// public/sw.js
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'Nouvelle variation de prix',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Voir les prix',
        icon: '/images/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/images/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Preço di Caju', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
```

### 4. Hook React pour notifications
```typescript
// hooks/useNotifications.ts
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export const useNotifications = () => {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window);
  }, []);

  const subscribe = async () => {
    if (!isSupported) return false;

    try {
      // Enregistrer le service worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      
      // Demander permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return false;

      // S'abonner aux push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(process.env.REACT_APP_VAPID_PUBLIC_KEY)
      });

      // Sauvegarder l'abonnement en base
      const { error } = await supabase
        .from('utilisateurs')
        .update({
          push_subscription: subscription,
          abonnement_notifications: true
        })
        .eq('id', /* user id */);

      if (!error) {
        setIsSubscribed(true);
        return true;
      }
    } catch (error) {
      console.error('Erreur abonnement notifications:', error);
    }
    return false;
  };

  const unsubscribe = async () => {
    // TODO: Implémenter le désabonnement
  };

  return { subscribe, unsubscribe, isSubscribed, isSupported };
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

---

## ✅ Critères d'acceptation détaillés

### Fonctionnels
- [ ] Les notifications sont envoyées seulement si variation ≥ seuil configuré
- [ ] Les utilisateurs peuvent s'abonner/désabonner via l'interface
- [ ] Les notifications apparaissent en temps réel (< 30 secondes)
- [ ] Le message inclut : direction, pourcentage, prix, marché, pays
- [ ] L'historique des notifications est conservé

### Techniques  
- [ ] Trigger PostgreSQL fonctionne correctement
- [ ] Edge Function déploye sans erreur
- [ ] Service Worker s'enregistre et reçoit les notifications
- [ ] Gestion d'erreurs et logs appropriés
- [ ] Tests unitaires pour les fonctions critiques

### UX/UI
- [ ] Interface d'abonnement intuitive
- [ ] Notifications non intrusives mais visibles
- [ ] Lien vers la page du marché concerné
- [ ] Préférences utilisateur sauvegardées

---

## 🧪 Plan de test

### 1. Tests de développement
```sql
-- Test manuel du trigger
UPDATE prix_cajou SET prix_kg = prix_kg * 1.15 WHERE id = 1;
```

### 2. Tests Edge Function
- Test avec données mockées
- Test d'abonnés multiples  
- Test de gestion d'erreurs

### 3. Tests Frontend
- Test d'abonnement/désabonnement
- Test de réception des notifications
- Test cross-browser (Chrome, Firefox, Safari)

---

## 🔧 Configuration requise

### Variables d'environnement
```env
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_email
```

### Permissions Supabase
- RLS activé sur toutes les tables
- Politiques d'accès pour les utilisateurs authentifiés
- Edge Functions déployées avec bonnes permissions

---

## 📅 Planning d'implémentation

### Semaine 1
- [ ] Création des nouvelles tables
- [ ] Implémentation du trigger PostgreSQL  
- [ ] Développement de l'Edge Function
- [ ] Tests backend

### Semaine 2  
- [ ] Développement du Service Worker
- [ ] Intégration React (hook + composants)
- [ ] Tests frontend
- [ ] Tests d'intégration complets
- [ ] Documentation

---

## 📚 Documentation à fournir

1. **README technique** : Installation, configuration, déploiement
2. **Guide utilisateur** : Comment s'abonner aux notifications  
3. **Documentation API** : Endpoints Edge Functions
4. **Procédures de maintenance** : Monitoring, debugging
5. **Scripts de migration** : SQL pour mise à jour de la base

---

## 🚀 Critères de livraison

- [ ] Code déployé en environnement de test Supabase
- [ ] Tests automatisés passants
- [ ] Documentation complète
- [ ] Formation équipe sur la maintenance
- [ ] Monitoring et alertes configurés