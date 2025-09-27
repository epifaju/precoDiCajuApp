import React from 'react';
import { StatutType } from '../../types/exporter';
import { Shield, ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  statut: StatutType;
  isActif?: boolean;
  isExpire?: boolean;
  isSuspendu?: boolean;
  className?: string;
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  statut,
  isActif,
  isExpire,
  isSuspendu,
  className = '',
  showIcon = true
}) => {
  const getStatusConfig = () => {
    // Priorité aux états calculés
    if (isSuspendu) {
      return {
        label: 'Suspendu',
        bgColor: 'bg-red-100 dark:bg-red-900/20',
        textColor: 'text-red-800 dark:text-red-300',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: ShieldAlert
      };
    }
    
    if (isExpire) {
      return {
        label: 'Expiré',
        bgColor: 'bg-orange-100 dark:bg-orange-900/20',
        textColor: 'text-orange-800 dark:text-orange-300',
        borderColor: 'border-orange-200 dark:border-orange-800',
        icon: AlertTriangle
      };
    }
    
    if (isActif) {
      return {
        label: 'Actif',
        bgColor: 'bg-green-100 dark:bg-green-900/20',
        textColor: 'text-green-800 dark:text-green-300',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: ShieldCheck
      };
    }

    // Fallback sur le statut brut
    switch (statut) {
      case StatutType.ACTIF:
        return {
          label: 'Actif',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-800 dark:text-green-300',
          borderColor: 'border-green-200 dark:border-green-800',
          icon: ShieldCheck
        };
      case StatutType.EXPIRE:
        return {
          label: 'Expiré',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          textColor: 'text-orange-800 dark:text-orange-300',
          borderColor: 'border-orange-200 dark:border-orange-800',
          icon: AlertTriangle
        };
      case StatutType.SUSPENDU:
        return {
          label: 'Suspendu',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-300',
          borderColor: 'border-red-200 dark:border-red-800',
          icon: ShieldAlert
        };
      default:
        return {
          label: 'Inconnu',
          bgColor: 'bg-gray-100 dark:bg-gray-900/20',
          textColor: 'text-gray-800 dark:text-gray-300',
          borderColor: 'border-gray-200 dark:border-gray-800',
          icon: Shield
        };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
        border ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${className}
      `}
    >
      {showIcon && <IconComponent className="w-3 h-3" />}
      {config.label}
    </span>
  );
};

export default StatusBadge;
