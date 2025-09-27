package gw.precaju.dto.request;

import gw.precaju.entity.enums.ExportateurType;
import gw.precaju.entity.enums.StatutType;
import jakarta.validation.constraints.*;

import java.time.LocalDate;

public class ExportateurUpdateRequest {
    
    @Size(max = 255, message = "Le nom ne peut pas dépasser 255 caractères")
    private String nom;

    @Size(max = 20, message = "Le téléphone ne peut pas dépasser 20 caractères")
    private String telephone;

    @Email(message = "L'email doit être valide")
    @Size(max = 255, message = "L'email ne peut pas dépasser 255 caractères")
    private String email;

    @PastOrPresent(message = "La date de certification ne peut pas être dans le futur")
    private LocalDate dateCertification;

    @Future(message = "La date d'expiration doit être dans le futur")
    private LocalDate dateExpiration;

    private StatutType statut;

    // Constructors
    public ExportateurUpdateRequest() {
    }

    // Getters and Setters
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
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
        return "ExportateurUpdateRequest{" +
                "nom='" + nom + '\'' +
                ", telephone='" + telephone + '\'' +
                ", email='" + email + '\'' +
                ", dateCertification=" + dateCertification +
                ", dateExpiration=" + dateExpiration +
                ", statut=" + statut +
                '}';
    }
}
