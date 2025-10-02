import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../ui/Card';
import { SimulationResult } from '../../types/simulation';

interface RevenueChartProps {
  results: SimulationResult;
  className?: string;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  results,
  className = '',
}) => {
  const { t } = useTranslation();

  // Prepare data for the chart
  const chartData = [
    {
      label: t('simulation.chart.grossRevenue', 'Receita Bruta'),
      value: results.grossRevenue,
      color: 'bg-blue-500',
      textColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      label: t('simulation.chart.totalExpenses', 'Despesas Totais'),
      value: results.totalExpenses,
      color: 'bg-orange-500',
      textColor: 'text-orange-600 dark:text-orange-400',
    },
    {
      label: t('simulation.chart.netRevenue', 'Receita Líquida'),
      value: results.netRevenue,
      color: results.netRevenue >= 0 ? 'bg-green-500' : 'bg-red-500',
      textColor: results.netRevenue >= 0 
        ? 'text-green-600 dark:text-green-400' 
        : 'text-red-600 dark:text-red-400',
    },
  ];

  // Find the maximum value for scaling
  const maxValue = Math.max(...chartData.map(item => Math.abs(item.value)));

  return (
    <Card className={`p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {t('simulation.chart.title', 'Visualização dos Resultados')}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {t('simulation.chart.description', 'Comparação visual entre receitas e despesas')}
        </p>
      </div>

      <div className="space-y-4">
        {chartData.map((item, index) => {
          const percentage = maxValue > 0 ? (Math.abs(item.value) / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${item.textColor}`}>
                  {item.label}
                </span>
                <span className={`text-sm font-bold ${item.textColor}`}>
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'XOF',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  }).format(item.value)}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${item.color}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Profit Margin Indicator */}
      {results.grossRevenue > 0 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {t('simulation.chart.profitMargin', 'Margem de Lucro')}
            </span>
            <span className={`text-lg font-bold ${
              results.netRevenue >= 0 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {((results.netRevenue / results.grossRevenue) * 100).toFixed(1)}%
            </span>
          </div>
          
          {/* Profit Margin Bar */}
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                results.netRevenue >= 0 ? 'bg-green-500' : 'bg-red-500'
              }`}
              style={{ 
                width: `${Math.min(Math.abs((results.netRevenue / results.grossRevenue) * 100), 100)}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
          {t('simulation.chart.legend.grossRevenue', 'Receita Bruta')}
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
          {t('simulation.chart.legend.expenses', 'Despesas')}
        </div>
        <div className="flex items-center">
          <div className={`w-3 h-3 rounded mr-2 ${
            results.netRevenue >= 0 ? 'bg-green-500' : 'bg-red-500'
          }`}></div>
          {t('simulation.chart.legend.netRevenue', 'Receita Líquida')}
        </div>
      </div>
    </Card>
  );
};

