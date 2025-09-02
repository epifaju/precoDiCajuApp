import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { useOfflineCreatePrice, useOfflineUpdatePrice, useOfflineDeletePrice, useOfflineVerifyPrice, useOfflineFileUpload, useOfflinePrices, useSyncQueue } from '../../hooks/useOfflineApi';
import { useRegions, useQualityGrades } from '../../hooks/useApi';
import { useServiceWorker } from '../../hooks/useServiceWorker';

const testPriceSchema = z.object({
  regionCode: z.string().min(1, 'Region is required'),
  qualityGrade: z.string().min(1, 'Quality grade is required'),
  priceFcfa: z.number().min(1, 'Price must be greater than 0'),
  recordedDate: z.string().min(1, 'Date is required'),
  sourceName: z.string().optional(),
  sourceType: z.enum(['market', 'cooperative', 'producer', 'trader', 'other']),
  gpsLat: z.number().optional(),
  gpsLng: z.number().optional(),
  notes: z.string().optional(),
});

type TestPriceData = z.infer<typeof testPriceSchema>;

export const OfflineMutationsTest: React.FC = () => {
  const [selectedPriceId, setSelectedPriceId] = useState<string>('');
  const [testFile, setTestFile] = useState<File | null>(null);

  // Hooks offline
  const createPriceMutation = useOfflineCreatePrice();
  const updatePriceMutation = useOfflineUpdatePrice();
  const deletePriceMutation = useOfflineDeletePrice();
  const verifyPriceMutation = useOfflineVerifyPrice();
  const fileUploadMutation = useOfflineFileUpload();
  const { prices: offlinePrices, loading: pricesLoading } = useOfflinePrices();
  const { queueItems, loading: queueLoading } = useSyncQueue();
  const { triggerSync, syncStatus, lastSyncTime } = useServiceWorker();

  // Hooks API pour les données de référence
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: qualityGrades, isLoading: qualitiesLoading } = useQualityGrades();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TestPriceData>({
    resolver: zodResolver(testPriceSchema),
    defaultValues: {
      recordedDate: new Date().toISOString().split('T')[0],
      sourceType: 'market',
    },
  });

  const onSubmit = async (data: TestPriceData) => {
    try {
      await createPriceMutation.mutateAsync(data);
      reset();
      alert('Prix créé en mode offline avec succès !');
    } catch (error) {
      console.error('Erreur lors de la création du prix:', error);
      alert('Erreur lors de la création du prix');
    }
  };

  const handleUpdatePrice = async () => {
    if (!selectedPriceId) {
      alert('Veuillez sélectionner un prix à mettre à jour');
      return;
    }

    try {
      await updatePriceMutation.mutateAsync({
        id: selectedPriceId,
        data: { notes: 'Mis à jour en mode offline' },
      });
      alert('Prix mis à jour en mode offline avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du prix:', error);
      alert('Erreur lors de la mise à jour du prix');
    }
  };

  const handleDeletePrice = async () => {
    if (!selectedPriceId) {
      alert('Veuillez sélectionner un prix à supprimer');
      return;
    }

    try {
      await deletePriceMutation.mutateAsync(selectedPriceId);
      alert('Prix supprimé en mode offline avec succès !');
    } catch (error) {
      console.error('Erreur lors de la suppression du prix:', error);
      alert('Erreur lors de la suppression du prix');
    }
  };

  const handleVerifyPrice = async () => {
    if (!selectedPriceId) {
      alert('Veuillez sélectionner un prix à vérifier');
      return;
    }

    try {
      await verifyPriceMutation.mutateAsync(selectedPriceId);
      alert('Prix vérifié en mode offline avec succès !');
    } catch (error) {
      console.error('Erreur lors de la vérification du prix:', error);
      alert('Erreur lors de la vérification du prix');
    }
  };

  const handleFileUpload = async () => {
    if (!testFile) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    try {
      await fileUploadMutation.mutateAsync(testFile);
      alert('Fichier uploadé en mode offline avec succès !');
    } catch (error) {
      console.error('Erreur lors de l\'upload du fichier:', error);
      alert('Erreur lors de l\'upload du fichier');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setTestFile(file);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Test des Mutations Offline</CardTitle>
          <CardDescription>
            Testez les fonctionnalités de création, mise à jour, suppression et vérification de prix en mode offline
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Formulaire de création de prix */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <h3 className="text-lg font-semibold">Créer un Prix Offline</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Région</label>
                <Select
                  {...register('regionCode')}
                  disabled={regionsLoading}
                >
                  <option value="">Sélectionner une région</option>
                  {regions?.map((region: any) => (
                    <option key={region.code} value={region.code}>
                      {region.name}
                    </option>
                  ))}
                </Select>
                {errors.regionCode && (
                  <p className="text-red-500 text-sm mt-1">{errors.regionCode.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Grade de Qualité</label>
                <Select
                  {...register('qualityGrade')}
                  disabled={qualitiesLoading}
                >
                  <option value="">Sélectionner un grade</option>
                  {qualityGrades?.map((quality: any) => (
                    <option key={quality.code} value={quality.code}>
                      {quality.name}
                    </option>
                  ))}
                </Select>
                {errors.qualityGrade && (
                  <p className="text-red-500 text-sm mt-1">{errors.qualityGrade.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Prix (FCFA)</label>
                <Input
                  type="number"
                  {...register('priceFcfa', { valueAsNumber: true })}
                />
                {errors.priceFcfa && (
                  <p className="text-red-500 text-sm mt-1">{errors.priceFcfa.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Date</label>
                <Input
                  type="date"
                  {...register('recordedDate')}
                />
                {errors.recordedDate && (
                  <p className="text-red-500 text-sm mt-1">{errors.recordedDate.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nom de la Source</label>
                <Input
                  {...register('sourceName')}
                  placeholder="Nom du marché, coopérative, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Type de Source</label>
                <Select {...register('sourceType')}>
                  <option value="market">Marché</option>
                  <option value="cooperative">Coopérative</option>
                  <option value="producer">Producteur</option>
                  <option value="trader">Commerçant</option>
                  <option value="other">Autre</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Latitude GPS</label>
                <Input
                  type="number"
                  step="any"
                  {...register('gpsLat', { valueAsNumber: true })}
                  placeholder="Ex: 14.6928"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Longitude GPS</label>
                <Input
                  type="number"
                  step="any"
                  {...register('gpsLng', { valueAsNumber: true })}
                  placeholder="Ex: -17.4467"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <Textarea
                {...register('notes')}
                placeholder="Notes additionnelles..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              disabled={createPriceMutation.isPending}
              className="w-full"
            >
              {createPriceMutation.isPending ? 'Création...' : 'Créer Prix Offline'}
            </Button>
          </form>

          {/* Actions sur les prix existants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Actions sur les Prix</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sélectionner un Prix</label>
              <Select
                value={selectedPriceId}
                onChange={(e) => setSelectedPriceId(e.target.value)}
              >
                <option value="">Sélectionner un prix</option>
                {offlinePrices.map((price) => (
                  <option key={price.id} value={price.id}>
                    {price.regionCode} - {price.qualityGrade} - {price.priceFcfa} FCFA
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleUpdatePrice}
                disabled={updatePriceMutation.isPending || !selectedPriceId}
                variant="outline"
              >
                {updatePriceMutation.isPending ? 'Mise à jour...' : 'Mettre à Jour'}
              </Button>

              <Button
                onClick={handleDeletePrice}
                disabled={deletePriceMutation.isPending || !selectedPriceId}
                variant="destructive"
              >
                {deletePriceMutation.isPending ? 'Suppression...' : 'Supprimer'}
              </Button>

              <Button
                onClick={handleVerifyPrice}
                disabled={verifyPriceMutation.isPending || !selectedPriceId}
                variant="secondary"
              >
                {verifyPriceMutation.isPending ? 'Vérification...' : 'Vérifier'}
              </Button>
            </div>
          </div>

          {/* Upload de fichier */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload de Fichier Offline</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Sélectionner un Fichier</label>
              <Input
                type="file"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
            </div>

            <Button
              onClick={handleFileUpload}
              disabled={fileUploadMutation.isPending || !testFile}
              variant="outline"
            >
              {fileUploadMutation.isPending ? 'Upload...' : 'Uploader Fichier Offline'}
            </Button>
          </div>

          {/* Synchronisation */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Synchronisation</h3>
            
            <div className="flex items-center gap-4">
              <Button
                onClick={triggerSync}
                disabled={syncStatus === 'syncing'}
                variant="default"
              >
                {syncStatus === 'syncing' ? 'Synchronisation...' : 'Déclencher Sync'}
              </Button>
              
              <div className="text-sm text-gray-600">
                Statut: {syncStatus} | Dernière sync: {lastSyncTime || 'Jamais'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Liste des prix offline */}
      <Card>
        <CardHeader>
          <CardTitle>Prix Offline ({offlinePrices.length})</CardTitle>
          <CardDescription>
            Liste des prix créés en mode offline
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pricesLoading ? (
            <p>Chargement des prix offline...</p>
          ) : offlinePrices.length === 0 ? (
            <p className="text-gray-500">Aucun prix offline</p>
          ) : (
            <div className="space-y-2">
              {offlinePrices.map((price) => (
                <div key={price.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{price.regionCode} - {price.qualityGrade}</p>
                      <p className="text-sm text-gray-600">{price.priceFcfa} FCFA</p>
                      <p className="text-xs text-gray-500">
                        Créé le {new Date(price.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      price.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      price.status === 'synced' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {price.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Queue de synchronisation */}
      <Card>
        <CardHeader>
          <CardTitle>Queue de Synchronisation ({queueItems.length})</CardTitle>
          <CardDescription>
            Éléments en attente de synchronisation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {queueLoading ? (
            <p>Chargement de la queue...</p>
          ) : queueItems.length === 0 ? (
            <p className="text-gray-500">Aucun élément en attente</p>
          ) : (
            <div className="space-y-2">
              {queueItems.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{item.action}</p>
                      <p className="text-sm text-gray-600">
                        Créé le {new Date(item.createdAt).toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        Tentatives: {item.attempts}/{item.maxAttempts}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      item.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      item.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
