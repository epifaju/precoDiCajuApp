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
import { useRegions, useQualityGrades, useCreatePrice } from '../../hooks/useApi';
import { useAuthStore } from '../../store/authStore';

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

interface PriceSubmissionFormProps {
  onSuccess?: () => void;
  className?: string;
}

export const PriceSubmissionForm: React.FC<PriceSubmissionFormProps> = ({
  onSuccess,
  className,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [files, setFiles] = useState<File[]>([]);
  const [locationLoading, setLocationLoading] = useState(false);

  // API queries
  const { data: regions, isLoading: regionsLoading } = useRegions();
  const { data: qualityGrades, isLoading: qualitiesLoading } = useQualityGrades();
  const createPriceMutation = useCreatePrice();

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
        let message = 'Unable to get location';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location access denied by user';
            break;
          case error.POSITION_UNAVAILABLE:
            message = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            message = 'Location request timed out';
            break;
        }
        setError('root', { message });
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
      const submitData = {
        ...data,
        photoFile: files[0],
      };

      await createPriceMutation.mutateAsync(submitData);
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/prices');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit price';
      setError('root', { message: errorMessage });
    }
  };

  // Region options
  const regionOptions = (regions || []).map(region => ({
    value: region.code,
    label: region.namePt, // TODO: Use localized name based on language
  }));

  // Quality options
  const qualityOptions = (qualityGrades || []).map(quality => ({
    value: quality.code,
    label: `${quality.namePt} - ${quality.descriptionPt}`,
  }));

  // Source type options
  const sourceTypeOptions = [
    { value: 'market', label: t('forms.sourceType.market', 'Market') },
    { value: 'cooperative', label: t('forms.sourceType.cooperative', 'Cooperative') },
    { value: 'producer', label: t('forms.sourceType.producer', 'Producer') },
    { value: 'trader', label: t('forms.sourceType.trader', 'Trader') },
    { value: 'other', label: t('forms.sourceType.other', 'Other') },
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle>{t('forms.submitPrice.title', 'Submit Cashew Price')}</CardTitle>
          <CardDescription>
            {t('forms.submitPrice.description', 'Share current cashew prices with the community to help everyone stay informed about market conditions.')}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Global error */}
            {errors.root && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                <p className="text-red-700 dark:text-red-400 text-sm">
                  {errors.root.message}
                </p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Region */}
              <Controller
                name="regionCode"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('forms.region', 'Region')}
                    options={regionOptions}
                    placeholder={t('forms.selectRegion', 'Select a region')}
                    error={errors.regionCode?.message}
                    loading={regionsLoading}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    }
                    {...field}
                  />
                )}
              />

              {/* Quality Grade */}
              <Controller
                name="qualityGrade"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('forms.qualityGrade', 'Quality Grade')}
                    options={qualityOptions}
                    placeholder={t('forms.selectQuality', 'Select quality grade')}
                    error={errors.qualityGrade?.message}
                    loading={qualitiesLoading}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    }
                    {...field}
                  />
                )}
              />
            </div>

            {/* Price and Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Price */}
              <Input
                label={t('forms.price', 'Price (FCFA)')}
                type="number"
                placeholder="2500"
                error={errors.priceFcfa?.message}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                }
                rightAddon="FCFA"
                helpText={t('forms.priceHelp', 'Price per kilogram in West African CFA francs')}
                {...register('priceFcfa', { valueAsNumber: true })}
              />

              {/* Date */}
              <Input
                label={t('forms.recordedDate', 'Recorded Date')}
                type="date"
                error={errors.recordedDate?.message}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
                helpText={t('forms.dateHelp', 'When was this price observed?')}
                {...register('recordedDate')}
              />
            </div>

            {/* Source Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Source Name */}
              <Input
                label={t('forms.sourceName', 'Source Name (Optional)')}
                placeholder={t('forms.sourceNamePlaceholder', 'e.g., Central Market Bissau')}
                error={errors.sourceName?.message}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                }
                helpText={t('forms.sourceNameHelp', 'Name of the market, cooperative, or location')}
                {...register('sourceName')}
              />

              {/* Source Type */}
              <Controller
                name="sourceType"
                control={control}
                render={({ field }) => (
                  <Select
                    label={t('forms.sourceType.label', 'Source Type')}
                    options={sourceTypeOptions}
                    error={errors.sourceType?.message}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    }
                    {...field}
                  />
                )}
              />
            </div>

            {/* GPS Location */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {t('forms.location', 'Location Information')}
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  loading={locationLoading}
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  }
                >
                  {t('forms.getCurrentLocation', 'Get Current Location')}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label={t('forms.latitude', 'Latitude (Optional)')}
                  type="number"
                  step="any"
                  placeholder="11.8637"
                  error={errors.gpsLat?.message}
                  helpText={t('forms.latitudeHelp', 'GPS latitude coordinate')}
                  {...register('gpsLat', { valueAsNumber: true })}
                />

                <Input
                  label={t('forms.longitude', 'Longitude (Optional)')}
                  type="number"
                  step="any"
                  placeholder="-15.5983"
                  error={errors.gpsLng?.message}
                  helpText={t('forms.longitudeHelp', 'GPS longitude coordinate')}
                  {...register('gpsLng', { valueAsNumber: true })}
                />
              </div>
            </div>

            {/* Photo Upload */}
            <FileUpload
              label={t('forms.photo', 'Photo (Optional)')}
              helpText={t('forms.photoHelp', 'Upload a photo of the cashews or price display (max 5MB)')}
              maxSize={5 * 1024 * 1024}
              maxFiles={1}
              value={files}
              onFilesChange={setFiles}
              accept={{
                'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp']
              }}
            />

            {/* Notes */}
            <Textarea
              label={t('forms.notes', 'Additional Notes (Optional)')}
              placeholder={t('forms.notesPlaceholder', 'Any additional information about this price...')}
              error={errors.notes?.message}
              helpText={t('forms.notesHelp', 'Market conditions, quality observations, etc.')}
              rows={4}
              {...register('notes')}
            />

            {/* Submit Button */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/prices')}
              >
                {t('forms.cancel', 'Cancel')}
              </Button>
              
              <Button
                type="submit"
                loading={isSubmitting || createPriceMutation.isPending}
                disabled={isSubmitting || createPriceMutation.isPending}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                }
              >
                {t('forms.submitPrice', 'Submit Price')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

