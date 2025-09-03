import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { usePrices, useRegions, useQualityGrades } from '../../hooks/useApi';
import { usePriceUpdates, useWebSocket } from '../../hooks/useWebSocket';
import { webSocketService } from '../../services/WebSocketService';
import { PriceCard } from './PriceCard';
import { FilterPanel } from './FilterPanel';
import { MobilePagination } from './MobilePagination';
import { PriceStats } from './PriceStats';
import { FloatingActionButtons } from './FloatingActionButtons';
import { PriceOverview } from './PriceOverview';

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
  
  // Mobile state
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  // WebSocket connection state
  const { isConnected } = useWebSocket();

  // API queries
  const { data: regions } = useRegions();
  const { data: qualityGrades } = useQualityGrades();
  const { data: pricesData, isLoading, error, refetch } = usePrices({
    page,
    size,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
    region: filters.regionCode || undefined,
    quality: filters.qualityGrade || undefined,
    from: filters.dateFrom || undefined,
    to: filters.dateTo || undefined,
    verified: filters.verified || undefined,
  });

  // Subscribe to price updates via WebSocket
  usePriceUpdates(
    (newPrice) => {
      // Refetch prices when a new price is added
      refetch();
    },
    (updatedPrice) => {
      // Refetch prices when a price is updated
      refetch();
    }
  );

  // Subscribe to region and quality updates when filters change
  useEffect(() => {
    if (isConnected) {
      if (filters.regionCode) {
        webSocketService.subscribeToRegion(filters.regionCode);
      }
      if (filters.qualityGrade) {
        webSocketService.subscribeToQuality(filters.qualityGrade);
      }
    }
  }, [isConnected, filters.regionCode, filters.qualityGrade]);

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
        <CardContent className="text-center py-8 px-4 sm:px-6">
          <div className="text-red-500 dark:text-red-400">
            <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm sm:text-base">{t('prices.errorLoading', 'Failed to load prices. Please try again.')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Card className="shadow-sm">
        <CardHeader className="pb-4 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
                {t('prices.title', 'Cashew Prices')}
              </CardTitle>
              <CardDescription className="text-sm sm:text-base mt-2 text-gray-600 dark:text-gray-400">
                {t('prices.description', 'Browse and search current cashew prices from across Guinea-Bissau')}
              </CardDescription>
            </div>
            
            {/* Mobile View Toggle */}
            <div className="flex items-center gap-2 sm:hidden">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="px-3 py-2 h-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="px-3 py-2 h-10"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </Button>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
              <Link to="/map" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto justify-center h-10 px-4 sm:px-6">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  <span className="hidden sm:inline">{t('prices.mapView', 'Map View')}</span>
                  <span className="sm:hidden">{t('prices.mapView', 'Map')}</span>
                </Button>
              </Link>
              <Link to="/submit" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto justify-center h-10 px-4 sm:px-6 bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span className="hidden sm:inline">{t('prices.submit', 'Submit Price')}</span>
                  <span className="sm:hidden">{t('prices.submit', 'Submit')}</span>
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 px-4 sm:px-6 lg:px-8">
          <FilterPanel
            filters={filters}
            onFilterChange={updateFilter}
            onClearFilters={clearFilters}
            regionOptions={regionOptions}
            qualityOptions={qualityOptions}
            verifiedOptions={verifiedOptions}
            sortOptions={sortOptions}
            sortDirOptions={sortDirOptions}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
          />

          {/* Quick Overview for Mobile */}
          <div className="sm:hidden">
            <PriceOverview prices={prices} className="mb-4" />
          </div>

          {/* Results Info */}
          <PriceStats
            totalElements={totalElements}
            currentPage={page}
            totalPages={totalPages}
            pageSize={size}
            className="mb-6"
          />

          {/* Price List/Grid */}
          {isLoading ? (
            <div className={`space-y-6 ${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8' : ''}`}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={`border border-gray-200 dark:border-gray-700 rounded-lg p-5 sm:p-6 animate-pulse ${viewMode === 'grid' ? 'h-56' : ''}`}>
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
            <div className="text-center py-12 px-4">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900 dark:text-white">
                {t('prices.noPrices', 'No prices found')}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                {t('prices.noPricesDescription', 'Try adjusting your filters or submit the first price.')}
              </p>
            </div>
          ) : (
            <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8' : 'space-y-6 sm:space-y-8'}`}>
              {prices.map((price: any) => (
                <PriceCard
                  key={price.id}
                  price={price}
                  viewMode={viewMode}
                  onLocationClick={openLocationInMaps}
                />
              ))}
            </div>
          )}

          {/* Mobile-optimized Pagination */}
          <MobilePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </CardContent>
      </Card>
      
      {/* Floating Action Buttons for Mobile */}
      <FloatingActionButtons />
    </div>
  );
};


