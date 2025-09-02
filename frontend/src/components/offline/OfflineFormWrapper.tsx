import React, { ReactNode } from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { useOfflineNotifications } from '../../hooks/useOfflineNotifications';
import { Card, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Save, 
  Cloud, 
  Clock,
  CheckCircle
} from 'lucide-react';

interface OfflineFormWrapperProps {
  children: ReactNode;
  title?: string;
  description?: string;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  showOfflineIndicator?: boolean;
  showSyncStatus?: boolean;
  className?: string;
}

export const OfflineFormWrapper: React.FC<OfflineFormWrapperProps> = ({
  children,
  title,
  description,
  onSubmit,
  isSubmitting = false,
  showOfflineIndicator = true,
  showSyncStatus = true,
  className = '',
}) => {
  const { isOnline, quality } = useConnectionStatus();
  const { addNotification } = useOfflineNotifications();

  const getConnectionStatus = () => {
    if (!isOnline) return { status: 'offline', color: 'destructive', text: 'Hors ligne' };
    if (quality === 'poor') return { status: 'poor', color: 'secondary', text: 'Connexion lente' };
    return { status: 'online', color: 'default', text: 'En ligne' };
  };

  const connectionStatus = getConnectionStatus();

  const getSubmitButtonText = () => {
    if (isSubmitting) return 'Sauvegarde...';
    if (!isOnline) return 'Sauvegarder en Offline';
    if (quality === 'poor') return 'Sauvegarder (Mode Offline)';
    return 'Soumettre';
  };

  const getSubmitButtonIcon = () => {
    if (isSubmitting) return <Clock className="w-4 h-4 animate-spin" />;
    if (!isOnline || quality === 'poor') return <Save className="w-4 h-4" />;
    return <Cloud className="w-4 h-4" />;
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit();
      
      // Afficher une notification selon le mode
      if (!isOnline) {
        addNotification({
          type: 'info',
          title: 'Données sauvegardées',
          message: 'Vos données ont été sauvegardées en mode offline et seront synchronisées dès la reconnexion.',
          persistent: false,
        });
      } else if (quality === 'poor') {
        addNotification({
          type: 'warning',
          title: 'Mode offline activé',
          message: 'Connexion lente détectée. Vos données sont sauvegardées en mode offline.',
          persistent: false,
        });
      } else {
        addNotification({
          type: 'success',
          title: 'Données soumises',
          message: 'Vos données ont été soumises avec succès.',
          persistent: false,
        });
      }
    }
  };

  return (
    <Card className={className}>
      {(title || description) && (
        <div className="p-6 pb-0">
          {title && (
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-semibold">{title}</h2>
              {showOfflineIndicator && (
                <Badge variant={connectionStatus.color as any}>
                  {connectionStatus.text}
                </Badge>
              )}
            </div>
          )}
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
      )}
      
      <CardContent className="p-6">
        {/* Indicateur de statut de connexion */}
        {showOfflineIndicator && (
          <div className={`p-4 rounded-lg mb-6 ${
            !isOnline 
              ? 'bg-orange-50 border border-orange-200' 
              : quality === 'poor'
                ? 'bg-yellow-50 border border-yellow-200'
                : 'bg-green-50 border border-green-200'
          }`}>
            <div className="flex items-center gap-2">
              {!isOnline ? (
                <WifiOff className="w-5 h-5 text-orange-600" />
              ) : quality === 'poor' ? (
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              ) : (
                <Wifi className="w-5 h-5 text-green-600" />
              )}
              <div>
                <p className={`font-medium ${
                  !isOnline 
                    ? 'text-orange-800' 
                    : quality === 'poor'
                      ? 'text-yellow-800'
                      : 'text-green-800'
                }`}>
                  {!isOnline 
                    ? 'Mode offline activé'
                    : quality === 'poor'
                      ? 'Connexion lente détectée'
                      : 'Connexion stable'
                  }
                </p>
                <p className={`text-sm ${
                  !isOnline 
                    ? 'text-orange-700' 
                    : quality === 'poor'
                      ? 'text-yellow-700'
                      : 'text-green-700'
                }`}>
                  {!isOnline 
                    ? 'Vos données seront synchronisées dès la reconnexion.'
                    : quality === 'poor'
                      ? 'Les données seront sauvegardées en mode offline pour plus de fiabilité.'
                      : 'Vos données seront synchronisées en temps réel.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Contenu du formulaire */}
        <div className="space-y-6">
          {children}
        </div>

        {/* Bouton de soumission */}
        {onSubmit && (
          <div className="mt-6 pt-6 border-t">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full flex items-center gap-2"
              variant={!isOnline || quality === 'poor' ? 'secondary' : 'default'}
            >
              {getSubmitButtonIcon()}
              {getSubmitButtonText()}
            </Button>
          </div>
        )}

        {/* Statut de synchronisation */}
        {showSyncStatus && (!isOnline || quality === 'poor') && (
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-gray-600" />
              <p className="text-sm text-gray-600">
                Vos données sont sauvegardées localement et seront synchronisées automatiquement.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
