import React from 'react';
import { useTranslation } from 'react-i18next';
import { POIType, POI_TYPE_CONFIG } from '../../types/poi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';

interface POIFiltersProps {
  selectedTypes: POIType[];
  searchTerm: string;
  onTypeToggle: (type: POIType) => void;
  onSearchChange: (term: string) => void;
  onClearFilters: () => void;
  className?: string;
}

export const POIFilters: React.FC<POIFiltersProps> = ({
  selectedTypes,
  searchTerm,
  onTypeToggle,
  onSearchChange,
  onClearFilters,
  className = '',
}) => {
  const { t } = useTranslation();

  const allTypesSelected = selectedTypes.length === 3;
  const noTypesSelected = selectedTypes.length === 0;

  const handleSelectAll = () => {
    if (allTypesSelected) {
      // Deselect all
      onClearFilters();
    } else {
      // Select all types
      Object.keys(POI_TYPE_CONFIG).forEach(type => {
        if (!selectedTypes.includes(type as POIType)) {
          onTypeToggle(type as POIType);
        }
      });
    }
  };

  return (
    <Card className={`poi-filters ${className}`}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{t('poi.filters', 'Filtres POI')}</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
              className="text-xs"
            >
              {allTypesSelected ? t('poi.deselectAll', 'Tout désélectionner') : t('poi.selectAll', 'Tout sélectionner')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              className="text-xs"
            >
              {t('poi.clear', 'Effacer')}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('poi.search', 'Rechercher un POI')}
            </label>
            <Input
              type="text"
              placeholder={t('poi.searchPlaceholder', 'Nom du POI...')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Type Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('poi.filterByType', 'Filtrer par type')}
            </label>
            <div className="space-y-2">
              {Object.entries(POI_TYPE_CONFIG).map(([type, config]) => {
                const isSelected = selectedTypes.includes(type as POIType);
                
                return (
                  <label
                    key={type}
                    className="flex items-center space-x-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => onTypeToggle(type as POIType)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <div className="flex items-center space-x-2 flex-1">
                      <span className="text-lg">{config.icon}</span>
                      <div
                        className="w-3 h-3 rounded-full border border-white shadow-sm"
                        style={{ backgroundColor: config.color }}
                      />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {config.label}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {config.description}
                        </div>
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Filter Summary */}
          {(selectedTypes.length > 0 || searchTerm) && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <div className="font-medium mb-1">{t('poi.activeFilters', 'Filtres actifs')}:</div>
                <div className="space-y-1">
                  {selectedTypes.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Types:</span>
                      <div className="flex space-x-1">
                        {selectedTypes.map(type => (
                          <span
                            key={type}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${POI_TYPE_CONFIG[type].color}20`,
                              color: POI_TYPE_CONFIG[type].color,
                            }}
                          >
                            {POI_TYPE_CONFIG[type].icon} {POI_TYPE_CONFIG[type].label}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {searchTerm && (
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Recherche:</span>
                      <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded text-xs">
                        "{searchTerm}"
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// Compact version for mobile
export const POIFiltersCompact: React.FC<POIFiltersProps> = ({
  selectedTypes,
  searchTerm,
  onTypeToggle,
  onSearchChange,
  onClearFilters,
  className = '',
}) => {
  const { t } = useTranslation();

  return (
    <div className={`poi-filters-compact ${className}`}>
      {/* Search */}
      <div className="mb-3">
        <Input
          type="text"
          placeholder={t('poi.searchPlaceholder', 'Rechercher...')}
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Type Buttons */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(POI_TYPE_CONFIG).map(([type, config]) => {
          const isSelected = selectedTypes.includes(type as POIType);
          
          return (
            <button
              key={type}
              onClick={() => onTypeToggle(type as POIType)}
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isSelected
                  ? 'text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
              style={isSelected ? { backgroundColor: config.color } : {}}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
            </button>
          );
        })}
        
        {(selectedTypes.length > 0 || searchTerm) && (
          <button
            onClick={onClearFilters}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800"
          >
            {t('poi.clear', 'Effacer')}
          </button>
        )}
      </div>
    </div>
  );
};
