import { AuthenticationService } from './AuthenticationService';
import { AuthenticationError } from './AuthenticationError';
import type { IAuthenticationService, IAuthResponse, IUser } from '../../interfaces';
import {
  createMockApiClient,
  createMockTokenManager,
  createMockLoggingService,
} from '../../__mocks__/mockFactories';

describe('AuthenticationService', () => {
  let authService: IAuthenticationService;
  let mockApiClient: ReturnType<typeof createMockApiClient>;
  let mockTokenManager: ReturnType<typeof createMockTokenManager>;
  let mockLogger: ReturnType<typeof createMockLoggingService>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    mockTokenManager = createMockTokenManager();
    mockLogger = createMockLoggingService();
    authService = new AuthenticationService(mockApiClient, mockTokenManager, mockLogger);
  });

  describe('login', () => {
    it('should login successfully and store tokens', async () => {
      const mockResponse: IAuthResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        accessToken: 'test-access-token',
        refreshToken: 'test-refresh-token',
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.login('test@example.com', 'password');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse);
      expect(mockTokenManager.setTokens).toHaveBeenCalledWith(
        'test-access-token',
        'test-refresh-token'
      );
    });

    it('should handle login errors', async () => {
      mockApiClient.post.mockRejectedValue(new Error('API error'));

      await expect(authService.login('test@example.com', 'password')).rejects.toThrow(
        AuthenticationError
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Login failed', expect.any(Error));
    });
  });

  describe('register', () => {
    it('should register a new user and store tokens', async () => {
      const mockResponse: IAuthResponse = {
        user: { id: '1', email: 'newuser@example.com', name: 'New User' },
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };
      mockApiClient.post.mockResolvedValue(mockResponse);

      const result = await authService.register('newuser@example.com', 'password');

      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
        email: 'newuser@example.com',
        password: 'password',
      });
      expect(result).toEqual(mockResponse);
      expect(mockTokenManager.setTokens).toHaveBeenCalledWith(
        'new-access-token',
        'new-refresh-token'
      );
    });

    it('should handle registration errors', async () => {
      mockApiClient.post.mockRejectedValue(new Error('API error'));

      await expect(authService.register('test@example.com', 'password')).rejects.toThrow(
        AuthenticationError
      );
      expect(mockLogger.error).toHaveBeenCalledWith('Registration failed', expect.any(Error));
    });
  });

  describe('logout', () => {
    it('should clear tokens', () => {
      authService.logout();

      expect(mockTokenManager.clearTokens).toHaveBeenCalled();
    });
  });

  describe('getCurrentUser', () => {
    it('should get the current user', async () => {
      const mockUser: IUser = { id: '1', name: 'Test User', email: 'test@example.com' };
      mockApiClient.get.mockResolvedValue(mockUser);

      const result = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });

    it('should return null when getting the current user fails', async () => {
      mockApiClient.get.mockRejectedValue(new Error('API error'));

      const user = await authService.getCurrentUser();

      expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
      expect(user).toBeNull();
    });
  });

  describe('isLoggedIn', () => {
    it('should return true when there is a valid access token', () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(true);

      expect(authService.isLoggedIn()).toBe(true);
    });

    it('should return false when there is no valid access token', () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(false);

      expect(authService.isLoggedIn()).toBe(false);
    });
  });
});
