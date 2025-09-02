import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGpsAccuracy } from '../../hooks/useGpsAccuracy';
import { GpsCoordinates } from '../../types/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Alert, AlertDescription } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Progress } from '../ui/Progress';

export interface GpsAccuracyDisplayProps {
  coordinates?: GpsCoordinates | null;
  onCoordinatesChange?: (coordinates: GpsCoordinates | null) => void;
  className?: string;
  variant?: 'card' | 'inline' | 'compact';
  showValidation?: boolean;
  showGeocoding?: boolean;
  showImprovement?: boolean;
  showMovement?: boolean;
  showConsistency?: boolean;
  showActions?: boolean;
  autoProcess?: boolean;
}

export const GpsAccuracyDisplay: React.FC<GpsAccuracyDisplayProps> = ({
  coordinates,
  onCoordinatesChange,
  className,
  variant = 'card',
  showValidation = true,
  showGeocoding = true,
  showImprovement = true,
  showMovement = true,
  showConsistency = true,
  showActions = true,
  autoProcess = true,
}) => {
  const { t } = useTranslation();
  const {
    coordinates: currentCoordinates,
    validation,
    geocoding,
    improvement,
    quality,
    score,
    isMoving,
    speed,
    bearing,
    isConsistent,
    isLoading,
    error,
    validateCoordinates,
    improveAccuracy,
    getGeocoding,
    clearError,
    reset,
    processPosition,
  } = useGpsAccuracy({
    autoValidate: autoProcess,
    autoGeocode: autoProcess && showGeocoding,
    autoImprove: autoProcess && showImprovement,
    enableMovementDetection: showMovement,
    enableConsistencyCheck: showConsistency,
  });

  // Traiter les coordonnées quand elles changent
  React.useEffect(() => {
    if (coordinates && autoProcess) {
      processPosition(coordinates);
    }
  }, [coordinates, autoProcess, processPosition]);

  const handleValidate = () => {
    if (coordinates) {
      validateCoordinates(coordinates);
    }
  };

  const handleImprove = () => {
    if (coordinates) {
      // Créer un historique simple pour l'amélioration
      const history = [coordinates, coordinates]; // Simulation d'historique
      improveAccuracy(history);
    }
  };

  const handleGeocode = async () => {
    if (coordinates) {
      try {
        await getGeocoding(coordinates);
      } catch (error) {
        console.error('Géocodage échoué:', error);
      }
    }
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

  const formatSpeed = (speed: number | null) => {
    if (speed === null) return null;
    return `${(speed * 3.6).toFixed(1)} km/h`;
  };

  const formatBearing = (bearing: number | null) => {
    if (bearing === null) return null;
    
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return `${directions[index]} (${bearing.toFixed(0)}°)`;
  };

  const content = (
    <div className="space-y-4">
      {/* Erreur */}
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

      {/* Score de qualité */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.qualityScore', 'Quality Score')}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {score}/100
            </span>
            <Badge variant="outline" className={`text-${getQualityColor()}-600 border-${getQualityColor()}-200`}>
              {t(`geolocation.quality.${quality}`, quality)}
            </Badge>
          </div>
        </div>
        <Progress value={score} className="h-2" />
      </div>

      {/* Validation */}
      {showValidation && validation && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.validation', 'Validation')}
          </h4>
          
          <div className="flex items-center space-x-2">
            <Badge variant={validation.isValid ? 'default' : 'destructive'}>
              {validation.isValid ? t('geolocation.valid', 'Valid') : t('geolocation.invalid', 'Invalid')}
            </Badge>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {validation.score}/100
            </span>
          </div>

          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((error, index) => (
                <p key={index} className="text-sm text-red-600 dark:text-red-400">
                  • {error}
                </p>
              ))}
            </div>
          )}

          {validation.warnings.length > 0 && (
            <div className="space-y-1">
              {validation.warnings.map((warning, index) => (
                <p key={index} className="text-sm text-yellow-600 dark:text-yellow-400">
                  • {warning}
                </p>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Géocodage */}
      {showGeocoding && geocoding && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.address', 'Address')}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {geocoding.formatted}
          </p>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" size="sm">
              {t(`geolocation.source.${geocoding.source}`, geocoding.source)}
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('geolocation.confidence', 'Confidence')}: {(geocoding.confidence * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      )}

      {/* Amélioration */}
      {showImprovement && improvement && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.improvement', 'Accuracy Improvement')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.original', 'Original')}:
              </span>
              <p className="font-mono text-gray-900 dark:text-white">
                {improvement.original.accuracy?.toFixed(1)}m
              </p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.improved', 'Improved')}:
              </span>
              <p className="font-mono text-gray-900 dark:text-white">
                {improvement.improved.accuracy?.toFixed(1)}m
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="default" size="sm">
              +{improvement.improvement.toFixed(1)}% {t('geolocation.improvement', 'Improvement')}
            </Badge>
            <Badge variant="outline" size="sm">
              {t(`geolocation.method.${improvement.method}`, improvement.method)}
            </Badge>
          </div>
        </div>
      )}

      {/* Mouvement */}
      {showMovement && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.movement', 'Movement')}
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.status', 'Status')}:
              </span>
              <p className="text-gray-900 dark:text-white">
                {isMoving ? t('geolocation.moving', 'Moving') : t('geolocation.stationary', 'Stationary')}
              </p>
            </div>
            {speed !== null && (
              <div>
                <span className="text-gray-600 dark:text-gray-400">
                  {t('geolocation.speed', 'Speed')}:
                </span>
                <p className="text-gray-900 dark:text-white">
                  {formatSpeed(speed)}
                </p>
              </div>
            )}
          </div>
          {bearing !== null && (
            <div className="text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                {t('geolocation.direction', 'Direction')}:
              </span>
              <p className="text-gray-900 dark:text-white">
                {formatBearing(bearing)}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Cohérence */}
      {showConsistency && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
            {t('geolocation.consistency', 'Consistency')}
          </h4>
          <div className="flex items-center space-x-2">
            <Badge variant={isConsistent ? 'default' : 'destructive'}>
              {isConsistent ? t('geolocation.consistent', 'Consistent') : t('geolocation.inconsistent', 'Inconsistent')}
            </Badge>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleValidate}
            disabled={!coordinates || isLoading}
          >
            {t('geolocation.validate', 'Validate')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleGeocode}
            disabled={!coordinates || isLoading}
            loading={isLoading}
          >
            {t('geolocation.geocode', 'Geocode')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleImprove}
            disabled={!coordinates || isLoading}
          >
            {t('geolocation.improve', 'Improve')}
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            disabled={isLoading}
          >
            {t('geolocation.reset', 'Reset')}
          </Button>
        </div>
      )}
    </div>
  );

  // Rendu basé sur la variante
  if (variant === 'inline') {
    return <div className={className}>{content}</div>;
  }

  if (variant === 'compact') {
    return (
      <div className={`flex items-center space-x-2 text-sm ${className}`}>
        <div className={`w-2 h-2 rounded-full bg-${getQualityColor()}-500`}></div>
        <span className="text-gray-600 dark:text-gray-400">
          {t('geolocation.accuracy', 'Accuracy')}:
        </span>
        <span className="text-gray-900 dark:text-white">
          {score}/100
        </span>
        <Badge variant="outline" size="sm">
          {t(`geolocation.quality.${quality}`, quality)}
        </Badge>
      </div>
    );
  }

  // Variante card par défaut
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center">
          <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t('geolocation.accuracyCard.title', 'GPS Accuracy Analysis')}
        </CardTitle>
        <CardDescription>
          {t('geolocation.accuracyCard.description', 'Detailed analysis of GPS accuracy and quality')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {content}
      </CardContent>
    </Card>
  );
};
