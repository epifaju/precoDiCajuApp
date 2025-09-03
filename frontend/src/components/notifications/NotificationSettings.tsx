import React, { useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { Bell, BellOff, Settings, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface NotificationSettingsProps {
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({ className }) => {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    error,
    subscribe,
    unsubscribe,
    permission
  } = useNotifications();

  const [showDetails, setShowDetails] = useState(false);

  const handleSubscribe = async () => {
    const success = await subscribe();
    if (success) {
      // Optionally show success message
    }
  };

  const handleUnsubscribe = async () => {
    const success = await unsubscribe();
    if (success) {
      // Optionally show success message
    }
  };

  const getPermissionStatus = () => {
    switch (permission) {
      case 'granted':
        return { text: 'Autorisé', color: 'text-green-600', icon: CheckCircle };
      case 'denied':
        return { text: 'Refusé', color: 'text-red-600', icon: AlertCircle };
      default:
        return { text: 'Non demandé', color: 'text-gray-600', icon: AlertCircle };
    }
  };

  const permissionStatus = getPermissionStatus();
  const PermissionIcon = permissionStatus.icon;

  if (!isSupported) {
    return (
      <Card className={className}>
        <div className="flex items-center space-x-3 p-4">
          <AlertCircle className="h-5 w-5 text-yellow-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">
              Notifications non supportées
            </h3>
            <p className="text-sm text-gray-500">
              Votre navigateur ne supporte pas les notifications push.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Notifications de prix
              </h3>
              <p className="text-sm text-gray-500">
                Recevez des alertes en temps réel sur les variations de prix
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="text-gray-500 hover:text-gray-700"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Status and Action */}
        <div className="space-y-4">
          {/* Permission Status */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <PermissionIcon className={`h-4 w-4 ${permissionStatus.color}`} />
              <span className="text-sm font-medium text-gray-700">
                Permission: {permissionStatus.text}
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center">
            {isSubscribed ? (
              <Button
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="outline"
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Désabonnement...
                  </>
                ) : (
                  <>
                    <BellOff className="h-4 w-4 mr-2" />
                    Désactiver les notifications
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubscribe}
                disabled={isLoading || permission === 'denied'}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Abonnement...
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4 mr-2" />
                    Activer les notifications
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Details Section */}
          {showDetails && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                À propos des notifications
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Vous recevrez une notification quand le prix du cajou varie de plus de 10%</li>
                <li>• Les notifications incluent le nouveau prix et le pourcentage de variation</li>
                <li>• Vous pouvez désactiver les notifications à tout moment</li>
                <li>• Les notifications fonctionnent même quand l'application est fermée</li>
              </ul>
            </div>
          )}

          {/* Help Text */}
          {permission === 'denied' && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Notifications bloquées</p>
                  <p>
                    Pour activer les notifications, veuillez autoriser les notifications 
                    dans les paramètres de votre navigateur et actualiser la page.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
