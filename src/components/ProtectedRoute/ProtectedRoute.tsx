import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { LocalStorageService } from '../../services/LocalStorageService/LocalStorageService';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation();
  const storageService = new LocalStorageService();
  const isAuthenticated = !!storageService.getItem('token');

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
