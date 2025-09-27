import React from 'react';

interface SimpleErrorDisplayProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

/**
 * Composant simplifié pour afficher les erreurs
 */
export function SimpleErrorDisplay({ error, onRetry, className = '' }: SimpleErrorDisplayProps) {
  if (!error) return null;

  const getErrorMessage = (error: unknown): string => {
    if (typeof error === 'object' && error !== null) {
      if ('message' in error && typeof error.message === 'string') {
        return error.message;
      }
      if ('status' in error && 'statusText' in error) {
        return `Erreur ${error.status}: ${error.statusText}`;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return String(error);
  };

  const errorMessage = getErrorMessage(error);

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Erreur
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p className="whitespace-pre-line">{errorMessage}</p>
          </div>
          
          {onRetry && (
            <div className="mt-4">
              <button
                type="button"
                onClick={onRetry}
                className="bg-red-100 text-red-800 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                🔄 Réessayer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SimpleErrorDisplay;
