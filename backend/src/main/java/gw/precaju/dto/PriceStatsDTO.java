package gw.precaju.dto;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

public class PriceStatsDTO {

    private long totalPrices;
    private BigDecimal averagePrice;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private BigDecimal priceChange; // Change percentage from previous period
    private Map<String, Long> pricesByRegion;
    private Map<String, Long> pricesByQuality;
    private Map<String, BigDecimal> averagePricesByRegion;
    private Map<String, BigDecimal> averagePricesByQuality;
    private long verifiedPrices;
    private long unverifiedPrices;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant lastUpdated;

    private Integer periodDays;

    // Constructors
    public PriceStatsDTO() {}

    // Getters and Setters
    public long getTotalPrices() {
        return totalPrices;
    }

    public void setTotalPrices(long totalPrices) {
        this.totalPrices = totalPrices;
    }

    public BigDecimal getAveragePrice() {
        return averagePrice;
    }

    public void setAveragePrice(BigDecimal averagePrice) {
        this.averagePrice = averagePrice;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }

    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }

    public BigDecimal getMaxPrice() {
        return maxPrice;
    }

    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }

    public BigDecimal getPriceChange() {
        return priceChange;
    }

    public void setPriceChange(BigDecimal priceChange) {
        this.priceChange = priceChange;
    }

    public Map<String, Long> getPricesByRegion() {
        return pricesByRegion;
    }

    public void setPricesByRegion(Map<String, Long> pricesByRegion) {
        this.pricesByRegion = pricesByRegion;
    }

    public Map<String, Long> getPricesByQuality() {
        return pricesByQuality;
    }

    public void setPricesByQuality(Map<String, Long> pricesByQuality) {
        this.pricesByQuality = pricesByQuality;
    }

    public Map<String, BigDecimal> getAveragePricesByRegion() {
        return averagePricesByRegion;
    }

    public void setAveragePricesByRegion(Map<String, BigDecimal> averagePricesByRegion) {
        this.averagePricesByRegion = averagePricesByRegion;
    }

    public Map<String, BigDecimal> getAveragePricesByQuality() {
        return averagePricesByQuality;
    }

    public void setAveragePricesByQuality(Map<String, BigDecimal> averagePricesByQuality) {
        this.averagePricesByQuality = averagePricesByQuality;
    }

    public long getVerifiedPrices() {
        return verifiedPrices;
    }

    public void setVerifiedPrices(long verifiedPrices) {
        this.verifiedPrices = verifiedPrices;
    }

    public long getUnverifiedPrices() {
        return unverifiedPrices;
    }

    public void setUnverifiedPrices(long unverifiedPrices) {
        this.unverifiedPrices = unverifiedPrices;
    }

    public Instant getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Instant lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Integer getPeriodDays() {
        return periodDays;
    }

    public void setPeriodDays(Integer periodDays) {
        this.periodDays = periodDays;
    }
}














