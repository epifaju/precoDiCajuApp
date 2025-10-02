package gw.precaju.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "simulations")
@EntityListeners(AuditingEntityListener.class)
public class Simulation {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "quantity", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantity;

    @Column(name = "price_per_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerKg;

    @Column(name = "transport_costs", nullable = false, precision = 12, scale = 2)
    private BigDecimal transportCosts = BigDecimal.ZERO;

    @Column(name = "other_costs", nullable = false, precision = 12, scale = 2)
    private BigDecimal otherCosts = BigDecimal.ZERO;

    @Column(name = "gross_revenue", nullable = false, precision = 12, scale = 2, insertable = false, updatable = false)
    private BigDecimal grossRevenue;

    @Column(name = "total_expenses", nullable = false, precision = 12, scale = 2, insertable = false, updatable = false)
    private BigDecimal totalExpenses;

    @Column(name = "net_revenue", nullable = false, precision = 12, scale = 2, insertable = false, updatable = false)
    private BigDecimal netRevenue;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Constructors
    public Simulation() {
    }

    public Simulation(User user, BigDecimal quantity, BigDecimal pricePerKg, BigDecimal transportCosts,
            BigDecimal otherCosts) {
        this.user = user;
        this.quantity = quantity;
        this.pricePerKg = pricePerKg;
        this.transportCosts = transportCosts;
        this.otherCosts = otherCosts;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
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

    // Helper methods
    public BigDecimal calculateGrossRevenue() {
        if (quantity == null || pricePerKg == null) {
            return BigDecimal.ZERO;
        }
        return quantity.multiply(pricePerKg);
    }

    public BigDecimal calculateTotalExpenses() {
        if (transportCosts == null || otherCosts == null) {
            return BigDecimal.ZERO;
        }
        return transportCosts.add(otherCosts);
    }

    public BigDecimal calculateNetRevenue() {
        return calculateGrossRevenue().subtract(calculateTotalExpenses());
    }

    public BigDecimal getProfitMargin() {
        BigDecimal gross = calculateGrossRevenue();
        if (gross.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return calculateNetRevenue().divide(gross, 4, RoundingMode.HALF_UP).multiply(new BigDecimal("100"));
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Simulation that = (Simulation) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Simulation{" +
                "id=" + id +
                ", quantity=" + quantity +
                ", pricePerKg=" + pricePerKg +
                ", transportCosts=" + transportCosts +
                ", otherCosts=" + otherCosts +
                ", grossRevenue=" + grossRevenue +
                ", totalExpenses=" + totalExpenses +
                ", netRevenue=" + netRevenue +
                ", createdAt=" + createdAt +
                '}';
    }
}
