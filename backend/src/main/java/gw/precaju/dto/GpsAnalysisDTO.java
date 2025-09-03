package gw.precaju.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

/**
 * DTO pour les analyses GPS
 */
public class GpsAnalysisDTO {

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
    private List<GpsClusterDTO> clusters;
    private int clusterCount;
    private int validGpsCount;
    private int invalidGpsCount;
    private BigDecimal gpsQualityPercentage;
    private BigDecimal averageQualityScore;
    private BigDecimal averageDistanceBetweenPoints;

    // Constructeurs
    public GpsAnalysisDTO() {
    }

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

    public List<GpsClusterDTO> getClusters() {
        return clusters;
    }

    public void setClusters(List<GpsClusterDTO> clusters) {
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

    /**
     * DTO pour un cluster GPS
     */
    public static class GpsClusterDTO {
        private List<PriceDTO> prices;
        private int priceCount;
        private BigDecimal centerLat;
        private BigDecimal centerLng;
        private BigDecimal radius;

        public GpsClusterDTO() {
        }

        // Getters et setters
        public List<PriceDTO> getPrices() {
            return prices;
        }

        public void setPrices(List<PriceDTO> prices) {
            this.prices = prices;
        }

        public int getPriceCount() {
            return priceCount;
        }

        public void setPriceCount(int priceCount) {
            this.priceCount = priceCount;
        }

        public BigDecimal getCenterLat() {
            return centerLat;
        }

        public void setCenterLat(BigDecimal centerLat) {
            this.centerLat = centerLat;
        }

        public BigDecimal getCenterLng() {
            return centerLng;
        }

        public void setCenterLng(BigDecimal centerLng) {
            this.centerLng = centerLng;
        }

        public BigDecimal getRadius() {
            return radius;
        }

        public void setRadius(BigDecimal radius) {
            this.radius = radius;
        }
    }

    /**
     * DTO pour les prix proches
     */
    public static class NearbyPriceDTO {
        private PriceDTO price;
        private BigDecimal distanceKm;

        public NearbyPriceDTO() {
        }

        public NearbyPriceDTO(PriceDTO price, BigDecimal distanceKm) {
            this.price = price;
            this.distanceKm = distanceKm;
        }

        // Getters et setters
        public PriceDTO getPrice() {
            return price;
        }

        public void setPrice(PriceDTO price) {
            this.price = price;
        }

        public BigDecimal getDistanceKm() {
            return distanceKm;
        }

        public void setDistanceKm(BigDecimal distanceKm) {
            this.distanceKm = distanceKm;
        }
    }

    /**
     * DTO pour les statistiques de densité GPS
     */
    public static class GpsDensityStatsDTO {
        private String regionCode;
        private int pointCount;
        private BigDecimal areaKm2;
        private BigDecimal density; // points par km²
        private BigDecimal averageDistance; // distance moyenne entre points

        public GpsDensityStatsDTO() {
        }

        public GpsDensityStatsDTO(String regionCode, int pointCount, BigDecimal areaKm2,
                BigDecimal density, BigDecimal averageDistance) {
            this.regionCode = regionCode;
            this.pointCount = pointCount;
            this.areaKm2 = areaKm2;
            this.density = density;
            this.averageDistance = averageDistance;
        }

        // Getters et setters
        public String getRegionCode() {
            return regionCode;
        }

        public void setRegionCode(String regionCode) {
            this.regionCode = regionCode;
        }

        public int getPointCount() {
            return pointCount;
        }

        public void setPointCount(int pointCount) {
            this.pointCount = pointCount;
        }

        public BigDecimal getAreaKm2() {
            return areaKm2;
        }

        public void setAreaKm2(BigDecimal areaKm2) {
            this.areaKm2 = areaKm2;
        }

        public BigDecimal getDensity() {
            return density;
        }

        public void setDensity(BigDecimal density) {
            this.density = density;
        }

        public BigDecimal getAverageDistance() {
            return averageDistance;
        }

        public void setAverageDistance(BigDecimal averageDistance) {
            this.averageDistance = averageDistance;
        }
    }
}

