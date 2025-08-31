import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Save, User, Phone, MapPin } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useApi } from '../../hooks/useApi';

interface EditProfileFormWorkingProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditProfileFormWorking: React.FC<EditProfileFormWorkingProps> = ({ onClose, onSuccess }) => {
  const { t } = useTranslation();
  const { user, updateUser } = useAuthStore();
  const api = useApi();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [preferredRegions, setPreferredRegions] = useState<string[]>([]);

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setPhone(user.phone || '');
      setPreferredRegions(user.preferredRegions || []);
    }
  }, [user]);

  const availableRegions = [
    'Bafatá', 'Gabú', 'Bissau', 'Cacheu', 'Quinara', 'Tombali', 'Bolama', 'Oio', 'Biombo'
  ];

  const toggleRegion = (region: string) => {
    setPreferredRegions(prev => {
      if (prev.includes(region)) {
        return prev.filter(r => r !== region);
      } else {
        return [...prev, region];
      }
    });
  };

  const validateForm = () => {
    if (!fullName || fullName.trim().length < 2) {
      setError('profile.form.fullName.min');
      return false;
    }
    if (fullName.trim().length > 100) {
      setError('profile.form.fullName.max');
      return false;
    }
    if (phone && !/^[\+]?[0-9]{8,15}$/.test(phone)) {
      setError('profile.form.phone.invalid');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submitted!');
    console.log('Form data:', { fullName, phone, preferredRegions });
    
    if (!user) {
      console.error('No user data available');
      return;
    }

    // Clear previous messages
    setError(null);
    setSuccessMessage(null);

    // Validate form
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    console.log('Form validation passed, submitting...');
    setIsSubmitting(true);

    try {
      const requestData = {
        fullName: fullName.trim(),
        phone: phone.trim() || null,
        preferredRegions,
      };

      console.log('Sending API request:', requestData);

      const updatedUser = await api.put('/api/v1/users/me', requestData);

      console.log('API response received:', updatedUser);

      // Update local state
      updateUser(updatedUser as any);
      
      setSuccessMessage('profile.form.success.update');
      
      console.log('Profile updated successfully, closing in 1.5 seconds...');
      
      // Wait before closing to show success message
      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        onClose();
      }, 1500);
      
    } catch (err) {
      console.error('Profile update error:', err);
      const errorMessage = err instanceof Error ? err.message : 'profile.form.error.update';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked');
    onClose();
  };

  if (!user) {
    console.log('No user data, returning null');
    return null;
  }

  console.log('Rendering EditProfileFormWorking with user:', user);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {t('profile.edit.title')}
          </h2>
          <button
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success message */}
          {successMessage && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3">
              <p className="text-green-700 dark:text-green-400 text-sm">
                {t(successMessage)}
              </p>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">
                {t(error)}
              </p>
            </div>
          )}

          {/* Full Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.form.fullName.label') || 'Full Name'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                placeholder={t('profile.form.fullName.placeholder') || 'Your full name'}
                required
                minLength={2}
                maxLength={100}
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('profile.form.phone.label') || 'Phone'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:border-gray-600"
                placeholder={t('profile.form.phone.placeholder') || '+245 12345678'}
                pattern="^[\+]?[0-9]{8,15}$"
              />
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t('profile.form.phone.help') || 'Optional phone number'}
            </p>
          </div>

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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={preferredRegions.includes(region)}
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

          {/* Debug info */}
          {import.meta.env.DEV && (
            <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded text-xs">
              <p><strong>Debug Info:</strong></p>
              <p>Full Name: "{fullName}" (length: {fullName.length})</p>
              <p>Phone: "{phone}"</p>
              <p>Preferred Regions: {JSON.stringify(preferredRegions)}</p>
              <p>Form valid: {fullName.trim().length >= 2 ? 'Yes' : 'No'}</p>
              <p>isSubmitting: {isSubmitting ? 'Yes' : 'No'}</p>
              <p>Error: {error || 'None'}</p>
              <p>Success: {successMessage || 'None'}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={fullName.trim().length < 2 || isSubmitting}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              {t('common.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
