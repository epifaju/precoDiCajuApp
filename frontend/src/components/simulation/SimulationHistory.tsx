import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Simulation } from '../../types/simulation';
import { formatCurrency, getNetRevenueColorClass, formatNumber } from '../../utils/simulationUtils';
import { simulationStorageService } from '../../services/simulationStorageService';

interface SimulationHistoryProps {
  simulations: Simulation[];
  onSimulationSelect?: (simulation: Simulation) => void;
  onSimulationDelete?: (simulationId: string) => void;
  isLoading?: boolean;
}

export const SimulationHistory: React.FC<SimulationHistoryProps> = ({
  simulations,
  onSimulationSelect,
  onSimulationDelete,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const [storageStats, setStorageStats] = useState<{
    totalSimulations: number;
    pendingSync: number;
    synced: number;
    errors: number;
    totalSize: number;
  } | null>(null);

  useEffect(() => {
    const loadStorageStats = async () => {
      try {
        const stats = await simulationStorageService.getStorageStats();
        setStorageStats(stats);
      } catch (error) {
        console.error('Failed to load storage stats:', error);
      }
    };

    loadStorageStats();
  }, [simulations]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleDeleteSimulation = async (simulationId: string) => {
    if (window.confirm(t('simulation.history.deleteConfirm', 'Tem certeza que deseja excluir esta simulação?'))) {
      try {
        await simulationStorageService.deleteSimulation(simulationId);
        onSimulationDelete?.(simulationId);
      } catch (error) {
        console.error('Failed to delete simulation:', error);
        alert(t('simulation.history.deleteError', 'Erro ao excluir simulação'));
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm(t('simulation.history.clearAllConfirm', 'Tem certeza que deseja excluir todas as simulações?'))) {
      try {
        await simulationStorageService.clearAllSimulations();
        onSimulationDelete?.('all');
      } catch (error) {
        console.error('Failed to clear simulations:', error);
        alert(t('simulation.history.clearAllError', 'Erro ao limpar simulações'));
      }
    }
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {t('simulation.history.title', 'Histórico de Simulações')}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {t('simulation.history.description', 'Suas simulações salvas localmente')}
          </p>
        </div>
        
        {simulations.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 self-start sm:self-auto"
          >
            {t('simulation.history.clearAll', 'Limpar Tudo')}
          </Button>
        )}
      </div>

      {/* Storage Stats */}
      {storageStats && (
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            {t('simulation.history.storageStats', 'Estatísticas de Armazenamento')}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs">
            <div>
              <p className="text-blue-600 dark:text-blue-400">
                {t('simulation.history.total', 'Total')}
              </p>
              <p className="font-semibold text-blue-900 dark:text-blue-100">
                {storageStats.totalSimulations}
              </p>
            </div>
            <div>
              <p className="text-green-600 dark:text-green-400">
                {t('simulation.history.synced', 'Sincronizadas')}
              </p>
              <p className="font-semibold text-green-900 dark:text-green-100">
                {storageStats.synced}
              </p>
            </div>
            <div>
              <p className="text-yellow-600 dark:text-yellow-400">
                {t('simulation.history.pending', 'Pendentes')}
              </p>
              <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                {storageStats.pendingSync}
              </p>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400">
                {t('simulation.history.size', 'Tamanho')}
              </p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {formatNumber(storageStats.totalSize / 1024, 1)} KB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Simulations List */}
      {simulations.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('simulation.history.empty', 'Nenhuma simulação encontrada')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('simulation.history.emptyDescription', 'Crie sua primeira simulação usando o formulário acima')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {simulations.map((simulation) => (
            <div
              key={simulation.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="space-y-3">
                {/* Header avec quantité et revenu net */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="mb-2 sm:mb-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatNumber(simulation.inputs.quantity, 1)} kg × {formatCurrency(simulation.inputs.pricePerKg)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDate(simulation.createdAt)}
                    </p>
                  </div>
                  
                  <div className="text-left sm:text-right">
                    <p className={`text-base sm:text-lg font-bold ${getNetRevenueColorClass(simulation.results.netRevenue)}`}>
                      {formatCurrency(simulation.results.netRevenue)}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {t('simulation.history.netRevenue', 'Receita Líquida')}
                    </p>
                  </div>
                </div>
                
                {/* Détails financiers */}
                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs text-gray-500 dark:text-gray-400">
                  <span>
                    {t('simulation.history.grossRevenue', 'Bruta')}: {formatCurrency(simulation.results.grossRevenue)}
                  </span>
                  <span>
                    {t('simulation.history.expenses', 'Despesas')}: {formatCurrency(simulation.results.totalExpenses)}
                  </span>
                </div>
                
                {/* Status et actions */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                  {/* Status indicator */}
                  <div className="flex items-center space-x-1">
                    {simulation.isOffline ? (
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" title={t('simulation.history.offline', 'Offline')}></div>
                    ) : (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title={t('simulation.history.online', 'Online')}></div>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {simulation.isOffline ? t('simulation.history.offline', 'Offline') : t('simulation.history.online', 'Online')}
                    </span>
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex items-center justify-end space-x-2">
                    {onSimulationSelect && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSimulationSelect(simulation)}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20"
                      >
                        {t('simulation.history.select', 'Usar')}
                      </Button>
                    )}
                    
                    {onSimulationDelete && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSimulation(simulation.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

