import React, { useState, useEffect } from 'react';
import { useSyncQueue } from '../../hooks/useOfflineApi';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Play,
  Pause,
  Trash2,
  Eye,
  EyeOff,
  Filter,
  Download
} from 'lucide-react';

interface SyncQueueManagerProps {
  variant?: 'compact' | 'detailed' | 'full';
  showActions?: boolean;
  className?: string;
}

export const SyncQueueManager: React.FC<SyncQueueManagerProps> = ({
  variant = 'detailed',
  showActions = true,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed' | 'failed'>('all');
  const [showDetails, setShowDetails] = useState(false);
  
  const { queueItems, loading } = useSyncQueue();
  const { syncStatus, triggerSync } = useServiceWorker();
  const { isOnline } = useConnectionStatus();

  // Filtrer les éléments de la queue
  const filteredItems = queueItems.filter(item => {
    if (filter === 'all') return true;
    return item.status === filter;
  });

  // Statistiques
  const stats = {
    total: queueItems.length,
    pending: queueItems.filter(item => item.status === 'pending').length,
    processing: queueItems.filter(item => item.status === 'processing').length,
    completed: queueItems.filter(item => item.status === 'completed').length,
    failed: queueItems.filter(item => item.status === 'failed').length,
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'processing': return <RefreshCw className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary' as const,
      processing: 'default' as const,
      completed: 'default' as const,
      failed: 'destructive' as const,
    };
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      CRITICAL: 'destructive' as const,
      HIGH: 'default' as const,
      NORMAL: 'secondary' as const,
      LOW: 'outline' as const,
    };
    
    return (
      <Badge variant={colors[priority as keyof typeof colors] || 'outline'} className="text-xs">
        {priority}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    
    if (seconds < 60) return `Il y a ${seconds}s`;
    if (seconds < 3600) return `Il y a ${Math.floor(seconds / 60)}min`;
    if (seconds < 86400) return `Il y a ${Math.floor(seconds / 3600)}h`;
    return date.toLocaleDateString();
  };

  const getNextRetryTime = (item: any) => {
    if (!item.nextRetryAt) return null;
    const retryDate = new Date(item.nextRetryAt);
    const now = new Date();
    
    if (retryDate <= now) return 'Maintenant';
    
    const diff = retryDate.getTime() - now.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 60) return `Dans ${minutes}min`;
    const hours = Math.floor(minutes / 60);
    return `Dans ${hours}h`;
  };

  // Variant compact
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Badge variant="outline" className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          {stats.total} en queue
        </Badge>
        {stats.pending > 0 && (
          <Badge variant="secondary">
            {stats.pending} en attente
          </Badge>
        )}
        {stats.failed > 0 && (
          <Badge variant="destructive">
            {stats.failed} échecs
          </Badge>
        )}
      </div>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-lg">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Queue de Synchronisation
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {stats.total} éléments
            </Badge>
            {showActions && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Gestion des opérations en attente de synchronisation
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statistiques */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <p className="text-sm text-gray-600">Total</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-sm text-gray-600">En attente</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            <p className="text-sm text-gray-600">Terminés</p>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
            <p className="text-sm text-gray-600">Échecs</p>
          </div>
        </div>

        {/* Actions principales */}
        {showActions && (
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={triggerSync}
              disabled={!isOnline || syncStatus === 'syncing' || stats.pending === 0}
              className="flex items-center gap-2"
            >
              {syncStatus === 'syncing' ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4" />
              )}
              {syncStatus === 'syncing' ? 'Synchronisation...' : 'Déclencher Sync'}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center gap-2"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              {showDetails ? 'Masquer détails' : 'Afficher détails'}
            </Button>
          </div>
        )}

        {/* Filtres */}
        {isExpanded && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              Tous ({stats.total})
            </Button>
            <Button
              variant={filter === 'pending' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('pending')}
            >
              En attente ({stats.pending})
            </Button>
            <Button
              variant={filter === 'processing' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('processing')}
            >
              En cours ({stats.processing})
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              Terminés ({stats.completed})
            </Button>
            <Button
              variant={filter === 'failed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('failed')}
            >
              Échecs ({stats.failed})
            </Button>
          </div>
        )}

        {/* Liste des éléments */}
        {isExpanded && (
          <div className="space-y-2">
            {loading ? (
              <div className="text-center py-4">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2" />
                <p className="text-gray-600">Chargement de la queue...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-gray-600">
                  {filter === 'all' ? 'Aucun élément en queue' : `Aucun élément ${filter}`}
                </p>
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(item.status)}
                        <div>
                          <p className="font-medium">{item.action}</p>
                          <p className="text-sm text-gray-600">
                            Créé {formatDate(item.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getPriorityBadge(item.priority)}
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                    
                    {showDetails && (
                      <div className="mt-3 pt-3 border-t text-sm text-gray-600 space-y-1">
                        <p><strong>ID:</strong> {item.id}</p>
                        <p><strong>Tentatives:</strong> {item.attempts}/{item.maxAttempts}</p>
                        {item.lastAttemptAt && (
                          <p><strong>Dernière tentative:</strong> {formatDate(item.lastAttemptAt)}</p>
                        )}
                        {item.nextRetryAt && (
                          <p><strong>Prochaine tentative:</strong> {getNextRetryTime(item)}</p>
                        )}
                        {item.metadata && (
                          <p><strong>Source:</strong> {item.metadata.source}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statut de connexion */}
        {!isOnline && (
          <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-orange-600" />
              <span className="text-sm text-orange-800">
                Mode offline - La synchronisation reprendra dès la reconnexion
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
