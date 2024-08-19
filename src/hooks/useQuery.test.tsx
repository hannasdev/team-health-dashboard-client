import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useApiQuery, useApiMutation } from './useQuery';
import { ApiService } from '../services/ApiService';

// Create a test QueryClient
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

// Wrapper component for rendering hooks with QueryClientProvider
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('useApiQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch and return data successfully', async () => {
    const mockData = { message: 'Success!' };
    jest.spyOn(ApiService.prototype, 'get').mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiQuery(['testKey'], '/test'), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBeFalsy();
      expect(result.current.data).toEqual(mockData);
    });

    expect(ApiService.prototype.get).toHaveBeenCalledWith('/test', {});
  });

  it('should pass query parameters correctly', async () => {
    const mockData = [{ id: 1, name: 'Item 1' }];
    jest.spyOn(ApiService.prototype, 'get').mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        useApiQuery(['testKey', { page: 1, limit: 10 }], '/test', {
          initialParam: 'value',
        }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });

    expect(ApiService.prototype.get).toHaveBeenCalledWith('/test', {
      page: 1,
      limit: 10,
      initialParam: 'value',
    });
    expect(result.current.data).toEqual(mockData);
  });
});

describe('useApiMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should make a POST request and return data', async () => {
    const mockData = { id: 1, message: 'Created!' };
    jest.spyOn(ApiService.prototype, 'post').mockResolvedValue(mockData);

    const { result } = renderHook(() => useApiMutation('/test'), { wrapper });

    act(() => {
      result.current.mutate({ name: 'Test' });
    });

    await waitFor(() => {
      expect(ApiService.prototype.post).toHaveBeenCalledWith('/test', {
        name: 'Test',
      });
    });
  });
});
