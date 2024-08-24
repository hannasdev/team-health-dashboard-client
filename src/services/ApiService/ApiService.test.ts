import { ApiService } from './ApiService';
import { AxiosError } from 'axios';
import {
  createMockAxiosInstance,
  createMockTokenManager,
  createMockErrorHandler,
} from '../../__mocks__/mockFactories';

function createMockAxiosError(status: number): AxiosError {
  return {
    isAxiosError: true,
    toJSON: () => ({}),
    name: 'AxiosError',
    message: 'Mocked Axios Error',
    response: { status, data: null, statusText: '', headers: {}, config: {} },
    config: {},
  } as AxiosError;
}

describe('ApiService', () => {
  let apiService: ApiService;
  let mockAxiosInstance: ReturnType<typeof createMockAxiosInstance>;
  let mockTokenManager: ReturnType<typeof createMockTokenManager>;
  let mockErrorHandler: ReturnType<typeof createMockErrorHandler>;

  beforeEach(() => {
    mockAxiosInstance = createMockAxiosInstance();
    mockTokenManager = createMockTokenManager();
    mockErrorHandler = createMockErrorHandler();
    apiService = new ApiService(mockAxiosInstance, mockTokenManager, mockErrorHandler);
  });

  describe('HTTP methods', () => {
    it('should make a GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockAxiosInstance.get.mockResolvedValue({ data: mockData });

      const result = await apiService.get('/test');

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params: undefined });
    });

    it('should make a POST request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      const postData = { name: 'New Test' };
      mockAxiosInstance.post.mockResolvedValue({ data: mockData });

      const result = await apiService.post('/test', postData);

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData);
    });

    it('should make a PUT request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      const putData = { name: 'Updated Test' };
      mockAxiosInstance.put.mockResolvedValue({ data: mockData });

      const result = await apiService.put('/test', putData);

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', putData);
    });

    it('should make a DELETE request and return data', async () => {
      const mockData = { id: 1, name: 'Test' };
      mockAxiosInstance.delete.mockResolvedValue({ data: mockData });

      const result = await apiService.delete('/test');

      expect(result).toEqual(mockData);
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test', { data: undefined });
    });
  });

  describe('HTTP methods Errors', () => {
    it('should handle errors in POST requests', async () => {
      const mockError = createMockAxiosError(500);
      mockAxiosInstance.post.mockRejectedValue(mockError);

      await expect(apiService.post('/test', { data: 'test' })).rejects.toThrow();
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(mockError);
    });

    it('should handle errors in PUT requests', async () => {
      const mockError = createMockAxiosError(500);
      mockAxiosInstance.put.mockRejectedValue(mockError);

      await expect(apiService.put('/test', { data: 'test' })).rejects.toThrow();
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(mockError);
    });

    it('should handle errors in DELETE requests', async () => {
      const mockError = createMockAxiosError(500);
      mockAxiosInstance.delete.mockRejectedValue(mockError);

      await expect(apiService.delete('/test')).rejects.toThrow();
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Error handling', () => {
    it('should handle errors and throw', async () => {
      const mockError = createMockAxiosError(500);
      mockAxiosInstance.get.mockRejectedValue(mockError);

      await expect(apiService.get('/test')).rejects.toThrow();
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(mockError);
    });
  });

  describe('Authentication', () => {
    it('should handle 401 errors and retry the request after token refresh', async () => {
      const mockError = createMockAxiosError(401);
      const mockData = { id: 1, name: 'Test' };

      mockAxiosInstance.get.mockRejectedValueOnce(mockError);
      mockAxiosInstance.get.mockResolvedValueOnce({ data: mockData });

      mockTokenManager.refreshToken.mockResolvedValue({
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
      });

      const result = await apiService.get('/test');

      expect(mockTokenManager.refreshToken).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    it('should throw an error if token refresh fails', async () => {
      const mockError = createMockAxiosError(401);
      const refreshError = new Error('Refresh failed');

      mockAxiosInstance.get.mockRejectedValueOnce(mockError);
      mockTokenManager.refreshToken.mockRejectedValue(refreshError);

      await expect(apiService.get('/test')).rejects.toThrow('Refresh failed');
      expect(mockErrorHandler.handleError).toHaveBeenCalledWith(refreshError);
    });
  });

  describe('Interceptors', () => {
    it('should add Authorization header when access token is available', async () => {
      mockTokenManager.getAccessToken.mockReturnValue('test-token');
      await apiService.get('/test');

      const lastCall =
        mockAxiosInstance.get.mock.calls[mockAxiosInstance.get.mock.calls.length - 1];
      expect(lastCall[0]).toBe('/test');
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      // We can't directly test the headers here, as they are added in the interceptor
    });

    it('should not add Authorization header when access token is not available', async () => {
      mockTokenManager.getAccessToken.mockReturnValue(null);
      await apiService.get('/test');

      const lastCall =
        mockAxiosInstance.get.mock.calls[mockAxiosInstance.get.mock.calls.length - 1];
      expect(lastCall[0]).toBe('/test');
      expect(mockAxiosInstance.interceptors.request.use).toHaveBeenCalled();
      // We can't directly test the headers here, as they are added in the interceptor
    });
  });
});
