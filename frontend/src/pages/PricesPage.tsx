import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { PriceList } from '../components/prices/PriceList';

const PricesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      {/* Header - Enhanced Mobile Responsiveness */}
      <div className="mb-6 sm:mb-8">
        {/* Mobile Layout */}
        <div className="block md:hidden">
          <div className="text-center space-y-4 sm:space-y-6">
            {/* Title Card */}
            <div className="prices-header-card bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-sm border border-green-100 dark:border-gray-600">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {t('prices.title', 'Prix du Cajou')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                {t('prices.description', 'Naviguez et recherchez les prix actuels du cajou de toute la Guinée-Bissau')}
              </p>
            </div>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
            {t('prices.title', 'Prix du Cajou')}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 max-w-3xl">
            {t('prices.description', 'Naviguez et recherchez les prix actuels du cajou de toute la Guinée-Bissau')}
          </p>
        </div>
      </div>

      <PriceList />
    </div>
  );
};

export default PricesPage;