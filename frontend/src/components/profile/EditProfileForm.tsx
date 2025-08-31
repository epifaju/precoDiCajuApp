import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { X, Save, User, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';

const editProfileSchema = z.object({
  fullName: z.string()
    .min(2, 'min_length')
    .max(100, 'max_length'),
  phone: z.string()
    .regex(/^[\+]?[0-9]{8,15}$/, 'invalid_format')
    .optional()
    .or(z.literal('')),
  preferredRegions: z.array(z.string()).min(0),
});

type EditProfileData = z.infer<typeof editProfileSchema>;

interface EditProfileFormProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const api = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
    watch,
  } = useForm<EditProfileData>({
    resolver: zodResolver(editProfileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      phone: user?.phone || '',
      preferredRegions: user?.preferredRegions || [],
    },
  });

  const watchedRegions = watch('preferredRegions');

  const availableRegions = [
    'Bafatá', 'Gabú', 'Bissau', 'Cacheu', 'Quinara', 'Tombali', 'Bolama', 'Oio', 'Biombo'
  ];

  const toggleRegion = (region: string) => {
    const currentRegions = watchedRegions || [];
    if (currentRegions.includes(region)) {
      setValue('preferredRegions', currentRegions.filter(r => r !== region));
    } else {
      setValue('preferredRegions', [...currentRegions, region]);
    }
  };

  const onSubmit = async (data: EditProfileData) => {
    if (!user) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const updatedUser = await api.put('/api/v1/users/me', {
        fullName: data.fullName,
        phone: data.phone || null,
        preferredRegions: data.preferredRegions,
      });

      // Update local state
      updateUser(updatedUser as any);
      
      if (onSuccess) {
        onSuccess();
      }
      
      onClose();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'profile.form.error.update';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get translated error message
  const getErrorMessage = (errorType: string | undefined, field: string) => {
    if (!errorType) return undefined;
    
    const errorMap: Record<string, string> = {
      'min_length': `profile.form.${field}.min`,
      'max_length': `profile.form.${field}.max`,
      'invalid_format': `profile.form.${field}.invalid`,
    };
    
    const translationKey = errorMap[errorType];
    return translationKey ? t(translationKey) || errorType : errorType;
  };

  if (!user) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('profile.edit.title')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">
                {t(error)}
              </p>
            </div>
          )}

          {/* Full Name */}
          <Input
            label={t('profile.form.fullName.label') || 'Full Name'}
            type="text"
            autoComplete="name"
            placeholder={t('profile.form.fullName.placeholder') || 'Your full name'}
            error={getErrorMessage(errors.fullName?.message, 'fullName')}
            leftIcon={<User className="w-4 h-4" />}
            {...register('fullName')}
          />

          {/* Phone */}
          <Input
            label={t('profile.form.phone.label') || 'Phone'}
            type="tel"
            autoComplete="tel"
            placeholder={t('profile.form.phone.placeholder') || '+245 12345678'}
            error={getErrorMessage(errors.phone?.message, 'phone')}
            helpText={t('profile.form.phone.help') || 'Optional phone number'}
            leftIcon={<Phone className="w-4 h-4" />}
            {...register('phone')}
          />

          {/* Preferred Regions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {t('profile.form.preferredRegions.label') || 'Preferred Regions'}
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {availableRegions.map((region) => (
                <label key={region} className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    checked={watchedRegions?.includes(region) || false}
                    onChange={() => toggleRegion(region)}
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    {region}
                  </span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              {t('profile.form.preferredRegions.help') || 'Select the regions where you operate or have interest'}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={!isValid || isSubmitting}
              loading={isSubmitting}
            >
              <Save className="w-4 h-4 mr-2" />
              {t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

