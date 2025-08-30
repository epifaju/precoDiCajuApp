import React from 'react';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { Button } from './Button';
import { Alert, AlertDescription } from './Alert';

export const ServiceWorkerStatus: React.FC = () => {
  const { isSupported, isRegistered, isSecure, error, update } = useServiceWorker();

  if (!isSupported) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Service Workers non supportés dans ce navigateur
        </AlertDescription>
      </Alert>
    );
  }

  if (!isSecure) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Service Worker nécessite un contexte sécurisé (HTTPS ou localhost)
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Erreur Service Worker: {error}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isRegistered) {
    return (
      <Alert className="mb-4">
        <AlertDescription>
          Service Worker en cours d'enregistrement...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="mb-4">
      <AlertDescription className="flex items-center justify-between">
        <span>Service Worker actif</span>
        <Button
          size="sm"
          variant="outline"
          onClick={update}
        >
          Vérifier les mises à jour
        </Button>
      </AlertDescription>
    </Alert>
  );
};

