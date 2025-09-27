package gw.precaju.dto.request;

import gw.precaju.entity.enums.ExportateurType;
import gw.precaju.entity.enums.StatutType;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class ExportateurCreateRequest {
    
    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String nom;

    @NotBlank(message = "Le numéro d'agrément est obligatoire")
    @Size(max = 100, message = "Le numéro d'agrément ne peut pas dépasser 100 caractères")
    private String numeroAgrement;

    @NotNull(message = "Le type est obligatoire")
    private ExportateurType type;

    @NotBlank(message = "Le code de région est obligatoire")
    @Size(max = 10, message = "Le code de région ne peut pas dépasser 10 caractères")
    private String regionCode;

    @Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    private String telephone;

    @Email(message = "L'email doit être valide")
    @Size(max = 255, message = "L'email ne peut pas dépasser 255 caractères")
    private String email;

    @NotNull(message = "La date de certification est obligatoire")
    @PastOrPresent(message = "La date de certification ne peut pas être dans le futur")
    private LocalDate dateCertification;

    @NotNull(message = "La date d'expiration est obligatoire")
    @Future(message = "La date d'expiration doit être dans le futur")
    private LocalDate dateExpiration;

    private StatutType statut = StatutType.ACTIF;

    // Constructors
    public ExportateurCreateRequest() {
    }

    public ExportateurCreateRequest(String nom, String numeroAgrement, ExportateurType type, 
                                   String regionCode, LocalDate dateCertification, LocalDate dateExpiration) {
        this.nom = nom;
        this.numeroAgrement = numeroAgrement;
        this.type = type;
        this.regionCode = regionCode;
        this.dateCertification = dateCertification;
        this.dateExpiration = dateExpiration;
    }

    // Getters and Setters
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

    @Override
    public String toString() {
        return "ExportateurCreateRequest{" +
                "nom='" + nom + '\'' +
                ", numeroAgrement='" + numeroAgrement + '\'' +
                ", type=" + type +
                ", regionCode='" + regionCode + '\'' +
                ", dateCertification=" + dateCertification +
                ", dateExpiration=" + dateExpiration +
                ", statut=" + statut +
                '}';
    }
}
