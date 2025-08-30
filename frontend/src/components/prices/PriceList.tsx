import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { usePrices, useRegions, useQualityGrades } from '../../hooks/useApi';

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

interface PriceListProps {
  className?: string;
}

export const PriceList: React.FC<PriceListProps> = ({ className }) => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [filters, setFilters] = useState<LocalFilters>({
    search: '',
    regionCode: '',
    qualityGrade: '',
    verified: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'recordedDate',
    sortDir: 'desc',
  });

  // API queries
  const { data: regions } = useRegions();
  const { data: qualityGrades } = useQualityGrades();
  const { data: pricesData, isLoading, error } = usePrices({
    page,
    size,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
    region: filters.regionCode || undefined,
    quality: filters.qualityGrade || undefined,
    from: filters.dateFrom || undefined,
    to: filters.dateTo || undefined,
  });

  const prices = pricesData?.content || [];
  const totalPages = pricesData?.totalPages || 0;
  const totalElements = pricesData?.totalElements || 0;

  // Filter options
  const regionOptions = [
    { value: '', label: t('prices.allRegions', 'All Regions') || 'All Regions' },
    ...(regions || []).map((region: any) => ({
      value: region.code,
      label: region.namePt,
    }))
  ];

  const qualityOptions = [
    { value: '', label: t('prices.allQualities', 'All Qualities') || 'All Qualities' },
    ...(qualityGrades || []).map((quality: any) => ({
      value: quality.code,
      label: quality.namePt,
    }))
  ];

  const verifiedOptions = [
    { value: '', label: t('prices.allPrices', 'All Prices') || 'All Prices' },
    { value: 'true', label: t('prices.verifiedOnly', 'Verified Only') || 'Verified Only' },
    { value: 'false', label: t('prices.unverifiedOnly', 'Unverified Only') || 'Unverified Only' },
  ];

  const sortOptions = [
    { value: 'recordedDate', label: t('prices.sortBy.date', 'Date Recorded') || 'Date Recorded' },
    { value: 'priceFcfa', label: t('prices.sortBy.price', 'Price') || 'Price' },
    { value: 'createdAt', label: t('prices.sortBy.submitted', 'Date Submitted') || 'Date Submitted' },
  ];

  const sortDirOptions = [
    { value: 'desc', label: t('prices.sortDir.desc', 'Newest First') || 'Newest First' },
    { value: 'asc', label: t('prices.sortDir.asc', 'Oldest First') || 'Oldest First' },
  ];

  const updateFilter = (key: keyof LocalFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(0); // Reset to first page when filters change
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      regionCode: '',
      qualityGrade: '',
      verified: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'recordedDate',
      sortDir: 'desc',
    });
    setPage(0);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-GW', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('FCFA', 'FCFA');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-GW', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Function to open location in maps
  const openLocationInMaps = (lat: number, lng: number, sourceName?: string) => {
    // Try to detect the platform and open appropriate map app
    const userAgent = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(userAgent);
    const isAndroid = /android/.test(userAgent);
    
    let mapUrl: string;
    
    if (isIOS) {
      // Apple Maps for iOS
      mapUrl = `https://maps.apple.com/?q=${lat},${lng}&ll=${lat},${lng}&t=m`;
    } else if (isAndroid) {
      // Google Maps for Android
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    } else {
      // Default to Google Maps for web/desktop
      mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    }
    
    // Open in new tab/window
    window.open(mapUrl, '_blank');
  };

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-8">
          <div className="text-red-500 dark:text-red-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p>{t('prices.errorLoading', 'Failed to load prices. Please try again.')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t('prices.title', 'Cashew Prices')}</CardTitle>
              <CardDescription>
                {t('prices.description', 'Browse and search current cashew prices from across Guinea-Bissau')}
              </CardDescription>
            </div>
            <div className="flex items-center space-x-3">
              <Link to="/map">
                <Button variant="outline">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {t('prices.mapView', 'Map View')}
                </Button>
              </Link>
              <Link to="/submit">
                <Button
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  }
                >
                  {t('prices.submit', 'Submit Price')}
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filters */}
          <div className="space-y-4 mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                {t('prices.filters', 'Filters')}
              </h3>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                {t('prices.clearFilters', 'Clear All')}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <Input
                placeholder={t('prices.searchPlaceholder', 'Search by source name...')}
                value={filters.search}
                onChange={(e) => updateFilter('search', e.target.value)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                }
              />

              {/* Region */}
              <Select
                options={regionOptions}
                value={filters.regionCode}
                onChange={(e) => updateFilter('regionCode', e.target.value)}
                placeholder={t('prices.selectRegion', 'Select region')}
              />

              {/* Quality */}
              <Select
                options={qualityOptions}
                value={filters.qualityGrade}
                onChange={(e) => updateFilter('qualityGrade', e.target.value)}
                placeholder={t('prices.selectQuality', 'Select quality')}
              />

              {/* Verified */}
              <Select
                options={verifiedOptions}
                value={filters.verified}
                onChange={(e) => updateFilter('verified', e.target.value)}
              />

              {/* Date From */}
              <Input
                type="date"
                placeholder={t('prices.dateFrom', 'From date')}
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
              />

              {/* Date To */}
              <Input
                type="date"
                placeholder={t('prices.dateTo', 'To date')}
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
              />
            </div>

            {/* Sort Controls */}
            <div className="flex items-center space-x-4">
              <Select
                options={sortOptions}
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as any)}
                className="w-48"
              />
              <Select
                options={sortDirOptions}
                value={filters.sortDir}
                onChange={(e) => updateFilter('sortDir', e.target.value as any)}
                className="w-48"
              />
            </div>
          </div>

          {/* Results Info */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('prices.showing', 'Showing')} {page * size + 1}-{Math.min((page + 1) * size, totalElements)} {t('prices.of', 'of')} {totalElements} {t('prices.results', 'results')}
            </p>
          </div>

          {/* Price List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : prices.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                {t('prices.noPrices', 'No prices found')}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('prices.noPricesDescription', 'Try adjusting your filters or submit the first price.')}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prices.map((price: any) => (
                <div
                  key={price.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      {/* Avatar */}
                      <div className="h-12 w-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
                        {price.regionName.charAt(0)}
                      </div>

                      {/* Price Info */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(price.priceFcfa)}
                          </h3>
                          {price.verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                              ✓ {t('prices.verified', 'Verified')}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">{price.regionName}</span> • {price.qualityName}
                          {price.sourceName && <span> • {price.sourceName}</span>}
                        </div>
                        
                        <div className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                          {t('prices.recordedOn', 'Recorded on')} {formatDate(price.recordedDate)} • {t('prices.by', 'by')} {price.createdBy.fullName}
                        </div>
                        
                        {price.notes && (
                          <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                            "{price.notes}"
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      {price.photoUrl && (
                        <Button variant="ghost" size="sm">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </Button>
                      )}
                      
                      {(price.gpsLat && price.gpsLng) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => openLocationInMaps(price.gpsLat!, price.gpsLng!, price.sourceName)}
                          title={t('prices.openInMaps', 'Open location in maps')}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                {t('prices.previous', 'Previous')}
              </Button>

              <span className="text-sm text-gray-600 dark:text-gray-400">
                {t('prices.page', 'Page')} {page + 1} {t('prices.of', 'of')} {totalPages}
              </span>

              <Button
                variant="outline"
                disabled={page >= totalPages - 1}
                onClick={() => setPage(page + 1)}
                rightIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                }
              >
                {t('prices.next', 'Next')}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};


