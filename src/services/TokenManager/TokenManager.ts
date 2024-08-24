import type {
  ITokenManager,
  ITokenPayload,
  IStorageService,
  IApiClient,
  IJwtDecoder,
} from '../../interfaces';
import type { JwtPayload } from 'jwt-decode';

export class TokenManager implements ITokenManager {
  private refreshTokenTimeoutId: NodeJS.Timeout | null = null;

  constructor(
    private readonly storageService: IStorageService,
    private readonly apiClient: IApiClient,
    private readonly jwtDecoder: IJwtDecoder
  ) {
    this.setupTokenRefresh();
  }

  public getAccessToken(): string | null {
    return this.storageService.getItem('accessToken');
  }

  public getRefreshToken(): string | null {
    return this.storageService.getItem('refreshToken');
  }

  public async refreshToken(): Promise<ITokenPayload> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.apiClient.post<{ data: ITokenPayload }>('/auth/refresh', {
      refreshToken,
    });
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (response && response.data) {
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      return response.data;
    }
    throw new Error('Invalid response from refresh token endpoint');
  }

  public setTokens(accessToken: string, refreshToken: string): void {
    this.storageService.setItem('accessToken', accessToken);
    this.storageService.setItem('refreshToken', refreshToken);
    this.scheduleTokenRefresh();
  }

  public clearTokens(): void {
    this.storageService.removeItem('accessToken');
    this.storageService.removeItem('refreshToken');
    this.cancelTokenRefresh();
  }

  public hasValidAccessToken(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = this.jwtDecoder.decode(token);
      return (decoded as JwtPayload).exp < Date.now() / 1000;
    } catch {
      return true;
    }
  }

  private scheduleTokenRefresh(): void {
    this.cancelTokenRefresh();
    const accessToken = this.getAccessToken();
    if (!accessToken) return;

    try {
      const decoded = this.jwtDecoder.decode(accessToken);
      if (typeof decoded.exp === 'number') {
        const expiresIn = decoded.exp - Date.now() / 1000;
        const refreshTime = Math.max(expiresIn - 60, 0) * 1000;

        this.refreshTokenTimeoutId = setTimeout(() => this.refreshToken(), refreshTime);
      } else {
        console.error('Invalid token payload');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }

  private cancelTokenRefresh(): void {
    if (this.refreshTokenTimeoutId) {
      clearTimeout(this.refreshTokenTimeoutId);
      this.refreshTokenTimeoutId = null;
    }
  }

  private setupTokenRefresh(): void {
    if (this.hasValidAccessToken()) {
      this.scheduleTokenRefresh();
    }
  }
}
