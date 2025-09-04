import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../store/authStore';
import { PriceSubmissionForm } from '../components/forms/PriceSubmissionForm';

const SubmitPricePage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header - Enhanced Mobile Responsiveness */}
        <div className="mb-6 sm:mb-8">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="text-center space-y-4 sm:space-y-6">
              {/* Title Card */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-sm border border-green-100 dark:border-gray-600">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                  {t('submission.title', 'Submit Cashew Price')}
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-2 leading-relaxed">
                  {t('submission.description', 'Share current cashew prices to help the community stay informed about market conditions.')}
                </p>
              </div>
              
              {/* User Info Card */}
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 mx-2 sm:mx-4 border border-blue-100 dark:border-gray-600">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                    {user?.fullName?.charAt(0) || 'U'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-300 truncate">
                      {t('submission.submittingAs', 'Submitting as')} {user?.fullName}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-400">
                      {t('submission.reputation', 'Reputation')}: {user?.reputationScore || 0} {t('submission.points', 'points')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {t('submission.title', 'Submit Cashew Price')}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-3 max-w-3xl">
              {t('submission.description', 'Share current cashew prices to help the community stay informed about market conditions.')}
            </p>
            
            {/* User Info */}
            <div className="mt-6 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-gray-600">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {user?.fullName?.charAt(0) || 'U'}
                </div>
                <div>
                  <p className="text-base font-medium text-blue-900 dark:text-blue-300">
                    {t('submission.submittingAs', 'Submitting as')} {user?.fullName}
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-400">
                    {t('submission.reputation', 'Reputation')}: {user?.reputationScore || 0} {t('submission.points', 'points')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="price-submission-form">
          <PriceSubmissionForm />
        </div>

        {/* Tips - Enhanced Mobile Responsiveness */}
        <div className="price-submission-tips mt-6 sm:mt-8">
          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-gray-800 dark:to-gray-700 rounded-2xl p-4 sm:p-6 mx-2 sm:mx-4 shadow-sm border border-amber-100 dark:border-gray-600">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
                💡 {t('submission.tips.title', 'Tips for Accurate Price Reporting')}
              </h3>
              
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.current', 'Report current prices you\'ve recently observed')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.accurate', 'Be as accurate as possible with quantities and quality')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.location', 'Include specific location information when possible')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.photo', 'Photos help verify price information')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.notes', 'Add notes about market conditions or quality observations')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.verification', 'Verified prices earn more reputation points')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop Layout */}
          <div className="hidden md:block bg-gray-50 dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              💡 {t('submission.tips.title', 'Tips for Accurate Price Reporting')}
            </h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm text-gray-600 dark:text-gray-400">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.current', 'Report current prices you\'ve recently observed')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.accurate', 'Be as accurate as possible with quantities and quality')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.location', 'Include specific location information when possible')}</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.photo', 'Photos help verify price information')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.notes', 'Add notes about market conditions or quality observations')}</span>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                  <span>{t('submission.tips.verification', 'Verified prices earn more reputation points')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPricePage;