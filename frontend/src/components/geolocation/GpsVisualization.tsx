/**
 * Composant de Visualisation GPS - Graphiques et métriques pour la géolocalisation
 * Affiche des graphiques, des métriques et des analyses des données GPS
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useOfflineGeolocation } from '../../hooks/geolocation';

export interface GpsMetrics {
  accuracy: number[];
  timestamps: number[];
  coordinates: {
    lat: number[];
    lng: number[];
  };
  quality: string[];
  speed?: number[];
  heading?: number[];
}

export interface GpsVisualizationProps {
  /** Métriques GPS à afficher */
  metrics?: GpsMetrics;
  /** Type de visualisation */
  type?: 'accuracy' | 'trajectory' | 'quality' | 'speed' | 'all';
  /** Période d'affichage */
  period?: '1h' | '6h' | '24h' | '7d' | '30d';
  /** Afficher les contrôles */
  showControls?: boolean;
  /** Afficher les légendes */
  showLegend?: boolean;
  /** Classe CSS personnalisée */
  className?: string;
  /** Callback lors des changements de période */
  onPeriodChange?: (period: string) => void;
}

export const GpsVisualization: React.FC<GpsVisualizationProps> = ({
  metrics,
  type = 'all',
  period = '24h',
  showControls = true,
  showLegend = true,
  className = '',
  onPeriodChange
}) => {
  const { t } = useTranslation();
  const [offlineState, offlineActions] = useOfflineGeolocation();
  const [currentMetrics, setCurrentMetrics] = useState<GpsMetrics | null>(metrics || null);
  const [selectedType, setSelectedType] = useState(type);
  const [selectedPeriod, setSelectedPeriod] = useState(period);
  const [isLoading, setIsLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Générer des données de test si aucune métrique n'est fournie
  useEffect(() => {
    if (!currentMetrics && !metrics) {
      generateTestMetrics();
    }
  }, [currentMetrics, metrics]);

  const generateTestMetrics = () => {
    const now = Date.now();
    const dataPoints = 50;
    const testMetrics: GpsMetrics = {
      accuracy: [],
      timestamps: [],
      coordinates: { lat: [], lng: [] },
      quality: [],
      speed: [],
      heading: []
    };

    // Point de base (Bissau)
    let baseLat = 11.8636;
    let baseLng = -15.5977;

    for (let i = 0; i < dataPoints; i++) {
      const timestamp = now - (dataPoints - i) * 60000; // 1 minute d'intervalle
      const accuracy = Math.random() * 50 + 5; // 5-55 mètres
      const lat = baseLat + (Math.random() - 0.5) * 0.01;
      const lng = baseLng + (Math.random() - 0.5) * 0.01;
      const speed = Math.random() * 30; // 0-30 km/h
      const heading = Math.random() * 360;

      testMetrics.accuracy.push(accuracy);
      testMetrics.timestamps.push(timestamp);
      testMetrics.coordinates.lat.push(lat);
      testMetrics.coordinates.lng.push(lng);
      testMetrics.quality.push(
        accuracy <= 10 ? 'excellent' :
        accuracy <= 25 ? 'good' :
        accuracy <= 50 ? 'fair' : 'poor'
      );
      testMetrics.speed?.push(speed);
      testMetrics.heading?.push(heading);

      // Simuler un mouvement
      baseLat += (Math.random() - 0.5) * 0.001;
      baseLng += (Math.random() - 0.5) * 0.001;
    }

    setCurrentMetrics(testMetrics);
  };

  const getQualityColor = (quality: string): string => {
    switch (quality) {
      case 'excellent': return '#10B981';
      case 'good': return '#3B82F6';
      case 'fair': return '#F59E0B';
      case 'poor': return '#EF4444';
      case 'invalid': return '#6B7280';
      default: return '#6B7280';
    }
  };

  const formatTime = (timestamp: number): string => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  const getPeriodLabel = (period: string): string => {
    switch (period) {
      case '1h': return t('geolocation.visualization.periods.1h');
      case '6h': return t('geolocation.visualization.periods.6h');
      case '24h': return t('geolocation.visualization.periods.24h');
      case '7d': return t('geolocation.visualization.periods.7d');
      case '30d': return t('geolocation.visualization.periods.30d');
      default: return period;
    }
  };

  const getTypeLabel = (type: string): string => {
    switch (type) {
      case 'accuracy': return t('geolocation.visualization.types.accuracy');
      case 'trajectory': return t('geolocation.visualization.types.trajectory');
      case 'quality': return t('geolocation.visualization.types.quality');
      case 'speed': return t('geolocation.visualization.types.speed');
      case 'all': return t('geolocation.visualization.types.all');
      default: return type;
    }
  };

  const calculateStats = () => {
    if (!currentMetrics) return null;

    const accuracy = currentMetrics.accuracy;
    const avgAccuracy = accuracy.reduce((a, b) => a + b, 0) / accuracy.length;
    const minAccuracy = Math.min(...accuracy);
    const maxAccuracy = Math.max(...accuracy);

    const qualityCounts = currentMetrics.quality.reduce((acc, quality) => {
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      avgAccuracy: Math.round(avgAccuracy),
      minAccuracy: Math.round(minAccuracy),
      maxAccuracy: Math.round(maxAccuracy),
      totalPoints: accuracy.length,
      qualityCounts
    };
  };

  const drawAccuracyChart = (canvas: HTMLCanvasElement) => {
    if (!currentMetrics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    // Configuration
    const data = currentMetrics.accuracy;
    const maxAccuracy = Math.max(...data);
    const minAccuracy = Math.min(...data);
    const range = maxAccuracy - minAccuracy || 1;

    // Grille
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Ligne de précision
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (width - 2 * padding) * (index / (data.length - 1));
      const y = height - padding - ((value - minAccuracy) / range) * (height - 2 * padding);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Points
    ctx.fillStyle = '#3B82F6';
    data.forEach((value, index) => {
      const x = padding + (width - 2 * padding) * (index / (data.length - 1));
      const y = height - padding - ((value - minAccuracy) / range) * (height - 2 * padding);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Labels
    ctx.fillStyle = '#374151';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    
    // Titre
    ctx.fillText(t('geolocation.visualization.accuracyChart'), width / 2, 20);
    
    // Axe Y
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const value = minAccuracy + (range * i / 5);
      const y = padding + (height - 2 * padding) * (i / 5);
      ctx.fillText(Math.round(value).toString(), padding - 10, y + 4);
    }
  };

  const drawQualityChart = (canvas: HTMLCanvasElement) => {
    if (!currentMetrics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 - 40;

    ctx.clearRect(0, 0, width, height);

    const qualityCounts = currentMetrics.quality.reduce((acc, quality) => {
      acc[quality] = (acc[quality] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = currentMetrics.quality.length;
    let currentAngle = 0;

    const qualities = ['excellent', 'good', 'fair', 'poor', 'invalid'];
    
    qualities.forEach(quality => {
      const count = qualityCounts[quality] || 0;
      const percentage = count / total;
      const angle = percentage * 2 * Math.PI;

      if (angle > 0) {
        // Arc
        ctx.fillStyle = getQualityColor(quality);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + angle);
        ctx.closePath();
        ctx.fill();

        // Label
        const labelAngle = currentAngle + angle / 2;
        const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
        const labelY = centerY + Math.sin(labelAngle) * (radius + 20);

        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(
          `${t(`geolocation.quality.${quality}`)} (${Math.round(percentage * 100)}%)`,
          labelX,
          labelY
        );
      }

      currentAngle += angle;
    });

    // Titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('geolocation.visualization.qualityChart'), centerX, 20);
  };

  const drawTrajectoryChart = (canvas: HTMLCanvasElement) => {
    if (!currentMetrics) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    const lats = currentMetrics.coordinates.lat;
    const lngs = currentMetrics.coordinates.lng;

    if (lats.length === 0) return;

    // Calculer les limites
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);

    const latRange = maxLat - minLat || 0.001;
    const lngRange = maxLng - minLng || 0.001;

    // Trajectoire
    ctx.strokeStyle = '#3B82F6';
    ctx.lineWidth = 2;
    ctx.beginPath();

    lats.forEach((lat, index) => {
      const x = padding + ((lngs[index] - minLng) / lngRange) * (width - 2 * padding);
      const y = padding + ((maxLat - lat) / latRange) * (height - 2 * padding);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Points
    lats.forEach((lat, index) => {
      const x = padding + ((lngs[index] - minLng) / lngRange) * (width - 2 * padding);
      const y = padding + ((maxLat - lat) / latRange) * (height - 2 * padding);
      
      const quality = currentMetrics.quality[index];
      ctx.fillStyle = getQualityColor(quality);
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('geolocation.visualization.trajectoryChart'), width / 2, 20);
  };

  const drawSpeedChart = (canvas: HTMLCanvasElement) => {
    if (!currentMetrics || !currentMetrics.speed) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const padding = 40;

    ctx.clearRect(0, 0, width, height);

    const data = currentMetrics.speed;
    const maxSpeed = Math.max(...data);
    const minSpeed = Math.min(...data);
    const range = maxSpeed - minSpeed || 1;

    // Grille
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = padding + (height - 2 * padding) * (i / 5);
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();
    }

    // Ligne de vitesse
    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 2;
    ctx.beginPath();

    data.forEach((value, index) => {
      const x = padding + (width - 2 * padding) * (index / (data.length - 1));
      const y = height - padding - ((value - minSpeed) / range) * (height - 2 * padding);
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Points
    ctx.fillStyle = '#10B981';
    data.forEach((value, index) => {
      const x = padding + (width - 2 * padding) * (index / (data.length - 1));
      const y = height - padding - ((value - minSpeed) / range) * (height - 2 * padding);
      
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Titre
    ctx.fillStyle = '#374151';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(t('geolocation.visualization.speedChart'), width / 2, 20);
  };

  const drawChart = () => {
    const canvas = canvasRef.current;
    if (!canvas || !currentMetrics) return;

    switch (selectedType) {
      case 'accuracy':
        drawAccuracyChart(canvas);
        break;
      case 'quality':
        drawQualityChart(canvas);
        break;
      case 'trajectory':
        drawTrajectoryChart(canvas);
        break;
      case 'speed':
        drawSpeedChart(canvas);
        break;
      case 'all':
        drawAccuracyChart(canvas);
        break;
    }
  };

  useEffect(() => {
    drawChart();
  }, [selectedType, currentMetrics]);

  const handleTypeChange = (newType: string) => {
    setSelectedType(newType);
  };

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    if (onPeriodChange) {
      onPeriodChange(newPeriod);
    }
  };

  const stats = calculateStats();

  if (!currentMetrics) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('geolocation.visualization.noData')}
          </h3>
          <p className="text-sm text-gray-500">
            {t('geolocation.visualization.noDataDescription')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* En-tête */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              {t('geolocation.visualization.title')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('geolocation.visualization.subtitle')}
            </p>
          </div>
          
          {showControls && (
            <div className="flex items-center space-x-2">
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1h">{getPeriodLabel('1h')}</option>
                <option value="6h">{getPeriodLabel('6h')}</option>
                <option value="24h">{getPeriodLabel('24h')}</option>
                <option value="7d">{getPeriodLabel('7d')}</option>
                <option value="30d">{getPeriodLabel('30d')}</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Contrôles de type */}
      {showControls && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {['all', 'accuracy', 'trajectory', 'quality', 'speed'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`px-3 py-1 text-sm rounded ${
                  selectedType === type
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {getTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Statistiques */}
      {stats && (
        <div className="p-4 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.avgAccuracy}m</p>
              <p className="text-sm text-gray-500">{t('geolocation.visualization.avgAccuracy')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{stats.minAccuracy}m</p>
              <p className="text-sm text-gray-500">{t('geolocation.visualization.minAccuracy')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{stats.maxAccuracy}m</p>
              <p className="text-sm text-gray-500">{t('geolocation.visualization.maxAccuracy')}</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-600">{stats.totalPoints}</p>
              <p className="text-sm text-gray-500">{t('geolocation.visualization.totalPoints')}</p>
            </div>
          </div>
        </div>
      )}

      {/* Graphique */}
      <div className="p-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={800}
            height={400}
            className="w-full h-96 border border-gray-200 rounded"
          />
          
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Légende */}
      {showLegend && selectedType === 'quality' && (
        <div className="p-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {t('geolocation.visualization.legend')}
          </h4>
          <div className="flex flex-wrap gap-4">
            {['excellent', 'good', 'fair', 'poor', 'invalid'].map((quality) => (
              <div key={quality} className="flex items-center space-x-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getQualityColor(quality) }}
                />
                <span className="text-sm text-gray-600">
                  {t(`geolocation.quality.${quality}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GpsVisualization;
