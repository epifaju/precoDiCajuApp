import React from 'react';
import { useTranslation } from 'react-i18next';

interface PriceStatsProps {
  totalElements: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  className?: string;
}

export const PriceStats: React.FC<PriceStatsProps> = ({
  totalElements,
  currentPage,
  totalPages,
  pageSize,
  className = '',
}) => {
  const { t } = useTranslation();

  const startIndex = currentPage * pageSize + 1;
  const endIndex = Math.min((currentPage + 1) * pageSize, totalElements);

  return (
    <div className={`bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg p-4 sm:p-5 border border-blue-200 dark:border-blue-800/30 ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm sm:text-base font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {t('prices.resultsSummary', 'Results Summary')}
          </h3>
          <p className="text-sm sm:text-base text-blue-700 dark:text-blue-400 leading-relaxed">
            {t('prices.showing', 'Showing')} <span className="font-semibold">{startIndex}-{endIndex}</span> {t('prices.of', 'of')} <span className="font-semibold">{totalElements}</span> {t('prices.results', 'results')}
          </p>
        </div>
        
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="text-center sm:text-right flex-1 sm:flex-none">
            <div className="text-lg sm:text-xl font-bold text-blue-900 dark:text-blue-300">
              {totalElements.toLocaleString()}
            </div>
            <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-medium">
              {t('prices.totalPrices', 'Total Prices')}
            </div>
          </div>
          
          {totalPages > 1 && (
            <div className="text-center sm:text-right flex-1 sm:flex-none">
              <div className="text-lg sm:text-xl font-bold text-indigo-900 dark:text-indigo-300">
                {currentPage + 1}/{totalPages}
              </div>
              <div className="text-xs sm:text-sm text-indigo-600 dark:text-indigo-400 font-medium">
                {t('prices.page', 'Page')}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Progress bar for mobile */}
      {totalPages > 1 && (
        <div className="mt-4 sm:hidden">
          <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2.5">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 h-2.5 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${((currentPage + 1) / totalPages) * 100}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-blue-600 dark:text-blue-400 mt-1">
            <span>{t('prices.page', 'Page')} 1</span>
            <span>{t('prices.page', 'Page')} {totalPages}</span>
          </div>
        </div>
      )}
    </div>
  );
};

