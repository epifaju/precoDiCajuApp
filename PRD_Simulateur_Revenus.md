# PRD – Fonctionnalité : Simulateur de revenus

## 🎯 Objectif

Permettre aux producteurs de cajou de **simuler leurs revenus potentiels** en fonction de la quantité produite, du prix du marché et des coûts associés.  
Cette fonctionnalité aide les producteurs à mieux **planifier leur saison** et à prendre des décisions plus éclairées sur la vente de leur récolte.

---

## 📱 Fonctionnalités clés

1. **Formulaire de simulation** :
   - Quantité de cajou (kg)
   - Prix au kg (soit manuel, soit automatiquement rempli avec le prix moyen actuel)
   - Frais de transport (optionnel)
   - Frais divers (sacs, main-d’œuvre, etc.)
2. **Calcul automatique** des revenus :
   - Revenu brut = Quantité × Prix au kg
   - Dépenses totales = Transport + Divers
   - Revenu net = Revenu brut – Dépenses totales
3. **Historique des simulations** enregistrées localement.
4. **Mode hors-ligne** : simulation disponible même sans connexion Internet.
5. **Export PDF** pour que le producteur puisse imprimer ou partager sa simulation.

---

## 🛠 Spécifications techniques

### Frontend (React + Tailwind CSS)

- Composants :
  - `<RevenueSimulatorForm />` → formulaire de saisie
  - `<RevenueResult />` → affichage du calcul en temps réel
  - `<SimulationHistory />` → liste des simulations passées
- Calcul effectué **côté frontend** pour rapidité et mode hors-ligne.
- Stockage local avec **IndexedDB** pour conserver l’historique.

### Backend (Spring Boot + PostgreSQL)

- Stockage côté serveur :
  - Table `simulations` :
    - `id` (UUID)
    - `user_id` (UUID)
    - `quantite` (float)
    - `prix_kg` (float)
    - `transport` (float)
    - `frais_divers` (float)
    - `revenu_net` (float)
    - `date_simulation` (timestamp)
- Endpoints :
  - `POST /api/simulations` → enregistrer une simulation
  - `GET /api/simulations` → récupérer les simulations d’un utilisateur

### Formules de calcul

- **Revenu brut** = `quantite * prix_kg`
- **Dépenses totales** = `transport + frais_divers`
- **Revenu net** = `revenu_brut - depenses_totales`

---

## 🎨 UI / UX

- Formulaire simple avec champs numériques et curseurs.
- Résultat affiché en temps réel sous le formulaire.
- Graphique en barres pour visualiser revenus bruts vs dépenses vs net.
- Historique sous forme de liste avec date et revenu net.

---

## 🚀 Roadmap MVP

1. Création du formulaire React pour saisir les données.
2. Calcul automatique des résultats côté frontend.
3. Affichage clair du résultat net avec mise en avant en vert/rouge (positif/négatif).
4. Stockage local (IndexedDB) pour l’historique.
5. Mode hors-ligne fonctionnel.

---

## ✅ Critères de succès

- L’utilisateur peut saisir ses données et obtenir un calcul instantané de son revenu net.
- L’historique de simulations reste disponible même sans connexion Internet.
- Les calculs sont corrects et transparents (affichage des formules).
- L’utilisateur peut exporter ses résultats ou les partager.
