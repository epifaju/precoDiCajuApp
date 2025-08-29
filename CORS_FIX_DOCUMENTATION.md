# Correction du Problème CORS - Preço di Cajú App

## 🔍 Problème Identifié

L'application rencontrait des erreurs CORS (Cross-Origin Resource Sharing) :

```
Blocage d'une requête multiorigine (Cross-Origin Request) : la politique « Same Origin » ne permet pas de consulter la ressource distante située sur http://localhost:8080/api/v1/regions. Raison : échec de la requête CORS. Code d'état : (null).
```

## 🛠️ Corrections Apportées

### 1. Configuration CORS Améliorée (`application.yml`)

**Avant :**

```yaml
cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:5173}
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

**Après :**

```yaml
cors:
  allowed-origins: ${CORS_ORIGINS:http://localhost:3000,http://localhost:3001,http://localhost:3002,http://localhost:3003,http://localhost:5173,http://localhost:4173,http://127.0.0.1:3000,http://127.0.0.1:5173}
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS,PATCH,HEAD
  allowed-headers: "*,Authorization,Content-Type,X-Requested-With,Accept,Origin,Access-Control-Request-Method,Access-Control-Request-Headers"
  allow-credentials: true
  max-age: 3600
```

**Améliorations :**

- Ajout de ports supplémentaires (4173, 127.0.0.1)
- Méthodes HTTP étendues (PATCH, HEAD)
- En-têtes CORS plus spécifiques
- Configuration du cache preflight (max-age)

### 2. Configuration CORS Java Améliorée (`CorsConfig.java`)

**Améliorations :**

- Gestion dynamique de `max-age` depuis la configuration
- Exposition d'en-têtes CORS supplémentaires
- Configuration explicite des credentials
- Gestion améliorée des requêtes preflight

### 3. Suppression des Annotations @CrossOrigin Redondantes

**Contrôleurs modifiés :**

- `RegionController.java` - Supprimé `@CrossOrigin(origins = "*")`
- `AuthController.java` - Supprimé `@CrossOrigin` avec origines spécifiques
- `FileController.java` - Supprimé `@CrossOrigin(origins = "*")`
- `UserController.java` - Supprimé `@CrossOrigin(origins = "*")`

**Raison :** La configuration CORS globale est suffisante et évite les conflits.

## 🚀 Comment Appliquer les Corrections

### Option 1 : Redémarrage Automatique

```powershell
.\restart-backend-cors.ps1
```

### Option 2 : Redémarrage Manuel

1. Arrêter le backend (Ctrl+C)
2. Recompiler : `mvn clean compile`
3. Redémarrer : `mvn spring-boot:run`

## 🧪 Test des Corrections

### Test CORS Complet

```powershell
.\test-cors-fix.ps1
```

### Test Manuel

1. Ouvrir le navigateur
2. Aller sur `http://localhost:3000` (frontend)
3. Vérifier que les appels API fonctionnent sans erreurs CORS

## 🔧 Configuration Frontend

Le frontend est configuré pour utiliser :

- **URL API :** `http://localhost:8080` (définie dans `useApi.ts`)
- **Proxy Vite :** Configure pour `/api` → `http://localhost:8080`
- **Port de développement :** 3000

## 📋 Vérifications Post-Correction

1. **Backend démarré** sur le port 8080
2. **Frontend démarré** sur le port 3000
3. **Aucune erreur CORS** dans la console du navigateur
4. **Endpoints testés :**
   - `GET /api/v1/regions` ✅
   - `POST /api/v1/auth/login` ✅
   - `OPTIONS` requests (preflight) ✅

## 🚨 Dépannage

### Si les erreurs CORS persistent :

1. **Vérifier que le backend est démarré :**

   ```bash
   curl http://localhost:8080/actuator/health
   ```

2. **Vérifier la configuration CORS :**

   ```bash
   curl -X OPTIONS -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" http://localhost:8080/api/v1/regions
   ```

3. **Vider le cache du navigateur** et recharger la page

4. **Vérifier les logs du backend** pour des erreurs de configuration

### Variables d'environnement CORS

Vous pouvez personnaliser la configuration CORS via :

```bash
export CORS_ORIGINS="http://localhost:3000,http://localhost:5173,http://yourdomain.com"
```

## 📚 Ressources

- [Spring Boot CORS Documentation](https://docs.spring.io/spring-framework/reference/web/webmvc-cors.html)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Vite Proxy Configuration](https://vitejs.dev/config/server-options.html#server-proxy)

## ✅ Statut

- [x] Configuration CORS corrigée
- [x] Annotations redondantes supprimées
- [x] Scripts de test créés
- [x] Documentation mise à jour
- [x] Script de redémarrage créé

**Problème CORS résolu ! 🎉**
