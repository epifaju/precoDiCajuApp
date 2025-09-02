import React from 'react';
import { useConflictManager } from '../../hooks/useConflictManager';
import { Badge } from '../ui/Badge';

interface ConflictStatisticsProps {
  className?: string;
}

export function ConflictStatistics({ className = '' }: ConflictStatisticsProps) {
  const { statistics, isLoading, error } = useConflictManager();

  if (isLoading) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-800 text-sm">Erreur: {error}</div>
        </div>
      </div>
    );
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data_conflict': return '🔄';
      case 'deletion_conflict': return '🗑️';
      case 'creation_conflict': return '➕';
      default: return '⚠️';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'data_conflict': return 'Conflits de données';
      case 'deletion_conflict': return 'Conflits de suppression';
      case 'creation_conflict': return 'Conflits de création';
      default: return type;
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high': return 'Critiques';
      case 'medium': return 'Moyens';
      case 'low': return 'Faibles';
      default: return severity;
    }
  };

  return (
    <div className={`p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Statistiques des Conflits
      </h3>

      {/* Statistiques générales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-800">{statistics.pending}</div>
          <div className="text-sm text-yellow-600">En attente</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-800">{statistics.resolved}</div>
          <div className="text-sm text-green-600">Résolus</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">
            {statistics.total > 0 ? Math.round((statistics.resolved / statistics.total) * 100) : 0}%
          </div>
          <div className="text-sm text-blue-600">Taux de résolution</div>
        </div>
      </div>

      {/* Répartition par type */}
      {Object.keys(statistics.byType).length > 0 && (
        <div className="mb-6">
          <h4 className="text-md font-medium text-gray-900 mb-3">Par Type</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(statistics.byType).map(([type, count]) => (
              <div key={type} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">{getTypeIcon(type)}</span>
                    <div>
                      <div className="font-medium text-gray-900">{getTypeLabel(type)}</div>
                      <div className="text-sm text-gray-600">{count} conflit{count > 1 ? 's' : ''}</div>
                    </div>
                  </div>
                  <div className="text-lg font-bold text-gray-700">{count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Répartition par sévérité */}
      {Object.keys(statistics.bySeverity).length > 0 && (
        <div>
          <h4 className="text-md font-medium text-gray-900 mb-3">Par Sévérité</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {Object.entries(statistics.bySeverity).map(([severity, count]) => (
              <div key={severity} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Badge className={getSeverityColor(severity)}>
                      {getSeverityLabel(severity)}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-gray-700">{count}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message si aucun conflit */}
      {statistics.total === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">✅</div>
          <h4 className="text-gray-600 font-medium">Aucun conflit détecté</h4>
          <p className="text-gray-500 text-sm mt-1">
            Toutes les données sont synchronisées
          </p>
        </div>
      )}
    </div>
  );
}
