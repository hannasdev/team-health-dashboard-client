import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../useServices';
import { useAuth } from '../useAuth';
import type { IMetricData, IProgressData } from '../../interfaces';

export function useMetricsData(timePeriod: number) {
  const [metrics, setMetrics] = useState<IMetricData[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState<IProgressData | null>(null);
  const { tokenManager } = useServices();
  const { isLoggedIn } = useAuth();

  const fetchMetrics = useCallback(() => {
    if (!isLoggedIn) {
      setError(new Error('User is not authenticated'));
      setLoading(false);
      return undefined;
    }

    let abortController: AbortController | null = null;

    const handleEvent = (event: string) => {
      const lines = event.split('\n');
      let eventType = '';
      let data = '';

      for (const line of lines) {
        if (line.startsWith('event:')) {
          eventType = line.slice(6).trim();
        } else if (line.startsWith('data:')) {
          data = line.slice(5).trim();
        }
      }

      if (!eventType || !data) {
        console.warn('Incomplete event received:', event);
        return;
      }

      try {
        const parsedData = JSON.parse(data);
        switch (eventType) {
          case 'progress':
            setProgress(parsedData);
            break;
          case 'result':
            if (parsedData.success) {
              setMetrics(parsedData.data);
            } else {
              setError(new Error('Failed to fetch metrics'));
            }
            setLoading(false);
            break;
          case 'error':
            setError(new Error(parsedData.errors[0]?.message || 'An unknown error occurred'));
            setLoading(false);
            break;
          default:
            console.warn('Unknown event type:', eventType);
        }
      } catch (parseError) {
        console.error('Error parsing event data:', parseError, 'Raw data:', data);
      }
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const accessToken = tokenManager.getAccessToken();
        if (!accessToken) {
          throw new Error('No access token available');
        }

        const sseUrl = `/api/metrics?timePeriod=${timePeriod}`;
        abortController = new AbortController();

        const response = await fetch(sseUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'text/event-stream',
          },
          signal: abortController.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('ReadableStream not supported');
        }

        const decoder = new TextDecoder();
        let buffer = '';

        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            setLoading(false); // Set loading to false when the stream ends
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';

          for (const event of events) {
            handleEvent(event);
          }
        }
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          console.log('Fetch aborted');
        } else {
          setError(err instanceof Error ? err : new Error('An unknown error occurred'));
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      if (abortController) {
        abortController.abort();
      }
    };
  }, [timePeriod, isLoggedIn, tokenManager]);

  useEffect(() => {
    const cleanup = fetchMetrics();
    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [fetchMetrics]);

  return { metrics, loading, error, progress };
}
