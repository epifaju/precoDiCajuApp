import React from 'react';
import { useServiceWorker } from '../../hooks/useServiceWorker';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Button } from './Button';
import { Badge } from './Badge';

export const ServiceWorkerDebug: React.FC = () => {
  const {
    isSupported,
    isRegistered,
    isSecure,
    error,
    registration,
    update,
    unregister
  } = useServiceWorker();

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (isRegistered) return 'default';
    if (isSupported && isSecure) return 'secondary';
    return 'outline';
  };

  const getStatusText = () => {
    if (error) return 'Erreur';
    if (isRegistered) return 'Actif';
    if (isSupported && isSecure) return 'En cours';
    if (!isSupported) return 'Non supporté';
    if (!isSecure) return 'Contexte non sécurisé';
    return 'Inconnu';
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Service Worker Debug
          <Badge variant={getStatusColor()}>
            {getStatusText()}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Informations de base */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">Support navigateur:</span>
            <Badge variant={isSupported ? 'default' : 'destructive'} className="ml-2">
              {isSupported ? 'Oui' : 'Non'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Contexte sécurisé:</span>
            <Badge variant={isSecure ? 'default' : 'destructive'} className="ml-2">
              {isSecure ? 'Oui' : 'Non'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Enregistré:</span>
            <Badge variant={isRegistered ? 'default' : 'secondary'} className="ml-2">
              {isRegistered ? 'Oui' : 'Non'}
            </Badge>
          </div>
          <div>
            <span className="font-medium">Protocol:</span>
            <span className="ml-2 font-mono text-xs">
              {typeof window !== 'undefined' ? window.location.protocol : 'N/A'}
            </span>
          </div>
        </div>

        {/* Erreur si présente */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm font-medium text-red-800">Erreur:</div>
            <div className="text-sm text-red-600 mt-1">{error}</div>
          </div>
        )}

        {/* Informations de registration */}
        {registration && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="text-sm font-medium text-blue-800">Informations d'enregistrement:</div>
            <div className="text-sm text-blue-600 mt-1 space-y-1">
              <div>Scope: {registration.scope}</div>
              <div>Update via cache: {registration.updateViaCache}</div>
              <div>Installing: {registration.installing ? 'Oui' : 'Non'}</div>
              <div>Waiting: {registration.waiting ? 'Oui' : 'Non'}</div>
              <div>Active: {registration.active ? 'Oui' : 'Non'}</div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isRegistered && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={update}
              >
                Vérifier les mises à jour
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={unregister}
              >
                Désinscrire
              </Button>
            </>
          )}
        </div>

        {/* Informations de débogage */}
        <div className="text-xs text-gray-500 space-y-1">
          <div>Hostname: {typeof window !== 'undefined' ? window.location.hostname : 'N/A'}</div>
          <div>Port: {typeof window !== 'undefined' ? window.location.port : 'N/A'}</div>
          <div>User Agent: {typeof navigator !== 'undefined' ? navigator.userAgent.substring(0, 50) + '...' : 'N/A'}</div>
        </div>
      </CardContent>
    </Card>
  );
};

