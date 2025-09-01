package gw.precaju.controller;

import gw.precaju.dto.PriceDTO;
import gw.precaju.dto.PriceStatsDTO;
import gw.precaju.entity.User;
import gw.precaju.repository.UserRepository;
import gw.precaju.security.JwtTokenProvider;
import gw.precaju.service.AuthService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SubscribeMapping;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.HashMap;
import java.util.Map;

/**
 * Contrôleur WebSocket pour gérer les connexions et messages temps réel
 */
@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    private final SimpMessagingTemplate messagingTemplate;
    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    public WebSocketController(SimpMessagingTemplate messagingTemplate,
            AuthService authService,
            JwtTokenProvider jwtTokenProvider,
            UserRepository userRepository) {
        this.messagingTemplate = messagingTemplate;
        this.authService = authService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.userRepository = userRepository;
    }

    /**
     * Gestion de la connexion WebSocket
     * Authentifie l'utilisateur et envoie un message de bienvenue
     */
    @MessageMapping("/connect")
    @SendTo("/topic/connection")
    public Map<String, Object> handleConnect(@Payload Map<String, String> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        try {
            String token = payload.get("token");
            if (token != null && jwtTokenProvider.validateToken(token)) {
                String username = jwtTokenProvider.getUsernameFromToken(token);
                User user = userRepository.findByEmail(username).orElse(null);

                if (user != null) {
                    // Stocker l'utilisateur dans la session
                    headerAccessor.getSessionAttributes().put("user", user);

                    Map<String, Object> response = new HashMap<>();
                    response.put("type", "connection");
                    response.put("status", "connected");
                    response.put("user", Map.of(
                            "id", user.getId().toString(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "role", user.getRole().toString()));
                    response.put("timestamp", System.currentTimeMillis());

                    logger.info("User {} connected via WebSocket", user.getEmail());
                    return response;
                }
            }
        } catch (Exception e) {
            logger.error("Error during WebSocket connection", e);
        }

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("type", "connection");
        errorResponse.put("status", "error");
        errorResponse.put("message", "Authentication failed");
        return errorResponse;
    }

    /**
     * Gestion de la déconnexion WebSocket
     */
    @MessageMapping("/disconnect")
    @SendTo("/topic/connection")
    public Map<String, Object> handleDisconnect(SimpMessageHeaderAccessor headerAccessor) {
        User user = (User) headerAccessor.getSessionAttributes().get("user");

        Map<String, Object> response = new HashMap<>();
        response.put("type", "connection");
        response.put("status", "disconnected");
        response.put("timestamp", System.currentTimeMillis());

        if (user != null) {
            response.put("user", Map.of(
                    "id", user.getId().toString(),
                    "email", user.getEmail()));
            logger.info("User {} disconnected from WebSocket", user.getEmail());
        }

        return response;
    }

    /**
     * Souscription aux mises à jour de prix pour une région spécifique
     */
    @MessageMapping("/subscribe/region")
    public void subscribeToRegion(@Payload Map<String, String> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        try {
            String regionCode = payload.get("regionCode");
            User user = (User) headerAccessor.getSessionAttributes().get("user");

            if (user != null && regionCode != null) {
                // L'utilisateur sera automatiquement abonné au topic
                // /topic/prices/region/{regionCode}
                logger.info("User {} subscribed to region {}", user.getEmail(), regionCode);
            }
        } catch (Exception e) {
            logger.error("Error subscribing to region", e);
        }
    }

    /**
     * Souscription aux mises à jour de prix pour une qualité spécifique
     */
    @MessageMapping("/subscribe/quality")
    public void subscribeToQuality(@Payload Map<String, String> payload,
            SimpMessageHeaderAccessor headerAccessor) {
        try {
            String qualityCode = payload.get("qualityCode");
            User user = (User) headerAccessor.getSessionAttributes().get("user");

            if (user != null && qualityCode != null) {
                // L'utilisateur sera automatiquement abonné au topic
                // /topic/prices/quality/{qualityCode}
                logger.info("User {} subscribed to quality {}", user.getEmail(), qualityCode);
            }
        } catch (Exception e) {
            logger.error("Error subscribing to quality", e);
        }
    }

    /**
     * Souscription aux statistiques globales
     */
    @MessageMapping("/subscribe/stats")
    public void subscribeToStats(SimpMessageHeaderAccessor headerAccessor) {
        try {
            User user = (User) headerAccessor.getSessionAttributes().get("user");

            if (user != null) {
                logger.info("User {} subscribed to statistics", user.getEmail());
            }
        } catch (Exception e) {
            logger.error("Error subscribing to stats", e);
        }
    }

    /**
     * Ping/Pong pour maintenir la connexion
     */
    @MessageMapping("/ping")
    @SendTo("/user/queue/pong")
    public Map<String, Object> handlePing(SimpMessageHeaderAccessor headerAccessor) {
        Map<String, Object> response = new HashMap<>();
        response.put("type", "pong");
        response.put("timestamp", System.currentTimeMillis());
        return response;
    }

    /**
     * Méthodes utilitaires pour envoyer des messages
     */

    /**
     * Envoyer un nouveau prix à tous les utilisateurs
     */
    public void broadcastNewPrice(PriceDTO price) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "new_price");
        message.put("data", price);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/prices/new", message);
        logger.info("Broadcasted new price: {}", price.getId());
    }

    /**
     * Envoyer une mise à jour de prix à tous les utilisateurs
     */
    public void broadcastPriceUpdate(PriceDTO price) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "price_update");
        message.put("data", price);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/prices/update", message);
        logger.info("Broadcasted price update: {}", price.getId());
    }

    /**
     * Envoyer une vérification de prix à tous les utilisateurs
     */
    public void broadcastPriceVerification(PriceDTO price) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "price_verification");
        message.put("data", price);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/prices/verification", message);
        logger.info("Broadcasted price verification: {}", price.getId());
    }

    /**
     * Envoyer des statistiques mises à jour
     */
    public void broadcastStatsUpdate(PriceStatsDTO stats) {
        Map<String, Object> message = new HashMap<>();
        message.put("type", "stats_update");
        message.put("data", stats);
        message.put("timestamp", System.currentTimeMillis());

        messagingTemplate.convertAndSend("/topic/stats", message);
        logger.info("Broadcasted stats update");
    }

    /**
     * Envoyer un message à un utilisateur spécifique
     */
    public void sendToUser(String userId, String destination, Object message) {
        messagingTemplate.convertAndSendToUser(userId, destination, message);
        logger.info("Sent message to user {}: {}", userId, destination);
    }

    /**
     * Envoyer une notification à un utilisateur spécifique
     */
    public void sendNotificationToUser(String userId, String title, String message, String type) {
        Map<String, Object> notification = new HashMap<>();
        notification.put("type", "notification");
        notification.put("title", title);
        notification.put("message", message);
        notification.put("notificationType", type);
        notification.put("timestamp", System.currentTimeMillis());

        sendToUser(userId, "/queue/notifications", notification);
    }

    /**
     * Diffuser un message à un topic spécifique
     */
    public void broadcastToTopic(String topic, Object message) {
        messagingTemplate.convertAndSend(topic, message);
    }

    /**
     * Getter pour le messagingTemplate (pour usage interne)
     */
    public SimpMessagingTemplate getMessagingTemplate() {
        return messagingTemplate;
    }
}
