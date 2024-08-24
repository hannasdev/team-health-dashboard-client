import type {
  IAuthenticationService,
  IApiClient,
  ITokenManager,
  ILoggingService,
  IAuthResponse,
  IUser,
} from '../../interfaces';
import { AuthenticationError } from './AuthenticationError';

export class AuthenticationService implements IAuthenticationService {
  constructor(
    private readonly apiClient: IApiClient,
    private readonly tokenManager: ITokenManager,
    private readonly logger: ILoggingService
  ) {}

  public async login(email: string, password: string): Promise<IAuthResponse> {
    try {
      const response = await this.apiClient.post<{ data: IAuthResponse }>('/auth/login', {
        email,
        password,
      });
      const { accessToken, refreshToken, user } = response.data;
      this.tokenManager.setTokens(accessToken, refreshToken);
      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error('Login failed', error);
      throw new AuthenticationError('Login failed');
    }
  }

  public async register(email: string, password: string): Promise<IAuthResponse> {
    try {
      const response = await this.apiClient.post<{ data: IAuthResponse }>('/auth/register', {
        email,
        password,
      });
      const { accessToken, refreshToken, user } = response.data;
      this.tokenManager.setTokens(accessToken, refreshToken);
      return { accessToken, refreshToken, user };
    } catch (error) {
      this.logger.error('Registration failed', error);
      throw new AuthenticationError('Registration failed');
    }
  }

  public logout(): void {
    this.tokenManager.clearTokens();
  }

  public async getCurrentUser(): Promise<IUser | null> {
    try {
      const {
        data: { id, email },
      } = await this.apiClient.get<{ data: IUser }>('/auth/me');
      return { id, email };
    } catch {
      return null;
    }
  }

  public isLoggedIn(): boolean {
    return this.tokenManager.hasValidAccessToken();
  }
}
