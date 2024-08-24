import { HttpClient } from './HttpClient';
import { createMockApiClient, createMockTokenManager } from '../../__mocks__/mockFactories';

describe('HttpClient', () => {
  let httpClient: HttpClient;
  let mockApiClient: ReturnType<typeof createMockApiClient>;
  let mockTokenManager: ReturnType<typeof createMockTokenManager>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    mockTokenManager = createMockTokenManager();

    httpClient = new HttpClient(mockApiClient, mockTokenManager);
  });

  describe('get method', () => {
    it('should call apiService.get with valid token', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(true);
      mockApiClient.get.mockResolvedValue({ data: 'test' });

      const result = await httpClient.get<{ data: string }>('/test');

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).not.toHaveBeenCalled();
      expect(mockApiClient.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual({ data: 'test' });
    });

    it('should refresh token if invalid before calling apiService.get', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(false);
      mockTokenManager.refreshToken.mockResolvedValue({} as any);
      mockApiClient.get.mockResolvedValue({ data: 'test' });

      const result = await httpClient.get<{ data: string }>('/test', { param: 'value' });

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).toHaveBeenCalled();
      expect(mockApiClient.get).toHaveBeenCalledWith('/test', { param: 'value' });
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('post method', () => {
    it('should call apiService.post with valid token', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(true);
      mockApiClient.post.mockResolvedValue({ data: 'test' });

      const result = await httpClient.post<{ data: string }>('/test', { body: 'data' });

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).not.toHaveBeenCalled();
      expect(mockApiClient.post).toHaveBeenCalledWith('/test', { body: 'data' });
      expect(result).toEqual({ data: 'test' });
    });

    it('should refresh token if invalid before calling apiService.post', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(false);
      mockTokenManager.refreshToken.mockResolvedValue({} as any);
      mockApiClient.post.mockResolvedValue({ data: 'test' });

      const result = await httpClient.post<{ data: string }>('/test');

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).toHaveBeenCalled();
      expect(mockApiClient.post).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('put method', () => {
    it('should call apiService.put with valid token', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(true);
      mockApiClient.put.mockResolvedValue({ data: 'test' });

      const result = await httpClient.put<{ data: string }>('/test', { body: 'data' });

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).not.toHaveBeenCalled();
      expect(mockApiClient.put).toHaveBeenCalledWith('/test', { body: 'data' });
      expect(result).toEqual({ data: 'test' });
    });

    it('should refresh token if invalid before calling apiService.put', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(false);
      mockTokenManager.refreshToken.mockResolvedValue({} as any);
      mockApiClient.put.mockResolvedValue({ data: 'test' });

      const result = await httpClient.put<{ data: string }>('/test');

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).toHaveBeenCalled();
      expect(mockApiClient.put).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual({ data: 'test' });
    });
  });

  describe('delete method', () => {
    it('should call apiService.delete with valid token', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(true);
      mockApiClient.delete.mockResolvedValue({ data: 'test' });

      const result = await httpClient.delete<{ data: string }>('/test');

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).not.toHaveBeenCalled();
      expect(mockApiClient.delete).toHaveBeenCalledWith('/test');
      expect(result).toEqual({ data: 'test' });
    });

    it('should refresh token if invalid before calling apiService.delete', async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(false);
      mockTokenManager.refreshToken.mockResolvedValue({} as any);
      mockApiClient.delete.mockResolvedValue({ data: 'test' });

      const result = await httpClient.delete<{ data: string }>('/test');

      expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
      expect(mockTokenManager.refreshToken).toHaveBeenCalled();
      expect(mockApiClient.delete).toHaveBeenCalledWith('/test');
      expect(result).toEqual({ data: 'test' });
    });
  });
});
