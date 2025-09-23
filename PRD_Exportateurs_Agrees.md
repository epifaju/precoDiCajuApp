# PRD – Fonctionnalité : Accès aux exportateurs agréés & acheteurs fiables

## 🎯 Objectif
Fournir aux producteurs et commerçants un accès fiable à la **liste officielle des exportateurs agréés et acheteurs certifiés par l’État**, afin de réduire les risques d’arnaques (faux acheteurs, pratiques illégales).  
Un système de **vérification via QR code** permettra de confirmer l’authenticité d’un acheteur ou d’un exportateur.

---

## 📱 Fonctionnalités clés
1. **Liste officielle des exportateurs et acheteurs agréés** (mise à jour régulièrement depuis une base officielle).  
2. **Recherche et filtres** par :  
   - Nom de l’entreprise  
   - Région  
   - Type (exportateur, acheteur local)  
3. **Fiche détaillée d’un exportateur/acheteur** :  
   - Nom de l’entité  
   - Numéro d’agrément officiel  
   - Région / Localisation  
   - Contact téléphonique  
   - Email (si disponible)  
   - Historique de certification (dates de validité)  
4. **Vérification via QR code** :  
   - Chaque exportateur/acheteur a un QR code unique.  
   - Le producteur peut scanner ce QR code pour vérifier si l’entité est **officiellement agréée**.  
5. **Mode hors-ligne** :  
   - La liste officielle peut être téléchargée localement.  
   - Vérification des QR codes possible offline (base embarquée).  
   - Mise à jour automatique dès que l’application retrouve une connexion.

---

## 🛠 Spécifications techniques

### Frontend (React + Tailwind CSS)
- Pages principales :  
  - **Liste des exportateurs/acheteurs** (`<ExporterList />`)  
  - **Fiche détail** (`<ExporterDetails />`)  
  - **Scanner QR code** (`<QRCodeScanner />`)  
- Intégration d’une librairie de scan QR code (ex. `react-qr-reader`).  
- Stockage local avec **IndexedDB** pour consultation hors-ligne.

### Backend (Spring Boot + PostgreSQL)
- Base de données avec table `exportateurs` :  
  - `id` (UUID)  
  - `nom` (string)  
  - `numero_agrement` (string, unique)  
  - `type` (enum : exportateur, acheteur)  
  - `region` (string)  
  - `telephone` (string)  
  - `email` (string, optionnel)  
  - `qr_code` (string, token unique généré)  
  - `date_certification` (date)  
  - `date_expiration` (date)  
- Endpoints clés :  
  - `GET /api/exportateurs` → liste complète  
  - `GET /api/exportateurs/{id}` → fiche détaillée  
  - `GET /api/exportateurs/verify/{qr}` → vérification via QR code  
  - `POST /api/exportateurs` → ajout (admin)  
  - `PUT /api/exportateurs/{id}` → mise à jour (admin)  
  - `DELETE /api/exportateurs/{id}` → suppression (admin)  
- Authentification **JWT** pour l’administration.  

### QR Code
- Génération avec une librairie côté backend (ex. ZXing pour Java).  
- Chaque exportateur a un **QR code unique lié à son ID**.  
- Vérification côté frontend via scan du QR code → requête à l’API (ou base locale en offline).  

---

## 🎨 UI / UX
- **Liste claire** avec filtres par région/type.  
- Icônes distinctes :  
  - 🟢 Exportateur agréé  
  - 🔵 Acheteur local certifié  
- **Page détail** avec bouton :  
  - 📞 Appeler  
  - 📧 Email  
- **Scanner QR code** accessible rapidement depuis la barre de navigation.  
- En mode offline, un message indique : “Données locales utilisées – dernière mise à jour : [date]”.  

---

## 🚀 Roadmap MVP
1. Mise en place de la base PostgreSQL avec table `exportateurs`.  
2. API Spring Boot pour gérer la liste et la vérification QR.  
3. Génération et stockage des QR codes.  
4. Frontend React avec :  
   - Liste + filtre  
   - Page détail  
   - Scan QR code  
5. Mode hors-ligne : stockage de la liste et vérification QR code offline.  

---

## ✅ Critères de succès
- L’utilisateur peut **consulter la liste complète des exportateurs agréés** même sans connexion Internet.  
- Le scan d’un QR code affiche immédiatement si l’entité est **officielle** ou **non valide**.  
- Le système est mis à jour automatiquement quand une connexion Internet est disponible.  
- Les arnaques liées aux faux acheteurs diminuent grâce à une meilleure transparence.
