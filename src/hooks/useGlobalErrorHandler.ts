// src/hooks/useGlobalErrorHandler.ts
import { useEffect } from 'react';

export function useGlobalErrorHandler(handler: (error: Error) => void) {
  useEffect(() => {
    const errorHandler = (event: ErrorEvent) => {
      handler(event.error);
    };

    const rejectionHandler = (event: PromiseRejectionEvent) => {
      handler(event.reason);
    };

    window.addEventListener('error', errorHandler);
    window.addEventListener('unhandledrejection', rejectionHandler);

    return () => {
      window.removeEventListener('error', errorHandler);
      window.removeEventListener('unhandledrejection', rejectionHandler);
    };
  }, [handler]);
}
