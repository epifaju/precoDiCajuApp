import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocationPermission } from '../../hooks/geolocation';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';

export interface GeolocationPermissionProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onPermissionRequested?: () => void;
  className?: string;
  variant?: 'card' | 'inline' | 'modal';
  showBenefits?: boolean;
  showInstructions?: boolean;
}

export const GeolocationPermission: React.FC<GeolocationPermissionProps> = ({
  onPermissionGranted,
  onPermissionDenied,
  onPermissionRequested,
  className,
  variant = 'card',
  showBenefits = true,
  showInstructions = true,
}) => {
  const { t } = useTranslation();
  const { permission, isLoading, error, requestPermission, isSupported } = useGeolocationPermission();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleRequestPermission = async () => {
    if (onPermissionRequested) {
      onPermissionRequested();
    }

    setIsRequesting(true);
    try {
      const result = await requestPermission();
      
      if (result === 'granted') {
        onPermissionGranted?.();
      } else {
        onPermissionDenied?.();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      onPermissionDenied?.();
    } finally {
      setIsRequesting(false);
    }
  };

  // Don't show if not supported
  if (!isSupported) {
    return (
      <Alert className={className}>
        <AlertDescription>
          {t('geolocation.notSupported', 'Geolocation is not supported by this browser')}
        </AlertDescription>
      </Alert>
    );
  }

  // Don't show if already granted
  if (permission === 'granted') {
    return null;
  }

  // Don't show if denied and no instructions
  if (permission === 'denied' && !showInstructions) {
    return null;
  }

  const content = (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {t('geolocation.permissionError', 'Error checking permissions: {{error}}', { error })}
          </AlertDescription>
        </Alert>
      )}

      {/* Benefits section */}
      {showBenefits && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.benefits.title', 'Why enable location access?')}
          </h4>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('geolocation.benefits.autoLocation', 'Automatically fill in your location when submitting prices')}
            </li>
            <li className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('geolocation.benefits.nearbyPrices', 'See prices from nearby locations on the map')}
            </li>
            <li className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('geolocation.benefits.accuracy', 'Improve price accuracy with precise location data')}
            </li>
            <li className="flex items-start">
              <svg className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              {t('geolocation.benefits.community', 'Help the community by sharing accurate location data')}
            </li>
          </ul>
        </div>
      )}

      {/* Instructions for denied permission */}
      {permission === 'denied' && showInstructions && (
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <p className="font-medium">
                {t('geolocation.permissionDenied.title', 'Location access was denied')}
              </p>
              <p className="text-sm">
                {t('geolocation.permissionDenied.instructions', 'To enable location access:')}
              </p>
              <ol className="text-sm list-decimal list-inside space-y-1 ml-2">
                <li>{t('geolocation.permissionDenied.step1', 'Click the location icon in your browser\'s address bar')}</li>
                <li>{t('geolocation.permissionDenied.step2', 'Select "Allow" for location access')}</li>
                <li>{t('geolocation.permissionDenied.step3', 'Refresh the page')}</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Request button */}
      {permission !== 'denied' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleRequestPermission}
            loading={isLoading || isRequesting}
            disabled={isLoading || isRequesting}
            className="flex-1"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {t('geolocation.requestPermission', 'Enable Location Access')}
          </Button>
          
          <Button
            variant="outline"
            onClick={onPermissionDenied}
            className="flex-1"
          >
            {t('geolocation.skip', 'Skip for now')}
          </Button>
        </div>
      )}

      {/* Privacy note */}
      <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <p>
          {t('geolocation.privacy.note', 'Your location data is only used to improve price accuracy and is not shared with third parties. You can disable location access at any time in your browser settings.')}
        </p>
      </div>
    </div>
  );

  // Render based on variant
  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  if (variant === 'modal') {
    return (
      <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 ${className}`}>
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {t('geolocation.permissionModal.title', 'Enable Location Access')}
              </h3>
              <button
                onClick={onPermissionDenied}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Default card variant
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {t('geolocation.permissionCard.title', 'Location Access Required')}
        </CardTitle>
        <CardDescription>
          {t('geolocation.permissionCard.description', 'Enable location access to automatically fill in your location when submitting prices and see nearby prices on the map.')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};
