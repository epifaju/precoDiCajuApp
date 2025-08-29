import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { AlertTriangle, X, Info } from 'lucide-react';
import { cn } from '../../utils/cn';

export const LogoutNotification: React.FC = () => {
  const { t } = useTranslation();
  const { logoutReason, clearLogoutReason } = useAuthStore();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (logoutReason) {
      setIsVisible(true);
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => clearLogoutReason(), 300); // Clear after animation
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [logoutReason, clearLogoutReason]);

  if (!logoutReason || !isVisible) {
    return null;
  }

  const getNotificationConfig = (reason: string) => {
    switch (reason) {
      case 'user_logout':
        return {
          type: 'info' as const,
          icon: <Info className="w-5 h-5" />,
          title: t('logout.userInitiated', 'Déconnexion réussie'),
          message: t('logout.userInitiatedMessage', 'Vous avez été déconnecté avec succès.'),
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          borderColor: 'border-blue-200 dark:border-blue-800',
          textColor: 'text-blue-800 dark:text-blue-200',
        };
      case 'session_expired':
        return {
          type: 'warning' as const,
          icon: <AlertTriangle className="w-5 h-5" />,
          title: t('logout.sessionExpired', 'Session expirée'),
          message: t('logout.sessionExpiredMessage', 'Votre session a expiré. Veuillez vous reconnecter.'),
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
        };
      case 'token_expired':
        return {
          type: 'warning' as const,
          icon: <AlertTriangle className="w-5 h-5" />,
          title: t('logout.tokenExpired', 'Token expiré'),
          message: t('logout.tokenExpiredMessage', 'Votre token d\'authentification a expiré.'),
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderColor: 'border-yellow-200 dark:border-yellow-800',
          textColor: 'text-yellow-800 dark:text-yellow-200',
        };
      case 'unauthorized':
        return {
          type: 'error' as const,
          icon: <AlertTriangle className="w-5 h-5" />,
          title: t('logout.unauthorized', 'Accès refusé'),
          message: t('logout.unauthorizedMessage', 'Vous n\'avez pas les autorisations nécessaires.'),
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
        };
      case 'security_breach':
        return {
          type: 'error' as const,
          icon: <AlertTriangle className="w-5 h-5" />,
          title: t('logout.securityBreach', 'Problème de sécurité'),
          message: t('logout.securityBreachMessage', 'Votre session a été interrompue pour des raisons de sécurité.'),
          bgColor: 'bg-red-50 dark:bg-red-900/20',
          borderColor: 'border-red-200 dark:border-red-800',
          textColor: 'text-red-800 dark:text-red-200',
        };
      default:
        return {
          type: 'info' as const,
          icon: <Info className="w-5 h-5" />,
          title: t('logout.default', 'Déconnexion'),
          message: t('logout.defaultMessage', 'Vous avez été déconnecté.'),
          bgColor: 'bg-gray-50 dark:bg-gray-900/20',
          borderColor: 'border-gray-200 dark:border-gray-800',
          textColor: 'text-gray-800 dark:text-gray-200',
        };
    }
  };

  const config = getNotificationConfig(logoutReason);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => clearLogoutReason(), 300);
  };

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md animate-in slide-in-from-right duration-300">
      <div
        className={cn(
          'rounded-lg border p-4 shadow-lg',
          config.bgColor,
          config.borderColor
        )}
      >
        <div className="flex items-start space-x-3">
          <div className={cn('flex-shrink-0', config.textColor)}>
            {config.icon}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className={cn('text-sm font-medium', config.textColor)}>
              {config.title}
            </h3>
            <p className={cn('mt-1 text-sm', config.textColor)}>
              {config.message}
            </p>
            
            {/* Action buttons */}
            <div className="mt-3 flex space-x-2">
              <button
                onClick={handleClose}
                className={cn(
                  'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  config.type === 'info' || config.type === 'warning'
                    ? 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    : 'bg-white dark:bg-gray-800 text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20'
                )}
              >
                {t('common.understand', 'Compris')}
              </button>
              
              {config.type === 'warning' || config.type === 'error' ? (
                <a
                  href="/login"
                  className={cn(
                    'inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    config.type === 'warning'
                      ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  )}
                >
                  {t('common.reconnect', 'Se reconnecter')}
                </a>
              ) : null}
            </div>
          </div>
          
          <button
            onClick={handleClose}
            className={cn(
              'flex-shrink-0 rounded-md p-1 transition-colors',
              config.textColor,
              'hover:bg-white/20'
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
