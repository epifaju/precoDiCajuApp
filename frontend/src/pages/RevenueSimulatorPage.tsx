import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { RevenueSimulatorForm } from '../components/simulation/RevenueSimulatorForm';
import { RevenueResult } from '../components/simulation/RevenueResult';
import { SimulationHistory } from '../components/simulation/SimulationHistory';
import { RevenueChart } from '../components/simulation/RevenueChart';
import { Simulation, SimulationInput, SimulationResult, SimulationFormData } from '../types/simulation';
import { calculateSimulationResults, simulationInputToFormData } from '../utils/simulationUtils';
import { simulationStorageService } from '../services/simulationStorageService';
import { simulationApiService } from '../services/simulationApiService';
import { useAuthStore } from '../store/authStore';

const RevenueSimulatorPage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isAuthenticated } = useAuthStore();
  
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [currentInputs, setCurrentInputs] = useState<SimulationInput | null>(null);
  const [currentResults, setCurrentResults] = useState<SimulationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const chartRef = useRef<HTMLDivElement>(null);

  // Initialize IndexedDB and load simulations
  useEffect(() => {
    const initializeSimulations = async () => {
      try {
        await simulationStorageService.init();
        const localSimulations = await simulationStorageService.getAllSimulations();
        setSimulations(localSimulations);
      } catch (error) {
        console.error('Failed to initialize simulations:', error);
      }
    };

    initializeSimulations();
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Handle simulation input changes
  const handleSimulationChange = (inputs: SimulationInput) => {
    setCurrentInputs(inputs);
    const results = calculateSimulationResults(inputs);
    setCurrentResults(results);
  };

  // Handle saving simulation
  const handleSaveSimulation = async (inputs: SimulationInput) => {
    setIsLoading(true);
    
    try {
      const results = calculateSimulationResults(inputs);
      const simulation: Simulation = {
        id: crypto.randomUUID(),
        userId: user?.id,
        inputs,
        results,
        createdAt: new Date().toISOString(),
        isOffline: !isOnline,
      };

      // Save to IndexedDB first
      await simulationStorageService.saveSimulation(simulation);

      // Try to sync with backend if online and authenticated
      if (isOnline && isAuthenticated) {
        try {
          const apiRequest = simulationApiService.simulationToApiRequest(simulation);
          const apiResponse = await simulationApiService.createSimulation(apiRequest);
          const syncedSimulation = simulationApiService.apiResponseToSimulation(apiResponse);
          
          // Update local simulation with server data
          await simulationStorageService.saveSimulation(syncedSimulation);
          await simulationStorageService.updateSimulationStatus(simulation.id, 'synced');
        } catch (apiError) {
          console.error('Failed to sync with backend:', apiError);
          await simulationStorageService.updateSimulationStatus(simulation.id, 'error', 'Sync failed');
        }
      }

      // Refresh simulations list
      const updatedSimulations = await simulationStorageService.getAllSimulations();
      setSimulations(updatedSimulations);

    } catch (error) {
      console.error('Failed to save simulation:', error);
      alert(t('simulation.saveError', 'Erro ao salvar simulação'));
    } finally {
      setIsLoading(false);
    }
  };

  // Handle simulation selection from history
  const handleSimulationSelect = (simulation: Simulation) => {
    const formData = simulationInputToFormData(simulation.inputs);
    setCurrentInputs(simulation.inputs);
    setCurrentResults(simulation.results);
    
    // Scroll to form
    const formElement = document.getElementById('simulation-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle simulation deletion
  const handleSimulationDelete = async (simulationId: string) => {
    if (simulationId === 'all') {
      // Clear all simulations
      setSimulations([]);
    } else {
      // Remove from local list
      setSimulations(prev => prev.filter(s => s.id !== simulationId));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header - Mobile Optimized */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                {t('simulation.page.title', 'Simulador de Receitas')}
              </h1>
              {/* Online/Offline Status - Mobile */}
              <div className="flex items-center space-x-2">
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {isOnline ? t('simulation.page.online', 'Online') : t('simulation.page.offline', 'Offline')}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {t('simulation.page.description', 'Calcule seus receitas potenciais com base nos preços atuais do mercado')}
            </p>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {t('simulation.page.title', 'Simulador de Receitas')}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {t('simulation.page.description', 'Calcule seus receitas potenciais com base nos preços atuais do mercado')}
              </p>
            </div>
            
            {/* Online/Offline Status - Desktop */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isOnline 
                  ? t('simulation.page.online', 'Online') 
                  : t('simulation.page.offline', 'Offline - usando dados locais')
                }
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Mobile Optimized */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Mobile Layout - Stacked */}
        <div className="block lg:hidden space-y-4 sm:space-y-6">
          {/* Simulation Form */}
          <div id="simulation-form">
            <RevenueSimulatorForm
              onSimulationChange={handleSimulationChange}
              onSaveSimulation={handleSaveSimulation}
              isLoading={isLoading}
            />
          </div>

          {/* Results */}
          {currentResults && (
            <RevenueResult
              results={currentResults}
              inputs={currentInputs || undefined}
              isLoading={isLoading}
              chartRef={chartRef}
            />
          )}

          {/* Chart */}
          {currentResults && (
            <RevenueChart
              ref={chartRef}
              results={currentResults}
            />
          )}

          {/* History - Mobile */}
          <SimulationHistory
            simulations={simulations}
            onSimulationSelect={handleSimulationSelect}
            onSimulationDelete={handleSimulationDelete}
            isLoading={isLoading}
          />
        </div>

        {/* Desktop Layout - Side by Side */}
        <div className="hidden lg:grid grid-cols-2 gap-8">
          {/* Left Column - Form and Results */}
          <div className="space-y-6">
            {/* Simulation Form */}
            <div id="simulation-form">
              <RevenueSimulatorForm
                onSimulationChange={handleSimulationChange}
                onSaveSimulation={handleSaveSimulation}
                isLoading={isLoading}
              />
            </div>

            {/* Results */}
            {currentResults && (
              <RevenueResult
                results={currentResults}
                inputs={currentInputs || undefined}
                isLoading={isLoading}
                chartRef={chartRef}
              />
            )}

            {/* Chart */}
            {currentResults && (
              <RevenueChart
                ref={chartRef}
                results={currentResults}
              />
            )}
          </div>

          {/* Right Column - History */}
          <div>
            <SimulationHistory
              simulations={simulations}
              onSimulationSelect={handleSimulationSelect}
              onSimulationDelete={handleSimulationDelete}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Offline Banner - Mobile Optimized */}
        {!isOnline && (
          <div className="mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <div className="flex items-start sm:items-center">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400 mr-2 sm:mr-3 mt-0.5 sm:mt-0 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="min-w-0 flex-1">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  {t('simulation.page.offlineMode', 'Modo Offline')}
                </h3>
                <p className="text-xs sm:text-sm text-yellow-700 dark:text-yellow-300 mt-1 leading-relaxed">
                  {t('simulation.page.offlineMessage', 'Você está offline. As simulações serão salvas localmente e sincronizadas quando a conexão for restaurada.')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueSimulatorPage;
