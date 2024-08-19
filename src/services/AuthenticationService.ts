import type { AxiosInstance, AxiosResponse } from 'axios';
import type { IAuthResponse, IUser, IStorageService, IAuthenticationService } from '../interfaces';

export class AuthenticationService implements IAuthenticationService {
  private readonly apiClient: AxiosInstance;
  private readonly storageService: IStorageService;

  constructor(apiClient: AxiosInstance, storageService: IStorageService) {
    this.apiClient = apiClient;
    this.storageService = storageService;
  }

  public async login(email: string, password: string): Promise<IAuthResponse> {
    const response: AxiosResponse<IAuthResponse> = await this.apiClient.post('/auth/login', {
      email,
      password,
    });
    const { user, token, refreshToken } = response.data;
    this.storageService.setItem('token', token);
    this.storageService.setItem('refreshToken', refreshToken);
    return { user, token, refreshToken };
  }

  public async register(name: string, email: string, password: string): Promise<IAuthResponse> {
    const response: AxiosResponse<IAuthResponse> = await this.apiClient.post('/auth/register', {
      name,
      email,
      password,
    });
    const { user, token, refreshToken } = response.data;
    this.storageService.setItem('token', token);
    this.storageService.setItem('refreshToken', refreshToken);
    return { user, token, refreshToken };
  }

  public logout(): void {
    this.storageService.removeItem('token');
    this.storageService.removeItem('refreshToken');
  }

  public async getCurrentUser(): Promise<IUser | null> {
    try {
      const response: AxiosResponse<IUser> = await this.apiClient.get('/auth/me');
      return response.data;
    } catch {
      return null;
    }
  }

  public async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = this.storageService.getItem('refreshToken');
      if (!refreshToken) return null;

      const response: AxiosResponse<{ token: string }> = await this.apiClient.post(
        '/auth/refresh',
        {
          refreshToken,
        }
      );
      const { token } = response.data;
      this.storageService.setItem('token', token);
      return token;
    } catch {
      this.logout();
      return null;
    }
  }
}
