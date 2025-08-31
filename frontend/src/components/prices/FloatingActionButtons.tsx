import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

interface FloatingActionButtonsProps {
  className?: string;
}

export const FloatingActionButtons: React.FC<FloatingActionButtonsProps> = ({ className = '' }) => {
  const { t } = useTranslation();

  return (
    <div className={`fixed bottom-6 right-6 z-50 sm:hidden ${className}`}>
      <div className="flex flex-col gap-3">
        {/* Submit Price Button */}
        <Link to="/submit">
          <Button
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700"
            title={t('prices.submit', 'Submit Price')}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </Button>
        </Link>

        {/* Map View Button */}
        <Link to="/map">
          <Button
            variant="outline"
            className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600"
            title={t('prices.mapView', 'Map View')}
          >
            <svg className="w-6 h-6 text-gray-700 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
          </Button>
        </Link>
      </div>
    </div>
  );
};

