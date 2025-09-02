import React, { useState } from 'react';
import { ConflictManager } from './ConflictManager';
import { ConflictTest } from './ConflictTest';
import { useConflictManager } from '../../hooks/useConflictManager';
import { Badge } from '../ui/Badge';

type TestView = 'manager' | 'test' | 'overview';

export function Phase5IntegrationTest() {
  const [activeView, setActiveView] = useState<TestView>('overview');
  const { statistics, isLoading } = useConflictManager();

  const views = [
    {
      id: 'overview' as TestView,
      label: 'Vue d\'ensemble',
      icon: '📊',
      description: 'Statistiques et état général'
    },
    {
      id: 'manager' as TestView,
      label: 'Gestionnaire',
      icon: '⚙️',
      description: 'Interface de gestion des conflits'
    },
    {
      id: 'test' as TestView,
      label: 'Tests',
      icon: '🧪',
      description: 'Tests de validation'
    }
  ];

  const renderOverview = () => (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Phase 5 : Gestion des Conflits et Résolution
        </h2>
        <p className="text-gray-600">
          Système complet de détection, analyse et résolution des conflits de synchronisation
        </p>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{statistics.total}</div>
          <div className="text-sm text-gray-600">Total Conflits</div>
        </div>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-800">{statistics.pending}</div>
          <div className="text-sm text-yellow-600">En Attente</div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-green-800">{statistics.resolved}</div>
          <div className="text-sm text-green-600">Résolus</div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-800">
            {statistics.total > 0 ? Math.round((statistics.resolved / statistics.total) * 100) : 0}%
          </div>
          <div className="text-sm text-blue-600">Taux Résolution</div>
        </div>
      </div>

      {/* Fonctionnalités implémentées */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Fonctionnalités Implémentées</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">🔍</span>
              Détection Automatique
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Conflits de données</li>
              <li>• Conflits de suppression</li>
              <li>• Conflits de création</li>
              <li>• Analyse de sévérité</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">⚡</span>
              Résolution Automatique
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Dernière modification</li>
              <li>• Priorité locale/serveur</li>
              <li>• Stratégies configurables</li>
              <li>• Application en arrière-plan</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">👤</span>
              Résolution Manuelle
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Interface intuitive</li>
              <li>• Comparaison des données</li>
              <li>• Commentaires personnalisés</li>
              <li>• Historique des décisions</li>
            </ul>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2 flex items-center">
              <span className="mr-2">📈</span>
              Analytics & Monitoring
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Statistiques détaillées</li>
              <li>• Répartition par type</li>
              <li>• Analyse de sévérité</li>
              <li>• Taux de résolution</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Types de conflits gérés */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Types de Conflits Gérés</h3>
        <div className="space-y-3">
          <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <span className="text-2xl mr-3">🔄</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Conflits de Données</div>
              <div className="text-sm text-gray-600">
                Données modifiées localement et sur le serveur simultanément
              </div>
            </div>
            <Badge className="bg-yellow-100 text-yellow-800">
              {statistics.byType.data_conflict || 0}
            </Badge>
          </div>

          <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <span className="text-2xl mr-3">🗑️</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Conflits de Suppression</div>
              <div className="text-sm text-gray-600">
                Tentative de suppression d'un élément modifié sur le serveur
              </div>
            </div>
            <Badge className="bg-red-100 text-red-800">
              {statistics.byType.deletion_conflict || 0}
            </Badge>
          </div>

          <div className="flex items-center p-3 bg-white border border-gray-200 rounded-lg">
            <span className="text-2xl mr-3">➕</span>
            <div className="flex-1">
              <div className="font-medium text-gray-900">Conflits de Création</div>
              <div className="text-sm text-gray-600">
                Tentative de création d'un élément existant sur le serveur
              </div>
            </div>
            <Badge className="bg-green-100 text-green-800">
              {statistics.byType.creation_conflict || 0}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stratégies de résolution */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stratégies de Résolution</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { id: 'last_modified', name: 'Dernière modification', icon: '⏰', auto: true },
            { id: 'user_preference', name: 'Préférence utilisateur', icon: '👤', auto: false },
            { id: 'local_priority', name: 'Priorité locale', icon: '📱', auto: true },
            { id: 'remote_priority', name: 'Priorité serveur', icon: '☁️', auto: true },
            { id: 'merge_data', name: 'Fusion des données', icon: '🔀', auto: false }
          ].map((strategy) => (
            <div key={strategy.id} className="bg-white border border-gray-200 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-lg mr-2">{strategy.icon}</span>
                  <div className="font-medium text-gray-900">{strategy.name}</div>
                </div>
                <Badge className={strategy.auto ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {strategy.auto ? 'Auto' : 'Manuel'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview();
      case 'manager':
        return <ConflictManager />;
      case 'test':
        return <ConflictTest />;
      default:
        return renderOverview();
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeView === view.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{view.icon}</span>
              {view.label}
              <span className="ml-2 text-xs text-gray-400">({view.description})</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Contenu */}
      <div className="bg-white rounded-lg border border-gray-200">
        {isLoading ? (
          <div className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Instructions d'utilisation</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Vue d'ensemble :</strong> Consultez les statistiques et l'état général du système</li>
          <li>• <strong>Gestionnaire :</strong> Gérez les conflits en attente et consultez l'historique</li>
          <li>• <strong>Tests :</strong> Validez le fonctionnement avec des scénarios de test</li>
          <li>• Les conflits sont automatiquement détectés lors de la synchronisation</li>
          <li>• Utilisez les stratégies automatiques pour les conflits simples</li>
          <li>• Résolvez manuellement les conflits complexes ou critiques</li>
        </ul>
      </div>
    </div>
  );
}
