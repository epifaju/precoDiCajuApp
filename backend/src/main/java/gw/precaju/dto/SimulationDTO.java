package gw.precaju.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public class SimulationDTO {

    private UUID id;
    private UUID userId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    @NotNull(message = "Price per kg is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Price per kg must be greater than 0")
    private BigDecimal pricePerKg;

    @DecimalMin(value = "0.0", message = "Transport costs cannot be negative")
    private BigDecimal transportCosts = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", message = "Other costs cannot be negative")
    private BigDecimal otherCosts = BigDecimal.ZERO;

    private BigDecimal grossRevenue;
    private BigDecimal totalExpenses;
    private BigDecimal netRevenue;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant updatedAt;

    // Constructors
    public SimulationDTO() {
    }

    public SimulationDTO(UUID id, UUID userId, BigDecimal quantity, BigDecimal pricePerKg,
            BigDecimal transportCosts, BigDecimal otherCosts, BigDecimal grossRevenue,
            BigDecimal totalExpenses, BigDecimal netRevenue, Instant createdAt, Instant updatedAt) {
        this.id = id;
        this.userId = userId;
        this.quantity = quantity;
        this.pricePerKg = pricePerKg;
        this.transportCosts = transportCosts;
        this.otherCosts = otherCosts;
        this.grossRevenue = grossRevenue;
        this.totalExpenses = totalExpenses;
        this.netRevenue = netRevenue;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public UUID getUserId() {
        return userId;
    }

    public void setUserId(UUID userId) {
        this.userId = userId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getPricePerKg() {
        return pricePerKg;
    }

    public void setPricePerKg(BigDecimal pricePerKg) {
        this.pricePerKg = pricePerKg;
    }

    public BigDecimal getTransportCosts() {
        return transportCosts;
    }

    public void setTransportCosts(BigDecimal transportCosts) {
        this.transportCosts = transportCosts;
    }

    public BigDecimal getOtherCosts() {
        return otherCosts;
    }

    public void setOtherCosts(BigDecimal otherCosts) {
        this.otherCosts = otherCosts;
    }

    public BigDecimal getGrossRevenue() {
        return grossRevenue;
    }

    public void setGrossRevenue(BigDecimal grossRevenue) {
        this.grossRevenue = grossRevenue;
    }

    public BigDecimal getTotalExpenses() {
        return totalExpenses;
    }

    public void setTotalExpenses(BigDecimal totalExpenses) {
        this.totalExpenses = totalExpenses;
    }

    public BigDecimal getNetRevenue() {
        return netRevenue;
    }

    public void setNetRevenue(BigDecimal netRevenue) {
        this.netRevenue = netRevenue;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public String toString() {
        return "SimulationDTO{" +
                "id=" + id +
                ", userId=" + userId +
                ", quantity=" + quantity +
                ", pricePerKg=" + pricePerKg +
                ", transportCosts=" + transportCosts +
                ", otherCosts=" + otherCosts +
                ", grossRevenue=" + grossRevenue +
                ", totalExpenses=" + totalExpenses +
                ", netRevenue=" + netRevenue +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}

