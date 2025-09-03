import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GpsCoordinates } from '../../types/api';
import { useGeolocationManager } from '../../hooks/geolocation';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';

// Fix pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export interface LocationPickerProps {
  value?: GpsCoordinates | null;
  onChange?: (coordinates: GpsCoordinates | null) => void;
  onAddressChange?: (address: string | null) => void;
  className?: string;
  height?: string;
  center?: [number, number];
  zoom?: number;
  showCurrentLocation?: boolean;
  showAddress?: boolean;
  showValidation?: boolean;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  helpText?: string;
  error?: string;
}

// Composant pour centrer la carte sur la Guinée-Bissau
const MapCenter: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  
  return null;
};

// Composant pour gérer les clics sur la carte
const MapClickHandler: React.FC<{
  onLocationSelect: (coordinates: GpsCoordinates) => void;
  disabled: boolean;
}> = ({ onLocationSelect, disabled }) => {
  useMapEvents({
    click: (e) => {
      if (disabled) return;
      
      const coordinates: GpsCoordinates = {
        latitude: Number(e.latlng.lat.toFixed(6)),
        longitude: Number(e.latlng.lng.toFixed(6)),
      };
      
      onLocationSelect(coordinates);
    },
  });
  
  return null;
};

export const LocationPicker: React.FC<LocationPickerProps> = ({
  value,
  onChange,
  onAddressChange,
  className,
  height = '400px',
  center = [11.8037, -15.1804], // Centre de la Guinée-Bissau
  zoom = 8,
  showCurrentLocation = true,
  showAddress = true,
  showValidation = true,
  disabled = false,
  placeholder,
  label,
  helpText,
  error,
}) => {
  const { t } = useTranslation();
  const {
    coordinates: currentLocation,
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
  });

  const [selectedLocation, setSelectedLocation] = useState<GpsCoordinates | null>(value || null);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isGettingAddress, setIsGettingAddress] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  // Update selected location when value changes
  useEffect(() => {
    setSelectedLocation(value || null);
  }, [value]);

  // Update selected address when address changes
  useEffect(() => {
    if (address) {
      setSelectedAddress(address);
    }
  }, [address]);

  const handleLocationSelect = useCallback(async (coordinates: GpsCoordinates) => {
    setSelectedLocation(coordinates);
    onChange?.(coordinates);
    
    if (showAddress) {
      setIsGettingAddress(true);
      try {
        const addr = await getAddress(coordinates);
        setSelectedAddress(addr);
        onAddressChange?.(addr);
      } catch (error) {
        console.warn('Failed to get address:', error);
        setSelectedAddress(null);
        onAddressChange?.(null);
      } finally {
        setIsGettingAddress(false);
      }
    }
  }, [onChange, onAddressChange, showAddress, getAddress]);

  const handleGetCurrentLocation = async () => {
    try {
      const coords = await getCurrentPosition();
      setSelectedLocation(coords);
      onChange?.(coords);
      
      if (showAddress) {
        setIsGettingAddress(true);
        try {
          const addr = await getAddress(coords);
          setSelectedAddress(addr);
          onAddressChange?.(addr);
        } catch (error) {
          console.warn('Failed to get address:', error);
        } finally {
          setIsGettingAddress(false);
        }
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
    }
  };

  const handleClearLocation = () => {
    setSelectedLocation(null);
    setSelectedAddress(null);
    onChange?.(null);
    onAddressChange?.(null);
    setMapKey(prev => prev + 1); // Force map re-render
  };

  const getQualityColor = () => {
    if (!selectedLocation) return 'gray';
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

  const formatCoordinates = (coords: GpsCoordinates) => {
    return `${coords.latitude.toFixed(6)}, ${coords.longitude.toFixed(6)}`;
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

      {/* Map */}
      <div className="relative">
        <div 
          className="w-full rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
          style={{ height }}
        >
          <MapContainer
            key={mapKey}
            center={center}
            zoom={zoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
            scrollWheelZoom={true}
            doubleClickZoom={true}
            attributionControl={true}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapCenter center={center} zoom={zoom} />
            <MapClickHandler onLocationSelect={handleLocationSelect} disabled={disabled} />
            
            {/* Selected location marker */}
            {selectedLocation && (
              <Marker position={[selectedLocation.latitude, selectedLocation.longitude]} />
            )}
            
            {/* Current location marker (if different from selected) */}
            {currentLocation && 
             (!selectedLocation || 
              currentLocation.latitude !== selectedLocation.latitude || 
              currentLocation.longitude !== selectedLocation.longitude) && (
              <Marker 
                position={[currentLocation.latitude, currentLocation.longitude]}
                icon={new L.Icon({
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                  shadowSize: [41, 41]
                })}
              />
            )}
          </MapContainer>
        </div>
        
        {/* Map overlay with instructions */}
        {!disabled && (
          <div className="absolute top-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('geolocation.mapInstructions', 'Click on the map to select a location')}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-2">
        {showCurrentLocation && isSupported && (
          <Button
            type="button"
            variant="outline"
            onClick={handleGetCurrentLocation}
            loading={isLoading}
            disabled={disabled || isLoading}
            className="flex-1"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          >
            {isLoading 
              ? t('geolocation.gettingLocation', 'Getting Location...')
              : t('geolocation.getCurrentLocation', 'Get Current Location')
            }
          </Button>
        )}
        
        {selectedLocation && (
          <Button
            type="button"
            variant="outline"
            onClick={handleClearLocation}
            disabled={disabled}
          >
            {t('geolocation.clear', 'Clear')}
          </Button>
        )}
      </div>

      {/* Selected location information */}
      {selectedLocation && (
        <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.selectedLocation', 'Selected Location')}
          </h4>
          
          {/* Coordinates */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {t('geolocation.coordinates', 'Coordinates')}:
            </span>
            <span className="font-mono text-gray-900 dark:text-white">
              {formatCoordinates(selectedLocation)}
            </span>
          </div>

          {/* Address */}
          {showAddress && (
            <div className="flex items-start justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.address', 'Address')}:
              </span>
              <span className="text-gray-900 dark:text-white text-right max-w-xs">
                {isGettingAddress 
                  ? t('geolocation.gettingAddress', 'Getting address...')
                  : selectedAddress || t('geolocation.noAddress', 'No address available')
                }
              </span>
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

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {label || t('geolocation.pickerCard.title', 'Select Location')}
        </CardTitle>
        <CardDescription>
          {t('geolocation.pickerCard.description', 'Click on the map to select a location or use GPS to get your current position')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};

