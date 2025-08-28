import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { RegisterForm } from '../../components/auth/RegisterForm';
import { useAuthStore } from '../../store/authStore';

const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a1.5 1.5 0 01-3 0V5.5a1.5 1.5 0 013 0V6.5a1.5 1.5 0 010 3zm0 0h.008v.008H21V9.75z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Preço di Caju
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('app.tagline', 'Cashew Price Tracking for Guinea-Bissau')}
          </p>
        </div>

        <RegisterForm />

        {/* Benefits section */}
        <div className="text-center">
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-300 mb-2">
              {t('register.benefits.title', 'Join Our Community')}
            </h3>
            <div className="text-xs text-green-700 dark:text-green-400 space-y-1">
              <p>📊 {t('register.benefits.tracking', 'Track real-time cashew prices')}</p>
              <p>🏆 {t('register.benefits.reputation', 'Build your market reputation')}</p>
              <p>📱 {t('register.benefits.mobile', 'Access from any device, even offline')}</p>
              <p>🤝 {t('register.benefits.community', 'Connect with producers and traders')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;