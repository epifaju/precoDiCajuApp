import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';

interface LocalFilters {
  search: string;
  regionCode: string;
  qualityGrade: string;
  verified: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'recordedDate' | 'priceFcfa' | 'createdAt';
  sortDir: 'asc' | 'desc';
}

interface FilterPanelProps {
  filters: LocalFilters;
  onFilterChange: (key: keyof LocalFilters, value: string) => void;
  onClearFilters: () => void;
  regionOptions: Array<{ value: string; label: string }>;
  qualityOptions: Array<{ value: string; label: string }>;
  verifiedOptions: Array<{ value: string; label: string }>;
  sortOptions: Array<{ value: string; label: string }>;
  sortDirOptions: Array<{ value: string; label: string }>;
  showFilters: boolean;
  onToggleFilters: () => void;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onClearFilters,
  regionOptions,
  qualityOptions,
  verifiedOptions,
  sortOptions,
  sortDirOptions,
  showFilters,
  onToggleFilters,
}) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-4">
      {/* Mobile Filter Toggle */}
      <div className="sm:hidden">
        <Button
          variant="outline"
          onClick={onToggleFilters}
          className="w-full justify-between h-12 text-sm font-medium"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('prices.filters', 'Filters')}
          </span>
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-4 p-4 sm:p-5 lg:p-6 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 transition-all duration-200 ${
        showFilters ? 'block opacity-100' : 'hidden sm:block opacity-100'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white flex items-center">
            <svg className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {t('prices.filters', 'Filters')}
          </h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClearFilters} 
            className="text-xs px-3 py-2 h-8 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            {t('prices.clearFilters', 'Clear All')}
          </Button>
        </div>

        {/* Mobile-first grid layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Search - Full width on mobile, spans 2 on small screens */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-1">
            <Input
              placeholder={t('prices.searchPlaceholder', 'Search by source name...')}
              value={filters.search}
              onChange={(e) => onFilterChange('search', e.target.value)}
              leftIcon={
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              className="h-11"
            />
          </div>

          {/* Region */}
          <div className="col-span-1">
            <Select
              options={regionOptions}
              value={filters.regionCode}
              onChange={(value) => onFilterChange('regionCode', value)}
              placeholder={t('prices.selectRegion', 'Select region')}
              className="h-11"
            />
          </div>

          {/* Quality */}
          <div className="col-span-1">
            <Select
              options={qualityOptions}
              value={filters.qualityGrade}
              onChange={(value) => onFilterChange('qualityGrade', value)}
              placeholder={t('prices.selectQuality', 'Select quality')}
              className="h-11"
            />
          </div>

          {/* Verified */}
          <div className="col-span-1">
            <Select
              options={verifiedOptions}
              value={filters.verified}
              onChange={(value) => onFilterChange('verified', value)}
              className="h-11"
            />
          </div>

          {/* Date From */}
          <div className="col-span-1">
            <Input
              type="date"
              placeholder={t('prices.dateFrom', 'From date')}
              value={filters.dateFrom}
              onChange={(e) => onFilterChange('dateFrom', e.target.value)}
              className="h-11"
            />
          </div>

          {/* Date To */}
          <div className="col-span-1">
            <Input
              type="date"
              placeholder={t('prices.dateTo', 'To date')}
              value={filters.dateTo}
              onChange={(e) => onFilterChange('dateTo', e.target.value)}
              className="h-11"
            />
          </div>
        </div>

        {/* Sort Controls - Mobile optimized */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex-1 sm:w-48">
            <Select
              options={sortOptions}
              value={filters.sortBy}
              onChange={(value) => onFilterChange('sortBy', value as any)}
              className="h-11"
            />
          </div>
          <div className="flex-1 sm:w-48">
            <Select
              options={sortDirOptions}
              value={filters.sortDir}
              onChange={(value) => onFilterChange('sortDir', value as any)}
              className="h-11"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

