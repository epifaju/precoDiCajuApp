import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { usePriceStats, usePrices } from '../../hooks/useApi';
import { useStatsUpdates, useWebSocket } from '../../hooks/useWebSocket';
import { webSocketService } from '../../services/WebSocketService';
import { StatsCard } from './StatsCard';
import { PriceChart } from '../charts/PriceChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Wifi, WifiOff } from 'lucide-react';

interface DashboardProps {
  className?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [statsPeriod, setStatsPeriod] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line');
  const [chartGroupBy, setChartGroupBy] = useState<'date' | 'region' | 'quality'>('date');

  // WebSocket connection state
  const { isConnected, isConnecting, error } = useWebSocket();

  // Fetch statistics
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = usePriceStats({ days: statsPeriod });
  
  // Fetch recent prices for charts
  const { data: pricesData, isLoading: pricesLoading, refetch: refetchPrices } = usePrices({
    size: 50,
    sortBy: 'recordedDate',
    sortDir: 'desc',
  });

  // Subscribe to stats updates via WebSocket
  useStatsUpdates((updatedStats) => {
    // Refetch stats when WebSocket update is received
    refetchStats();
  });

  // Subscribe to stats updates when component mounts
  useEffect(() => {
    if (isConnected) {
      webSocketService.subscribeToStats();
    }
  }, [isConnected]);

  const prices = pricesData?.content || [];

  // Transform prices data for charts
  const chartData = prices.map(price => ({
    date: price.recordedDate,
    price: price.priceFcfa,
    region: price.regionName,
    quality: price.qualityName,
  }));

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('dashboard.goodMorning', 'Good morning');
    if (hour < 17) return t('dashboard.goodAfternoon', 'Good afternoon');
    return t('dashboard.goodEvening', 'Good evening');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-GW', {
      style: 'currency',
      currency: 'XOF', // West African CFA franc
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value).replace('FCFA', 'FCFA');
  };

  const calculateTrend = (current: number, previous: number) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      label: t('dashboard.vs30Days', 'vs last 30 days'),
    };
  };

  return (
    <div className={className}>
      {/* WebSocket Connection Status - Mobile Optimized */}
      <div className="mb-4 sm:mb-6 flex justify-center sm:justify-end">
        <div className="flex items-center space-x-2 text-xs sm:text-sm px-3 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          {isConnected ? (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <Wifi className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">{t('websocket.connected', 'Temps réel actif')}</span>
              <span className="sm:hidden">En ligne</span>
            </div>
          ) : isConnecting ? (
            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
              <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-yellow-600 mr-1 sm:mr-2 flex-shrink-0"></div>
              <span className="hidden sm:inline">{t('websocket.connecting', 'Connexion...')}</span>
              <span className="sm:hidden">Connexion...</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <WifiOff className="h-3 w-3 sm:h-4 sm:w-4 mr-1 flex-shrink-0" />
              <span className="hidden sm:inline">{t('websocket.disconnected', 'Hors ligne')}</span>
              <span className="sm:hidden">Hors ligne</span>
            </div>
          )}
        </div>
      </div>

      {/* Welcome Section - Enhanced Mobile Responsiveness */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile Layout: Enhanced stacked layout */}
        <div className="block md:hidden">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Greeting Card */}
            <div className="dashboard-greeting-card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-sm border border-blue-100 dark:border-gray-600">
              <div className="space-y-3 sm:space-y-4">
                <h1 className="dashboard-greeting-text text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  <span className="block sm:inline">
                    {getGreeting()}, 
                  </span>
                  <span className="block sm:inline sm:ml-1 text-blue-600 dark:text-blue-400">
                    {user?.fullName?.split(' ')[0] || 'User'}! 👋
                  </span>
                </h1>
                <p className="dashboard-greeting-text text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed max-w-sm sm:max-w-md mx-auto">
                  {t('dashboard.welcome', 'Here\'s what\'s happening with cashew prices today.')}
                </p>
              </div>
            </div>
            
            {/* Period Selector - Enhanced Mobile */}
            <div className="dashboard-period-selector flex flex-col items-center space-y-3 px-4">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('dashboard.period', 'Period')}:
              </span>
              <div className="flex items-center justify-center space-x-2 w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl p-2 shadow-sm border border-gray-200 dark:border-gray-700">
                {[7, 30, 90].map((days) => (
                  <Button
                    key={days}
                    variant={statsPeriod === days ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setStatsPeriod(days)}
                    className={`dashboard-period-button flex-1 min-w-[60px] h-10 text-sm font-medium transition-all duration-200 hover:scale-105 touch-manipulation ${
                      statsPeriod === days 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tablet/Desktop Layout: Enhanced side by side */}
        <div className="hidden md:flex items-start justify-between">
          <div className="flex-1 max-w-2xl">
            {/* Greeting Card for Tablet/Desktop */}
            <div className="dashboard-greeting-card bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-6 lg:p-8 shadow-sm border border-blue-100 dark:border-gray-600">
              <h1 className="dashboard-greeting-text text-2xl lg:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
                <span className="block lg:inline">
                  {getGreeting()}, 
                </span>
                <span className="block lg:inline lg:ml-1 text-blue-600 dark:text-blue-400">
                  {user?.fullName?.split(' ')[0] || 'User'}! 👋
                </span>
              </h1>
              <p className="dashboard-greeting-text text-base lg:text-lg xl:text-xl text-gray-600 dark:text-gray-400 mt-3 leading-relaxed">
                {t('dashboard.welcome', 'Here\'s what\'s happening with cashew prices today.')}
              </p>
            </div>
          </div>
          
          {/* Period Selector - Enhanced Desktop */}
          <div className="dashboard-period-selector flex flex-col items-end space-y-4 ml-6 lg:ml-8">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">
                {t('dashboard.period', 'Period')}:
              </span>
              <div className="flex items-center space-x-2">
                {[7, 30, 90].map((days) => (
                  <Button
                    key={days}
                    variant={statsPeriod === days ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setStatsPeriod(days)}
                    className={`dashboard-period-button min-w-[60px] lg:min-w-[70px] h-9 lg:h-10 text-sm font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2 touch-manipulation ${
                      statsPeriod === days 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          title={t('dashboard.totalPrices', 'Total Price Records')}
          value={stats?.totalPrices || 0}
          subtitle={t('dashboard.inLast', 'in last') + ` ${statsPeriod} ` + t('dashboard.days', 'days')}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          loading={statsLoading}
        />

        <StatsCard
          title={t('dashboard.averagePrice', 'Average Price')}
          value={stats?.averagePrice ? formatCurrency(stats.averagePrice) : 'N/A'}
          subtitle={t('dashboard.acrossAllRegions', 'across all regions')}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          }
          loading={statsLoading}
        />

        <StatsCard
          title={t('dashboard.priceRange', 'Price Range')}
          value={stats ? `${formatCurrency(stats.minPrice)} - ${formatCurrency(stats.maxPrice)}` : 'N/A'}
          subtitle={t('dashboard.minMaxPrices', 'minimum to maximum prices')}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
          loading={statsLoading}
        />

        <StatsCard
          title={t('dashboard.verifiedPrices', 'Verified Prices')}
          value={`${stats?.verifiedPrices || 0}/${stats?.totalPrices || 0}`}
          subtitle={`${stats?.totalPrices ? Math.round((stats.verifiedPrices / stats.totalPrices) * 100) : 0}% ${t('dashboard.verified', 'verified')}`}
          icon={
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          loading={statsLoading}
        />
      </div>

      {/* Charts Section - Enhanced Mobile Responsiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Price Trend Chart */}
        <div className="lg:col-span-2">
          <Card className="dashboard-trends-card">
            <CardHeader className="pb-4 px-4 sm:px-6 lg:px-8">
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="text-center space-y-4">
                  {/* Title Card */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mx-2 shadow-sm border border-green-100 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('dashboard.priceTrends', 'Tendances des Prix')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('dashboard.recentPriceMovements', 'Mouvements récents des prix sur différentes périodes')}
                    </p>
                  </div>
                  
                  {/* Chart Controls - Mobile */}
                  <div className="space-y-3">
                    {/* Type Controls */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2 text-center">
                        {t('dashboard.chartType', 'Type de graphique')}:
                      </span>
                      <div className="flex items-center justify-center space-x-2">
                        {(['line', 'bar'] as const).map((type) => (
                          <Button
                            key={type}
                            variant={chartType === type ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setChartType(type)}
                            className={`dashboard-chart-button flex-1 min-w-[60px] h-10 text-sm font-medium transition-all duration-200 hover:scale-105 touch-manipulation ${
                              chartType === type 
                                ? 'bg-green-600 text-white shadow-md' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {type === 'line' ? t('dashboard.line', 'Ligne') : t('dashboard.bar', 'Barres')}
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Group Controls */}
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-3 shadow-sm border border-gray-200 dark:border-gray-700">
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 block mb-2 text-center">
                        {t('dashboard.groupBy', 'Grouper par')}:
                      </span>
                      <div className="flex items-center justify-center space-x-2">
                        {(['date', 'region', 'quality'] as const).map((group) => (
                          <Button
                            key={group}
                            variant={chartGroupBy === group ? 'primary' : 'ghost'}
                            size="sm"
                            onClick={() => setChartGroupBy(group)}
                            className={`dashboard-chart-button flex-1 min-w-[60px] h-10 text-sm font-medium transition-all duration-200 hover:scale-105 touch-manipulation ${
                              chartGroupBy === group 
                                ? 'bg-blue-600 text-white shadow-md' 
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                            }`}
                          >
                            {t(`dashboard.${group}`, group === 'date' ? 'Date' : group === 'region' ? 'Région' : 'Qualité')}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl lg:text-2xl font-bold text-gray-900 dark:text-white">
                    {t('dashboard.priceTrends', 'Tendances des Prix')}
                  </CardTitle>
                  <CardDescription className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                    {t('dashboard.recentPriceMovements', 'Mouvements récents des prix sur différentes périodes')}
                  </CardDescription>
                </div>
                
                {/* Chart Controls - Desktop */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {t('dashboard.chartType', 'Type')}:
                    </span>
                    {(['line', 'bar'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={chartType === type ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setChartType(type)}
                        className={`dashboard-chart-button min-w-[60px] h-9 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          chartType === type 
                            ? 'bg-green-600 text-white shadow-md' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {type === 'line' ? t('dashboard.line', 'Ligne') : t('dashboard.bar', 'Barres')}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                      {t('dashboard.groupBy', 'Grouper')}:
                    </span>
                    {(['date', 'region', 'quality'] as const).map((group) => (
                      <Button
                        key={group}
                        variant={chartGroupBy === group ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setChartGroupBy(group)}
                        className={`dashboard-chart-button min-w-[60px] h-9 text-sm font-medium transition-all duration-200 hover:scale-105 ${
                          chartGroupBy === group 
                            ? 'bg-blue-600 text-white shadow-md' 
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {t(`dashboard.${group}`, group === 'date' ? 'Date' : group === 'region' ? 'Région' : 'Qualité')}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="dashboard-chart-container">
                <PriceChart
                  data={chartData}
                  type={chartType}
                  title=""
                  groupBy={chartGroupBy}
                  loading={pricesLoading}
                  className="border-0 shadow-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Regional Distribution - Enhanced Mobile Responsiveness */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Distribution Chart */}
        <div className="dashboard-distribution-card">
          <Card className="h-full">
            <CardHeader className="pb-4 px-4 sm:px-6 lg:px-8">
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="text-center space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mx-2 shadow-sm border border-purple-100 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('dashboard.regionalDistribution', 'Distribution Régionale')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('dashboard.pricesByRegion', 'Prix moyens par région')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block">
                <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.regionalDistribution', 'Distribution Régionale')}
                </CardTitle>
                <CardDescription className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {t('dashboard.pricesByRegion', 'Prix moyens par région')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="dashboard-chart-container">
                <PriceChart
                  data={chartData}
                  type="doughnut"
                  title=""
                  groupBy="region"
                  loading={pricesLoading}
                  className="border-0 shadow-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Comparison Chart */}
        <div className="dashboard-quality-card">
          <Card className="h-full">
            <CardHeader className="pb-4 px-4 sm:px-6 lg:px-8">
              {/* Mobile Layout */}
              <div className="block md:hidden">
                <div className="text-center space-y-3">
                  <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mx-2 shadow-sm border border-orange-100 dark:border-gray-600">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {t('dashboard.qualityComparison', 'Comparaison Qualité')}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {t('dashboard.pricesByQuality', 'Prix moyens par grade de qualité')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:block">
                <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
                  {t('dashboard.qualityComparison', 'Comparaison Qualité')}
                </CardTitle>
                <CardDescription className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {t('dashboard.pricesByQuality', 'Prix moyens par grade de qualité')}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="dashboard-chart-container">
                <PriceChart
                  data={chartData}
                  type="bar"
                  title=""
                  groupBy="quality"
                  loading={pricesLoading}
                  className="border-0 shadow-none"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Activity - Enhanced Mobile Responsiveness */}
      <Card className="mt-8 dashboard-activity-card">
        <CardHeader className="pb-4 px-4 sm:px-6 lg:px-8">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="text-center space-y-3">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 mx-2 shadow-sm border border-gray-200 dark:border-gray-600">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  {t('dashboard.recentActivity', 'Activité Récente')}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {t('dashboard.latestPriceUpdates', 'Dernières mises à jour de prix de la communauté')}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <CardTitle className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">
              {t('dashboard.recentActivity', 'Activité Récente')}
            </CardTitle>
            <CardDescription className="text-sm lg:text-base text-gray-600 dark:text-gray-400 mt-1">
              {t('dashboard.latestPriceUpdates', 'Dernières mises à jour de prix de la communauté')}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-4 sm:px-6 lg:px-8">
          {pricesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl animate-pulse bg-white dark:bg-gray-800 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                    <div className="space-y-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                    </div>
                  </div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {prices.slice(0, 5).map((price) => (
                <div 
                  key={price.id} 
                  className="dashboard-activity-item flex items-center justify-between p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                      {price.regionName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                        {price.regionName} - {price.qualityName}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                        {t('dashboard.by', 'par')} {price.createdBy.fullName} • {new Date(price.recordedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-bold text-sm sm:text-lg text-gray-900 dark:text-white">
                      {formatCurrency(price.priceFcfa)}
                    </p>
                    {price.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 mt-1">
                        ✓ {t('dashboard.verified', 'Vérifié')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {prices.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-8 mx-2 shadow-sm border border-gray-200 dark:border-gray-600">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="mt-2 text-sm sm:text-base">
                      {t('dashboard.noPricesYet', 'Aucune donnée de prix disponible pour le moment')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



