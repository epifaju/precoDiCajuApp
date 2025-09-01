import SockJS from 'sockjs-client';
import { Client, IMessage } from '@stomp/stompjs';
import { useAuthStore } from '../store/authStore';

export interface WebSocketMessage {
  type: string;
  data?: any;
  title?: string;
  message?: string;
  notificationType?: string;
  timestamp: number;
}

export interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
}

export type WebSocketMessageHandler = (message: WebSocketMessage) => void;

// Types pour STOMP (déjà importés)

class WebSocketService {
  private client: Client | null = null;
  private socket: WebSocket | null = null;
  private connectionState: WebSocketConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
  };
  private messageHandlers: Map<string, WebSocketMessageHandler[]> = new Map();
  private connectionStateHandlers: ((state: WebSocketConnectionState) => void)[] = [];
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000; // 3 seconds

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for auth state changes
    useAuthStore.subscribe((state) => {
      if (state.isAuthenticated && state.accessToken) {
        this.connect();
      } else {
        this.disconnect();
      }
    });
  }

  /**
   * Connect to WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.connectionState.isConnected || this.connectionState.isConnecting) {
        resolve();
        return;
      }

      const token = useAuthStore.getState().accessToken;
      if (!token) {
        reject(new Error('No authentication token available'));
        return;
      }

      this.connectionState.isConnecting = true;
      this.connectionState.error = null;
      this.notifyConnectionStateChange();

      try {
        // Create SockJS connection
        const wsUrl = `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/ws`;
        console.log('🔌 Attempting WebSocket connection to:', wsUrl);
        console.log('🔑 Using token:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN');
        
        this.socket = new SockJS(wsUrl);

        // Create STOMP client
        this.client = new Client({
          webSocketFactory: () => this.socket!,
          debug: (str) => {
            console.log('STOMP Debug:', str);
          },
          reconnectDelay: 5000,
          heartbeatIncoming: 4000,
          heartbeatOutgoing: 4000,
        });

        // Connect to server
        this.client.onConnect = (frame) => {
          console.log('WebSocket connected:', frame);
          this.connectionState.isConnected = true;
          this.connectionState.isConnecting = false;
          this.connectionState.error = null;
          this.connectionState.reconnectAttempts = 0;
          this.notifyConnectionStateChange();

          // Send authentication
          this.client?.publish({
            destination: '/app/connect',
            body: JSON.stringify({ token })
          });

          // Subscribe to topics
          this.subscribeToTopics();

          // Start ping/pong
          this.startPingPong();

          resolve();
        };

        this.client.onStompError = (error) => {
          console.error('WebSocket connection error:', error);
          this.connectionState.isConnected = false;
          this.connectionState.isConnecting = false;
          this.connectionState.error = error.toString();
          this.notifyConnectionStateChange();

          this.scheduleReconnect();
          reject(error);
        };

        this.client.activate();
      } catch (error) {
        console.error('WebSocket setup error:', error);
        this.connectionState.isConnected = false;
        this.connectionState.isConnecting = false;
        this.connectionState.error = error instanceof Error ? error.message : 'Unknown error';
        this.notifyConnectionStateChange();

        this.scheduleReconnect();
        reject(error);
      }
    });
  }

  /**
   * Disconnect from WebSocket server
   */
  public disconnect(): void {
    this.clearTimers();

    if (this.client && this.connectionState.isConnected) {
      this.client.publish({
        destination: '/app/disconnect',
        body: '{}'
      });
      this.client.deactivate();
      console.log('WebSocket disconnected');
    }

    this.client = null;
    this.socket = null;
    this.connectionState.isConnected = false;
    this.connectionState.isConnecting = false;
    this.connectionState.error = null;
    this.notifyConnectionStateChange();
  }

  /**
   * Subscribe to WebSocket topics
   */
  private subscribeToTopics(): void {
    if (!this.client) return;

    // Subscribe to connection status
    this.client.subscribe('/topic/connection', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.handleMessage('connection', data);
    });

    // Subscribe to new prices
    this.client.subscribe('/topic/prices/new', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.handleMessage('new_price', data);
    });

    // Subscribe to price updates
    this.client.subscribe('/topic/prices/update', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.handleMessage('price_update', data);
    });

    // Subscribe to price verifications
    this.client.subscribe('/topic/prices/verification', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.handleMessage('price_verification', data);
    });

    // Subscribe to price alerts
    this.client.subscribe('/topic/price_alerts', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.handleMessage('price_alert', data);
    });

    // Subscribe to statistics updates
    this.client.subscribe('/topic/stats', (message: IMessage) => {
      const data = JSON.parse(message.body);
      this.handleMessage('stats_update', data);
    });

    // Subscribe to user notifications
    const userId = useAuthStore.getState().user?.id;
    if (userId) {
      this.client.subscribe(`/user/${userId}/queue/notifications`, (message: IMessage) => {
        const data = JSON.parse(message.body);
        this.handleMessage('notification', data);
      });

      this.client.subscribe(`/user/${userId}/queue/pong`, (message: IMessage) => {
        const data = JSON.parse(message.body);
        this.handleMessage('pong', data);
      });
    }
  }

  /**
   * Subscribe to region-specific price updates
   */
  public subscribeToRegion(regionCode: string): void {
    if (!this.client || !this.connectionState.isConnected) return;

    this.client.publish({
      destination: '/app/subscribe/region',
      body: JSON.stringify({ regionCode })
    });
  }

  /**
   * Subscribe to quality-specific price updates
   */
  public subscribeToQuality(qualityCode: string): void {
    if (!this.client || !this.connectionState.isConnected) return;

    this.client.publish({
      destination: '/app/subscribe/quality',
      body: JSON.stringify({ qualityCode })
    });
  }

  /**
   * Subscribe to statistics updates
   */
  public subscribeToStats(): void {
    if (!this.client || !this.connectionState.isConnected) return;

    this.client.publish({
      destination: '/app/subscribe/stats',
      body: '{}'
    });
  }

  /**
   * Add message handler
   */
  public addMessageHandler(type: string, handler: WebSocketMessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type)!.push(handler);
  }

  /**
   * Remove message handler
   */
  public removeMessageHandler(type: string, handler: WebSocketMessageHandler): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  /**
   * Add connection state handler
   */
  public addConnectionStateHandler(handler: (state: WebSocketConnectionState) => void): void {
    this.connectionStateHandlers.push(handler);
  }

  /**
   * Remove connection state handler
   */
  public removeConnectionStateHandler(handler: (state: WebSocketConnectionState) => void): void {
    const index = this.connectionStateHandlers.indexOf(handler);
    if (index > -1) {
      this.connectionStateHandlers.splice(index, 1);
    }
  }

  /**
   * Get current connection state
   */
  public getConnectionState(): WebSocketConnectionState {
    return { ...this.connectionState };
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(type: string, data: any): void {
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in message handler for type ${type}:`, error);
        }
      });
    }

    // Also call generic handlers
    const genericHandlers = this.messageHandlers.get('*');
    if (genericHandlers) {
      genericHandlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error('Error in generic message handler:', error);
        }
      });
    }
  }

  /**
   * Notify connection state change
   */
  private notifyConnectionStateChange(): void {
    this.connectionStateHandlers.forEach(handler => {
      try {
        handler(this.connectionState);
      } catch (error) {
        console.error('Error in connection state handler:', error);
      }
    });
  }

  /**
   * Schedule reconnection
   */
  private scheduleReconnect(): void {
    if (this.connectionState.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached');
      return;
    }

    this.connectionState.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.connectionState.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect().catch(console.error);
    }, this.reconnectDelay * this.connectionState.reconnectAttempts);
  }

  /**
   * Start ping/pong to keep connection alive
   */
  private startPingPong(): void {
    this.pingTimer = setInterval(() => {
      if (this.client && this.connectionState.isConnected) {
        this.client.publish({
          destination: '/app/ping',
          body: '{}'
        });
      }
    }, 30000); // Ping every 30 seconds
  }

  /**
   * Clear all timers
   */
  private clearTimers(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
