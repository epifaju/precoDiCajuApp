package gw.precaju.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import gw.precaju.entity.enums.UserRole;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * DTO for user configuration data
 */
public class UserConfigDTO {

    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private Integer reputationScore;
    private Boolean emailVerified;
    private Boolean active;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", timezone = "UTC")
    private Instant lastLoginAt;

    // User Preferences
    private UserPreferencesDTO preferences;

    // Notification Settings
    private NotificationPreferencesDTO notificationPreferences;

    // Push Subscription Status
    private Boolean pushNotificationsEnabled;
    private String pushSubscriptionStatus;

    // Constructors
    public UserConfigDTO() {
    }

    public UserConfigDTO(UUID id, String email, String fullName, UserRole role) {
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

    public UserPreferencesDTO getPreferences() {
        return preferences;
    }

    public void setPreferences(UserPreferencesDTO preferences) {
        this.preferences = preferences;
    }

    public NotificationPreferencesDTO getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(NotificationPreferencesDTO notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    public Boolean getPushNotificationsEnabled() {
        return pushNotificationsEnabled;
    }

    public void setPushNotificationsEnabled(Boolean pushNotificationsEnabled) {
        this.pushNotificationsEnabled = pushNotificationsEnabled;
    }

    public String getPushSubscriptionStatus() {
        return pushSubscriptionStatus;
    }

    public void setPushSubscriptionStatus(String pushSubscriptionStatus) {
        this.pushSubscriptionStatus = pushSubscriptionStatus;
    }

    /**
     * Nested DTO for user preferences
     */
    public static class UserPreferencesDTO {
        private String language;
        private String theme;
        private List<String> preferredRegions;
        private String timezone;
        private Boolean offlineMode;
        private Boolean autoSync;
        private Map<String, Object> customSettings;

        // Constructors
        public UserPreferencesDTO() {
        }

        // Getters and Setters
        public String getLanguage() {
            return language;
        }

        public void setLanguage(String language) {
            this.language = language;
        }

        public String getTheme() {
            return theme;
        }

        public void setTheme(String theme) {
            this.theme = theme;
        }

        public List<String> getPreferredRegions() {
            return preferredRegions;
        }

        public void setPreferredRegions(List<String> preferredRegions) {
            this.preferredRegions = preferredRegions;
        }

        public String getTimezone() {
            return timezone;
        }

        public void setTimezone(String timezone) {
            this.timezone = timezone;
        }

        public Boolean getOfflineMode() {
            return offlineMode;
        }

        public void setOfflineMode(Boolean offlineMode) {
            this.offlineMode = offlineMode;
        }

        public Boolean getAutoSync() {
            return autoSync;
        }

        public void setAutoSync(Boolean autoSync) {
            this.autoSync = autoSync;
        }

        public Map<String, Object> getCustomSettings() {
            return customSettings;
        }

        public void setCustomSettings(Map<String, Object> customSettings) {
            this.customSettings = customSettings;
        }
    }

    /**
     * Nested DTO for notification preferences
     */
    public static class NotificationPreferencesDTO {
        private Boolean priceAlerts;
        private Boolean verificationNotifications;
        private Boolean systemNotifications;
        private Boolean emailNotifications;
        private Boolean pushNotifications;
        private Integer alertThreshold; // Percentage threshold for price alerts
        private List<String> alertRegions;
        private List<String> alertQualities;
        private String frequency; // daily, weekly, immediate
        private Boolean quietHours;
        private String quietStartTime;
        private String quietEndTime;

        // Constructors
        public NotificationPreferencesDTO() {
        }

        // Getters and Setters
        public Boolean getPriceAlerts() {
            return priceAlerts;
        }

        public void setPriceAlerts(Boolean priceAlerts) {
            this.priceAlerts = priceAlerts;
        }

        public Boolean getVerificationNotifications() {
            return verificationNotifications;
        }

        public void setVerificationNotifications(Boolean verificationNotifications) {
            this.verificationNotifications = verificationNotifications;
        }

        public Boolean getSystemNotifications() {
            return systemNotifications;
        }

        public void setSystemNotifications(Boolean systemNotifications) {
            this.systemNotifications = systemNotifications;
        }

        public Boolean getEmailNotifications() {
            return emailNotifications;
        }

        public void setEmailNotifications(Boolean emailNotifications) {
            this.emailNotifications = emailNotifications;
        }

        public Boolean getPushNotifications() {
            return pushNotifications;
        }

        public void setPushNotifications(Boolean pushNotifications) {
            this.pushNotifications = pushNotifications;
        }

        public Integer getAlertThreshold() {
            return alertThreshold;
        }

        public void setAlertThreshold(Integer alertThreshold) {
            this.alertThreshold = alertThreshold;
        }

        public List<String> getAlertRegions() {
            return alertRegions;
        }

        public void setAlertRegions(List<String> alertRegions) {
            this.alertRegions = alertRegions;
        }

        public List<String> getAlertQualities() {
            return alertQualities;
        }

        public void setAlertQualities(List<String> alertQualities) {
            this.alertQualities = alertQualities;
        }

        public String getFrequency() {
            return frequency;
        }

        public void setFrequency(String frequency) {
            this.frequency = frequency;
        }

        public Boolean getQuietHours() {
            return quietHours;
        }

        public void setQuietHours(Boolean quietHours) {
            this.quietHours = quietHours;
        }

        public String getQuietStartTime() {
            return quietStartTime;
        }

        public void setQuietStartTime(String quietStartTime) {
            this.quietStartTime = quietStartTime;
        }

        public String getQuietEndTime() {
            return quietEndTime;
        }

        public void setQuietEndTime(String quietEndTime) {
            this.quietEndTime = quietEndTime;
        }
    }
}



