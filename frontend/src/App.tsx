import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Suspense, lazy } from 'react';

// Components
import Layout from '@/components/layout/Layout';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { WebSocketNotifications } from '@/components/WebSocketNotifications';
import { ToastContainer } from '@/components/ui/Toast';
import { useNotificationStore } from '@/store/notificationStore';

// Lazy loaded pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const PricesPage = lazy(() => import('@/pages/PricesPage'));
const PricesMapPage = lazy(() => import('@/pages/PricesMapPage'));
const POIMapPage = lazy(() => import('@/pages/POIMapPage'));
const SubmitPricePage = lazy(() => import('@/pages/SubmitPricePage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));
const ExportersPage = lazy(() => import('@/pages/ExportersPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function App() {
  const { i18n } = useTranslation();
  const { toasts, removeToast } = useNotificationStore();

  // Update document language
  document.documentElement.lang = i18n.language;

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* WebSocket Notifications */}
        <WebSocketNotifications />
        
        {/* Toast Notifications */}
        <ToastContainer toasts={toasts} onRemoveToast={removeToast} />
        <Routes>
          {/* Auth routes without layout */}
          <Route 
            path="/login" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LoginPage />
              </Suspense>
            } 
          />
          <Route 
            path="/register" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <RegisterPage />
              </Suspense>
            } 
          />
          
          {/* Main routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route 
              index 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <HomePage />
                </Suspense>
              } 
            />
            <Route 
              path="dashboard" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <DashboardPage />
                </Suspense>
              } 
            />
            <Route 
              path="prices" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PricesPage />
                </Suspense>
              } 
            />
            <Route 
              path="map" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <PricesMapPage />
                </Suspense>
              } 
            />
            <Route 
              path="poi" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <POIMapPage />
                </Suspense>
              } 
            />
            <Route 
              path="submit" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <SubmitPricePage />
                </Suspense>
              } 
            />
            <Route 
              path="profile" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ProfilePage />
                </Suspense>
              } 
            />
            <Route 
              path="admin" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <AdminPage />
                </Suspense>
              } 
            />
            <Route 
              path="exporters" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <ExportersPage />
                </Suspense>
              } 
            />
          </Route>
          
          {/* 404 route */}
          <Route 
            path="*" 
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <NotFoundPage />
              </Suspense>
            } 
          />
        </Routes>
      </div>
    </ErrorBoundary>
  );
}

export default App;
