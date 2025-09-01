package gw.precaju.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "regions")
@EntityListeners(AuditingEntityListener.class)
public class Region {

    @Id
    @Column(name = "code", length = 10)
    private String code;

    @Column(name = "name_pt", length = 100, nullable = false)
    private String namePt;

    @Column(name = "name_fr", length = 100)
    private String nameFr;

    @Column(name = "name_en", length = 100)
    private String nameEn;

    @Column(name = "active")
    private Boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Constructors
    public Region() {
    }

    public Region(String code, String namePt, String nameFr, String nameEn) {
        this.code = code;
        this.namePt = namePt;
        this.nameFr = nameFr;
        this.nameEn = nameEn;
    }

    // Getters and Setters
    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getNamePt() {
        return namePt;
    }

    public void setNamePt(String namePt) {
        this.namePt = namePt;
    }

    public String getNameFr() {
        return nameFr;
    }

    public void setNameFr(String nameFr) {
        this.nameFr = nameFr;
    }

    public String getNameEn() {
        return nameEn;
    }

    public void setNameEn(String nameEn) {
        this.nameEn = nameEn;
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

    // Helper method to get localized name
    public String getLocalizedName(String language) {
        return switch (language.toLowerCase()) {
            case "fr" -> nameFr != null ? nameFr : namePt;
            case "en" -> nameEn != null ? nameEn : namePt;
            default -> namePt;
        };
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Region region = (Region) o;
        return code != null ? code.equals(region.code) : region.code == null;
    }

    @Override
    public int hashCode() {
        return code != null ? code.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "Region{" +
                "code='" + code + '\'' +
                ", namePt='" + namePt + '\'' +
                ", active=" + active +
                '}';
    }
}




