// src/components/ErrorBoundary/ErrorBoundary.tsx
import React from 'react';
import type { ErrorInfo } from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../ErrorFallback';
import type { IErrorFallbackProps } from '../ErrorFallback';

interface IErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<IErrorFallbackProps>;
  onError?: (error: Error, info: ErrorInfo) => void;
}

function ErrorBoundary({ children, fallback = ErrorFallback, onError }: IErrorBoundaryProps) {
  const handleError = (error: Error, info: ErrorInfo) => {
    console.error('Uncaught error:', error, info);
    onError?.(error, info);
  };

  return (
    <ReactErrorBoundary FallbackComponent={fallback} onError={handleError}>
      {children}
    </ReactErrorBoundary>
  );
}

export default ErrorBoundary;
