package gw.precaju.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import gw.precaju.entity.enums.UserRole;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public class UserDTO {

    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private Integer reputationScore;
    private List<String> preferredRegions;
    private Boolean emailVerified;
    private Boolean active;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant lastLoginAt;

    // Constructors
    public UserDTO() {}

    public UserDTO(UUID id, String email, String fullName, UserRole role) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
    }

    // Getters and Setters
    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public UserRole getRole() {
        return role;
    }

    public void setRole(UserRole role) {
        this.role = role;
    }

    public Integer getReputationScore() {
        return reputationScore;
    }

    public void setReputationScore(Integer reputationScore) {
        this.reputationScore = reputationScore;
    }

    public List<String> getPreferredRegions() {
        return preferredRegions;
    }

    public void setPreferredRegions(List<String> preferredRegions) {
        this.preferredRegions = preferredRegions;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
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

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }
}


