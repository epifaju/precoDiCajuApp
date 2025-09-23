package gw.precaju.dto;

import gw.precaju.entity.POIType;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.UUID;

public class POIDTO {

    private UUID id;

    @NotBlank(message = "Name is required")
    @Size(max = 255, message = "Name must not exceed 255 characters")
    private String nom;

    @NotNull(message = "Type is required")
    private POIType type;

    @NotNull(message = "Latitude is required")
    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String telephone;

    @Size(max = 1000, message = "Address must not exceed 1000 characters")
    private String adresse;

    @Size(max = 500, message = "Hours must not exceed 500 characters")
    private String horaires;

    private Boolean active;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant updatedAt;

    private String createdBy;

    // Computed fields for frontend - computed via getter methods, not stored

    // Constructors
    public POIDTO() {
    }

    public POIDTO(UUID id, String nom, POIType type, Double latitude, Double longitude) {
        this.id = id;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
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

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    // Computed field getters
    public String getFormattedPhone() {
        if (telephone == null || telephone.isEmpty()) {
            return null;
        }
        String digits = telephone.replaceAll("\\D", "");
        if (digits.startsWith("245")) {
            return "+" + digits;
        }
        return telephone;
    }

    public String getCallUrl() {
        String phone = getFormattedPhone();
        return phone != null ? "tel:" + phone : null;
    }

    public String getDisplayType() {
        return type != null ? type.getLabel() : null;
    }

    public String getMarkerColor() {
        return type != null ? getMarkerColorForType(type) : null;
    }

    public String getMarkerIcon() {
        return type != null ? getMarkerIconForType(type) : null;
    }

    private String getMarkerColorForType(POIType type) {
        return switch (type) {
            case ACHETEUR -> "#22c55e";
            case COOPERATIVE -> "#3b82f6";
            case ENTREPOT -> "#f97316";
        };
    }

    private String getMarkerIconForType(POIType type) {
        return switch (type) {
            case ACHETEUR -> "🟢";
            case COOPERATIVE -> "🔵";
            case ENTREPOT -> "🟠";
        };
    }

    @Override
    public String toString() {
        return "POIDTO{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", type=" + type +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                ", active=" + active +
                '}';
    }
}
