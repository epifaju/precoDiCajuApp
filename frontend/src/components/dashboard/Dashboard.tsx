import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { usePriceStats, usePrices } from '../../hooks/useApi';
import { StatsCard } from './StatsCard';
import { PriceChart } from '../charts/PriceChart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';

interface DashboardProps {
  className?: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ className }) => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [statsPeriod, setStatsPeriod] = useState(30);
  const [chartType, setChartType] = useState<'line' | 'bar' | 'doughnut'>('line');
  const [chartGroupBy, setChartGroupBy] = useState<'date' | 'region' | 'quality'>('date');

  // Fetch statistics
  const { data: stats, isLoading: statsLoading } = usePriceStats({ days: statsPeriod });
  
  // Fetch recent prices for charts
  const { data: pricesData, isLoading: pricesLoading } = usePrices({
    size: 50,
    sortBy: 'recordedDate',
    sortDir: 'desc',
  });

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
      {/* Welcome Section */}
      <div className="mb-8">
        {/* Mobile Layout: Stacked vertically */}
        <div className="block md:hidden">
          <div className="text-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {getGreeting()}, {user?.fullName?.split(' ')[0] || 'User'}! 👋
              </h1>
              <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed max-w-md mx-auto">
                {t('dashboard.welcome', 'Here\'s what\'s happening with cashew prices today.')}
              </p>
            </div>
            
            {/* Period Selector - Mobile */}
            <div className="flex flex-col items-center space-y-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('dashboard.period', 'Period')}:
              </span>
              <div className="flex items-center justify-center space-x-2">
                {[7, 30, 90].map((days) => (
                  <Button
                    key={days}
                    variant={statsPeriod === days ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setStatsPeriod(days)}
                    className="min-w-[60px] h-9 text-sm font-medium transition-all duration-200 hover:scale-105"
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Tablet/Desktop Layout: Side by side */}
        <div className="hidden md:flex items-start justify-between">
          <div className="flex-1 max-w-2xl">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white leading-tight">
              {getGreeting()}, {user?.fullName?.split(' ')[0] || 'User'}! 👋
            </h1>
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
              {t('dashboard.welcome', 'Here\'s what\'s happening with cashew prices today.')}
            </p>
          </div>
          
          {/* Period Selector - Desktop */}
          <div className="flex flex-col items-end space-y-3 ml-8">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('dashboard.period', 'Period')}:
            </span>
            <div className="flex items-center space-x-2">
              {[7, 30, 90].map((days) => (
                <Button
                  key={days}
                  variant={statsPeriod === days ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatsPeriod(days)}
                  className="min-w-[70px] h-10 text-sm font-medium transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-offset-2"
                >
                  {days}d
                </Button>
              ))}
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

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Price Trend Chart */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t('dashboard.priceTrends', 'Price Trends')}</CardTitle>
                  <CardDescription>
                    {t('dashboard.recentPriceMovements', 'Recent price movements across different periods')}
                  </CardDescription>
                </div>
                
                {/* Chart Controls */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Type:</span>
                    {(['line', 'bar'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={chartType === type ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setChartType(type)}
                        className="text-xs px-2 py-1"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <span className="text-xs text-gray-600 dark:text-gray-400">Group:</span>
                    {(['date', 'region', 'quality'] as const).map((group) => (
                      <Button
                        key={group}
                        variant={chartGroupBy === group ? 'primary' : 'ghost'}
                        size="sm"
                        onClick={() => setChartGroupBy(group)}
                        className="text-xs px-2 py-1"
                      >
                        {t(`dashboard.${group}`, group)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <PriceChart
                data={chartData}
                type={chartType}
                title=""
                groupBy={chartGroupBy}
                loading={pricesLoading}
                className="border-0 shadow-none"
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Regional Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriceChart
          data={chartData}
          type="doughnut"
          title={t('dashboard.regionalDistribution', 'Regional Distribution')}
          description={t('dashboard.pricesByRegion', 'Average prices by region')}
          groupBy="region"
          loading={pricesLoading}
        />

        <PriceChart
          data={chartData}
          type="bar"
          title={t('dashboard.qualityComparison', 'Quality Comparison')}
          description={t('dashboard.pricesByQuality', 'Average prices by quality grade')}
          groupBy="quality"
          loading={pricesLoading}
        />
      </div>

      {/* Recent Activity */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>{t('dashboard.recentActivity', 'Recent Price Updates')}</CardTitle>
          <CardDescription>
            {t('dashboard.latestPriceUpdates', 'Latest price updates from the community')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pricesLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg animate-pulse">
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
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {price.regionName.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {price.regionName} - {price.qualityName}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {t('dashboard.by', 'by')} {price.createdBy.fullName} • {new Date(price.recordedDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg text-gray-900 dark:text-white">
                      {formatCurrency(price.priceFcfa)}
                    </p>
                    {price.verified && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                        ✓ {t('dashboard.verified', 'Verified')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              {prices.length === 0 && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <p className="mt-2">
                    {t('dashboard.noPricesYet', 'No price data available yet')}
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};



