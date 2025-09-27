import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useExporterStats } from '../../hooks/useExporters';
import { Shield, TrendingUp, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../ui/Button';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ExportersWidgetProps {
  region?: string;
  onViewAll?: () => void;
  className?: string;
}

export const ExportersWidget: React.FC<ExportersWidgetProps> = ({
  region,
  onViewAll,
  className = ''
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { statistics, isLoading } = useExporterStats();

  const handleViewAll = () => {
    if (onViewAll) {
      onViewAll();
    } else {
      navigate('/exporters');
    }
  };

  const handleScanQR = () => {
    navigate('/exporters?scan=true');
  };

  if (isLoading) {
    return (
      <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  // Calculer les statistiques depuis les données
  const totalExporters = statistics?.length || 0;
  const activeExporters = statistics?.filter((stat: any) => stat[1] === 'ACTIF').length || 0;
  const expiringSoon = statistics?.filter((stat: any) => {
    // Logique pour déterminer ceux qui expirent bientôt
    return stat[1] === 'ACTIF';
  }).length || 0;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t('exporters.title', 'Exportateurs Agréés')}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {region ? t('exporters.in_region', 'dans votre région') : t('exporters.nationwide', 'à l\'échelle nationale')}
            </p>
          </div>
        </div>
        
        <Button
          onClick={handleScanQR}
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
        >
          <Shield className="w-4 h-4" />
          {t('exporters.scan_qr', 'Scanner QR')}
        </Button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {totalExporters}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t('exporters.total', 'Total')}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600 dark:text-green-400">
            {activeExporters}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t('exporters.active', 'Actifs')}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
            {expiringSoon}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">
            {t('exporters.expiring_soon', 'Expirent bientôt')}
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="flex gap-2">
        <Button
          onClick={handleViewAll}
          size="sm"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <Users className="w-4 h-4" />
          {t('exporters.view_all', 'Voir tous')}
        </Button>
        
        <Button
          onClick={handleScanQR}
          size="sm"
          variant="outline"
          className="flex items-center gap-2"
        >
          <Shield className="w-4 h-4" />
          {t('exporters.scan', 'Scanner')}
        </Button>
      </div>

      {/* Info rapide */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-300">
          <TrendingUp className="w-4 h-4" />
          <span>
            {t('exporters.widget_tip', 'Scannez les QR codes pour vérifier instantanément l\'authenticité des exportateurs.')}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExportersWidget;
