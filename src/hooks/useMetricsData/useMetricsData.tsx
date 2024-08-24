import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../useServices';
import { useAuth } from '../useAuth';

interface MetricsData {
  // Define the structure of your metrics data here
  // For example:
  id: string;
  value: number;
  timestamp: string;
}

export function useMetricsData(timePeriod: number) {
  const [metrics, setMetrics] = useState<MetricsData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { apiService } = useServices();
  const { isLoggedIn } = useAuth();

  const fetchMetrics = useCallback(async () => {
    if (!isLoggedIn) {
      setError(new Error('User is not authenticated'));
      setLoading(false);
      return () => {}; // Return a no-op cleanup function
    }

    let eventSource: EventSource | null = null;

    try {
      setLoading(true);
      setError(null);

      // Use apiService to get the SSE endpoint URL
      const sseUrl = await apiService.get<string>('api/metrics', { timePeriod });

      eventSource = new EventSource(sseUrl, { withCredentials: true });

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.progress !== undefined) {
          // Handle progress updates if needed
        } else {
          setMetrics(data);
          setLoading(false);
        }
      };

      eventSource.onerror = () => {
        setError(new Error('An error occurred while fetching metrics'));
        setLoading(false);
        eventSource?.close();
      };
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setLoading(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [timePeriod, apiService, isLoggedIn]);

  useEffect(() => {
    let cleanup: (() => void) | undefined;

    fetchMetrics()
      .then((cleanupFn) => {
        cleanup = cleanupFn;
      })
      .catch((err: unknown) => {
        console.error('Error in fetchMetrics:', err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
        setLoading(false);
      });

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [fetchMetrics]);

  return { metrics, loading, error };
}
