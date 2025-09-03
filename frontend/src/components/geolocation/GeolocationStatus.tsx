import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocationManager } from '../../hooks/geolocation';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';

export interface GeolocationStatusProps {
  onRefresh?: () => void;
  onRequestPermission?: () => void;
  className?: string;
  variant?: 'card' | 'inline' | 'compact';
  showActions?: boolean;
  showAccuracy?: boolean;
  showAddress?: boolean;
}

export const GeolocationStatus: React.FC<GeolocationStatusProps> = ({
  onRefresh,
  onRequestPermission,
  className,
  variant = 'card',
  showActions = true,
  showAccuracy = true,
  showAddress = true,
}) => {
  const { t } = useTranslation();
  const {
    coordinates,
    address,
    isLoading,
    error,
    isSupported,
    permission,
    accuracy,
    quality,
    isValid,
    isWithinBounds,
    getCurrentPosition,
    refreshPosition,
    requestPermission,
    clearError,
  } = useGeolocationManager();

  const handleRefresh = async () => {
    try {
      await refreshPosition();
      onRefresh?.();
    } catch (error) {
      console.error('Failed to refresh position:', error);
    }
  };

  const handleRequestPermission = async () => {
    try {
      await requestPermission();
      onRequestPermission?.();
    } catch (error) {
      console.error('Failed to request permission:', error);
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

  const getStatusColor = () => {
    if (error) return 'red';
    if (isLoading) return 'yellow';
    if (permission === 'denied') return 'red';
    if (permission === 'granted' && coordinates) return 'green';
    return 'gray';
  };

  const getStatusText = () => {
    if (error) return t('geolocation.status.error', 'Error');
    if (isLoading) return t('geolocation.status.loading', 'Loading...');
    if (permission === 'denied') return t('geolocation.status.denied', 'Access Denied');
    if (permission === 'granted' && coordinates) return t('geolocation.status.active', 'Active');
    if (permission === 'prompt') return t('geolocation.status.prompt', 'Permission Required');
    return t('geolocation.status.unknown', 'Unknown');
  };

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      case 'poor': return 'orange';
      case 'invalid': return 'red';
      default: return 'gray';
    }
  };

  const formatCoordinates = (coords: typeof coordinates) => {
    if (!coords) return null;
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
  };

  const formatAccuracy = (acc: number | null) => {
    if (!acc) return null;
    if (acc < 1000) return `${Math.round(acc)}m`;
    return `${(acc / 1000).toFixed(1)}km`;
  };

  const content = (
    <div className="space-y-4">
      {/* Status header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className={`w-3 h-3 rounded-full bg-${getStatusColor()}-500`}></div>
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {getStatusText()}
          </span>
          {coordinates && showAccuracy && (
            <Badge variant="outline" className={`text-${getQualityColor()}-600 border-${getQualityColor()}-200`}>
              {t(`geolocation.quality.${quality}`, quality)}
            </Badge>
          )}
        </div>
        
        {showActions && (
          <div className="flex items-center space-x-2">
            {permission === 'granted' && coordinates && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                loading={isLoading}
                disabled={isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
            )}
            
            {permission !== 'granted' && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleRequestPermission}
                loading={isLoading}
                disabled={isLoading}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearError}
              className="ml-2"
            >
              {t('geolocation.dismiss', 'Dismiss')}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Location details */}
      {coordinates && (
        <div className="space-y-3">
          {/* Coordinates */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('geolocation.coordinates', 'Coordinates')}:
            </span>
            <span className="font-mono text-gray-900 dark:text-white">
              {formatCoordinates(coordinates)}
            </span>
          </div>

          {/* Accuracy */}
          {showAccuracy && accuracy && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.accuracy', 'Accuracy')}:
              </span>
              <span className="text-gray-900 dark:text-white">
                {formatAccuracy(accuracy)}
              </span>
            </div>
          )}

          {/* Address */}
          {showAddress && address && (
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.address', 'Address')}:
              </span>
              <span className="text-gray-900 dark:text-white text-right max-w-xs">
                {address}
              </span>
            </div>
          )}

          {/* Validation status */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('geolocation.validation', 'Validation')}:
            </span>
            <div className="flex items-center space-x-2">
              <Badge variant={isValid ? 'default' : 'destructive'}>
                {isValid ? t('geolocation.valid', 'Valid') : t('geolocation.invalid', 'Invalid')}
              </Badge>
              <Badge variant={isWithinBounds ? 'default' : 'destructive'}>
                {isWithinBounds ? t('geolocation.inBounds', 'In Bounds') : t('geolocation.outOfBounds', 'Out of Bounds')}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Permission status */}
      {!coordinates && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {permission === 'denied' && (
            <p>{t('geolocation.permissionDenied.message', 'Location access was denied. Please enable it in your browser settings.')}</p>
          )}
          {permission === 'prompt' && (
            <p>{t('geolocation.permissionPrompt.message', 'Click the button above to enable location access.')}</p>
          )}
        </div>
      )}
    </div>
  );

  // Render based on variant
  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        <div className={`w-2 h-2 rounded-full bg-${getStatusColor()}-500`}></div>
        <span className="text-gray-600 dark:text-gray-400">
          {t('geolocation.status', 'Location')}:
        </span>
        <span className="text-gray-900 dark:text-white">
          {getStatusText()}
        </span>
        {coordinates && showAccuracy && (
          <Badge variant="outline" size="sm">
            {formatAccuracy(accuracy)}
          </Badge>
        )}
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
          {t('geolocation.statusCard.title', 'Location Status')}
        </CardTitle>
        <CardDescription>
          {t('geolocation.statusCard.description', 'Current GPS location and accuracy information')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

