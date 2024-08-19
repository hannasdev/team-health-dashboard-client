import { useQuery, useMutation } from '@tanstack/react-query';
import type {
  UseQueryOptions,
  UseMutationOptions,
  UseQueryResult,
  UseMutationResult,
  QueryKey,
} from '@tanstack/react-query';
import { ApiErrorHandler } from '../services/ApiErrorHandler';
import { TokenManager } from '../services/TokenManager';
import { ApiService } from '../services/ApiService';
import { LocalStorageService } from '../services/LocalStorageService';

const apiErrorHandler = new ApiErrorHandler();
const localStorageService = new LocalStorageService();
const tokenManager = new TokenManager(localStorageService);

export const apiService = new ApiService(
  process.env.REACT_APP_API_URL || 'http://localhost:3000/',
  apiErrorHandler,
  tokenManager
);

export function useApiQuery<T>(
  key: QueryKey,
  url: string,
  params?: Record<string, unknown>,
  options?: Omit<UseQueryOptions<T, Error, T>, 'queryKey' | 'queryFn'>
): UseQueryResult<T> {
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
        // console.log('Calling API with:', url, mergedParams);
        const result = await apiService.get<T>(url, mergedParams);
        // console.log('API call successful:', result);
        return result;
      } catch (error) {
        // console.error('API call failed:', error);
        throw error instanceof Error ? error : new Error('Unknown error occurred');
      }
    },
    retry: false,
    ...options,
  });
}

export function useApiMutation<T, S extends Record<string, unknown>>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: Omit<UseMutationOptions<T, Error, S>, 'mutationFn'>
): UseMutationResult<T, Error, S> {
  return useMutation<T, Error, S>({
    mutationFn: async (data: S): Promise<T> => {
      switch (method) {
        case 'POST':
          return await apiService.post<T>(url, data);
        case 'PUT':
          return await apiService.put<T>(url, data);
        case 'DELETE':
          return await apiService.delete<T>(url);
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
    },
    ...options,
  });
}

export function useHealthCheck() {
  return useApiQuery(['status'], 'health');
}
// // Example of a custom hook for a specific API endpoint
// export function useUserProfile(userId: string) {
//   return useApiQuery(['userProfile', userId], `/users/${userId}`);
// }

// // Example of a custom mutation hook
// export function useUpdateUserProfile() {
//   return useApiMutation('/users', 'PUT');
// }
