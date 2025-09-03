import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useGeolocationManager } from '../../hooks/geolocation';
import { GpsCoordinates } from '../../types/api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';

export interface GeolocationInputProps {
  value?: GpsCoordinates | null;
  onChange?: (coordinates: GpsCoordinates | null) => void;
  onAddressChange?: (address: string | null) => void;
  className?: string;
  variant?: 'card' | 'inline' | 'minimal';
  showAddress?: boolean;
  showAccuracy?: boolean;
  showValidation?: boolean;
  autoGetLocation?: boolean;
  requirePermission?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  helpText?: string;
  error?: string;
}

export const GeolocationInput: React.FC<GeolocationInputProps> = ({
  value,
  onChange,
  onAddressChange,
  className,
  variant = 'inline',
  showAddress = true,
  showAccuracy = true,
  showValidation = true,
  autoGetLocation = false,
  requirePermission = true,
  disabled = false,
  placeholder,
  label,
  helpText,
  error,
}) => {
  const { t } = useTranslation();
  const {
    coordinates,
    address,
    isLoading,
    error: gpsError,
    isSupported,
    permission,
    accuracy,
    quality,
    isValid,
    isWithinBounds,
    getCurrentPosition,
    getAddress,
    clearError,
  } = useGeolocationManager({
    autoGeocode: showAddress,
    requirePermission,
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [manualAddress, setManualAddress] = useState('');

  // Update manual inputs when value changes
  useEffect(() => {
    if (value) {
      setManualLat(value.latitude.toString());
      setManualLng(value.longitude.toString());
    } else {
      setManualLat('');
      setManualLng('');
    }
  }, [value]);

  // Update manual address when address changes
  useEffect(() => {
    if (address) {
      setManualAddress(address);
    }
  }, [address]);

  // Auto-get location on mount if enabled
  useEffect(() => {
    if (autoGetLocation && isSupported && permission === 'granted' && !value) {
      handleGetCurrentLocation();
    }
  }, [autoGetLocation, isSupported, permission, value]);

  const handleGetCurrentLocation = async () => {
    if (disabled) return;

    setIsGettingLocation(true);
    try {
      const coords = await getCurrentPosition();
      onChange?.(coords);
      
      if (showAddress) {
        setIsGettingAddress(true);
        try {
          const addr = await getAddress(coords);
          setManualAddress(addr);
          onAddressChange?.(addr);
        } catch (error) {
          console.warn('Failed to get address:', error);
        } finally {
          setIsGettingAddress(false);
        }
      }
    } catch (error) {
      console.error('Failed to get location:', error);
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleManualLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lat = e.target.value;
    setManualLat(lat);
    
    if (lat && manualLng) {
      const coordinates: GpsCoordinates = {
        latitude: parseFloat(lat),
        longitude: parseFloat(manualLng),
      };
      onChange?.(coordinates);
    } else if (!lat && !manualLng) {
      onChange?.(null);
    }
  };

  const handleManualLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const lng = e.target.value;
    setManualLng(lng);
    
    if (manualLat && lng) {
      const coordinates: GpsCoordinates = {
        latitude: parseFloat(manualLat),
        longitude: parseFloat(lng),
      };
      onChange?.(coordinates);
    } else if (!manualLat && !lng) {
      onChange?.(null);
    }
  };

  const handleManualAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const addr = e.target.value;
    setManualAddress(addr);
    onAddressChange?.(addr || null);
  };

  const getQualityColor = () => {
    if (!value) return 'gray';
    switch (quality) {
      case 'excellent': return 'green';
      case 'good': return 'blue';
      case 'fair': return 'yellow';
      case 'poor': return 'orange';
      case 'invalid': return 'red';
      default: return 'gray';
    }
  };

  const formatAccuracy = (acc: number | null) => {
    if (!acc) return null;
    if (acc < 1000) return `${Math.round(acc)}m`;
    return `${(acc / 1000).toFixed(1)}km`;
  };

  const content = (
    <div className="space-y-4">
      {/* Error message */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {gpsError && (
        <Alert variant="destructive">
          <AlertDescription className="flex items-center justify-between">
            <span>{gpsError}</span>
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

      {/* Get current location button */}
      {isSupported && (
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            loading={isGettingLocation}
            disabled={disabled || isGettingLocation}
            className="flex-1"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {isGettingLocation 
              ? t('geolocation.gettingLocation', 'Getting Location...')
              : t('geolocation.getCurrentLocation', 'Get Current Location')
            }
          </Button>
          
          {permission === 'denied' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                // This will trigger the browser's permission dialog
                handleGetCurrentLocation();
              }}
              disabled={disabled}
            >
              {t('geolocation.enablePermission', 'Enable')}
            </Button>
          )}
        </div>
      )}

      {/* Manual coordinates input */}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('geolocation.latitude', 'Latitude')}
          type="number"
          step="any"
          placeholder="11.8637"
          value={manualLat}
          onChange={handleManualLatChange}
          disabled={disabled}
          error={error}
        />
        <Input
          label={t('geolocation.longitude', 'Longitude')}
          type="number"
          step="any"
          placeholder="-15.5983"
          value={manualLng}
          onChange={handleManualLngChange}
          disabled={disabled}
          error={error}
        />
      </div>

      {/* Address input */}
      {showAddress && (
        <Input
          label={t('geolocation.address', 'Address (Optional)')}
          placeholder={t('geolocation.addressPlaceholder', 'Enter address or let GPS fill it automatically')}
          value={manualAddress}
          onChange={handleManualAddressChange}
          disabled={disabled || isGettingAddress}
          helpText={isGettingAddress ? t('geolocation.gettingAddress', 'Getting address...') : undefined}
        />
      )}

      {/* Status information */}
      {value && (
        <div className="space-y-2">
          {/* Accuracy and quality */}
          {showAccuracy && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.accuracy', 'Accuracy')}:
              </span>
              <div className="flex items-center space-x-2">
                {accuracy && (
                  <span className="text-gray-900 dark:text-white">
                    {formatAccuracy(accuracy)}
                  </span>
                )}
                <Badge variant="outline" className={`text-${getQualityColor()}-600 border-${getQualityColor()}-200`}>
                  {t(`geolocation.quality.${quality}`, quality)}
                </Badge>
              </div>
            </div>
          )}

          {/* Validation status */}
          {showValidation && (
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
          )}
        </div>
      )}

      {/* Help text */}
      {helpText && (
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {helpText}
        </p>
      )}
    </div>
  );

  // Render based on variant
  if (variant === 'minimal') {
    return (
      <div className={className}>
        <div className="flex items-center space-x-2">
          <Input
            label={label}
            placeholder={placeholder || t('geolocation.coordinates', 'Coordinates')}
            value={value ? `${value.latitude.toFixed(6)}, ${value.longitude.toFixed(6)}` : ''}
            disabled
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            loading={isGettingLocation}
            disabled={disabled || isGettingLocation}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </Button>
        </div>
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
        )}
      </div>
    );
  }

  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
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
          {label || t('geolocation.inputCard.title', 'Location Information')}
        </CardTitle>
        <CardDescription>
          {t('geolocation.inputCard.description', 'Enter coordinates manually or use GPS to get your current location')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

