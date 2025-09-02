import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ConnectionStatusIndicator } from './ConnectionStatusIndicator';
import { SyncQueueManager } from './SyncQueueManager';
import { NotificationCenter } from './NotificationCenter';
import { OfflineFormWrapper } from './OfflineFormWrapper';
import { OfflineStatusBar } from './OfflineStatusBar';
import { useOfflineNotifications } from '../../hooks/useOfflineNotifications';
import { useConnectionStatus } from '../../hooks/useConnectionStatus';
import { 
  Wifi, 
  WifiOff, 
  Bell, 
  RefreshCw, 
  Settings, 
  TestTube,
  Eye,
  EyeOff
} from 'lucide-react';

export const OfflineUITest: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'components' | 'notifications' | 'forms'>('overview');
  const [showStatusBar, setShowStatusBar] = useState(false);
  const [statusBarVariant, setStatusBarVariant] = useState<'minimal' | 'compact' | 'full'>('compact');
  const [statusBarPosition, setStatusBarPosition] = useState<'top' | 'bottom'>('top');
  
  const { addNotification } = useOfflineNotifications();
  const { forceOffline, forceOnline, reset } = useConnectionStatus();

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: '📊' },
    { id: 'components', label: 'Composants', icon: '🧩' },
    { id': 'notifications', label: 'Notifications', icon: '🔔' },
    { id': 'forms', label: 'Formulaires', icon: '📝' },
  ];

  const testNotifications = [
    {
      type: 'info' as const,
      title: 'Test d\'information',
      message: 'Ceci est une notification d\'information de test.',
    },
    {
      type: 'success' as const,
      title: 'Test de succès',
      message: 'Ceci est une notification de succès de test.',
    },
    {
      type: 'warning' as const,
      title: 'Test d\'avertissement',
      message: 'Ceci est une notification d\'avertissement de test.',
    },
    {
      type: 'error' as const,
      title: 'Test d\'erreur',
      message: 'Ceci est une notification d\'erreur de test.',
    },
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Statut global */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Test de l'Interface Offline
          </CardTitle>
          <CardDescription>
            Interface de test pour les composants offline de la Phase 4
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <Wifi className="w-8 h-8 mx-auto mb-2 text-green-600" />
              <p className="font-medium">Composants Offline</p>
              <p className="text-sm text-gray-600">Indicateurs de statut et gestionnaires</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Bell className="w-8 h-8 mx-auto mb-2 text-blue-600" />
              <p className="font-medium">Système de Notifications</p>
              <p className="text-sm text-gray-600">Notifications contextuelles et alertes</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <RefreshCw className="w-8 h-8 mx-auto mb-2 text-orange-600" />
              <p className="font-medium">Formulaires Adaptatifs</p>
              <p className="text-sm text-gray-600">Formulaires qui s'adaptent au mode offline</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions de test */}
      <Card>
        <CardHeader>
          <CardTitle>Actions de Test</CardTitle>
          <CardDescription>
            Actions pour tester les fonctionnalités offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setActiveTab('components')}
              variant="outline"
            >
              Tester Composants
            </Button>
            <Button
              onClick={() => setActiveTab('notifications')}
              variant="outline"
            >
              Tester Notifications
            </Button>
            <Button
              onClick={() => setActiveTab('forms')}
              variant="outline"
            >
              Tester Formulaires
            </Button>
            <Button
              onClick={() => setShowStatusBar(!showStatusBar)}
              variant="outline"
            >
              {showStatusBar ? 'Masquer' : 'Afficher'} Barre de Statut
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration de la barre de statut */}
      {showStatusBar && (
        <Card>
          <CardHeader>
            <CardTitle>Configuration de la Barre de Statut</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusBarVariant === 'minimal' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusBarVariant('minimal')}
              >
                Minimal
              </Button>
              <Button
                variant={statusBarVariant === 'compact' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusBarVariant('compact')}
              >
                Compact
              </Button>
              <Button
                variant={statusBarVariant === 'full' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusBarVariant('full')}
              >
                Complet
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={statusBarPosition === 'top' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusBarPosition('top')}
              >
                En haut
              </Button>
              <Button
                variant={statusBarPosition === 'bottom' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusBarPosition('bottom')}
              >
                En bas
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );

  const renderComponents = () => (
    <div className="space-y-6">
      {/* Indicateur de statut de connexion */}
      <ConnectionStatusIndicator variant="detailed" showActions={true} />
      
      {/* Gestionnaire de queue de synchronisation */}
      <SyncQueueManager variant="detailed" showActions={true} />
      
      {/* Centre de notifications */}
      <NotificationCenter variant="detailed" />
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-6">
      {/* Test des notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Test des Notifications</CardTitle>
          <CardDescription>
            Testez différents types de notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {testNotifications.map((notification, index) => (
              <Button
                key={index}
                variant="outline"
                onClick={() => addNotification(notification)}
                className="text-xs"
              >
                {notification.type}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Centre de notifications */}
      <NotificationCenter variant="detailed" />
    </div>
  );

  const renderForms = () => (
    <div className="space-y-6">
      {/* Test des formulaires adaptatifs */}
      <OfflineFormWrapper
        title="Test de Formulaire Adaptatif"
        description="Ce formulaire s'adapte automatiquement au mode offline"
        onSubmit={() => {
          addNotification({
            type: 'success',
            title: 'Formulaire soumis',
            message: 'Le formulaire a été soumis avec succès.',
          });
        }}
        showOfflineIndicator={true}
        showSyncStatus={true}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nom</label>
            <input
              type="text"
              className="w-full p-2 border rounded-md"
              placeholder="Votre nom"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border rounded-md"
              placeholder="votre@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Message</label>
            <textarea
              className="w-full p-2 border rounded-md"
              rows={3}
              placeholder="Votre message"
            />
          </div>
        </div>
      </OfflineFormWrapper>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'components':
        return renderComponents();
      case 'notifications':
        return renderNotifications();
      case 'forms':
        return renderForms();
      default:
        return renderOverview();
    }
  };

  return (
    <div className="space-y-6">
      {/* Barre de statut globale */}
      {showStatusBar && (
        <OfflineStatusBar
          variant={statusBarVariant}
          position={statusBarPosition}
        />
      )}

      {/* Navigation par onglets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Test de l'Interface Offline - Phase 4
          </CardTitle>
          <CardDescription>
            Interface de test complète pour les composants offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-6">
            {tabs.map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="flex items-center gap-2"
              >
                <span>{tab.icon}</span>
                {tab.label}
              </Button>
            ))}
          </div>

          {/* Contenu de l'onglet actif */}
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};
