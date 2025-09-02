import React, { useState } from 'react';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { useSyncQueue } from '../../hooks/useOfflineApi';
import { useOfflineNotifications } from '../../hooks/useOfflineNotifications';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Bell, 
  BellRing, 
  Settings,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface OfflineStatusBarProps {
  variant?: 'minimal' | 'compact' | 'full';
  position?: 'top' | 'bottom';
  className?: string;
}

export const OfflineStatusBar: React.FC<OfflineStatusBarProps> = ({
  variant = 'compact',
  position = 'top',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { isOnline, quality, testConnection } = useConnectionStatus();
  const { syncStatus, triggerSync } = useServiceWorker();
  const { queueItems } = useSyncQueue();
  const { unreadCount } = useOfflineNotifications();

  const getConnectionIcon = () => {
    if (!isOnline) return <WifiOff className="w-4 h-4" />;
    if (quality === 'good') return <Wifi className="w-4 h-4" />;
    return <WifiOff className="w-4 h-4" />;
  };

  const getConnectionColor = () => {
    if (!isOnline) return 'text-red-600';
    if (quality === 'good') return 'text-green-600';
    return 'text-yellow-600';
  };

  const getSyncIcon = () => {
    if (syncStatus === 'syncing') return <RefreshCw className="w-4 h-4 animate-spin" />;
    return <RefreshCw className="w-4 h-4" />;
  };

  const getSyncColor = () => {
    if (syncStatus === 'syncing') return 'text-blue-600';
    if (syncStatus === 'completed') return 'text-green-600';
    if (syncStatus === 'failed') return 'text-red-600';
    return 'text-gray-600';
  };

  const pendingCount = queueItems.filter(item => item.status === 'pending').length;
  const failedCount = queueItems.filter(item => item.status === 'failed').length;

  // Variant minimal (juste les icônes)
  if (variant === 'minimal') {
    return (
      <div className={`fixed ${position === 'top' ? 'top-4' : 'bottom-4'} right-4 z-50 flex items-center gap-2 ${className}`}>
        <div className={`p-2 rounded-full bg-white shadow-lg border ${getConnectionColor()}`}>
          {getConnectionIcon()}
        </div>
        {pendingCount > 0 && (
          <div className="p-2 rounded-full bg-white shadow-lg border text-orange-600">
            <RefreshCw className="w-4 h-4" />
          </div>
        )}
        {unreadCount > 0 && (
          <div className="p-2 rounded-full bg-white shadow-lg border text-blue-600">
            <BellRing className="w-4 h-4" />
          </div>
        )}
      </div>
    );
  }

  // Variant compact (barre avec informations de base)
  if (variant === 'compact') {
    return (
      <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm ${className}`}>
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={getConnectionColor()}>
                {getConnectionIcon()}
              </div>
              <span className="text-sm font-medium">
                {!isOnline ? 'Hors ligne' : quality === 'good' ? 'En ligne' : 'Connexion lente'}
              </span>
            </div>
            
            {pendingCount > 0 && (
              <div className="flex items-center gap-2">
                <div className={getSyncColor()}>
                  {getSyncIcon()}
                </div>
                <span className="text-sm">
                  {pendingCount} en attente
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <BellRing className="w-3 h-3" />
                {unreadCount}
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span>Queue: {queueItems.length} éléments</span>
                {failedCount > 0 && (
                  <span className="text-red-600">{failedCount} échecs</span>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={testConnection}
                >
                  Tester
                </Button>
                {isOnline && pendingCount > 0 && (
                  <Button
                    size="sm"
                    onClick={triggerSync}
                    disabled={syncStatus === 'syncing'}
                  >
                    {syncStatus === 'syncing' ? 'Sync...' : 'Sync'}
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant full (barre complète avec toutes les informations)
  return (
    <div className={`fixed ${position === 'top' ? 'top-0' : 'bottom-0'} left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm ${className}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          {/* Statut de connexion */}
          <div className="flex items-center gap-2">
            <div className={getConnectionColor()}>
              {getConnectionIcon()}
            </div>
            <div>
              <p className="text-sm font-medium">
                {!isOnline ? 'Hors ligne' : quality === 'good' ? 'En ligne' : 'Connexion lente'}
              </p>
              <p className="text-xs text-gray-500">
                {!isOnline ? 'Mode offline' : quality === 'good' ? 'Connexion stable' : 'Connexion lente'}
              </p>
            </div>
          </div>
          
          {/* Statut de synchronisation */}
          <div className="flex items-center gap-2">
            <div className={getSyncColor()}>
              {getSyncIcon()}
            </div>
            <div>
              <p className="text-sm font-medium">
                {syncStatus === 'syncing' ? 'Synchronisation...' : 'Synchronisation'}
              </p>
              <p className="text-xs text-gray-500">
                {pendingCount > 0 ? `${pendingCount} en attente` : 'À jour'}
              </p>
            </div>
          </div>
          
          {/* Notifications */}
          {unreadCount > 0 && (
            <div className="flex items-center gap-2">
              <BellRing className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Notifications</p>
                <p className="text-xs text-gray-500">{unreadCount} non lue(s)</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={testConnection}
          >
            Tester
          </Button>
          
          {isOnline && pendingCount > 0 && (
            <Button
              size="sm"
              onClick={triggerSync}
              disabled={syncStatus === 'syncing'}
            >
              {syncStatus === 'syncing' ? 'Sync...' : 'Sync'}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {isExpanded && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium text-gray-700">Queue de synchronisation</p>
              <p className="text-gray-600">
                {queueItems.length} éléments total
                {pendingCount > 0 && `, ${pendingCount} en attente`}
                {failedCount > 0 && `, ${failedCount} échecs`}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Statut de connexion</p>
              <p className="text-gray-600">
                {!isOnline ? 'Hors ligne' : quality === 'good' ? 'Connexion stable' : 'Connexion lente'}
              </p>
            </div>
            <div>
              <p className="font-medium text-gray-700">Notifications</p>
              <p className="text-gray-600">
                {unreadCount > 0 ? `${unreadCount} notification(s) non lue(s)` : 'Aucune notification'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
