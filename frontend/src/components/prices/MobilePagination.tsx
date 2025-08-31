import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface MobilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const MobilePagination: React.FC<MobilePaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const { t } = useTranslation();

  if (totalPages <= 1) return null;

  const canGoPrevious = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
      {/* Previous Button */}
      <Button
        variant="outline"
        disabled={!canGoPrevious}
        onClick={() => onPageChange(currentPage - 1)}
        className="w-full sm:w-auto justify-center h-11 px-6 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        }
      >
        <span className="hidden sm:inline">{t('prices.previous', 'Previous')}</span>
        <span className="sm:hidden">{t('prices.previous', 'Previous')}</span>
      </Button>

      {/* Page Info and Indicators */}
      <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 order-first sm:order-none">
        <div className="text-center">
          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
            {t('prices.page', 'Page')} <span className="font-semibold text-gray-900 dark:text-white">{currentPage + 1}</span> {t('prices.of', 'of')} <span className="font-semibold text-gray-900 dark:text-white">{totalPages}</span>
          </span>
        </div>
        
        {/* Mobile page indicators */}
        <div className="flex items-center gap-2 sm:hidden">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const pageIndex = Math.max(0, Math.min(totalPages - 5, currentPage - 2)) + i;
            if (pageIndex >= totalPages) return null;
            
            return (
              <button
                key={pageIndex}
                onClick={() => onPageChange(pageIndex)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  pageIndex === currentPage
                    ? 'bg-blue-600 dark:bg-blue-400 shadow-sm scale-110'
                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 hover:scale-105'
                }`}
                aria-label={`Go to page ${pageIndex + 1}`}
              />
            );
          })}
        </div>

        {/* Desktop page numbers */}
        <div className="hidden sm:flex items-center gap-1">
          {Array.from({ length: Math.min(7, totalPages) }, (_, i) => {
            const pageIndex = Math.max(0, Math.min(totalPages - 7, currentPage - 3)) + i;
            if (pageIndex >= totalPages) return null;
            
            return (
              <button
                key={pageIndex}
                onClick={() => onPageChange(pageIndex)}
                className={`w-8 h-8 rounded-md text-sm font-medium transition-all duration-200 ${
                  pageIndex === currentPage
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
                aria-label={`Go to page ${pageIndex + 1}`}
              >
                {pageIndex + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next Button */}
      <Button
        variant="outline"
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
        className="w-full sm:w-auto justify-center h-11 px-6 transition-all duration-200 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        rightIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        }
      >
        <span className="hidden sm:inline">{t('prices.next', 'Next')}</span>
        <span className="sm:hidden">{t('prices.next', 'Next')}</span>
      </Button>
    </div>
  );
};

