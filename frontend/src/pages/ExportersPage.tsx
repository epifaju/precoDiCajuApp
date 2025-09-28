import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useExporters, useExporterStats } from '../hooks/useExporters';
import { useRegions } from '../hooks/useApi';
import { Exportateur, ExportateurFilters } from '../types/exporter';
import { ExporterCard } from '../components/exporters/ExporterCard';
import { FilterBar } from '../components/exporters/FilterBar';
import { QRScanner } from '../components/exporters/QRScanner';
import { VerificationResult } from '../components/exporters/VerificationResult';
import { VerificationResult as VerificationResultType } from '../types/exporter';
import { Button } from '../components/ui/Button';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { SimpleErrorDisplay } from '../components/SimpleErrorDisplay';
import { 
  QrCode, 
  Plus, 
  Grid, 
  List,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

const ExportersPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State pour les filtres
  const [filters, setFilters] = useState<ExportateurFilters>({});
  const [currentPage, setCurrentPage] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('nom');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // State pour les modals
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResultType | null>(null);

  // Hooks
  const { data: regionsData } = useRegions();
  const { statistics: exporterStats, isLoading: statsLoading } = useExporterStats();
  const {
    exportateurs,
    totalElements,
    totalPages,
    isLoading,
    error,
    refetch
  } = useExporters({
    page: currentPage,
    size: 12,
    sortBy,
    sortDir,
    filters
  });

  const regions = regionsData?.map((region: any) => ({
    code: region.code,
    name: region.namePt
  })) || [];

  // Calculer les vraies statistiques à partir des données de l'API
  const calculateStats = () => {
    if (!exporterStats || statsLoading) {
      return {
        total: totalElements,
        active: 0,
        expired: 0,
        suspended: 0
      };
    }

    let active = 0;
    let expired = 0;
    let suspended = 0;

    // Les statistiques sont retournées sous forme d'array d'arrays [regionCode, statut, count]
    exporterStats.forEach((stat: any) => {
      const count = stat[2] || 0;
      const status = stat[1];
      
      switch (status) {
        case 'ACTIF':
          active += count;
          break;
        case 'EXPIRE':
          expired += count;
          break;
        case 'SUSPENDU':
          suspended += count;
          break;
      }
    });

    return {
      total: totalElements,
      active,
      expired,
      suspended
    };
  };

  const stats = calculateStats();

  const handleExporterClick = (exportateur: Exportateur) => {
    navigate(`/exporters/${exportateur.id}`);
  };

  const handleQRResult = (result: VerificationResultType) => {
    setShowQRScanner(false);
    setVerificationResult(result);
  };

  const handleViewDetails = () => {
    if (verificationResult?.exportateurId) {
      navigate(`/exporters/${verificationResult.exportateurId}`);
    }
    setVerificationResult(null);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDir('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDir === 'asc' ? '↑' : '↓';
  };

  if (error) {
    return <SimpleErrorDisplay error={error} onRetry={refetch} />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('exporters.title', 'Exportateurs Agréés')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {t('exporters.subtitle', 'Vérifiez l\'authenticité des exportateurs et acheteurs certifiés')}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowQRScanner(true)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <QrCode className="w-4 h-4" />
              {t('exporters.scan_qr', 'Scanner QR')}
            </Button>
            
            <Button
              onClick={() => navigate('/exporters/create')}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              {t('exporters.add_exportateur', 'Ajouter')}
            </Button>
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {statsLoading ? '...' : stats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('exporters.total_exporters', 'Exportateurs total')}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {statsLoading ? '...' : stats.active}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('exporters.active', 'Actifs')}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {statsLoading ? '...' : stats.expired}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('exporters.expired', 'Expirés')}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {statsLoading ? '...' : stats.suspended}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {t('exporters.suspended', 'Suspendus')}
            </div>
          </div>
        </div>
      </div>

      {/* Filtres */}
      <FilterBar
        filters={filters}
        onFiltersChange={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(0);
        }}
        regions={regions}
        className="mb-6"
      />

      {/* Contrôles */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {t('exporters.showing_results', 'Affichage de')} {exportateurs.length} {t('common.of', 'sur')} {totalElements}
          </span>
          
          {/* Tri */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {t('exporters.sort_by', 'Trier par')}:
            </span>
            <button
              onClick={() => handleSortChange('nom')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('exporters.name', 'Nom')} {getSortIcon('nom')}
            </button>
            <button
              onClick={() => handleSortChange('dateExpiration')}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {t('exporters.expiration', 'Expiration')} {getSortIcon('dateExpiration')}
            </button>
          </div>
        </div>

        {/* Mode d'affichage */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg ${
              viewMode === 'grid'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg ${
              viewMode === 'list'
                ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Liste des exportateurs */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner />
        </div>
      ) : exportateurs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 dark:text-gray-500 mb-4">
            <QrCode className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('exporters.no_results', 'Aucun exportateur trouvé')}
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {t('exporters.no_results_description', 'Essayez de modifier vos filtres de recherche.')}
          </p>
        </div>
      ) : (
        <>
          <div className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }>
            {exportateurs.map((exportateur) => (
              <ExporterCard
                key={exportateur.id}
                exportateur={exportateur}
                onClick={handleExporterClick}
                className={viewMode === 'list' ? 'flex-row' : ''}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
                {t('common.previous', 'Précédent')}
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + Math.max(0, currentPage - 2);
                  if (page >= totalPages) return null;
                  
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm rounded-lg ${
                        page === currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      {page + 1}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('common.next', 'Suivant')}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      {showQRScanner && (
        <QRScanner
          onResult={handleQRResult}
          onClose={() => setShowQRScanner(false)}
        />
      )}

      {verificationResult && (
        <VerificationResult
          result={verificationResult}
          onClose={() => setVerificationResult(null)}
          onViewDetails={handleViewDetails}
        />
      )}
    </div>
  );
};

export default ExportersPage;
