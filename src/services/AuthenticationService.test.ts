import { AuthenticationService } from './AuthenticationService';
import type { IAuthResponse, IUser } from '../interfaces';

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let mockApiClient: any;
  let mockStorage: any;

  beforeEach(() => {
    mockApiClient = {
      post: jest.fn(),
      get: jest.fn(),
    };
    mockStorage = {
      getItem: jest.fn(),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    };
    authService = new AuthenticationService(mockApiClient, mockStorage);
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
    // Make sure there's no refreshToken in mockStorage
    mockStorage.removeItem('refreshToken');

    mockApiClient.post = jest.fn(); // No need to provide a return value in this case

    const newToken = await authService.refreshToken();

    // No API call should have been made
    expect(mockApiClient.post).not.toHaveBeenCalled();
    expect(newToken).toBeNull();
  });
});
