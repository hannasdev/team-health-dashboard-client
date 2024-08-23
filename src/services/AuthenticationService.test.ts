import { AuthenticationService } from './AuthenticationService';
import type { IAuthenticationService, IAuthResponse, IUser } from '../interfaces';
import {
  createMockApiClient,
  createMockStorageService,
  createMockJwtDecode,
  createMockLoggingService,
} from '../__mocks__/mockFactories';

describe('AuthenticationService', () => {
  let authService: IAuthenticationService;
  let mockApiClient: ReturnType<typeof createMockApiClient>;
  let mockStorage: ReturnType<typeof createMockStorageService>;
  let mockJwtDecode: ReturnType<typeof createMockJwtDecode>;
  let mockLogger: ReturnType<typeof createMockLoggingService>;

  beforeEach(() => {
    mockApiClient = createMockApiClient();
    mockStorage = createMockStorageService();
    mockJwtDecode = createMockJwtDecode();
    mockLogger = createMockLoggingService();
    authService = new AuthenticationService(mockApiClient, mockStorage, mockJwtDecode, mockLogger);
  });

  it('should login successfully and store tokens', async () => {
    const mockUser: IUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    const mockResponse: IAuthResponse = {
      user: mockUser,
      accessToken: 'test-access-token',
      refreshToken: 'test-refresh-token',
    };

    mockApiClient.post.mockResolvedValue({ data: mockResponse });

    const authResponse = await authService.login('test@example.com', 'password');

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
      email: 'test@example.com',
      password: 'password',
    });
    expect(authResponse).toEqual(mockResponse);
    expect(mockStorage.setItem).toHaveBeenCalledWith('accessToken', 'test-access-token');
    expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', 'test-refresh-token');
  });

  it('should register a new user and store tokens', async () => {
    const mockUser: IUser = { id: '1', email: 'newuser@example.com', name: 'New User' };
    const mockResponse: IAuthResponse = {
      user: mockUser,
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    };

    mockApiClient.post.mockResolvedValue({ data: mockResponse });

    const authResponse = await authService.register('newuser@example.com', 'password');

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
      email: 'newuser@example.com',
      password: 'password',
    });
    expect(authResponse).toEqual(mockResponse);
    expect(mockStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
    expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
  });

  it('should log out and remove tokens from storage', () => {
    authService.logout();

    // Assertions
    expect(mockStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });

  it('should get the current user', async () => {
    const mockUser: IUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    mockApiClient.get = jest.fn().mockResolvedValue({ data: mockUser });

    const user = await authService.getCurrentUser();

    expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(user).toEqual(mockUser);
  });

  it('should handle errors when getting the current user', async () => {
    mockApiClient.get = jest.fn().mockRejectedValue(new Error('API error'));

    const user = await authService.getCurrentUser();

    expect(mockApiClient.get).toHaveBeenCalledWith('/auth/me');
    expect(user).toBeNull(); // Expect null if there's an error
  });

  it('should refresh the token', async () => {
    mockStorage.getItem.mockReturnValue('test-refresh-token');
    mockApiClient.post.mockResolvedValue({
      data: {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      },
    });

    const result = await authService.refreshToken();

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'test-refresh-token',
    });
    expect(mockStorage.setItem).toHaveBeenCalledWith('accessToken', 'new-access-token');
    expect(mockStorage.setItem).toHaveBeenCalledWith('refreshToken', 'new-refresh-token');
    expect(result).toEqual({
      accessToken: 'new-access-token',
      refreshToken: 'new-refresh-token',
    });
  });

  it('should handle errors during token refresh and log the user out', async () => {
    mockStorage.getItem.mockReturnValue('test-refresh-token');
    mockApiClient.post.mockRejectedValue(new Error('Refresh error'));

    const result = await authService.refreshToken();

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'test-refresh-token',
    });
    expect(mockStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(result).toBeNull();
  });

  it('should return null if refreshToken is not available in storage', async () => {
    mockStorage.getItem.mockReturnValue(null); // Simulate no refresh token

    const result = await authService.refreshToken();

    expect(mockApiClient.post).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });

  it('should correctly determine if a token is expired', () => {
    const mockToken = 'mock.jwt.token';
    const futureTime = Math.floor(Date.now() / 1000) + 3600; // 1 hour in the future
    mockJwtDecode.mockReturnValue({ exp: futureTime });

    expect(authService['isTokenExpired'](mockToken)).toBe(false);

    const pastTime = Math.floor(Date.now() / 1000) - 3600; // 1 hour in the past
    mockJwtDecode.mockReturnValue({ exp: pastTime });

    expect(authService['isTokenExpired'](mockToken)).toBe(true);
  });

  it('should handle jwt decode errors', () => {
    const mockToken = 'invalid.token';
    mockJwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    expect(authService['isTokenExpired'](mockToken)).toBe(true);
  });

  it('should log error when token refresh fails', async () => {
    mockStorage.getItem.mockReturnValue('test-refresh-token');
    mockApiClient.post.mockRejectedValue(new Error('Refresh error'));

    const result = await authService.refreshToken();

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'test-refresh-token',
    });
    expect(mockLogger.error).toHaveBeenCalledWith('Token refresh failed:', expect.any(Error));
    expect(mockStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('refreshToken');
    expect(result).toBeNull();
  });

  it('should log error when token decoding fails during refresh scheduling', () => {
    mockStorage.getItem.mockReturnValue('invalid-token');
    mockJwtDecode.mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authService['scheduleTokenRefresh']();

    expect(mockLogger.error).toHaveBeenCalledWith('Error decoding token:', expect.any(Error));
    expect(mockStorage.removeItem).toHaveBeenCalledWith('accessToken');
    expect(mockStorage.removeItem).toHaveBeenCalledWith('refreshToken');
  });
});
