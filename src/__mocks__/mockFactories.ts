// src/__mocks__/mockFactories.ts
import type { AxiosInstance } from 'axios';
import type {
  IAuthenticationService,
  ILoggingService,
  IStorageService,
  IUser,
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
): jest.Mocked<IAuthenticationService> => ({
  login: jest.fn(),
  register: jest.fn(),
  logout: jest.fn(),
  getCurrentUser: jest.fn(),
  isLoggedIn: jest.fn().mockReturnValue(isLoggedIn),
  getAccessToken: jest.fn(),
  refreshToken: jest.fn(),
  setupTokenRefresh: jest.fn(),
  refreshUserActivity: jest.fn(),
});

// Hook Mocks
export const createMockUseAuth = (isLoggedIn: boolean = false, user: IUser | null = null) => {
  const mockAuthService = createMockAuthenticationService(isLoggedIn);

  return () => ({
    isLoggedIn,
    login: jest.fn(),
    logout: jest.fn(),
    register: jest.fn(),
    checkLoginStatus: jest.fn(),
    user,
    authService: mockAuthService,
  });
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
