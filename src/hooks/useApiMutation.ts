import { useMutation } from '@tanstack/react-query';
import type { UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { useServices } from './useServices';

export function useApiMutation<T, S extends Record<string, unknown>>(
  url: string,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST',
  options?: Omit<UseMutationOptions<T, Error, S>, 'mutationFn'>
): UseMutationResult<T, Error, S> {
  const { apiService } = useServices();

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
