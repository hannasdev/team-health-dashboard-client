import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as useServicesModule from '../useServices';
import {
  createMockApiService,
  createMockLocalStorageService,
  createMockAuthenticationService,
  createMockTokenManager,
} from '../../__mocks__/mockFactories';
import { AuthenticationService } from '../../services/AuthenticationService';
import { TokenManager } from '../../services/TokenManager';

jest.mock('./useServices', () => ({
  useServices: jest.fn(),
}));

jest.mock('../services/AuthenticationService');
jest.mock('../services/LoggingService');
jest.mock('../services/TokenManager');

describe('useAuth', () => {
  let mockAuthService: jest.Mocked<AuthenticationService>;
  let mockTokenManager: jest.Mocked<TokenManager>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockAuthService = createMockAuthenticationService() as jest.Mocked<AuthenticationService>;
    mockTokenManager = createMockTokenManager();

    (AuthenticationService as jest.MockedClass<typeof AuthenticationService>).mockImplementation(
      () => mockAuthService
    );
    (TokenManager as jest.MockedClass<typeof TokenManager>).mockImplementation(
      () => mockTokenManager
    );
    (useServicesModule.useServices as jest.Mock).mockReturnValue({
      apiService: createMockApiService(),
      localStorageService: createMockLocalStorageService(),
      authService: mockAuthService,
      tokenManager: mockTokenManager,
    });

    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should return isLoggedIn as false initially', async () => {
    mockTokenManager.hasValidAccessToken.mockReturnValue(false);
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  it('should set isLoggedIn to true after successful login', async () => {
    mockTokenManager.hasValidAccessToken.mockReturnValue(false);
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoggedIn).toBe(false);

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'password');
      expect(loginResult).toBe(true);
    });

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should handle login failure', async () => {
    const loginError = new Error('Login failed');
    mockAuthService.login.mockRejectedValue(loginError);
    mockTokenManager.hasValidAccessToken.mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.login('test@example.com', 'wrongpassword')).rejects.toThrow(
        'Login failed'
      );
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Login failed:', loginError);
  });

  it('should handle successful registration', async () => {
    mockTokenManager.hasValidAccessToken.mockReturnValue(true);
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const registerResult = await result.current.register('test@example.com', 'password');
      expect(registerResult).toBe(true);
    });

    expect(mockAuthService.register).toHaveBeenCalledWith('test@example.com', 'password');
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('should handle registration failure', async () => {
    const registerError = new Error('Registration failed');
    mockAuthService.register.mockRejectedValue(registerError);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await expect(result.current.register('test@example.com', 'password')).rejects.toThrow(
        'Registration failed'
      );
    });

    expect(mockAuthService.register).toHaveBeenCalledWith('test@example.com', 'password');
    expect(consoleErrorSpy).toHaveBeenCalledWith('Registration failed:', registerError);
  });

  it('should set isLoggedIn to false after logout', async () => {
    mockTokenManager.hasValidAccessToken.mockReturnValue(true);
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  it('should check login status on mount', () => {
    mockTokenManager.hasValidAccessToken.mockReturnValue(true);
    renderHook(() => useAuth());

    expect(mockTokenManager.hasValidAccessToken).toHaveBeenCalled();
  });

  it('should update login status when storage changes', async () => {
    mockTokenManager.hasValidAccessToken.mockReturnValue(false);
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoggedIn).toBe(false);

    mockTokenManager.hasValidAccessToken.mockReturnValue(true);

    act(() => {
      window.dispatchEvent(new Event('storage'));
    });

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });
  });
});
