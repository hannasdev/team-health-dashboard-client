// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppLayout from './AppLayout';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useGlobalErrorHandler } from './hooks/useGlobalErrorHandler';
import { Suspense, lazy } from 'react';
import { CircularProgress } from '@mui/material';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const HealthCheck = lazy(() => import('./pages/HealthCheck'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

function App() {
  useGlobalErrorHandler((error) => {
    console.error('Global error:', error);
    // Add logic to show a user-friendly error message
    // Log the error to your error reporting service here
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AppLayout>
          <Suspense fallback={<CircularProgress />}>
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route
                path="/healthcheck"
                element={
                  <ProtectedRoute>
                    <HealthCheck />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AppLayout>
      </Router>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
