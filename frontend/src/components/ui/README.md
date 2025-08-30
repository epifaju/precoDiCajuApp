# Composants Service Worker

Ce dossier contient les composants UI pour gérer et afficher le statut des Service Workers dans l'application.

## Composants disponibles

### 1. `ServiceWorkerStatus.tsx`
Composant simple qui affiche le statut basique du Service Worker avec un bouton de mise à jour.

**Utilisation :**
```tsx
import { ServiceWorkerStatus } from '../components/ui/ServiceWorkerStatus';

// Dans votre composant
<ServiceWorkerStatus />
```

**Fonctionnalités :**
- Affichage automatique du statut
- Bouton de vérification des mises à jour
- Gestion des erreurs
- Indicateurs visuels de statut

### 2. `ServiceWorkerDebug.tsx`
Composant avancé pour le débogage et le développement, affichant toutes les informations détaillées.

**Utilisation :**
```tsx
import { ServiceWorkerDebug } from '../components/ui/ServiceWorkerDebug';

// Dans votre composant (en mode développement uniquement)
{process.env.NODE_ENV === 'development' && <ServiceWorkerDebug />}
```

**Fonctionnalités :**
- Informations détaillées sur l'enregistrement
- Statut complet du Service Worker
- Actions de gestion (mise à jour, désinscription)
- Informations de débogage (protocol, hostname, etc.)
- Interface complète pour les développeurs

## Hook `useServiceWorker`

Les deux composants utilisent le hook `useServiceWorker` qui fournit :

```typescript
const {
  isSupported,      // Support navigateur
  isRegistered,     // Statut d'enregistrement
  isSecure,         // Contexte sécurisé
  error,            // Erreurs éventuelles
  registration,     // Objet d'enregistrement
  update,           // Fonction de mise à jour
  unregister        // Fonction de désinscription
} = useServiceWorker();
```

## Cas d'usage recommandés

### Pour la production
Utilisez `ServiceWorkerStatus` pour informer les utilisateurs du statut du Service Worker.

### Pour le développement
Utilisez `ServiceWorkerDebug` pour diagnostiquer les problèmes et tester les fonctionnalités.

### Intégration dans d'autres composants
```tsx
import { useServiceWorker } from '../hooks/useServiceWorker';

const MyComponent = () => {
  const { isRegistered, error } = useServiceWorker();
  
  if (error) {
    return <div>Erreur Service Worker: {error}</div>;
  }
  
  return (
    <div>
      {isRegistered ? 'Service Worker actif' : 'Service Worker en cours...'}
    </div>
  );
};
```

## Gestion des erreurs

Les composants gèrent automatiquement :
- Navigateurs non supportés
- Contexte non sécurisé (HTTP en production)
- Erreurs d'enregistrement
- Problèmes de mise à jour

## Styles et thème

Les composants utilisent :
- Tailwind CSS pour le styling
- Composants UI de base (Card, Button, Badge, Alert)
- Variants de couleur cohérents avec le thème
- Responsive design

## Tests

Pour tester les composants :

1. **Développement local** : `http://localhost:3000`
2. **Production** : Serveur HTTPS
3. **Navigateurs** : Chrome, Firefox, Safari, Edge
4. **DevTools** : Onglet Application > Service Workers

## Dépannage

### Erreur "Operation is insecure"
- Vérifiez que vous êtes sur HTTPS ou localhost
- Vérifiez la configuration VitePWA
- Consultez la console pour plus de détails

### Service Worker non enregistré
- Vérifiez les permissions du navigateur
- Vérifiez la console pour les erreurs
- Utilisez le composant de débogage

### Problèmes de cache
- Videz le cache du navigateur
- Désinscrivez et réinscrivez le Service Worker
- Vérifiez la stratégie de cache dans `sw.ts`

