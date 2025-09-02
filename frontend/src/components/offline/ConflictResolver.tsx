import React, { useState } from 'react';
import { useConflictManager } from '../../hooks/useConflictManager';
import { Badge } from '../ui/Badge';
import type { Conflict, ConflictResolutionStrategy } from '../../services/conflictManager';

interface ConflictResolverProps {
  conflict: Conflict;
  onResolved?: (conflictId: string) => void;
  onCancel?: () => void;
}

export function ConflictResolver({ conflict, onResolved, onCancel }: ConflictResolverProps) {
  const { resolveConflictManually, resolveConflictsAutomatically } = useConflictManager();
  const [selectedResolution, setSelectedResolution] = useState<'local' | 'remote' | 'merge' | 'skip'>('local');
  const [customDetails, setCustomDetails] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleManualResolution = async () => {
    setIsResolving(true);
    setError(null);

    try {
      await resolveConflictManually(conflict.id, selectedResolution, customDetails);
      onResolved?.(conflict.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la résolution');
    } finally {
      setIsResolving(false);
    }
  };

  const handleAutomaticResolution = async (strategy: ConflictResolutionStrategy) => {
    setIsResolving(true);
    setError(null);

    try {
      await resolveConflictsAutomatically([conflict], strategy);
      onResolved?.(conflict.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la résolution automatique');
    } finally {
      setIsResolving(false);
    }
  };

  const renderDataComparison = () => {
    if (!conflict.localData || !conflict.remoteData) return null;

    const localData = conflict.localData;
    const remoteData = conflict.remoteData;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Version locale */}
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <h4 className="font-medium text-blue-900 mb-3 flex items-center">
            <span className="mr-2">📱</span>
            Version Locale
          </h4>
          <div className="space-y-2 text-sm">
            {localData.price && (
              <div>
                <span className="font-medium">Prix:</span> {localData.price} FCFA
              </div>
            )}
            {localData.location && (
              <div>
                <span className="font-medium">Lieu:</span> {localData.location}
              </div>
            )}
            {localData.notes && (
              <div>
                <span className="font-medium">Notes:</span> {localData.notes}
              </div>
            )}
            {localData.updatedAt && (
              <div>
                <span className="font-medium">Modifié:</span> {formatDate(localData.updatedAt)}
              </div>
            )}
          </div>
        </div>

        {/* Version serveur */}
        <div className="border border-green-200 rounded-lg p-4 bg-green-50">
          <h4 className="font-medium text-green-900 mb-3 flex items-center">
            <span className="mr-2">☁️</span>
            Version Serveur
          </h4>
          <div className="space-y-2 text-sm">
            {remoteData.price && (
              <div>
                <span className="font-medium">Prix:</span> {remoteData.price} FCFA
              </div>
            )}
            {remoteData.location && (
              <div>
                <span className="font-medium">Lieu:</span> {remoteData.location}
              </div>
            )}
            {remoteData.notes && (
              <div>
                <span className="font-medium">Notes:</span> {remoteData.notes}
              </div>
            )}
            {remoteData.updatedAt && (
              <div>
                <span className="font-medium">Modifié:</span> {formatDate(remoteData.updatedAt)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const automaticStrategies: ConflictResolutionStrategy[] = [
    {
      id: 'last_modified',
      name: 'Dernière modification',
      description: 'Utiliser la version la plus récente',
      automatic: true,
      priority: 1
    },
    {
      id: 'local_priority',
      name: 'Priorité locale',
      description: 'Toujours utiliser la version locale',
      automatic: true,
      priority: 2
    },
    {
      id: 'remote_priority',
      name: 'Priorité serveur',
      description: 'Toujours utiliser la version serveur',
      automatic: true,
      priority: 3
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête du conflit */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl">{getTypeIcon(conflict.type)}</span>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Résolution de Conflit
            </h2>
            <p className="text-gray-600">{conflict.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge className={getSeverityColor(conflict.severity)}>
            {conflict.severity}
          </Badge>
          <Badge className="bg-gray-100 text-gray-700 border-gray-200">
            {conflict.type.replace('_', ' ')}
          </Badge>
          <span className="text-sm text-gray-500">
            Détecté le {formatDate(conflict.detectedAt)}
          </span>
        </div>
      </div>

      {/* Comparaison des données */}
      {renderDataComparison()}

      {/* Stratégies de résolution automatique */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Résolution Automatique
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {automaticStrategies.map((strategy) => (
            <button
              key={strategy.id}
              onClick={() => handleAutomaticResolution(strategy)}
              disabled={isResolving}
              className="p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left disabled:opacity-50"
            >
              <div className="font-medium text-gray-900">{strategy.name}</div>
              <div className="text-sm text-gray-600 mt-1">{strategy.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Résolution manuelle */}
      <div className="mt-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Résolution Manuelle
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Choisir la version à conserver
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                <input
                  type="radio"
                  value="local"
                  checked={selectedResolution === 'local'}
                  onChange={(e) => setSelectedResolution(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Version Locale</div>
                  <div className="text-sm text-gray-600">Conserver les modifications locales</div>
                </div>
              </label>
              
              <label className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:border-blue-300">
                <input
                  type="radio"
                  value="remote"
                  checked={selectedResolution === 'remote'}
                  onChange={(e) => setSelectedResolution(e.target.value as any)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium">Version Serveur</div>
                  <div className="text-sm text-gray-600">Utiliser la version du serveur</div>
                </div>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaire (optionnel)
            </label>
            <textarea
              value={customDetails}
              onChange={(e) => setCustomDetails(e.target.value)}
              placeholder="Ajouter un commentaire sur cette résolution..."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onCancel}
          disabled={isResolving}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          Annuler
        </button>
        
        <button
          onClick={handleManualResolution}
          disabled={isResolving}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
        >
          {isResolving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          Résoudre le Conflit
        </button>
      </div>
    </div>
  );
}
