/**
 * Composant de navigation GPS - Interface de navigation et de guidage
 * Fournit des fonctionnalités de navigation avec instructions et directions
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineGeolocation } from '../../hooks/geolocation';

export interface NavigationPoint {
  id: string;
  name: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  address?: string;
  type: 'destination' | 'waypoint' | 'start';
}

export interface NavigationRoute {
  id: string;
  name: string;
  points: NavigationPoint[];
  distance?: number;
  duration?: number;
  instructions?: NavigationInstruction[];
}

export interface NavigationInstruction {
  id: string;
  type: 'turn' | 'continue' | 'arrive' | 'start';
  direction?: 'left' | 'right' | 'straight';
  distance?: number;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface GpsNavigationProps {
  /** Route de navigation active */
  route?: NavigationRoute;
  /** Mode de navigation */
  mode?: 'driving' | 'walking' | 'cycling';
  /** Afficher les instructions */
  showInstructions?: boolean;
  /** Afficher la carte */
  showMap?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback lors des changements de route */
  onRouteChange?: (route: NavigationRoute) => void;
  /** Callback lors des instructions */
  onInstructionChange?: (instruction: NavigationInstruction) => void;
}

export const GpsNavigation: React.FC<GpsNavigationProps> = ({
  route,
  mode = 'driving',
  showInstructions = true,
  showMap = true,
  className = '',
  onRouteChange,
  onInstructionChange
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [currentInstruction, setCurrentInstruction] = useState<NavigationInstruction | null>(null);
  const [nextInstruction, setNextInstruction] = useState<NavigationInstruction | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigationStatus, setNavigationStatus] = useState<'idle' | 'navigating' | 'arrived' | 'off-route'>('idle');
  const [distanceToDestination, setDistanceToDestination] = useState<number | null>(null);
  const [estimatedArrival, setEstimatedArrival] = useState<Date | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  // Calculer la distance entre deux points (formule de Haversine)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Rayon de la Terre en mètres
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance en mètres
  };

  // Calculer le cap entre deux points
  const calculateBearing = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lng2 - lng1) * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  };

  // Obtenir la direction du cap
  const getDirectionFromBearing = (bearing: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  };

  // Formater la distance
  const formatDistance = (distance: number): string => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  };

  // Formater la durée
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes}min`;
    }
  };

  // Obtenir l'icône de direction
  const getDirectionIcon = (direction?: string): string => {
    switch (direction) {
      case 'left': return '↰';
      case 'right': return '↱';
      case 'straight': return '↑';
      default: return '→';
    }
  };

  // Obtenir l'icône de type d'instruction
  const getInstructionIcon = (type: string): string => {
    switch (type) {
      case 'turn': return '🔄';
      case 'continue': return '➡️';
      case 'arrive': return '🏁';
      case 'start': return '🚀';
      default: return '📍';
    }
  };

  // Mettre à jour la navigation
  useEffect(() => {
    if (!route || !offlineState.position || !isNavigating) return;

    const currentPos = offlineState.position.coordinates;
    
    // Calculer la distance jusqu'à la destination
    const destination = route.points[route.points.length - 1];
    const distance = calculateDistance(
      currentPos.lat, currentPos.lng,
      destination.coordinates.lat, destination.coordinates.lng
    );
    
    setDistanceToDestination(distance);

    // Estimer l'heure d'arrivée
    const speed = mode === 'walking' ? 5 : mode === 'cycling' ? 15 : 50; // km/h
    const arrivalTime = new Date(Date.now() + (distance / 1000 / speed) * 3600 * 1000);
    setEstimatedArrival(arrivalTime);

    // Trouver l'instruction actuelle
    if (route.instructions && route.instructions.length > 0) {
      let closestInstruction = route.instructions[0];
      let minDistance = Infinity;

      for (const instruction of route.instructions) {
        const dist = calculateDistance(
          currentPos.lat, currentPos.lng,
          instruction.coordinates.lat, instruction.coordinates.lng
        );
        
        if (dist < minDistance) {
          minDistance = dist;
          closestInstruction = instruction;
        }
      }

      setCurrentInstruction(closestInstruction);
      
      // Trouver la prochaine instruction
      const currentIndex = route.instructions.findIndex(i => i.id === closestInstruction.id);
      if (currentIndex < route.instructions.length - 1) {
        setNextInstruction(route.instructions[currentIndex + 1]);
      } else {
        setNextInstruction(null);
      }

      // Notifier le changement d'instruction
      if (onInstructionChange) {
        onInstructionChange(closestInstruction);
      }
    }

    // Vérifier si on est arrivé
    if (distance < 50) { // 50 mètres de tolérance
      setNavigationStatus('arrived');
      setIsNavigating(false);
    }
  }, [route, offlineState.position, isNavigating, mode, onInstructionChange]);

  const handleStartNavigation = () => {
    if (!route) return;
    setIsNavigating(true);
    setNavigationStatus('navigating');
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setNavigationStatus('idle');
    setCurrentInstruction(null);
    setNextInstruction(null);
  };

  const handleRecalculateRoute = () => {
    if (!route || !offlineState.position) return;
    
    // Ici, vous pourriez implémenter la logique de recalcul de route
    // Pour l'instant, on simule juste un recalcul
    console.log('Recalcul de la route...');
  };

  if (!route) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('geolocation.navigation.noRoute')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('geolocation.navigation.noRouteDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* En-tête de navigation */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {route.name}
            </h3>
            <p className="text-sm text-gray-500">
              {route.points.length} {t('geolocation.navigation.points')}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 text-xs rounded-full ${
              navigationStatus === 'navigating' ? 'bg-green-100 text-green-800' :
              navigationStatus === 'arrived' ? 'bg-blue-100 text-blue-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {t(`geolocation.navigation.status.${navigationStatus}`)}
            </span>
            
            {isNavigating ? (
              <button
                onClick={handleStopNavigation}
                className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                {t('geolocation.navigation.stop')}
              </button>
            ) : (
              <button
                onClick={handleStartNavigation}
                className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('geolocation.navigation.start')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Informations de route */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">{t('geolocation.navigation.distance')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {route.distance ? formatDistance(route.distance) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('geolocation.navigation.duration')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {route.duration ? formatDuration(route.duration) : '-'}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">{t('geolocation.navigation.mode')}</p>
            <p className="text-lg font-semibold text-gray-900">
              {t(`geolocation.navigation.modes.${mode}`)}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation active */}
      {isNavigating && (
        <div className="p-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-blue-900">
              {t('geolocation.navigation.navigating')}
            </h4>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRecalculateRoute}
                className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {t('geolocation.navigation.recalculate')}
              </button>
            </div>
          </div>
          
          {distanceToDestination && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-700">{t('geolocation.navigation.distanceToDestination')}:</span>
                <span className="ml-1 font-medium">{formatDistance(distanceToDestination)}</span>
              </div>
              {estimatedArrival && (
                <div>
                  <span className="text-blue-700">{t('geolocation.navigation.estimatedArrival')}:</span>
                  <span className="ml-1 font-medium">{estimatedArrival.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Instructions de navigation */}
      {showInstructions && currentInstruction && (
        <div className="p-4 border-b border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t('geolocation.navigation.currentInstruction')}
          </h4>
          
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <span className="text-2xl">
              {getInstructionIcon(currentInstruction.type)}
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {currentInstruction.description}
              </p>
              {currentInstruction.distance && (
                <p className="text-xs text-gray-500">
                  {formatDistance(currentInstruction.distance)}
                </p>
              )}
            </div>
            {currentInstruction.direction && (
              <span className="text-xl">
                {getDirectionIcon(currentInstruction.direction)}
              </span>
            )}
          </div>

          {nextInstruction && (
            <div className="mt-3 flex items-center space-x-3 p-2 bg-gray-50 rounded">
              <span className="text-lg opacity-50">
                {getInstructionIcon(nextInstruction.type)}
              </span>
              <div className="flex-1">
                <p className="text-xs text-gray-600">
                  {t('geolocation.navigation.next')}: {nextInstruction.description}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Carte simplifiée */}
      {showMap && (
        <div className="p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            {t('geolocation.navigation.map')}
          </h4>
          <div 
            ref={mapRef}
            className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center"
          >
            <div className="text-center text-gray-500">
              <div className="text-2xl mb-2">🗺️</div>
              <p className="text-sm">{t('geolocation.navigation.mapPlaceholder')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Points de la route */}
      <div className="p-4">
        <h4 className="text-sm font-medium text-gray-900 mb-3">
          {t('geolocation.navigation.routePoints')}
        </h4>
        <div className="space-y-2">
          {route.points.map((point, index) => (
            <div key={point.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                point.type === 'start' ? 'bg-green-100 text-green-800' :
                point.type === 'destination' ? 'bg-red-100 text-red-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {point.name}
                </p>
                {point.address && (
                  <p className="text-xs text-gray-500">
                    {point.address}
                  </p>
                )}
              </div>
              <div className="text-xs text-gray-500">
                {point.coordinates.lat.toFixed(4)}, {point.coordinates.lng.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GpsNavigation;

