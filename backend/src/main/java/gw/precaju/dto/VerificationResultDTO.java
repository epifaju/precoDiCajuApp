package gw.precaju.dto;

import gw.precaju.entity.enums.ExportateurType;
import gw.precaju.entity.enums.StatutType;

import java.time.LocalDate;
import java.time.Instant;
import java.util.UUID;

public class VerificationResultDTO {
    private boolean success;
    private String message;
    private String result;
    private UUID exportateurId;
    private String nom;
    private String numeroAgrement;
    private ExportateurType type;
    private String regionCode;
    private String regionName;
    private String telephone;
    private String email;
    private LocalDate dateCertification;
    private LocalDate dateExpiration;
    private StatutType statut;
    private boolean actif;
    private boolean expire;
    private boolean suspendu;
    private Instant verificationTime;

    // Constructors
    public VerificationResultDTO() {
    }

    public VerificationResultDTO(boolean success, String message, String result) {
        this.success = success;
        this.message = message;
        this.result = result;
        this.verificationTime = Instant.now();
    }

    // Static factory methods
    public static VerificationResultDTO success(ExportateurDTO exportateur) {
        VerificationResultDTO result = new VerificationResultDTO(true, "Exportateur trouvé et valide", "SUCCESS");
        result.setExportateurId(exportateur.getId());
        result.setNom(exportateur.getNom());
        result.setNumeroAgrement(exportateur.getNumeroAgrement());
        result.setType(exportateur.getType());
        result.setRegionCode(exportateur.getRegionCode());
        result.setRegionName(exportateur.getRegionName());
        result.setTelephone(exportateur.getTelephone());
        result.setEmail(exportateur.getEmail());
        result.setDateCertification(exportateur.getDateCertification());
        result.setDateExpiration(exportateur.getDateExpiration());
        result.setStatut(exportateur.getStatut());
        result.setActif(exportateur.isActif());
        result.setExpire(exportateur.isExpire());
        result.setSuspendu(exportateur.isSuspendu());
        return result;
    }

    public static VerificationResultDTO notFound() {
        return new VerificationResultDTO(false, "Exportateur non trouvé", "NOT_FOUND");
    }

    public static VerificationResultDTO expired() {
        return new VerificationResultDTO(false, "Exportateur expiré", "EXPIRED");
    }

    public static VerificationResultDTO suspended() {
        return new VerificationResultDTO(false, "Exportateur suspendu", "SUSPENDED");
    }

    public static VerificationResultDTO invalidToken() {
        return new VerificationResultDTO(false, "Token QR code invalide", "INVALID_TOKEN");
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getResult() {
        return result;
    }

    public void setResult(String result) {
        this.result = result;
    }

    public UUID getExportateurId() {
        return exportateurId;
    }

    public void setExportateurId(UUID exportateurId) {
        this.exportateurId = exportateurId;
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

    public Instant getVerificationTime() {
        return verificationTime;
    }

    public void setVerificationTime(Instant verificationTime) {
        this.verificationTime = verificationTime;
    }

    @Override
    public String toString() {
        return "VerificationResultDTO{" +
                "success=" + success +
                ", message='" + message + '\'' +
                ", result='" + result + '\'' +
                ", nom='" + nom + '\'' +
                ", numeroAgrement='" + numeroAgrement + '\'' +
                '}';
    }
}
