import { AxiosInstance } from 'axios';
import { AuthenticationService } from './AuthenticationService';
import type { IAuthResponse, IUser, IStorageService } from '../interfaces';

// Mock IStorageService to control storage behavior in tests
class MockStorageService implements IStorageService {
  private storage: { [key: string]: string } = {};

  getItem(key: string): string | null {
    return this.storage[key] || null;
  }

  setItem(key: string, value: string): void {
    this.storage[key] = value;
  }

  removeItem(key: string): void {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete this.storage[key];
  }
}

describe('AuthenticationService', () => {
  let authService: AuthenticationService;
  let mockApiClient: AxiosInstance;
  let mockStorage: MockStorageService;

  beforeEach(() => {
    // Create mock instances before each test
    mockApiClient = {} as AxiosInstance; // You don't need to mock all of AxiosInstance
    mockStorage = new MockStorageService();
    authService = new AuthenticationService(mockApiClient, mockStorage);
  });

  it('should login successfully and store tokens', async () => {
    const mockUser: IUser = { id: '1', name: 'Test User', email: 'test@example.com' };
    const mockResponse: IAuthResponse = {
      user: mockUser,
      token: 'test-token',
      refreshToken: 'test-refresh-token',
    };

    // Mock the API response
    mockApiClient.post = jest.fn().mockResolvedValue({ data: mockResponse });

    // Call the login function
    try {
      const authResponse = await authService.login('test@example.com', 'password');

      // Assertions
      expect(mockApiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password',
      });
      expect(authResponse).toEqual(mockResponse);
      expect(mockStorage.getItem('token')).toBe('test-token');
      expect(mockStorage.getItem('refreshToken')).toBe('test-refresh-token');
    } catch (error) {
      throw Error(error);
    }
  });

  it('should register a new user and store tokens', async () => {
    const mockUser: IUser = { id: '1', name: 'New User', email: 'newuser@example.com' };
    const mockResponse: IAuthResponse = {
      user: mockUser,
      token: 'new-token',
      refreshToken: 'new-refresh-token',
    };

    mockApiClient.post = jest.fn().mockResolvedValue({ data: mockResponse });

    const authResponse = await authService.register('New User', 'newuser@example.com', 'password');

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/register', {
      name: 'New User',
      email: 'newuser@example.com',
      password: 'password',
    });
    expect(authResponse).toEqual(mockResponse);
    expect(mockStorage.getItem('token')).toBe('new-token');
    expect(mockStorage.getItem('refreshToken')).toBe('new-refresh-token');
  });

  it('should log out and remove tokens from storage', () => {
    // Set up: Store mock tokens in the mock storage
    mockStorage.setItem('token', 'test-token');
    mockStorage.setItem('refreshToken', 'test-refresh-token');

    // Call the logout method
    authService.logout();

    // Assertions
    expect(mockStorage.getItem('token')).toBeNull();
    expect(mockStorage.getItem('refreshToken')).toBeNull();
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
    mockStorage.setItem('refreshToken', 'test-refresh-token');
    const mockResponse = { token: 'new-access-token' };
    mockApiClient.post = jest.fn().mockResolvedValue({ data: mockResponse });

    const newToken = await authService.refreshToken();

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'test-refresh-token',
    });
    expect(mockStorage.getItem('token')).toBe('new-access-token');
    expect(newToken).toBe('new-access-token');
  });

  it('should handle errors during token refresh and log the user out', async () => {
    mockStorage.setItem('refreshToken', 'test-refresh-token');
    mockApiClient.post = jest.fn().mockRejectedValue(new Error('Refresh error'));

    const newToken = await authService.refreshToken();

    expect(mockApiClient.post).toHaveBeenCalledWith('/auth/refresh', {
      refreshToken: 'test-refresh-token',
    });
    expect(mockStorage.getItem('token')).toBeNull(); // Check if logged out
    expect(mockStorage.getItem('refreshToken')).toBeNull(); // Check if logged out
    expect(newToken).toBeNull();
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
