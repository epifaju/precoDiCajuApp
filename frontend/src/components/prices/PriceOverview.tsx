import React from 'react';
import { useTranslation } from 'react-i18next';

interface PriceOverviewProps {
  prices: any[];
  className?: string;
}

export const PriceOverview: React.FC<PriceOverviewProps> = ({ prices, className = '' }) => {
  const { t } = useTranslation();

  if (prices.length === 0) return null;

  // Calculate quick stats
  const verifiedCount = prices.filter(p => p.verified).length;
  const totalValue = prices.reduce((sum, p) => sum + p.priceFcfa, 0);
  const avgPrice = totalValue / prices.length;
  const regions = [...new Set(prices.map(p => p.regionName))];
  const qualities = [...new Set(prices.map(p => p.qualityName))];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-GW', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('FCFA', 'FCFA');
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 sm:p-5 shadow-sm ${className}`}>
      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
        <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        {t('prices.quickOverview', 'Quick Overview')}
      </h3>
      
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        {/* Verified Prices */}
        <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800/30">
          <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
            {verifiedCount}
          </div>
          <div className="text-xs sm:text-sm text-green-700 dark:text-green-300 font-medium">
            {t('prices.verified', 'Verified')}
          </div>
        </div>

        {/* Average Price */}
        <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800/30">
          <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
            {formatCurrency(avgPrice)}
          </div>
          <div className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 font-medium">
            {t('prices.avgPrice', 'Avg Price')}
          </div>
        </div>

        {/* Regions */}
        <div className="text-center col-span-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800/30">
          <div className="text-lg sm:text-xl font-bold text-purple-600 dark:text-purple-400 mb-1">
            {regions.length}
          </div>
          <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 font-medium mb-2">
            {t('prices.regions', 'Regions')}
          </div>
          <div className="text-xs text-purple-600 dark:text-purple-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full inline-block">
            {regions.slice(0, 3).join(', ')}
            {regions.length > 3 && ` +${regions.length - 3}`}
          </div>
        </div>

        {/* Qualities */}
        <div className="text-center col-span-2 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800/30">
          <div className="text-lg sm:text-xl font-bold text-orange-600 dark:text-orange-400 mb-1">
            {qualities.length}
          </div>
          <div className="text-xs sm:text-sm text-orange-700 dark:text-orange-300 font-medium mb-2">
            {t('prices.qualities', 'Quality Grades')}
          </div>
          <div className="text-xs text-orange-600 dark:text-orange-400 bg-white dark:bg-gray-800 px-2 py-1 rounded-full inline-block">
            {qualities.slice(0, 3).join(', ')}
            {qualities.length > 3 && ` +${qualities.length - 3}`}
          </div>
        </div>
      </div>
    </div>
  );
};

