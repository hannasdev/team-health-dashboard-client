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
    const { user, accessToken, refreshToken } = response.data;
    this.storageService.setItem('accessToken', accessToken);
    this.storageService.setItem('refreshToken', refreshToken);
    return { user, accessToken, refreshToken };
  }

  public async register(email: string, password: string): Promise<IAuthResponse> {
    const response = await this.apiClient.post<IAuthResponse>('/auth/register', {
      email,
      password,
    });
    const { user, accessToken, refreshToken } = response.data;
    this.storageService.setItem('accessToken', accessToken);
    this.storageService.setItem('refreshToken', refreshToken);
    return { user, accessToken, refreshToken };
  }

  public logout(): void {
    this.storageService.removeItem('accessToken');
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

  public async refreshToken(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const currentRefreshToken = this.storageService.getItem('refreshToken');
    if (!currentRefreshToken) return null;

    try {
      const response = await this.apiClient.post<{ accessToken: string; refreshToken: string }>(
        '/auth/refresh',
        { refreshToken: currentRefreshToken }
      );
      const { accessToken, refreshToken } = response.data;
      this.storageService.setItem('accessToken', accessToken);
      this.storageService.setItem('refreshToken', refreshToken);
      return { accessToken, refreshToken };
    } catch (error) {
      this.logout();
      return null;
    }
  }
}
