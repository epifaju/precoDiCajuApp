package gw.precaju.service;

import gw.precaju.entity.Price;
import gw.precaju.repository.PriceRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Service d'analyse GPS pour les données de géolocalisation
 * Fournit des analyses statistiques et des calculs de distances
 */
@Service
public class GpsAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(GpsAnalysisService.class);

    @Autowired
    private PriceRepository priceRepository;

    @Autowired
    private GpsValidationService gpsValidationService;

    // Rayon de la Terre en mètres
    private static final double EARTH_RADIUS = 6371000.0;

    /**
     * Analyse les données GPS d'une région spécifique
     */
    public RegionGpsAnalysis analyzeRegionGps(String regionCode, LocalDate fromDate, LocalDate toDate) {
        logger.debug("Analyzing GPS data for region: {} from {} to {}", regionCode, fromDate, toDate);

        List<Price> prices = priceRepository.findPricesForStatistics(regionCode, null, fromDate);

        // Filtrer par date si spécifiée
        if (toDate != null) {
            prices = prices.stream()
                    .filter(price -> !price.getRecordedDate().isAfter(toDate))
                    .collect(Collectors.toList());
        }

        // Filtrer les prix avec des coordonnées GPS
        List<Price> pricesWithGps = prices.stream()
                .filter(price -> price.getGpsLat() != null && price.getGpsLng() != null)
                .collect(Collectors.toList());

        RegionGpsAnalysis analysis = new RegionGpsAnalysis();
        analysis.setRegionCode(regionCode);
        analysis.setFromDate(fromDate);
        analysis.setToDate(toDate);
        analysis.setTotalPrices(prices.size());
        analysis.setPricesWithGps(pricesWithGps.size());
        analysis.setGpsCoveragePercentage(calculateGpsCoverage(prices.size(), pricesWithGps.size()));

        if (pricesWithGps.isEmpty()) {
            logger.debug("No GPS data found for region: {}", regionCode);
            return analysis;
        }

        // Calculer les statistiques de distribution
        calculateDistributionStats(pricesWithGps, analysis);

        // Calculer les clusters GPS
        calculateGpsClusters(pricesWithGps, analysis);

        // Analyser la qualité des données GPS
        analyzeGpsQuality(pricesWithGps, analysis);

        // Calculer les distances moyennes
        calculateAverageDistances(pricesWithGps, analysis);

        logger.debug("GPS analysis completed for region: {} - {} prices with GPS",
                regionCode, pricesWithGps.size());

        return analysis;
    }

    /**
     * Trouve les prix les plus proches d'une position GPS donnée
     */
    public List<NearbyPrice> findNearbyPrices(BigDecimal latitude, BigDecimal longitude,
            BigDecimal radiusKm, int maxResults) {
        logger.debug("Finding prices near coordinates: {}, {} within {}km", latitude, longitude, radiusKm);

        List<Price> allPrices = priceRepository.findAllActive(null).getContent();

        List<NearbyPrice> nearbyPrices = allPrices.stream()
                .filter(price -> price.getGpsLat() != null && price.getGpsLng() != null)
                .map(price -> {
                    BigDecimal distance = calculateDistance(latitude, longitude,
                            price.getGpsLat(), price.getGpsLng());
                    return new NearbyPrice(price, distance);
                })
                .filter(nearbyPrice -> nearbyPrice.getDistanceKm().compareTo(radiusKm) <= 0)
                .sorted(Comparator.comparing(NearbyPrice::getDistanceKm))
                .limit(maxResults)
                .collect(Collectors.toList());

        logger.debug("Found {} nearby prices within {}km", nearbyPrices.size(), radiusKm);
        return nearbyPrices;
    }

    /**
     * Calcule les statistiques de densité GPS pour une région
     */
    public GpsDensityStats calculateGpsDensity(String regionCode, LocalDate fromDate, LocalDate toDate) {
        logger.debug("Calculating GPS density for region: {}", regionCode);

        List<Price> prices = priceRepository.findPricesForStatistics(regionCode, null, fromDate);

        if (toDate != null) {
            prices = prices.stream()
                    .filter(price -> !price.getRecordedDate().isAfter(toDate))
                    .collect(Collectors.toList());
        }

        List<Price> pricesWithGps = prices.stream()
                .filter(price -> price.getGpsLat() != null && price.getGpsLng() != null)
                .collect(Collectors.toList());

        if (pricesWithGps.isEmpty()) {
            return new GpsDensityStats(regionCode, 0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO);
        }

        // Calculer la zone couverte (approximation simple)
        BigDecimal minLat = pricesWithGps.stream()
                .map(Price::getGpsLat)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxLat = pricesWithGps.stream()
                .map(Price::getGpsLat)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal minLng = pricesWithGps.stream()
                .map(Price::getGpsLng)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        BigDecimal maxLng = pricesWithGps.stream()
                .map(Price::getGpsLng)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        // Calculer la zone approximative en km²
        BigDecimal areaKm2 = calculateArea(minLat, maxLat, minLng, maxLng);

        // Calculer la densité
        BigDecimal density = areaKm2.compareTo(BigDecimal.ZERO) > 0
                ? new BigDecimal(pricesWithGps.size()).divide(areaKm2, 4, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Calculer la distance moyenne entre les points
        BigDecimal averageDistance = calculateAverageDistanceBetweenPoints(pricesWithGps);

        return new GpsDensityStats(regionCode, pricesWithGps.size(), areaKm2, density, averageDistance);
    }

    /**
     * Calcule le pourcentage de couverture GPS
     */
    private BigDecimal calculateGpsCoverage(int totalPrices, int pricesWithGps) {
        if (totalPrices == 0) {
            return BigDecimal.ZERO;
        }
        return new BigDecimal(pricesWithGps)
                .multiply(new BigDecimal("100"))
                .divide(new BigDecimal(totalPrices), 2, RoundingMode.HALF_UP);
    }

    /**
     * Calcule les statistiques de distribution
     */
    private void calculateDistributionStats(List<Price> prices, RegionGpsAnalysis analysis) {
        if (prices.isEmpty()) {
            return;
        }

        // Calculer le centre géographique
        BigDecimal centerLat = prices.stream()
                .map(Price::getGpsLat)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(prices.size()), 8, RoundingMode.HALF_UP);

        BigDecimal centerLng = prices.stream()
                .map(Price::getGpsLng)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(new BigDecimal(prices.size()), 8, RoundingMode.HALF_UP);

        analysis.setGeographicCenterLat(centerLat);
        analysis.setGeographicCenterLng(centerLng);

        // Calculer les limites
        analysis.setMinLatitude(
                prices.stream().map(Price::getGpsLat).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        analysis.setMaxLatitude(
                prices.stream().map(Price::getGpsLat).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        analysis.setMinLongitude(
                prices.stream().map(Price::getGpsLng).min(BigDecimal::compareTo).orElse(BigDecimal.ZERO));
        analysis.setMaxLongitude(
                prices.stream().map(Price::getGpsLng).max(BigDecimal::compareTo).orElse(BigDecimal.ZERO));

        // Calculer la distance maximale du centre
        BigDecimal maxDistanceFromCenter = prices.stream()
                .map(price -> calculateDistance(centerLat, centerLng, price.getGpsLat(), price.getGpsLng()))
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);

        analysis.setMaxDistanceFromCenter(maxDistanceFromCenter);
    }

    /**
     * Calcule les clusters GPS (groupes de points proches)
     */
    private void calculateGpsClusters(List<Price> prices, RegionGpsAnalysis analysis) {
        if (prices.size() < 2) {
            return;
        }

        List<GpsCluster> clusters = new ArrayList<>();
        Set<Price> processed = new HashSet<>();

        for (Price price : prices) {
            if (processed.contains(price)) {
                continue;
            }

            GpsCluster cluster = new GpsCluster();
            cluster.addPrice(price);
            processed.add(price);

            // Trouver les points proches (dans un rayon de 1km)
            for (Price otherPrice : prices) {
                if (processed.contains(otherPrice)) {
                    continue;
                }

                BigDecimal distance = calculateDistance(price.getGpsLat(), price.getGpsLng(),
                        otherPrice.getGpsLat(), otherPrice.getGpsLng());

                if (distance.compareTo(new BigDecimal("1000")) <= 0) { // 1km
                    cluster.addPrice(otherPrice);
                    processed.add(otherPrice);
                }
            }

            if (cluster.getPriceCount() > 1) {
                clusters.add(cluster);
            }
        }

        analysis.setClusters(clusters);
        analysis.setClusterCount(clusters.size());
    }

    /**
     * Analyse la qualité des données GPS
     */
    private void analyzeGpsQuality(List<Price> prices, RegionGpsAnalysis analysis) {
        int validCount = 0;
        int invalidCount = 0;
        BigDecimal totalQualityScore = BigDecimal.ZERO;

        for (Price price : prices) {
            GpsValidationService.GpsValidationResult validation = gpsValidationService.validateGpsCoordinates(
                    price.getGpsLat(), price.getGpsLng(), null, null);

            if (validation.isValid()) {
                validCount++;
                totalQualityScore = totalQualityScore.add(validation.getQualityScore());
            } else {
                invalidCount++;
            }
        }

        analysis.setValidGpsCount(validCount);
        analysis.setInvalidGpsCount(invalidCount);
        analysis.setGpsQualityPercentage(calculateGpsCoverage(prices.size(), validCount));

        if (validCount > 0) {
            analysis.setAverageQualityScore(
                    totalQualityScore.divide(new BigDecimal(validCount), 2, RoundingMode.HALF_UP));
        }
    }

    /**
     * Calcule les distances moyennes
     */
    private void calculateAverageDistances(List<Price> prices, RegionGpsAnalysis analysis) {
        if (prices.size() < 2) {
            return;
        }

        BigDecimal totalDistance = BigDecimal.ZERO;
        int distanceCount = 0;

        for (int i = 0; i < prices.size(); i++) {
            for (int j = i + 1; j < prices.size(); j++) {
                BigDecimal distance = calculateDistance(
                        prices.get(i).getGpsLat(), prices.get(i).getGpsLng(),
                        prices.get(j).getGpsLat(), prices.get(j).getGpsLng());

                totalDistance = totalDistance.add(distance);
                distanceCount++;
            }
        }

        if (distanceCount > 0) {
            analysis.setAverageDistanceBetweenPoints(
                    totalDistance.divide(new BigDecimal(distanceCount), 2, RoundingMode.HALF_UP));
        }
    }

    /**
     * Calcule la distance moyenne entre tous les points
     */
    private BigDecimal calculateAverageDistanceBetweenPoints(List<Price> prices) {
        if (prices.size() < 2) {
            return BigDecimal.ZERO;
        }

        BigDecimal totalDistance = BigDecimal.ZERO;
        int distanceCount = 0;

        for (int i = 0; i < prices.size(); i++) {
            for (int j = i + 1; j < prices.size(); j++) {
                BigDecimal distance = calculateDistance(
                        prices.get(i).getGpsLat(), prices.get(i).getGpsLng(),
                        prices.get(j).getGpsLat(), prices.get(j).getGpsLng());

                totalDistance = totalDistance.add(distance);
                distanceCount++;
            }
        }

        return distanceCount > 0 ? totalDistance.divide(new BigDecimal(distanceCount), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;
    }

    /**
     * Calcule la distance entre deux points GPS (formule de Haversine)
     */
    private BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lng1,
            BigDecimal lat2, BigDecimal lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return BigDecimal.ZERO;
        }

        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lng1Rad = Math.toRadians(lng1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());
        double lng2Rad = Math.toRadians(lng2.doubleValue());

        double dLat = lat2Rad - lat1Rad;
        double dLng = lng2Rad - lng1Rad;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                        Math.sin(dLng / 2) * Math.sin(dLng / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return new BigDecimal(EARTH_RADIUS * c).setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Calcule l'aire approximative d'une zone rectangulaire
     */
    private BigDecimal calculateArea(BigDecimal minLat, BigDecimal maxLat,
            BigDecimal minLng, BigDecimal maxLng) {
        // Conversion approximative en km²
        double latDiff = maxLat.subtract(minLat).doubleValue();
        double lngDiff = maxLng.subtract(minLng).doubleValue();

        // Approximation simple pour de petites zones
        double areaKm2 = latDiff * lngDiff * 111.32 * 111.32 * Math.cos(Math.toRadians(minLat.doubleValue()));

        return new BigDecimal(areaKm2).setScale(4, RoundingMode.HALF_UP);
    }

    /**
     * Classe pour représenter un prix proche
     */
    public static class NearbyPrice {
        private Price price;
        private BigDecimal distanceKm;

        public NearbyPrice(Price price, BigDecimal distanceMeters) {
            this.price = price;
            this.distanceKm = distanceMeters.divide(new BigDecimal("1000"), 3, RoundingMode.HALF_UP);
        }

        public Price getPrice() {
            return price;
        }

        public BigDecimal getDistanceKm() {
            return distanceKm;
        }
    }

    /**
     * Classe pour représenter un cluster GPS
     */
    public static class GpsCluster {
        private List<Price> prices = new ArrayList<>();
        private BigDecimal centerLat;
        private BigDecimal centerLng;
        private BigDecimal radius;

        public void addPrice(Price price) {
            prices.add(price);
            calculateCenter();
        }

        private void calculateCenter() {
            if (prices.isEmpty()) {
                return;
            }

            centerLat = prices.stream()
                    .map(Price::getGpsLat)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(prices.size()), 8, RoundingMode.HALF_UP);

            centerLng = prices.stream()
                    .map(Price::getGpsLng)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(new BigDecimal(prices.size()), 8, RoundingMode.HALF_UP);

            // Calculer le rayon (distance maximale du centre)
            radius = prices.stream()
                    .map(price -> calculateDistance(centerLat, centerLng, price.getGpsLat(), price.getGpsLng()))
                    .max(BigDecimal::compareTo)
                    .orElse(BigDecimal.ZERO);
        }

        private BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lng1,
                BigDecimal lat2, BigDecimal lng2) {
            double lat1Rad = Math.toRadians(lat1.doubleValue());
            double lng1Rad = Math.toRadians(lng1.doubleValue());
            double lat2Rad = Math.toRadians(lat2.doubleValue());
            double lng2Rad = Math.toRadians(lng2.doubleValue());

            double dLat = lat2Rad - lat1Rad;
            double dLng = lng2Rad - lng1Rad;

            double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                            Math.sin(dLng / 2) * Math.sin(dLng / 2);

            double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            return new BigDecimal(EARTH_RADIUS * c).setScale(2, RoundingMode.HALF_UP);
        }

        public List<Price> getPrices() {
            return prices;
        }

        public int getPriceCount() {
            return prices.size();
        }

        public BigDecimal getCenterLat() {
            return centerLat;
        }

        public BigDecimal getCenterLng() {
            return centerLng;
        }

        public BigDecimal getRadius() {
            return radius;
        }
    }

    /**
     * Classe pour les statistiques de densité GPS
     */
    public static class GpsDensityStats {
        private String regionCode;
        private int pointCount;
        private BigDecimal areaKm2;
        private BigDecimal density; // points par km²
        private BigDecimal averageDistance; // distance moyenne entre points

        public GpsDensityStats(String regionCode, int pointCount, BigDecimal areaKm2,
                BigDecimal density, BigDecimal averageDistance) {
            this.regionCode = regionCode;
            this.pointCount = pointCount;
            this.areaKm2 = areaKm2;
            this.density = density;
            this.averageDistance = averageDistance;
        }

        // Getters
        public String getRegionCode() {
            return regionCode;
        }

        public int getPointCount() {
            return pointCount;
        }

        public BigDecimal getAreaKm2() {
            return areaKm2;
        }

        public BigDecimal getDensity() {
            return density;
        }

        public BigDecimal getAverageDistance() {
            return averageDistance;
        }
    }

    /**
     * Classe pour l'analyse GPS d'une région
     */
    public static class RegionGpsAnalysis {
        private String regionCode;
        private LocalDate fromDate;
        private LocalDate toDate;
        private int totalPrices;
        private int pricesWithGps;
        private BigDecimal gpsCoveragePercentage;
        private BigDecimal geographicCenterLat;
        private BigDecimal geographicCenterLng;
        private BigDecimal minLatitude;
        private BigDecimal maxLatitude;
        private BigDecimal minLongitude;
        private BigDecimal maxLongitude;
        private BigDecimal maxDistanceFromCenter;
        private List<GpsCluster> clusters;
        private int clusterCount;
        private int validGpsCount;
        private int invalidGpsCount;
        private BigDecimal gpsQualityPercentage;
        private BigDecimal averageQualityScore;
        private BigDecimal averageDistanceBetweenPoints;

        // Getters et setters
        public String getRegionCode() {
            return regionCode;
        }

        public void setRegionCode(String regionCode) {
            this.regionCode = regionCode;
        }

        public LocalDate getFromDate() {
            return fromDate;
        }

        public void setFromDate(LocalDate fromDate) {
            this.fromDate = fromDate;
        }

        public LocalDate getToDate() {
            return toDate;
        }

        public void setToDate(LocalDate toDate) {
            this.toDate = toDate;
        }

        public int getTotalPrices() {
            return totalPrices;
        }

        public void setTotalPrices(int totalPrices) {
            this.totalPrices = totalPrices;
        }

        public int getPricesWithGps() {
            return pricesWithGps;
        }

        public void setPricesWithGps(int pricesWithGps) {
            this.pricesWithGps = pricesWithGps;
        }

        public BigDecimal getGpsCoveragePercentage() {
            return gpsCoveragePercentage;
        }

        public void setGpsCoveragePercentage(BigDecimal gpsCoveragePercentage) {
            this.gpsCoveragePercentage = gpsCoveragePercentage;
        }

        public BigDecimal getGeographicCenterLat() {
            return geographicCenterLat;
        }

        public void setGeographicCenterLat(BigDecimal geographicCenterLat) {
            this.geographicCenterLat = geographicCenterLat;
        }

        public BigDecimal getGeographicCenterLng() {
            return geographicCenterLng;
        }

        public void setGeographicCenterLng(BigDecimal geographicCenterLng) {
            this.geographicCenterLng = geographicCenterLng;
        }

        public BigDecimal getMinLatitude() {
            return minLatitude;
        }

        public void setMinLatitude(BigDecimal minLatitude) {
            this.minLatitude = minLatitude;
        }

        public BigDecimal getMaxLatitude() {
            return maxLatitude;
        }

        public void setMaxLatitude(BigDecimal maxLatitude) {
            this.maxLatitude = maxLatitude;
        }

        public BigDecimal getMinLongitude() {
            return minLongitude;
        }

        public void setMinLongitude(BigDecimal minLongitude) {
            this.minLongitude = minLongitude;
        }

        public BigDecimal getMaxLongitude() {
            return maxLongitude;
        }

        public void setMaxLongitude(BigDecimal maxLongitude) {
            this.maxLongitude = maxLongitude;
        }

        public BigDecimal getMaxDistanceFromCenter() {
            return maxDistanceFromCenter;
        }

        public void setMaxDistanceFromCenter(BigDecimal maxDistanceFromCenter) {
            this.maxDistanceFromCenter = maxDistanceFromCenter;
        }

        public List<GpsCluster> getClusters() {
            return clusters;
        }

        public void setClusters(List<GpsCluster> clusters) {
            this.clusters = clusters;
        }

        public int getClusterCount() {
            return clusterCount;
        }

        public void setClusterCount(int clusterCount) {
            this.clusterCount = clusterCount;
        }

        public int getValidGpsCount() {
            return validGpsCount;
        }

        public void setValidGpsCount(int validGpsCount) {
            this.validGpsCount = validGpsCount;
        }

        public int getInvalidGpsCount() {
            return invalidGpsCount;
        }

        public void setInvalidGpsCount(int invalidGpsCount) {
            this.invalidGpsCount = invalidGpsCount;
        }

        public BigDecimal getGpsQualityPercentage() {
            return gpsQualityPercentage;
        }

        public void setGpsQualityPercentage(BigDecimal gpsQualityPercentage) {
            this.gpsQualityPercentage = gpsQualityPercentage;
        }

        public BigDecimal getAverageQualityScore() {
            return averageQualityScore;
        }

        public void setAverageQualityScore(BigDecimal averageQualityScore) {
            this.averageQualityScore = averageQualityScore;
        }

        public BigDecimal getAverageDistanceBetweenPoints() {
            return averageDistanceBetweenPoints;
        }

        public void setAverageDistanceBetweenPoints(BigDecimal averageDistanceBetweenPoints) {
            this.averageDistanceBetweenPoints = averageDistanceBetweenPoints;
        }
    }
}
