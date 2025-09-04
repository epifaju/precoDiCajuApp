package gw.precaju.service;

import gw.precaju.dto.UserConfigDTO;

import gw.precaju.dto.request.UpdateUserConfigRequest;
import gw.precaju.entity.User;
import gw.precaju.entity.enums.UserRole;
import gw.precaju.repository.UserRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
@Transactional
public class UserService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    public UserService(UserRepository userRepository, ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        return user;
    }

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User findByEmail(String email) {
        return userRepository.findByEmailAndActiveTrue(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public void updateLastLogin(String email) {
        User user = findByEmail(email);
        user.updateLastLogin();
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public Page<User> findAllActive(Pageable pageable) {
        return userRepository.findByActiveTrue(pageable);
    }

    // Méthodes d'administration
    @Transactional(readOnly = true)
    public Page<User> findAllUsersWithFilters(String role, Boolean active, Boolean emailVerified, String search,
            Pageable pageable) {
        try {
            logger.debug(
                    "UserService.findAllUsersWithFilters called with role: {}, active: {}, emailVerified: {}, search: {}, pageable: {}",
                    role, active, emailVerified, search, pageable);

            // Nettoyer et valider les paramètres
            String cleanSearch = cleanSearchParameter(search);
            String roleString = cleanRoleParameter(role);
            String searchPattern = createSearchPattern(cleanSearch);

            logger.debug(
                    "Cleaned parameters - roleString: {}, active: {}, emailVerified: {}, cleanSearch: {}, searchPattern: {}",
                    roleString, active, emailVerified, cleanSearch, searchPattern);

            // Nettoyer le Pageable pour éviter les conflits avec les noms de colonnes SQL
            // natives
            Pageable cleanPageable = createCleanPageable(pageable);

            // Utiliser la méthode native SQL améliorée du repository
            Page<User> result = userRepository.findAllUsersWithFiltersImproved(roleString, active, emailVerified,
                    cleanSearch, searchPattern, cleanPageable);
            logger.info("Successfully retrieved {} users with filters", result.getTotalElements());
            return result;

        } catch (IllegalArgumentException e) {
            logger.error("Invalid argument in findAllUsersWithFilters: {}", e.getMessage(), e);
            throw e;
        } catch (org.springframework.dao.DataAccessException e) {
            logger.error("Database access error in findAllUsersWithFilters: {}", e.getMessage(), e);
            if (e.getCause() != null) {
                logger.error("Root cause: {}", e.getCause().getMessage());
                logger.error("Root cause class: {}", e.getCause().getClass().getSimpleName());
            }
            throw new RuntimeException("Database error while retrieving users: " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error in findAllUsersWithFilters: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to retrieve users with filters: " + e.getMessage(), e);
        }
    }

    /**
     * Nettoie et valide le paramètre de recherche
     */
    private String cleanSearchParameter(String search) {
        if (search == null) {
            return null;
        }

        String trimmed = search.trim();
        if (trimmed.isEmpty()) {
            return null;
        }

        // Limiter la longueur pour éviter les attaques par déni de service
        if (trimmed.length() > 100) {
            logger.warn("Search term too long ({} chars), truncating to 100 characters", trimmed.length());
            return trimmed.substring(0, 100);
        }

        return trimmed;
    }

    /**
     * Nettoie et valide le paramètre de rôle
     */
    private String cleanRoleParameter(String role) {
        if (role == null || role.trim().isEmpty()) {
            return null;
        }

        try {
            // Valider que le rôle est valide et retourner sa valeur (minuscule)
            UserRole userRole = UserRole.valueOf(role.toUpperCase());
            return userRole.getValue(); // Retourne "admin", "moderator", "contributor"
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid role parameter: {}, ignoring role filter", role);
            return null;
        }
    }

    /**
     * Crée le pattern de recherche pour la méthode SQL native
     * Utilise ILIKE avec % pour une recherche insensible à la casse
     */
    private String createSearchPattern(String search) {
        if (search == null || search.isEmpty()) {
            return null;
        }
        return "%" + search + "%";
    }

    /**
     * Nettoie le Pageable pour éviter les conflits avec les noms de colonnes SQL
     * natives
     * Convertit les noms de propriétés camelCase vers snake_case
     */
    private Pageable createCleanPageable(Pageable pageable) {
        if (pageable == null || pageable.getSort().isUnsorted()) {
            // Si pas de tri, utiliser un tri par défaut par created_at DESC
            return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by("created_at").descending());
        }

        // Mapper les noms de propriétés camelCase vers snake_case pour PostgreSQL
        List<Sort.Order> orders = new ArrayList<>();
        for (Sort.Order order : pageable.getSort()) {
            String property = order.getProperty();

            // Conversion des noms de propriétés
            switch (property) {
                case "createdAt":
                    property = "created_at";
                    break;
                case "updatedAt":
                    property = "updated_at";
                    break;
                case "fullName":
                    property = "full_name";
                    break;
                case "emailVerified":
                    property = "email_verified";
                    break;
                case "reputationScore":
                    property = "reputation_score";
                    break;
                case "lastLoginAt":
                    property = "last_login_at";
                    break;
                case "preferredRegions":
                    property = "preferred_regions";
                    break;
                case "notificationPreferences":
                    property = "notification_preferences";
                    break;
                // Les autres propriétés restent inchangées (id, email, role, active, etc.)
                default:
                    // Conserver la propriété telle quelle
                    break;
            }

            orders.add(new Sort.Order(order.getDirection(), property));
        }

        return PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(orders));
    }

    @Transactional(readOnly = true)
    public long countAllUsers() {
        try {
            logger.debug("UserService.countAllUsers called");
            long count = userRepository.count();
            logger.debug("Total users count: {}", count);
            return count;
        } catch (Exception e) {
            logger.error("Error in countAllUsers: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to count users: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public long countByRoleAndActiveTrue(UserRole role) {
        try {
            logger.debug("UserService.countByRoleAndActiveTrue called with role: {}", role);
            long count;
            if (role == null) {
                count = userRepository.countByActiveTrue();
                logger.debug("Active users count: {}", count);
            } else {
                count = userRepository.countByRoleAndActiveTrue(role);
                logger.debug("Active users count for role {}: {}", role, count);
            }
            return count;
        } catch (Exception e) {
            logger.error("Error in countByRoleAndActiveTrue: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to count users by role and active status: " + e.getMessage(), e);
        }
    }

    /**
     * Valide si un rôle est valide
     */
    private boolean isValidRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            return false;
        }

        try {
            UserRole.valueOf(role.toUpperCase());
            return true;
        } catch (IllegalArgumentException e) {
            return false;
        }
    }

    // ==================== USER CONFIGURATION METHODS ====================

    /**
     * Get complete user configuration
     */
    @Transactional(readOnly = true)
    public UserConfigDTO getUserConfig(User user) {
        try {
            UserConfigDTO configDTO = new UserConfigDTO();

            // Basic user information
            configDTO.setId(user.getId());
            configDTO.setEmail(user.getEmail());
            configDTO.setFullName(user.getFullName());
            configDTO.setPhone(user.getPhone());
            configDTO.setRole(user.getRole());
            configDTO.setReputationScore(user.getReputationScore());
            configDTO.setEmailVerified(user.getEmailVerified());
            configDTO.setActive(user.getActive());
            configDTO.setCreatedAt(user.getCreatedAt());
            configDTO.setLastLoginAt(user.getLastLoginAt());

            // User preferences
            UserConfigDTO.UserPreferencesDTO preferences = getUserPreferences(user);
            configDTO.setPreferences(preferences);

            // Notification preferences
            UserConfigDTO.NotificationPreferencesDTO notificationPreferences = getUserNotificationPreferences(user);
            configDTO.setNotificationPreferences(notificationPreferences);

            // Push subscription status
            configDTO.setPushNotificationsEnabled(user.getAbonnementNotifications());
            configDTO.setPushSubscriptionStatus(user.getPushSubscription() != null ? "subscribed" : "not_subscribed");

            return configDTO;

        } catch (Exception e) {
            logger.error("Error getting user configuration for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to get user configuration", e);
        }
    }

    /**
     * Update user configuration
     */
    public UserConfigDTO updateUserConfig(User user, UpdateUserConfigRequest request) {
        try {
            // Validate and update basic profile information
            if (request.getFullName() != null) {
                if (request.getFullName().trim().length() < 2 || request.getFullName().length() > 100) {
                    throw new IllegalArgumentException("Full name must be between 2 and 100 characters");
                }
                user.setFullName(request.getFullName());
            }
            if (request.getPhone() != null) {
                if (!request.getPhone().matches("^\\+?[0-9]{8,15}$")) {
                    throw new IllegalArgumentException("Phone number should be valid");
                }
                user.setPhone(request.getPhone());
            }

            // Update preferences
            if (request.getPreferences() != null) {
                validateAndUpdateUserPreferences(user, request.getPreferences());
            }

            // Update notification preferences
            if (request.getNotificationPreferences() != null) {
                validateAndUpdateUserNotificationPreferences(user, request.getNotificationPreferences());
            }

            // Save user
            User savedUser = save(user);

            // Return updated configuration
            return getUserConfig(savedUser);

        } catch (Exception e) {
            logger.error("Error updating user configuration for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to update user configuration", e);
        }
    }

    /**
     * Get user preferences
     */
    @Transactional(readOnly = true)
    public UserConfigDTO.UserPreferencesDTO getUserPreferences(User user) {
        try {
            UserConfigDTO.UserPreferencesDTO preferences = new UserConfigDTO.UserPreferencesDTO();

            // Parse preferred regions from JSON
            List<String> preferredRegions = parseJsonToList(user.getPreferredRegions(), String.class);
            preferences.setPreferredRegions(preferredRegions);

            // Parse notification preferences to extract general preferences
            Map<String, Object> notificationPrefs = parseJsonToMap(user.getNotificationPreferences());

            // Set default values if not present
            preferences.setLanguage((String) notificationPrefs.getOrDefault("language", "pt"));
            preferences.setTheme((String) notificationPrefs.getOrDefault("theme", "system"));
            preferences.setTimezone((String) notificationPrefs.getOrDefault("timezone", "Africa/Bissau"));
            preferences.setOfflineMode((Boolean) notificationPrefs.getOrDefault("offlineMode", false));
            preferences.setAutoSync((Boolean) notificationPrefs.getOrDefault("autoSync", true));

            // Extract custom settings
            @SuppressWarnings("unchecked")
            Map<String, Object> customSettings = (Map<String, Object>) notificationPrefs.get("customSettings");
            preferences.setCustomSettings(customSettings);

            return preferences;

        } catch (Exception e) {
            logger.error("Error getting user preferences for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to get user preferences", e);
        }
    }

    /**
     * Validate and update user preferences
     */
    private void validateAndUpdateUserPreferences(User user, UpdateUserConfigRequest.UserPreferencesRequest request) {
        // Validate language
        if (request.getLanguage() != null && !request.getLanguage().matches("^(pt|fr|en)$")) {
            throw new IllegalArgumentException("Language must be pt, fr, or en");
        }

        // Validate theme
        if (request.getTheme() != null && !request.getTheme().matches("^(light|dark|system)$")) {
            throw new IllegalArgumentException("Theme must be light, dark, or system");
        }

        // Validate timezone
        if (request.getTimezone() != null && !request.getTimezone().matches("^[A-Za-z_/]+$")) {
            throw new IllegalArgumentException("Timezone must be a valid timezone identifier");
        }

        // Update preferences
        updateUserPreferences(user, request);
    }

    /**
     * Update user preferences
     */
    public UserConfigDTO.UserPreferencesDTO updateUserPreferences(User user,
            UpdateUserConfigRequest.UserPreferencesRequest request) {
        try {
            // Parse existing notification preferences
            Map<String, Object> notificationPrefs = parseJsonToMap(user.getNotificationPreferences());

            // Update preferences
            if (request.getLanguage() != null) {
                notificationPrefs.put("language", request.getLanguage());
            }
            if (request.getTheme() != null) {
                notificationPrefs.put("theme", request.getTheme());
            }
            if (request.getTimezone() != null) {
                notificationPrefs.put("timezone", request.getTimezone());
            }
            if (request.getOfflineMode() != null) {
                notificationPrefs.put("offlineMode", request.getOfflineMode());
            }
            if (request.getAutoSync() != null) {
                notificationPrefs.put("autoSync", request.getAutoSync());
            }
            if (request.getCustomSettings() != null) {
                notificationPrefs.put("customSettings", request.getCustomSettings());
            }

            // Update preferred regions
            if (request.getPreferredRegions() != null) {
                user.setPreferredRegions(convertListToJson(request.getPreferredRegions()));
            }

            // Save updated notification preferences
            user.setNotificationPreferences(convertMapToJson(notificationPrefs));

            // Save user
            User savedUser = save(user);

            // Return updated preferences
            return getUserPreferences(savedUser);

        } catch (Exception e) {
            logger.error("Error updating user preferences for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to update user preferences", e);
        }
    }

    /**
     * Get user notification preferences
     */
    @Transactional(readOnly = true)
    public UserConfigDTO.NotificationPreferencesDTO getUserNotificationPreferences(User user) {
        try {
            UserConfigDTO.NotificationPreferencesDTO preferences = new UserConfigDTO.NotificationPreferencesDTO();

            // Parse notification preferences from JSON
            Map<String, Object> notificationPrefs = parseJsonToMap(user.getNotificationPreferences());

            // Set notification preferences with defaults
            preferences.setPriceAlerts((Boolean) notificationPrefs.getOrDefault("priceAlerts", true));
            preferences.setVerificationNotifications(
                    (Boolean) notificationPrefs.getOrDefault("verificationNotifications", true));
            preferences.setSystemNotifications((Boolean) notificationPrefs.getOrDefault("systemNotifications", true));
            preferences.setEmailNotifications((Boolean) notificationPrefs.getOrDefault("emailNotifications", false));
            preferences.setPushNotifications((Boolean) notificationPrefs.getOrDefault("pushNotifications", true));
            preferences.setAlertThreshold((Integer) notificationPrefs.getOrDefault("alertThreshold", 10));
            preferences.setFrequency((String) notificationPrefs.getOrDefault("frequency", "immediate"));
            preferences.setQuietHours((Boolean) notificationPrefs.getOrDefault("quietHours", false));
            preferences.setQuietStartTime((String) notificationPrefs.getOrDefault("quietStartTime", "22:00"));
            preferences.setQuietEndTime((String) notificationPrefs.getOrDefault("quietEndTime", "08:00"));

            // Parse alert regions and qualities
            @SuppressWarnings("unchecked")
            List<String> alertRegions = (List<String>) notificationPrefs.get("alertRegions");
            preferences.setAlertRegions(alertRegions);

            @SuppressWarnings("unchecked")
            List<String> alertQualities = (List<String>) notificationPrefs.get("alertQualities");
            preferences.setAlertQualities(alertQualities);

            return preferences;

        } catch (Exception e) {
            logger.error("Error getting user notification preferences for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to get user notification preferences", e);
        }
    }

    /**
     * Validate and update user notification preferences
     */
    private void validateAndUpdateUserNotificationPreferences(User user,
            UpdateUserConfigRequest.NotificationPreferencesRequest request) {
        // Validate alert threshold
        if (request.getAlertThreshold() != null
                && (request.getAlertThreshold() < 1 || request.getAlertThreshold() > 100)) {
            throw new IllegalArgumentException("Alert threshold must be at least 1% and at most 100%");
        }

        // Validate frequency
        if (request.getFrequency() != null && !request.getFrequency().matches("^(immediate|daily|weekly)$")) {
            throw new IllegalArgumentException("Frequency must be immediate, daily, or weekly");
        }

        // Validate time formats
        if (request.getQuietStartTime() != null
                && !request.getQuietStartTime().matches("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new IllegalArgumentException("Quiet start time must be in HH:MM format");
        }

        if (request.getQuietEndTime() != null
                && !request.getQuietEndTime().matches("^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$")) {
            throw new IllegalArgumentException("Quiet end time must be in HH:MM format");
        }

        // Update notification preferences
        updateUserNotificationPreferences(user, request);
    }

    /**
     * Update user notification preferences
     */
    public UserConfigDTO.NotificationPreferencesDTO updateUserNotificationPreferences(User user,
            UpdateUserConfigRequest.NotificationPreferencesRequest request) {
        try {
            // Parse existing notification preferences
            Map<String, Object> notificationPrefs = parseJsonToMap(user.getNotificationPreferences());

            // Update notification preferences
            if (request.getPriceAlerts() != null) {
                notificationPrefs.put("priceAlerts", request.getPriceAlerts());
            }
            if (request.getVerificationNotifications() != null) {
                notificationPrefs.put("verificationNotifications", request.getVerificationNotifications());
            }
            if (request.getSystemNotifications() != null) {
                notificationPrefs.put("systemNotifications", request.getSystemNotifications());
            }
            if (request.getEmailNotifications() != null) {
                notificationPrefs.put("emailNotifications", request.getEmailNotifications());
            }
            if (request.getPushNotifications() != null) {
                notificationPrefs.put("pushNotifications", request.getPushNotifications());
            }
            if (request.getAlertThreshold() != null) {
                notificationPrefs.put("alertThreshold", request.getAlertThreshold());
            }
            if (request.getFrequency() != null) {
                notificationPrefs.put("frequency", request.getFrequency());
            }
            if (request.getQuietHours() != null) {
                notificationPrefs.put("quietHours", request.getQuietHours());
            }
            if (request.getQuietStartTime() != null) {
                notificationPrefs.put("quietStartTime", request.getQuietStartTime());
            }
            if (request.getQuietEndTime() != null) {
                notificationPrefs.put("quietEndTime", request.getQuietEndTime());
            }
            if (request.getAlertRegions() != null) {
                notificationPrefs.put("alertRegions", request.getAlertRegions());
            }
            if (request.getAlertQualities() != null) {
                notificationPrefs.put("alertQualities", request.getAlertQualities());
            }

            // Save updated notification preferences
            user.setNotificationPreferences(convertMapToJson(notificationPrefs));

            // Save user
            User savedUser = save(user);

            // Return updated preferences
            return getUserNotificationPreferences(savedUser);

        } catch (Exception e) {
            logger.error("Error updating user notification preferences for user: {}", user.getEmail(), e);
            throw new RuntimeException("Failed to update user notification preferences", e);
        }
    }

    // ==================== HELPER METHODS ====================

    /**
     * Parse JSON string to List
     */
    private <T> List<T> parseJsonToList(String json, Class<T> clazz) {
        if (json == null || json.trim().isEmpty()) {
            return new ArrayList<>();
        }
        try {
            return objectMapper.readValue(json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, clazz));
        } catch (JsonProcessingException e) {
            logger.warn("Failed to parse JSON to List: {}", json, e);
            return new ArrayList<>();
        }
    }

    /**
     * Parse JSON string to Map
     */
    private Map<String, Object> parseJsonToMap(String json) {
        if (json == null || json.trim().isEmpty()) {
            return new java.util.HashMap<>();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<Map<String, Object>>() {
            });
        } catch (JsonProcessingException e) {
            logger.warn("Failed to parse JSON to Map: {}", json, e);
            return new java.util.HashMap<>();
        }
    }

    /**
     * Convert List to JSON string
     */
    private String convertListToJson(List<?> list) {
        if (list == null || list.isEmpty()) {
            return "[]";
        }
        try {
            return objectMapper.writeValueAsString(list);
        } catch (JsonProcessingException e) {
            logger.error("Failed to convert List to JSON", e);
            return "[]";
        }
    }

    /**
     * Convert Map to JSON string
     */
    private String convertMapToJson(Map<String, Object> map) {
        if (map == null || map.isEmpty()) {
            return "{}";
        }
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            logger.error("Failed to convert Map to JSON", e);
            return "{}";
        }
    }
}
