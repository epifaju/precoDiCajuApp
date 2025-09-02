import React, { useState } from 'react';
import { useConflictManager } from '../../hooks/useConflictManager';
import { Badge } from '../ui/Badge';
import type { Conflict, ConflictResolutionStrategy } from '../../services/conflictManager';

export function ConflictTest() {
  const { detectConflicts, resolveConflictsAutomatically, statistics } = useConflictManager();
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Données de test pour simuler des conflits
  const createTestData = () => {
    const now = new Date();
    const localTime = new Date(now.getTime() - 1000); // 1 seconde plus tôt
    const remoteTime = new Date(now.getTime() + 1000); // 1 seconde plus tard

    return {
      localData: {
        id: 'test-price-1',
        price: 1500,
        location: 'Marché Central',
        notes: 'Prix local modifié',
        updatedAt: localTime.toISOString(),
        createdAt: new Date(now.getTime() - 3600000).toISOString()
      },
      remoteData: {
        id: 'test-price-1',
        price: 1600,
        location: 'Marché Central',
        notes: 'Prix serveur modifié',
        updatedAt: remoteTime.toISOString(),
        createdAt: new Date(now.getTime() - 3600000).toISOString()
      }
    };
  };

  const runConflictDetectionTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    try {
      const testData = createTestData();
      const result = await detectConflicts(testData.localData, testData.remoteData, 'update');
      
      setTestResults(prev => [...prev, {
        type: 'detection',
        timestamp: new Date(),
        result,
        testData
      }]);

      // Si des conflits sont détectés, tester la résolution automatique
      if (result.hasConflicts && result.resolutionSuggestions.length > 0) {
        const strategy = result.resolutionSuggestions[0];
        const resolutions = await resolveConflictsAutomatically(result.conflicts, strategy);
        
        setTestResults(prev => [...prev, {
          type: 'resolution',
          timestamp: new Date(),
          strategy,
          resolutions,
          conflicts: result.conflicts
        }]);
      }
    } catch (error) {
      setTestResults(prev => [...prev, {
        type: 'error',
        timestamp: new Date(),
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      }]);
    } finally {
      setIsRunning(false);
    }
  };

  const runMultipleConflictTest = async () => {
    setIsRunning(true);
    setTestResults([]);

    const testScenarios = [
      {
        name: 'Conflit de données',
        localData: {
          id: 'test-1',
          price: 1000,
          location: 'Local',
          updatedAt: new Date(Date.now() - 2000).toISOString()
        },
        remoteData: {
          id: 'test-1',
          price: 1200,
          location: 'Remote',
          updatedAt: new Date(Date.now() - 1000).toISOString()
        },
        action: 'update'
      },
      {
        name: 'Conflit de suppression',
        localData: {
          id: 'test-2',
          price: 800,
          location: 'À supprimer',
          updatedAt: new Date(Date.now() - 3000).toISOString()
        },
        remoteData: {
          id: 'test-2',
          price: 900,
          location: 'Modifié sur serveur',
          updatedAt: new Date(Date.now() - 1000).toISOString()
        },
        action: 'delete'
      },
      {
        name: 'Conflit de création',
        localData: {
          id: 'test-3',
          price: 500,
          location: 'Nouveau local',
          updatedAt: new Date().toISOString()
        },
        remoteData: {
          id: 'test-3',
          price: 600,
          location: 'Existe déjà',
          updatedAt: new Date(Date.now() - 5000).toISOString()
        },
        action: 'create'
      }
    ];

    for (const scenario of testScenarios) {
      try {
        const result = await detectConflicts(scenario.localData, scenario.remoteData, scenario.action);
        
        setTestResults(prev => [...prev, {
          type: 'scenario',
          timestamp: new Date(),
          scenario: scenario.name,
          result,
          testData: scenario
        }]);
      } catch (error) {
        setTestResults(prev => [...prev, {
          type: 'error',
          timestamp: new Date(),
          scenario: scenario.name,
          error: error instanceof Error ? error.message : 'Erreur inconnue'
        }]);
      }
    }

    setIsRunning(false);
  };

  const clearTestResults = () => {
    setTestResults([]);
  };

  const formatTimestamp = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('fr-FR');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Test de Gestion des Conflits
        </h2>
        <p className="text-gray-600">
          Testez la détection et la résolution automatique des conflits
        </p>
      </div>

      {/* Statistiques actuelles */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Statistiques Actuelles</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{statistics.pending}</div>
            <div className="text-sm text-gray-600">En attente</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statistics.resolved}</div>
            <div className="text-sm text-gray-600">Résolus</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.total > 0 ? Math.round((statistics.resolved / statistics.total) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Résolus</div>
          </div>
        </div>
      </div>

      {/* Actions de test */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={runConflictDetectionTest}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
        >
          {isRunning && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          Test Conflit Simple
        </button>
        
        <button
          onClick={runMultipleConflictTest}
          disabled={isRunning}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center"
        >
          {isRunning && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          Test Multiples Conflits
        </button>
        
        <button
          onClick={clearTestResults}
          disabled={isRunning}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Effacer Résultats
        </button>
      </div>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Résultats des Tests</h3>
          
          {testResults.map((result, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={
                    result.type === 'detection' ? 'bg-blue-100 text-blue-800' :
                    result.type === 'resolution' ? 'bg-green-100 text-green-800' :
                    result.type === 'scenario' ? 'bg-purple-100 text-purple-800' :
                    'bg-red-100 text-red-800'
                  }>
                    {result.type === 'detection' ? 'Détection' :
                     result.type === 'resolution' ? 'Résolution' :
                     result.type === 'scenario' ? 'Scénario' : 'Erreur'}
                  </Badge>
                  {result.scenario && (
                    <span className="text-sm font-medium text-gray-700">{result.scenario}</span>
                  )}
                </div>
                <span className="text-sm text-gray-500">{formatTimestamp(result.timestamp)}</span>
              </div>

              {result.type === 'detection' && (
                <div>
                  <div className="mb-2">
                    <strong>Conflits détectés:</strong> {result.result.hasConflicts ? 'Oui' : 'Non'}
                  </div>
                  {result.result.hasConflicts && (
                    <div>
                      <div className="mb-2">
                        <strong>Nombre de conflits:</strong> {result.result.conflicts.length}
                      </div>
                      <div className="mb-2">
                        <strong>Stratégies suggérées:</strong> {result.result.resolutionSuggestions.length}
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.result.conflicts.map((conflict: Conflict, i: number) => (
                          <div key={i} className="ml-4">
                            • {conflict.type} - {conflict.severity}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {result.type === 'resolution' && (
                <div>
                  <div className="mb-2">
                    <strong>Stratégie utilisée:</strong> {result.strategy.name}
                  </div>
                  <div className="mb-2">
                    <strong>Résolutions appliquées:</strong> {result.resolutions.length}
                  </div>
                  <div className="text-sm text-gray-600">
                    {result.resolutions.map((resolution: any, i: number) => (
                      <div key={i} className="ml-4">
                        • {resolution.resolution} - {resolution.details}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.type === 'scenario' && (
                <div>
                  <div className="mb-2">
                    <strong>Conflits détectés:</strong> {result.result.hasConflicts ? 'Oui' : 'Non'}
                  </div>
                  {result.result.hasConflicts && (
                    <div className="text-sm text-gray-600">
                      {result.result.conflicts.map((conflict: Conflict, i: number) => (
                        <div key={i} className="ml-4">
                          • {conflict.type} - {conflict.severity} - {conflict.description}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {result.type === 'error' && (
                <div className="text-red-600">
                  <strong>Erreur:</strong> {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instructions</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Test Conflit Simple:</strong> Crée un conflit de données et teste la résolution automatique</li>
          <li>• <strong>Test Multiples Conflits:</strong> Teste différents types de conflits (données, suppression, création)</li>
          <li>• Les conflits créés sont stockés dans IndexedDB et peuvent être visualisés dans le gestionnaire de conflits</li>
          <li>• Utilisez le composant ConflictManager pour résoudre manuellement les conflits</li>
        </ul>
      </div>
    </div>
  );
}
