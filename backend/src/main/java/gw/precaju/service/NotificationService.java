package gw.precaju.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import gw.precaju.dto.NotificationConfigDTO;
import gw.precaju.dto.NotificationHistoryDTO;
import gw.precaju.dto.NotificationSubscriptionDTO;
import gw.precaju.entity.NotificationConfig;
import gw.precaju.entity.NotificationEnvoyee;
import gw.precaju.entity.Price;
import gw.precaju.entity.User;
import gw.precaju.repository.NotificationConfigRepository;
import gw.precaju.repository.NotificationEnvoyeeRepository;
import gw.precaju.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationConfigRepository notificationConfigRepository;
    private final NotificationEnvoyeeRepository notificationEnvoyeeRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${app.vapid.public-key:}")
    private String vapidPublicKey;

    @Value("${app.vapid.private-key:}")
    private String vapidPrivateKey;

    @Value("${app.vapid.subject:mailto:admin@precaju.gw}")
    private String vapidSubject;

    private PushService pushService;

    private PushService getPushService() {
        if (pushService == null && vapidPrivateKey != null && !vapidPrivateKey.isEmpty()) {
            try {
                pushService = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
            } catch (Exception e) {
                log.error("Failed to initialize PushService", e);
            }
        }
        return pushService;
    }

    /**
     * Subscribe user to push notifications
     */
    @Transactional
    public void subscribeUser(User user, NotificationSubscriptionDTO subscriptionDTO) {
        try {
            // Update user's push subscription and preferences
            user.setPushSubscription(subscriptionDTO.getPushSubscription());
            user.setAbonnementNotifications(true);

            // Update notification preferences
            Map<String, Object> preferences = new HashMap<>();
            preferences.put("prix_variations", subscriptionDTO.getPrixVariations());
            if (subscriptionDTO.getSeuilPersonnalise() != null) {
                preferences.put("seuil_perso", subscriptionDTO.getSeuilPersonnalise());
            }

            user.setNotificationPreferences(objectMapper.writeValueAsString(preferences));
            userRepository.save(user);

            log.info("User {} subscribed to push notifications", user.getEmail());
        } catch (Exception e) {
            log.error("Failed to subscribe user to notifications", e);
            throw new RuntimeException("Failed to subscribe to notifications", e);
        }
    }

    /**
     * Unsubscribe user from push notifications
     */
    @Transactional
    public void unsubscribeUser(User user) {
        user.setPushSubscription(null);
        user.setAbonnementNotifications(false);
        userRepository.save(user);

        log.info("User {} unsubscribed from push notifications", user.getEmail());
    }

    /**
     * Send price variation notification to all subscribed users
     */
    @Transactional
    public void sendPriceVariationNotification(Price price, BigDecimal ancienPrix, BigDecimal variationPct) {
        try {
            // Get all subscribed users
            List<User> subscribedUsers = userRepository.findByAbonnementNotificationsTrueAndPushSubscriptionIsNotNull();

            if (subscribedUsers.isEmpty()) {
                log.info("No subscribed users found for price variation notification");
                return;
            }

            // Prepare notification message
            String message = buildPriceVariationMessage(price, ancienPrix, variationPct);
            Map<String, Object> payload = buildNotificationPayload(price, message);

            // Send notifications asynchronously
            CompletableFuture.runAsync(() -> {
                for (User user : subscribedUsers) {
                    try {
                        sendNotificationToUser(user, payload, price, ancienPrix, price.getPriceFcfa(), variationPct,
                                message);
                    } catch (Exception e) {
                        log.error("Failed to send notification to user {}", user.getEmail(), e);
                    }
                }
            });

        } catch (Exception e) {
            log.error("Failed to send price variation notifications", e);
        }
    }

    private void sendNotificationToUser(User user, Map<String, Object> payload, Price price,
            BigDecimal ancienPrix, BigDecimal nouveauPrix,
            BigDecimal variationPct, String message) {
        try {
            PushService service = getPushService();
            if (service == null) {
                log.warn("PushService not initialized, skipping notification for user {}", user.getEmail());
                return;
            }

            // Parse user's push subscription
            Subscription subscription = objectMapper.readValue(user.getPushSubscription(), Subscription.class);

            // Create notification
            String payloadJson = objectMapper.writeValueAsString(payload);
            Notification notification = new Notification(subscription, payloadJson);

            // Send notification
            service.send(notification);

            // Record successful notification
            recordNotification(user, price, ancienPrix, nouveauPrix, variationPct, message,
                    NotificationEnvoyee.NotificationStatut.ENVOYEE);

            log.info("Successfully sent notification to user {}", user.getEmail());

        } catch (Exception e) {
            log.error("Failed to send notification to user {}", user.getEmail(), e);

            // Record failed notification
            recordNotification(user, price, ancienPrix, nouveauPrix, variationPct, message,
                    NotificationEnvoyee.NotificationStatut.ECHEC);
        }
    }

    private String buildPriceVariationMessage(Price price, BigDecimal ancienPrix, BigDecimal variationPct) {
        String direction = price.getPriceFcfa().compareTo(ancienPrix) > 0 ? "📈 Hausse" : "📉 Baisse";
        return String.format("%s du cajou : %.0f FCFA (%.1f%%) à %s",
                direction, price.getPriceFcfa(), variationPct, price.getRegionCode());
    }

    private Map<String, Object> buildNotificationPayload(Price price, String message) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("title", "Preço di Caju - Variation de prix");
        payload.put("body", message);
        payload.put("icon", "/icon-192.png");
        payload.put("badge", "/icon-192.png");
        payload.put("tag", "prix-" + price.getId());
        payload.put("data", Map.of(
                "url", "/prices/" + price.getId(),
                "priceId", price.getId().toString()));
        return payload;
    }

    private void recordNotification(User user, Price price, BigDecimal ancienPrix, BigDecimal nouveauPrix,
            BigDecimal variationPct, String message, NotificationEnvoyee.NotificationStatut statut) {
        try {
            NotificationEnvoyee notification = new NotificationEnvoyee();
            notification.setUtilisateur(user);
            notification.setPrix(price);
            notification.setAncienPrix(ancienPrix);
            notification.setNouveauPrix(nouveauPrix);
            notification.setVariationPourcentage(variationPct);
            notification.setMessage(message);
            notification.setStatut(statut);

            notificationEnvoyeeRepository.save(notification);
        } catch (Exception e) {
            log.error("Failed to record notification", e);
        }
    }

    /**
     * Get notification configuration
     */
    public Optional<NotificationConfigDTO> getNotificationConfig() {
        return notificationConfigRepository.findActiveConfig()
                .map(this::mapToDTO);
    }

    /**
     * Update notification configuration
     */
    @Transactional
    public NotificationConfigDTO updateNotificationConfig(NotificationConfigDTO configDTO) {
        Optional<NotificationConfig> existingConfig = notificationConfigRepository.findActiveConfig();

        NotificationConfig config;
        if (existingConfig.isPresent()) {
            config = existingConfig.get();
            config.setSeuilPourcentage(configDTO.getSeuilPourcentage());
            config.setActif(configDTO.getActif());
        } else {
            config = new NotificationConfig();
            config.setSeuilPourcentage(configDTO.getSeuilPourcentage());
            config.setActif(configDTO.getActif());
        }

        config = notificationConfigRepository.save(config);
        return mapToDTO(config);
    }

    /**
     * Get user's notification history
     */
    public Page<NotificationHistoryDTO> getUserNotificationHistory(User user, Pageable pageable) {
        return notificationEnvoyeeRepository.findByUtilisateurOrderByCreatedAtDesc(user, pageable)
                .map(this::mapToHistoryDTO);
    }

    /**
     * Get VAPID public key for frontend
     */
    public String getVapidPublicKey() {
        return vapidPublicKey;
    }

    private NotificationConfigDTO mapToDTO(NotificationConfig config) {
        NotificationConfigDTO dto = new NotificationConfigDTO();
        dto.setId(config.getId());
        dto.setSeuilPourcentage(config.getSeuilPourcentage());
        dto.setActif(config.getActif());
        dto.setCreatedAt(config.getCreatedAt());
        dto.setUpdatedAt(config.getUpdatedAt());
        return dto;
    }

    private NotificationHistoryDTO mapToHistoryDTO(NotificationEnvoyee notification) {
        NotificationHistoryDTO dto = new NotificationHistoryDTO();
        dto.setId(notification.getId());
        dto.setPrixId(notification.getPrix().getId());
        dto.setRegionCode(notification.getPrix().getRegionCode());
        dto.setQualityGrade(notification.getPrix().getQualityGradeCode());
        dto.setAncienPrix(notification.getAncienPrix());
        dto.setNouveauPrix(notification.getNouveauPrix());
        dto.setVariationPourcentage(notification.getVariationPourcentage());
        dto.setMessage(notification.getMessage());
        dto.setStatut(notification.getStatut().name());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
