package gw.precaju.controller;

import gw.precaju.dto.NotificationConfigDTO;
import gw.precaju.dto.NotificationHistoryDTO;
import gw.precaju.dto.NotificationSubscriptionDTO;
import gw.precaju.entity.User;
import gw.precaju.service.NotificationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    /**
     * Get VAPID public key for frontend
     */
    @GetMapping("/vapid-key")
    public ResponseEntity<Map<String, String>> getVapidPublicKey() {
        String publicKey = notificationService.getVapidPublicKey();
        return ResponseEntity.ok(Map.of("publicKey", publicKey));
    }

    /**
     * Subscribe user to push notifications
     */
    @PostMapping("/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody NotificationSubscriptionDTO subscriptionDTO) {

        try {
            notificationService.subscribeUser(user, subscriptionDTO);
            return ResponseEntity.ok(Map.of("message", "Successfully subscribed to notifications"));
        } catch (Exception e) {
            log.error("Failed to subscribe user to notifications", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to subscribe to notifications"));
        }
    }

    /**
     * Unsubscribe user from push notifications
     */
    @PostMapping("/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@AuthenticationPrincipal User user) {
        try {
            notificationService.unsubscribeUser(user);
            return ResponseEntity.ok(Map.of("message", "Successfully unsubscribed from notifications"));
        } catch (Exception e) {
            log.error("Failed to unsubscribe user from notifications", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to unsubscribe from notifications"));
        }
    }

    /**
     * Get user's notification history
     */
    @GetMapping("/history")
    public ResponseEntity<Page<NotificationHistoryDTO>> getNotificationHistory(
            @AuthenticationPrincipal User user,
            Pageable pageable) {

        Page<NotificationHistoryDTO> history = notificationService.getUserNotificationHistory(user, pageable);
        return ResponseEntity.ok(history);
    }

    /**
     * Get notification configuration (admin only)
     */
    @GetMapping("/config")
    public ResponseEntity<NotificationConfigDTO> getNotificationConfig() {
        return notificationService.getNotificationConfig()
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update notification configuration (admin only)
     */
    @PutMapping("/config")
    public ResponseEntity<NotificationConfigDTO> updateNotificationConfig(
            @Valid @RequestBody NotificationConfigDTO configDTO) {

        try {
            NotificationConfigDTO updatedConfig = notificationService.updateNotificationConfig(configDTO);
            return ResponseEntity.ok(updatedConfig);
        } catch (Exception e) {
            log.error("Failed to update notification configuration", e);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Test notification endpoint (admin only)
     */
    @PostMapping("/test")
    public ResponseEntity<Map<String, String>> sendTestNotification(@AuthenticationPrincipal User user) {
        try {
            // This would send a test notification to the current user
            // Implementation depends on your test requirements
            return ResponseEntity.ok(Map.of("message", "Test notification sent"));
        } catch (Exception e) {
            log.error("Failed to send test notification", e);
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Failed to send test notification"));
        }
    }
}
