package gw.precaju.service;

import gw.precaju.entity.Region;
import gw.precaju.repository.RegionRepository;
import gw.precaju.dto.request.CreatePriceRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Optional;

/**
 * Service de validation GPS avancée pour la Guinée-Bissau
 * Valide les coordonnées GPS selon les critères spécifiques au pays
 */
@Service
public class GpsValidationService {

    private static final Logger logger = LoggerFactory.getLogger(GpsValidationService.class);

    @Autowired
    private RegionRepository regionRepository;

    // Limites géographiques de la Guinée-Bissau
    private static final BigDecimal GUINEA_BISSAU_MIN_LAT = new BigDecimal("10.5");
    private static final BigDecimal GUINEA_BISSAU_MAX_LAT = new BigDecimal("12.7");
    private static final BigDecimal GUINEA_BISSAU_MIN_LNG = new BigDecimal("-16.8");
    private static final BigDecimal GUINEA_BISSAU_MAX_LNG = new BigDecimal("-13.6");

    // Précision GPS acceptable (en mètres)
    private static final BigDecimal ACCEPTABLE_ACCURACY = new BigDecimal("100");
    private static final BigDecimal EXCELLENT_ACCURACY = new BigDecimal("10");
    private static final BigDecimal GOOD_ACCURACY = new BigDecimal("25");
    private static final BigDecimal FAIR_ACCURACY = new BigDecimal("50");

    // Distance maximale acceptable entre GPS et région (en mètres)
    private static final BigDecimal MAX_DISTANCE_FROM_REGION = new BigDecimal("50000"); // 50km

    /**
     * Valide les coordonnées GPS selon les critères de la Guinée-Bissau
     */
    public GpsValidationResult validateGpsCoordinates(BigDecimal latitude, BigDecimal longitude,
            BigDecimal accuracy, String regionCode) {
        logger.debug("Validating GPS coordinates: lat={}, lng={}, accuracy={}, region={}",
                latitude, longitude, accuracy, regionCode);

        GpsValidationResult result = new GpsValidationResult();
        result.setLatitude(latitude);
        result.setLongitude(longitude);
        result.setAccuracy(accuracy);
        result.setRegionCode(regionCode);

        // 1. Validation des limites géographiques
        if (!isWithinGuineaBissauBounds(latitude, longitude)) {
            result.addError("GPS coordinates are outside Guinea-Bissau boundaries");
            result.setValid(false);
            return result;
        }

        // 2. Validation de la précision
        if (accuracy != null) {
            GpsAccuracyLevel accuracyLevel = validateAccuracy(accuracy);
            result.setAccuracyLevel(accuracyLevel);

            if (accuracyLevel == GpsAccuracyLevel.POOR) {
                result.addWarning("GPS accuracy is poor (>" + FAIR_ACCURACY + "m)");
            }
        }

        // 3. Validation de cohérence avec la région
        if (regionCode != null && !regionCode.trim().isEmpty()) {
            RegionConsistencyResult regionResult = validateRegionConsistency(latitude, longitude, regionCode);
            result.setRegionConsistency(regionResult);

            if (!regionResult.isConsistent()) {
                result.addWarning("GPS coordinates may not be consistent with selected region: " +
                        regionResult.getDistanceFromRegion() + "m from region center");
            }
        }

        // 4. Validation de plausibilité
        PlausibilityResult plausibility = validatePlausibility(latitude, longitude);
        result.setPlausibility(plausibility);

        if (!plausibility.isPlausible()) {
            result.addWarning("GPS coordinates may not be plausible: " + plausibility.getReason());
        }

        // 5. Calcul du score de qualité
        result.setQualityScore(calculateQualityScore(result));

        result.setValid(true);
        logger.debug("GPS validation completed: valid={}, qualityScore={}",
                result.isValid(), result.getQualityScore());

        return result;
    }

    /**
     * Vérifie si les coordonnées sont dans les limites de la Guinée-Bissau
     */
    private boolean isWithinGuineaBissauBounds(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null || longitude == null) {
            return false;
        }

        return latitude.compareTo(GUINEA_BISSAU_MIN_LAT) >= 0 &&
                latitude.compareTo(GUINEA_BISSAU_MAX_LAT) <= 0 &&
                longitude.compareTo(GUINEA_BISSAU_MIN_LNG) >= 0 &&
                longitude.compareTo(GUINEA_BISSAU_MAX_LNG) <= 0;
    }

    /**
     * Valide la précision GPS et détermine le niveau
     */
    private GpsAccuracyLevel validateAccuracy(BigDecimal accuracy) {
        if (accuracy == null) {
            return GpsAccuracyLevel.UNKNOWN;
        }

        if (accuracy.compareTo(EXCELLENT_ACCURACY) <= 0) {
            return GpsAccuracyLevel.EXCELLENT;
        } else if (accuracy.compareTo(GOOD_ACCURACY) <= 0) {
            return GpsAccuracyLevel.GOOD;
        } else if (accuracy.compareTo(FAIR_ACCURACY) <= 0) {
            return GpsAccuracyLevel.FAIR;
        } else if (accuracy.compareTo(ACCEPTABLE_ACCURACY) <= 0) {
            return GpsAccuracyLevel.POOR;
        } else {
            return GpsAccuracyLevel.INVALID;
        }
    }

    /**
     * Valide la cohérence entre les coordonnées GPS et la région sélectionnée
     */
    private RegionConsistencyResult validateRegionConsistency(BigDecimal latitude, BigDecimal longitude,
            String regionCode) {
        RegionConsistencyResult result = new RegionConsistencyResult();

        try {
            Optional<Region> regionOpt = regionRepository.findByCodeAndActiveTrue(regionCode);
            if (regionOpt.isEmpty()) {
                result.setConsistent(false);
                result.setReason("Region not found");
                return result;
            }

            Region region = regionOpt.get();

            // Calculer la distance entre les coordonnées GPS et le centre de la région
            if (region.getCenterLatitude() != null && region.getCenterLongitude() != null) {
                BigDecimal distance = calculateDistance(latitude, longitude,
                        region.getCenterLatitude(), region.getCenterLongitude());

                result.setDistanceFromRegion(distance);
                result.setRegionCenterLat(region.getCenterLatitude());
                result.setRegionCenterLng(region.getCenterLongitude());

                // Considérer comme cohérent si la distance est raisonnable
                if (distance.compareTo(MAX_DISTANCE_FROM_REGION) <= 0) {
                    result.setConsistent(true);
                    result.setReason("Coordinates are within reasonable distance from region center");
                } else {
                    result.setConsistent(false);
                    result.setReason("Coordinates are too far from region center");
                }
            } else {
                // Si la région n'a pas de coordonnées GPS, considérer comme cohérent
                result.setConsistent(true);
                result.setReason("Region has no GPS coordinates - validation skipped");
                result.setDistanceFromRegion(BigDecimal.ZERO);
                result.setRegionCenterLat(BigDecimal.ZERO);
                result.setRegionCenterLng(BigDecimal.ZERO);
            }

        } catch (Exception e) {
            logger.error("Error validating region consistency", e);
            result.setConsistent(false);
            result.setReason("Error validating region consistency: " + e.getMessage());
        }

        return result;
    }

    /**
     * Valide la plausibilité des coordonnées GPS
     */
    private PlausibilityResult validatePlausibility(BigDecimal latitude, BigDecimal longitude) {
        PlausibilityResult result = new PlausibilityResult();

        // Vérifier si les coordonnées sont dans l'océan (approximatif)
        if (isInOcean(latitude, longitude)) {
            result.setPlausible(false);
            result.setReason("Coordinates appear to be in the ocean");
            return result;
        }

        // Vérifier si les coordonnées sont dans des zones inhabitées connues
        if (isInUninhabitedArea(latitude, longitude)) {
            result.setPlausible(false);
            result.setReason("Coordinates appear to be in an uninhabited area");
            return result;
        }

        result.setPlausible(true);
        result.setReason("Coordinates appear to be in a plausible location");
        return result;
    }

    /**
     * Vérifie si les coordonnées sont dans l'océan (approximation simple)
     */
    private boolean isInOcean(BigDecimal latitude, BigDecimal longitude) {
        // Approximation simple basée sur les coordonnées
        // Les zones océaniques autour de la Guinée-Bissau
        return (longitude.compareTo(new BigDecimal("-16.5")) < 0) || // Trop à l'ouest
                (longitude.compareTo(new BigDecimal("-13.8")) > 0) || // Trop à l'est
                (latitude.compareTo(new BigDecimal("10.8")) < 0) || // Trop au sud
                (latitude.compareTo(new BigDecimal("12.5")) > 0); // Trop au nord
    }

    /**
     * Vérifie si les coordonnées sont dans des zones inhabitées
     */
    private boolean isInUninhabitedArea(BigDecimal latitude, BigDecimal longitude) {
        // Zones de mangroves et forêts denses (approximation)
        // Ces zones sont généralement inhabitées
        return (latitude.compareTo(new BigDecimal("11.0")) >= 0 &&
                latitude.compareTo(new BigDecimal("11.5")) <= 0 &&
                longitude.compareTo(new BigDecimal("-15.8")) >= 0 &&
                longitude.compareTo(new BigDecimal("-15.2")) <= 0);
    }

    /**
     * Calcule la distance entre deux points GPS (formule de Haversine)
     */
    private BigDecimal calculateDistance(BigDecimal lat1, BigDecimal lng1,
            BigDecimal lat2, BigDecimal lng2) {
        if (lat1 == null || lng1 == null || lat2 == null || lng2 == null) {
            return BigDecimal.ZERO;
        }

        final double EARTH_RADIUS = 6371000; // Rayon de la Terre en mètres

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
     * Calcule un score de qualité global pour les coordonnées GPS
     */
    private BigDecimal calculateQualityScore(GpsValidationResult result) {
        BigDecimal score = new BigDecimal("100");

        // Pénalité pour précision
        if (result.getAccuracyLevel() != null) {
            switch (result.getAccuracyLevel()) {
                case EXCELLENT:
                    // Pas de pénalité
                    break;
                case GOOD:
                    score = score.subtract(new BigDecimal("10"));
                    break;
                case FAIR:
                    score = score.subtract(new BigDecimal("25"));
                    break;
                case POOR:
                    score = score.subtract(new BigDecimal("50"));
                    break;
                case INVALID:
                    score = score.subtract(new BigDecimal("80"));
                    break;
                case UNKNOWN:
                    score = score.subtract(new BigDecimal("30"));
                    break;
            }
        }

        // Pénalité pour cohérence avec la région
        if (result.getRegionConsistency() != null && !result.getRegionConsistency().isConsistent()) {
            score = score.subtract(new BigDecimal("20"));
        }

        // Pénalité pour plausibilité
        if (result.getPlausibility() != null && !result.getPlausibility().isPlausible()) {
            score = score.subtract(new BigDecimal("30"));
        }

        return score.max(BigDecimal.ZERO).setScale(1, RoundingMode.HALF_UP);
    }

    /**
     * Valide les coordonnées GPS pour un prix
     */
    public GpsValidationResult validatePriceGps(CreatePriceRequest request) {
        return validateGpsCoordinates(
                request.getGpsLat(),
                request.getGpsLng(),
                null, // L'accuracy n'est pas fournie dans le request actuel
                request.getRegionCode());
    }

    /**
     * Énumération des niveaux de précision GPS
     */
    public enum GpsAccuracyLevel {
        EXCELLENT, GOOD, FAIR, POOR, INVALID, UNKNOWN
    }

    /**
     * Résultat de validation GPS
     */
    public static class GpsValidationResult {
        private BigDecimal latitude;
        private BigDecimal longitude;
        private BigDecimal accuracy;
        private String regionCode;
        private boolean valid;
        private GpsAccuracyLevel accuracyLevel;
        private RegionConsistencyResult regionConsistency;
        private PlausibilityResult plausibility;
        private BigDecimal qualityScore;
        private List<String> errors = new java.util.ArrayList<>();
        private List<String> warnings = new java.util.ArrayList<>();

        // Getters et setters
        public BigDecimal getLatitude() {
            return latitude;
        }

        public void setLatitude(BigDecimal latitude) {
            this.latitude = latitude;
        }

        public BigDecimal getLongitude() {
            return longitude;
        }

        public void setLongitude(BigDecimal longitude) {
            this.longitude = longitude;
        }

        public BigDecimal getAccuracy() {
            return accuracy;
        }

        public void setAccuracy(BigDecimal accuracy) {
            this.accuracy = accuracy;
        }

        public String getRegionCode() {
            return regionCode;
        }

        public void setRegionCode(String regionCode) {
            this.regionCode = regionCode;
        }

        public boolean isValid() {
            return valid;
        }

        public void setValid(boolean valid) {
            this.valid = valid;
        }

        public GpsAccuracyLevel getAccuracyLevel() {
            return accuracyLevel;
        }

        public void setAccuracyLevel(GpsAccuracyLevel accuracyLevel) {
            this.accuracyLevel = accuracyLevel;
        }

        public RegionConsistencyResult getRegionConsistency() {
            return regionConsistency;
        }

        public void setRegionConsistency(RegionConsistencyResult regionConsistency) {
            this.regionConsistency = regionConsistency;
        }

        public PlausibilityResult getPlausibility() {
            return plausibility;
        }

        public void setPlausibility(PlausibilityResult plausibility) {
            this.plausibility = plausibility;
        }

        public BigDecimal getQualityScore() {
            return qualityScore;
        }

        public void setQualityScore(BigDecimal qualityScore) {
            this.qualityScore = qualityScore;
        }

        public List<String> getErrors() {
            return errors;
        }

        public void setErrors(List<String> errors) {
            this.errors = errors;
        }

        public List<String> getWarnings() {
            return warnings;
        }

        public void setWarnings(List<String> warnings) {
            this.warnings = warnings;
        }

        public void addError(String error) {
            this.errors.add(error);
        }

        public void addWarning(String warning) {
            this.warnings.add(warning);
        }
    }

    /**
     * Résultat de cohérence avec la région
     */
    public static class RegionConsistencyResult {
        private boolean consistent;
        private String reason;
        private BigDecimal distanceFromRegion;
        private BigDecimal regionCenterLat;
        private BigDecimal regionCenterLng;

        // Getters et setters
        public boolean isConsistent() {
            return consistent;
        }

        public void setConsistent(boolean consistent) {
            this.consistent = consistent;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }

        public BigDecimal getDistanceFromRegion() {
            return distanceFromRegion;
        }

        public void setDistanceFromRegion(BigDecimal distanceFromRegion) {
            this.distanceFromRegion = distanceFromRegion;
        }

        public BigDecimal getRegionCenterLat() {
            return regionCenterLat;
        }

        public void setRegionCenterLat(BigDecimal regionCenterLat) {
            this.regionCenterLat = regionCenterLat;
        }

        public BigDecimal getRegionCenterLng() {
            return regionCenterLng;
        }

        public void setRegionCenterLng(BigDecimal regionCenterLng) {
            this.regionCenterLng = regionCenterLng;
        }
    }

    /**
     * Résultat de plausibilité
     */
    public static class PlausibilityResult {
        private boolean plausible;
        private String reason;

        // Getters et setters
        public boolean isPlausible() {
            return plausible;
        }

        public void setPlausible(boolean plausible) {
            this.plausible = plausible;
        }

        public String getReason() {
            return reason;
        }

        public void setReason(String reason) {
            this.reason = reason;
        }
    }
}
