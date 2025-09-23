import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { createSafeTranslation } from '../utils/safeTranslation';
import { POIMapView } from '../components/poi/POIMapView';
import { POIFilters, POIFiltersCompact } from '../components/poi/POIFilters';
import { POIStatistics, POIType, GUINEA_BISSAU_BOUNDS } from '../types/poi';
import { usePOIsOffline, usePOIStatisticsOffline, usePOIOfflineSync, usePOIDataAvailability } from '../hooks/usePOIOffline';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useConnectionStatus } from '../hooks/useConnectionStatus';
import { SyncErrorAlert } from '../components/common/SyncErrorAlert';

const POIMapPage: React.FC = () => {
  const { t } = useTranslation();
  const safeT = createSafeTranslation(t);
  const { isAuthenticated } = useAuthStore();
  const { isOnline } = useConnectionStatus();

  // State for filters
  const [selectedTypes, setSelectedTypes] = useState<POIType[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [mapBounds, setMapBounds] = useState(GUINEA_BISSAU_BOUNDS);
  const [selectedPOI, setSelectedPOI] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Offline sync
  const { isInitialized, lastSyncTime, isSyncing, syncError, syncPOIs, clearError } = usePOIOfflineSync();
  const { isAvailable, dataSize } = usePOIDataAvailability();

  // Data queries
  const { data: pois = [], isLoading, error } = usePOIsOffline({
    type: selectedTypes.length === 1 ? selectedTypes[0] : undefined,
    search: searchTerm || undefined,
    minLat: mapBounds.south,
    maxLat: mapBounds.north,
    minLng: mapBounds.west,
    maxLng: mapBounds.east,
  });

  const { data: statistics } = usePOIStatisticsOffline();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Handle type filter toggle
  const handleTypeToggle = (type: POIType) => {
    setSelectedTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Handle search change
  const handleSearchChange = (term: string) => {
    setSearchTerm(term);
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setSelectedTypes([]);
    setSearchTerm('');
  };

  // Handle POI click
  const handlePOIClick = (poi: any) => {
    setSelectedPOI(poi);
  };

  // Handle map bounds change
  const handleMapBoundsChange = (bounds: typeof mapBounds) => {
    setMapBounds(bounds);
  };

  // Format last sync time
  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Jamais';
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins} min`;
    if (diffMins < 1440) return `Il y a ${Math.floor(diffMins / 60)}h`;
    return `Il y a ${Math.floor(diffMins / 1440)}j`;
  };

  // Statistics cards
  const StatCard: React.FC<{ title: string; value: number; color: string; icon: string }> = ({ 
    title, value, color, icon 
  }) => (
    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex justify-center mb-2">
        <span className="text-2xl">{icon}</span>
      </div>
      <div className="text-2xl font-bold mb-1" style={{ color }}>
        {value}
      </div>
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {title}
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            {/* Title and Description */}
            <div className="flex-1 space-y-4">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                {safeT('poi.pageTitle', 'Carte des Points d\'Achat')}
              </h1>
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-3xl">
                {safeT('poi.pageDescription', 'Trouvez les acheteurs agréés, coopératives et entrepôts d\'exportation en Guinée-Bissau')}
              </p>
            </div>

            {/* Sync Status and Actions */}
            <div className="flex flex-col space-y-3">
              {/* Sync Status */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {safeT('poi.syncStatus', 'Synchronisation')}
                  </span>
                  <div className="flex items-center space-x-2">
                    {isOnline ? (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                        {safeT('poi.online', 'En ligne')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-200">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-1"></div>
                        {safeT('poi.offline', 'Hors ligne')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400">
                  {safeT('poi.lastSync', 'Dernière sync')}: {formatLastSync(lastSyncTime)}
                </div>
                {isOnline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={syncPOIs}
                    disabled={isSyncing}
                    className="w-full mt-2"
                  >
                    {isSyncing ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                        {safeT('poi.syncing', 'Synchronisation...')}
                      </>
                    ) : (
                      safeT('geolocation.offline.sync', 'Sincronizar')
                    )}
                  </Button>
                )}
                {syncError && (
                  <div className="mt-2">
                    <SyncErrorAlert
                      error={syncError}
                      isOnline={isOnline}
                      onRetry={syncPOIs}
                      onDismiss={clearError}
                    />
                  </div>
                )}
              </div>

              {/* Offline Data Info */}
              {dataSize && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {safeT('poi.offlineData', 'Données hors ligne')}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <div>{dataSize.pois} POI{safeT('poi.stored', ' stockés')}</div>
                    <div>{dataSize.stats ? safeT('poi.statsAvailable', 'Statistiques disponibles') : safeT('poi.noStats', 'Pas de statistiques')}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Statistics */}
        {statistics && (
          <div className="mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {safeT('poi.statistics', 'Statistiques des POI')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <StatCard
                    title={safeT('poi.total', 'Total')}
                    value={statistics.totalCount || 0}
                    color="#6366f1"
                    icon="📍"
                  />
                  <StatCard
                    title={safeT('poi.buyers', 'Acheteurs')}
                    value={statistics.acheteurCount || 0}
                    color="#22c55e"
                    icon="🟢"
                  />
                  <StatCard
                    title={safeT('poi.cooperatives', 'Coopératives')}
                    value={statistics.cooperativeCount || 0}
                    color="#3b82f6"
                    icon="🔵"
                  />
                  <StatCard
                    title={safeT('poi.warehouses', 'Entrepôts')}
                    value={statistics.entrepotCount || 0}
                    color="#f97316"
                    icon="🟠"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters Toggle Button */}
        <div className="mb-4 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="lg:hidden"
          >
            {showFilters ? safeT('poi.hideFilters', 'Masquer les filtres') : safeT('poi.showFilters', 'Afficher les filtres')}
          </Button>
          
          {/* Results count */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {isLoading ? (
              safeT('poi.loading', 'Chargement...')
            ) : (
              `${pois.length} POI${pois.length > 1 ? 's' : ''} ${safeT('poi.found', 'trouvé(s)')}`
            )}
          </div>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="lg:sticky lg:top-4">
              {/* Desktop Filters */}
              <div className="hidden lg:block">
                <POIFilters
                  selectedTypes={selectedTypes}
                  searchTerm={searchTerm}
                  onTypeToggle={handleTypeToggle}
                  onSearchChange={handleSearchChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
              
              {/* Mobile Filters */}
              <div className="lg:hidden">
                <POIFiltersCompact
                  selectedTypes={selectedTypes}
                  searchTerm={searchTerm}
                  onTypeToggle={handleTypeToggle}
                  onSearchChange={handleSearchChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                <POIMapView
                  selectedTypes={selectedTypes}
                  searchTerm={searchTerm}
                  onPOIClick={handlePOIClick}
                  onMapBoundsChange={handleMapBoundsChange}
                  height="600px"
                  showLegend={true}
                  showControls={true}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {safeT('poi.error', 'Erreur de chargement')}
                </h3>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                  {error instanceof Error ? error.message : safeT('poi.errorMessage', 'Impossible de charger les POI')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {!isInitialized && (
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
              <div>
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  {safeT('poi.initializing', 'Initialisation...')}
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                  {safeT('poi.initializingMessage', 'Préparation du stockage hors ligne')}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default POIMapPage;
