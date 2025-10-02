import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { SimulationResult } from '../../types/simulation';
import { 
  formatCurrency, 
  getNetRevenueColorClass, 
  getNetRevenueBgClass,
  calculateProfitMargin,
  getProfitMarginColorClass 
} from '../../utils/simulationUtils';

interface RevenueResultProps {
  results: SimulationResult;
  isLoading?: boolean;
}

export const RevenueResult: React.FC<RevenueResultProps> = ({
  results,
  isLoading = false,
}) => {
  const { t } = useTranslation();
  const profitMargin = calculateProfitMargin(results.grossRevenue, results.netRevenue);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 overflow-hidden">
      {/* Header avec animation d'entrée */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('simulation.results.title', 'Resultados da Simulação')}
          </h3>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {t('simulation.results.live', 'Tempo Real')}
            </span>
          </div>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('simulation.results.description', 'Cálculo automático baseado nos dados inseridos')}
        </p>
      </div>

      {/* Grille principale des résultats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Receita Bruta - Carte améliorée */}
        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                  {t('simulation.results.grossRevenue', 'Receita Bruta')}
                </p>
              </div>
              <p className="text-3xl font-bold text-blue-900 dark:text-blue-100 mb-2">
                {formatCurrency(results.grossRevenue)}
              </p>
              <div className="bg-blue-200 dark:bg-blue-800 rounded-lg px-3 py-2">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                  {t('simulation.results.grossRevenueFormula', 'Quantidade × Preço por kg')}
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        {/* Despesas Totais - Carte améliorée */}
        <div className="group bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border border-orange-200 dark:border-orange-800 rounded-xl p-6 hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm font-semibold text-orange-700 dark:text-orange-300 uppercase tracking-wide">
                  {t('simulation.results.totalExpenses', 'Despesas Totais')}
                </p>
              </div>
              <p className="text-3xl font-bold text-orange-900 dark:text-orange-100 mb-2">
                {formatCurrency(results.totalExpenses)}
              </p>
              <div className="bg-orange-200 dark:bg-orange-800 rounded-lg px-3 py-2">
                <p className="text-xs text-orange-700 dark:text-orange-300 font-medium">
                  {t('simulation.results.totalExpensesFormula', 'Transporte + Outros custos')}
                </p>
              </div>
            </div>
            <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Receita Líquida - Carte mise en évidence */}
        <div className={`group ${getNetRevenueBgClass(results.netRevenue)} rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border-2 ${
          results.netRevenue > 0 
            ? 'border-green-300 dark:border-green-600' 
            : results.netRevenue < 0 
            ? 'border-red-300 dark:border-red-600'
            : 'border-gray-300 dark:border-gray-600'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-3 h-3 rounded-full ${
                  results.netRevenue > 0 ? 'bg-green-500' : results.netRevenue < 0 ? 'bg-red-500' : 'bg-gray-500'
                } animate-pulse`}></div>
                <p className={`text-sm font-bold ${getNetRevenueColorClass(results.netRevenue)} uppercase tracking-wide`}>
                  {t('simulation.results.netRevenue', 'Receita Líquida')}
                </p>
                {/* Badge de statut */}
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                  results.netRevenue > 0 
                    ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                    : results.netRevenue < 0 
                    ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                }`}>
                  {results.netRevenue > 0 ? 'LUCRO' : results.netRevenue < 0 ? 'PERDA' : 'EQUILÍBRIO'}
                </div>
              </div>
              <p className={`text-4xl font-black ${getNetRevenueColorClass(results.netRevenue)} mb-2`}>
                {formatCurrency(results.netRevenue)}
              </p>
              <div className={`rounded-lg px-3 py-2 ${
                results.netRevenue > 0 
                  ? 'bg-green-200 dark:bg-green-800' 
                  : results.netRevenue < 0 
                  ? 'bg-red-200 dark:bg-red-800'
                  : 'bg-gray-200 dark:bg-gray-800'
              }`}>
                <p className={`text-xs font-medium ${getNetRevenueColorClass(results.netRevenue)}`}>
                  {t('simulation.results.netRevenueFormula', 'Receita Bruta - Despesas Totais')}
                </p>
              </div>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300 ${
              results.netRevenue > 0 
                ? 'bg-green-500' 
                : results.netRevenue < 0 
                ? 'bg-red-500'
                : 'bg-gray-500'
            }`}>
              {results.netRevenue > 0 ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              ) : results.netRevenue < 0 ? (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              ) : (
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Profit Margin améliorée */}
      {results.grossRevenue > 0 && (
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                  {t('simulation.results.profitMargin', 'Margem de Lucro')}
                </p>
                <p className={`text-2xl font-bold ${getProfitMarginColorClass(profitMargin)}`}>
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                profitMargin > 20 
                  ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                  : profitMargin > 10 
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100'
                  : profitMargin > 0 
                  ? 'bg-orange-100 text-orange-800 dark:bg-orange-800 dark:text-orange-100'
                  : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
              }`}>
                {profitMargin > 20 
                  ? t('simulation.results.profitMargin.excellent', 'Excelente')
                  : profitMargin > 10 
                  ? t('simulation.results.profitMargin.good', 'Boa')
                  : profitMargin > 0 
                  ? t('simulation.results.profitMargin.low', 'Baixa')
                  : t('simulation.results.profitMargin.negative', 'Negativa')
                }
              </div>
            </div>
          </div>
          
          {/* Barre de progression pour la marge de profit */}
          <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                profitMargin > 20 
                  ? 'bg-green-500' 
                  : profitMargin > 10 
                  ? 'bg-yellow-500'
                  : profitMargin > 0 
                  ? 'bg-orange-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(Math.max(profitMargin, 0), 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Message de résumé amélioré */}
      <div className={`p-6 rounded-xl border-l-4 ${
        results.netRevenue > 0 
          ? 'bg-green-50 dark:bg-green-900/20 border-green-400 dark:border-green-600'
          : results.netRevenue < 0 
          ? 'bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-600'
          : 'bg-gray-50 dark:bg-gray-800 border-gray-400 dark:border-gray-600'
      }`}>
        <div className="flex items-start space-x-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            results.netRevenue > 0 
              ? 'bg-green-100 dark:bg-green-800'
              : results.netRevenue < 0 
              ? 'bg-red-100 dark:bg-red-800'
              : 'bg-gray-100 dark:bg-gray-700'
          }`}>
            {results.netRevenue > 0 ? (
              <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : results.netRevenue < 0 ? (
              <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>
          <div className="flex-1">
            <p className={`text-sm font-medium ${
              results.netRevenue > 0 
                ? 'text-green-800 dark:text-green-200'
                : results.netRevenue < 0 
                ? 'text-red-800 dark:text-red-200'
                : 'text-gray-800 dark:text-gray-200'
            }`}>
              {results.netRevenue > 0 ? (
                t('simulation.results.positiveMessage', 
                  'Parabéns! Sua simulação mostra um lucro positivo. Esta é uma boa oportunidade de negócio.')
              ) : results.netRevenue < 0 ? (
                t('simulation.results.negativeMessage', 
                  'Atenção: Sua simulação mostra uma perda. Considere revisar os custos ou negociar um preço melhor.')
              ) : (
                t('simulation.results.neutralMessage', 
                  'Sua simulação mostra equilíbrio entre receitas e despesas. Considere otimizar os custos para aumentar o lucro.')
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

