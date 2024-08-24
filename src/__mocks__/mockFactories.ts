import type { AxiosInstance, HeadersDefaults, AxiosDefaults, AxiosHeaderValue } from 'axios';
import type {
  IAuthenticationService,
  ILoggingService,
  IStorageService,
  IUser,
  IAuthResponse,
  ITokenManager,
  ITokenPayload,
  IApiClient,
  IJwtDecoder,
} from '../interfaces';
import { TokenManager } from '../services/TokenManager';

// API and Network Mocks
export const createMockAxiosInstance = (): jest.Mocked<AxiosInstance> => {
  const mockAxios: jest.Mocked<AxiosInstance> = {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
    patch: jest.fn(),
    request: jest.fn(),
    getUri: jest.fn(),
    head: jest.fn(),
    options: jest.fn(),
    postForm: jest.fn(),
    putForm: jest.fn(),
    patchForm: jest.fn(),
    interceptors: {
      request: {
        use: jest.fn(),
        eject: jest.fn(),
        clear: jest.fn(),
      },
      response: {
        use: jest.fn(),
        eject: jest.fn(),
        clear: jest.fn(),
      },
    },
    defaults: {
      headers: {
        common: { 'Content-Type': 'application/json' },
        delete: {},
        get: {},
        head: {},
        post: {},
        put: {},
        patch: {},
      } as HeadersDefaults & { [key: string]: AxiosHeaderValue },
    } as AxiosDefaults,
  } as unknown as jest.Mocked<AxiosInstance>;

  // Add the call signature
  (mockAxios as any).call = jest.fn();
  (mockAxios as any).apply = jest.fn();

  return mockAxios;
};

export const createMockApiClient = createMockAxiosInstance;

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
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
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
    logout: jest.fn().mockResolvedValue(undefined),
    getCurrentUser: jest.fn().mockResolvedValue(mockUser),
    isLoggedIn: jest.fn().mockReturnValue(isLoggedIn),
  };
};

// Hook Mocks
export const createMockUseAuth = (isLoggedIn: boolean = false, user: IUser | null = null) => {
  const mockAuthService = createMockAuthenticationService(isLoggedIn);

  return jest.fn(() => ({
    isLoggedIn,
    login: jest
      .fn<Promise<boolean>, [username: string, password: string]>()
      .mockResolvedValue(true),
    logout: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
    register: jest
      .fn<Promise<boolean>, [email: string, password: string]>()
      .mockResolvedValue(true),
    checkLoginStatus: jest.fn<Promise<void>, []>().mockResolvedValue(undefined),
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

export const createMockErrorHandler = () => ({
  handleError: jest.fn(),
});

export function createMockTokenManager(
  overrides: Partial<ITokenManager> = {}
): jest.Mocked<TokenManager> {
  const mockStorageService = createMockStorageService();
  const mockApiClient: jest.Mocked<IApiClient> = {
    get: jest.fn().mockResolvedValue({ data: {} }),
    post: jest.fn().mockResolvedValue({ data: {} }),
    put: jest.fn().mockResolvedValue({ data: {} }),
    delete: jest.fn().mockResolvedValue({ data: {} }),
  };
  const mockJwtDecoder: jest.Mocked<IJwtDecoder> = {
    decode: jest.fn().mockReturnValue({ exp: Date.now() / 1000 + 3600 }),
  };

  const mockTokenManager = new TokenManager(
    mockStorageService,
    mockApiClient,
    mockJwtDecoder
  ) as jest.Mocked<TokenManager>;

  // Mock the public methods
  Object.assign(mockTokenManager, {
    getAccessToken: jest.fn().mockReturnValue(null),
    getRefreshToken: jest.fn().mockReturnValue(null),
    refreshToken: jest.fn().mockResolvedValue({} as ITokenPayload),
    setTokens: jest.fn(),
    clearTokens: jest.fn(),
    hasValidAccessToken: jest.fn().mockReturnValue(false),
    ...overrides,
  });

  return mockTokenManager;
}
