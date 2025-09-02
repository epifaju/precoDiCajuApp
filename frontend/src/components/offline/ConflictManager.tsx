import React, { useState } from 'react';
import { ConflictList } from './ConflictList';
import { ConflictResolver } from './ConflictResolver';
import { ConflictStatistics } from './ConflictStatistics';
import { useConflictManager } from '../../hooks/useConflictManager';
import type { Conflict } from '../../services/conflictManager';

type TabType = 'pending' | 'resolved' | 'statistics';

export function ConflictManager() {
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  const { pendingConflicts, cleanupOldConflicts } = useConflictManager();

  const handleConflictSelect = (conflict: Conflict) => {
    setSelectedConflict(conflict);
  };

  const handleConflictResolved = (conflictId: string) => {
    setSelectedConflict(null);
    // La liste sera automatiquement mise à jour via le hook
  };

  const handleCleanup = async () => {
    if (confirm('Supprimer les conflits résolus de plus de 30 jours ?')) {
      await cleanupOldConflicts(30);
    }
  };

  const tabs = [
    {
      id: 'pending' as TabType,
      label: 'En Attente',
      count: pendingConflicts.length,
      icon: '⚠️'
    },
    {
      id: 'resolved' as TabType,
      label: 'Résolus',
      icon: '✅'
    },
    {
      id: 'statistics' as TabType,
      label: 'Statistiques',
      icon: '📊'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Gestion des Conflits
        </h1>
        <p className="text-gray-600">
          Gérez les conflits de synchronisation entre les données locales et distantes
        </p>
      </div>

      {/* Navigation par onglets */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className="ml-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Actions globales */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {activeTab === 'pending' && pendingConflicts.length > 0 && (
            <div className="text-sm text-gray-600">
              {pendingConflicts.length} conflit{pendingConflicts.length > 1 ? 's' : ''} en attente de résolution
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {activeTab === 'resolved' && (
            <button
              onClick={handleCleanup}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
            >
              Nettoyer l'historique
            </button>
          )}
        </div>
      </div>

      {/* Contenu des onglets */}
      <div className="bg-white rounded-lg border border-gray-200">
        {activeTab === 'pending' && (
          <ConflictList
            onConflictSelect={handleConflictSelect}
            showResolved={false}
          />
        )}
        
        {activeTab === 'resolved' && (
          <ConflictList
            onConflictSelect={handleConflictSelect}
            showResolved={true}
          />
        )}
        
        {activeTab === 'statistics' && (
          <ConflictStatistics />
        )}
      </div>

      {/* Modal de résolution de conflit */}
      {selectedConflict && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Résolution de Conflit
              </h2>
              <button
                onClick={() => setSelectedConflict(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <ConflictResolver
              conflict={selectedConflict}
              onResolved={handleConflictResolved}
              onCancel={() => setSelectedConflict(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
