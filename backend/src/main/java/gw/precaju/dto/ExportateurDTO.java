package gw.precaju.dto;

import gw.precaju.entity.enums.ExportateurType;
import gw.precaju.entity.enums.StatutType;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public class ExportateurDTO {
    private UUID id;
    private String nom;
    private String numeroAgrement;
    private ExportateurType type;
    private String regionCode;
    private String regionName;
    private String telephone;
    private String email;
    private String qrCodeToken;
    private LocalDate dateCertification;
    private LocalDate dateExpiration;
    private StatutType statut;
    private Instant createdAt;
    private Instant updatedAt;
    private boolean actif;
    private boolean expire;
    private boolean suspendu;

    // Constructors
    public ExportateurDTO() {
    }

    public ExportateurDTO(UUID id, String nom, String numeroAgrement, ExportateurType type, 
                          String regionCode, String regionName, StatutType statut) {
        this.id = id;
        this.nom = nom;
        this.numeroAgrement = numeroAgrement;
        this.type = type;
        this.regionCode = regionCode;
        this.regionName = regionName;
        this.statut = statut;
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

    public String getRegionCode() {
        return regionCode;
    }

    public void setRegionCode(String regionCode) {
        this.regionCode = regionCode;
    }

    public String getRegionName() {
        return regionName;
    }

    public void setRegionName(String regionName) {
        this.regionName = regionName;
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

    public boolean isActif() {
        return actif;
    }

    public void setActif(boolean actif) {
        this.actif = actif;
    }

    public boolean isExpire() {
        return expire;
    }

    public void setExpire(boolean expire) {
        this.expire = expire;
    }

    public boolean isSuspendu() {
        return suspendu;
    }

    public void setSuspendu(boolean suspendu) {
        this.suspendu = suspendu;
    }

    @Override
    public String toString() {
        return "ExportateurDTO{" +
                "id=" + id +
                ", nom='" + nom + '\'' +
                ", numeroAgrement='" + numeroAgrement + '\'' +
                ", type=" + type +
                ", regionCode='" + regionCode + '\'' +
                ", statut=" + statut +
                '}';
    }
}
