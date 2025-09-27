import React from 'react';
import { Exportateur, ExportateurType } from '../../types/exporter';
import { StatusBadge } from './StatusBadge';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  QrCode,
  ExternalLink
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ExporterCardProps {
  exportateur: Exportateur;
  onClick?: (exportateur: Exportateur) => void;
  showActions?: boolean;
  className?: string;
}

export const ExporterCard: React.FC<ExporterCardProps> = ({
  exportateur,
  onClick,
  showActions = true,
  className = ''
}) => {
  const { t } = useTranslation();

  const handleClick = () => {
    if (onClick) {
      onClick(exportateur);
    }
  };

  const getTypeLabel = (type: ExportateurType) => {
    switch (type) {
      case ExportateurType.EXPORTATEUR:
        return t('exporters.type.exportateur', 'Exportateur');
      case ExportateurType.ACHETEUR_LOCAL:
        return t('exporters.type.acheteur_local', 'Acheteur Local');
      default:
        return type;
    }
  };

  const getTypeColor = (type: ExportateurType) => {
    switch (type) {
      case ExportateurType.EXPORTATEUR:
        return 'text-blue-600 dark:text-blue-400';
      case ExportateurType.ACHETEUR_LOCAL:
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div
      className={`
        bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700
        shadow-sm hover:shadow-md transition-shadow duration-200
        ${onClick ? 'cursor-pointer hover:border-blue-300 dark:hover:border-blue-600' : ''}
        ${className}
      `}
      onClick={handleClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
              {exportateur.nom}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {exportateur.numeroAgrement}
            </p>
          </div>
          <StatusBadge 
            statut={exportateur.statut}
            isActif={exportateur.actif}
            isExpire={exportateur.expire}
            isSuspendu={exportateur.suspendu}
          />
        </div>

        {/* Type */}
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-gray-400" />
          <span className={`text-sm font-medium ${getTypeColor(exportateur.type)}`}>
            {getTypeLabel(exportateur.type)}
          </span>
        </div>

        {/* Region */}
        <div className="flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {exportateur.regionName}
          </span>
        </div>

        {/* Contact Info */}
        {(exportateur.telephone || exportateur.email) && (
          <div className="space-y-2 mb-3">
            {exportateur.telephone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <a 
                  href={`tel:${exportateur.telephone}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {exportateur.telephone}
                </a>
              </div>
            )}
            {exportateur.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <a 
                  href={`mailto:${exportateur.email}`}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline truncate"
                  onClick={(e) => e.stopPropagation()}
                >
                  {exportateur.email}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Dates */}
        <div className="space-y-1 mb-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('exporters.certified_on', 'Certifié le')}: {new Date(exportateur.dateCertification).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t('exporters.expires_on', 'Expire le')}: {new Date(exportateur.dateExpiration).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <QrCode className="w-3 h-3" />
              <span>{t('exporters.qr_verified', 'Vérifié par QR')}</span>
            </div>
            {onClick && (
              <ExternalLink className="w-4 h-4 text-gray-400" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExporterCard;
