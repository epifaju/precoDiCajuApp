# PRD – Fonctionnalité : Carte interactive des points d’achat

## 🎯 Objectif
Permettre aux producteurs, commerçants et exportateurs de localiser facilement les **acheteurs agréés**, **coopératives** et **entrepôts d’exportation** sur une **carte interactive**, avec la possibilité de les **contacter directement** par téléphone.  
La carte doit également être **préchargée** pour fonctionner en **mode hors-ligne**.

---

## 📱 Fonctionnalités clés
1. **Carte interactive** intégrée dans l’application (Leaflet.js ou Mapbox).  
2. **Affichage des points d’intérêt (POI)** :  
   - Acheteurs agréés  
   - Coopératives  
   - Entrepôts d’exportation  
3. **Détails sur un point d’achat** :  
   - Nom de l’entité  
   - Localisation (coordonnées GPS)  
   - Contact téléphonique  
   - Horaires (optionnel pour MVP)  
4. **Appel direct depuis l’application** (clic sur le numéro).  
5. **Mode hors-ligne** :  
   - Carte de base préchargée (régions de Guinée-Bissau)  
   - Données des POI stockées localement (IndexedDB).  
6. **Synchronisation automatique** : si l’utilisateur se reconnecte à Internet, les données de la carte et les points d’intérêt se mettent à jour.

---

## 🛠 Spécifications techniques

### Frontend (React + Tailwind CSS)
- Intégration de **Leaflet.js** pour la carte.  
- Gestion de l’état avec **Redux Toolkit** ou **React Query**.  
- Utilisation de **IndexedDB** pour stocker la carte et les POI offline.  
- Composants clés :  
  - `<MapView />` → affichage de la carte  
  - `<POIMarker />` → affichage des points d’intérêt  
  - `<POIDetails />` → informations + bouton d’appel

### Backend (Spring Boot + PostgreSQL)
- **API REST** pour récupérer les points d’achat.  
- Base de données PostgreSQL avec extension **PostGIS** pour stocker les coordonnées GPS.  
- Endpoints clés :  
  - `GET /api/poi` → liste des points d’achat  
  - `POST /api/poi` → ajout par un administrateur  
  - `PUT /api/poi/{id}` → mise à jour d’un point  
  - `DELETE /api/poi/{id}` → suppression  
- Authentification **JWT** pour la gestion des ajouts/mises à jour par les admins.

### Données stockées pour chaque point d’achat (POI)
- `id` (UUID)  
- `nom` (string)  
- `type` (enum : acheteur, coopérative, entrepôt)  
- `latitude` (float)  
- `longitude` (float)  
- `telephone` (string)  
- `adresse` (string)  
- `horaires` (optionnel)

---

## 🎨 UI / UX
- Carte simple avec zoom + navigation tactile.  
- Icônes distinctes pour chaque type de point :  
  - 🟢 Acheteur agréé  
  - 🔵 Coopérative  
  - 🟠 Entrepôt  
- Popup avec détails + bouton **"Appeler"**.  
- Possibilité de filtrer les points par type (checkbox).  

---

## 🚀 Roadmap MVP
1. Intégration de Leaflet.js avec React.  
2. Mise en place de l’API Spring Boot pour gérer les points d’achat.  
3. Stockage et affichage des POI sur la carte.  
4. Fonction d’appel direct via `tel:`.  
5. Préchargement de la carte et des POI pour mode hors-ligne.  
6. Synchronisation automatique au retour en ligne.

---

## ✅ Critères de succès
- L’utilisateur peut voir **au moins 10 points d’achat** sur la carte dès l’installation.  
- La carte reste utilisable même sans connexion Internet.  
- Un producteur peut **appeler directement** un acheteur ou une coopérative depuis l’application.  
- Mise à jour des points d’intérêt garantie dès que l’app retrouve une connexion Internet.
