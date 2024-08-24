import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions, UseQueryResult, QueryKey } from '@tanstack/react-query';
import { useServices } from '../useServices';

export function useApiQuery<T>(
  key: QueryKey,
  url: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>
): UseQueryResult<T> {
  const { apiService } = useServices(); // Get apiService from useServices

  return useQuery<T>({
    queryKey: key,
    queryFn: async ({ queryKey }) => {
      try {
        const lastKeyItem = queryKey[queryKey.length - 1];
        const queryParams =
          typeof lastKeyItem === 'object' && lastKeyItem !== null
            ? (lastKeyItem as Record<string, unknown>)
            : {};
        const mergedParams = { ...params, ...queryParams };
        const result = await apiService.get<T>(url, mergedParams); // Use apiService.get
        return result;
      } catch (error) {
        throw error instanceof Error ? error : new Error('Unknown error occurred');
      }
    },
    retry: false,
    ...options,
  });
}
