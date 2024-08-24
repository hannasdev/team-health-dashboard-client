import { TokenManager } from './TokenManager';
import type { ITokenPayload } from '../../interfaces';
import {
  createMockStorageService,
  createMockApiClient,
  createMockJwtDecode,
} from '../../__mocks__/mockFactories';

describe('TokenManager', () => {
  let tokenManager: TokenManager;
  let mockStorageService: ReturnType<typeof createMockStorageService>;
  let mockApiClient: ReturnType<typeof createMockApiClient>;
  let mockJwtDecoder: ReturnType<typeof createMockJwtDecode>;

  beforeEach(() => {
    jest.useFakeTimers();

    mockStorageService = createMockStorageService();
    mockApiClient = createMockApiClient();
    mockJwtDecoder = createMockJwtDecode();

    tokenManager = new TokenManager(mockStorageService, mockApiClient, { decode: mockJwtDecoder });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getAccessToken', () => {
    it('should return the access token from storage', () => {
      mockStorageService.getItem.mockReturnValue('test-access-token');
      expect(tokenManager.getAccessToken()).toBe('test-access-token');
      expect(mockStorageService.getItem).toHaveBeenCalledWith('accessToken');
    });
  });

  describe('getRefreshToken', () => {
    it('should return the refresh token from storage', () => {
      mockStorageService.getItem.mockReturnValue('test-refresh-token');
      expect(tokenManager.getRefreshToken()).toBe('test-refresh-token');
      expect(mockStorageService.getItem).toHaveBeenCalledWith('refreshToken');
    });
  });

  describe('refreshToken', () => {
    it('should refresh the token successfully', async () => {
      const mockTokenPayload: ITokenPayload = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockStorageService.getItem.mockReturnValue('old-refresh-token');
      mockApiClient.post.mockResolvedValue({ data: mockTokenPayload });

      const result = await tokenManager.refreshToken();

      expect(result).toEqual(mockTokenPayload);
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
        refreshToken: 'old-refresh-token',
      });
      expect(mockStorageService.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(mockStorageService.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
    });

    it('should throw an error if no refresh token is available', async () => {
      mockStorageService.getItem.mockReturnValue(null);

      await expect(tokenManager.refreshToken()).rejects.toThrow('No refresh token available');
    });
  });

  describe('setTokens', () => {
    it('should set access and refresh tokens in storage', () => {
      const scheduleTokenRefreshSpy = jest.spyOn(tokenManager as any, 'scheduleTokenRefresh');
      mockJwtDecoder.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

      tokenManager.setTokens('new-access-token', 'new-refresh-token');

      expect(mockStorageService.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(mockStorageService.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      expect(scheduleTokenRefreshSpy).toHaveBeenCalled();

      scheduleTokenRefreshSpy.mockRestore();
    });
  });

  describe('clearTokens', () => {
    it('should remove access and refresh tokens from storage', () => {
      tokenManager.clearTokens();

      expect(mockStorageService.removeItem).toHaveBeenCalledWith('accessToken');
      expect(mockStorageService.removeItem).toHaveBeenCalledWith('refreshToken');
    });

    it('should cancel token refresh', () => {
      const cancelTokenRefreshSpy = jest.spyOn(tokenManager as any, 'cancelTokenRefresh');

      tokenManager.clearTokens();

      expect(cancelTokenRefreshSpy).toHaveBeenCalled();
      cancelTokenRefreshSpy.mockRestore();
    });
  });

  describe('hasValidAccessToken', () => {
    it('should return true for a valid non-expired token', () => {
      mockStorageService.getItem.mockReturnValue('valid-token');
      mockJwtDecoder.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

      expect(tokenManager.hasValidAccessToken()).toBe(true);
    });

    it('should return false for an expired token', () => {
      mockStorageService.getItem.mockReturnValue('expired-token');
      mockJwtDecoder.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 3600 });

      expect(tokenManager.hasValidAccessToken()).toBe(false);
    });

    it('should return false when no token is present', () => {
      mockStorageService.getItem.mockReturnValue(null);

      expect(tokenManager.hasValidAccessToken()).toBe(false);
    });
  });

  describe('private methods', () => {
    describe('isTokenExpired', () => {
      it('should return true for an expired token', () => {
        mockJwtDecoder.mockReturnValue({ exp: Math.floor(Date.now() / 1000) - 3600 });

        expect((tokenManager as any).isTokenExpired('expired-token')).toBe(true);
      });

      it('should return false for a non-expired token', () => {
        mockJwtDecoder.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

        expect((tokenManager as any).isTokenExpired('valid-token')).toBe(false);
      });

      it('should return true if token decoding fails', () => {
        mockJwtDecoder.mockImplementation(() => {
          throw new Error('Invalid token');
        });

        expect((tokenManager as any).isTokenExpired('invalid-token')).toBe(true);
      });
    });

    it('should set access and refresh tokens in storage', () => {
      const scheduleTokenRefreshSpy = jest.spyOn(tokenManager as any, 'scheduleTokenRefresh');
      mockJwtDecoder.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

      tokenManager.setTokens('new-access-token', 'new-refresh-token');

      expect(mockStorageService.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
      expect(mockStorageService.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
      expect(scheduleTokenRefreshSpy).toHaveBeenCalled();

      scheduleTokenRefreshSpy.mockRestore();
    });

    describe('setupTokenRefresh', () => {
      it('should schedule token refresh if there is a valid access token', () => {
        const scheduleTokenRefreshSpy = jest.spyOn(tokenManager as any, 'scheduleTokenRefresh');
        mockStorageService.getItem.mockReturnValue('valid-token');
        mockJwtDecoder.mockReturnValue({ exp: Math.floor(Date.now() / 1000) + 3600 });

        (tokenManager as any).setupTokenRefresh();

        expect(scheduleTokenRefreshSpy).toHaveBeenCalled();
      });

      it('should not schedule token refresh if there is no valid access token', () => {
        const scheduleTokenRefreshSpy = jest.spyOn(tokenManager as any, 'scheduleTokenRefresh');
        mockStorageService.getItem.mockReturnValue(null);

        (tokenManager as any).setupTokenRefresh();

        expect(scheduleTokenRefreshSpy).not.toHaveBeenCalled();
      });
    });
  });
});
