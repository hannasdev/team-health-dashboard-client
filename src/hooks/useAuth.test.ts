// src/hooks/useAuth.test.ts
// src/hooks/useAuth.test.ts
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';
import * as useServicesModule from './useServices';
import type { IUser } from '../interfaces';
import {
  createMockApiService,
  createMockLocalStorageService,
  createMockAuthenticationService,
  createMockLoggingService,
  createMockTokenManager,
} from '../__mocks__/mockFactories';
import { AuthenticationService } from '../services/AuthenticationService/AuthenticationService';
import * as LoggingServiceModule from '../services/LoggingService/LoggingService';
import { TokenManager } from '../services/TokenManager/TokenManager';

jest.mock('./useServices', () => ({
  useServices: jest.fn(),
}));

jest.mock('../services/AuthenticationService');
jest.mock('../services/LoggingService');
jest.mock('../services/TokenManager');

describe('useAuth', () => {
  let mockAuthService: jest.Mocked<AuthenticationService>;
  let mockTokenManager: jest.Mocked<TokenManager>;
  let mockUser: IUser;
  let mockLoggingService: ReturnType<typeof createMockLoggingService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };
    mockAuthService = createMockAuthenticationService() as jest.Mocked<AuthenticationService>;
    mockTokenManager = createMockTokenManager();
    mockLoggingService = createMockLoggingService();

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

    // Replace the LoggingService with our mock
    Object.assign(LoggingServiceModule.LoggingService, mockLoggingService);

    // eslint-disable-next-line @typescript-eslint/require-await
    mockAuthService.login.mockImplementation(async () => {
      mockTokenManager.hasValidAccessToken.mockReturnValue(true);
      return {
        user: mockUser,
        accessToken: 'fake-access-token',
        refreshToken: 'fake-refresh-token',
      };
    });
  });

  it('should return isLoggedIn as false initially', async () => {
    mockTokenManager.hasValidAccessToken.mockReturnValue(false);
    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(false);
    });
  });

  it('should set isLoggedIn to true after successful login', async () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isLoggedIn).toBe(false);

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    await waitFor(() => {
      expect(result.current.isLoggedIn).toBe(true);
    });

    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password');
  });

  it('should handle login failure', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Login failed'));
    mockTokenManager.hasValidAccessToken.mockReturnValue(false);

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      const loginResult = await result.current.login('test@example.com', 'wrongpassword');
      expect(loginResult).toBe(false);
    });

    expect(result.current.isLoggedIn).toBe(false);
    expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
  });

  it('should log error when login fails', async () => {
    mockAuthService.login.mockRejectedValue(new Error('Login failed'));

    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login('test@example.com', 'wrong-password');
    });

    expect(mockLoggingService.error).toHaveBeenCalledWith('Login failed:', expect.any(Error));
    expect(result.current.isLoggedIn).toBe(false);
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
