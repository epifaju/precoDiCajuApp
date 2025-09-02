import React, { useState } from 'react';
import { useConflictManager } from '../../hooks/useConflictManager';
import { Badge } from '../ui/Badge';
import type { Conflict, ConflictResolutionStrategy } from '../../services/conflictManager';

interface ConflictListProps {
  onConflictSelect?: (conflict: Conflict) => void;
  showResolved?: boolean;
}

export function ConflictList({ onConflictSelect, showResolved = false }: ConflictListProps) {
  const {
    pendingConflicts,
    resolutionHistory,
    statistics,
    isLoading,
    error,
    refreshConflicts
  } = useConflictManager();

  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

  const conflictsToShow = showResolved 
    ? resolutionHistory.map(r => ({
        ...r,
        id: r.conflictId,
        status: 'resolved' as const,
        type: 'resolved' as any,
        severity: 'low' as any,
        description: r.details || 'Conflit résolu',
        detectedAt: r.resolvedAt,
        action: 'resolved' as any
      }))
    : pendingConflicts;

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'data_conflict': return '🔄';
      case 'deletion_conflict': return '🗑️';
      case 'creation_conflict': return '➕';
      case 'resolved': return '✅';
      default: return '⚠️';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleConflictClick = (conflict: Conflict) => {
    setSelectedConflict(conflict);
    onConflictSelect?.(conflict);
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-400 mr-3">⚠️</div>
            <div>
              <h3 className="text-red-800 font-medium">Erreur de chargement</h3>
              <p className="text-red-600 text-sm mt-1">{error}</p>
            </div>
          </div>
          <button
            onClick={refreshConflicts}
            className="mt-3 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* En-tête avec statistiques */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {showResolved ? 'Historique des Conflits' : 'Conflits en Attente'}
          </h2>
          <p className="text-sm text-gray-600">
            {showResolved 
              ? `${statistics.resolved} conflits résolus`
              : `${statistics.pending} conflits en attente`
            }
          </p>
        </div>
        <button
          onClick={refreshConflicts}
          className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Statistiques rapides */}
      {!showResolved && statistics.pending > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="text-red-600 text-sm font-medium">Critiques</div>
            <div className="text-red-800 text-lg font-bold">
              {statistics.bySeverity.high || 0}
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-yellow-600 text-sm font-medium">Moyens</div>
            <div className="text-yellow-800 text-lg font-bold">
              {statistics.bySeverity.medium || 0}
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-green-600 text-sm font-medium">Faibles</div>
            <div className="text-green-800 text-lg font-bold">
              {statistics.bySeverity.low || 0}
            </div>
          </div>
        </div>
      )}

      {/* Liste des conflits */}
      {conflictsToShow.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 text-4xl mb-2">✅</div>
          <h3 className="text-gray-600 font-medium">
            {showResolved ? 'Aucun conflit résolu' : 'Aucun conflit en attente'}
          </h3>
          <p className="text-gray-500 text-sm mt-1">
            {showResolved 
              ? 'L\'historique des résolutions apparaîtra ici'
              : 'Tous les conflits ont été résolus'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {conflictsToShow.map((conflict) => (
            <div
              key={conflict.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedConflict?.id === conflict.id 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 bg-white'
              }`}
              onClick={() => handleConflictClick(conflict)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getTypeIcon(conflict.type)}</span>
                    <Badge className={getSeverityColor(conflict.severity)}>
                      {conflict.severity}
                    </Badge>
                    <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                      {conflict.type.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <h3 className="font-medium text-gray-900 mb-1">
                    {conflict.description}
                  </h3>
                  
                  <div className="text-sm text-gray-600">
                    <div>Action: {conflict.action}</div>
                    <div>Détecté: {formatDate(conflict.detectedAt)}</div>
                    {conflict.status === 'resolved' && 'resolvedAt' in conflict && (
                      <div>Résolu: {formatDate(conflict.resolvedAt!)}</div>
                    )}
                  </div>
                </div>
                
                <div className="ml-4">
                  {conflict.status === 'pending' ? (
                    <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div>
                  ) : (
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
