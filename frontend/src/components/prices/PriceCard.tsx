import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';
import { SparklineChart, SparklineDataPoint } from '../charts/SparklineChart';
import { usePriceHistory } from '../../hooks/useApi';

interface PriceCardProps {
  price: any;
  viewMode: 'list' | 'grid';
  onLocationClick: (lat: number, lng: number, sourceName?: string) => void;
}

export const PriceCard: React.FC<PriceCardProps> = ({ price, viewMode, onLocationClick }) => {
  const { t } = useTranslation();
  
  // Récupérer l'historique des prix pour les sparklines
  const { data: priceHistory, isLoading: historyLoading } = usePriceHistory(
    price.region, 
    price.quality, 
    30 // 30 derniers jours
  );

  // Transformer les données pour le graphique sparkline
  const sparklineData: SparklineDataPoint[] = priceHistory?.map(p => ({
    date: p.recordedDate,
    price: p.priceFcfa
  })) || [];

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

  return (
    <div
      className={`border border-gray-200 dark:border-gray-700 rounded-lg p-5 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-md dark:hover:shadow-lg ${
        viewMode === 'grid' ? 'h-full flex flex-col' : ''
      }`}
    >
      <div className={`${viewMode === 'grid' ? 'flex flex-col h-full' : 'flex items-center justify-between'}`}>
        <div className={`flex items-center space-x-3 sm:space-x-4 min-w-0 ${viewMode === 'grid' ? 'flex-col text-center space-y-3 sm:space-y-4' : 'flex-1'}`}>
          {/* Avatar */}
          <div className={`bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 shadow-sm ${
            viewMode === 'grid' ? 'h-16 w-16 sm:h-20 sm:w-20 mx-auto' : 'h-12 w-12 sm:h-14 sm:w-14'
          }`}>
            <span className={`${viewMode === 'grid' ? 'text-lg sm:text-xl' : 'text-sm sm:text-base'}`}>
              {price.regionName.charAt(0)}
            </span>
          </div>

          {/* Price Info */}
          <div className={`min-w-0 ${viewMode === 'grid' ? 'flex-1 text-center' : 'flex-1'}`}>
            <div className={`flex items-center ${viewMode === 'grid' ? 'justify-center' : 'justify-start'} space-x-2 flex-wrap`}>
              <h3 className={`font-bold text-gray-900 dark:text-white ${
                viewMode === 'grid' ? 'text-xl sm:text-2xl' : 'text-lg sm:text-xl'
              }`}>
                {formatCurrency(price.priceFcfa)}
              </h3>
              {price.verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {t('prices.verified', 'Verified')}
                </span>
              )}
            </div>
            
            <div className={`mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 ${
              viewMode === 'grid' ? 'text-center' : ''
            }`}>
              <span className="font-semibold text-gray-900 dark:text-white">{price.regionName}</span>
              <span className="text-gray-500 dark:text-gray-500"> • </span>
              <span className="font-medium">{price.qualityName}</span>
              {price.sourceName && (
                <>
                  <span className="text-gray-500 dark:text-gray-500"> • </span>
                  <span className="text-gray-600 dark:text-gray-400">{price.sourceName}</span>
                </>
              )}
            </div>
            
            <div className={`mt-2 text-xs sm:text-sm text-gray-500 dark:text-gray-500 ${
              viewMode === 'grid' ? 'text-center' : ''
            }`}>
              <span className="font-medium">{t('prices.recordedOn', 'Recorded on')}</span> {formatDate(price.recordedDate)}
              <span className="text-gray-400 dark:text-gray-600"> • </span>
              <span className="font-medium">{t('prices.by', 'by')}</span> {price.createdBy.fullName}
            </div>
            
            {/* Sparkline Chart */}
            {sparklineData.length > 0 && (
              <div className={`mt-4 ${viewMode === 'grid' ? 'flex justify-center' : ''}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {t('prices.trend30Days', '30-day trend')}:
                  </span>
                  <SparklineChart 
                    data={sparklineData}
                    width={viewMode === 'grid' ? 140 : 120}
                    height={viewMode === 'grid' ? 40 : 35}
                    showTrend={true}
                    className="flex-shrink-0"
                  />
                </div>
              </div>
            )}
            
            {/* Loading state for sparkline */}
            {historyLoading && (
              <div className={`mt-4 ${viewMode === 'grid' ? 'flex justify-center' : ''}`}>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {t('prices.trend30Days', '30-day trend')}:
                  </span>
                  <div className={`${viewMode === 'grid' ? 'w-32 h-8' : 'w-28 h-7'} bg-gray-200 dark:bg-gray-700 rounded animate-pulse`}></div>
                </div>
              </div>
            )}
            
            {price.notes && (
              <div className={`mt-3 text-sm text-gray-600 dark:text-gray-400 italic ${
                viewMode === 'grid' ? 'text-center' : ''
              }`}>
                <span className="text-gray-500 dark:text-gray-500">"</span>
                {price.notes}
                <span className="text-gray-500 dark:text-gray-500">"</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className={`flex items-center justify-center space-x-2 flex-shrink-0 ${
          viewMode === 'grid' ? 'mt-4 sm:mt-6' : ''
        }`}>
          {price.photoUrl && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={t('prices.viewPhoto', 'View photo')}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Button>
          )}
          
          {(price.gpsLat && price.gpsLng) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onLocationClick(price.gpsLat!, price.gpsLng!, price.sourceName)}
              title={t('prices.openInMaps', 'Open location in maps')}
              className="p-2 h-10 w-10 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

