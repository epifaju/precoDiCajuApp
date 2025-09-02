# Composants UI Avancés de Géolocalisation

Ce document décrit les composants UI avancés pour la fonctionnalité de géolocalisation GPS de l'application.

## Composants Avancés

### `GpsDashboard`

Composant de tableau de bord complet pour la géolocalisation GPS avec vue d'ensemble et contrôles.

**Fonctionnalités:**

- Vue d'ensemble complète de la géolocalisation
- Affichage de la localisation actuelle
- Analyse de précision GPS
- Statut offline et synchronisation
- Statistiques et historique
- Accès rapide aux paramètres

**Usage:**

```typescript
import { GpsDashboard } from '../components/geolocation';

<GpsDashboard
  showOverview={true}
  showCurrentLocation={true}
  showAccuracy={true}
  showOfflineStatus={true}
  showSyncStatus={true}
  showStatistics={true}
  showHistory={true}
  showSettings={true}
  variant="full"
/>;
```

**Props:**

- `showOverview?: boolean` - Afficher la vue d'ensemble (défaut: true)
- `showCurrentLocation?: boolean` - Afficher la localisation actuelle (défaut: true)
- `showAccuracy?: boolean` - Afficher l'analyse de précision (défaut: true)
- `showOfflineStatus?: boolean` - Afficher le statut offline (défaut: true)
- `showSyncStatus?: boolean` - Afficher le statut de synchronisation (défaut: true)
- `showStatistics?: boolean` - Afficher les statistiques (défaut: true)
- `showHistory?: boolean` - Afficher l'historique (défaut: true)
- `showSettings?: boolean` - Afficher les paramètres (défaut: true)
- `variant?: 'full' | 'compact' | 'minimal'` - Style du composant

### `GpsNavigation`

Composant d'interface de navigation GPS avec guidage vocal et instructions étape par étape.

**Fonctionnalités:**

- Navigation GPS complète
- Guidage vocal
- Instructions étape par étape
- Affichage de distance et ETA
- Recalcul automatique d'itinéraire
- Contrôles de navigation

**Usage:**

```typescript
import { GpsNavigation } from '../components/geolocation';

<GpsNavigation
  destination={destination}
  onNavigationStart={() => console.log('Navigation démarrée')}
  onNavigationStop={() => console.log('Navigation arrêtée')}
  onRouteRecalculate={() => console.log('Itinéraire recalculé')}
  showVoiceGuidance={true}
  showTurnByTurn={true}
  showDistance={true}
  showEta={true}
  showSpeed={true}
  showBearing={true}
/>;
```

**Props:**

- `destination?: GpsCoordinates` - Destination de navigation
- `onNavigationStart?: () => void` - Callback au début de la navigation
- `onNavigationStop?: () => void` - Callback à l'arrêt de la navigation
- `onRouteRecalculate?: () => void` - Callback lors du recalcul d'itinéraire
- `showVoiceGuidance?: boolean` - Afficher le guidage vocal (défaut: true)
- `showTurnByTurn?: boolean` - Afficher les instructions étape par étape (défaut: true)
- `showDistance?: boolean` - Afficher la distance (défaut: true)
- `showEta?: boolean` - Afficher l'ETA (défaut: true)
- `showSpeed?: boolean` - Afficher la vitesse (défaut: true)
- `showBearing?: boolean` - Afficher la direction (défaut: true)

### `GpsWidget`

Composant widget compact pour afficher les informations GPS essentielles.

**Fonctionnalités:**

- Affichage compact des informations GPS
- Mode étendu et compact
- Contrôles rapides
- Actualisation en temps réel
- Accès aux paramètres

**Usage:**

```typescript
import { GpsWidget } from '../components/geolocation';

<GpsWidget
  variant="compact"
  showCurrentLocation={true}
  showAccuracy={true}
  showStatus={true}
  showLastUpdate={true}
  showControls={true}
  onToggleExpanded={() => console.log('Mode basculé')}
  onRefresh={() => console.log('Actualisation')}
  onSettings={() => console.log('Paramètres')}
/>;
```

**Props:**

- `variant?: 'compact' | 'expanded' | 'minimal'` - Style du composant
- `showCurrentLocation?: boolean` - Afficher la localisation actuelle (défaut: true)
- `showAccuracy?: boolean` - Afficher la précision (défaut: true)
- `showStatus?: boolean` - Afficher le statut (défaut: true)
- `showLastUpdate?: boolean` - Afficher la dernière mise à jour (défaut: true)
- `showControls?: boolean` - Afficher les contrôles (défaut: true)
- `onToggleExpanded?: () => void` - Callback pour basculer le mode étendu
- `onRefresh?: () => void` - Callback pour actualiser
- `onSettings?: () => void` - Callback pour ouvrir les paramètres

### `GpsSettings`

Composant de configuration des paramètres GPS avec interface utilisateur complète.

**Fonctionnalités:**

- Configuration complète des paramètres GPS
- Paramètres généraux, précision, offline, notifications
- Sauvegarde et réinitialisation
- Export/import des paramètres
- Interface utilisateur intuitive

**Usage:**

```typescript
import { GpsSettings } from '../components/geolocation';

<GpsSettings
  onSettingsChange={(settings) => console.log('Paramètres changés', settings)}
  onSave={() => console.log('Paramètres sauvegardés')}
  onReset={() => console.log('Paramètres réinitialisés')}
  onExport={() => console.log('Paramètres exportés')}
  onImport={() => console.log('Paramètres importés')}
  showGeneral={true}
  showAccuracy={true}
  showOffline={true}
  showNotifications={true}
  showAdvanced={true}
/>;
```

**Props:**

- `onSettingsChange?: (settings: GpsSettings) => void` - Callback lors des changements
- `onSave?: () => void` - Callback pour sauvegarder
- `onReset?: () => void` - Callback pour réinitialiser
- `onExport?: () => void` - Callback pour exporter
- `onImport?: () => void` - Callback pour importer
- `showGeneral?: boolean` - Afficher les paramètres généraux (défaut: true)
- `showAccuracy?: boolean` - Afficher les paramètres de précision (défaut: true)
- `showOffline?: boolean` - Afficher les paramètres offline (défaut: true)
- `showNotifications?: boolean` - Afficher les paramètres de notifications (défaut: true)
- `showAdvanced?: boolean` - Afficher les paramètres avancés (défaut: true)

### `GpsVisualization`

Composant de visualisation GPS avec graphiques et métriques.

**Fonctionnalités:**

- Graphiques de précision GPS
- Visualisation de trajectoire
- Analyse de qualité
- Graphiques de vitesse
- Contrôles de période
- Légendes et statistiques

**Usage:**

```typescript
import { GpsVisualization } from '../components/geolocation';

<GpsVisualization
  metrics={gpsMetrics}
  type="all"
  period="24h"
  showControls={true}
  showLegend={true}
  onPeriodChange={(period) => console.log('Période changée', period)}
/>;
```

**Props:**

- `metrics?: GpsMetrics` - Métriques GPS à afficher
- `type?: 'accuracy' | 'trajectory' | 'quality' | 'speed' | 'all'` - Type de visualisation
- `period?: '1h' | '6h' | '24h' | '7d' | '30d'` - Période d'affichage
- `showControls?: boolean` - Afficher les contrôles (défaut: true)
- `showLegend?: boolean` - Afficher les légendes (défaut: true)
- `onPeriodChange?: (period: string) => void` - Callback lors des changements de période

### `GpsNotification`

Composant de notification GPS pour les événements et alertes.

**Fonctionnalités:**

- Notifications contextuelles
- Types de notification (success, warning, error, info)
- Actions personnalisées
- Auto-fermeture configurable
- Animations d'entrée/sortie
- Positions configurables

**Usage:**

```typescript
import { GpsNotification } from '../components/geolocation';

<GpsNotification
  notification={notificationData}
  onClose={(id) => console.log('Notification fermée', id)}
  position="top-right"
  animation="slide"
/>;
```

**Props:**

- `notification: GpsNotificationData` - Données de notification
- `onClose: (id: string) => void` - Callback pour fermer la notification
- `position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'` - Position
- `animation?: 'slide' | 'fade' | 'bounce'` - Animation d'entrée

### `GpsNotificationManager`

Composant de gestion des notifications GPS.

**Fonctionnalités:**

- Gestion centralisée des notifications
- Écoute des événements GPS
- Génération automatique de notifications
- Contrôle de position et animation
- Effacement en masse

**Usage:**

```typescript
import { GpsNotificationManager } from '../components/geolocation';

<GpsNotificationManager position="top-right" animation="slide" className="custom-notifications" />;
```

**Props:**

- `position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'` - Position
- `animation?: 'slide' | 'fade' | 'bounce'` - Animation d'entrée
- `className?: string` - Classe CSS personnalisée

## Types de Données

### `GpsMetrics`

```typescript
interface GpsMetrics {
  accuracy: number[];
  timestamps: number[];
  coordinates: {
    lat: number[];
    lng: number[];
  };
  quality: string[];
  speed?: number[];
  heading?: number[];
}
```

### `GpsNotificationData`

```typescript
interface GpsNotificationData {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
  persistent?: boolean;
}
```

## Exemples d'Intégration

### Tableau de Bord Complet

```typescript
import { GpsDashboard, GpsNotificationManager } from '../components/geolocation';

function GpsPage() {
  return (
    <div>
      <GpsDashboard
        variant="full"
        showOverview={true}
        showCurrentLocation={true}
        showAccuracy={true}
        showOfflineStatus={true}
        showSyncStatus={true}
        showStatistics={true}
        showHistory={true}
        showSettings={true}
      />

      <GpsNotificationManager position="top-right" animation="slide" />
    </div>
  );
}
```

### Widget Compact

```typescript
import { GpsWidget } from '../components/geolocation';

function Header() {
  return (
    <header>
      <GpsWidget
        variant="compact"
        showCurrentLocation={true}
        showAccuracy={true}
        showControls={true}
        onToggleExpanded={() => setExpanded(!expanded)}
        onRefresh={() => refreshLocation()}
        onSettings={() => openSettings()}
      />
    </header>
  );
}
```

### Navigation GPS

```typescript
import { GpsNavigation } from '../components/geolocation';

function NavigationPage() {
  const [destination, setDestination] = useState(null);
  const [isNavigating, setIsNavigating] = useState(false);

  return (
    <GpsNavigation
      destination={destination}
      onNavigationStart={() => setIsNavigating(true)}
      onNavigationStop={() => setIsNavigating(false)}
      onRouteRecalculate={() => console.log('Recalculating route')}
      showVoiceGuidance={true}
      showTurnByTurn={true}
      showDistance={true}
      showEta={true}
    />
  );
}
```

### Visualisation des Données

```typescript
import { GpsVisualization } from '../components/geolocation';

function AnalyticsPage() {
  const [metrics, setMetrics] = useState(null);
  const [period, setPeriod] = useState('24h');

  return (
    <GpsVisualization
      metrics={metrics}
      type="all"
      period={period}
      showControls={true}
      showLegend={true}
      onPeriodChange={setPeriod}
    />
  );
}
```

## Événements GPS

Les composants écoutent et génèrent des événements GPS personnalisés :

### Événements Écoutés

- `gps_accuracy_improved` - Précision améliorée
- `gps_accuracy_degraded` - Précision dégradée
- `gps_permission_granted` - Permission accordée
- `gps_permission_denied` - Permission refusée
- `gps_offline_mode` - Mode offline activé
- `gps_sync_completed` - Synchronisation terminée
- `gps_sync_failed` - Synchronisation échouée
- `gps_validation_failed` - Validation échouée

### Événements Générés

- `gps_request_permission` - Demande de permission
- `gps_retry_sync` - Relance de synchronisation

## Accessibilité

Tous les composants respectent les standards d'accessibilité :

- Support des lecteurs d'écran
- Navigation au clavier
- Contraste de couleurs approprié
- Labels et descriptions appropriés
- Support des notifications d'accessibilité

## Performance

- Lazy loading des composants lourds
- Debouncing des interactions utilisateur
- Mise en cache des données
- Optimisation des re-renders
- Gestion mémoire appropriée
