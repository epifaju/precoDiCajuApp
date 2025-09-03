package gw.precaju.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Max;

import java.util.List;
import java.util.Map;

/**
 * Request DTO for updating user configuration
 */
public class UpdateUserConfigRequest {

    // Basic Profile Information
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @Pattern(regexp = "^\\+?[0-9]{8,15}$", message = "Phone number should be valid")
    private String phone;

    // User Preferences
    @Valid
    private UserPreferencesRequest preferences;

    // Notification Preferences
    @Valid
    private NotificationPreferencesRequest notificationPreferences;

    // Constructors
    public UpdateUserConfigRequest() {
    }

    // Getters and Setters
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

    public UserPreferencesRequest getPreferences() {
        return preferences;
    }

    public void setPreferences(UserPreferencesRequest preferences) {
        this.preferences = preferences;
    }

    public NotificationPreferencesRequest getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(NotificationPreferencesRequest notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    /**
     * Nested request DTO for user preferences
     */
    public static class UserPreferencesRequest {
        @Pattern(regexp = "^(pt|fr|en)$", message = "Language must be pt, fr, or en")
        private String language;

        @Pattern(regexp = "^(light|dark|system)$", message = "Theme must be light, dark, or system")
        private String theme;

        private List<String> preferredRegions;

        @Pattern(regexp = "^[A-Za-z_/]+$", message = "Timezone must be a valid timezone identifier")
        private String timezone;

        private Boolean offlineMode;
        private Boolean autoSync;
        private Map<String, Object> customSettings;

        // Constructors
        public UserPreferencesRequest() {
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
     * Nested request DTO for notification preferences
     */
    public static class NotificationPreferencesRequest {
        private Boolean priceAlerts;
        private Boolean verificationNotifications;
        private Boolean systemNotifications;
        private Boolean emailNotifications;
        private Boolean pushNotifications;

        @Min(value = 1, message = "Alert threshold must be at least 1%")
        @Max(value = 100, message = "Alert threshold must be at most 100%")
        private Integer alertThreshold;

        private List<String> alertRegions;
        private List<String> alertQualities;

        @Pattern(regexp = "^(immediate|daily|weekly)$", message = "Frequency must be immediate, daily, or weekly")
        private String frequency;

        private Boolean quietHours;

        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Time must be in HH:MM format")
        private String quietStartTime;

        @Pattern(regexp = "^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$", message = "Time must be in HH:MM format")
        private String quietEndTime;

        // Constructors
        public NotificationPreferencesRequest() {
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
