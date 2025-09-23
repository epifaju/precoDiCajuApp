import React from 'react';
import { AlertTriangle, Wifi, RefreshCw, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { createSafeTranslation } from '../../utils/safeTranslation';

interface SyncErrorAlertProps {
  error: string;
  isOnline: boolean;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function SyncErrorAlert({ 
  error, 
  isOnline, 
  onRetry, 
  onDismiss, 
  className = '' 
}: SyncErrorAlertProps) {
  const { t } = useTranslation();
  const safeT = createSafeTranslation(t);

  const getErrorType = (errorMessage: string) => {
    if (errorMessage.includes('Backend service unavailable') || errorMessage.includes('Server appears to be offline')) {
      return 'offline';
    }
    if (errorMessage.includes('POI service is temporarily unavailable') || errorMessage.includes('endpoint not accessible')) {
      return 'service';
    }
    if (errorMessage.includes('Local storage error') || errorMessage.includes('storage')) {
      return 'storage';
    }
    return 'unknown';
  };

  const errorType = getErrorType(error);

  const getIcon = () => {
    switch (errorType) {
      case 'offline':
        return <Wifi className="h-5 w-5 text-red-500" />;
      case 'service':
        return <AlertTriangle className="h-5 w-5 text-orange-500" />;
      case 'storage':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (errorType) {
      case 'offline':
        return 'bg-red-50 border-red-200';
      case 'service':
        return 'bg-orange-50 border-orange-200';
      case 'storage':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-red-50 border-red-200';
    }
  };

  const getTextColor = () => {
    switch (errorType) {
      case 'offline':
        return 'text-red-800';
      case 'service':
        return 'text-orange-800';
      case 'storage':
        return 'text-yellow-800';
      default:
        return 'text-red-800';
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getBgColor()} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <div className="flex items-center justify-between">
            <h3 className={`text-sm font-medium ${getTextColor()}`}>
              {safeT('poi.syncErrorTitle', 'Synchronization Error')}
            </h3>
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className={`-mx-1.5 -my-1.5 rounded-md p-1.5 hover:bg-opacity-20 hover:bg-current ${getTextColor()}`}
              >
                <span className="sr-only">{safeT('common.dismiss', 'Dismiss')}</span>
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className={`mt-2 text-sm ${getTextColor()}`}>
            <p>{error}</p>
          </div>
          
          {/* Connection status indicator */}
          <div className="mt-3 flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div 
                className={`h-2 w-2 rounded-full ${
                  isOnline ? 'bg-green-500' : 'bg-red-500'
                }`}
              />
              <span className={`text-xs ${getTextColor()}`}>
                {isOnline 
                  ? safeT('poi.syncStatusOnline', 'Online')
                  : safeT('poi.syncStatusOffline', 'Offline')
                }
              </span>
            </div>
            
            {/* Retry button */}
            {onRetry && isOnline && (
              <button
                type="button"
                onClick={onRetry}
                className={`inline-flex items-center space-x-1 text-xs font-medium underline hover:no-underline ${getTextColor()}`}
              >
                <RefreshCw className="h-3 w-3" />
                <span>{safeT('poi.syncRetry', 'Retry Sync')}</span>
              </button>
            )}
          </div>

          {/* Helpful suggestions */}
          <div className={`mt-3 text-xs ${getTextColor()}`}>
            {errorType === 'offline' && (
              <p>
                {safeT('poi.syncSuggestionOffline', 'Check your internet connection and ensure the backend server is running on http://localhost:8080')}
              </p>
            )}
            {errorType === 'service' && (
              <p>
                {safeT('poi.syncSuggestionService', 'The POI service might be temporarily down. Data will sync automatically when the service is restored.')}
              </p>
            )}
            {errorType === 'storage' && (
              <p>
                {safeT('poi.syncSuggestionStorage', 'Check browser permissions for local storage or try clearing browser cache.')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
