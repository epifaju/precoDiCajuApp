import React, { useEffect } from 'react';
import { useNotifications, usePriceAlerts, usePriceVerifications } from '../hooks/useWebSocket';
import { useNotificationStore } from '../store/notificationStore';
import { useTranslation } from 'react-i18next';

export const WebSocketNotifications: React.FC = () => {
  const { t } = useTranslation();
  const { addToast } = useNotificationStore();

  // Handle general notifications
  useNotifications((notification) => {
    addToast({
      title: notification.title || t('notification.title', 'Notification'),
      message: notification.message || '',
      type: notification.notificationType || 'info',
      duration: 6000,
    });
  });

  // Handle price alerts
  usePriceAlerts((alert) => {
    const variation = alert.variation || 0;
    const direction = variation > 0 ? t('price.increase', 'augmentation') : t('price.decrease', 'diminution');
    
    addToast({
      title: alert.title || t('price.alert', 'Alerte Prix'),
      message: alert.message || t('price.variationDetected', 'Variation de prix détectée'),
      type: 'warning',
      duration: 8000,
    });
  });

  // Handle price verifications
  usePriceVerifications((verification) => {
    if (verification.data) {
      const price = verification.data;
      addToast({
        title: t('price.verified', 'Prix Vérifié'),
        message: t('price.verifiedMessage', 
          `Le prix de ${price.priceFcfa} FCFA/kg pour ${price.qualityName} a été vérifié`,
          { price: price.priceFcfa, quality: price.qualityName }
        ),
        type: 'success',
        duration: 5000,
      });
    }
  });

  return null; // This component doesn't render anything
};
