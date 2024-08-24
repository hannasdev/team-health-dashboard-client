import { useApiQuery } from '../useApiQuery';

export function useHealthCheck() {
  return useApiQuery(['status'], 'health');
}
