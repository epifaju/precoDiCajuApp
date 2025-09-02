# Fonctionnalités Offline - Guide d'Utilisation

## Vue d'ensemble

L'application PrecoDiCaju dispose maintenant de fonctionnalités offline complètes qui permettent aux utilisateurs de continuer à travailler même sans connexion internet. Les données sont stockées localement et synchronisées automatiquement dès que la connexion est rétablie.

## Architecture

### 1. Stockage Local (IndexedDB)

- **Base de données**: `PrecoCajuOffline`
- **Object stores**:
  - `offline_prices`: Prix créés en mode offline
  - `sync_queue`: Queue de synchronisation
  - `sync_metadata`: Métadonnées de synchronisation
  - `conflicts`: Conflits de synchronisation
  - `reference_data`: Données de référence (régions, qualités)
  - `sync_events`: Événements de synchronisation

### 2. Service Worker

- **Fichier**: `src/sw.ts`
- **Fonctionnalités**:
  - Cache des ressources statiques
  - Background sync pour les requêtes API
  - Traitement de la queue de synchronisation
  - Synchronisation des données de référence

### 3. Hooks Offline

- `useOfflineStorage`: Interface pour IndexedDB
- `useOfflineMutation`: Wrapper pour les mutations offline
- `useOfflineApi`: Hooks spécifiques pour les API offline
- `useServiceWorker`: Gestion du Service Worker

## Utilisation

### 1. Créer un Prix en Mode Offline

```tsx
import { useOfflineCreatePrice } from '../hooks/useOfflineApi';

const MyComponent = () => {
  const createPriceMutation = useOfflineCreatePrice();

  const handleSubmit = async (data) => {
    try {
      await createPriceMutation.mutateAsync(data);
      // Le prix est sauvegardé localement et ajouté à la queue de sync
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Votre formulaire */}</form>;
};
```

### 2. Utiliser le Formulaire Intelligent

```tsx
import { SmartPriceSubmissionForm } from '../components/forms/SmartPriceSubmissionForm';

const PricePage = () => {
  return (
    <SmartPriceSubmissionForm
      onSuccess={() => {
        // Callback après soumission réussie
      }}
    />
  );
};
```

### 3. Surveiller le Statut de Synchronisation

```tsx
import { useServiceWorker } from '../hooks/useServiceWorker';

const StatusComponent = () => {
  const { syncStatus, lastSyncTime, triggerSync } = useServiceWorker();

  return (
    <div>
      <p>Statut: {syncStatus}</p>
      <p>Dernière sync: {lastSyncTime}</p>
      <button onClick={triggerSync}>Déclencher Sync</button>
    </div>
  );
};
```

### 4. Gérer les Données Offline

```tsx
import { useOfflineStorage } from '../hooks/useOfflineStorage';

const DataManager = () => {
  const { getOfflinePrices, getSyncQueueItems, clearAllOfflineData } = useOfflineStorage();

  const handleClearData = async () => {
    await clearAllOfflineData();
  };

  return (
    <div>
      <button onClick={handleClearData}>Vider le Cache</button>
    </div>
  );
};
```

## Composants de Test

### 1. Test d'Intégration Complète

```tsx
import { OfflineIntegrationTest } from '../components/offline/OfflineIntegrationTest';

// Composant de test avec interface complète
<OfflineIntegrationTest />;
```

### 2. Test des Mutations

```tsx
import { OfflineMutationsTest } from '../components/offline/OfflineMutationsTest';

// Test spécifique des mutations offline
<OfflineMutationsTest />;
```

### 3. Test du Stockage

```tsx
import { OfflineStorageTest } from '../components/offline/OfflineStorageTest';

// Test du stockage IndexedDB
<OfflineStorageTest />;
```

## Comportement Offline

### 1. Détection de Connexion

- L'application détecte automatiquement le statut de connexion
- Teste la qualité de connexion (bonne/lente/hors ligne)
- Adapte le comportement en conséquence

### 2. Sauvegarde Locale

- Toutes les données sont sauvegardées en local
- Les fichiers sont convertis en base64 pour le stockage
- Les métadonnées incluent timestamp, utilisateur, langue

### 3. Synchronisation

- **Automatique**: Dès que la connexion est rétablie
- **Manuelle**: Via le bouton "Déclencher Sync"
- **Background**: Via le Service Worker
- **Retry**: Logique d'exponential backoff

### 4. Gestion des Conflits

- Détection automatique des conflits
- Interface pour résoudre les conflits manuellement
- Stratégies de résolution (local/remote/manuel)

## Configuration

### 1. Service Worker

```typescript
// Dans vite.config.ts
VitePWA({
  registerType: 'autoUpdate',
  workbox: {
    globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  },
  devOptions: {
    enabled: false, // Désactivé en développement
  },
});
```

### 2. IndexedDB

```typescript
// Configuration automatique via useOfflineStorage
const db = new OfflineStorageService();
await db.init(); // Initialise la base de données
```

### 3. Background Sync

```typescript
// Configuration dans le Service Worker
const bgSyncPlugin = new BackgroundSyncPlugin('precaju-sync-queue', {
  maxRetentionTime: 24 * 60, // 24 heures
});
```

## Bonnes Pratiques

### 1. Gestion des Erreurs

- Toujours gérer les erreurs de stockage local
- Afficher des messages clairs à l'utilisateur
- Proposer des actions de récupération

### 2. Performance

- Limiter la taille des fichiers uploadés
- Compresser les données si nécessaire
- Nettoyer régulièrement les données obsolètes

### 3. UX

- Indiquer clairement le mode offline
- Afficher le statut de synchronisation
- Permettre la synchronisation manuelle

### 4. Sécurité

- Valider les données avant stockage
- Chiffrer les données sensibles si nécessaire
- Nettoyer les données lors de la déconnexion

## Dépannage

### 1. Problèmes de Synchronisation

- Vérifier le statut du Service Worker
- Consulter les logs de la console
- Tester la connectivité réseau

### 2. Problèmes de Stockage

- Vérifier les quotas IndexedDB
- Nettoyer le cache du navigateur
- Réinitialiser les données offline

### 3. Problèmes de Performance

- Réduire la taille des données
- Optimiser les requêtes
- Utiliser la pagination

## Évolutions Futures

### 1. Fonctionnalités Avancées

- Synchronisation partielle
- Compression des données
- Chiffrement local
- Notifications push

### 2. Optimisations

- Cache intelligent
- Préchargement des données
- Synchronisation différentielle
- Gestion des conflits avancée

### 3. Intégrations

- Support des WebSockets
- Intégration avec les notifications
- Support des PWA avancées
- Métriques et analytics
