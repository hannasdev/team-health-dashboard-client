import type { AxiosInstance, AxiosResponse } from 'axios';
import type {
  IAuthResponse,
  IUser,
  IStorageService,
  IAuthenticationService,
  ILoggingService,
} from '../interfaces';

interface DecodedToken {
  exp: number;
  // Add other properties from your JWT as needed
}

type JwtDecodeFunction = (token: string) => DecodedToken;

export class AuthenticationService implements IAuthenticationService {
  private readonly apiClient: AxiosInstance;
  private readonly storageService: IStorageService;
  private readonly jwtDecode: JwtDecodeFunction;
  private readonly logger: ILoggingService;
  private refreshTokenTimeoutId: NodeJS.Timeout | null = null;

  constructor(
    apiClient: AxiosInstance,
    storageService: IStorageService,
    jwtDecode: JwtDecodeFunction,
    logger: ILoggingService
  ) {
    this.apiClient = apiClient;
    this.storageService = storageService;
    this.jwtDecode = jwtDecode;
    this.logger = logger;
  }

  public async login(email: string, password: string): Promise<IAuthResponse> {
    const response: AxiosResponse<IAuthResponse> = await this.apiClient.post('/auth/login', {
      email,
      password,
    });
    const { user, accessToken, refreshToken } = response.data;
    this.setTokens(accessToken, refreshToken);
    this.scheduleTokenRefresh();
    return { user, accessToken, refreshToken };
  }

  public async register(email: string, password: string): Promise<IAuthResponse> {
    const response = await this.apiClient.post<IAuthResponse>('/auth/register', {
      email,
      password,
    });
    const { user, accessToken, refreshToken } = response.data;
    this.setTokens(accessToken, refreshToken);
    this.scheduleTokenRefresh();
    return { user, accessToken, refreshToken };
  }

  public logout(): void {
    this.storageService.removeItem('accessToken');
    this.storageService.removeItem('refreshToken');
    this.cancelTokenRefresh();
  }

  public async getCurrentUser(): Promise<IUser | null> {
    try {
      const response: AxiosResponse<IUser> = await this.apiClient.get('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    const accessToken = this.storageService.getItem('accessToken');
    return !!accessToken && !this.isTokenExpired(accessToken);
  }

  public getAccessToken(): string | null {
    return this.storageService.getItem('accessToken');
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    this.storageService.setItem('accessToken', accessToken);
    this.storageService.setItem('refreshToken', refreshToken);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.jwtDecode(token);
      return decoded.exp < Date.now() / 1000;
    } catch (error) {
      return true;
    }
  }

  public async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    try {
      const refreshToken = this.storageService.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken }
      );
      const { accessToken, refreshToken: newRefreshToken } = response.data;
      this.setTokens(accessToken, newRefreshToken);
      this.scheduleTokenRefresh();
      return { accessToken, refreshToken: newRefreshToken };
    } catch (error) {
      this.logger.error('Token refresh failed:', error);
      this.logout();
      return null;
    }
  }

  private scheduleTokenRefresh(): void {
    this.cancelTokenRefresh();

    const accessToken = this.getAccessToken();
    if (!accessToken) return;

    try {
      const decoded = this.jwtDecode(accessToken);
      const expiresIn = decoded.exp - Date.now() / 1000;
      const refreshTime = Math.max(expiresIn - 60, 0);

      this.refreshTokenTimeoutId = setTimeout(() => this.refreshToken(), refreshTime * 1000);
    } catch (error) {
      this.logger.error('Error decoding token:', error);
      this.logout();
    }
  }

  private cancelTokenRefresh(): void {
    if (this.refreshTokenTimeoutId) {
      clearTimeout(this.refreshTokenTimeoutId);
      this.refreshTokenTimeoutId = null;
    }
  }

  public setupTokenRefresh(): void {
    if (this.isLoggedIn()) {
      this.scheduleTokenRefresh();
    }
  }

  public refreshUserActivity(): void {
    if (this.isLoggedIn()) {
      this.cancelTokenRefresh();
      this.scheduleTokenRefresh();
    }
  }
}
