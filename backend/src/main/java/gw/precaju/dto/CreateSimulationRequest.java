package gw.precaju.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class CreateSimulationRequest {

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

    // Constructors
    public CreateSimulationRequest() {
    }

    public CreateSimulationRequest(BigDecimal quantity, BigDecimal pricePerKg, BigDecimal transportCosts,
            BigDecimal otherCosts) {
        this.quantity = quantity;
        this.pricePerKg = pricePerKg;
        this.transportCosts = transportCosts;
        this.otherCosts = otherCosts;
    }

    // Getters and Setters
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

    @Override
    public String toString() {
        return "CreateSimulationRequest{" +
                "quantity=" + quantity +
                ", pricePerKg=" + pricePerKg +
                ", transportCosts=" + transportCosts +
                ", otherCosts=" + otherCosts +
                '}';
    }
}

