import React, { useState } from 'react';
import { ExportateurFilters, ExportateurType, StatutType } from '../../types/exporter';
import { useTranslation } from 'react-i18next';
import { Search, Filter, X } from 'lucide-react';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';

interface FilterBarProps {
  filters: ExportateurFilters;
  onFiltersChange: (filters: ExportateurFilters) => void;
  regions: Array<{ code: string; name: string }>;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFiltersChange,
  regions,
  className = ''
}) => {
  const { t } = useTranslation();
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof ExportateurFilters, value: string | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined);

  const regionOptions = [
    { value: '', label: t('exporters.filters.all_regions', 'Toutes les régions') },
    ...regions.map(region => ({
      value: region.code,
      label: region.name
    }))
  ];

  const typeOptions = [
    { value: '', label: t('exporters.filters.all_types', 'Tous les types') },
    { value: ExportateurType.EXPORTATEUR, label: t('exporters.type.exportateur', 'Exportateur') },
    { value: ExportateurType.ACHETEUR_LOCAL, label: t('exporters.type.acheteur_local', 'Acheteur Local') }
  ];

  const statutOptions = [
    { value: '', label: t('exporters.filters.all_status', 'Tous les statuts') },
    { value: StatutType.ACTIF, label: t('exporters.status.actif', 'Actif') },
    { value: StatutType.EXPIRE, label: t('exporters.status.expire', 'Expiré') },
    { value: StatutType.SUSPENDU, label: t('exporters.status.suspendu', 'Suspendu') }
  ];

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${className}`}>
      {/* Recherche principale */}
      <div className="flex items-center gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder={t('exporters.search_placeholder', 'Rechercher par nom ou numéro d\'agrément...')}
            value={filters.nom || ''}
            onChange={(e) => handleFilterChange('nom', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
            ${showAdvanced 
              ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
              : 'bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300'
            }
          `}
        >
          <Filter className="w-4 h-4" />
          {t('exporters.advanced_filters', 'Filtres avancés')}
        </button>

        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-900/20 transition-colors"
          >
            <X className="w-4 h-4" />
            {t('common.clear_filters', 'Effacer')}
          </button>
        )}
      </div>

      {/* Filtres avancés */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Région */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exporters.filters.region', 'Région')}
            </label>
            <Select
              value={filters.regionCode || ''}
              onChange={(value) => handleFilterChange('regionCode', value)}
              options={regionOptions}
            />
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exporters.filters.type', 'Type')}
            </label>
            <Select
              value={filters.type || ''}
              onChange={(value) => handleFilterChange('type', value as ExportateurType)}
              options={typeOptions}
            />
          </div>

          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('exporters.filters.status', 'Statut')}
            </label>
            <Select
              value={filters.statut || ''}
              onChange={(value) => handleFilterChange('statut', value as StatutType)}
              options={statutOptions}
            />
          </div>
        </div>
      )}

      {/* Résumé des filtres actifs */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {t('exporters.active_filters', 'Filtres actifs')}:
          </span>
          
          {filters.regionCode && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900/20 dark:text-blue-300">
              {regions.find(r => r.code === filters.regionCode)?.name}
              <button
                onClick={() => handleFilterChange('regionCode', undefined)}
                className="hover:text-blue-600 dark:hover:text-blue-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.type && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full dark:bg-green-900/20 dark:text-green-300">
              {typeOptions.find(t => t.value === filters.type)?.label}
              <button
                onClick={() => handleFilterChange('type', undefined)}
                className="hover:text-green-600 dark:hover:text-green-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.statut && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full dark:bg-purple-900/20 dark:text-purple-300">
              {statutOptions.find(s => s.value === filters.statut)?.label}
              <button
                onClick={() => handleFilterChange('statut', undefined)}
                className="hover:text-purple-600 dark:hover:text-purple-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          
          {filters.nom && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full dark:bg-gray-700 dark:text-gray-300">
              "{filters.nom}"
              <button
                onClick={() => handleFilterChange('nom', undefined)}
                className="hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterBar;
