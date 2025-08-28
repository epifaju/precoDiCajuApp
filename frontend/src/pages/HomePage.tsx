import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Dashboard } from '../components/dashboard/Dashboard';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Show dashboard for authenticated users
  return (
    <div className="container mx-auto px-4 py-8">
      <Dashboard />
    </div>
  );
};

export default HomePage;