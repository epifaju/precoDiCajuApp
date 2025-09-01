import { useEffect, useRef, useState } from 'react';
import { webSocketService, WebSocketConnectionState, WebSocketMessage, WebSocketMessageHandler } from '../services/WebSocketService';

/**
 * Hook pour gérer la connexion WebSocket
 */
export const useWebSocket = () => {
  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>(
    webSocketService.getConnectionState()
  );

  useEffect(() => {
    const handleConnectionStateChange = (state: WebSocketConnectionState) => {
      setConnectionState(state);
    };

    webSocketService.addConnectionStateHandler(handleConnectionStateChange);

    return () => {
      webSocketService.removeConnectionStateHandler(handleConnectionStateChange);
    };
  }, []);

  return {
    ...connectionState,
    connect: () => webSocketService.connect(),
    disconnect: () => webSocketService.disconnect(),
  };
};

/**
 * Hook pour écouter les messages WebSocket
 */
export const useWebSocketMessage = (
  messageType: string,
  handler: WebSocketMessageHandler,
  deps: any[] = []
) => {
  const handlerRef = useRef(handler);

  // Update handler ref when dependencies change
  useEffect(() => {
    handlerRef.current = handler;
  }, deps);

  useEffect(() => {
    const wrappedHandler = (message: WebSocketMessage) => {
      handlerRef.current(message);
    };

    webSocketService.addMessageHandler(messageType, wrappedHandler);

    return () => {
      webSocketService.removeMessageHandler(messageType, wrappedHandler);
    };
  }, [messageType]);
};

/**
 * Hook pour les mises à jour de prix en temps réel
 */
export const usePriceUpdates = (onNewPrice?: (price: any) => void, onPriceUpdate?: (price: any) => void) => {
  useWebSocketMessage('new_price', (message) => {
    if (onNewPrice && message.data) {
      onNewPrice(message.data);
    }
  }, [onNewPrice]);

  useWebSocketMessage('price_update', (message) => {
    if (onPriceUpdate && message.data) {
      onPriceUpdate(message.data);
    }
  }, [onPriceUpdate]);
};

/**
 * Hook pour les alertes de prix
 */
export const usePriceAlerts = (onPriceAlert?: (alert: any) => void) => {
  useWebSocketMessage('price_alert', (message) => {
    if (onPriceAlert) {
      onPriceAlert(message);
    }
  }, [onPriceAlert]);
};

/**
 * Hook pour les notifications utilisateur
 */
export const useNotifications = (onNotification?: (notification: any) => void) => {
  useWebSocketMessage('notification', (message) => {
    if (onNotification) {
      onNotification(message);
    }
  }, [onNotification]);
};

/**
 * Hook pour les mises à jour de statistiques
 */
export const useStatsUpdates = (onStatsUpdate?: (stats: any) => void) => {
  useWebSocketMessage('stats_update', (message) => {
    if (onStatsUpdate && message.data) {
      onStatsUpdate(message.data);
    }
  }, [onStatsUpdate]);
};

/**
 * Hook pour les vérifications de prix
 */
export const usePriceVerifications = (onVerification?: (price: any) => void) => {
  useWebSocketMessage('price_verification', (message) => {
    if (onVerification && message.data) {
      onVerification(message.data);
    }
  }, [onVerification]);
};
