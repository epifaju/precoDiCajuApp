import React, { useState } from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  RefreshCw, 
  Clock, 
  Zap,
  ZapOff,
  Settings
} from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  variant?: 'compact' | 'detailed' | 'floating';
  showActions?: boolean;
  className?: string;
}

export const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  variant = 'compact',
  showActions = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    isOnline,
    quality,
    lastChecked,
    latency,
    error,
    testConnection,
    forceOffline,
    forceOnline,
    reset,
  } = useConnectionStatus();
  
  const { syncStatus, lastSyncTime, triggerSync } = useServiceWorker();

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (quality === 'good') return <Wifi className="w-4 h-4" />;
    if (quality === 'poor') return <AlertTriangle className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (quality === 'good') return 'default';
    if (quality === 'poor') return 'secondary';
    return 'destructive';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Hors ligne';
    if (quality === 'good') return 'En ligne';
    if (quality === 'poor') return 'Connexion lente';
    return 'Hors ligne';
  };

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case 'syncing': return <RefreshCw className="w-3 h-3 animate-spin" />;
      case 'completed': return <Zap className="w-3 h-3" />;
      case 'failed': return <ZapOff className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const formatLastChecked = () => {
    if (!lastChecked) return 'Jamais';
    const now = new Date();
    const diff = now.getTime() - lastChecked.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `Il y a ${seconds}s`;
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
    return lastChecked.toLocaleTimeString();
  };

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Jamais';
    const now = new Date();
    const diff = now.getTime() - new Date(lastSyncTime).getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `Il y a ${seconds}s`;
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
    return new Date(lastSyncTime).toLocaleTimeString();
  };

  // Variant compact (badge simple)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant={getStatusColor() as any} className="flex items-center gap-1">
          {getStatusIcon()}
          {getStatusText()}
        </Badge>
        {syncStatus === 'syncing' && (
          <Badge variant="secondary" className="flex items-center gap-1">
            {getSyncStatusIcon()}
            Sync
          </Badge>
        )}
      </div>
    );
  }

  // Variant floating (badge flottant)
  if (variant === 'floating') {
    return (
      <div className={`fixed top-4 right-4 z-50 ${className}`}>
        <div className="flex flex-col gap-2">
          <Badge 
            variant={getStatusColor() as any} 
            className="flex items-center gap-1 shadow-lg cursor-pointer"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {getStatusIcon()}
            {getStatusText()}
          </Badge>
          {syncStatus === 'syncing' && (
            <Badge variant="secondary" className="flex items-center gap-1 shadow-lg">
              {getSyncStatusIcon()}
              Synchronisation...
            </Badge>
          )}
        </div>
      </div>
    );
  }

  // Variant detailed (carte complète)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            Statut de Connexion
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getStatusColor() as any}>
              {getStatusText()}
            </Badge>
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          {isOnline 
            ? `Connexion stable - Latence: ${latency ? `${latency}ms` : 'N/A'}`
            : 'Mode offline - Données sauvegardées localement'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-medium text-gray-700">Dernière vérification</p>
            <p className="text-gray-600">{formatLastChecked()}</p>
          </div>
          <div>
            <p className="font-medium text-gray-700">Dernière synchronisation</p>
            <p className="text-gray-600">{formatLastSync()}</p>
          </div>
        </div>

        {/* Statut de synchronisation */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2">
            {getSyncStatusIcon()}
            <span className="font-medium">Synchronisation</span>
          </div>
          <Badge variant={syncStatus === 'syncing' ? 'secondary' : 'outline'}>
            {syncStatus}
          </Badge>
        </div>

        {/* Erreur si présente */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        {/* Actions détaillées */}
        {isExpanded && showActions && (
          <div className="space-y-3 pt-3 border-t">
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={testConnection}
                disabled={syncStatus === 'syncing'}
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Tester Connexion
              </Button>
              
              {isOnline && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={triggerSync}
                  disabled={syncStatus === 'syncing'}
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Forcer Sync
                </Button>
              )}
            </div>

            {/* Actions de test (développement) */}
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={forceOffline}
                className="text-orange-600 hover:text-orange-700"
              >
                <WifiOff className="w-3 h-3 mr-1" />
                Forcer Offline
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={forceOnline}
                className="text-green-600 hover:text-green-700"
              >
                <Wifi className="w-3 h-3 mr-1" />
                Forcer Online
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={reset}
              >
                <Settings className="w-3 h-3 mr-1" />
                Réinitialiser
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
