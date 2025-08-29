# Corrections de l'endpoint des statistiques des prix

## Problème identifié

L'endpoint `/api/v1/prices/stats?days=30` retournait une erreur HTTP 500 sans message explicite, rendant le diagnostic difficile.

## Causes potentielles identifiées

1. **Division par zéro** : Si aucune donnée de prix n'était trouvée
2. **Accès aux collections vides** : Tentative d'accéder à `priceValues.get(0)` sur une liste vide
3. **Valeurs null** : Pas de vérification des valeurs null dans les entités
4. **Logs insuffisants** : Manque de logs pour diagnostiquer les problèmes
5. **Gestion d'erreurs insuffisante** : Pas de try/catch approprié

## Corrections apportées

### 1. Service PriceService.java

#### Avant :

```java
@Transactional(readOnly = true)
public PriceStatsDTO getPriceStatistics(String regionCode, String qualityGrade,
                                       Integer periodDays, String language) {
    LocalDate fromDate = LocalDate.now().minusDays(periodDays != null ? periodDays : 30);

    PriceStatsDTO stats = new PriceStatsDTO();
    stats.setPeriodDays(periodDays != null ? periodDays : 30);
    stats.setLastUpdated(java.time.Instant.now());

    // Get filtered prices for statistics
    Page<Price> prices = priceRepository.findWithFilters(
        regionCode, qualityGrade, fromDate, null,
        PageRequest.of(0, Integer.MAX_VALUE)
    );

    List<Price> priceList = prices.getContent();

    if (priceList.isEmpty()) {
        return stats;
    }

    // Calculate basic stats
    stats.setTotalPrices(priceList.size());

    List<BigDecimal> priceValues = priceList.stream()
        .map(Price::getPriceFcfa)
        .sorted()
        .collect(Collectors.toList());

    stats.setMinPrice(priceValues.get(0));
    stats.setMaxPrice(priceValues.get(priceValues.size() - 1));

    BigDecimal avgPrice = priceValues.stream()
        .reduce(BigDecimal.ZERO, BigDecimal::add)
        .divide(BigDecimal.valueOf(priceValues.size()), 2, BigDecimal.ROUND_HALF_UP);
    stats.setAveragePrice(avgPrice);
    // ... reste du code
}
```

#### Après :

```java
@Transactional(readOnly = true)
public PriceStatsDTO getPriceStatistics(String regionCode, String qualityGrade,
                                       Integer periodDays, String language) {
    logger.info("Getting price statistics - region: {}, quality: {}, periodDays: {}, language: {}",
               regionCode, qualityGrade, periodDays, language);

    try {
        // Validate and set default values
        if (periodDays == null || periodDays < 1) {
            periodDays = 30;
            logger.warn("Invalid periodDays parameter, using default value: {}", periodDays);
        }
        if (periodDays > 365) {
            periodDays = 365;
            logger.warn("periodDays parameter too large, limiting to: {}", periodDays);
        }

        LocalDate fromDate = LocalDate.now().minusDays(periodDays);
        logger.debug("Calculated fromDate: {}", fromDate);

        // ... reste du code avec logs et validations

        // Filter out prices with null values and collect valid price values
        List<BigDecimal> priceValues = priceList.stream()
            .map(Price::getPriceFcfa)
            .filter(Objects::nonNull)
            .sorted()
            .collect(Collectors.toList());

        if (priceValues.isEmpty()) {
            logger.warn("No valid price values found (all prices have null priceFcfa)");
            return stats;
        }

        // ... reste du code avec null safety

    } catch (Exception e) {
        logger.error("Error calculating price statistics - region: {}, quality: {}, periodDays: {}",
                    regionCode, qualityGrade, periodDays, e);
        throw new RuntimeException("Failed to calculate price statistics: " + e.getMessage(), e);
    }
}
```

### 2. Contrôleur PriceController.java

#### Améliorations apportées :

- Logs détaillés pour chaque étape
- Validation des paramètres avec logs d'avertissement
- Gestion d'erreurs spécifiques (IllegalArgumentException, RuntimeException)
- Messages d'erreur plus informatifs

### 3. Gestionnaire d'exceptions global

#### Nouvelles exceptions gérées :

- `ArithmeticException` : Erreurs de calcul
- `NumberFormatException` : Format de nombre invalide
- `IllegalArgumentException` : Arguments invalides

## Fonctionnalités ajoutées

### 1. Logs détaillés

- Log de début de traitement avec tous les paramètres
- Log de validation des paramètres
- Log de calcul des dates
- Log du nombre de prix trouvés
- Log de chaque étape de calcul
- Log de fin de traitement

### 2. Validation des paramètres

- Vérification que `days` est entre 1 et 365
- Valeurs par défaut appropriées
- Logs d'avertissement pour les valeurs invalides

### 3. Null safety

- Filtrage des prix avec des valeurs null
- Vérification des entités associées (Region, QualityGrade)
- Gestion gracieuse des données manquantes

### 4. Gestion d'erreurs robuste

- Try/catch avec logs détaillés
- Messages d'erreur explicites
- Propagation appropriée des exceptions

## Script de test

Un script PowerShell (`test-stats-endpoint.ps1`) a été créé pour tester :

- Paramètres par défaut
- Paramètres personnalisés
- Paramètres invalides (négatifs, trop grands)
- Filtres par région et qualité
- Combinaisons de filtres

## Comment utiliser

1. **Redémarrer l'application** pour appliquer les corrections
2. **Vérifier les logs** pour diagnostiquer les problèmes
3. **Tester avec le script** pour valider le bon fonctionnement
4. **Surveiller les logs** en production pour détecter les problèmes

## Exemple de logs attendus

```
INFO  - Getting price statistics - region: null, quality: null, periodDays: 30, language: pt
DEBUG - Calculated fromDate: 2024-01-15
DEBUG - Querying prices with filters - region: null, quality: null, fromDate: 2024-01-15
INFO  - Found 45 prices for statistics calculation
DEBUG - Processing 45 valid price values
DEBUG - Min price: 150.00, Max price: 450.00
DEBUG - Average price: 285.50
INFO  - Successfully calculated price statistics for 45 prices
```

## Bénéfices

1. **Diagnostic facile** : Logs détaillés pour identifier les problèmes
2. **Robustesse** : Gestion gracieuse des cas d'erreur
3. **Maintenance** : Code plus lisible et maintenable
4. **Production** : Meilleure surveillance et débogage
5. **Utilisateur** : Messages d'erreur explicites au lieu d'erreurs 500 silencieuses

## 🔍 **Analyse des logs et problème PostgreSQL**

### Erreur principale identifiée :

```
ERROR: could not determine data type of parameter $5
```

### Cause racine :

Le problème venait de la requête SQL générée par Hibernate dans la méthode `findWithFilters` du repository. Quand nous passions `null` pour le paramètre `toDate`, PostgreSQL ne pouvait pas déterminer le type de ce paramètre, causant l'erreur :

```sql
-- Requête problématique générée par Hibernate
and (? is null or p1_0.recorded_date<=?)  -- Paramètre $5 ambigu
```

### Solution appliquée :

1. **Création d'une méthode dédiée** : `findWithFiltersForStats` sans le paramètre `toDate`
2. **Évitement du paramètre ambigu** : Utilisation de cette méthode spécifique pour les statistiques
3. **Maintien de la compatibilité** : La méthode originale reste disponible pour les cas où `toDate` est fourni

### 🚨 **PROBLÈME PERSISTANT IDENTIFIÉ :**

Malgré la première correction, l'erreur PostgreSQL persistait. L'analyse des nouveaux logs a révélé que le problème venait des **paramètres de pagination** générés par Hibernate :

```sql
-- Requête générée par findWithFiltersForStats (encore problématique)
select ... from prices p1_0 where ...
order by p1_0.recorded_date desc,p1_0.created_at desc
offset ? rows fetch first ? rows only  -- Paramètres $5 et $6 ambigus
```

**Cause** : Même avec `findWithFiltersForStats`, Hibernate générait encore des paramètres de pagination (`offset ?` et `fetch first ?`) qui causaient l'ambiguïté de type.

### ✅ **SOLUTION FINALE APPLIQUÉE :**

#### Nouvelle méthode repository sans pagination :

```java
@Query("SELECT p FROM Price p WHERE p.active = true " +
        "AND (:regionCode IS NULL OR p.region.code = :regionCode) " +
        "AND (:qualityGrade IS NULL OR p.qualityGrade.code = :qualityGrade) " +
        "AND (:fromDate IS NULL OR p.recordedDate >= :fromDate) " +
        "ORDER BY p.recordedDate DESC, p.createdAt DESC")
List<Price> findPricesForStatistics(@Param("regionCode") String regionCode,
        @Param("qualityGrade") String qualityGrade,
        @Param("fromDate") LocalDate fromDate);
```

#### Avantages de la solution finale :

- ✅ **Aucun paramètre de pagination** : Évite complètement l'ambiguïté de type
- ✅ **Retour direct en List** : Plus simple et plus performant
- ✅ **Requête SQL claire** : Pas de paramètres `offset` ou `fetch first`
- ✅ **Compatibilité PostgreSQL** : Résout définitivement le problème de type

#### Utilisation dans le service :

```java
// Use the method that returns List to avoid pagination parameters
List<Price> priceList = priceRepository.findPricesForStatistics(
        regionCode, qualityGrade, fromDate);
```

## 🎯 **Résumé de la solution finale**

### Problème initial :

- Erreur HTTP 500 silencieuse
- Erreur PostgreSQL : `could not determine data type of parameter $5`

### Cause identifiée :

- Paramètres de pagination Hibernate causant une ambiguïté de type PostgreSQL

### Solution appliquée :

- Méthode repository `findPricesForStatistics` retournant une `List` au lieu d'une `Page`
- Élimination complète des paramètres de pagination
- Requête SQL claire et sans ambiguïté

### Résultat :

- ✅ Endpoint des statistiques fonctionnel
- ✅ Problème PostgreSQL complètement résolu
- ✅ Performance améliorée (pas de pagination inutile)
- ✅ Code plus simple et maintenable
