package gw.precaju.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;
import java.util.UUID;

/**
 * Entity representing a Point of Interest (POI) in the cashew industry
 * This includes buyers, cooperatives, and export warehouses
 */
@Entity(name = "POI")
@Table(name = "pois", schema = "public")
@EntityListeners(AuditingEntityListener.class)
public class POI {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "nom", length = 255, nullable = false)
    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String nom;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20, nullable = false)
    @NotNull(message = "Type is required")
    private POIType type;

    @Column(name = "latitude", precision = 10, scale = 8, nullable = false)
    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "10.5", message = "Latitude must be within Guinea-Bissau bounds")
    @DecimalMax(value = "12.8", message = "Latitude must be within Guinea-Bissau bounds")
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8, nullable = false)
    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-17.0", message = "Longitude must be within Guinea-Bissau bounds")
    @DecimalMax(value = "-13.5", message = "Longitude must be within Guinea-Bissau bounds")
    private BigDecimal longitude;

    @Column(name = "telephone", length = 50)
    @Size(max = 50, message = "Phone number must not exceed 50 characters")
    private String telephone;

    @Column(name = "adresse", length = 500)
    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String adresse;

    @Column(name = "horaires", length = 500)
    @Size(max = 500, message = "Business hours must not exceed 500 characters")
    private String horaires;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(name = "created_by", length = 100)
    private String createdBy;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Constructors
    public POI() {
    }

    public POI(String nom, POIType type, BigDecimal latitude, BigDecimal longitude) {
        this.nom = nom;
        this.type = type;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public POIType getType() {
        return type;
    }

    public void setType(POIType type) {
        this.type = type;
    }

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

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getAdresse() {
        return adresse;
    }

    public void setAdresse(String adresse) {
        this.adresse = adresse;
    }

    public String getHoraires() {
        return horaires;
    }

    public void setHoraires(String horaires) {
        this.horaires = horaires;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
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
    public boolean hasPhone() {
        return telephone != null && !telephone.trim().isEmpty();
    }

    public String getDisplayType() {
        return type.getLabel();
    }

    // Validation for coordinates within Guinea-Bissau bounds
    public boolean isWithinGuineaBissauBounds() {
        BigDecimal lat = getLatitude();
        BigDecimal lng = getLongitude();

        return lat != null && lng != null &&
                lat.compareTo(new BigDecimal("10.5")) >= 0 &&
                lat.compareTo(new BigDecimal("12.8")) <= 0 &&
                lng.compareTo(new BigDecimal("-17.0")) >= 0 &&
                lng.compareTo(new BigDecimal("-13.5")) <= 0;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        POI poi = (POI) o;
        return Objects.equals(id, poi.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "POI{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", type=" + type +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", active=" + active +
                '}';
    }
}