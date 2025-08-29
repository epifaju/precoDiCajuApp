# 🚨 Solution Rapide - Problème CORS

## ❌ Erreur Rencontrée

```
Blocage d'une requête multiorigine (Cross-Origin Request) :
la politique « Same Origin » ne permet pas de consulter la ressource distante
située sur http://localhost:8080/api/v1/auth/login.
Raison : échec de la requête CORS. Code d'état : (null).
```

## 🔧 Solution Immédiate

### Option 1: Script Automatique (Recommandé)

```powershell
.\fix-cors-and-start.ps1
```

### Option 2: Commandes Manuelles

```powershell
# 1. Démarrer Docker Desktop
# 2. Arrêter tous les conteneurs
docker-compose down --remove-orphans

# 3. Démarrer les services
docker-compose up -d postgres redis
docker-compose up -d backend

# 4. Attendre que le backend soit prêt
# 5. Démarrer le frontend
docker-compose up -d frontend
```

## 🔍 Diagnostic CORS

### Test de la Configuration CORS

```powershell
.\test-cors-specific.ps1
```

### Vérification des Logs

```powershell
docker logs precaju-backend
```

## 📋 Causes Possibles

1. **Backend non démarré** - Le service backend n'est pas en cours d'exécution
2. **Configuration CORS incorrecte** - Problème dans la configuration Spring Boot
3. **Profil Spring Boot incorrect** - Le mauvais profil est utilisé
4. **Conflit de ports** - Port 8080 déjà utilisé par un autre service
5. **Problème Docker** - Conteneurs non démarrés ou en erreur

## ✅ Vérifications

### 1. Backend Accessible ?

```powershell
Invoke-WebRequest -Uri "http://localhost:8080/actuator/health"
```

### 2. Conteneurs Docker ?

```powershell
docker ps
```

### 3. Configuration CORS ?

```powershell
docker exec precaju-backend cat /app/application.yml
```

## 🎯 Résolution Complète

1. **Exécuter le script de résolution CORS**
2. **Vérifier que tous les services sont démarrés**
3. **Tester l'authentification**
4. **Accéder au frontend**

## 🌐 URLs de Test

- **Backend Health** : http://localhost:8080/actuator/health
- **Frontend** : http://localhost:3000
- **API Login** : http://localhost:8080/api/v1/auth/login

## 📞 Support

Si le problème persiste :

1. Exécuter `.\test-cors-specific.ps1`
2. Vérifier les logs Docker
3. Redémarrer Docker Desktop
4. Vider le cache du navigateur

---

**Status :** ✅ Solution documentée et scripts créés
**Dernière mise à jour :** 29 août 2025
