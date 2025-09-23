// Service Worker pour les notifications push
// sw-notifications.js

const CACHE_NAME = 'precaju-notifications-v1';
const NOTIFICATION_TAG = 'precaju-price-notification';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Push event - Handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  let notificationData = {
    title: 'Preço di Caju',
    body: 'Nouvelle variation de prix',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: NOTIFICATION_TAG,
    data: {
      url: '/prices',
      timestamp: Date.now(),
    },
  };

  // Parse push data if available
  if (event.data) {
    try {
      const pushData = event.data.json();
      notificationData = {
        ...notificationData,
        ...pushData,
      };
    } catch (e) {
      console.error('Error parsing push data:', e);
      // Fallback to text data
      notificationData.body = event.data.text() || notificationData.body;
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    vibrate: [100, 50, 100],
    data: notificationData.data,
    actions: [
      {
        action: 'view',
        title: 'Voir les prix',
        icon: '/icon-192.png',
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icon-192.png',
      },
    ],
    requireInteraction: false,
    silent: false,
  };

  event.waitUntil(self.registration.showNotification(notificationData.title, options));
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  // Default action or 'view' action
  const urlToOpen = event.notification.data?.url || '/prices';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no existing window, open a new one
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Background sync (if supported)
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);

  if (event.tag === 'notification-sync') {
    event.waitUntil(
      // Handle any background sync tasks here
      Promise.resolve()
    );
  }
});

// Message event - Handle messages from the main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Error handling
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});

// Utility function to show notification manually
function showNotification(title, body, data = {}) {
  return self.registration.showNotification(title, {
    body,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: NOTIFICATION_TAG,
    data,
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'view',
        title: 'Voir les prix',
        icon: '/icon-192.png',
      },
      {
        action: 'close',
        title: 'Fermer',
        icon: '/icon-192.png',
      },
    ],
  });
}

// Export for potential use
self.showNotification = showNotification;






