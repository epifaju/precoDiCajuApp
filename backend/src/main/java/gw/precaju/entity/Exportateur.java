package gw.precaju.entity;

import gw.precaju.entity.enums.ExportateurType;
import gw.precaju.entity.enums.StatutType;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "exportateurs")
@EntityListeners(AuditingEntityListener.class)
public class Exportateur {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "nom", nullable = false)
    private String nom;

    @Column(name = "numero_agrement", unique = true, nullable = false, length = 100)
    private String numeroAgrement;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false)
    private ExportateurType type;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "region_code", referencedColumnName = "code", nullable = false)
    private Region region;

    @Column(name = "telephone", length = 20)
    private String telephone;

    @Column(name = "email")
    private String email;

    @Column(name = "qr_code_token", unique = true, nullable = false)
    private String qrCodeToken;

    @Column(name = "date_certification", nullable = false)
    private LocalDate dateCertification;

    @Column(name = "date_expiration", nullable = false)
    private LocalDate dateExpiration;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut")
    private StatutType statut = StatutType.ACTIF;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private Instant updatedAt;

    // Relationships
    @OneToMany(mappedBy = "exportateur", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Set<VerificationLog> verificationLogs = new HashSet<>();

    // Constructors
    public Exportateur() {
    }

    public Exportateur(String nom, String numeroAgrement, ExportateurType type, Region region, 
                      String qrCodeToken, LocalDate dateCertification, LocalDate dateExpiration) {
        this.nom = nom;
        this.numeroAgrement = numeroAgrement;
        this.type = type;
        this.region = region;
        this.qrCodeToken = qrCodeToken;
        this.dateCertification = dateCertification;
        this.dateExpiration = dateExpiration;
    }

    // Business methods
    public boolean isActif() {
        return StatutType.ACTIF.equals(this.statut) && 
               !LocalDate.now().isAfter(this.dateExpiration);
    }

    public boolean isExpire() {
        return LocalDate.now().isAfter(this.dateExpiration);
    }

    public boolean isSuspendu() {
        return StatutType.SUSPENDU.equals(this.statut);
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

    public String getNumeroAgrement() {
        return numeroAgrement;
    }

    public void setNumeroAgrement(String numeroAgrement) {
        this.numeroAgrement = numeroAgrement;
    }

    public ExportateurType getType() {
        return type;
    }

    public void setType(ExportateurType type) {
        this.type = type;
    }

    public Region getRegion() {
        return region;
    }

    public void setRegion(Region region) {
        this.region = region;
    }

    public String getTelephone() {
        return telephone;
    }

    public void setTelephone(String telephone) {
        this.telephone = telephone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getQrCodeToken() {
        return qrCodeToken;
    }

    public void setQrCodeToken(String qrCodeToken) {
        this.qrCodeToken = qrCodeToken;
    }

    public LocalDate getDateCertification() {
        return dateCertification;
    }

    public void setDateCertification(LocalDate dateCertification) {
        this.dateCertification = dateCertification;
    }

    public LocalDate getDateExpiration() {
        return dateExpiration;
    }

    public void setDateExpiration(LocalDate dateExpiration) {
        this.dateExpiration = dateExpiration;
    }

    public StatutType getStatut() {
        return statut;
    }

    public void setStatut(StatutType statut) {
        this.statut = statut;
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

    public Set<VerificationLog> getVerificationLogs() {
        return verificationLogs;
    }

    public void setVerificationLogs(Set<VerificationLog> verificationLogs) {
        this.verificationLogs = verificationLogs;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Exportateur)) return false;
        Exportateur that = (Exportateur) o;
        return id != null && id.equals(that.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    @Override
    public String toString() {
        return "Exportateur{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", numeroAgrement='" + numeroAgrement + '\'' +
                ", type=" + type +
                ", statut=" + statut +
                '}';
    }
}
