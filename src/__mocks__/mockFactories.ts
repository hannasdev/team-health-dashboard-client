// src/__mocks__/mockFactories.ts
import type { AxiosInstance } from 'axios';
import type {
  IAuthenticationService,
  ILoggingService,
  IStorageService,
  IUser,
  IAuthResponse,
} from '../interfaces';

// API and Network Mocks
export const createMockApiClient = (): jest.Mocked<AxiosInstance> =>
  ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
    request: jest.fn(),
  }) as any;

export const createMockApiService = () => ({
  getAxiosInstance: jest.fn(() => createMockApiClient()),
});

// Storage Mocks
export const createMockStorageService = (): jest.Mocked<IStorageService> => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
});

export const createMockLocalStorageService = createMockStorageService;

// Utility Mocks
export const createMockJwtDecode = (): jest.Mock => jest.fn();

export const createMockLoggingService = (): jest.Mocked<ILoggingService> => ({
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
});

// Authentication Mocks
export const createMockAuthenticationService = (
  isLoggedIn: boolean = false
): jest.Mocked<IAuthenticationService> => {
  const mockUser: IUser = { id: '1', email: 'test@example.com', name: 'Test User' };
  const mockAuthResponse: IAuthResponse = {
    user: mockUser,
    accessToken: 'fake-access-token',
    refreshToken: 'fake-refresh-token',
  };

  return {
    login: jest.fn().mockResolvedValue(mockAuthResponse),
    register: jest.fn().mockResolvedValue(mockAuthResponse),
    logout: jest.fn(),
    getCurrentUser: jest.fn().mockResolvedValue(mockUser),
    isLoggedIn: jest.fn().mockReturnValue(isLoggedIn),
    getAccessToken: jest.fn().mockReturnValue(isLoggedIn ? 'fake-access-token' : null),
    refreshToken: jest.fn().mockResolvedValue({
      accessToken: 'new-fake-access-token',
      refreshToken: 'new-fake-refresh-token',
    }),
    setupTokenRefresh: jest.fn(),
    refreshUserActivity: jest.fn(),
  };
};

// Hook Mocks
export const createMockUseAuth = (isLoggedIn: boolean = false, user: IUser | null = null) => {
  const mockAuthService = createMockAuthenticationService(isLoggedIn);

  return jest.fn(() => ({
    isLoggedIn,
    login: jest.fn<Promise<boolean>, [username: string, password: string]>(),
    logout: jest.fn<Promise<void>, []>(),
    register: jest.fn<Promise<boolean>, [email: string, password: string]>(),
    checkLoginStatus: jest.fn<Promise<void>, []>(),
    user,
    authService: mockAuthService,
  }));
};

export const createMockUseGlobalErrorHandler = () => () => ({
  addError: jest.fn(),
  removeError: jest.fn(),
  errors: [],
});

export const createMockUseIdleTimeout = () => () => ({
  isIdle: false,
  resetIdleTimer: jest.fn(),
  logoutUser: jest.fn(),
});
