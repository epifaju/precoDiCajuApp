# Guide d'utilisation des améliorations de gestion d'erreur API

## Problème identifié et résolu

### Erreur originale
L'erreur "An unexpected error occurred" à la ligne 37 de `handleApiResponse` était causée par :

1. **Réponse JSON mal formée** : `response.json()` était appelé sans vérifier si la réponse était effectivement du JSON
2. **Structure de réponse incohérente** : `usePOI.ts` attendait `response.data` mais l'API pouvait retourner directement les données
3. **Logging insuffisant** : Aucune information de debug pour identifier la source exacte de l'erreur

### Solutions implémentées

#### 1. Gestion d'erreur robuste dans `apiClient.ts`

```typescript
// Vérification du content-type avant parsing
const contentType = response.headers.get('content-type');
if (!contentType?.includes('application/json')) {
  logger.warn(`Expected JSON response but got ${contentType}`);
  const text = await response.text();
  return text as unknown as T;
}

// Gestion automatique de la structure de réponse backend
if (jsonData && typeof jsonData === 'object' && 'data' in jsonData) {
  return (jsonData as ApiResponse<T>).data;
}
```

#### 2. Messages d'erreur localisés par code HTTP

```typescript
const statusMessages: Record<number, string> = {
  400: 'Requête invalide - Vérifiez les données envoyées',
  401: 'Non autorisé - Veuillez vous reconnecter',
  403: 'Accès interdit - Permissions insuffisantes',
  404: 'Ressource non trouvée',
  // ... autres codes
};
```

#### 3. Logging détaillé pour le debugging

```typescript
logger.error(`API request failed`, {
  url: response.url,
  status: response.status,
  statusText: response.statusText,
  errorData,
  responseTime: responseTime(),
  requestId: error.requestId
});
```

#### 4. Retry intelligent avec backoff exponentiel

```typescript
// Retry uniquement pour les erreurs serveur (5xx)
if (error?.isApiError) {
  const shouldRetry = error.status >= 500 && attempt < retries;
  if (shouldRetry) {
    const backoffMs = Math.min(1000 * Math.pow(2, attempt), 5000);
    await new Promise(resolve => setTimeout(resolve, backoffMs));
    continue;
  }
}
```

## Utilisation dans les composants

### 1. Hook `useApiError` pour la gestion centralisée

```typescript
import { useApiError } from '../hooks/useApiError';

function MyComponent() {
  const { formatErrorMessage, isRetryableError } = useApiError();
  
  // Dans votre handler d'erreur
  const handleError = (error: unknown) => {
    const message = formatErrorMessage(error);
    const canRetry = isRetryableError(error);
    // Afficher l'erreur avec possibilité de retry
  };
}
```

### 2. Composant `ErrorDisplay` pour l'affichage

```typescript
import { ErrorDisplay } from '../components/ErrorDisplay';

function MyComponent() {
  const { error, refetch } = usePOIs();
  
  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={() => refetch()}
      />
    );
  }
}
```

### 3. Configuration des requêtes avec timeout et retry

```typescript
// Pour les listes (plus lentes)
const pois = await apiClient.get<POI[]>('/api/poi', { 
  timeout: 15000, // 15s
  retries: 2 // 2 tentatives
});

// Pour les détails (plus rapides)
const poi = await apiClient.get<POI>(`/api/poi/${id}`, {
  timeout: 10000, // 10s
  retries: 1 // 1 tentative
});

// Pour les mutations (pas de retry par défaut)
const newPoi = await apiClient.post<POI>('/api/poi', data, {
  timeout: 15000,
  retries: 0 // Pas de retry pour éviter les doublons
});
```

## Types d'erreur disponibles

### ApiError (erreurs API structurées)
```typescript
interface ApiError extends Error {
  status: number;           // Code HTTP
  statusText: string;       // Message HTTP
  data: ApiErrorData;       // Données d'erreur du backend
  url: string;             // URL de la requête
  isApiError: true;        // Type guard
  requestId?: string;      // ID de trace (si fourni par le backend)
}
```

### Gestion par type d'erreur
- **4xx (Client)** : Pas de retry automatique, message explicite
- **5xx (Serveur)** : Retry automatique avec backoff
- **Timeout** : Retry automatique pour GET, pas pour POST/PUT/DELETE
- **Réseau** : Retry automatique pour toutes les méthodes

## Debugging en développement

En mode développement, vous verrez :
- 🔵 Logs INFO pour chaque requête
- 🔍 Logs DEBUG pour les détails de performance
- 🟡 Logs WARN pour les timeouts et retries
- 🔴 Logs ERROR pour les échecs avec contexte complet

## Bonnes pratiques

1. **Toujours utiliser les types génériques** : `apiClient.get<T>()`
2. **Configurer timeout approprié** selon le type de requête
3. **Pas de retry pour les mutations** critiques (création, suppression)
4. **Utiliser les hooks d'erreur** pour une UX cohérente
5. **Logger les erreurs côté frontend** pour le monitoring

Cette implémentation vous donne maintenant une gestion d'erreur robuste, des messages utilisateur clairs, et un debugging efficace pour identifier rapidement les problèmes API.


