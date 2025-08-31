import React from 'react';
import { Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LoginForm } from '../../components/auth/LoginForm';
import { useAuthStore } from '../../store/authStore';

const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and branding */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Preço di Caju
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {t('app.tagline', 'Cashew Price Tracking for Guinea-Bissau')}
          </p>
        </div>

        <LoginForm />

        {/* Additional info */}
        <div className="text-center">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
              {t('login.demo.title', 'Demo Accounts')}
            </h3>
            <div className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <p><strong>Admin:</strong> admin@precaju.gw / password123</p>
              <p><strong>Producer:</strong> produtor@test.gw / produtor123</p>
              <p><strong>Trader:</strong> comerciante@test.gw / comerciante123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;