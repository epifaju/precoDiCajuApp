package gw.precaju.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * Configuration WebSocket pour la communication temps réel
 * Utilise STOMP (Simple Text Oriented Messaging Protocol) sur WebSocket
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // Configuration du broker de messages
        // /topic pour les messages broadcast (tous les utilisateurs)
        // /queue pour les messages privés (utilisateur spécifique)
        // /user pour les messages personnalisés
        config.enableSimpleBroker("/topic", "/queue", "/user");

        // Préfixe pour les destinations côté client
        config.setApplicationDestinationPrefixes("/app");

        // Préfixe pour les messages privés
        config.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // Endpoint WebSocket avec SockJS pour la compatibilité navigateur
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Permettre toutes les origines en développement
                .withSockJS(); // Support SockJS pour les navigateurs qui ne supportent pas WebSocket

        // Endpoint WebSocket natif (sans SockJS)
        registry.addEndpoint("/ws-native")
                .setAllowedOriginPatterns("*");
    }
}
