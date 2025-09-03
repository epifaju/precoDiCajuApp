package gw.precaju.dto;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO pour les résultats de validation GPS
 */
public class GpsValidationDTO {

    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal accuracy;
    private String regionCode;
    private boolean valid;
    private String accuracyLevel;
    private RegionConsistencyDTO regionConsistency;
    private PlausibilityDTO plausibility;
    private BigDecimal qualityScore;
    private List<String> errors;
    private List<String> warnings;

    // Constructeurs
    public GpsValidationDTO() {
    }

    public GpsValidationDTO(BigDecimal latitude, BigDecimal longitude, BigDecimal accuracy,
            String regionCode, boolean valid, String accuracyLevel,
            BigDecimal qualityScore) {
        this.latitude = latitude;
        this.longitude = longitude;
        this.accuracy = accuracy;
        this.regionCode = regionCode;
        this.valid = valid;
        this.accuracyLevel = accuracyLevel;
        this.qualityScore = qualityScore;
    }

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

    public String getAccuracyLevel() {
        return accuracyLevel;
    }

    public void setAccuracyLevel(String accuracyLevel) {
        this.accuracyLevel = accuracyLevel;
    }

    public RegionConsistencyDTO getRegionConsistency() {
        return regionConsistency;
    }

    public void setRegionConsistency(RegionConsistencyDTO regionConsistency) {
        this.regionConsistency = regionConsistency;
    }

    public PlausibilityDTO getPlausibility() {
        return plausibility;
    }

    public void setPlausibility(PlausibilityDTO plausibility) {
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

    /**
     * DTO pour la cohérence avec la région
     */
    public static class RegionConsistencyDTO {
        private boolean consistent;
        private String reason;
        private BigDecimal distanceFromRegion;
        private BigDecimal regionCenterLat;
        private BigDecimal regionCenterLng;

        public RegionConsistencyDTO() {
        }

        public RegionConsistencyDTO(boolean consistent, String reason, BigDecimal distanceFromRegion) {
            this.consistent = consistent;
            this.reason = reason;
            this.distanceFromRegion = distanceFromRegion;
        }

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
     * DTO pour la plausibilité
     */
    public static class PlausibilityDTO {
        private boolean plausible;
        private String reason;

        public PlausibilityDTO() {
        }

        public PlausibilityDTO(boolean plausible, String reason) {
            this.plausible = plausible;
            this.reason = reason;
        }

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

