import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { PriceMap } from '../components/prices/PriceMap';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { usePrices, useRegions, useQualityGrades } from '../hooks/useApi';
import { Link } from 'react-router-dom';

const PricesMapPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const [filters, setFilters] = useState({
    regionCode: '',
    qualityGrade: '',
    verified: '',
    dateFrom: '',
    dateTo: '',
    search: '',
  });

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // API queries
  const { data: regions } = useRegions();
  const { data: qualityGrades } = useRegions();
  const { data: pricesData, isLoading, error } = usePrices({
    page: 0,
    size: 1000, // Charger plus de prix pour la carte
    sortBy: 'recordedDate',
    sortDir: 'desc',
    region: filters.regionCode || undefined,
    quality: filters.qualityGrade || undefined,
    verified: filters.verified ? filters.verified === 'true' : undefined,
    search: filters.search || undefined,
    from: filters.dateFrom || undefined,
    to: filters.dateTo || undefined,
  });

  const prices = pricesData?.content || [];

  // Filter options
  const regionOptions = [
    { value: '', label: t('map.allRegions', 'All Regions') },
    ...(regions || []).map((region: any) => ({
      value: region.code,
      label: region.namePt,
    }))
  ];

  const qualityOptions = [
    { value: '', label: t('map.allQualities', 'All Qualities') },
    ...(qualityGrades || []).map((quality: any) => ({
      value: quality.code,
      label: quality.namePt,
    }))
  ];

  const verifiedOptions = [
    { value: '', label: t('map.allPrices', 'All Prices') },
    { value: 'true', label: t('map.verifiedOnly', 'Verified Only') },
    { value: 'false', label: t('map.unverifiedOnly', 'Unverified Only') },
  ];

  const updateFilter = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      regionCode: '',
      qualityGrade: '',
      verified: '',
      dateFrom: '',
      dateTo: '',
      search: '',
    });
  };

  const pricesWithGPS = prices.filter(price => price.gpsLat && price.gpsLng);
  const totalPrices = prices.length;
  const pricesWithGPSCount = pricesWithGPS.length;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                {t('map.pageTitle', 'Price Map')}
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {t('map.pageDescription', 'Visualize cashew prices across Guinea-Bissau on an interactive map')}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              <Link to="/prices">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  {t('map.listView', 'List View')}
                </Button>
              </Link>
              
              <Link to="/submit">
                <Button>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('map.submitPrice', 'Submit Price')}
                </Button>
              </Link>
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{totalPrices}</div>
              <div className="text-sm text-blue-600 dark:text-blue-400">{t('map.totalPrices', 'Total Prices')}</div>
            </div>
            
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{pricesWithGPSCount}</div>
              <div className="text-sm text-green-600 dark:text-green-400">{t('map.pricesWithGps', 'With GPS')}</div>
            </div>
            
            <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {prices.filter(p => p.verified).length}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">{t('map.verifiedPrices', 'Verified')}</div>
            </div>
            
            <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {new Set(prices.map(p => p.region)).size}
              </div>
              <div className="text-sm text-orange-600 dark:text-orange-400">{t('map.regionsCovered', 'Regions')}</div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('map.filters', 'Map Filters')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('map.region', 'Region')}
                </label>
                <Select
                  value={filters.regionCode}
                  onChange={(value) => updateFilter('regionCode', value)}
                  options={regionOptions}
                  placeholder={t('map.selectRegion', 'Select Region')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('map.quality', 'Quality')}
                </label>
                <Select
                  value={filters.qualityGrade}
                  onChange={(value) => updateFilter('qualityGrade', value)}
                  options={qualityOptions}
                  placeholder={t('map.selectQuality', 'Select Quality')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('map.verified', 'Verified')}
                </label>
                <Select
                  value={filters.verified}
                  onChange={(value) => updateFilter('verified', value)}
                  options={verifiedOptions}
                  placeholder={t('map.selectVerified', 'Select Status')}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('map.dateFrom', 'From Date')}
                </label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => updateFilter('dateFrom', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('map.dateTo', 'To Date')}
                </label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => updateFilter('dateTo', e.target.value)}
                />
              </div>
              
              <div className="flex items-end">
                <Button onClick={clearFilters} variant="outline" className="w-full">
                  {t('map.clearFilters', 'Clear')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carte */}
        <PriceMap 
          prices={prices} 
          isLoading={isLoading}
          className="w-full"
        />

        {/* Légende */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">{t('map.legend', 'Map Legend')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{t('map.markerColors', 'Marker Colors')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('map.verifiedPrices', 'Verified Prices')}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('map.unverifiedPrices', 'Unverified Prices')}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{t('map.markerSizes', 'Marker Sizes')}</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white text-xs font-bold">W</div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('map.largeMarkers', 'Large (W180, W210)')}</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-5 h-5 bg-blue-500 rounded-full mr-3 flex items-center justify-center text-white text-xs font-bold">W</div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">{t('map.mediumMarkers', 'Medium (W240, W320)')}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{t('map.interactions', 'Interactions')}</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>• {t('map.clickMarker', 'Click marker for details')}</div>
                  <div>• {t('map.zoomMap', 'Zoom with mouse wheel')}</div>
                  <div>• {t('map.dragMap', 'Drag to pan')}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white">{t('map.tips', 'Tips')}</h4>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <div>• {t('map.useFilters', 'Use filters to focus on specific data')}</div>
                  <div>• {t('map.addGps', 'Add GPS when submitting prices')}</div>
                  <div>• {t('map.verifyPrices', 'Verify prices for better visibility')}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PricesMapPage;
