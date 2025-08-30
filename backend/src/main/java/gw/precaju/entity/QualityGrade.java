package gw.precaju.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;

@Entity
@Table(name = "quality_grades")
@EntityListeners(AuditingEntityListener.class)
public class QualityGrade {

    @Id
    @Column(name = "code", length = 20)
    private String code;

    @Column(name = "name_pt", length = 50, nullable = false)
    private String namePt;

    @Column(name = "name_fr", length = 50)
    private String nameFr;

    @Column(name = "name_en", length = 50)
    private String nameEn;

    @Column(name = "description_pt", columnDefinition = "TEXT")
    private String descriptionPt;

    @Column(name = "description_fr", columnDefinition = "TEXT")
    private String descriptionFr;

    @Column(name = "description_en", columnDefinition = "TEXT")
    private String descriptionEn;

    @Column(name = "active")
    private Boolean active = true;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Constructors
    public QualityGrade() {
    }

    public QualityGrade(String code, String namePt, String nameFr, String nameEn) {
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

    public String getDescriptionPt() {
        return descriptionPt;
    }

    public void setDescriptionPt(String descriptionPt) {
        this.descriptionPt = descriptionPt;
    }

    public String getDescriptionFr() {
        return descriptionFr;
    }

    public void setDescriptionFr(String descriptionFr) {
        this.descriptionFr = descriptionFr;
    }

    public String getDescriptionEn() {
        return descriptionEn;
    }

    public void setDescriptionEn(String descriptionEn) {
        this.descriptionEn = descriptionEn;
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

    // Helper methods
    public String getLocalizedName(String language) {
        return switch (language.toLowerCase()) {
            case "fr" -> nameFr != null ? nameFr : namePt;
            case "en" -> nameEn != null ? nameEn : namePt;
            default -> namePt;
        };
    }

    public String getLocalizedDescription(String language) {
        return switch (language.toLowerCase()) {
            case "fr" -> descriptionFr != null ? descriptionFr : descriptionPt;
            case "en" -> descriptionEn != null ? descriptionEn : descriptionPt;
            default -> descriptionPt;
        };
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        QualityGrade that = (QualityGrade) o;
        return code != null ? code.equals(that.code) : that.code == null;
    }

    @Override
    public int hashCode() {
        return code != null ? code.hashCode() : 0;
    }

    @Override
    public String toString() {
        return "QualityGrade{" +
                "code='" + code + '\'' +
                ", namePt='" + namePt + '\'' +
                ", active=" + active +
                '}';
    }
}


