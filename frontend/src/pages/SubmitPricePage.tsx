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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('submission.title', 'Submit Cashew Price')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('submission.description', 'Share current cashew prices to help the community stay informed about market conditions.')}
          </p>
          
          {/* User Info */}
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="text-sm font-medium text-blue-900 dark:text-blue-300">
                  {t('submission.submittingAs', 'Submitting as')} {user?.fullName}
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  {t('submission.reputation', 'Reputation')}: {user?.reputationScore || 0} {t('submission.points', 'points')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <PriceSubmissionForm />

        {/* Tips */}
        <div className="mt-8 bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
            💡 {t('submission.tips.title', 'Tips for Accurate Price Reporting')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('submission.tips.current', 'Report current prices you\'ve recently observed')}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('submission.tips.accurate', 'Be as accurate as possible with quantities and quality')}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('submission.tips.location', 'Include specific location information when possible')}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('submission.tips.photo', 'Photos help verify price information')}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('submission.tips.notes', 'Add notes about market conditions or quality observations')}</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <span>{t('submission.tips.verification', 'Verified prices earn more reputation points')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitPricePage;