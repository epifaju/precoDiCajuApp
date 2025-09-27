import React from 'react';
import { VerificationResult as VerificationResultType, ExportateurType } from '../../types/exporter';
import { StatusBadge } from './StatusBadge';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Shield,
  Copy,
  ExternalLink,
  X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../ui/Button';

interface VerificationResultProps {
  result: VerificationResultType;
  onClose: () => void;
  onViewDetails?: () => void;
  className?: string;
}

export const VerificationResult: React.FC<VerificationResultProps> = ({
  result,
  onClose,
  onViewDetails,
  className = ''
}) => {
  const { t } = useTranslation();

  const getResultIcon = () => {
    if (result.success) {
      return <CheckCircle className="w-8 h-8 text-green-500" />;
    } else {
      switch (result.result) {
        case 'EXPIRED':
          return <AlertTriangle className="w-8 h-8 text-orange-500" />;
        case 'SUSPENDED':
          return <XCircle className="w-8 h-8 text-red-500" />;
        default:
          return <XCircle className="w-8 h-8 text-red-500" />;
      }
    }
  };

  const getResultColor = () => {
    if (result.success) {
      return 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20';
    } else {
      switch (result.result) {
        case 'EXPIRED':
          return 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20';
        case 'SUSPENDED':
          return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
        default:
          return 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20';
      }
    }
  };

  const getTypeLabel = (type?: ExportateurType) => {
    if (!type) return '';
    switch (type) {
      case ExportateurType.EXPORTATEUR:
        return t('exporters.type.exportateur', 'Exportateur');
      case ExportateurType.ACHETEUR_LOCAL:
        return t('exporters.type.acheteur_local', 'Acheteur Local');
      default:
        return type;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${className}`}>
      <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4 border-2 ${getResultColor()}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            {getResultIcon()}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {result.success 
                  ? t('qr_scanner.verification_success', 'Vérification réussie')
                  : t('qr_scanner.verification_failed', 'Vérification échouée')
                }
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {result.message}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {result.success && result.exportateurId ? (
            <div className="space-y-4">
              {/* Informations principales */}
              <div className="bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {result.nom}
                    </h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {result.numeroAgrement}
                    </p>
                  </div>
                  <StatusBadge 
                    statut={result.statut!}
                    isActif={result.actif}
                    isExpire={result.expire}
                    isSuspendu={result.suspendu}
                  />
                </div>

                {/* Type et région */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {result.regionName}
                    </span>
                  </div>
                </div>

                {/* Contact */}
                {(result.telephone || result.email) && (
                  <div className="space-y-2 mb-4">
                    {result.telephone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`tel:${result.telephone}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {result.telephone}
                        </a>
                        <button
                          onClick={() => copyToClipboard(result.telephone!)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                    {result.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <a 
                          href={`mailto:${result.email}`}
                          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {result.email}
                        </a>
                        <button
                          onClick={() => copyToClipboard(result.email!)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Dates */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('exporters.certified_on', 'Certifié le')}: {formatDate(result.dateCertification!)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('exporters.expires_on', 'Expire le')}: {formatDate(result.dateExpiration!)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp de vérification */}
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Shield className="w-3 h-3" />
                <span>
                  {t('qr_scanner.verified_at', 'Vérifié le')}: {new Date(result.verificationTime).toLocaleString()}
                </span>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500 dark:text-gray-400 mb-4">
                {result.result === 'NOT_FOUND' && (
                  <p>{t('qr_scanner.not_found_message', 'Aucun exportateur trouvé avec ce QR code.')}</p>
                )}
                {result.result === 'EXPIRED' && (
                  <p>{t('qr_scanner.expired_message', 'Ce certificat d\'exportateur a expiré.')}</p>
                )}
                {result.result === 'SUSPENDED' && (
                  <p>{t('qr_scanner.suspended_message', 'Ce certificat d\'exportateur a été suspendu.')}</p>
                )}
                {result.result === 'INVALID_TOKEN' && (
                  <p>{t('qr_scanner.invalid_token_message', 'Le QR code n\'est pas valide.')}</p>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              {t('common.close', 'Fermer')}
            </Button>
            
            {result.success && onViewDetails && (
              <Button
                onClick={onViewDetails}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('exporters.view_details', 'Voir détails')}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationResult;
