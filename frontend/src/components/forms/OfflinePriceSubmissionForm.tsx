import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { FileUpload } from '../ui/FileUpload';
import { Button } from '../ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { useRegions, useQualityGrades } from '../../hooks/useApi';
import { useOfflineCreatePrice } from '../../hooks/useOfflineApi';
import { useAuthStore } from '../../store/authStore';
import { useServiceWorker } from '../../hooks/useServiceWorker';

const priceSubmissionSchema = z.object({
  regionCode: z.string().min(1, 'Region is required'),
  qualityGrade: z.string().min(1, 'Quality grade is required'),
  priceFcfa: z.number()
    .min(1, 'Price must be greater than 0')
    .max(100000, 'Price seems too high, please verify'),
  recordedDate: z.string().min(1, 'Date is required'),
  sourceName: z.string()
    .min(2, 'Source name must be at least 2 characters')
    .max(100, 'Source name must not exceed 100 characters')
    .optional()
    .or(z.literal('')),
  sourceType: z.enum(['market', 'cooperative', 'producer', 'trader', 'other']),
  gpsLat: z.number()
    .min(-90, 'Invalid latitude')
    .max(90, 'Invalid latitude')
    .optional(),
  gpsLng: z.number()
    .min(-180, 'Invalid longitude')
    .max(180, 'Invalid longitude')
    .optional(),
  notes: z.string()
    .max(1000, 'Notes must not exceed 1000 characters')
    .optional()
    .or(z.literal('')),
  photoFile: z.instanceof(File).optional(),
});

type PriceSubmissionData = z.infer<typeof priceSubmissionSchema>;

interface OfflinePriceSubmissionFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const OfflinePriceSubmissionForm: React.FC<OfflinePriceSubmissionFormProps> = ({
  onSuccess,
  className,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [files, setFiles] = useState<File[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Hooks offline
  const createPriceMutation = useOfflineCreatePrice();
  const { syncStatus, lastSyncTime } = useServiceWorker();

  // API queries pour les données de référence
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: qualityGrades, isLoading: qualitiesLoading } = useQualityGrades();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PriceSubmissionData>({
    resolver: zodResolver(priceSubmissionSchema),
    defaultValues: {
      recordedDate: new Date().toISOString().split('T')[0],
      sourceType: 'market',
    },
  });

  const watchedRegion = watch('regionCode');
  const watchedQuality = watch('qualityGrade');

  // Surveiller le statut de connexion
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get current location
  const getCurrentLocation = () => {
    setLocationLoading(true);
    
    if (!navigator.geolocation) {
      setError('root', { message: 'Geolocation is not supported by this browser' });
      setLocationLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue('gpsLat', Number(position.coords.latitude.toFixed(6)));
        setValue('gpsLng', Number(position.coords.longitude.toFixed(6)));
        setLocationLoading(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        setError('root', { message: 'Failed to get current location' });
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      }
    );
  };

  const onSubmit = async (data: PriceSubmissionData) => {
    try {
      await createPriceMutation.mutateAsync(data);
      
      // Afficher un message de succès adapté au mode offline
      if (isOnline) {
        alert('Prix soumis avec succès !');
      } else {
        alert('Prix sauvegardé en mode offline. Il sera synchronisé dès que la connexion sera rétablie.');
      }
      
      // Réinitialiser le formulaire
      setFiles([]);
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting price:', error);
      setError('root', { 
        message: 'Erreur lors de la soumission du prix. Veuillez réessayer.' 
      });
    }
  };

  const handleFileChange = (newFiles: File[]) => {
    setFiles(newFiles);
    if (newFiles.length > 0) {
      setValue('photoFile', newFiles[0]);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Soumission de Prix
          {!isOnline && (
            <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
              Mode Offline
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {isOnline 
            ? 'Soumettez un nouveau prix de cajou. Les données seront synchronisées en temps réel.'
            : 'Mode offline activé. Votre prix sera sauvegardé localement et synchronisé dès que la connexion sera rétablie.'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Informations de base */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Région *
              </label>
              <Select
                {...register('regionCode')}
                disabled={regionsLoading}
                className={errors.regionCode ? 'border-red-500' : ''}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Grade de Qualité *
              </label>
              <Select
                {...register('qualityGrade')}
                disabled={qualitiesLoading}
                className={errors.qualityGrade ? 'border-red-500' : ''}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prix (FCFA) *
              </label>
              <Input
                type="number"
                {...register('priceFcfa', { valueAsNumber: true })}
                placeholder="Ex: 1500"
                className={errors.priceFcfa ? 'border-red-500' : ''}
              />
              {errors.priceFcfa && (
                <p className="text-red-500 text-sm mt-1">{errors.priceFcfa.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date d'Enregistrement *
              </label>
              <Input
                type="date"
                {...register('recordedDate')}
                className={errors.recordedDate ? 'border-red-500' : ''}
              />
              {errors.recordedDate && (
                <p className="text-red-500 text-sm mt-1">{errors.recordedDate.message}</p>
              )}
            </div>
          </div>

          {/* Informations sur la source */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom de la Source
              </label>
              <Input
                {...register('sourceName')}
                placeholder="Ex: Marché de Colobane"
                className={errors.sourceName ? 'border-red-500' : ''}
              />
              {errors.sourceName && (
                <p className="text-red-500 text-sm mt-1">{errors.sourceName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type de Source *
              </label>
              <Select
                {...register('sourceType')}
                className={errors.sourceType ? 'border-red-500' : ''}
              >
                <option value="market">Marché</option>
                <option value="cooperative">Coopérative</option>
                <option value="producer">Producteur</option>
                <option value="trader">Commerçant</option>
                <option value="other">Autre</option>
              </Select>
              {errors.sourceType && (
                <p className="text-red-500 text-sm mt-1">{errors.sourceType.message}</p>
              )}
            </div>
          </div>

          {/* Localisation GPS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">Localisation GPS</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={getCurrentLocation}
                disabled={locationLoading}
              >
                {locationLoading ? 'Récupération...' : 'Utiliser ma position'}
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Latitude
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register('gpsLat', { valueAsNumber: true })}
                  placeholder="Ex: 14.6928"
                  className={errors.gpsLat ? 'border-red-500' : ''}
                />
                {errors.gpsLat && (
                  <p className="text-red-500 text-sm mt-1">{errors.gpsLat.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Longitude
                </label>
                <Input
                  type="number"
                  step="any"
                  {...register('gpsLng', { valueAsNumber: true })}
                  placeholder="Ex: -17.4467"
                  className={errors.gpsLng ? 'border-red-500' : ''}
                />
                {errors.gpsLng && (
                  <p className="text-red-500 text-sm mt-1">{errors.gpsLng.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <Textarea
              {...register('notes')}
              placeholder="Notes additionnelles sur ce prix..."
              rows={3}
              className={errors.notes ? 'border-red-500' : ''}
            />
            {errors.notes && (
              <p className="text-red-500 text-sm mt-1">{errors.notes.message}</p>
            )}
          </div>

          {/* Upload de photo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Photo (optionnel)
            </label>
            <Controller
              name="photoFile"
              control={control}
              render={({ field }) => (
                <FileUpload
                  files={files}
                  onFilesChange={handleFileChange}
                  accept="image/*"
                  maxFiles={1}
                  maxSize={5 * 1024 * 1024} // 5MB
                />
              )}
            />
            {errors.photoFile && (
              <p className="text-red-500 text-sm mt-1">{errors.photoFile.message}</p>
            )}
          </div>

          {/* Statut de synchronisation */}
          {!isOnline && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <p className="text-sm text-orange-800">
                  Mode offline activé. Votre prix sera synchronisé dès que la connexion sera rétablie.
                </p>
              </div>
            </div>
          )}

          {/* Erreurs générales */}
          {errors.root && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{errors.root.message}</p>
            </div>
          )}

          {/* Boutons d'action */}
          <div className="flex gap-4">
            <Button
              type="submit"
              disabled={isSubmitting || createPriceMutation.isPending}
              className="flex-1"
            >
              {createPriceMutation.isPending 
                ? 'Sauvegarde...' 
                : isOnline 
                  ? 'Soumettre le Prix' 
                  : 'Sauvegarder en Offline'
              }
            </Button>
            
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
            >
              Annuler
            </Button>
          </div>
        </form>

        {/* Informations de synchronisation */}
        <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Statut de Synchronisation</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Statut: {syncStatus}</p>
            <p>Dernière synchronisation: {lastSyncTime || 'Jamais'}</p>
            <p>Connexion: {isOnline ? 'En ligne' : 'Hors ligne'}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
